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

logging.info(f"Using backend endpoint: {BACKEND_ENDPOINT}")

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

ACCENTURE_API_URL = os.getenv("ACCENTURE_API_URL")

if not ACCENTURE_API_URL:
    logging.error("ACCENTURE_API_URL environment variable not set.")
    exit(1)

HEADERS = {
    'authority': 'www.accenture.com',
    'accept': '*/*',
    'accept-language': 'en-US,en;q=0.9,te;q=0.8',
    'origin': 'https://www.accenture.com',
    'referer': 'https://www.accenture.com/in-en/careers/jobsearch',
    'sec-ch-ua': '"Not)A;Brand";v="8", "Chromium";v="138", "Google Chrome";v="138"',
    'sec-ch-ua-mobile': '?0',
    'sec-ch-ua-platform': '"macOS"',
    'sec-fetch-dest': 'empty',
    'sec-fetch-mode': 'cors',
    'sec-fetch-site': 'same-origin',
    'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36',
}

PAYLOAD = {
    'startIndex': '0',
    'maxResultSize': '40',
    'jobKeyword': 'fresher OR intern OR trainee OR Software Engineer',
    'jobCountry': 'India',
    'jobLanguage': 'en',
    'countrySite': 'in-en',
    'sortBy': '2',
    'searchType': 'vectorSearch',
    'enableQueryBoost': 'true',
    'minScore': '0.6',
    'getFeedbackJudgmentEnabled': 'true',
    'useCleanEmbedding': 'true',
    'score': 'true',
    'totalHits': 'true',
    'debugQuery': 'false',
    'jobFilters': '[]'
}

def fetch_accenture_jobs() -> List[Dict]:
    logging.info("Fetching Accenture job listings from API...")
    try:
        resp = requests.post(ACCENTURE_API_URL, headers=HEADERS, data=PAYLOAD)
        resp.raise_for_status()
        data = resp.json()
        return data.get("data", [])[:50]
    except requests.exceptions.RequestException as e:
        logging.error(f"Accenture API fetch error: {e}")
        if e.response:
            logging.error(f"Response content: {e.response.text}")
        return []

def scrape_accenture():
    jobs = fetch_accenture_jobs()
    if not jobs:
        logging.warning("No Accenture jobs found or an error occurred.")
        return
        
    logging.info(f"Found {len(jobs)} Accenture jobs. Posting to backend...")
    
    # Import experience extraction utility
    from experience_utils import extract_experience_from_text

    for i, job in enumerate(jobs, start=1):
        title = job.get("title", "N/A")
        locations = job.get("location", [])
        location_str = ", ".join(locations) if locations else "N/A"
        
        job_url_template = job.get("jobDetailUrl", "")
        country_site = PAYLOAD.get('countrySite', 'in-en')
        job_url = f"https://www.accenture.com/{country_site}/careers/jobdetails?id={job.get('requisitionId', '')}_en&title={job.get('title', '')}" if job_url_template else "Not available"
        
        description = job.get("jobDescriptionClean", "N/A")
        
        # Extract experience from description and title
        experience_required, experience_min_years = extract_experience_from_text(description)
        
        # Also try from title if not found
        if experience_min_years is None:
            _, experience_min_years = extract_experience_from_text(title)
            if experience_min_years is not None:
                experience_required = f"{experience_min_years}+ years"

        payload = {
            "title": title,
            "company": "Accenture",
            "location": location_str,
            "job_url": job_url,
            "description": description,
            "experience_required": experience_required,
            "experience_min_years": experience_min_years
        }

        logging.info(f"[{i}] {title} at {location_str} — Exp: {experience_required} ({experience_min_years} yrs)")
        try:
            url = f"{BACKEND_ENDPOINT}/jobs"
            post_resp = requests.post(url, json=payload, timeout=30)
            post_resp.raise_for_status()
            logging.info(f"Successfully posted job '{title}' to backend.")
        except requests.exceptions.RequestException as e:
            logging.error(f"Failed posting job '{title}': {e}")

if __name__ == "__main__":
    scrape_accenture()
