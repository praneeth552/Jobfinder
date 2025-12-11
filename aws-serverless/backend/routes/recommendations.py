from fastapi import APIRouter, HTTPException, Depends, Request, BackgroundTasks, Response
from bson import ObjectId
from database import db
from models import RecommendedJob
import google.generativeai as genai
from datetime import datetime
from dotenv import load_dotenv
import os
import json
import uuid
import asyncio
from services.google_sheets import write_to_sheet
from utils import is_pro_user
from dependencies import get_current_user, limiter
from encryption import decrypt_field

# --- Load Environment ---
load_dotenv()

router = APIRouter()

# --- Collections ---
users_collection = db["users"]
resumes_collection = db["resumes"]
recommendations_collection = db["recommendations"]
jobs_collection = db["jobs"]
tasks_collection = db["generation_tasks"]

# --- Gemini Configuration ---
genai.configure(api_key=os.environ["GEMINI_API_KEY"])
GEMINI_MODEL_NAME = "gemini-flash-latest"  # Keep original working model
GENERATION_CONFIG = {
    "temperature": 0.5,  # Reduced for more consistent output
    "top_p": 0.9,
    "top_k": 40,
    "max_output_tokens": 8192,  # Increased to prevent JSON truncation
    "response_mime_type": "application/json",
}
from google.generativeai.types import HarmCategory, HarmBlockThreshold
SAFETY_SETTINGS = {
    HarmCategory.HARM_CATEGORY_HARASSMENT: HarmBlockThreshold.BLOCK_NONE,
    HarmCategory.HARM_CATEGORY_HATE_SPEECH: HarmBlockThreshold.BLOCK_NONE,
    HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT: HarmBlockThreshold.BLOCK_NONE,
    HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT: HarmBlockThreshold.BLOCK_NONE,
}

# --- Helper: Build Prompt ---
def build_prompt(user_profile, jobs):
    for job in jobs:
        if "description" in job and job["description"]:
            job["description"] = job["description"][:150] + "..."
    jobs_data = [
        {
            "title": job.get("title"), 
            "company": str(job.get("company", "")),
            "location": job.get("location"),
            "description": job.get("description", "No description"), 
            "job_url": job.get("job_url"),
        } for job in jobs
    ]
    jobs_json = json.dumps(jobs_data, indent=2)

    return f"""You are a job-matching expert. Find the BEST matching jobs for this candidate.

# CANDIDATE PROFILE
{user_profile}

# AVAILABLE JOBS (Pre-filtered for relevance)
{jobs_json}

# SCORING RULES (0-100)
- Location/Remote match: +30 pts (exact location or remote if user prefers remote)
- Role title match: +30 pts (job title matches desired roles)
- Skills overlap: +25 pts (tech stack mentioned in job description)
- Job type match (Full-time/Part-time/Contract): +10 pts
- Seniority level match: +5 pts

# OUTPUT REQUIREMENTS
- Return 10-20 jobs as a JSON array
- Include jobs with score 25 or higher (be GENEROUS for experienced candidates)
- For candidates with 5+ years experience, include senior-level roles
- For candidates wanting Remote work, prioritize remote jobs
- Maximum 3 jobs per company
- Sort by match_score descending

Return ONLY valid JSON. No markdown, no backticks.

[
  {{
    "title": "Job title",
    "company": "Company name",
    "location": "Location",
    "match_score": 75,
    "reason": "Brief explanation of match",
    "job_url": "URL"
  }}
]
"""




# --- Background Task ---
async def _run_recommendation_generation(user_id: str, task_id: str):
    print(f"DEBUG: Starting recommendation generation v3 for task {task_id}")
    await tasks_collection.update_one({"_id": task_id}, {"$set": {"status": "running", "updated_at": datetime.utcnow()}})
    try:
        user_object_id = ObjectId(user_id)
        user = await users_collection.find_one({"_id": user_object_id})
        if not user:
            raise Exception("User not found")

        user_profile_parts = []
        resume_data = await resumes_collection.find_one({"user_id": user_object_id})
        if resume_data:
            user_profile_parts.append("RESUME:")
            # Decrypt name if it's encrypted (for Gemini prompt)
            resume_name = decrypt_field(resume_data.get("name", "")) if resume_data.get("name") else None
            if resume_name: user_profile_parts.append(f"Name: {resume_name}")
            if resume_data.get("roles"): user_profile_parts.append(f"Desired Roles: {', '.join(resume_data['roles'])}")
            if resume_data.get("skills"): user_profile_parts.append(f"Skills: {', '.join(resume_data['skills'])}")
            if resume_data.get("experience_summary"): user_profile_parts.append("Experience: " + "; ".join(resume_data["experience_summary"]))
            if resume_data.get("education"): user_profile_parts.append("Education: " + "; ".join(resume_data["education"]))

        preferences = user.get("preferences", {})
        if preferences:
            user_profile_parts.append("\nPREFERENCES:")
            if preferences.get("role"): user_profile_parts.append(f"Roles: {', '.join(preferences['role'])}")
            if preferences.get("location"): user_profile_parts.append(f"Locations: {', '.join(preferences['location'])}")
            if preferences.get("tech_stack"): user_profile_parts.append(f"Tech Stack: {', '.join(preferences['tech_stack'])}")
            if preferences.get("experience_level"): user_profile_parts.append(f"Experience: {preferences['experience_level']}")
            if preferences.get("company_size"): user_profile_parts.append(f"Company Size: {', '.join(preferences['company_size'])}")
            if preferences.get("job_type"): user_profile_parts.append(f"Job Type: {', '.join(preferences['job_type'])}")
            if preferences.get("work_arrangement"): user_profile_parts.append(f"Work: {', '.join(preferences['work_arrangement'])}")
            
            # NEW FIELDS for enhanced role matching
            if preferences.get("seniority_level"): 
                user_profile_parts.append(f"**CRITICAL** Seniority Level: {preferences['seniority_level']}")
            if preferences.get("role_type"): 
                user_profile_parts.append(f"**CRITICAL** Role Type Preference: {preferences['role_type']}")
            if preferences.get("exclude_keywords"): 
                user_profile_parts.append(f"EXCLUDE jobs containing: {', '.join(preferences['exclude_keywords'])}")
            if preferences.get("must_have_keywords"): 
                user_profile_parts.append(f"PRIORITIZE jobs containing: {', '.join(preferences['must_have_keywords'])}")

        if not user_profile_parts:
            raise Exception("User has no resume data or preferences set.")

        user_profile_string = "\n".join(user_profile_parts)
        
        # Fetch ALL jobs from database
        all_jobs = await jobs_collection.find({}).to_list(length=None)
        if not all_jobs:
            raise Exception("No jobs found in the database")
        
        print(f"DEBUG: Fetched {len(all_jobs)} total jobs from database")
        
        # Pre-filter jobs based on user preferences - ENHANCED VERSION
        def pre_filter_jobs(jobs, prefs, resume):
            """Filter jobs using ALL preference fields with scoring-based approach."""
            filtered = []
            
            # Extract ALL filter criteria
            preferred_locations = [loc.lower() for loc in prefs.get("location", [])]
            preferred_roles = [role.lower() for role in prefs.get("role", [])]
            tech_stack = [tech.lower() for tech in prefs.get("tech_stack", [])]
            exclude_keywords = [kw.lower() for kw in prefs.get("exclude_keywords", [])]
            must_have_keywords = [kw.lower() for kw in prefs.get("must_have_keywords", [])]
            
            # NEW: Extract previously unused preferences
            job_types = [jt.lower() for jt in prefs.get("job_type", [])]  # Full-time, Part-time, Contract
            work_arrangements = [wa.lower() for wa in prefs.get("work_arrangement", [])]  # Remote, Hybrid, On-site
            experience_level = prefs.get("experience_level", "").lower()  # 10+ Years, 1-3 Years, etc.
            seniority_level = prefs.get("seniority_level", "").lower()  # Senior (5-10 years), Junior, etc.
            role_type = prefs.get("role_type", "").lower()  # Individual Contributor, Management
            
            # Check if user wants remote work (from location OR work_arrangement)
            user_wants_remote = any("remote" in loc for loc in preferred_locations) or \
                               any("remote" in wa for wa in work_arrangements)
            
            # Also get roles from resume if available
            if resume:
                preferred_roles.extend([r.lower() for r in resume.get("roles", [])])
            
            for job in jobs:
                title = (job.get("title") or "").lower()
                location = (job.get("location") or "").lower()
                description = (job.get("description") or "").lower()
                
                # === HARD FILTERS (Skip job if fails) ===
                
                # Skip if contains excluded keywords
                if exclude_keywords and any(kw in title or kw in description for kw in exclude_keywords):
                    continue
                
                # Experience/Seniority detection
                is_senior_job = any(kw in title for kw in ["senior", "sr.", "sr ", "lead", "principal", "staff", "architect", "director", "head"])
                is_entry_job = any(kw in title for kw in ["fresher", "entry", "graduate", "intern", "trainee", "associate", "junior"])
                is_management_job = any(kw in title for kw in ["manager", "head", "director", "vp", "lead", "team lead"])
                
                # Fresher/Intern: Skip senior roles
                if experience_level in ["fresher", "internship", "0-1 years"] or "junior" in seniority_level:
                    if is_senior_job:
                        continue
                
                # Senior (5+ years, 7-10 years, 10+ years): Skip entry-level
                senior_experience = ["5-7 years", "7-10 years", "10+ years"]
                if experience_level in senior_experience or "senior" in seniority_level or "staff" in seniority_level:
                    if is_entry_job and not is_senior_job:
                        continue
                
                # Role type filtering (IC vs Management) - only if specified
                if role_type:
                    if role_type == "individual contributor" and is_management_job:
                        continue
                    if "management" in role_type and not is_management_job:
                        continue
                
                # === SCORING (Higher score = better match) ===
                score = 0
                
                # Location match (+4 points) - Improved remote handling
                remote_keywords = ["remote", "work from home", "wfh", "anywhere", "distributed"]
                is_remote_job = any(kw in location for kw in remote_keywords)
                
                if user_wants_remote and is_remote_job:
                    score += 4
                elif preferred_locations:
                    # Check if any preferred city is in job location
                    for loc in preferred_locations:
                        # Extract city name (e.g., "bangalore" from "remote (india)")
                        city = loc.replace("remote", "").replace("(", "").replace(")", "").strip()
                        if city and city in location:
                            score += 4
                            break
                        elif loc in location:
                            score += 4
                            break
                
                # Role match (+4 points)
                if any(role in title for role in preferred_roles):
                    score += 4
                
                # Tech stack match (+2 points per match, max 6)
                tech_matches = sum(1 for tech in tech_stack if tech in description or tech in title)
                score += min(tech_matches * 2, 6)
                
                # Must-have keywords (+3 points)
                if must_have_keywords and any(kw in title or kw in description for kw in must_have_keywords):
                    score += 3
                
                # Job type match (+2 points) - Full-time, Part-time, Contract
                if job_types:
                    if any(jt in description.lower() or jt in title for jt in job_types):
                        score += 2
                
                # Work arrangement match (+2 points)
                if work_arrangements:
                    if any("remote" in wa for wa in work_arrangements) and is_remote_job:
                        score += 2
                    elif any("hybrid" in wa for wa in work_arrangements) and "hybrid" in description:
                        score += 2
                    elif any("on-site" in wa or "onsite" in wa for wa in work_arrangements) and not is_remote_job:
                        score += 2
                
                # Include all jobs with any relevance (let AI do final filtering)
                # Lower threshold to 1 to include more jobs for experienced users
                if score >= 1:
                    job["_prefilter_score"] = score
                    filtered.append(job)
            
            # Sort by score and take top 100 for AI (increased from 50)
            filtered.sort(key=lambda x: x.get("_prefilter_score", 0), reverse=True)
            return filtered[:100]
        
        # Apply pre-filtering
        jobs = pre_filter_jobs(all_jobs, preferences, resume_data)
        print(f"DEBUG: Pre-filtered to {len(jobs)} relevant jobs")

        prompt = build_prompt(user_profile_string, jobs)
        model = genai.GenerativeModel(model_name=GEMINI_MODEL_NAME, generation_config=GENERATION_CONFIG, safety_settings=SAFETY_SETTINGS)
        
        # Retry logic for Gemini API
        max_retries = 2
        response = None
        for attempt in range(max_retries):
            try:
                response = await asyncio.to_thread(model.generate_content, prompt)
                if response.candidates and response.candidates[0].content.parts:
                    break
                print(f"DEBUG: Attempt {attempt+1} - Empty response, retrying...")
                await asyncio.sleep(2)  # Wait before retry
            except Exception as api_error:
                print(f"DEBUG: Attempt {attempt+1} - API error: {api_error}")
                if attempt < max_retries - 1:
                    await asyncio.sleep(2)
                else:
                    raise api_error

        if not response or not response.candidates or not response.candidates[0].content.parts:
            feedback = response.prompt_feedback if response and hasattr(response, 'prompt_feedback') else 'No feedback available'
            raise Exception(f"AI content filtering triggered after {max_retries} attempts. Feedback: {feedback}")

        raw_text = response.text.strip()
        if raw_text.startswith("```"):
            parts = raw_text.split("```")
            cleaned_response_text = parts[1].lstrip("json").strip() if len(parts) >= 2 else raw_text
        else:
            cleaned_response_text = raw_text

        try:
            recommended_jobs_data = json.loads(cleaned_response_text)
        except json.JSONDecodeError:
            import re
            json_objects_str = re.findall(r'\{[^{}]*\}', cleaned_response_text)
            if json_objects_str:
                recommended_jobs_data = [json.loads(s) for s in json_objects_str]
            else:
                raise ValueError("Failed to parse or repair JSON response from AI.")

        if not isinstance(recommended_jobs_data, list) or len(recommended_jobs_data) == 0:
            raise ValueError("AI response is not a valid list of jobs.")

        recommended_jobs = [RecommendedJob(**job) for job in recommended_jobs_data]

        # Calculate time saved for this batch
        # Calculate time saved for this batch
        # Ensure company is a string (AI sometimes returns dict/object)
        unique_companies = set()
        for job in recommended_jobs:
            try:
                val = job.company
                if isinstance(val, dict):
                    val = str(val)
                unique_companies.add(str(val))
            except Exception:
                continue
        search_time_saved = len(unique_companies) * 5
        evaluation_time_saved = len(recommended_jobs) * 6
        total_batch_time_saved = search_time_saved + evaluation_time_saved

        recommendation_data = {"user_id": user_id, "recommended_jobs": [job.dict() for job in recommended_jobs], "generated_at": datetime.utcnow()}
        await recommendations_collection.update_one({"user_id": user_id}, {"$set": recommendation_data}, upsert=True)

        # Update user's job_applications and time_saved_minutes
        await users_collection.update_one(
            {"_id": user_object_id},
            {"$set": {"job_applications": [{"job_details": job.dict(), "status": "recommended", "updated_at": datetime.utcnow()} for job in recommended_jobs]},
             "$inc": {"time_saved_minutes": total_batch_time_saved}}
        )

        sheets_error = None
        if is_pro_user(user) and user.get("sheets_enabled"):
            success = await write_to_sheet(user_id, [job.dict() for job in recommended_jobs])
            if not success:
                sheets_error = f"Failed to write to Google Sheets for user {user_id}."
        
        await tasks_collection.update_one(
            {"_id": task_id},
            {"$set": {"status": "complete", "result": {"count": len(recommended_jobs), "sheets_error": sheets_error}, "updated_at": datetime.utcnow()}}
        )

    except Exception as e:
        import traceback
        traceback.print_exc()
        print(f"❌ ERROR in background task {task_id} for user {user_id}: {e}")
        await tasks_collection.update_one(
            {"_id": task_id},
            {"$set": {"status": "failed", "error": str(e), "updated_at": datetime.utcnow()}}
        )

# --- API Endpoints ---
@router.post("/recommendations/start", status_code=202)
async def start_recommendation_generation(
    current_user: dict = Depends(get_current_user)
):
    user_id = current_user.get("_id")
    user = await users_collection.find_one({"_id": ObjectId(user_id)})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # --- Rate Limiting ---
    last_recommendation = await recommendations_collection.find_one({"user_id": user_id}, sort=[("generated_at", -1)])
    if last_recommendation:
        time_since = datetime.utcnow() - last_recommendation["generated_at"]
        is_pro = is_pro_user(user)
        limit_days = 7 if is_pro else 30
        if time_since.days < limit_days:
            raise HTTPException(
                status_code=429,
                detail=f"Recommendation limit reached. Next generation available in {limit_days - time_since.days} days."
            )

    task_id = str(uuid.uuid4())
    await tasks_collection.insert_one({
        "_id": task_id,
        "user_id": user_id,
        "status": "pending",
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow()
    })

    # Use asyncio.create_task instead of BackgroundTasks for Lambda compatibility
    # This runs in the same event loop and Lambda will wait for it
    asyncio.create_task(_run_recommendation_generation(user_id, task_id))
    
    return {"task_id": task_id, "message": "Recommendation generation started."}

@router.get("/recommendations/status/{task_id}")
async def get_recommendation_status(task_id: str, current_user: dict = Depends(get_current_user)):
    task = await tasks_collection.find_one({"_id": task_id})
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    
    # Ensure user can only access their own tasks
    if task.get("user_id") != current_user.get("_id"):
        raise HTTPException(status_code=403, detail="Not authorized to view this task")
        
    return {
        "task_id": task["_id"],
        "status": task["status"],
        "created_at": task["created_at"],
        "updated_at": task["updated_at"],
        "result": task.get("result"),
        "error": task.get("error")
    }
@router.post("/recommendations/demo")
@limiter.limit("2/day")
async def generate_demo_recommendations(request: Request):
    """
    Generate demo recommendations without authentication.
    Returns random jobs from database for guest users to preview the platform.
    No user preferences needed - purely for demonstration purposes.
    """
    try:
        # Get 10 random active jobs from database
        pipeline = [
            {"$match": {"is_active": True}},
            {"$sample": {"size": 10}}
        ]
        
        demo_jobs_cursor = jobs_collection.aggregate(pipeline)
        demo_jobs = await demo_jobs_cursor.to_list(10)
        
        if not demo_jobs:
            # Fallback: if no jobs with is_active, just get any 10 jobs
            demo_jobs = await jobs_collection.find().limit(10).to_list(10)
        
        # Format jobs to match expected structure
        recommendations = []
        for idx, job in enumerate(demo_jobs):
            # Remove MongoDB _id for clean response
            if "_id" in job:
                del job["_id"]
            
            recommendations.append({
                "job_details": {
                    "title": job.get("title", "Software Engineer"),
                    "company": job.get("company", "Tech Company"),
                    "location": job.get("location", "Remote"),
                    "job_url": job.get("job_url", "#"),
                    "match_score": 85,  # Fixed demo score
                    "reason": "Sample job recommendation for demo purposes. Sign up to get personalized matches!"
                },
                "status": "recommended"
            })
        
        return {
            "recommendations": recommendations,
            "is_demo": True,
            "count": len(recommendations),
            "message": "Demo recommendations generated successfully"
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to generate demo recommendations: {str(e)}"
        )
