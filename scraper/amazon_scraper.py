import asyncio
import requests
import logging
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()
BACKEND_ENDPOINT = os.getenv("NEXT_PUBLIC_API_URL", "").rstrip("/")

if not BACKEND_ENDPOINT:
    logging.error("NEXT_PUBLIC_API_URL environment variable not set.")
    exit(1)

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

BASE_URL = os.getenv("AMAZON_BASE_URL", "https://www.amazon.jobs")
SEARCH_URL = os.getenv("AMAZON_SEARCH_URL")

if not SEARCH_URL:
    logging.error("AMAZON_SEARCH_URL environment variable not set.")
    exit(1)

async def scrape_amazon_jobs():
    logging.info("Fetching Amazon job listings...")
    try:
        response = requests.get(SEARCH_URL)
        response.raise_for_status()
        data = response.json()
        jobs = data.get("jobs", [])
        logging.info(f"Found {len(jobs)} jobs. Processing each now...")
        
        # Import experience extraction utility
        from experience_utils import extract_experience_from_text

        for index, job in enumerate(jobs, start=1):
            title = job.get("title", "N/A")
            location = job.get("location", "N/A")
            job_url = f"{BASE_URL}{job.get('job_path', '')}"
            description = job.get("description", "N/A")
            
            # Check for basic_qualifications which often has experience info
            basic_qualifications = job.get("basic_qualifications", "")
            
            # Extract experience from description or qualifications
            experience_required, experience_min_years = extract_experience_from_text(basic_qualifications)
            
            if experience_min_years is None:
                experience_required, experience_min_years = extract_experience_from_text(description)
            
            if experience_min_years is None:
                experience_required, experience_min_years = extract_experience_from_text(title)

            payload = {
                "title": title,
                "company": "Amazon",
                "location": location,
                "job_url": job_url,
                "description": description,
                "experience_required": experience_required,
                "experience_min_years": experience_min_years
            }

            logging.info(f"[{index}] {title} | {location} — Exp: {experience_required} ({experience_min_years} yrs)")

            try:
                url = f"{BACKEND_ENDPOINT}/jobs"
                backend_response = requests.post(url, json=payload, timeout=30)
                backend_response.raise_for_status()
                logging.info(f"Successfully sent job '{title}' to backend.")
            except requests.exceptions.RequestException as e:
                logging.error(f"Error sending job '{title}' to backend: {e}")

    except requests.exceptions.RequestException as e:
        logging.error(f"Failed to fetch data from Amazon jobs API: {e}")

    logging.info("Amazon scraping completed successfully.")

if __name__ == "__main__":
    asyncio.run(scrape_amazon_jobs())