import os
import requests
import logging
from typing import List, Dict
from dotenv import load_dotenv

# Load environment variables
load_dotenv()
BACKEND_ENDPOINT = os.getenv("NEXT_PUBLIC_API_URL", "").rstrip("/")

if not BACKEND_ENDPOINT:
    logging.error("NEXT_PUBLIC_API_URL environment variable not set.")
    exit(1)

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

TCS_API_URL = os.getenv("TCS_API_URL")

if not TCS_API_URL:
    logging.error("TCS_API_URL environment variable not set.")
    exit(1)

HEADERS = {
    "Content-Type": "application/json", 
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Accept": "application/json, text/plain, */*",
    "Origin": "https://ibegin.tcsapps.com",
    "Referer": "https://ibegin.tcsapps.com/candidate/"
}

# Multiple search terms to get more diverse jobs
SEARCH_TERMS = ["developer", "engineer", "software", "analyst"]

def fetch_tcs_jobs() -> List[Dict]:
    logging.info("Fetching TCS job listings from API...")
    all_jobs = []
    seen_ids = set()
    
    for term in SEARCH_TERMS:
        try:
            payload = {
                "jobCity": "",
                "jobFunction": "",
                "jobExperience": "",
                "jobSkill": None,
                "pageNumber": "1",
                "userText": term,
                "jobTitleOrder": None,
                "jobCityOrder": None,
                "jobFunctionOrder": None,
                "jobExperienceOrder": None,
                "applyByOrder": None,
                "regular": True,
                "walkin": True
            }
            resp = requests.post(TCS_API_URL, headers=HEADERS, json=payload)
            resp.raise_for_status()
            data = resp.json()
            jobs = data.get("data", {}).get("jobs", [])
            
            for job in jobs:
                job_id = job.get("id")
                if job_id and job_id not in seen_ids:
                    seen_ids.add(job_id)
                    all_jobs.append(job)
            
            logging.info(f"Search '{term}': found {len(jobs)} jobs, {len(all_jobs)} total unique")
        except requests.exceptions.RequestException as e:
            logging.error(f"TCS API fetch error for '{term}': {e}")
    
    return all_jobs[:60]  # Return up to 60 unique jobs

def scrape_tcs():
    jobs = fetch_tcs_jobs()
    if not jobs:
        logging.warning("No TCS jobs found or an error occurred.")
        return
        
    logging.info(f"Found {len(jobs)} TCS jobs. Posting to backend...")
    
    # Import experience extraction utility
    from experience_utils import extract_experience_from_text

    for i, job in enumerate(jobs, start=1):
        title = job.get("jobTitle", "N/A")
        location = job.get("location", "N/A")
        job_id = job.get("id")
        
        job_url = f"https://ibegin.tcsapps.com/candidate/job/{job_id}" if job_id else "Not available"
        
        experience = job.get("experience", "N/A")
        skills = job.get("skills", "N/A")
        description = f"Experience: {experience} years. Skills: {skills}"
        
        # Parse experience from API field
        experience_required = None
        experience_min_years = None
        
        if experience and experience != "N/A":
            try:
                # TCS API returns experience as a string like "3-5" or "3"
                experience_required = f"{experience} years"
                # Extract minimum years
                if "-" in str(experience):
                    experience_min_years = int(str(experience).split("-")[0])
                else:
                    experience_min_years = int(experience)
            except (ValueError, TypeError):
                experience_required, experience_min_years = extract_experience_from_text(str(experience))
        
        # Fallback to parsing from title
        if experience_min_years is None:
            experience_required, experience_min_years = extract_experience_from_text(title)

        payload = {
            "title": title,
            "company": "TCS",
            "location": location,
            "job_url": job_url,
            "description": description,
            "experience_required": experience_required,
            "experience_min_years": experience_min_years
        }

        logging.info(f"[{i}] {title} at {location} — Exp: {experience_required} ({experience_min_years} yrs)")
        try:
            url = f"{BACKEND_ENDPOINT}/jobs"
            post_resp = requests.post(url, json=payload, timeout=30)
            post_resp.raise_for_status()
            logging.info(f"Successfully posted job '{title}' to backend.")
        except requests.exceptions.RequestException as e:
            logging.error(f"Failed posting job '{title}': {e}")

if __name__ == "__main__":
    scrape_tcs()