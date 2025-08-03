import asyncio
from playwright.async_api import async_playwright
import logging
import requests

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

GOOGLE_CAREERS_URL = "https://careers.google.com/jobs/"
BACKEND_ENDPOINT = "https://jobfinder-backend-oex9.onrender.com/jobs/"

async def scrape_google_careers():
    logging.info(f"Navigating to {GOOGLE_CAREERS_URL} to scrape job data...")
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        page = await browser.new_page()
        try:
            await page.goto(GOOGLE_CAREERS_URL, timeout=60000)
            
            # Wait for the search input field to be visible, indicating the page is loaded
            await page.wait_for_selector("input[aria-label='Search jobs']", timeout=30000)

            # Now, wait for the job cards to appear. This might take a moment.
            await page.wait_for_selector("div.gc-card", timeout=30000)

            job_cards = await page.locator("div.gc-card").all()
            if not job_cards:
                logging.warning("No job cards found with Playwright selectors.")
                return

            logging.info(f"Found {len(job_cards)} job cards. Processing...")
            for index, card in enumerate(job_cards[:20], start=1):
                title_element = await card.locator("h3.gc-card__title").first.text_content()
                title = title_element.strip() if title_element else "N/A"

                location_element = await card.locator("span.gc-card__location").first.text_content()
                location = location_element.strip() if location_element else "N/A"

                link_element = await card.locator("a.gc-card__link").first.get_attribute('href')
                job_url = f"{GOOGLE_CAREERS_URL}{link_element}" if link_element else "Not available"

                description = "Description not available in list view." # Placeholder

                payload = {
                    "title": title,
                    "company": "Google",
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

        except Exception as e:
            logging.error(f"Error during Google Careers scraping: {e}")
        finally:
            await browser.close()

    logging.info("Google Careers scraping completed.")

if __name__ == "__main__":
    asyncio.run(scrape_google_careers())