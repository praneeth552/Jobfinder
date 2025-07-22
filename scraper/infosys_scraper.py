import asyncio
import requests
from playwright.async_api import async_playwright
import logging

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

async def scrape_infosys():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=False)  # set to True for server
        page = await browser.new_page()
        
        try:
            logging.info("Navigating to Infosys careers page.")
            await page.goto("https://career.infosys.com/joblist", timeout=60000)
            await page.wait_for_load_state("networkidle")
            logging.info("Page loaded. Waiting for job listings to appear.")
            
            # Handle the pop-up
            try:
                logging.info("Looking for the announcement pop-up.")
                ok_button_selector = "button:has-text('OK')"
                await page.wait_for_selector(ok_button_selector, timeout=10000)
                await page.click(ok_button_selector)
                logging.info("Clicked 'OK' on the pop-up.")
            except Exception as e:
                logging.info("Pop-up not found or could not be clicked. Continuing without interaction.")

            # Wait for the job listings to appear
            await page.wait_for_selector('mat-card.appCard', timeout=30000)
            
            job_listings = await page.query_selector_all('mat-card.appCard')
            logging.info(f"Found {len(job_listings)} job listings.")

            for job in job_listings:
                title_element = await job.query_selector('div.job-titleTxt2')
                location_element = await job.query_selector('div.job-locationTxt2')
                
                if title_element and location_element:
                    title = await title_element.inner_text()
                    location = await location_element.inner_text()
                    company = "Infosys"
                    
                    logging.info(f"Found job: {title} at {company} in {location}")

                    # Send to backend
                    try:
                        response = requests.post("http://127.0.0.1:8000/jobs/", json={
                            "title": title,
                            "company": company,
                            "location": location
                        })
                        response.raise_for_status()
                        logging.info(f"Successfully sent job '{title}' to backend.")
                    except requests.exceptions.RequestException as e:
                        logging.error(f"Error sending job to backend: {e}")

        except Exception as e:
            logging.error(f"Scraping error: {e}", exc_info=True)
            await page.screenshot(path="infosys_error.png")
            logging.info("Screenshot saved: infosys_error.png")
        finally:
            await browser.close()
            logging.info("Browser closed. Scraping complete.")

if __name__ == "__main__":
    asyncio.run(scrape_infosys())