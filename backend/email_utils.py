import os
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
    subject = "Welcome to JobFinder Pro!"
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