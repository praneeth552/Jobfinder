import os
import requests
import logging
from dotenv import load_dotenv

# Load environment variables
load_dotenv()
BACKEND_ENDPOINT = os.getenv("NEXT_PUBLIC_API_URL")

if not BACKEND_ENDPOINT:
    logging.error("NEXT_PUBLIC_API_URL environment variable not set.")
    exit(1)

# Setup logging
logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s")

def scrape_intel():
    logging.info("Fetching INTEL job listings from API.")

    API_URL = "https://intel.wd1.myworkdayjobs.com/wday/cxs/intel/External/jobs"
    
    try:
        # Simple request matching curl - minimal headers
        headers = {"Content-Type": "application/json", "Accept": "application/json"}
        payload = {"appliedFacets": {}, "limit": 50, "offset": 0, "searchText": ""}
        
        response = requests.post(API_URL, headers=headers, json=payload, timeout=30)
        response.raise_for_status()
        data = response.json()
        jobs = data.get("jobPostings", [])[:50]
        logging.info(f"Successfully fetched {len(jobs)} Intel jobs (total: {data.get('total', 0)})")

    except Exception as e:
        logging.error(f"Failed to fetch data from INTEL API: {e}")
        return

    logging.info(f"Processing {len(jobs)} jobs...")

    for index, job in enumerate(jobs, start=1):
        title = job.get("title", "N/A")
        location = job.get("locationsText", "N/A")
        external_path = job.get("externalPath", "")
        
        if external_path:
            job_url = f"https://intel.wd1.myworkdayjobs.com/en-US/External{external_path}"
        else:
            job_url = "Not available"

        # Placeholder for description as it's not in the list view
        description = "Full description available on the job page."

        payload = {
            "title": title,
            "company": "Intel",
            "location": location,
            "job_url": job_url,
            "description": description
        }

        logging.info(f"[{index}] {title} | {location} | {job_url}")

        # Push to backend
        try:
            backend_response = requests.post(f"{BACKEND_ENDPOINT}/jobs/", json=payload)
            backend_response.raise_for_status()
            logging.info(f"Successfully sent job '{title}' to backend.")
        except requests.exceptions.RequestException as e:
            logging.error(f"Error sending job '{title}' to backend: {e}")

    logging.info("Intel scraping completed successfully.")

if __name__ == "__main__":
    scrape_intel()
