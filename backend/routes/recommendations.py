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
from encryption import decrypt_field

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
GEMINI_MODEL_NAME = "gemini-flash-latest"  # Keep original working model
GENERATION_CONFIG = {
    "temperature": 0.5,  # Reduced for more consistent output
    "top_p": 0.9,
    "top_k": 40,
    "max_output_tokens": 8192,  # Increased to prevent JSON truncation
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
def build_prompt(user_profile, jobs, job_count: int):
    """Build the prompt for the AI model.
    
    Args:
        user_profile: User profile string with preferences and resume data
        jobs: List of pre-filtered jobs (already filtered for relevance)
        job_count: Number of jobs in the pre-filtered list
    """
    # Include prefilter score in job data for AI context
    for job in jobs:
        if "description" in job and job["description"]:
            job["description"] = job["description"][:250] + "..."
    jobs_data = [
        {
            "title": job.get("title"), 
            "company": str(job.get("company", "")),
            "location": job.get("location"),
            "description": job.get("description", "No description"), 
            "job_url": job.get("job_url"),
            "prefilter_relevance": job.get("_prefilter_score", 0),  # Include our relevance score
        } for job in jobs
    ]
    jobs_json = json.dumps(jobs_data, indent=2)
    
    # Calculate job counts based on available pool
    # For 100 pre-filtered jobs, aim for 10-20 recommendations
    min_jobs = min(10, max(8, job_count // 10))
    max_jobs = min(20, job_count // 5)

    return f"""You are a job-matching expert. Your task is to SELECT THE BEST matching jobs from this PRE-FILTERED pool.

IMPORTANT: These {job_count} jobs have ALREADY been filtered for basic relevance (location, role, tech stack). 
Your job is to RANK and SELECT the TOP {min_jobs}-{max_jobs} best matches.

# CANDIDATE PROFILE
{user_profile}

# PRE-FILTERED JOBS (Already filtered for relevance)
Each job includes a "prefilter_relevance" score (higher = better initial match)
{jobs_json}

# YOUR SCORING RULES (0-100)
Use this scoring to rank and select the best jobs:
- Role/Title alignment: +35 pts (exact role match or very similar)
- Skills overlap: +30 pts (multiple tech stack skills mentioned)
- Location match: +20 pts (city match or Remote if user wants remote)
- Experience alignment: +10 pts (seniority level matches)
- Job type match: +5 pts (Full-time, Internship, etc.)

# OUTPUT REQUIREMENTS
1. MUST return between {min_jobs} and {max_jobs} jobs as a JSON array
2. Select jobs with highest combined score (your score + prefilter_relevance)
3. Prefer variety: Maximum 2 jobs from the same company
4. Sort by match_score descending
5. For each job, provide a specific reason why it matches (mention skills, role, location)

# TIPS FOR SELECTION
- All these jobs are already somewhat relevant - focus on the BEST fits
- Higher prefilter_relevance generally means better match
- Give preference to jobs where the title closely matches candidate's desired role
- If candidate is a Fresher, prioritize entry-level and internship roles

Return ONLY a valid JSON array. No markdown, no backticks, no explanation text.

[
  {{
    "title": "Exact job title from the list",
    "company": "Exact company name from the list",
    "location": "Exact location from the list",
    "match_score": 85,
    "reason": "Specific reason: role matches, tech stack includes X/Y/Z, location preferred",
    "job_url": "Exact URL from the list"
  }}
]
"""



# --- Background Task ---
async def _run_recommendation_generation(user_id: str, task_id: str):
    print(f"DEBUG: Starting recommendation generation v3 for task {task_id}")
    await tasks_collection.update_one({"_id": task_id}, {"$set": {"status": "running", "progress": 10, "message": "Preparing your data...", "updated_at": datetime.utcnow()}})
    try:
        user_object_id = ObjectId(user_id)
        user = await users_collection.find_one({"_id": user_object_id})
        if not user:
            raise Exception("User not found")

        user_profile_parts = []
        resume_data = await resumes_collection.find_one({"user_id": user_object_id})
        if resume_data:
            user_profile_parts.append("RESUME:")
            # Decrypt name if it's encrypted (for Gemini prompt)
            resume_name = decrypt_field(resume_data.get("name", "")) if resume_data.get("name") else None
            if resume_name: user_profile_parts.append(f"Name: {resume_name}")
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
        
        # Fetch ALL jobs from database
        await tasks_collection.update_one({"_id": task_id}, {"$set": {"progress": 30, "message": "Pre-filtering jobs...", "updated_at": datetime.utcnow()}})
        all_jobs = await jobs_collection.find({}).to_list(length=None)
        if not all_jobs:
            raise Exception("No jobs found in the database")
        
        print(f"DEBUG: Fetched {len(all_jobs)} total jobs from database")
        
        # Pre-filter jobs based on user preferences - QUALITY-FOCUSED VERSION
        def pre_filter_jobs(jobs, prefs, resume):
            """
            Filter jobs using a tiered approach for QUALITY over quantity.
            
            Tier 1: Hard Filters (mandatory exclusions)
            Tier 2: Relevance Filters (at least one must match)
            Tier 3: Quality Scoring (rank by relevance)
            
            Returns top 100 most relevant jobs.
            """
            
            # === ROLE SYNONYMS MAPPING ===
            # Maps user-selected roles to related job title keywords
            ROLE_SYNONYMS = {
                "software engineer": ["software engineer", "software developer", "sde", "developer", "programmer", "coder"],
                "frontend developer": ["frontend developer", "front end developer", "frontend engineer", "front-end developer", "ui developer", "react developer", "angular developer", "vue developer", "web developer", "javascript developer"],
                "backend developer": ["backend developer", "back end developer", "backend engineer", "back-end developer", "server developer", "api developer", "node developer", "java developer", "python developer", "golang developer"],
                "fullstack developer": ["fullstack developer", "full stack developer", "full-stack developer", "fullstack engineer", "mern developer", "mean developer", "web developer"],
                "mobile app developer": ["mobile developer", "ios developer", "android developer", "react native developer", "flutter developer", "mobile app developer", "mobile engineer", "app developer"],
                "data scientist": ["data scientist", "data science", "machine learning", "ml engineer", "ai engineer", "data analyst", "analytics"],
                "machine learning engineer": ["machine learning engineer", "ml engineer", "ai engineer", "deep learning", "nlp engineer", "ai/ml"],
                "ai engineer": ["ai engineer", "artificial intelligence", "machine learning", "deep learning", "llm engineer", "generative ai"],
                "data analyst": ["data analyst", "business analyst", "analytics", "bi analyst", "reporting analyst"],
                "data engineer": ["data engineer", "etl developer", "data pipeline", "big data", "spark developer", "data platform"],
                "devops engineer": ["devops engineer", "devops", "platform engineer", "infrastructure engineer", "cloud engineer", "sre", "site reliability"],
                "cloud engineer": ["cloud engineer", "aws engineer", "azure engineer", "gcp engineer", "cloud architect", "cloud developer"],
                "site reliability engineer (sre)": ["sre", "site reliability", "reliability engineer", "platform engineer", "infrastructure"],
                "qa engineer": ["qa engineer", "quality assurance", "test engineer", "tester", "quality engineer", "qe"],
                "test automation engineer": ["automation engineer", "test automation", "sdet", "automation tester", "qa automation"],
                "ui/ux designer": ["ui designer", "ux designer", "ui/ux", "product designer", "visual designer", "interaction designer"],
                "product designer": ["product designer", "ux designer", "design lead", "senior designer"],
                "ux researcher": ["ux researcher", "user researcher", "design researcher", "usability"],
                "product manager": ["product manager", "pm", "product owner", "product lead"],
                "technical product manager": ["technical product manager", "tpm", "technical pm", "product manager"],
                "cybersecurity analyst": ["security analyst", "cybersecurity", "infosec", "security engineer", "soc analyst"],
                "security engineer": ["security engineer", "appsec", "application security", "infosec engineer", "devsecops"],
                "database administrator": ["dba", "database administrator", "database engineer", "db admin"],
                "systems administrator": ["systems administrator", "sysadmin", "system administrator", "it admin"],
                "business analyst": ["business analyst", "ba", "functional analyst", "requirements analyst"],
                "scrum master": ["scrum master", "agile coach", "agile master"],
                "project manager": ["project manager", "program manager", "delivery manager", "project lead"],
            }
            
            # === EXTRACT ALL PREFERENCES ===
            preferred_locations = [loc.lower().strip() for loc in prefs.get("location", [])]
            preferred_roles = [role.lower().strip() for role in prefs.get("role", [])]
            tech_stack = [tech.lower().strip() for tech in prefs.get("tech_stack", [])]
            exclude_keywords = [kw.lower().strip() for kw in prefs.get("exclude_keywords", [])]
            must_have_keywords = [kw.lower().strip() for kw in prefs.get("must_have_keywords", [])]
            job_types = [jt.lower().strip() for jt in prefs.get("job_type", [])]
            work_arrangements = [wa.lower().strip() for wa in prefs.get("work_arrangement", [])]
            experience_level = prefs.get("experience_level", "").lower().strip()
            seniority_level = prefs.get("seniority_level", "").lower().strip()
            role_type = prefs.get("role_type", "").lower().strip()
            
            # Primary skills (first 5) get higher weight
            primary_skills = tech_stack[:5] if len(tech_stack) >= 5 else tech_stack
            secondary_skills = tech_stack[5:] if len(tech_stack) > 5 else []
            
            # Expand roles with synonyms
            expanded_roles = set()
            for role in preferred_roles:
                expanded_roles.add(role)
                if role in ROLE_SYNONYMS:
                    expanded_roles.update(ROLE_SYNONYMS[role])
                # Also add partial matches
                for key, synonyms in ROLE_SYNONYMS.items():
                    if role in key or key in role:
                        expanded_roles.update(synonyms)
            expanded_roles = list(expanded_roles)
            
            # Add roles from resume if available
            if resume:
                for r in resume.get("roles", []):
                    r_lower = r.lower().strip()
                    expanded_roles.append(r_lower)
                    if r_lower in ROLE_SYNONYMS:
                        expanded_roles.extend(ROLE_SYNONYMS[r_lower])
            
            # Remote preference check
            user_wants_remote = any("remote" in loc for loc in preferred_locations) or \
                               any("remote" in wa for wa in work_arrangements)
            
            # City aliases for location matching
            city_aliases = {
                "bangalore": ["bengaluru", "blr", "bangalore"],
                "bengaluru": ["bangalore", "blr", "bengaluru"],
                "mumbai": ["bombay", "mumbai"],
                "chennai": ["madras", "chennai"],
                "kolkata": ["calcutta", "kolkata"],
                "delhi": ["new delhi", "ncr", "delhi", "delhi ncr"],
                "delhi ncr": ["new delhi", "ncr", "delhi", "gurgaon", "gurugram", "noida"],
                "hyderabad": ["hyd", "hyderabad"],
                "pune": ["pune"],
            }
            
            # Experience level to seniority mapping
            is_fresher = experience_level in ["fresher", "internship"] or "junior" in seniority_level
            is_senior = experience_level in ["5-7 years", "7-10 years", "10+ years"] or \
                       any(x in seniority_level for x in ["senior", "staff", "principal", "architect"])
            is_mid_level = experience_level in ["1-3 years", "3-5 years"] or "mid" in seniority_level
            
            filtered = []
            stats = {"total": 0, "excluded": 0, "seniority_mismatch": 0, "role_type_mismatch": 0, 
                    "no_relevance": 0, "must_have_missing": 0, "accepted": 0}
            
            for job in jobs:
                stats["total"] += 1
                title = (job.get("title") or "").lower()
                location = (job.get("location") or "").lower()
                description = (job.get("description") or "").lower()
                full_text = f"{title} {description}"
                
                # ============= TIER 1: HARD FILTERS =============
                
                # 1. Exclude keywords check (HARD FILTER)
                if exclude_keywords and any(kw in title or kw in description for kw in exclude_keywords):
                    stats["excluded"] += 1
                    continue
                
                # 2. Seniority mismatch check (HARD FILTER)
                is_senior_job = any(kw in title for kw in ["senior", "sr.", "sr ", "lead", "principal", "staff", "architect", "director", "head"])
                is_entry_job = any(kw in title for kw in ["fresher", "entry", "graduate", "intern", "trainee", "associate", "junior"])
                is_management_job = any(kw in title for kw in ["manager", "head", "director", "vp", "team lead", "engineering manager"])
                
                # Freshers should NOT see senior jobs
                if is_fresher and is_senior_job:
                    stats["seniority_mismatch"] += 1
                    continue
                
                # Seniors should NOT see entry/fresher jobs (unless they're actually senior roles)
                if is_senior and is_entry_job and not is_senior_job:
                    stats["seniority_mismatch"] += 1
                    continue
                
                # 2b. Experience years check (HARD FILTER using scraped data)
                # Map user experience level to maximum years they can apply for
                user_exp_map = {
                    "fresher": 1, "internship": 1, "1-3 years": 3, 
                    "3-5 years": 5, "5-7 years": 7, "7-10 years": 10, "10+ years": 15
                }
                user_max_years = user_exp_map.get(experience_level, 5)  # Default to mid-level
                
                job_min_years = job.get("experience_min_years")
                if job_min_years is not None:
                    # Allow applying to jobs requiring up to 1 year more than user has
                    if job_min_years > user_max_years + 1:
                        stats["seniority_mismatch"] += 1
                        continue
                
                # 3. Role type check - IC vs Management (HARD FILTER)
                if role_type:
                    if "individual contributor" in role_type and is_management_job:
                        stats["role_type_mismatch"] += 1
                        continue
                    # If user wants management roles, skip pure IC roles
                    if "management" in role_type and not is_management_job:
                        stats["role_type_mismatch"] += 1
                        continue
                
                # 4. Must-have keywords (HARD FILTER if specified)
                if must_have_keywords:
                    has_must_have = any(kw in title or kw in description for kw in must_have_keywords)
                    if not has_must_have:
                        stats["must_have_missing"] += 1
                        continue
                
                # ============= TIER 2: RELEVANCE FILTERS =============
                # Job must match at least ONE of: location, role, or have 2+ tech skills
                
                score = 0
                relevance_matched = False
                
                # Location match check (+5 points)
                remote_keywords = ["remote", "work from home", "wfh", "anywhere", "distributed", "remote-first"]
                is_remote_job = any(kw in location for kw in remote_keywords)
                
                if user_wants_remote and is_remote_job:
                    score += 5
                    relevance_matched = True
                elif preferred_locations:
                    for loc in preferred_locations:
                        city = loc.replace("remote", "").replace("(", "").replace(")", "").replace("india", "").replace("global", "").strip()
                        if city:
                            aliases = city_aliases.get(city, [city])
                            if any(alias in location for alias in aliases):
                                score += 5
                                relevance_matched = True
                                break
                
                # Role match check (+5 points for exact, +3 for synonym)
                role_match_score = 0
                for role in expanded_roles:
                    if role in title:
                        role_match_score = max(role_match_score, 5)
                        relevance_matched = True
                    elif any(word in title for word in role.split()):
                        role_match_score = max(role_match_score, 3)
                        relevance_matched = True
                score += role_match_score
                
                # Tech stack match check
                primary_matches = sum(1 for tech in primary_skills if tech in full_text)
                secondary_matches = sum(1 for tech in secondary_skills if tech in full_text)
                tech_score = (primary_matches * 3) + (secondary_matches * 1)
                
                if primary_matches >= 2 or (primary_matches >= 1 and secondary_matches >= 2):
                    relevance_matched = True
                
                score += min(tech_score, 15)  # Cap tech score at 15
                
                # If no relevance match at all, skip this job
                if not relevance_matched:
                    stats["no_relevance"] += 1
                    continue
                
                # ============= TIER 3: QUALITY SCORING =============
                
                # Job type bonus (+2 points)
                if job_types:
                    job_type_keywords = {
                        "full-time": ["full-time", "full time", "permanent", "fte"],
                        "part-time": ["part-time", "part time"],
                        "contract": ["contract", "contractor", "c2c", "freelance"],
                        "internship": ["intern", "internship", "trainee"]
                    }
                    for jt in job_types:
                        keywords = job_type_keywords.get(jt, [jt])
                        if any(kw in full_text for kw in keywords):
                            score += 2
                            break
                
                # Work arrangement bonus (+2 points)
                if work_arrangements:
                    if "remote" in work_arrangements and is_remote_job:
                        score += 2
                    elif "hybrid" in work_arrangements and "hybrid" in full_text:
                        score += 2
                    elif any(x in work_arrangements for x in ["on-site", "onsite"]) and not is_remote_job:
                        score += 2
                
                # Seniority alignment bonus (+3 points)
                if is_fresher and is_entry_job:
                    score += 3
                elif is_senior and is_senior_job:
                    score += 3
                elif is_mid_level and not is_entry_job and not is_senior_job:
                    score += 3
                
                # Add job to filtered list
                job["_prefilter_score"] = score
                job["_relevance_matched"] = True
                filtered.append(job)
                stats["accepted"] += 1
            
            # Log filtering stats
            print(f"DEBUG PRE-FILTER STATS: {stats}")
            print(f"DEBUG: Total jobs considered: {stats['total']}")
            print(f"DEBUG: Excluded by keywords: {stats['excluded']}")
            print(f"DEBUG: Seniority mismatch: {stats['seniority_mismatch']}")
            print(f"DEBUG: Role type mismatch: {stats['role_type_mismatch']}")
            print(f"DEBUG: Must-have missing: {stats['must_have_missing']}")
            print(f"DEBUG: No relevance match: {stats['no_relevance']}")
            print(f"DEBUG: Accepted jobs: {stats['accepted']}")
            
            # Sort by score and return top 100 most relevant jobs
            filtered.sort(key=lambda x: x.get("_prefilter_score", 0), reverse=True)
            
            # Return top 100 jobs (quality over quantity)
            return filtered[:100]
        
        # Apply pre-filtering
        jobs = pre_filter_jobs(all_jobs, preferences, resume_data)
        print(f"DEBUG: Pre-filtered to {len(jobs)} relevant jobs from {len(all_jobs)} total")
        
        # If pre-filter returns too few jobs, use broader criteria
        if len(jobs) < 50 and len(all_jobs) > 50:
            print(f"DEBUG: Pre-filter returned only {len(jobs)} jobs, adding more from general pool")
            # Add top jobs from general pool that weren't already included
            existing_urls = {j.get("job_url") for j in jobs}
            for job in all_jobs:
                if job.get("job_url") not in existing_urls:
                    job["_prefilter_score"] = 0
                    jobs.append(job)
                if len(jobs) >= 100:
                    break
            print(f"DEBUG: Expanded job pool to {len(jobs)} jobs")

        prompt = build_prompt(user_profile_string, jobs, len(jobs))
        await tasks_collection.update_one({"_id": task_id}, {"$set": {"progress": 60, "message": "Generating AI recommendations...", "updated_at": datetime.utcnow()}})
        model = genai.GenerativeModel(model_name=GEMINI_MODEL_NAME, generation_config=GENERATION_CONFIG, safety_settings=SAFETY_SETTINGS)
        
        # Retry logic for Gemini API
        max_retries = 2
        response = None
        for attempt in range(max_retries):
            try:
                response = await asyncio.to_thread(model.generate_content, prompt)
                if response.candidates and response.candidates[0].content.parts:
                    break
                print(f"DEBUG: Attempt {attempt+1} - Empty response, retrying...")
                await asyncio.sleep(2)  # Wait before retry
            except Exception as api_error:
                print(f"DEBUG: Attempt {attempt+1} - API error: {api_error}")
                if attempt < max_retries - 1:
                    await asyncio.sleep(2)
                else:
                    raise api_error

        if not response or not response.candidates or not response.candidates[0].content.parts:
            feedback = response.prompt_feedback if response and hasattr(response, 'prompt_feedback') else 'No feedback available'
            raise Exception(f"AI content filtering triggered after {max_retries} attempts. Feedback: {feedback}")

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
        
        # FALLBACK: If AI returned too few recommendations, supplement with pre-filtered jobs
        MIN_RECOMMENDATIONS = 10
        if len(recommended_jobs) < MIN_RECOMMENDATIONS and len(jobs) > len(recommended_jobs):
            print(f"DEBUG: AI only returned {len(recommended_jobs)} recommendations, adding fallback jobs")
            
            # Get URLs of jobs already recommended
            recommended_urls = {job.job_url for job in recommended_jobs if job.job_url}
            
            # Add pre-filtered jobs that weren't already recommended
            for job_data in jobs:
                if len(recommended_jobs) >= MIN_RECOMMENDATIONS:
                    break
                if job_data.get("job_url") not in recommended_urls:
                    # Create fallback job with pre-filter score
                    prefilter_score = job_data.get("_prefilter_score", 0)
                    match_score = min(40 + (prefilter_score * 5), 80)  # Convert to 0-100 scale
                    
                    fallback_job = RecommendedJob(
                        title=job_data.get("title", "Unknown Title"),
                        company=str(job_data.get("company", "Unknown Company")),
                        location=job_data.get("location", "Unknown Location"),
                        match_score=match_score,
                        reason=f"This role matches your preference for {', '.join(preferences.get('role', ['this field'])[:2])} positions.",
                        job_url=job_data.get("job_url")
                    )
                    recommended_jobs.append(fallback_job)
                    recommended_urls.add(job_data.get("job_url"))
            
            print(f"DEBUG: After fallback, now have {len(recommended_jobs)} recommendations")

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

        await tasks_collection.update_one({"_id": task_id}, {"$set": {"progress": 90, "message": "Syncing database...", "updated_at": datetime.utcnow()}})

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
            {"$set": {"status": "complete", "progress": 100, "message": "Done!", "result": {"count": len(recommended_jobs), "sheets_error": sheets_error}, "updated_at": datetime.utcnow()}}
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

    # Use asyncio.create_task instead of BackgroundTasks for Lambda compatibility
    # This runs in the same event loop and Lambda will wait for it
    asyncio.create_task(_run_recommendation_generation(user_id, task_id))
    
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
        "progress": task.get("progress", 0),
        "message": task.get("message", ""),
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
    Returns varied jobs from different companies for guest users to preview the platform.
    """
    try:
        # Get jobs grouped by company to ensure variety
        # First, get distinct companies and sample from each
        pipeline = [
            {"$group": {
                "_id": "$company",
                "jobs": {"$push": "$$ROOT"},
                "count": {"$sum": 1}
            }},
            {"$sample": {"size": 10}},  # Get 10 random companies
            {"$project": {
                "company": "$_id",
                "job": {"$arrayElemAt": ["$jobs", 0]}  # Take first job from each company
            }}
        ]
        
        company_jobs_cursor = jobs_collection.aggregate(pipeline)
        company_jobs = await company_jobs_cursor.to_list(10)
        
        demo_jobs = [item["job"] for item in company_jobs if item.get("job")]
        
        if not demo_jobs or len(demo_jobs) < 5:
            # Fallback: get varied jobs with limit per company
            pipeline_fallback = [
                {"$group": {
                    "_id": "$company",
                    "job": {"$first": "$$ROOT"}
                }},
                {"$limit": 10}
            ]
            fallback_cursor = jobs_collection.aggregate(pipeline_fallback)
            fallback_jobs = await fallback_cursor.to_list(10)
            demo_jobs = [item["job"] for item in fallback_jobs if item.get("job")]
        
        # Format jobs to match expected structure with varied match scores
        recommendations = []
        match_scores = [92, 88, 85, 83, 80, 78, 76, 74, 72, 70]
        demo_reasons = [
            "Strong match based on your technical skills and experience level.",
            "Great fit for your preferred location and role type.",
            "Excellent opportunity matching your career goals.",
            "Company culture aligns with your preferences.",
            "Role perfectly matches your skill set.",
            "Competitive package for your experience level.",
            "Growing team looking for talent like you.",
            "Remote-friendly role matching your work style.",
            "Industry leader with exciting projects.",
            "Great learning opportunities in this role."
        ]
        
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
                    "match_score": match_scores[idx] if idx < len(match_scores) else 75,
                    "reason": demo_reasons[idx] if idx < len(demo_reasons) else "Sample job recommendation for demo purposes. Sign up to get personalized matches!"
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
