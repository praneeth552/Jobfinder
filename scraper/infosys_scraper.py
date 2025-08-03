import requests
import logging

# Setup logging
logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s")

def scrape_infosys():
    logging.info("Fetching Infosys job listings from API.")

    # Infosys jobs API URL
    INFOSYS_API_URL = "https://intapgateway.infosysapps.com/careersci/search/intapjbsrch/getCareerSearchJobs?sourceId=1,21&searchText=ALL"

    # Your backend endpoint
    BACKEND_ENDPOINT = "https://jobfinder-backend-oex9.onrender.com/jobs/"  # Matches TCS backend endpoint style

    # Headers to mimic browser request
    HEADERS = {
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36",
        "Accept": "application/json, text/plain, */*",
    }

    try:
        response = requests.get(INFOSYS_API_URL, headers=HEADERS)
        response.raise_for_status()
    except Exception as e:
        logging.error(f"Failed to fetch data from Infosys API: {e}")
        return

    data = response.json()

    # If API returns a list directly
    jobs = data[:20] if isinstance(data, list) else data.get("careerSearchJobs", [])[:20]

    logging.info(f"Fetched {len(jobs)} jobs. Processing each now...")

    for index, job in enumerate(jobs, start=1):
        # Extracting necessary fields
        title = job.get("postingTitle", "N/A")
        location = job.get("location", "N/A")
        reference_code = job.get("referenceCode")
        posting_id = job.get("postingId")
        min_exp = job.get("minExperienceLevel")
        max_exp = job.get("maxExperienceLevel")
        skills = job.get("technicalRequirement") or job.get("preferredSkills") or "N/A"

        # Construct job URL if postingId exists
        if reference_code:
            job_url = f"https://career.infosys.com/jobdesc?jobReferenceCode={reference_code}&rc=0&jobType=normal"
        else:
            job_url = "Not available"

        # Create description combining experience and skills
        description = f"Experience: {min_exp}-{max_exp} years. Skills: {skills}."

        payload = {
            "title": title,
            "company": "Infosys",
            "location": location,
            "job_url": job_url,
            "description": description
        }

        logging.info(f"[{index}] {title} | {location} | {job_url}")

        # Push to backend
        try:
            backend_response = requests.post(BACKEND_ENDPOINT, json=payload)
            backend_response.raise_for_status()
            logging.info(f"Successfully sent job '{title}' to backend.")
        except requests.exceptions.RequestException as e:
            logging.error(f"Error sending job '{title}' to backend: {e}")

    logging.info("Infosys scraping completed successfully.")

if __name__ == "__main__":
    scrape_infosys()
