import os
import requests
import logging
import json
from dotenv import load_dotenv

# Load environment variables
load_dotenv()
BACKEND_ENDPOINT = os.getenv("NEXT_PUBLIC_API_URL", "").rstrip("/")

if not BACKEND_ENDPOINT:
    logging.error("NEXT_PUBLIC_API_URL environment variable not set.")
    exit(1)

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

DELOITTE_API_URL = os.getenv("DELOITTE_API_URL")

if not DELOITTE_API_URL:
    logging.error("DELOITTE_API_URL environment variable not set.")
    exit(1)

def scrape_deloitte():
    logging.info("Fetching Deloitte job listings from API...")
    try:
        resp = requests.get(DELOITTE_API_URL)
        resp.raise_for_status()
        data = resp.json()
        jobs = data.get("data", [])
        
        if not jobs:
            logging.warning("No Deloitte jobs found or an error occurred.")
            return
        
        logging.info(f"Found {len(jobs)} Deloitte jobs. Posting to backend...")
        
        # Import experience extraction utility
        from experience_utils import extract_experience_from_text

        for i, job in enumerate(jobs, start=1):
            translated_data = job.get("translated", {})
            title = translated_data.get("title", "N/A")
            description = translated_data.get("description", "N/A")
            job_url = translated_data.get("link", "Not available")
            
            locations = job.get("locations", [])
            location_str = "N/A"
            if locations and len(locations) > 0:
                location_str = locations[0].get("translated", {}).get("title", "N/A")
            
            # Extract experience from title and description
            experience_required, experience_min_years = extract_experience_from_text(title)
            
            if experience_min_years is None:
                experience_required, experience_min_years = extract_experience_from_text(description)

            payload = {
                "title": title,
                "company": "Deloitte",
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

    except requests.exceptions.RequestException as e:
        logging.error(f"Deloitte API fetch error: {e}")
        if e.response:
            logging.error(f"Response content: {e.response.text}")

    logging.info("Deloitte scraping completed.")

if __name__ == "__main__":
    scrape_deloitte()