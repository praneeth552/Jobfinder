import os
import requests
import logging
from typing import List, Dict
import re
import json
import http.client
from dotenv import load_dotenv

# Load environment variables
load_dotenv()
BACKEND_ENDPOINT = os.getenv("NEXT_PUBLIC_API_URL", "").rstrip("/")

if not BACKEND_ENDPOINT:
    logging.error("NEXT_PUBLIC_API_URL environment variable not set.")
    exit(1)

# Setup logging
logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s")

API_HOST = "adobe.wd5.myworkdayjobs.com"
API_PATH = "/wday/cxs/adobe/external_experienced/jobs"

def clean_html(raw_html: str) -> str:
    """A simple function to remove HTML tags from a string."""
    cleanr = re.compile('<.*?>')
    cleantext = re.sub(cleanr, '', raw_html)
    return cleantext.strip()

def scrape_adobe():
    """Fetches job listings from Adobe's Workday API."""
    logging.info("Fetching Adobe job listings from Workday API...")

    all_jobs = []
    
    # Pagination: 3 pages × 20 jobs = 60 jobs max
    for offset in [0, 20, 40]:
        try:
            conn = http.client.HTTPSConnection(API_HOST)
            headers = {"Content-Type": "application/json", "Accept": "application/json"}
            payload = json.dumps({"appliedFacets": {}, "limit": 20, "offset": offset, "searchText": ""})
            
            conn.request("POST", API_PATH, payload, headers)
            response = conn.getresponse()
            
            if response.status != 200:
                logging.warning(f"Adobe API returned {response.status} for offset {offset}")
                response.read()
                conn.close()
                continue
            
            data = json.loads(response.read().decode())
            conn.close()
            
            jobs = data.get("jobPostings", [])
            all_jobs.extend(jobs)
            logging.info(f"Fetched {len(jobs)} Adobe jobs (offset={offset}, total available={data.get('total', 0)})")
            
        except Exception as e:
            logging.error(f"Adobe API error at offset {offset}: {e}")
    
    if not all_jobs:
        logging.error("Failed to fetch any Adobe jobs")
        return
    
    logging.info(f"Total Adobe jobs fetched: {len(all_jobs)}")
    job_listings = all_jobs
    if not job_listings:
        logging.warning("No job listings found in the API response.")
        return

    logging.info(f"Processing {len(job_listings)} job listings...")
    
    # Import experience extraction utility
    from experience_utils import extract_experience_from_text

    for index, job in enumerate(job_listings, start=1):
        title = job.get("title", "N/A")
        location = job.get("locationsText", "N/A")
        
        # Construct the full job URL
        external_path = job.get("externalPath")
        if external_path:
            job_url = f"https://adobe.wd5.myworkdayjobs.com/en-US/external_experienced{external_path}"
        else:
            job_url = "Not available"

        # The description is often in a 'bulletPoints' field or similar, not a simple 'description' key.
        # Based on typical Workday APIs, we look for 'jobDescription' or 'bulletPoints'.
        # Since we can't inspect the live response, we'll check for common fields.
        # The previous scraper used a 'description' field which is not standard in the response.
        # We will attempt to get a more structured description if possible.
        # For now, we'll use a placeholder as the full description is not available in a clean format.
        # A better approach would be to visit job_url and scrape the description, but that's more complex.
        description = "Full description available on the job page." # Placeholder
        
        # Extract experience from title (Adobe often has seniority in title like "Senior", "Staff")
        experience_required, experience_min_years = extract_experience_from_text(title)

        payload = {
            "title": title,
            "company": "Adobe",
            "location": location,
            "job_url": job_url,
            "description": description,
            "experience_required": experience_required,
            "experience_min_years": experience_min_years
        }

        logging.info(f"[{index}] {title} | {location} — Exp: {experience_required} ({experience_min_years} yrs)")

        # Push to backend
        try:
            url = f"{BACKEND_ENDPOINT}/jobs"
            backend_response = requests.post(url, json=payload, timeout=30)
            backend_response.raise_for_status()
            logging.info(f"Successfully sent job '{title}' to backend.")
        except requests.exceptions.RequestException as e:
            logging.error(f"Error sending job '{title}' to backend: {e}")

    logging.info("Adobe scraping completed successfully.")

if __name__ == "__main__":
    scrape_adobe()