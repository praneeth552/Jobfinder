from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from bson import ObjectId
from models import UserPreferences
from database import db
from utils import get_current_user
from email_utils import send_email
import json
import tempfile
import os
import re
import spacy
import docx2txt
from pdfminer.high_level import extract_text

# Load the spaCy model
nlp = spacy.load("en_core_web_sm")

# --- Constants for Parsing ---
SKILLS_DB = [
    'javascript', 'typescript', 'python', 'java', 'c#', 'go', 'rust', 'php', 'ruby', 'swift', 'kotlin', 'c++', 'elixir',
    'react', 'reactjs', 'next.js', 'angular', 'vue.js', 'svelte', 'html5', 'css3', 'sass', 'scss', 'tailwind', 'tailwindcss', 'bootstrap', 'redux', 'zustand', 'graphql', 'apollo', 'webpack', 'vite',
    'node.js', 'express', 'expressjs', 'django', 'flask', 'fastapi', 'spring boot', '.net', 'ruby on rails', 'laravel', 'phoenix',
    'mongodb', 'mysql', 'postgresql', 'sqlite', 'redis', 'dynamodb', 'cassandra', 'firebase', 'supabase', 'prisma', 'sqlalchemy',
    'react native', 'flutter', 'swiftui', 'jetpack compose',
    'pytorch', 'tensorflow', 'scikit-learn', 'pandas', 'numpy', 'jupyter', 'langchain', 'llms', 'nlp', 'spark', 'kafka', 'hadoop',
    'docker', 'kubernetes', 'aws', 'azure', 'gcp', 'vercel', 'heroku', 'terraform', 'ansible', 'jenkins', 'github actions', 'ci/cd',
    'git', 'rest api', 'grpc', 'websockets', 'cybersecurity', 'three.js', 'webrtc', 'solidity'
]
EMAIL_REGEX = r"[\w\.-]+@[\w\.-]+\.\w+"
PHONE_REGEX = r"(\(?\d{3}\)?[\s\.-]?)?\d{3}[\s\.-]?\d{4}"
EDUCATION_KEYWORDS = ['B.E', 'B.Tech', 'M.Tech', 'M.S', 'B.Sc', 'M.Sc', 'BCA', 'MCA', 'Bachelor', 'Master', 'PhD', 'Degree']
MONTHS = r'(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec|January|February|March|April|May|June|July|August|September|October|November|December)'
DATE_RANGE_REGEX = r'(' + MONTHS + r'\s+\d{4})\s*-\s*(' + MONTHS + r'\s+\d{4}|Present|Current)'

router = APIRouter()

# --- Database Collections ---
users_collection = db["users"]
resumes_collection = db["resumes"]

# --- Helper Functions ---
def extract_text_from_file(file_path, extension):
    try:
        if extension == ".pdf":
            return extract_text(file_path)
        elif extension == ".docx":
            return docx2txt.process(file_path)
        else:
            with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
                return f.read()
    except Exception as e:
        print(f"Error extracting text from {file_path}: {e}")
        return ""

def parse_experience(text_block):
    experiences = []
    # Split by newline and filter out empty lines
    lines = [line.strip() for line in text_block.split('\n') if line.strip()]
    
    # Regex to identify a potential job title line (often followed by company)
    job_title_regex = r'([A-Z][a-z\s]+ (?:Engineer|Developer|Analyst|Architect|Manager|Lead|Specialist))'
    
    current_exp = {}
    for i, line in enumerate(lines):
        # Try to find dates
        dates_match = re.search(DATE_RANGE_REGEX, line, re.IGNORECASE)
        if dates_match:
            if 'dates' not in current_exp:
                current_exp['dates'] = dates_match.group(0)

        # Try to find a job title
        title_match = re.search(job_title_regex, line, re.IGNORECASE)
        if title_match:
            # If we find a new title and the current_exp has details, save it
            if current_exp.get('title') or current_exp.get('company'):
                if current_exp: experiences.append(current_exp)
                current_exp = {} # Start a new one
            current_exp['title'] = title_match.group(1).strip()
            # Often the company is on the next line or same line
            if i + 1 < len(lines) and not re.search(job_title_regex, lines[i+1], re.IGNORECASE):
                 current_exp['company'] = lines[i+1] # A simple heuristic
        
        # Simple description grab
        if current_exp.get('title') and 'description' not in current_exp:
            current_exp['description'] = line

    if current_exp: # Add the last one
        experiences.append(current_exp)
        
    return experiences


def comprehensive_parse_resume(text):
    # 1. Basic Info
    name = re.search(r'^([A-Za-z\s]+)', text, re.MULTILINE).group(1).strip() if re.search(r'^([A-Za-z\s]+)', text, re.MULTILINE) else None
    email = re.search(EMAIL_REGEX, text).group(0) if re.search(EMAIL_REGEX, text) else None
    phone = re.search(PHONE_REGEX, text).group(0) if re.search(PHONE_REGEX, text) else None

    # 2. Skills
    skills = list(set([skill for skill in SKILLS_DB if re.search(r'\b' + skill + r'\b', text, re.IGNORECASE)]))

    # 3. Section Splitting (Experience & Education)
    experience_text = ""
    education_text = ""
    
    exp_match = re.search(r'(?i)(work experience|experience|employment history)([\s\S]*?)(education|skills|projects)', text)
    if exp_match:
        experience_text = exp_match.group(2)

    edu_match = re.search(r'(?i)(education|academic background)([\s\S]*?)(skills|experience|projects)', text)
    if edu_match:
        education_text = edu_match.group(2)

    # 4. Parse Experience Section
    experiences = parse_experience(experience_text)
    
    # 5. Parse Education Section
    education_details = []
    for line in education_text.split('\n'):
        if any(keyword in line for keyword in EDUCATION_KEYWORDS):
            education_details.append(line.strip())

    # 6. Get roles from experience titles
    roles = [exp['title'] for exp in experiences if 'title' in exp]

    return {
        "name": name,
        "email": email,
        "phone": phone,
        "skills": list(set(skills))[:25],
        "education": list(set(education_details))[:5],
        "roles": list(set(roles))[:5],
        "experience": experiences[:5] # New detailed experience field
    }

# (format_preferences_for_email remains the same)

# --- API Endpoints ---

from datetime import datetime, timedelta

# (the rest of the imports)

# --- Constants for Rate Limiting ---
FREE_PLAN_UPLOAD_INTERVAL = timedelta(days=30)
PRO_PLAN_UPLOAD_INTERVAL = timedelta(days=7)

# (the rest of the file)

@router.post("/parse-resume")
async def parse_resume(file: UploadFile = File(...), current_user: dict = Depends(get_current_user)):
    user = await users_collection.find_one({"_id": ObjectId(current_user["_id"])})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # Rate Limiting Logic
    plan_type = user.get("plan_type", "free")
    last_upload = user.get("last_resume_upload")
    now = datetime.utcnow()

    if last_upload:
        interval = FREE_PLAN_UPLOAD_INTERVAL if plan_type == "free" else PRO_PLAN_UPLOAD_INTERVAL
        time_since_upload = now - last_upload
        
        if time_since_upload < interval:
            time_remaining = interval - time_since_upload
            days = time_remaining.days
            hours, remainder = divmod(time_remaining.seconds, 3600)
            minutes, seconds = divmod(remainder, 60)
            
            error_detail = {
                "message": f"You can upload a new resume in {days}d {hours}h {minutes}m.",
                "time_remaining": {
                    "days": days,
                    "hours": hours,
                    "minutes": minutes,
                    "seconds": int(seconds)
                }
            }
            raise HTTPException(status_code=429, detail=error_detail)

    # (rest of the function remains the same)
    suffix = os.path.splitext(file.filename)[1]
    with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as tmp:
        tmp.write(await file.read())
        tmp_path = tmp.name
    try:
        text = extract_text_from_file(tmp_path, suffix)
        if not text:
            raise HTTPException(status_code=400, detail="Could not extract text from the uploaded file.")
        parsed_data = comprehensive_parse_resume(text)
        return parsed_data
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to parse resume: {str(e)}")
    finally:
        os.unlink(tmp_path)

@router.post("/confirm-upload")
async def confirm_upload(current_user: dict = Depends(get_current_user)):
    """
    Confirms that the user has accepted the parsed resume data,
    updating their last upload timestamp.
    """
    await users_collection.update_one(
        {"_id": ObjectId(current_user["_id"])},
        {"$set": {"last_resume_upload": datetime.utcnow()}}
    )
    return {"message": "Resume upload confirmed successfully."}


# (The rest of the endpoints: save-resume, update-from-resume, save_preferences, get_preferences remain the same)
from pydantic import BaseModel
class ResumeSaveRequest(BaseModel):
    shouldSaveToProfile: bool
    resumeData: dict

@router.post("/save-resume")
async def save_resume_data(request: ResumeSaveRequest, current_user: dict = Depends(get_current_user)):
    if request.shouldSaveToProfile:
        user_id = current_user["_id"]
        result = await resumes_collection.update_one(
            {"user_id": ObjectId(user_id)},
            {"$set": {**request.resumeData, "user_id": ObjectId(user_id)}},
            upsert=True
        )
        if result.upserted_id or result.modified_count > 0:
            return {"message": "Resume data saved successfully."}
        raise HTTPException(status_code=500, detail="Failed to save resume data.")
    else:
        # Just acknowledge the request without saving
        return {"message": "Resume data not saved as per user preference."}

@router.post("/update-from-resume")
async def update_preferences_from_resume(parsed_preferences: dict, current_user: dict = Depends(get_current_user)):
    email = current_user["email"]
    user_data = await users_collection.find_one({"email": email})
    if not user_data:
        raise HTTPException(status_code=404, detail="User not found")
    old_preferences = user_data.get("preferences", {})
    new_preferences = old_preferences.copy()
    new_preferences['role'] = list(set((new_preferences.get('role', []) or []) + (parsed_preferences.get('roles', []) or [])))
    new_preferences['tech_stack'] = list(set((new_preferences.get('tech_stack', []) or []) + (parsed_preferences.get('skills', []) or [])))
    await users_collection.update_one(
        {"email": email},
        {"$set": {"preferences": new_preferences, "is_first_time_user": False}}
    )
    return {"message": "Preferences updated successfully from resume"}

@router.post("")
async def save_preferences(preferences: UserPreferences, current_user: dict = Depends(get_current_user)):
    email = current_user["email"]
    user_data = await users_collection.find_one({"email": email})
    if not user_data: raise HTTPException(status_code=404, detail="User not found")
    new_preferences_dict = preferences.dict()
    await users_collection.update_one(
        {"email": email},
        {"$set": {"preferences": new_preferences_dict, "is_first_time_user": False}}
    )
    return {"message": "Preferences saved successfully"}

@router.get("")
async def get_preferences(current_user: dict = Depends(get_current_user)):
    email = current_user["email"]
    user = await users_collection.find_one({"email": email})
    if not user: raise HTTPException(status_code=404, detail="User not found")
    return user.get("preferences", {})