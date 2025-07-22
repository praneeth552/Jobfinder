import asyncio
import requests
from playwright.async_api import async_playwright
import logging

# Setup logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

async def scrape_tcs():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=False)  # change to True in deployment
        page = await browser.new_page()
        
        try:
            logging.info("Navigating to TCS iBegin page.")
            await page.goto("https://ibegin.tcsapps.com/candidate/", timeout=60000)
            await page.wait_for_selector('input[placeholder="Enter Keywords"]', timeout=30000)

            # Enter your keyword (e.g. 'developer')
            await page.fill('input[placeholder="Enter Keywords"]', 'developer')

            # Click Search
            await page.click('button[data-ng-click="doSearch()"]')
            logging.info("Search triggered. Waiting for job listings.")

            # Wait for job cards to load
            await page.wait_for_selector('.row.custom-row.searched-job', timeout=30000)
            job_listings = await page.query_selector_all('.row.custom-row.searched-job')
            logging.info(f"Found {len(job_listings)} job listings.")

            for job in job_listings:
                # Extract title
                title_element = await job.query_selector('.job-info-title span')
                title = await title_element.inner_text() if title_element else 'N/A'

                # Extract all .job-info divs
                job_infos = await job.query_selector_all('.job-info')
                location = 'N/A'
                experience = 'N/A'

                if len(job_infos) >= 2:
                    location = await job_infos[1].inner_text()

                if len(job_infos) >= 4:
                    experience = await job_infos[3].inner_text()

                # Extract skills
                skills_element = await job.query_selector('.skill-bar span')
                skills = await skills_element.inner_text() if skills_element else 'N/A'

                company = "TCS"

                logging.info(f"Job: {title}, Location: {location}, Experience: {experience}, Skills: {skills}")

                # Send to backend
                try:
                    response = requests.post("http://127.0.0.1:8000/jobs/", json={
                        "title": title,
                        "company": company,
                        "location": location,
                    })
                    response.raise_for_status()
                    logging.info(f"Successfully sent job '{title}' to backend.")
                except requests.exceptions.RequestException as e:
                    logging.error(f"Error sending job to backend: {e}")

        except Exception as e:
            logging.error(f"An error occurred during scraping: {e}", exc_info=True)
            await page.screenshot(path='tcs_error.png')
            logging.info("Saved screenshot to tcs_error.png")
        finally:
            await browser.close()
            logging.info("Scraping finished.")

if __name__ == "__main__":
    asyncio.run(scrape_tcs())
