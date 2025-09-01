import os
import json
from urllib import request
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, EmailStr
from dotenv import load_dotenv
from email_utils import send_email
from database import db
from models import User

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
    Handles submission of the contact form.
    Checks if the user is registered. If so, sends a Discord notification and an email.
    If not, returns an error message.
    """
    user = await db.users.find_one({"email": form.email})
    if not user:
        raise HTTPException(
            status_code=403,
            detail="Please try the product before reaching out. We'd love to hear your thoughts after you've had a chance to experience it."
        )

    email_sent = False
    discord_sent = False

    # Try sending to Discord
    try:
        send_to_discord(form)
        discord_sent = True
    except Exception as e:
        print(f"An error occurred while sending to Discord: {e}")

    # Try sending email
    try:
        email_body = f"""
        <html>
            <body>
                <h2>New Contact Form Submission</h2>
                <p><strong>Name:</strong> {form.name}</p>
                <p><strong>Email:</strong> {form.email}</p>
                <p><strong>Interest:</strong> {form.interest}</p>
                <p><strong>Message:</strong></p>
                <p>{form.message}</p>
            </body>
        </html>
        """
        await send_email(
            subject=f"New Contact Form Submission: {form.interest}",
            recipients=["saipraneeth2525@gmail.com"],
            body=email_body
        )
        email_sent = True
    except Exception as e:
        print(f"An error occurred while sending email: {e}")

    if not email_sent and not discord_sent:
        raise HTTPException(status_code=500, detail="Failed to send message via all channels.")

    return {"message": "Your message has been received successfully!"}
