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

# --- Load environment variables ---
load_dotenv()

router = APIRouter()

# --- Database Collections ---
users_collection = db["users"]
resumes_collection = db["resumes"]
recommendations_collection = db["recommendations"]
jobs_collection = db["jobs"]

# --- Configure Gemini ---
genai.configure(api_key=os.environ["GEMINI_API_KEY"])

# --- Model Configuration ---
# Stable, fast, and available models:
# "gemini-2.0-flash" → Recommended for production (fast + reliable)
# "gemini-2.0-pro" → More powerful, slower, may cost more
# "gemini-2.5-flash" → Future-ready (beta regions only)
GEMINI_MODEL_NAME = "gemini-2.5-flash"

GENERATION_CONFIG = {
    "temperature": 0.7,
    "top_p": 0.95,
    "top_k": 40,
    "max_output_tokens": 8192,
}

SAFETY_SETTINGS = {
    "HARM_CATEGORY_HARASSMENT": "BLOCK_ONLY_HIGH",
    "HARM_CATEGORY_HATE_SPEECH": "BLOCK_ONLY_HIGH",
    "HARM_CATEGORY_SEXUALLY_EXPLICIT": "BLOCK_ONLY_HIGH",
    "HARM_CATEGORY_DANGEROUS_CONTENT": "BLOCK_ONLY_HIGH",
}

# --- Helper Function to Build Prompt ---
def build_prompt(user_profile, jobs):
    """Constructs the prompt for the Gemini model."""
    for job in jobs:
        if "description" in job and job["description"]:
            job["description"] = job["description"][:500] + "..."

    prompt = f"""
You are an expert AI Job Recommendation Assistant.
Your task is to analyze a detailed user profile and a list of available jobs,
then return a ranked list of the most suitable job recommendations.

User Profile:
{user_profile}

Available Job Postings:
{json.dumps([
    {
        "title": job.get("title"),
        "company": job.get("company"),
        "location": job.get("location"),
        "description": job.get("description", "No description available"),
        "job_url": job.get("job_url"),
    }
    for job in jobs
], indent=2)}

Please provide a ranked list of the top 5–10 best matches.
For each job, include:
- title
- company
- location
- match_score (0–100)
- reason (why it’s a match)
- job_url

⚠️ IMPORTANT:
Return ONLY a valid JSON array. Do not include text or markdown before/after.
Example:
[
  {{
    "title": "...",
    "company": "...",
    "location": "...",
    "match_score": 92,
    "reason": "...",
    "job_url": "..."
  }}
]
"""
    return prompt


# --- Main Route: Generate Recommendations ---
@router.post("/generate_recommendations")
async def generate_recommendations(current_user: dict = Depends(get_current_user)):
    """Generates personalized job recommendations for the logged-in user."""
    user_id = current_user.get("_id")

    # --- Validate user ID ---
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

    # From resume (if available)
    resume_data = await resumes_collection.find_one({"user_id": user_object_id})
    if resume_data:
        user_profile_parts.append("--- From Resume ---")
        if resume_data.get("name"):
            user_profile_parts.append(f"Name: {resume_data['name']}")
        if resume_data.get("roles"):
            user_profile_parts.append(f"Desired Roles: {', '.join(resume_data['roles'])}")
        if resume_data.get("skills"):
            user_profile_parts.append(f"Skills: {', '.join(resume_data['skills'])}")
        if resume_data.get("experience_summary"):
            user_profile_parts.append(
                "Experience Summary:\n" + "\n".join(f"- {exp}" for exp in resume_data["experience_summary"])
            )
        if resume_data.get("education"):
            user_profile_parts.append(
                "Education:\n" + "\n".join(f"- {edu}" for edu in resume_data["education"])
            )

    # From user preferences
    preferences = user.get("preferences", {})
    if preferences:
        user_profile_parts.append("\n--- Additional Preferences ---")
        if preferences.get("role"):
            user_profile_parts.append(f"Roles: {', '.join(preferences['role'])}")
        if preferences.get("location"):
            user_profile_parts.append(f"Location: {', '.join(preferences['location'])}")
        if preferences.get("tech_stack"):
            user_profile_parts.append(f"Tech Stack: {', '.join(preferences['tech_stack'])}")
        if preferences.get("experience_level"):
            user_profile_parts.append(f"Experience Level: {preferences['experience_level']}")
        if preferences.get("company_size"):
            user_profile_parts.append(f"Company Size: {', '.join(preferences['company_size'])}")
        if preferences.get("job_type"):
            user_profile_parts.append(f"Job Type: {', '.join(preferences['job_type'])}")
        if preferences.get("work_arrangement"):
            user_profile_parts.append(f"Work Arrangement: {', '.join(preferences['work_arrangement'])}")

    if not user_profile_parts:
        raise HTTPException(status_code=400, detail="User has no resume data or preferences set.")

    user_profile_string = "\n".join(user_profile_parts)
    print(f"--- Generating Recommendations for User: {user_id} ---")
    print(f"Compiled User Profile:\n{user_profile_string}")

    # --- Fetch Jobs ---
    jobs = await jobs_collection.find({}).to_list(length=200)
    if not jobs:
        raise HTTPException(status_code=404, detail="No jobs found in the database")

    prompt = build_prompt(user_profile_string, jobs)

    # --- Generate Recommendations via Gemini ---
    try:
        print(f"Sending prompt to Gemini API using model: {GEMINI_MODEL_NAME}...")
        model = genai.GenerativeModel(
            model_name=GEMINI_MODEL_NAME,
            generation_config=GENERATION_CONFIG,
            safety_settings=SAFETY_SETTINGS,
        )

        response = model.generate_content(prompt)

        if not response.text:
            raise HTTPException(status_code=500, detail="Received empty response from Gemini API.")

        # Clean response
        cleaned_response_text = response.text.strip()
        if cleaned_response_text.startswith("```"):
            cleaned_response_text = cleaned_response_text.split("```")[1]
            if cleaned_response_text.startswith("json"):
                cleaned_response_text = cleaned_response_text[4:]
        cleaned_response_text = cleaned_response_text.strip()

        print(f"Cleaned Response (First 200 chars): {cleaned_response_text[:200]}...")
        recommended_jobs_data = json.loads(cleaned_response_text)

        if not isinstance(recommended_jobs_data, list):
            raise ValueError("AI response is not a JSON array.")

        recommended_jobs = [RecommendedJob(**job) for job in recommended_jobs_data]
        print(f"✅ Successfully generated {len(recommended_jobs)} recommendations.")

    except json.JSONDecodeError as e:
        print(f"❌ JSON PARSE ERROR: {e}")
        print(f"Raw Response:\n{response.text if 'response' in locals() else 'No response'}")
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

    # Update user’s job applications list
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

    # --- Optional: Write to Google Sheets (Pro Users Only) ---
    sheets_error = None
    if user_is_pro and user.get("sheets_enabled"):
        print(f"Writing recommendations to Google Sheets for user {user_id}...")
        success = await write_to_sheet(user_id, [job.dict() for job in recommended_jobs])
        if not success:
            sheets_error = f"Failed to write to Google Sheets for user {user_id}."

    return {"recommendation_data": recommendation_data, "sheets_error": sheets_error}


# --- Retrieve Existing Recommendations ---
@router.get("/recommendations")
async def get_recommendations(current_user: dict = Depends(get_current_user)):
    """Fetches the latest job recommendations for the current user."""
    user_id = current_user.get("_id")
    rec = await recommendations_collection.find_one({"user_id": user_id})

    if not rec:
        raise HTTPException(status_code=404, detail="No recommendations found. Please generate them first.")

    return {
        "recommended_jobs": rec.get("recommended_jobs", []),
        "generated_at": rec.get("generated_at"),
    }
