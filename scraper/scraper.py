import os
import requests
from bs4 import BeautifulSoup
from dotenv import load_dotenv

# Load environment variables from .env file in the current directory
load_dotenv()

API_URL = os.getenv("NEXT_PUBLIC_API_URL")

if not API_URL:
    raise ValueError("NEXT_PUBLIC_API_URL environment variable not set.")

URL = "https://news.ycombinator.com/"
page = requests.get(URL)

soup = BeautifulSoup(page.content, "html.parser")

results = soup.find_all("span", class_="titleline")

for result in results:
    title = result.find("a").text
    company = "Unknown"
    location = "Unknown"
    try:
        response = requests.post(f"{API_URL}/jobs/", json={"title": title, "company": company, "location": location})
        response.raise_for_status()  # Raise an exception for bad status codes
        print(f"Successfully posted job: {title}")
    except requests.exceptions.RequestException as e:
        print(f"Error posting job: {title}. Error: {e}")

