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
GEMINI_MODEL_NAME = "gemini-flash-latest"
GENERATION_CONFIG = {
    "temperature": 0.7,
    "top_p": 0.95,
    "top_k": 40,
    "max_output_tokens": 16384,
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
            job["description"] = job["description"][:300] + "..."
    jobs_data = [
        {
            "title": job.get("title"), 
            "company": str(job.get("company", "")),  # Ensure company is string
            "location": job.get("location"),
            "description": job.get("description", "No description"), 
            "job_url": job.get("job_url"),
        } for job in jobs
    ]
    jobs_json = json.dumps(jobs_data, indent=2)

    return f"""
You are an expert job-matching engine. Your ONLY job is to select the BEST jobs for this candidate from the given list.

########################
## INPUT: USER PROFILE
########################
{user_profile}

########################
## INPUT: AVAILABLE JOBS
########################
{jobs_json}

########################
## MATCHING STRATEGY
########################

### 1. EXPERIENCE LEVEL MATCHING (SMART & FLEXIBLE)
**Core Principle**: Prioritize jobs at user's level, but include relevant stretch opportunities.

**For Freshers / Interns / 0-1 Years:**
- PRIMARY (70% of results): Internships, trainee, graduate, or entry-level roles (0-1 years)
- STRETCH (30% of results): 1-2 year roles IF they have strong tech stack match (+15 skill overlap bonus)
- EXCLUDE: Anything requiring 3+ years, or roles with "Senior", "Lead", "Staff" titles

**For 1-3 Years Experience:**
- PRIMARY (70%): Junior/Mid-level roles (1-3 years)
- STRETCH (30%): Entry-level roles (if strong match) OR 3-4 year roles (if skills align)
- EXCLUDE: Internships, trainee programs, and roles requiring 5+ years

**For 3-7 Years Experience:**
- PRIMARY (70%): Mid/Senior roles (3-7 years)
- STRETCH (30%): 2-3 year roles (if strong match) OR 7-10 year roles (if skills align)
- EXCLUDE: Internships, graduate programs, and roles requiring 10+ years

**For 7+ Years Experience:**
- PRIMARY (70%): Senior/Lead/Principal/Architect roles (7+ years)
- STRETCH (30%): 5-7 year roles (if strong match) OR Staff/Principal roles (if skills align)
- EXCLUDE: Internships, junior, and mid-level roles

**Experience Level Indicators:**
Look for these keywords in job titles/descriptions:
- Entry: "Intern", "Trainee", "Graduate", "Junior", "Entry-level", "Associate"
- Mid: "Mid-level", "Software Engineer", "Developer" (without Senior/Junior)
- Senior: "Senior", "Lead", "Staff", "Principal", "Architect", "Manager"

### 2. SCORING SYSTEM (0-100 points)
**Experience Tier Match:**
- PRIMARY tier match: +50 points (base)
- STRETCH tier match: +35 points (conditional on strong skills)
- Outside acceptable range: 0 points (reject)

**Skills & Tech Stack:**
- Strong overlap (60%+): +25 points
- Moderate overlap (40-60%): +15 points
- Weak overlap (<40%): +5 points

**Must-Have Keywords:**
- Contains all must-have keywords: +15 points
- Missing some: +5 points

**Location & Work Preferences:**
- Exact location match OR Remote: +10 points
- Nearby/Hybrid options: +5 points

**Role Type & Seniority:**
- Perfect alignment with preferences: +10 points

**Company Diversity Bonus:**
- First job from this company: +5 points
- Already have 2+ from this company: -10 points

**MINIMUM THRESHOLD:** Only include jobs scoring 65+ points

### 3. KEYWORD FILTERING (HARD RULES)
- **EXCLUDED keywords**: If job contains ANY excluded keyword → REJECT immediately
- **MUST-HAVE keywords**: If missing → score penalty -20 points

### 4. COMPANY DIVERSITY
- Aim for 6-8 different companies in final results
- Maximum 2 jobs from any single company
- Prioritize diversity over flooding from one source

########################
## OUTPUT FORMAT (CRITICAL)
########################
Return ONLY a JSON array. No prose, no markdown, no backticks, no wrapper object.

**Structure:**
[
  {{
    "title": "Job Title",
    "company": "Company Name",
    "location": "City / Remote / Hybrid",
    "match_score": 87,
    "reason": "Brief explanation (<= 30 words) focusing on why it's a good match",
    "job_url": "https://example.com/job-posting"
  }}
]

**Requirements:**
- Return 8-10 jobs (mix of PRIMARY and STRETCH tiers where applicable)
- For freshers: ~7 internships/entry-level + ~3 1-year roles (if skills-qualified)
- "match_score" must be integer 0-100
- "reason" must be under 30 words
- Sort by match_score descending
- Never invent data - use only what's in the input

########################
## EXECUTION STEPS
########################
1. Parse user's experience level and preferences
2. For each job, determine: PRIMARY tier, STRETCH tier, or REJECT
3. Calculate match score using the scoring system above
4. Apply keyword filters (EXCLUDE/MUST-HAVE)
5. Select top 8-10 jobs, ensuring:
   - ~70% PRIMARY tier + ~30% STRETCH tier
   - Company diversity (max 2 per company)
   - All score >= 65
6. Sort by match_score (highest first)
7. Output ONLY the JSON array

IMPORTANT: Do NOT wrap the JSON in ```json or any markdown. Output MUST start with '[' and end with ']'.

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
            if resume_data.get("name"): user_profile_parts.append(f"Name: {resume_data['name']}")
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
        jobs = await jobs_collection.find({}).to_list(length=100)
        if not jobs:
            raise Exception("No jobs found in the database")

        prompt = build_prompt(user_profile_string, jobs)
        model = genai.GenerativeModel(model_name=GEMINI_MODEL_NAME, generation_config=GENERATION_CONFIG, safety_settings=SAFETY_SETTINGS)
        response = await asyncio.to_thread(model.generate_content, prompt)

        if not response.candidates or not response.candidates[0].content.parts:
            feedback = response.prompt_feedback if hasattr(response, 'prompt_feedback') else 'No feedback available'
            raise Exception(f"AI content filtering triggered. Feedback: {feedback}")

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
