import os
import requests
import logging
from typing import List, Dict
from dotenv import load_dotenv

# Load environment variables
load_dotenv()
BACKEND_ENDPOINT = os.getenv("NEXT_PUBLIC_API_URL")

if not BACKEND_ENDPOINT:
    logging.error("NEXT_PUBLIC_API_URL environment variable not set.")
    exit(1)

logging.basicConfig(level=logging.INFO)

API_URL = "https://nvidia.wd5.myworkdayjobs.com/wday/cxs/nvidia/NVIDIAExternalCareerSite/jobs"

def fetch_nvidia_jobs() -> List[Dict]:
    logging.info("Fetching NVIDIA job listings from Workday API...")
    
    try:
        # Simple request matching curl - minimal headers
        headers = {"Content-Type": "application/json", "Accept": "application/json"}
        payload = {"appliedFacets": {}, "limit": 50, "offset": 0, "searchText": ""}
        
        resp = requests.post(API_URL, headers=headers, json=payload, timeout=30)
        resp.raise_for_status()
        data = resp.json()
        jobs = data.get("jobPostings", [])[:50]
        logging.info(f"Successfully fetched {len(jobs)} NVIDIA jobs (total: {data.get('total', 0)})")
        return jobs
    except Exception as e:
        logging.error(f"NVIDIA API fetch error: {e}")
        return []

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
