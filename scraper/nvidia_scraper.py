import os
import requests
import logging
from typing import List, Dict
import json
import http.client
from dotenv import load_dotenv

# Load environment variables
load_dotenv()
BACKEND_ENDPOINT = os.getenv("NEXT_PUBLIC_API_URL")

if not BACKEND_ENDPOINT:
    logging.error("NEXT_PUBLIC_API_URL environment variable not set.")
    exit(1)

logging.basicConfig(level=logging.INFO)

API_HOST = "nvidia.wd5.myworkdayjobs.com"
API_PATH = "/wday/cxs/nvidia/NVIDIAExternalCareerSite/jobs"

def fetch_nvidia_jobs() -> List[Dict]:
    logging.info("Fetching NVIDIA job listings from Workday API...")
    
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
                logging.warning(f"NVIDIA API returned {response.status} for offset {offset}")
                response.read()
                conn.close()
                continue
            
            data = json.loads(response.read().decode())
            conn.close()
            
            jobs = data.get("jobPostings", [])
            all_jobs.extend(jobs)
            logging.info(f"Fetched {len(jobs)} NVIDIA jobs (offset={offset}, total available={data.get('total', 0)})")
            
        except Exception as e:
            logging.error(f"NVIDIA API error at offset {offset}: {e}")
    
    logging.info(f"Total NVIDIA jobs fetched: {len(all_jobs)}")
    return all_jobs

def scrape_nvidia():
    jobs = fetch_nvidia_jobs()
    logging.info(f"Found {len(jobs)} NVIDIA jobs. Posting to backend...")

    for i, job in enumerate(jobs, start=1):
        title = job.get("title", "N/A")
        location = job.get("locationsText", "N/A")
        path = job.get("externalPath", "")
        job_url = f"https://nvidia.wd5.myworkdayjobs.com/en-US/NVIDIAExternalCareerSite{path}"
        description = " | ".join(job.get("bulletFields", [])) if job.get("bulletFields") else "N/A"

        payload = {
            "title": title,
            "company": "NVIDIA",
            "location": location,
            "job_url": job_url,
            "description": description
        }

        logging.info(f"[{i}] {title} at {location} — {job_url}")
        try:
            post_resp = requests.post(f"{BACKEND_ENDPOINT}/jobs/", json=payload)
            post_resp.raise_for_status()
            logging.info("Posted successfully.")
        except Exception as e:
            logging.error(f"Failed posting job[{i}]: {e}")

if __name__ == "__main__":
    scrape_nvidia()
