import os
import requests
import logging
from typing import List, Dict
from bs4 import BeautifulSoup
from dotenv import load_dotenv

# Load environment variables
load_dotenv()
BACKEND_ENDPOINT = os.getenv("NEXT_PUBLIC_API_URL")

if not BACKEND_ENDPOINT:
    logging.error("NEXT_PUBLIC_API_URL environment variable not set.")
    exit(1)

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

QUALCOMM_API_URL = "https://careers.qualcomm.com/api/apply/v2/jobs/446706493031/jobs?domain=qualcomm.com"
HEADERS = {
    "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36",
    "Accept": "application/json, text/plain, */*"
}

def get_job_description(url: str) -> str:
    try:
        response = requests.get(url, headers=HEADERS)
        response.raise_for_status()
        soup = BeautifulSoup(response.content, 'html.parser')
        # Find the element containing the job description
        # This selector might need adjustment based on the actual page structure
        description_div = soup.find("div", class_="ats-description")
        return description_div.get_text(strip=True) if description_div else "Description not found."
    except requests.exceptions.RequestException as e:
        logging.error(f"Failed to fetch job description from {url}: {e}")
        return "Description not found."

def fetch_qualcomm_jobs() -> List[Dict]:
    logging.info("Fetching Qualcomm job listings from API...")
    try:
        resp = requests.get(QUALCOMM_API_URL, headers=HEADERS)
        resp.raise_for_status()
        data = resp.json()
        return data.get("positions", [])[:20]
    except requests.exceptions.RequestException as e:
        logging.error(f"Qualcomm API fetch error: {e}")
        if e.response:
            logging.error(f"Response content: {e.response.text}")
        return []

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
            post_resp = requests.post(f"{BACKEND_ENDPOINT}/jobs/", json=payload)
            post_resp.raise_for_status()
            logging.info(f"Successfully posted job '{title}' to backend.")
        except requests.exceptions.RequestException as e:
            logging.error(f"Failed posting job '{title}': {e}")

if __name__ == "__main__":
    scrape_qualcomm()
