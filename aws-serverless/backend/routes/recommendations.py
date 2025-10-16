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
from utils import get_current_user, is_pro_user

# --- Load Environment ---
load_dotenv()

router = APIRouter()

# --- Collections ---
users_collection = db["users"]
resumes_collection = db["resumes"]
recommendations_collection = db["recommendations"]
jobs_collection = db["jobs"]

# --- Gemini Configuration ---
genai.configure(api_key=os.environ["GEMINI_API_KEY"])

GEMINI_MODEL_NAME = "gemini-2.5-flash"

GENERATION_CONFIG = {
    "temperature": 0.7,
    "top_p": 0.95,
    "top_k": 40,
    "max_output_tokens": 16384,  # Increased from 8192
    "response_mime_type": "application/json",  # Force JSON output
}

# Updated safety settings using proper enum imports
from google.generativeai.types import HarmCategory, HarmBlockThreshold

SAFETY_SETTINGS = [
    {
        "category": HarmCategory.HARM_CATEGORY_HARASSMENT,
        "threshold": HarmBlockThreshold.BLOCK_NONE,
    },
    {
        "category": HarmCategory.HARM_CATEGORY_HATE_SPEECH,
        "threshold": HarmBlockThreshold.BLOCK_NONE,
    },
    {
        "category": HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
        "threshold": HarmBlockThreshold.BLOCK_NONE,
    },
    {
        "category": HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
        "threshold": HarmBlockThreshold.BLOCK_NONE,
    },
]

# --- Helper: Build Prompt ---
def build_prompt(user_profile, jobs):
    """Builds the job recommendation prompt."""
    # Truncate descriptions more aggressively
    for job in jobs:
        if "description" in job and job["description"]:
            job["description"] = job["description"][:300] + "..."  # Reduced from 500

    # Simplified, cleaner prompt
    return f"""
Analyze the user profile and job listings. Return ONLY a JSON array of the top 5-8 best matches.

USER PROFILE:
{user_profile}

AVAILABLE JOBS:
{json.dumps([
    {
        "title": job.get("title"),
        "company": job.get("company"),
        "location": job.get("location"),
        "description": job.get("description", "No description"),
        "job_url": job.get("job_url"),
    }
    for job in jobs
], indent=2)}

Return this exact JSON structure with 5-8 jobs:
[
  {{
    "title": "Job Title",
    "company": "Company Name",
    "location": "Location",
    "match_score": 85,
    "reason": "One concise sentence explaining the match",
    "job_url": "https://example.com/job"
  }}
]

Important: Keep reasons under 30 words each. Return ONLY the JSON array.
"""


# --- Main Endpoint ---
@router.post("/generate_recommendations")
async def generate_recommendations(current_user: dict = Depends(get_current_user)):
    """Generates personalized job recommendations for the logged-in user."""
    user_id = current_user.get("_id")

    # Validate user ID
    try:
        user_object_id = ObjectId(user_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid user ID format")

    user = await users_collection.find_one({"_id": user_object_id})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # --- Rate Limiting ---
    last_recommendation = await recommendations_collection.find_one(
        {"user_id": user_id}, sort=[("generated_at", -1)]
    )
    user_is_pro = is_pro_user(user)

    if last_recommendation:
        time_since = datetime.utcnow() - last_recommendation["generated_at"]

        if user_is_pro and time_since.days < 7:
            raise HTTPException(
                status_code=429,
                detail=f"Pro users can generate recommendations once every 7 days. Next generation available in {7 - time_since.days} days.",
            )

        if not user_is_pro and time_since.days < 30:
            raise HTTPException(
                status_code=429,
                detail=f"Free users can generate recommendations once every 30 days. Next generation available in {30 - time_since.days} days.",
            )

    # --- Build User Profile ---
    user_profile_parts = []

    resume_data = await resumes_collection.find_one({"user_id": user_object_id})
    if resume_data:
        user_profile_parts.append("RESUME:")
        if resume_data.get("name"):
            user_profile_parts.append(f"Name: {resume_data['name']}")
        if resume_data.get("roles"):
            user_profile_parts.append(f"Desired Roles: {', '.join(resume_data['roles'])}")
        if resume_data.get("skills"):
            user_profile_parts.append(f"Skills: {', '.join(resume_data['skills'])}")
        if resume_data.get("experience_summary"):
            user_profile_parts.append(
                "Experience: " + "; ".join(resume_data["experience_summary"])
            )
        if resume_data.get("education"):
            user_profile_parts.append(
                "Education: " + "; ".join(resume_data["education"])
            )

    preferences = user.get("preferences", {})
    if preferences:
        user_profile_parts.append("\nPREFERENCES:")
        if preferences.get("role"):
            user_profile_parts.append(f"Roles: {', '.join(preferences['role'])}")
        if preferences.get("location"):
            user_profile_parts.append(f"Locations: {', '.join(preferences['location'])}")
        if preferences.get("tech_stack"):
            user_profile_parts.append(f"Tech Stack: {', '.join(preferences['tech_stack'])}")
        if preferences.get("experience_level"):
            user_profile_parts.append(f"Experience: {preferences['experience_level']}")
        if preferences.get("company_size"):
            user_profile_parts.append(f"Company Size: {', '.join(preferences['company_size'])}")
        if preferences.get("job_type"):
            user_profile_parts.append(f"Job Type: {', '.join(preferences['job_type'])}")
        if preferences.get("work_arrangement"):
            user_profile_parts.append(f"Work: {', '.join(preferences['work_arrangement'])}")

    if not user_profile_parts:
        raise HTTPException(status_code=400, detail="User has no resume data or preferences set.")

    user_profile_string = "\n".join(user_profile_parts)
    print(f"--- Generating Recommendations for User: {user_id} ---")
    print(f"Compiled User Profile:\n{user_profile_string}")

    # --- Fetch Jobs ---
    jobs = await jobs_collection.find({}).to_list(length=50)  # Reduced from 100
    if not jobs:
        raise HTTPException(status_code=404, detail="No jobs found in the database")

    prompt = build_prompt(user_profile_string, jobs)

    # --- Generate Recommendations ---
    try:
        print(f"Sending prompt to Gemini API using model: {GEMINI_MODEL_NAME}...")
        model = genai.GenerativeModel(
            model_name=GEMINI_MODEL_NAME,
            generation_config=GENERATION_CONFIG,
            safety_settings=SAFETY_SETTINGS,
        )

        response = model.generate_content(prompt)

        # --- Handle blocked or empty responses ---
        if not response.candidates or not response.candidates[0].content.parts:
            finish_reason = (
                response.candidates[0].finish_reason
                if response.candidates and response.candidates[0].finish_reason
                else "unknown"
            )
            
            # Log safety ratings if available
            if response.candidates and hasattr(response.candidates[0], 'safety_ratings'):
                print(f"Safety Ratings: {response.candidates[0].safety_ratings}")
            
            print(f"⚠️ Gemini returned no valid content (finish_reason={finish_reason})")
            raise HTTPException(
                status_code=500,
                detail=f"AI content filtering triggered. Please try again or contact support if issue persists."
            )

        # --- Extract text safely ---
        raw_text = response.text.strip()
        
        # Remove markdown code blocks
        if raw_text.startswith("```"):
            # Find the content between ``` markers
            parts = raw_text.split("```")
            if len(parts) >= 2:
                cleaned_response_text = parts[1]
                # Remove 'json' language identifier if present
                if cleaned_response_text.startswith("json"):
                    cleaned_response_text = cleaned_response_text[4:]
                cleaned_response_text = cleaned_response_text.strip()
            else:
                cleaned_response_text = raw_text
        else:
            cleaned_response_text = raw_text
        
        # Additional validation: Check if JSON is complete
        if not cleaned_response_text.endswith("]"):
            print(f"⚠️ WARNING: Response appears truncated. Last 100 chars: ...{cleaned_response_text[-100:]}")
            # Try to fix common truncation issues
            if cleaned_response_text.count("[") > cleaned_response_text.count("]"):
                # Try to close any open objects and the array
                if not cleaned_response_text.rstrip().endswith("}"):
                    cleaned_response_text = cleaned_response_text.rstrip().rstrip(",") + "}"
                cleaned_response_text += "]"
                print("Attempted to close truncated JSON")

        print(f"Cleaned Response (First 200 chars): {cleaned_response_text[:200]}...")
        print(f"Cleaned Response (Last 100 chars): ...{cleaned_response_text[-100:]}")

        # --- Parse JSON ---
        try:
            recommended_jobs_data = json.loads(cleaned_response_text)
        except json.JSONDecodeError as json_err:
            print(f"First JSON parse failed: {json_err}")
            print(f"Attempting to repair JSON...")
            
            # Try to extract valid JSON objects even if array is incomplete
            import re
            job_objects = re.findall(r'\{[^{}]*(?:\{[^{}]*\}[^{}]*)*\}', cleaned_response_text)
            
            if job_objects:
                print(f"Found {len(job_objects)} job objects, attempting to reconstruct array")
                try:
                    recommended_jobs_data = [json.loads(obj) for obj in job_objects]
                    print(f"Successfully parsed {len(recommended_jobs_data)} jobs from partial response")
                except Exception as repair_err:
                    print(f"Repair attempt failed: {repair_err}")
                    raise json_err
            else:
                raise json_err
        
        if not isinstance(recommended_jobs_data, list):
            raise ValueError("AI response is not a JSON array.")
        
        if len(recommended_jobs_data) == 0:
            raise ValueError("AI returned empty job list.")

        recommended_jobs = [RecommendedJob(**job) for job in recommended_jobs_data]
        print(f"✅ Successfully generated {len(recommended_jobs)} recommendations.")

    except json.JSONDecodeError as e:
        print(f"❌ JSON PARSE ERROR: {e}")
        print(f"Raw Response:\n{getattr(response, 'text', 'No response text available')}")
        raise HTTPException(status_code=500, detail="Failed to parse AI response as JSON.")
    except Exception as e:
        print(f"❌ ERROR generating recommendations: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to get recommendations from AI: {str(e)}")

    # --- Save Recommendations in Database ---
    recommendation_data = {
        "user_id": user_id,
        "recommended_jobs": [job.dict() for job in recommended_jobs],
        "generated_at": datetime.utcnow(),
    }

    await recommendations_collection.update_one(
        {"user_id": user_id}, {"$set": recommendation_data}, upsert=True
    )

    # --- Update user's job applications list ---
    await users_collection.update_one(
        {"_id": user_object_id},
        {
            "$set": {
                "job_applications": [
                    {"job_details": job.dict(), "status": "recommended", "updated_at": datetime.utcnow()}
                    for job in recommended_jobs
                ]
            }
        },
    )

    # --- Optional: Write to Google Sheets for Pro Users ---
    sheets_error = None
    if user_is_pro and user.get("sheets_enabled"):
        print(f"Writing recommendations to Google Sheets for user {user_id}...")
        success = await write_to_sheet(user_id, [job.dict() for job in recommended_jobs])
        if not success:
            sheets_error = f"Failed to write to Google Sheets for user {user_id}."

    return {"recommendation_data": recommendation_data, "sheets_error": sheets_error}