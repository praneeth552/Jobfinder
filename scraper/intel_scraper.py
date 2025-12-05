import os
import requests
import logging
import json
import http.client
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

    API_HOST = "intel.wd1.myworkdayjobs.com"
    API_PATH = "/wday/cxs/intel/External/jobs"
    
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
                logging.warning(f"Intel API returned {response.status} for offset {offset}")
                response.read()
                conn.close()
                continue
            
            data = json.loads(response.read().decode())
            conn.close()
            
            jobs = data.get("jobPostings", [])
            all_jobs.extend(jobs)
            logging.info(f"Fetched {len(jobs)} Intel jobs (offset={offset}, total available={data.get('total', 0)})")
            
        except Exception as e:
            logging.error(f"Intel API error at offset {offset}: {e}")
    
    if not all_jobs:
        logging.error("Failed to fetch any Intel jobs")
        return
    
    jobs = all_jobs
    logging.info(f"Total Intel jobs fetched: {len(jobs)}. Processing...")

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
