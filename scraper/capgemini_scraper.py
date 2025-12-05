import os
import requests
import logging
import re
from typing import List, Dict
from dotenv import load_dotenv

# Load environment variables
load_dotenv()
BACKEND_ENDPOINT = os.getenv("NEXT_PUBLIC_API_URL")

if not BACKEND_ENDPOINT:
    logging.error("NEXT_PUBLIC_API_URL environment variable not set.")
    exit(1)

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

# Capgemini India Jobs API
CAPGEMINI_API_URL = "https://cg-job-search-microservices.azurewebsites.net/api/job-search/"
HEADERS = {
    "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36",
    "Accept": "application/json, text/plain, */*"
}

def clean_html(raw_html: str) -> str:
    """Remove HTML tags from a string."""
    if not raw_html:
        return ""
    cleanr = re.compile('<.*?>')
    cleantext = re.sub(cleanr, '', raw_html)
    # Also clean HTML entities
    cleantext = cleantext.replace('&nbsp;', ' ').replace('&amp;', '&')
    cleantext = cleantext.replace('&rsquo;', "'").replace('&ldquo;', '"').replace('&rdquo;', '"')
    return cleantext.strip()[:500]  # Limit description length

def fetch_capgemini_jobs(search_term: str = "") -> List[Dict]:
    """Fetch jobs from Capgemini API."""
    logging.info(f"Fetching Capgemini job listings (search: '{search_term}')...")
    try:
        params = {
            "country_code": "in-en",
            "search": search_term
        }
        resp = requests.get(CAPGEMINI_API_URL, headers=HEADERS, params=params)
        resp.raise_for_status()
        data = resp.json()
        return data.get("data", [])[:40]
    except requests.exceptions.RequestException as e:
        logging.error(f"Capgemini API fetch error: {e}")
        return []

def scrape_capgemini():
    """Scrape Capgemini jobs - API returns many results with 'developer' search."""
    
    # The Capgemini API doesn't support fresher-specific keywords like 'intern' or 'trainee'
    # It works best with job role searches like 'developer', 'engineer', etc.
    jobs = fetch_capgemini_jobs("developer")
    
    if not jobs:
        logging.warning("No Capgemini jobs found or an error occurred.")
        return
        
    logging.info(f"Found {len(jobs)} Capgemini jobs. Posting to backend...")

    for i, job in enumerate(jobs, start=1):
        title = job.get("title", "N/A")
        location = job.get("location", "N/A")
        job_url = job.get("apply_job_url", "Not available")
        
        # Get experience level for better description
        experience_level = job.get("experience_level", "")
        brand = job.get("brand", "Capgemini")
        professional_community = job.get("professional_communities", "")
        
        # Clean and format description
        raw_description = job.get("description", "")
        clean_desc = clean_html(raw_description)
        
        # Build informative description
        description_parts = []
        if experience_level:
            description_parts.append(f"Experience Level: {experience_level}")
        if professional_community:
            description_parts.append(f"Domain: {professional_community}")
        if clean_desc:
            description_parts.append(clean_desc)
        
        description = " | ".join(description_parts) if description_parts else "Full description available on job page."

        payload = {
            "title": title,
            "company": brand if brand else "Capgemini",
            "location": location,
            "job_url": job_url,
            "description": description
        }

        logging.info(f"[{i}] {title} at {location} ({experience_level})")
        try:
            post_resp = requests.post(f"{BACKEND_ENDPOINT}/jobs/", json=payload)
            post_resp.raise_for_status()
            logging.info(f"Successfully posted job '{title}' to backend.")
        except requests.exceptions.RequestException as e:
            logging.error(f"Failed posting job '{title}': {e}")

    logging.info("Capgemini scraping completed successfully.")

if __name__ == "__main__":
    scrape_capgemini()
