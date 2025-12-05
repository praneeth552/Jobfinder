"""
Script to send emails to remaining users who didn't receive the notification.
Uses a list of failed email addresses from the previous run.

Run with: python3 send_remaining_50.py
After running: python3 send_remaining_50.py --run

Author: TackleIt Team
"""

import asyncio
import os
from dotenv import load_dotenv
from motor.motor_asyncio import AsyncIOMotorClient
from fastapi_mail import FastMail, MessageSchema, ConnectionConfig

load_dotenv()

# MongoDB connection
MONGO_URI = os.getenv("MONGO_URI")
if not MONGO_URI:
    raise ValueError("MONGO_URI not set in .env")

client = AsyncIOMotorClient(MONGO_URI)
db = client["jobfinder"]
users_collection = db["users"]

# Email configuration
conf = ConnectionConfig(
    MAIL_USERNAME=os.getenv("MAIL_USERNAME"),
    MAIL_PASSWORD=os.getenv("MAIL_PASSWORD"),
    MAIL_FROM=os.getenv("MAIL_FROM"),
    MAIL_PORT=int(os.getenv("MAIL_PORT", 587)),
    MAIL_SERVER=os.getenv("MAIL_SERVER"),
    MAIL_STARTTLS=True,
    MAIL_SSL_TLS=False,
    USE_CREDENTIALS=True,
    VALIDATE_CERTS=True
)

# Failed emails from previous run (50 users)
FAILED_EMAILS = [
    "rahuldevra342opera@gmail.com",
    "esaigani333@gmail.com",
    "shashankdec2000@gmail.com",
    "hellosuvesh@gmail.com",
    "meenu10802@gmail.com",
    "ishan.tripathi010@gmail.com",
    "swasanhyung@gmail.com",
    "hsinghjayesh@gmail.com",
    "dxtmanav08@gmail.com",
    "dude991itstan@gmail.com",
    "imslayer9@protonmail.com",
    "faseye9150@httpsu.com",
    "chandrathota665@gmail.com",
    "sushpawar001@gmail.com",
    "hemangparekh3421@gmail.com",
    "fevame5429@httpsu.com",
    "anjnesh12.vasudeva55@gmail.com",
    "guptankit.2003@gmail.com",
    "jaijain83691@gmail.com",
    "pranjalmantri@gmail.com",
    "tagazeem@gmail.com",
    "himanshusinghc2001@gmail.com",
    "solomont3814@gmail.com",
    "maanikhurana1007@gmail.com",
    "rohangowdahy@gmail.com",
]


def get_notification_email_body(name: str) -> str:
    return f"""
    <!DOCTYPE html>
    <html>
    <head>
        <style>
            body {{ font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; }}
            .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
            .header {{ background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px 10px 0 0; text-align: center; }}
            .header h1 {{ color: white; margin: 0; font-size: 24px; }}
            .content {{ background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }}
            .highlight {{ background: #e8f5e9; border-left: 4px solid #4caf50; padding: 15px; margin: 20px 0; border-radius: 4px; }}
            .feature {{ display: flex; align-items: center; margin: 10px 0; }}
            .feature-icon {{ font-size: 20px; margin-right: 10px; }}
            .cta {{ display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 15px 30px; border-radius: 25px; text-decoration: none; font-weight: bold; margin: 20px 0; }}
            .footer {{ text-align: center; color: #888; font-size: 12px; margin-top: 20px; }}
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>🎉 We've Made TackleIt Even Better!</h1>
            </div>
            <div class="content">
                <p>Hi {name or 'there'},</p>
                
                <p>We heard your feedback, and we've been working hard to improve your job search experience!</p>
                
                <div class="highlight">
                    <strong>🔄 Your Generation Limit Has Been Reset!</strong>
                    <p style="margin: 5px 0 0 0;">As a thank you for your patience and feedback, we've reset your recommendation generation. You can now try again for FREE!</p>
                </div>
                
                <h3>✨ What's New:</h3>
                
                <div class="feature">
                    <span class="feature-icon">🎯</span>
                    <span><strong>Smart Pre-Filtering:</strong> Jobs are now pre-filtered based on your experience level before AI matching. Freshers get entry-level jobs, seniors get senior roles.</span>
                </div>
                
                <div class="feature">
                    <span class="feature-icon">📊</span>
                    <span><strong>500+ Fresh Jobs:</strong> We've expanded our job database from 150+ to 500+ jobs from 10+ top companies (Amazon, Google, Adobe, NVIDIA, Intel, and more!).</span>
                </div>
                
                <div class="feature">
                    <span class="feature-icon">⚡</span>
                    <span><strong>Better Recommendations:</strong> Expect 10-15 highly relevant job recommendations tailored specifically to YOUR skills and preferences.</span>
                </div>
                
                <div class="feature">
                    <span class="feature-icon">⏱️</span>
                    <span><strong>Note:</strong> Generating personalized recommendations may take 30-60 seconds – we're analyzing hundreds of jobs to find YOUR perfect matches!</span>
                </div>
                
                <p style="text-align: center;">
                    <a href="https://tackleit.xyz/dashboard" class="cta">Try It Now →</a>
                </p>
                
                <p>We're confident you'll love the improvements. Give it another try and let us know what you think!</p>
                
                <p>Best regards,<br><strong>The TackleIt Team</strong></p>
            </div>
            <div class="footer">
                <p>You're receiving this because you're a registered TackleIt user.</p>
                <p>© 2024 TackleIt. All rights reserved.</p>
            </div>
        </div>
    </body>
    </html>
    """


async def send_to_remaining_users(test_mode: bool = False):
    """Send notification emails to remaining users."""
    print("=" * 60)
    print("TACKLEIT - SEND TO REMAINING USERS")
    if test_mode:
        print("🧪 TEST MODE - No emails will be sent")
    print("=" * 60)
    
    print(f"\nTarget: {len(FAILED_EMAILS)} users who didn't receive email\n")
    
    email_sent_count = 0
    email_failed_count = 0
    
    fm = FastMail(conf) if not test_mode else None
    
    for email in FAILED_EMAILS:
        # Get user name from DB
        user = await users_collection.find_one({"email": email})
        name = user.get("name", "") if user else ""
        
        if test_mode:
            print(f"[TEST] Would send email to: {email} (Name: {name})")
            email_sent_count += 1
            continue
        
        # Send notification email
        try:
            message = MessageSchema(
                subject="🎉 We've Improved TackleIt - Try Again (Your Limit Reset!)",
                recipients=[email],
                body=get_notification_email_body(name),
                subtype="html"
            )
            await fm.send_message(message)
            email_sent_count += 1
            print(f"✓ Email sent to: {email}")
        except Exception as e:
            email_failed_count += 1
            print(f"✗ Email failed for {email}: {e}")
        
        # Delay to avoid rate limiting
        await asyncio.sleep(1)
    
    print("\n" + "=" * 60)
    print("SUMMARY" + (" (TEST MODE)" if test_mode else ""))
    print("=" * 60)
    print(f"Target users: {len(FAILED_EMAILS)}")
    print(f"Emails {'would be ' if test_mode else ''}sent: {email_sent_count}")
    if not test_mode:
        print(f"Emails failed: {email_failed_count}")
    print("=" * 60)
    
    if test_mode:
        print("\n💡 To run for real, use: python3 send_remaining_50.py --run")
    
    print("\n✅ Script completed!")


if __name__ == "__main__":
    import sys
    
    test_mode = True  # Default to test mode for safety
    
    if "--run" in sys.argv:
        test_mode = False
        print("\n⚠️  PRODUCTION MODE - This will send real emails!\n")
        confirm = input("Are you sure you want to proceed? (type 'yes' to confirm): ")
        if confirm.lower() != "yes":
            print("Aborted.")
            sys.exit(0)
    
    asyncio.run(send_to_remaining_users(test_mode=test_mode))
