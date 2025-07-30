from fastapi import APIRouter, HTTPException
from bson import ObjectId
from database import db
from models import Recommendation, RecommendedJob
import google.generativeai as genai
from datetime import datetime
from dotenv import load_dotenv
import os
import json
from services.google_sheets import write_to_sheet

load_dotenv()

router = APIRouter()

# Configure Gemini
genai.configure(api_key=os.environ["GEMINI_API_KEY"])

@router.post("/generate_recommendations/{user_id}")
async def generate_recommendations(user_id: str):
    try:
        user_object_id = ObjectId(user_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid user ID format")

    user = await db.users.find_one({"_id": user_object_id})

    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # Rate limiting logic
    last_recommendation = await db.recommendations.find_one(
        {"user_id": user_id},
        sort=[("generated_at", -1)]
    )

    if last_recommendation:
        last_generated_at = last_recommendation["generated_at"]
        now = datetime.utcnow()
        time_since_last_generation = now - last_generated_at

        if user.get("plan_type") == "free":
            if time_since_last_generation.days < 30:
                raise HTTPException(status_code=429, detail="Free users can generate recommendations once every 30 days.")
        elif user.get("plan_type") == "pro":
            if time_since_last_generation.days < 7:
                raise HTTPException(status_code=429, detail="Pro users can generate recommendations once every 7 days.")

    preferences = user.get("preferences", {})
    if not preferences:
        raise HTTPException(status_code=400, detail="User preferences not set")

    print("--- Generating Recommendations ---")
    print(f"User ID: {user_id}")
    print(f"User Preferences: {json.dumps(preferences, indent=2)}")

    jobs_cursor = db.jobs.find({})
    jobs = await jobs_cursor.to_list(length=200) 

    if not jobs:
        raise HTTPException(status_code=404, detail="No jobs found in the database")

    # Truncate job descriptions to keep the prompt size reasonable
    for job in jobs:
        if 'description' in job and job['description']:
            job['description'] = job['description'][:500] + '...'

    prompt = f"""
You are an expert AI Job Recommendation Assistant. Your task is to analyze user preferences and a list of available jobs, then return a ranked list of the most suitable job recommendations.

User Preferences:
- Role: {', '.join(preferences.get('role', []))}
- Location: {', '.join(preferences.get('location', []))}
- Tech Stack: {', '.join(preferences.get('tech_stack', []))}
- Experience Level: {preferences.get('experience_level', 'Not specified')}
- Company Size: {', '.join(preferences.get('company_size', []))}
- Job Type: {', '.join(preferences.get('job_type', []))}
- Work Arrangement: {', '.join(preferences.get('work_arrangement', []))}

Available Job Postings:
{json.dumps([{'title': job.get('title'), 'company': job.get('company'), 'location': job.get('location'), 'description': job.get('description', 'No description available'), 'job_url': job.get('job_url')} for job in jobs], indent=2)}

Based on the user's preferences, please provide a ranked list of the top 5-10 job recommendations from the list provided. It is crucial that you return the best possible matches, even if none of them are a perfect fit. For each recommendation, calculate a 'match_score' from 0 to 100, where 100 is a perfect match. Also, provide a brief 'reason' for why the job is a good match.

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

    try:
        print("Sending prompt to Gemini API...")
        model = genai.GenerativeModel("gemini-1.5-flash-latest")
        response = model.generate_content(prompt)
        
        print("Received response from Gemini API.")
        cleaned_response_text = response.text.strip().replace("```json", "").replace("```", "").strip()
        
        print("Attempting to parse JSON...")
        recommended_jobs_data = json.loads(cleaned_response_text)
        print("Successfully parsed JSON.")
        
        recommended_jobs = [RecommendedJob(**job) for job in recommended_jobs_data]

    except (json.JSONDecodeError, ValueError) as e:
        print(f"--- ERROR: Failed to parse JSON from Gemini response ---")
        print(f"Error: {e}")
        print(f"Raw response text was:\n---\n{response.text}\n---")
        raise HTTPException(status_code=500, detail="Failed to parse recommendations from AI. The format was invalid.")
    except Exception as e:
        print(f"--- ERROR: An unexpected error occurred with the Gemini API ---")
        print(f"Error: {e}")
        raise HTTPException(status_code=500, detail=f"An error occurred while generating recommendations: {e}")

    recommendation_data = {
        "user_id": user_id,
        "recommended_jobs": [job.dict() for job in recommended_jobs],
        "generated_at": datetime.utcnow()
    }

    await db.recommendations.update_one(
        {"user_id": user_id},
        {"$set": recommendation_data},
        upsert=True
    )

    # If user has enabled sheets integration, write to their sheet
    if user.get("sheets_enabled") and user.get("plan_type") == "pro":
        await write_to_sheet(user_id, [job.dict() for job in recommended_jobs])

    return recommendation_data


@router.get("/recommendations/{user_id}")
async def get_recommendations(user_id: str):
    rec = await db.recommendations.find_one({"user_id": user_id})
    
    if not rec:
        raise HTTPException(status_code=404, detail="No recommendations found. Please generate them first.")

    return {
        "recommended_jobs": rec.get("recommended_jobs", []),
        "generated_at": rec.get("generated_at"),
    }
