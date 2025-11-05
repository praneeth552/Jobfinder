from fastapi import APIRouter, HTTPException, Depends, BackgroundTasks, Response
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
from utils import get_current_user, is_pro_user

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
GEMINI_MODEL_NAME = "gemini-2.5-flash"
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
    return f"""
Analyze the user profile and job listings. Return ONLY a JSON array of the top 5-8 best matches.

USER PROFILE:
{user_profile}

AVAILABLE JOBS:
{json.dumps([
    {
        "title": job.get("title"), "company": job.get("company"), "location": job.get("location"),
        "description": job.get("description", "No description"), "job_url": job.get("job_url"),
    } for job in jobs
], indent=2)}

Return this exact JSON structure with 5-8 jobs:
[
  {{
    "title": "Job Title", "company": "Company Name", "location": "Location",
    "match_score": 85, "reason": "One concise sentence explaining the match",
    "job_url": "https://example.com/job"
  }}
]

Important: Keep reasons under 30 words each. Return ONLY the JSON array.
"""

# --- Background Task ---
async def _run_recommendation_generation(user_id: str, task_id: str):
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

        if not user_profile_parts:
            raise Exception("User has no resume data or preferences set.")

        user_profile_string = "\n".join(user_profile_parts)
        jobs = await jobs_collection.find({}).to_list(length=50)
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

        recommendation_data = {"user_id": user_id, "recommended_jobs": [job.dict() for job in recommended_jobs], "generated_at": datetime.utcnow()}
        await recommendations_collection.update_one({"user_id": user_id}, {"$set": recommendation_data}, upsert=True)

        await users_collection.update_one(
            {"_id": user_object_id},
            {"$set": {"job_applications": [{"job_details": job.dict(), "status": "recommended", "updated_at": datetime.utcnow()} for job in recommended_jobs]}},
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
