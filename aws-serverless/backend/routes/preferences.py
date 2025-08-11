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
from datetime import datetime, timedelta

# No heavy imports at the top level

router = APIRouter()

# --- Database Collections ---
users_collection = db["users"]
resumes_collection = db["resumes"]

# --- Constants for Parsing (can stay at top level) ---
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
EMAIL_REGEX = r"[\w\.-]+@[\w\.-]+\\.\w+"
PHONE_REGEX = r"(\(?\d{3}\)?[\s\.-]?)?\d{3}[\s\.-]?\d{4}"
EDUCATION_KEYWORDS = ['B.E', 'B.Tech', 'M.Tech', 'M.S', 'B.Sc', 'M.Sc', 'BCA', 'MCA', 'Bachelor', 'Master', 'PhD', 'Degree']
MONTHS = r'(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec|January|February|March|April|May|June|July|August|September|October|November|December)'
DATE_RANGE_REGEX = r'(' + MONTHS + r'\s+\d{4})\s*-\s*(' + MONTHS + r'\s+\d{4}|Present|Current)'

# --- Constants for Rate Limiting ---
FREE_PLAN_UPLOAD_INTERVAL = timedelta(days=30)
PRO_PLAN_UPLOAD_INTERVAL = timedelta(days=7)

# --- Helper Functions for Resume Parsing (Lazy Loaded) ---
def _get_parsing_helpers():
    """Lazily imports and returns all necessary parsing functions and modules."""
    import docx2txt
    from pdfminer.high_level import extract_text
    import spacy
    import nltk

    # --- Download NLTK data to a writable directory in Lambda ---
    nltk_data_path = "/tmp/nltk_data"
    if not os.path.exists(nltk_data_path):
        os.makedirs(nltk_data_path)
    
    if nltk_data_path not in nltk.data.path:
        nltk.data.path.append(nltk_data_path)

    def download_nltk_data_if_needed(model_name, download_path):
        try:
            nltk.data.find(f'tokenizers/{model_name}', paths=[download_path])
        except LookupError:
            print(f"Downloading NLTK '{model_name}' to {download_path}...")
            nltk.download(model_name, download_dir=download_path)

    download_nltk_data_if_needed('punkt', nltk_data_path)
    download_nltk_data_if_needed('stopwords', nltk_data_path)

    # Load spacy model
    nlp = spacy.load('en_core_web_sm')

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
        lines = [line.strip() for line in text_block.split('\n') if line.strip()]
        job_title_regex = r'([A-Z][a-z\s]+ (?:Engineer|Developer|Analyst|Architect|Manager|Lead|Specialist))'
        
        current_exp = {}
        for i, line in enumerate(lines):
            dates_match = re.search(DATE_RANGE_REGEX, line, re.IGNORECASE)
            if dates_match:
                if 'dates' not in current_exp:
                    current_exp['dates'] = dates_match.group(0)

            title_match = re.search(job_title_regex, line, re.IGNORECASE)
            if title_match:
                if current_exp.get('title') or current_exp.get('company'):
                    if current_exp: experiences.append(current_exp)
                    current_exp = {}
                current_exp['title'] = title_match.group(1).strip()
                if i + 1 < len(lines) and not re.search(job_title_regex, lines[i+1], re.IGNORECASE):
                     current_exp['company'] = lines[i+1]
            
            if current_exp.get('title') and 'description' not in current_exp:
                current_exp['description'] = line

        if current_exp:
            experiences.append(current_exp)
            
        return experiences

    def comprehensive_parse_resume(text):
        name = re.search(r'^([A-Za-z\s]+)', text, re.MULTILINE).group(1).strip() if re.search(r'^([A-Za-z\s]+)', text, re.MULTILINE) else None
        email = re.search(EMAIL_REGEX, text).group(0) if re.search(EMAIL_REGEX, text) else None
        phone = re.search(PHONE_REGEX, text).group(0) if re.search(PHONE_REGEX, text) else None
        skills = list(set([skill for skill in SKILLS_DB if re.search(r'\b' + skill + r'\b', text, re.IGNORECASE)]))

        experience_text = ""
        education_text = ""
        
        exp_match = re.search(r'(?i)(work experience|experience|employment history)([\s\S]*?)(education|skills|projects)', text)
        if exp_match:
            experience_text = exp_match.group(2)

        edu_match = re.search(r'(?i)(education|academic background)([\s\S]*?)(skills|experience|projects)', text)
        if edu_match:
            education_text = edu_match.group(2)

        experiences = parse_experience(experience_text)
        
        education_details = []
        for line in education_text.split('\n'):
            if any(keyword in line for keyword in EDUCATION_KEYWORDS):
                education_details.append(line.strip())

        roles = [exp['title'] for exp in experiences if 'title' in exp]

        return {
            "name": name,
            "email": email,
            "phone": phone,
            "skills": list(set(skills))[:25],
            "education": list(set(education_details))[:5],
            "roles": list(set(roles))[:5],
            "experience": experiences[:5]
        }

    return extract_text_from_file, comprehensive_parse_resume, nlp

@router.post("/parse-resume")
async def parse_resume(file: UploadFile = File(...), current_user: dict = Depends(get_current_user)):
    # Lazily load all parsing logic and dependencies
    extract_text_from_file, comprehensive_parse_resume, nlp = _get_parsing_helpers()

    user = await users_collection.find_one({"_id": ObjectId(current_user["_id"])})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    plan_type = user.get("plan_type", "free")
    last_upload = user.get("last_resume_upload")
    now = datetime.utcnow()

    if last_upload:
        if plan_type == "free":
            if now - last_upload < FREE_PLAN_UPLOAD_INTERVAL:
                raise HTTPException(status_code=429, detail=f"Free users can upload a new resume once every {FREE_PLAN_UPLOAD_INTERVAL.days} days.")
        elif plan_type == "pro":
            if now - last_upload < PRO_PLAN_UPLOAD_INTERVAL:
                raise HTTPException(status_code=429, detail=f"Pro users can upload a new resume once every {PRO_PLAN_UPLOAD_INTERVAL.days} days.")

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

# --- Standard Endpoints (No NLP imports needed) ---

@router.get("")
async def get_preferences(current_user: dict = Depends(get_current_user)):
    email = current_user["email"]
    user = await users_collection.find_one({"email": email})
    if not user: 
        raise HTTPException(status_code=404, detail="User not found")
    return user.get("preferences", {})

@router.post("")
async def save_preferences(preferences: UserPreferences, current_user: dict = Depends(get_current_user)):
    email = current_user["email"]
    user_data = await users_collection.find_one({"email": email})
    if not user_data: 
        raise HTTPException(status_code=404, detail="User not found")
    new_preferences_dict = preferences.dict()
    await users_collection.update_one(
        {"email": email},
        {"$set": {"preferences": new_preferences_dict, "is_first_time_user": False}}
    )
    return {"message": "Preferences saved successfully"}

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

@router.post("/confirm-upload")
async def confirm_upload(current_user: dict = Depends(get_current_user)):
    await users_collection.update_one(
        {"_id": ObjectId(current_user["_id"])},
        {"$set": {"last_resume_upload": datetime.utcnow()}}
    )
    return {"message": "Resume upload confirmed successfully."}
