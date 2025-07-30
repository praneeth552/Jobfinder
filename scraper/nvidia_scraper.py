import requests
import logging
from typing import List, Dict

logging.basicConfig(level=logging.INFO)

NVIDIA_API_URL = "https://nvidia.wd5.myworkdayjobs.com/wday/cxs/nvidia/NVIDIAExternalCareerSite/jobs"
HEADERS = {"Content-Type": "application/json", "User-Agent": "Mozilla/5.0"}
PAYLOAD = {"appliedFacets": {}, "limit": 20, "offset": 0, "searchText": ""}

BACKEND_ENDPOINT = "http://127.0.0.1:8000/jobs/"

def fetch_nvidia_jobs() -> List[Dict]:
    logging.info("Fetching NVIDIA job listings from Workday API...")

    try:
        resp = requests.post(NVIDIA_API_URL, headers=HEADERS, json=PAYLOAD)
        resp.raise_for_status()
        data = resp.json()
        return data.get("jobPostings", [])[:20]
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
            post_resp = requests.post(BACKEND_ENDPOINT, json=payload)
            post_resp.raise_for_status()
            logging.info("Posted successfully.")
        except Exception as e:
            logging.error(f"Failed posting job[{i}]: {e}")

if __name__ == "__main__":
    scrape_nvidia()
