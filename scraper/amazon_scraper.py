import asyncio
import requests
import logging
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()
BACKEND_ENDPOINT = os.getenv("NEXT_PUBLIC_API_URL", "").rstrip("/")

if not BACKEND_ENDPOINT:
    logging.error("NEXT_PUBLIC_API_URL environment variable not set.")
    exit(1)

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

BASE_URL = "https://www.amazon.jobs"
# Removed country filter to get global jobs (India, US, etc.)
SEARCH_URL = BASE_URL + "/en/search.json?offset=0&result_limit=50&sort=recent&category%5B%5D=software-development&category%5B%5D=engineering-hardware&category%5B%5D=engineering-operations-it-support&category%5B%5D=project-program-product-management-technical&job_type%5B%5D=Full-Time&job_type%5B%5D=Intern"

async def scrape_amazon_jobs():
    logging.info("Fetching Amazon job listings...")
    try:
        response = requests.get(SEARCH_URL)
        response.raise_for_status()
        data = response.json()
        jobs = data.get("jobs", [])
        logging.info(f"Found {len(jobs)} jobs. Processing each now...")

        for index, job in enumerate(jobs, start=1):
            title = job.get("title", "N/A")
            location = job.get("location", "N/A")
            job_url = f"{BASE_URL}{job.get('job_path', '')}"
            description = job.get("description", "N/A")

            payload = {
                "title": title,
                "company": "Amazon",
                "location": location,
                "job_url": job_url,
                "description": description
            }

            logging.info(f"[{index}] {title} | {location} | {job_url}")

            try:
                url = f"{BACKEND_ENDPOINT}/jobs"
                backend_response = requests.post(url, json=payload, allow_redirects=False, timeout=30)
                if backend_response.status_code in (301, 302, 307, 308):
                    logging.error(f"Redirect detected! Status: {backend_response.status_code}, Location: {backend_response.headers.get('Location', 'N/A')}")
                    continue
                backend_response.raise_for_status()
                logging.info(f"Successfully sent job '{title}' to backend.")
            except requests.exceptions.RequestException as e:
                logging.error(f"Error sending job '{title}' to backend: {e}")

    except requests.exceptions.RequestException as e:
        logging.error(f"Failed to fetch data from Amazon jobs API: {e}")

    logging.info("Amazon scraping completed successfully.")

if __name__ == "__main__":
    asyncio.run(scrape_amazon_jobs())