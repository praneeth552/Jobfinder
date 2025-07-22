import requests
from bs4 import BeautifulSoup

URL = "https://news.ycombinator.com/"
page = requests.get(URL)

soup = BeautifulSoup(page.content, "html.parser")

results = soup.find_all("span", class_="titleline")

for result in results:
    title = result.find("a").text
    company = "Unknown"
    location = "Unknown"
    requests.post("http://127.0.0.1:8000/jobs/", json={"title": title, "company": company, "location": location})
