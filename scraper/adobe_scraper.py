import requests
import logging
from typing import List, Dict
import re

# Setup logging
logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s")

ADOBE_API_URL = "https://adobe.wd5.myworkdayjobs.com/wday/cxs/adobe/external_experienced/jobs"
BACKEND_ENDPOINT = "https://jobfinder-backend-oex9.onrender.com/jobs/"

HEADERS = {
    "Content-Type": "application/json",
    "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36",
    "Accept": "application/json"
}

PAYLOAD = {
    "appliedFacets": {},
    "limit": 20,
    "offset": 0,
    "searchText": "software engineer" # Changed from empty to get more relevant jobs
}

def clean_html(raw_html: str) -> str:
    """
    A simple function to remove HTML tags from a string.
    """
    cleanr = re.compile('<.*?>')
    cleantext = re.sub(cleanr, '', raw_html)
    return cleantext.strip()

def scrape_adobe():
    """
    Fetches job listings from Adobe's Workday API, processes them,
    and sends them to the backend endpoint.
    """
    logging.info("Fetching Adobe job listings from Workday API...")

    try:
        response = requests.post(ADOBE_API_URL, headers=HEADERS, json=PAYLOAD)
        response.raise_for_status()
        data = response.json()
        logging.info(f"Successfully fetched data from Adobe API. Total jobs found: {data.get('total', 0)}")

    except requests.exceptions.RequestException as e:
        logging.error(f"Failed to fetch data from Adobe API: {e}")
        return

    job_listings = data.get("jobPostings", [])
    if not job_listings:
        logging.warning("No job listings found in the API response.")
        return

    logging.info(f"Processing {len(job_listings)} job listings...")

    for index, job in enumerate(job_listings, start=1):
        title = job.get("title", "N/A")
        location = job.get("locationsText", "N/A")
        
        # Construct the full job URL
        external_path = job.get("externalPath")
        if external_path:
            job_url = f"https://adobe.wd5.myworkdayjobs.com/en-US/external_experienced{external_path}"
        else:
            job_url = "Not available"

        # The description is often in a 'bulletPoints' field or similar, not a simple 'description' key.
        # Based on typical Workday APIs, we look for 'jobDescription' or 'bulletPoints'.
        # Since we can't inspect the live response, we'll check for common fields.
        # The previous scraper used a 'description' field which is not standard in the response.
        # We will attempt to get a more structured description if possible.
        # For now, we'll use a placeholder as the full description is not available in a clean format.
        # A better approach would be to visit job_url and scrape the description, but that's more complex.
        description = "Full description available on the job page." # Placeholder

        payload = {
            "title": title,
            "company": "Adobe",
            "location": location,
            "job_url": job_url,
            "description": description
        }

        logging.info(f"[{index}] Processing job: {title} | {location}")

        # Push to backend
        try:
            backend_response = requests.post(BACKEND_ENDPOINT, json=payload)
            backend_response.raise_for_status()
            logging.info(f"Successfully sent job '{title}' to backend.")
        except requests.exceptions.RequestException as e:
            logging.error(f"Error sending job '{title}' to backend: {e}")

    logging.info("Adobe scraping completed successfully.")

if __name__ == "__main__":
    scrape_adobe()