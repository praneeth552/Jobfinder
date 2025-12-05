# TackleIt Email Scripts

This folder contains scripts for sending bulk emails to users.

## Scripts

### 1. `reset_generations_and_notify.py`
One-time script to reset ALL user generation limits and send notification emails.

**Usage:**
```bash
# Test mode (preview only)
python3 reset_generations_and_notify.py

# Production mode (sends real emails)
python3 reset_generations_and_notify.py --run
```

### 2. `send_remaining_50.py`
Script to send emails to the 50 users who didn't receive the notification due to Gmail's daily limit.

**Usage:**
```bash
# Test mode (preview only)
python3 send_remaining_50.py

# Production mode (sends real emails)
python3 send_remaining_50.py --run
```

## Requirements

Make sure you have the following environment variables set in your backend `.env` file:

```env
MONGO_URI=your_mongodb_connection_string
MAIL_USERNAME=your_email@gmail.com
MAIL_PASSWORD=your_app_password
MAIL_FROM=your_email@gmail.com
MAIL_PORT=587
MAIL_SERVER=smtp.gmail.com
```

## Gmail Limits

Gmail has a daily sending limit:
- **Regular Gmail**: ~500 emails/day
- **Google Workspace**: ~2000 emails/day

For higher volumes, consider using:
- SendGrid (100/day free)
- Amazon SES (~$0.10 per 1000)
- Mailgun (5000/month free)

## Running from this folder

```bash
cd /path/to/Tackleit/send_email
python3 <script_name>.py
```

Note: The scripts use the `../.backend/.env` file for configuration.
