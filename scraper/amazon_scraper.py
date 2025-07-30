import asyncio
import requests
# from playwright.async_api import async_playwright
import logging

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

BASE_URL = "https://www.amazon.jobs"
SEARCH_URL = BASE_URL + "/en/search.json?offset=0&result_limit=20&sort=relevant&category%5B%5D=software-development&category%5B%5D=engineering-hardware&category%5B%5D=engineering-operations-it-support&category%5B%5D=project-program-product-management-technical&job_type%5B%5D=Full-Time&country%5B%5D=IND"

BACKEND_ENDPOINT = "http://127.0.0.1:8000/jobs/"

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
                backend_response = requests.post(BACKEND_ENDPOINT, json=payload)
                backend_response.raise_for_status()
                logging.info(f"Successfully sent job '{title}' to backend.")
            except requests.exceptions.RequestException as e:
                logging.error(f"Error sending job '{title}' to backend: {e}")

    except requests.exceptions.RequestException as e:
        logging.error(f"Failed to fetch data from Amazon jobs API: {e}")

    logging.info("Amazon scraping completed successfully.")

if __name__ == "__main__":
    asyncio.run(scrape_amazon_jobs())