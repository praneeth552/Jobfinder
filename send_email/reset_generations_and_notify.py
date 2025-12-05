"""
One-time script to reset all user generation limits and notify them via email.
This is to give users another chance to try the improved recommendations system with pre-filtering.

Run this ONCE after deploying the improved recommendations:
python3 reset_generations_and_notify.py

Author: TackleIt Team
"""

import asyncio
import os
from datetime import datetime
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


async def reset_and_notify_users(test_mode: bool = False):
    """Reset generation limits for all users and send notification emails."""
    print("=" * 60)
    print("TACKLEIT - GENERATION RESET & NOTIFICATION SCRIPT")
    if test_mode:
        print("🧪 TEST MODE - No emails will be sent, no DB changes made")
    print("=" * 60)
    
    # Get all users
    cursor = users_collection.find({})
    users = await cursor.to_list(length=None)
    
    print(f"\nFound {len(users)} users in the database.\n")
    
    reset_count = 0
    email_sent_count = 0
    email_failed_count = 0
    
    fm = FastMail(conf) if not test_mode else None
    
    for user in users:
        user_id = user.get("_id")
        email = user.get("email")
        name = user.get("name", "")
        
        if test_mode:
            print(f"[TEST] Would reset generation for: {email}")
            print(f"[TEST] Would send email to: {email} (Name: {name})")
            reset_count += 1
            email_sent_count += 1
            continue
        
        # Reset the generation limit to allow immediate use
        try:
            await users_collection.update_one(
                {"_id": user_id},
                {"$set": {"next_generation_allowed_at": datetime.utcnow()}}
            )
            reset_count += 1
            print(f"✓ Reset generation for: {email}")
        except Exception as e:
            print(f"✗ Failed to reset for {email}: {e}")
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
            print(f"  → Email sent to: {email}")
        except Exception as e:
            email_failed_count += 1
            print(f"  ✗ Email failed for {email}: {e}")
        
        # Small delay to avoid rate limiting
        await asyncio.sleep(0.5)
    
    print("\n" + "=" * 60)
    print("SUMMARY" + (" (TEST MODE)" if test_mode else ""))
    print("=" * 60)
    print(f"Total users: {len(users)}")
    print(f"Generations {'would be ' if test_mode else ''}reset: {reset_count}")
    print(f"Emails {'would be ' if test_mode else ''}sent: {email_sent_count}")
    if not test_mode:
        print(f"Emails failed: {email_failed_count}")
    print("=" * 60)
    
    if test_mode:
        print("\n📧 Sample email preview for first user:")
        if users:
            print("-" * 40)
            print(f"To: {users[0].get('email')}")
            print(f"Subject: 🎉 We've Improved TackleIt - Try Again (Your Limit Reset!)")
            print("-" * 40)
            # Print a text summary instead of full HTML
            print("Email content summary:")
            print("- Header: We've Made TackleIt Even Better!")
            print("- Highlight: Generation limit has been reset")
            print("- New features: Smart Pre-Filtering, 500+ jobs, 10-15 recommendations")
            print("- Note about 30-60 sec generation time")
            print("- CTA: Try It Now button → https://tackleit.tech/dashboard")
            print("-" * 40)
        print("\n💡 To run for real, use: python3 reset_generations_and_notify.py --run")
    
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
    elif "--test" in sys.argv:
        test_mode = True
    
    asyncio.run(reset_and_notify_users(test_mode=test_mode))
