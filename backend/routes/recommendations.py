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
        # Convert string user_id to ObjectId for database query
        user_object_id = ObjectId(user_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid user ID format")

    user = await db.users.find_one({"_id": user_object_id})

    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    preferences = user.get("preferences", {})
    if not preferences:
        raise HTTPException(status_code=400, detail="User preferences not set")

    jobs_cursor = db.jobs.find({})
    jobs = await jobs_cursor.to_list(length=200) 

    if not jobs:
        raise HTTPException(status_code=404, detail="No jobs found in the database")

    prompt = f"""
You are an expert AI Job Recommendation Assistant. Your task is to analyze user preferences and a list of available jobs, then return a ranked list of the most suitable job recommendations.

User Preferences:
- Role: {', '.join(preferences.get('role', []))}
- Location: {', '.join(preferences.get('location', []))}
- Tech Stack: {', '.join(preferences.get('tech_stack', []))}
- Experience Level: {preferences.get('experience_level', 'Not specified')}

Available Job Postings:
{json.dumps([{'title': job.get('title'), 'company': job.get('company'), 'location': job.get('location'), 'description': job.get('description', 'No description available'), 'job_url': job.get('job_url')} for job in jobs], indent=2)}

Based on the user's preferences, please provide a list of the top 5-10 job recommendations. For each recommendation, calculate a 'match_score' from 0 to 100, where 100 is a perfect match. Also, provide a brief 'reason' for why the job is a good match.

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
        model = genai.GenerativeModel("gemini-1.5-flash-latest")
        response = model.generate_content(prompt)
        
        cleaned_response_text = response.text.strip().replace("```json", "").replace("```", "").strip()
        
        recommended_jobs_data = json.loads(cleaned_response_text)
        
        recommended_jobs = [RecommendedJob(**job) for job in recommended_jobs_data]

    except (json.JSONDecodeError, ValueError) as e:
        print(f"Error processing Gemini response: {e}")
        print(f"Raw response was: {response.text}")
        raise HTTPException(status_code=500, detail="Failed to parse recommendations from AI. Please try again.")
    except Exception as e:
        print(f"An unexpected error occurred with Gemini API: {e}")
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
    if user.get("sheets_enabled"):
        # Pass the original string user_id, not the ObjectId
        await write_to_sheet(user_id, [job.dict() for job in recommended_jobs])

    return recommendation_data


@router.get("/recommendations/{user_id}", response_model=Recommendation)
async def get_recommendations(user_id: str):
    rec = await db.recommendations.find_one({"user_id": user_id})
    
    if not rec:
        raise HTTPException(status_code=404, detail="No recommendations found. Please generate them first.")

    return rec
