from fastapi import APIRouter, HTTPException, Depends
from bson import ObjectId
from database import db
from models import Recommendation, RecommendedJob
import google.generativeai as genai
from datetime import datetime
from dotenv import load_dotenv
import os
import json
from services.google_sheets import write_to_sheet
from utils import get_current_pro_user, get_current_user

load_dotenv()

router = APIRouter()

# --- Database Collections ---
users_collection = db["users"]
resumes_collection = db["resumes"]
recommendations_collection = db["recommendations"]
jobs_collection = db["jobs"]

# Configure Gemini
genai.configure(api_key=os.environ["GEMINI_API_KEY"])

def build_prompt(user_profile, jobs):
    # Truncate job descriptions to keep the prompt size reasonable
    for job in jobs:
        if 'description' in job and job['description']:
            job['description'] = job['description'][:500] + '...'

    prompt = f"""
You are an expert AI Job Recommendation Assistant. Your task is to analyze a detailed user profile and a list of available jobs, then return a ranked list of the most suitable job recommendations.

User Profile:
{user_profile}

Available Job Postings:
{json.dumps([{'title': job.get('title'), 'company': job.get('company'), 'location': job.get('location'), 'description': job.get('description', 'No description available'), 'job_url': job.get('job_url')} for job in jobs], indent=2)}

Based on the user's profile, please provide a ranked list of the top 5-10 job recommendations from the list provided. It is crucial that you return the best possible matches. For each recommendation, calculate a 'match_score' from 0 to 100, where 100 is a perfect match. Also, provide a brief 'reason' for why the job is a good match.

IMPORTANT: Your final output MUST be a single, valid JSON array of objects. Each object in the array should strictly follow this format:
{{
  "title": "...",
  "company": "...",
  "location": "...",
  "match_score": ...,
  "reason": "...",
  "job_url": "..."
}}

Do not include any text, explanations, or markdown formatting before or after the JSON array.
"""
    return prompt

@router.post("/generate_recommendations")
async def generate_recommendations(current_user: dict = Depends(get_current_pro_user)):
    user_id = current_user.get("_id")
    try:
        user_object_id = ObjectId(user_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid user ID format")

    user = await users_collection.find_one({"_id": user_object_id})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # Rate limiting logic (no changes here)
    last_recommendation = await recommendations_collection.find_one(
        {"user_id": user_id}, sort=[("generated_at", -1)]
    )
    if last_recommendation:
        time_since = datetime.utcnow() - last_recommendation["generated_at"]
        if user.get("plan_type") == "free" and time_since.days < 30:
            raise HTTPException(status_code=429, detail="Free users can generate recommendations once every 30 days.")
        if user.get("plan_type") == "pro" and time_since.days < 7:
            raise HTTPException(status_code=429, detail="Pro users can generate recommendations once every 7 days.")

    # --- Build User Profile for Prompt ---
    user_profile_parts = []
    
    # 1. Prioritize saved resume data
    resume_data = await resumes_collection.find_one({"user_id": user_object_id})
    if resume_data:
        user_profile_parts.append("---" + " From Resume ---")
        if resume_data.get("name"): user_profile_parts.append(f"Name: {resume_data['name']}")
        if resume_data.get("roles"): user_profile_parts.append(f"Desired Roles: {', '.join(resume_data['roles'])}")
        if resume_data.get("skills"): user_profile_parts.append(f"Skills: {', '.join(resume_data['skills'])}")
        if resume_data.get("experience_summary"): user_profile_parts.append("Experience Summary:\n" + "\n".join(f"- {exp}" for exp in resume_data['experience_summary']))
        if resume_data.get("education"): user_profile_parts.append("Education:\n" + "\n".join(f"- {edu}" for edu in resume_data['education']))
    
    # 2. Append manual preferences
    preferences = user.get("preferences", {})
    if preferences:
        user_profile_parts.append("\n--- Additional Preferences ---")
        if preferences.get('role'): user_profile_parts.append(f"Roles: {', '.join(preferences['role'])}")
        if preferences.get('location'): user_profile_parts.append(f"Location: {', '.join(preferences['location'])}")
        if preferences.get('tech_stack'): user_profile_parts.append(f"Tech Stack: {', '.join(preferences['tech_stack'])}")
        if preferences.get('experience_level'): user_profile_parts.append(f"Experience Level: {preferences['experience_level']}")
        if preferences.get('company_size'): user_profile_parts.append(f"Company Size: {', '.join(preferences['company_size'])}")
        if preferences.get('job_type'): user_profile_parts.append(f"Job Type: {', '.join(preferences['job_type'])}")
        if preferences.get('work_arrangement'): user_profile_parts.append(f"Work Arrangement: {', '.join(preferences['work_arrangement'])}")

    if not user_profile_parts:
        raise HTTPException(status_code=400, detail="User has no resume data or preferences set.")

    user_profile_string = "\n".join(user_profile_parts)
    
    print(f"--- Generating Recommendations for User: {user_id} ---")
    print(f"Compiled User Profile:\n{user_profile_string}")

    # --- Fetch Jobs and Generate ---
    jobs_cursor = jobs_collection.find({})
    jobs = await jobs_cursor.to_list(length=200)
    if not jobs:
        raise HTTPException(status_code=404, detail="No jobs found in the database")

    prompt = build_prompt(user_profile_string, jobs)

    try:
        print("Sending prompt to Gemini API...")
        model = genai.GenerativeModel("gemini-1.5-flash-latest")
        response = model.generate_content(prompt)
        cleaned_response_text = response.text.strip().replace("```json", "").replace("```", "").strip()
        recommended_jobs_data = json.loads(cleaned_response_text)
        recommended_jobs = [RecommendedJob(**job) for job in recommended_jobs_data]
    except Exception as e:
        print(f"--- ERROR --- \nFailed to generate or parse recommendations: {e}\nRaw Response:\n{response.text if 'response' in locals() else 'No response'}")
        raise HTTPException(status_code=500, detail="Failed to get or parse recommendations from AI.")

    # --- Save and Return Recommendations ---
    recommendation_data = {
        "user_id": user_id,
        "recommended_jobs": [job.dict() for job in recommended_jobs],
        "generated_at": datetime.utcnow()
    }
    await recommendations_collection.update_one(
        {"user_id": user_id}, {"$set": recommendation_data}, upsert=True
    )

    if user.get("sheets_enabled") and user.get("plan_type") == "pro":
        await write_to_sheet(user_id, [job.dict() for job in recommended_jobs])

    return recommendation_data

@router.get("/recommendations")
async def get_recommendations(current_user: dict = Depends(get_current_user)):
    user_id = current_user.get("_id")
    rec = await recommendations_collection.find_one({"user_id": user_id})
    if not rec:
        raise HTTPException(status_code=404, detail="No recommendations found. Please generate them first.")
    return {
        "recommended_jobs": rec.get("recommended_jobs", []),
        "generated_at": rec.get("generated_at"),
    }