import os
import json
from urllib import request
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, EmailStr
from dotenv import load_dotenv

load_dotenv()

router = APIRouter()

class ContactForm(BaseModel):
    name: str
    email: EmailStr
    interest: str
    message: str

def send_to_discord(form_data: ContactForm):
    """
    Sends the contact form data to a Discord webhook.
    """
    webhook_url = os.getenv("DISCORD_WEBHOOK_URL")
    if not webhook_url:
        print("Discord webhook URL not found. Skipping Discord notification.")
        return

    embed = {
        "title": f"New Contact: {form_data.interest}",
        "color": 5814783,  # A nice purple color
        "fields": [
            {"name": "Name", "value": form_data.name, "inline": True},
            {"name": "Email", "value": form_data.email, "inline": True},
            {"name": "Interest", "value": form_data.interest, "inline": False},
            {"name": "Message", "value": form_data.message, "inline": False},
        ],
        "footer": {"text": "Sent from Job Finder Contact Form"}
    }

    data = {
        "content": "New contact form submission!",
        "embeds": [embed]
    }
    
    headers = {"Content-Type": "application/json"}
    req = request.Request(webhook_url, data=json.dumps(data).encode(), headers=headers)

    try:
        with request.urlopen(req) as response:
            if response.status not in [200, 204]:
                print(f"Failed to send to Discord: {response.status} {response.reason}")
    except Exception as e:
        print(f"Error sending to Discord: {e}")


@router.post("/api/contact")
async def handle_contact_form(form: ContactForm):
    """
    Handles submission of the contact form and sends a Discord notification.
    """
    try:
        send_to_discord(form)
        return {"message": "Your message has been received successfully!"}
    except Exception as e:
        print(f"An unexpected error occurred: {e}")
        raise HTTPException(status_code=500, detail="An unexpected error occurred.")