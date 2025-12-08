import os
import requests
import logging
from typing import List, Dict
from bs4 import BeautifulSoup
from dotenv import load_dotenv

# Load environment variables
load_dotenv()
BACKEND_ENDPOINT = os.getenv("NEXT_PUBLIC_API_URL", "").rstrip("/")

if not BACKEND_ENDPOINT:
    logging.error("NEXT_PUBLIC_API_URL environment variable not set.")
    exit(1)

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

QUALCOMM_API_URL = "https://careers.qualcomm.com/api/apply/v2/jobs"
HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Accept": "application/json, text/plain, */*"
}

# Multiple search terms for more diverse jobs
SEARCH_TERMS = ["software", "engineer", "developer", "intern"]

def get_job_description(url: str) -> str:
    try:
        response = requests.get(url, headers=HEADERS, timeout=5)
        response.raise_for_status()
        soup = BeautifulSoup(response.content, 'html.parser')
        # Find the element containing the job description
        description_div = soup.find("div", class_="ats-description")
        return description_div.get_text(strip=True) if description_div else "Description not found."
    except requests.exceptions.RequestException as e:
        logging.error(f"Failed to fetch job description from {url}: {e}")
        return "Description not found."

def fetch_qualcomm_jobs() -> List[Dict]:
    logging.info("Fetching Qualcomm job listings from API...")
    all_jobs = []
    seen_ids = set()
    
    for term in SEARCH_TERMS:
        try:
            # Use keyword search parameter
            url = f"{QUALCOMM_API_URL}?domain=qualcomm.com&query={term}&limit=50"
            resp = requests.get(url, headers=HEADERS, timeout=15)
            resp.raise_for_status()
            data = resp.json()
            jobs = data.get("positions", [])
            
            for job in jobs:
                job_id = job.get("id", "")
                if job_id and job_id not in seen_ids:
                    seen_ids.add(job_id)
                    all_jobs.append(job)
            
            logging.info(f"Search '{term}': found {len(jobs)} jobs, {len(all_jobs)} total unique")
        except requests.exceptions.RequestException as e:
            logging.error(f"Qualcomm API fetch error for '{term}': {e}")
    
    return all_jobs[:60]  # Return up to 60 unique jobs

def scrape_qualcomm():
    jobs = fetch_qualcomm_jobs()
    if not jobs:
        logging.warning("No Qualcomm jobs found or an error occurred.")
        return
        
    logging.info(f"Found {len(jobs)} Qualcomm jobs. Posting to backend...")

    for i, job in enumerate(jobs, start=1):
        title = job.get("name", "N/A")
        location = job.get("location", "N/A")
        job_url = job.get("canonicalPositionUrl", "Not available")
        
        # Fetch the full job description from the job URL
        description = get_job_description(job_url)

        payload = {
            "title": title,
            "company": "Qualcomm",
            "location": location,
            "job_url": job_url,
            "description": description
        }

        logging.info(f"[{i}] {title} at {location} — {job_url}")
        try:
            url = f"{BACKEND_ENDPOINT}/jobs"
            post_resp = requests.post(url, json=payload, allow_redirects=False, timeout=30)
            if post_resp.status_code in (301, 302, 307, 308):
                logging.error(f"Redirect detected! Status: {post_resp.status_code}, Location: {post_resp.headers.get('Location', 'N/A')}")
                continue
            post_resp.raise_for_status()
            logging.info(f"Successfully posted job '{title}' to backend.")
        except requests.exceptions.RequestException as e:
            logging.error(f"Failed posting job '{title}': {e}")

if __name__ == "__main__":
    scrape_qualcomm()
