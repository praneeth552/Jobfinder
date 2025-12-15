"""
Script to send v2.1.2 update notification to all users.
Professional, subtle, and aesthetic email matching TackleIt's design language.

Run with: python3 send_v2_1_2_update.py
After testing: python3 send_v2_1_2_update.py --run

Author: TackleIt Team
"""

import asyncio
import os
from dotenv import load_dotenv
from motor.motor_asyncio import AsyncIOMotorClient
from fastapi_mail import FastMail, MessageSchema, ConnectionConfig

# Load .env from backend directory
import pathlib
env_path = pathlib.Path(__file__).parent.parent / "backend" / ".env"
load_dotenv(env_path)

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


def get_update_email_body(name: str) -> str:
    """Professional, monochrome aesthetic email for v2.1.2 update."""
    return f"""
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
            body {{
                font-family: 'Segoe UI', -apple-system, BlinkMacSystemFont, sans-serif;
                line-height: 1.7;
                color: #1a1a1a;
                background-color: #fafafa;
                margin: 0;
                padding: 0;
            }}
            .container {{
                max-width: 560px;
                margin: 0 auto;
                padding: 40px 20px;
            }}
            .card {{
                background: #ffffff;
                border: 1px solid #e5e5e5;
                border-radius: 16px;
                overflow: hidden;
            }}
            .header {{
                padding: 32px 32px 24px;
                border-bottom: 1px solid #f0f0f0;
            }}
            .logo {{
                font-size: 20px;
                font-weight: 700;
                color: #1a1a1a;
                letter-spacing: -0.5px;
            }}
            .version-badge {{
                display: inline-block;
                background: #1a1a1a;
                color: #ffffff;
                font-size: 11px;
                font-weight: 600;
                padding: 4px 10px;
                border-radius: 20px;
                margin-left: 8px;
                letter-spacing: 0.5px;
            }}
            .content {{
                padding: 32px;
            }}
            .greeting {{
                font-size: 15px;
                color: #666;
                margin-bottom: 16px;
            }}
            .headline {{
                font-size: 22px;
                font-weight: 600;
                color: #1a1a1a;
                margin: 0 0 20px 0;
                line-height: 1.3;
            }}
            .intro {{
                font-size: 15px;
                color: #444;
                margin-bottom: 28px;
            }}
            .updates-section {{
                background: #fafafa;
                border-radius: 12px;
                padding: 24px;
                margin-bottom: 28px;
            }}
            .section-title {{
                font-size: 12px;
                font-weight: 600;
                color: #888;
                text-transform: uppercase;
                letter-spacing: 1px;
                margin-bottom: 16px;
            }}
            .update-item {{
                display: flex;
                align-items: flex-start;
                margin-bottom: 16px;
            }}
            .update-item:last-child {{
                margin-bottom: 0;
            }}
            .update-icon {{
                width: 28px;
                height: 28px;
                background: #1a1a1a;
                color: #fff;
                border-radius: 8px;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 14px;
                margin-right: 14px;
                flex-shrink: 0;
            }}
            .update-text {{
                flex: 1;
            }}
            .update-title {{
                font-size: 14px;
                font-weight: 600;
                color: #1a1a1a;
                margin-bottom: 2px;
            }}
            .update-desc {{
                font-size: 13px;
                color: #666;
                line-height: 1.5;
            }}
            .cta-section {{
                text-align: center;
                margin: 32px 0 8px;
            }}
            .cta {{
                display: inline-block;
                background: #1a1a1a;
                color: #ffffff !important;
                padding: 14px 32px;
                border-radius: 30px;
                text-decoration: none;
                font-weight: 600;
                font-size: 14px;
                transition: opacity 0.2s;
            }}
            .cta:hover {{
                opacity: 0.9;
            }}
            .signature {{
                margin-top: 32px;
                padding-top: 24px;
                border-top: 1px solid #f0f0f0;
            }}
            .signature-text {{
                font-size: 14px;
                color: #666;
            }}
            .signature-name {{
                font-weight: 600;
                color: #1a1a1a;
            }}
            .footer {{
                padding: 24px 32px;
                background: #fafafa;
                text-align: center;
            }}
            .footer-text {{
                font-size: 12px;
                color: #999;
                margin: 0;
            }}
            .footer-link {{
                color: #666;
                text-decoration: none;
            }}
            .divider {{
                width: 40px;
                height: 2px;
                background: #e5e5e5;
                margin: 20px 0;
                border-radius: 1px;
            }}
        </style>
    </head>
    <body>
        <div class="container">
            <div class="card">
                <div class="header">
                    <span class="logo">TackleIt</span>
                    <span class="version-badge">v2.1.2</span>
                </div>
                
                <div class="content">
                    <p class="greeting">Hi {name or 'there'},</p>
                    
                    <h1 class="headline">We've made some improvements you'll love.</h1>
                    
                    <p class="intro">
                        Based on your feedback, we've refined the experience to make your job search even smoother.
                    </p>
                    
                    <div class="updates-section">
                        <div class="section-title">What's New</div>
                        
                        <div class="update-item">
                            <div class="update-icon">✦</div>
                            <div class="update-text">
                                <div class="update-title">Save & Apply for Everyone</div>
                                <div class="update-desc">All users can now save and track job applications—no upgrade required.</div>
                            </div>
                        </div>
                        
                        <div class="update-item">
                            <div class="update-icon">↗</div>
                            <div class="update-text">
                                <div class="update-title">Smarter Location Matching</div>
                                <div class="update-desc">We now recognize city aliases like Bangalore↔Bengaluru for better matches.</div>
                            </div>
                        </div>
                        
                        <div class="update-item">
                            <div class="update-icon">◇</div>
                            <div class="update-text">
                                <div class="update-title">Refined Design</div>
                                <div class="update-desc">Fresh, minimal aesthetic with hand-drawn touches throughout the app.</div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="cta-section">
                        <a href="https://tackleit.xyz/dashboard" class="cta">Explore the Updates →</a>
                    </div>
                    
                    <div class="signature">
                        <p class="signature-text">
                            Thank you for being part of TackleIt.<br>
                            <span class="signature-name">— The TackleIt Team</span>
                        </p>
                    </div>
                </div>
                
                <div class="footer">
                    <p class="footer-text">
                        You're receiving this because you're a TackleIt user.<br>
                        <a href="https://tackleit.xyz" class="footer-link">tackleit.xyz</a>
                    </p>
                </div>
            </div>
        </div>
    </body>
    </html>
    """


async def send_update_to_all_users(test_mode: bool = False, limit: int = None):
    """Send v2.1.2 update email to all users."""
    print("=" * 60)
    print("TACKLEIT - v2.1.2 UPDATE NOTIFICATION")
    if test_mode:
        print("🧪 TEST MODE - No emails will be sent")
    print("=" * 60)
    
    # Get all users with valid emails
    query = {"email": {"$exists": True, "$ne": ""}}
    users = await users_collection.find(query).to_list(length=None)
    
    if limit:
        users = users[:limit]
    
    print(f"\nTotal users to notify: {len(users)}\n")
    
    email_sent_count = 0
    email_failed_count = 0
    failed_emails = []
    
    fm = FastMail(conf) if not test_mode else None
    
    for i, user in enumerate(users, 1):
        email = user.get("email")
        name = user.get("name", "")
        
        if test_mode:
            print(f"[{i}/{len(users)}] Would send to: {email} ({name or 'No name'})")
            email_sent_count += 1
            continue
        
        try:
            message = MessageSchema(
                subject="TackleIt v2.1.2 — New improvements just for you",
                recipients=[email],
                body=get_update_email_body(name),
                subtype="html"
            )
            await fm.send_message(message)
            email_sent_count += 1
            print(f"✓ [{i}/{len(users)}] Sent to: {email}")
        except Exception as e:
            email_failed_count += 1
            failed_emails.append(email)
            print(f"✗ [{i}/{len(users)}] Failed: {email} - {e}")
        
        # Delay to avoid rate limiting
        await asyncio.sleep(1)
    
    print("\n" + "=" * 60)
    print("SUMMARY" + (" (TEST MODE)" if test_mode else ""))
    print("=" * 60)
    print(f"Total users: {len(users)}")
    print(f"Emails {'would be ' if test_mode else ''}sent: {email_sent_count}")
    if not test_mode:
        print(f"Emails failed: {email_failed_count}")
        if failed_emails:
            print(f"\nFailed emails:")
            for email in failed_emails:
                print(f"  - {email}")
    print("=" * 60)
    
    if test_mode:
        print("\n💡 To send for real, use: python3 send_v2_1_2_update.py --run")
        print("💡 To test with 5 users: python3 send_v2_1_2_update.py --run --limit 5")
    
    print("\n✅ Script completed!")


if __name__ == "__main__":
    import sys
    
    test_mode = True  # Default to test mode for safety
    limit = None
    
    if "--run" in sys.argv:
        test_mode = False
        print("\n⚠️  PRODUCTION MODE - This will send real emails!\n")
        confirm = input("Are you sure you want to proceed? (type 'yes' to confirm): ")
        if confirm.lower() != "yes":
            print("Aborted.")
            sys.exit(0)
    
    if "--limit" in sys.argv:
        try:
            limit_index = sys.argv.index("--limit") + 1
            limit = int(sys.argv[limit_index])
            print(f"\n📊 Limiting to {limit} users\n")
        except (IndexError, ValueError):
            print("Invalid --limit value. Use: --limit 5")
            sys.exit(1)
    
    asyncio.run(send_update_to_all_users(test_mode=test_mode, limit=limit))
