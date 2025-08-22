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

EMAIL_REGEX = r"[\w\.-]+@[\w\.-]+\.\w+"
PHONE_REGEX = r"\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}"
EDUCATION_KEYWORDS = ['B.E', 'B.Tech', 'M.Tech', 'M.S', 'B.Sc', 'M.Sc', 'BCA', 'MCA', 'Bachelor', 'Master', 'PhD', 'Degree']

# Fixed regex patterns - no nested grouping issues
MONTHS = r'(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec|January|February|March|April|May|June|July|August|September|October|November|December)'
DATE_RANGE_REGEX = rf'({MONTHS}\s+\d{{4}})\s*-\s*({MONTHS}\s+\d{{4}}|Present|Current)'

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
    import logging

    # Configure logging
    logging.basicConfig(level=logging.INFO)
    logger = logging.getLogger(__name__)

    # --- Point NLTK to the bundled data directory ---
    # The 'nltk_data' directory should be at the root of the Lambda package
    NLTK_DATA_PATH = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'nltk_data'))
    
    # Alternative paths to try
    possible_paths = [
        NLTK_DATA_PATH,
        os.path.join(os.path.dirname(__file__), 'nltk_data'),  # Same directory
        '/opt/nltk_data',  # Lambda layer path
        './nltk_data'      # Current working directory
    ]
    
    nltk_path_found = False
    for path in possible_paths:
        if os.path.exists(path):
            if path not in nltk.data.path:
                nltk.data.path.insert(0, path)  # Insert at beginning for priority
            logger.info(f"NLTK data path found and added: {path}")
            nltk_path_found = True
            break
    
    if not nltk_path_found:
        logger.warning("NLTK data directory not found in any expected location")
        logger.info(f"Current working directory: {os.getcwd()}")
        logger.info(f"Script directory: {os.path.dirname(__file__)}")

    # Test regex compilation
    try:
        re.compile(DATE_RANGE_REGEX)
        logger.info("Date range regex compiled successfully")
    except re.error as e:
        logger.error(f"Date range regex compilation failed: {e}")
        raise

    # Load spacy model with error handling
    try:
        nlp = spacy.load('en_core_web_sm')
        logger.info("Spacy model loaded successfully")
    except OSError as e:
        logger.error(f"Failed to load spacy model: {e}")
        # Create a dummy nlp object that doesn't break the code
        nlp = None

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
            logger.error(f"Error extracting text from {file_path}: {e}")
            return ""

    def parse_experience(text_block):
        experiences = []
        if not text_block.strip():
            return experiences
            
        # Split by newline and filter out empty lines
        lines = [line.strip() for line in text_block.split('\n') if line.strip()]
        
        # Fixed regex pattern for job titles
        job_title_regex = r'([A-Z][a-zA-Z\s]+ (?:Engineer|Developer|Analyst|Architect|Manager|Lead|Specialist))'
        
        current_exp = {}
        for i, line in enumerate(lines):
            try:
                # Try to find dates using the fixed regex
                dates_match = re.search(DATE_RANGE_REGEX, line, re.IGNORECASE)
                if dates_match:
                    if 'dates' not in current_exp:
                        current_exp['dates'] = dates_match.group(0)

                # Try to find a job title
                title_match = re.search(job_title_regex, line, re.IGNORECASE)
                if title_match:
                    # If we find a new title and the current_exp has details, save it
                    if current_exp.get('title') or current_exp.get('company'):
                        if current_exp: 
                            experiences.append(current_exp)
                        current_exp = {}  # Start a new one
                    current_exp['title'] = title_match.group(1).strip()
                    # Often the company is on the next line or same line
                    if i + 1 < len(lines) and not re.search(job_title_regex, lines[i+1], re.IGNORECASE):
                         current_exp['company'] = lines[i+1]  # A simple heuristic
                
                # Simple description grab
                if current_exp.get('title') and 'description' not in current_exp:
                    current_exp['description'] = line
                    
            except re.error as e:
                logger.error(f"Regex error in parse_experience: {e}")
                continue

        if current_exp:  # Add the last one
            experiences.append(current_exp)
            
        return experiences

    def comprehensive_parse_resume(text):
        try:
            # 1. Basic Info with improved name extraction
            name_match = re.search(r'^([A-Za-z\s]{2,50})', text.strip(), re.MULTILINE)
            name = name_match.group(1).strip() if name_match else None
            
            email_match = re.search(EMAIL_REGEX, text)
            email = email_match.group(0) if email_match else None
            
            phone_match = re.search(PHONE_REGEX, text)
            phone = phone_match.group(0) if phone_match else None

            # 2. Skills - safer skill matching
            skills = []
            text_lower = text.lower()
            for skill in SKILLS_DB:
                # Use word boundaries for more precise matching
                if re.search(rf'\b{re.escape(skill.lower())}\b', text_lower):
                    skills.append(skill)
            
            skills = list(set(skills))

            # 3. Section Splitting (Experience & Education)
            experience_text = ""
            education_text = ""
            
            # More flexible section matching
            exp_patterns = [
                r'(?i)(work experience|experience|employment history)([\s\S]*?)(?=education|skills|projects|$)',
                r'(?i)(professional experience)([\s\S]*?)(?=education|skills|projects|$)',
                r'(?i)(career history)([\s\S]*?)(?=education|skills|projects|$)'
            ]
            
            for pattern in exp_patterns:
                exp_match = re.search(pattern, text)
                if exp_match:
                    experience_text = exp_match.group(2)
                    break

            edu_patterns = [
                r'(?i)(education|academic background)([\s\S]*?)(?=skills|experience|projects|$)',
                r'(?i)(educational background)([\s\S]*?)(?=skills|experience|projects|$)'
            ]
            
            for pattern in edu_patterns:
                edu_match = re.search(pattern, text)
                if edu_match:
                    education_text = edu_match.group(2)
                    break

            # 4. Parse Experience Section
            experiences = parse_experience(experience_text)
            
            # 5. Parse Education Section
            education_details = []
            if education_text:
                for line in education_text.split('\n'):
                    line = line.strip()
                    if line and any(keyword.lower() in line.lower() for keyword in EDUCATION_KEYWORDS):
                        education_details.append(line)

            # 6. Get roles from experience titles
            roles = []
            for exp in experiences:
                if exp.get('title'):
                    roles.append(exp['title'])

            return {
                "name": name,
                "email": email,
                "phone": phone,
                "skills": list(set(skills))[:25],
                "education": list(set(education_details))[:5],
                "roles": list(set(roles))[:5],
                "experience": experiences[:5]
            }
            
        except Exception as e:
            logger.error(f"Error in comprehensive_parse_resume: {e}")
            # Return basic structure even if parsing fails
            return {
                "name": None,
                "email": None,
                "phone": None,
                "skills": [],
                "education": [],
                "roles": [],
                "experience": []
            }

    return extract_text_from_file, comprehensive_parse_resume, nlp


@router.post("/parse-resume")
async def parse_resume(file: UploadFile = File(...), current_user: dict = Depends(get_current_user)):
    # Lazily load all parsing logic and dependencies
    try:
        extract_text_from_file, comprehensive_parse_resume, nlp = _get_parsing_helpers()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to initialize parsing components: {str(e)}")

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

    suffix = os.path.splitext(file.filename)[1].lower()
    with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as tmp:
        tmp.write(await file.read())
        tmp_path = tmp.name
        
    try:
        text = extract_text_from_file(tmp_path, suffix)
        if not text or not text.strip():
            raise HTTPException(status_code=400, detail="Could not extract text from the uploaded file.")
        
        parsed_data = comprehensive_parse_resume(text)
        
        return parsed_data
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to parse resume: {str(e)}")
    finally:
        try:
            os.unlink(tmp_path)
        except:
            pass  # Ignore cleanup errors

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