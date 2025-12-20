import os
import requests
import logging
import re
from typing import List, Dict
from dotenv import load_dotenv

# Load environment variables
load_dotenv()
BACKEND_ENDPOINT = os.getenv("NEXT_PUBLIC_API_URL", "").rstrip("/")

if not BACKEND_ENDPOINT:
    logging.error("NEXT_PUBLIC_API_URL environment variable not set.")
    exit(1)

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

# Capgemini Jobs API - Multiple regions for global jobs
CAPGEMINI_API_URL = "https://cg-job-search-microservices.azurewebsites.net/api/job-search/"
HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Accept": "application/json, text/plain, */*"
}

# Multiple country codes and search terms for more diverse global jobs
COUNTRY_CODES = ["in-en", "us-en", "gb-en"]  # India, US, UK
SEARCH_TERMS = ["developer", "engineer", "software"]

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

def fetch_capgemini_jobs() -> List[Dict]:
    """Fetch jobs from Capgemini API across multiple regions."""
    logging.info("Fetching Capgemini job listings from multiple regions...")
    all_jobs = []
    seen_urls = set()
    
    for country_code in COUNTRY_CODES:
        for search_term in SEARCH_TERMS:
            try:
                params = {
                    "country_code": country_code,
                    "search": search_term
                }
                resp = requests.get(CAPGEMINI_API_URL, headers=HEADERS, params=params)
                resp.raise_for_status()
                data = resp.json()
                jobs = data.get("data", [])
                
                for job in jobs:
                    job_url = job.get("apply_job_url", "")
                    if job_url and job_url not in seen_urls:
                        seen_urls.add(job_url)
                        all_jobs.append(job)
                
                logging.info(f"Region '{country_code}' search '{search_term}': {len(jobs)} jobs, {len(all_jobs)} total unique")
            except requests.exceptions.RequestException as e:
                logging.error(f"Capgemini API fetch error for {country_code}/{search_term}: {e}")
    
    return all_jobs[:60]  # Return up to 60 unique jobs

def scrape_capgemini():
    """Scrape Capgemini jobs from multiple regions."""
    jobs = fetch_capgemini_jobs()
    
    if not jobs:
        logging.warning("No Capgemini jobs found or an error occurred.")
        return
        
    logging.info(f"Found {len(jobs)} Capgemini jobs. Posting to backend...")
    
    # Import experience extraction utility
    from experience_utils import extract_experience_from_text, parse_experience_level

    for i, job in enumerate(jobs, start=1):
        title = job.get("title", "N/A")
        location = job.get("location", "N/A")
        job_url = job.get("apply_job_url", "Not available")
        
        # Get experience level for better description
        experience_level = job.get("experience_level", "")
        brand = job.get("brand", "Capgemini")
        professional_community = job.get("professional_communities", "")
        
        # Parse experience from structured field or description
        experience_required = None
        experience_min_years = None
        
        if experience_level:
            experience_required, experience_min_years = parse_experience_level(experience_level)
        
        # If not found in structured field, try description
        if experience_min_years is None:
            raw_description = job.get("description", "")
            experience_required, experience_min_years = extract_experience_from_text(raw_description)
        
        # Also try to extract from title
        if experience_min_years is None:
            experience_required, experience_min_years = extract_experience_from_text(title)
        
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
            "description": description,
            "experience_required": experience_required,
            "experience_min_years": experience_min_years
        }

        logging.info(f"[{i}] {title} at {location} — Exp: {experience_required} ({experience_min_years} yrs)")
        try:
            url = f"{BACKEND_ENDPOINT}/jobs"
            post_resp = requests.post(url, json=payload, timeout=30)
            post_resp.raise_for_status()
            logging.info(f"Successfully posted job '{title}' to backend.")
        except requests.exceptions.RequestException as e:
            logging.error(f"Failed posting job '{title}': {e}")

    logging.info("Capgemini scraping completed successfully.")

if __name__ == "__main__":
    scrape_capgemini()
