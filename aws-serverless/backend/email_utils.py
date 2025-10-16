import os
from pydantic import SecretStr
from fastapi_mail import FastMail, MessageSchema, ConnectionConfig
from dotenv import load_dotenv

load_dotenv()

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

async def send_email(subject: str, recipients: list, body: str):
    message = MessageSchema(
        subject=subject,
        recipients=recipients,
        body=body,
        subtype="html"
    )

    fm = FastMail(conf)
    await fm.send_message(message)

async def send_pro_welcome_email(email: str, name: str):
    subject = "Welcome to Tackleit Pro!"
    body = f"""
    <html>
        <body>
            <h2>Hi {name},</h2>
            <p>Welcome to Tackleit Pro! You've successfully unlocked premium features:</p>
            <ul>
                <li>Generate recommendations once a week</li>
                <li>Google Sheets Integration</li>
                <li>Email updates for new jobs</li>
                <li>Early access to beta features</li>
            </ul>
            <p>We're excited to have you on board!</p>
            <p>Best,</p>
            <p>The Tackleit Team</p>
        </body>
    </html>
    """
    await send_email(subject, [email], body)

async def send_account_deletion_email(email: str, name: str):
    subject = "Account Deletion Request Received"
    body = f"""
    <html>
        <body>
            <h2>Hi {name},</h2>
            <p>We have received your request to delete your Tackleit account.</p>
            <p>Your account is now in a <strong>30-day cooling-off period</strong>. After this period, your account and all associated data will be permanently deleted.</p>
            <p>If you did not request this, or if you change your mind, you can reactivate your account by simply logging in within the next 30 days.</p>
            <p>We're sorry to see you go.</p>
            <p>Best,</p>
            <p>The Tackleit Team</p>
        </body>
    </html>
    """
    await send_email(subject, [email], body)