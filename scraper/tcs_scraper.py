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

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

TCS_API_URL = "https://ibegin.tcsapps.com/candidate/api/v1/jobs/searchJ?at=1753900034586"
HEADERS = {
    "Content-Type": "application/json", 
    "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36",
    "Accept": "application/json, text/plain, */*",
    "Origin": "https://ibegin.tcsapps.com",
    "Referer": "https://ibegin.tcsapps.com/candidate/"
}
PAYLOAD = {"jobCity":"","jobFunction":"","jobExperience":"","jobSkill":None,"pageNumber":"1","userText":"developer","jobTitleOrder":None,"jobCityOrder":None,"jobFunctionOrder":None,"jobExperienceOrder":None,"applyByOrder":None,"regular":True,"walkin":True}

def fetch_tcs_jobs() -> List[Dict]:
    logging.info("Fetching TCS job listings from API...")
    try:
        resp = requests.post(TCS_API_URL, headers=HEADERS, json=PAYLOAD)
        resp.raise_for_status()
        data = resp.json()
        return data.get("data", {}).get("jobs", [])[:20]
    except requests.exceptions.RequestException as e:
        logging.error(f"TCS API fetch error: {e}")
        if e.response:
            logging.error(f"Response content: {e.response.text}")
        return []

def scrape_tcs():
    jobs = fetch_tcs_jobs()
    if not jobs:
        logging.warning("No TCS jobs found or an error occurred.")
        return
        
    logging.info(f"Found {len(jobs)} TCS jobs. Posting to backend...")

    for i, job in enumerate(jobs, start=1):
        title = job.get("jobTitle", "N/A")
        location = job.get("location", "N/A")
        job_id = job.get("id")
        
        job_url = f"https://ibegin.tcsapps.com/candidate/job/{job_id}" if job_id else "Not available"
        
        experience = job.get("experience", "N/A")
        skills = job.get("skills", "N/A")
        description = f"Experience: {experience} years. Skills: {skills}"

        payload = {
            "title": title,
            "company": "TCS",
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
    scrape_tcs()