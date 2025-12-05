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

    return f"""You are a job-matching system. Find the BEST matching jobs for this candidate.

# CANDIDATE PROFILE
{user_profile}

# AVAILABLE JOBS (Pre-filtered for relevance)
{jobs_json}

# SCORING CRITERIA
Score each job 0-100 based on:
- Location match (user's preferred locations): +30 points
- Skills overlap (tech stack in description): +40 points
- Role title match (matches desired roles): +30 points

# OUTPUT REQUIREMENTS
- Return 8-15 jobs as a JSON array
- Include jobs with score 40 or higher (be generous)
- Sort by match_score descending
- Maximum 3 jobs per company

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
        
        # Pre-filter jobs based on user preferences
        def pre_filter_jobs(jobs, prefs, resume):
            filtered = []
            
            # Extract filter criteria
            preferred_locations = [loc.lower() for loc in prefs.get("location", [])]
            preferred_roles = [role.lower() for role in prefs.get("role", [])]
            experience_level = prefs.get("experience_level", "").lower()
            exclude_keywords = [kw.lower() for kw in prefs.get("exclude_keywords", [])]
            tech_stack = [tech.lower() for tech in prefs.get("tech_stack", [])]
            
            # Also get roles from resume if available
            if resume:
                preferred_roles.extend([r.lower() for r in resume.get("roles", [])])
            
            for job in jobs:
                title = (job.get("title") or "").lower()
                location = (job.get("location") or "").lower()
                description = (job.get("description") or "").lower()
                
                # Skip if contains excluded keywords
                if any(kw in title or kw in description for kw in exclude_keywords):
                    continue
                
                # Experience-based filtering
                is_senior_job = any(kw in title for kw in ["senior", "sr.", "sr ", "lead", "principal", "staff", "manager", "architect", "director"])
                is_entry_job = any(kw in title or kw in description for kw in ["fresher", "entry", "graduate", "intern", "trainee", "0-1", "0-2", "1-2", "associate", "junior"])
                has_high_exp_req = any(exp in description for exp in ["5+ years", "5-", "6-", "7-", "8-", "9-", "10+", "experienced professionals", "5 years", "6 years", "7 years", "8 years", "9 years", "10 years", "minimum 5", "minimum 6", "minimum 7", "minimum 8"])
                
                # FRESHER: Skip senior roles
                if experience_level in ["fresher", "junior (0-2 years)", "0-1 years"]:
                    if is_senior_job or has_high_exp_req:
                        continue
                
                # MID-LEVEL (2-5 years): Skip principal/director level roles
                elif experience_level in ["2-3 years", "3-5 years", "mid (2-5 years)"]:
                    if any(kw in title for kw in ["principal", "director", "vp", "head of"]):
                        continue
                
                # SENIOR (5+ years): Skip fresh graduate/intern roles
                elif experience_level in ["5+ years", "senior (5+ years)", "senior"]:
                    if is_entry_job and not is_senior_job:
                        continue  # Skip entry-level only jobs
                
                score = 0
                
                # Location match (+3 points)
                if any(loc in location for loc in preferred_locations) or "remote" in location:
                    score += 3
                
                # Role match (+3 points)
                if any(role in title for role in preferred_roles):
                    score += 3
                
                # Tech stack match (+1 point per match, max 3)
                tech_matches = sum(1 for tech in tech_stack if tech in description or tech in title)
                score += min(tech_matches, 3)
                
                # Only include jobs with some relevance
                if score >= 2:
                    job["_prefilter_score"] = score
                    filtered.append(job)
            
            # Sort by pre-filter score and take top 50 (reduced from 100 for faster processing)
            filtered.sort(key=lambda x: x.get("_prefilter_score", 0), reverse=True)
            return filtered[:50]
        
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
    background_tasks: BackgroundTasks,
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

    background_tasks.add_task(_run_recommendation_generation, user_id, task_id)
    
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
