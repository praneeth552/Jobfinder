

import asyncio
from datetime import datetime, timedelta
from bson import ObjectId
from database import db
from models import PlanType, SubscriptionStatus
from email_utils import send_email

users_collection = db["users"]

async def check_and_downgrade_user_if_expired(user: dict) -> dict:
    """
    Checks if a pro user's subscription has expired and downgrades them in real-time if necessary.
    This is the primary mechanism for ensuring user status is always current.
    Returns the (potentially updated) user dictionary.
    """
    now = datetime.utcnow()
    user_plan_type = user.get("plan_type")
    valid_until = user.get("subscription_valid_until")

    # Proceed only if the user is 'pro' and their expiry date has passed
    if user_plan_type == PlanType.pro and valid_until and now > valid_until:
        print(f"User {user.get('email')}'s Pro subscription has expired. Downgrading in real-time.")
        
        update_data = {
            "plan_type": PlanType.free,
            "is_pro_user": False,
            "subscription_status": SubscriptionStatus.unpaid,
            "plan_status": "expired",
            "razorpay_subscription_id": None,
            "pro_access_end_date": None,
            # --- Reset Google Sheets Sync ---
            "is_google_sheets_enabled": False,
            "google_tokens": None,
            "spreadsheet_id": None,
            # ---------------------------------
            "updated_at": now
        }
        
        # Ensure we are using the correct _id object for the update
        user_id = user.get("_id")
        if not isinstance(user_id, ObjectId):
             user_id = ObjectId(user_id)

        await users_collection.update_one(
            {"_id": user_id},
            {"$set": update_data}
        )
        
        # Update the user dictionary in-place to reflect the changes immediately
        user.update(update_data)
        for key in ["google_tokens", "spreadsheet_id", "razorpay_subscription_id", "pro_access_end_date"]:
            if key in user:
                del user[key]

        print(f"User {user.get('email')} has been downgraded to Free plan.")

    return user


async def send_renewal_reminders():
    """
    Scans for users whose subscriptions are renewing soon and sends them a reminder email.
    """
    print("Starting daily scan for upcoming renewals...")
    reminder_period_days = 7
    reminder_date = datetime.utcnow() + timedelta(days=reminder_period_days)

    renewal_candidates_cursor = users_collection.find({
        "plan_type": PlanType.pro,
        "subscription_status": SubscriptionStatus.active,
        "subscription_valid_until": {"$lt": reminder_date}
    })

    async for user in renewal_candidates_cursor:
        user_id = user["_id"]
        print(f"Sending renewal reminder to user {user_id} ({user['email']}).")

        subject = "Your Tackleit Pro Subscription is Renewing Soon"
        body = f"""Hi {user.get('name', 'there')},<br><br>
                   This is a friendly reminder that your subscription to Tackleit Pro is scheduled to renew on {user['subscription_valid_until'].strftime('%Y-%m-%d')}.<br><br>
                   No action is needed to continue your subscription. If you wish to make changes, please visit your account settings.<br><br>
                   Best,<br>The Tackleit Team"""
        await send_email(subject, [user["email"]], body)


async def downgrade_expired_subscriptions():
    """
    Scans for users with expired pro subscriptions and downgrades them to the free plan.
    NOTE: This is a fallback/batch process. The primary real-time check is in check_and_downgrade_user_if_expired.
    """
    print("Starting daily scan for expired subscriptions...")
    now = datetime.utcnow()
    
    # Find users who are still marked as Pro but their end date has passed.
    expired_users_cursor = users_collection.find({
        "plan_type": PlanType.pro,
        "subscription_valid_until": {"$lt": now}
    })

    async for user in expired_users_cursor:
        # The new function handles the entire update logic
        await check_and_downgrade_user_if_expired(user)

    print("Finished daily scan for expired subscriptions.")


async def daily_subscription_tasks():
    await send_renewal_reminders()
    await downgrade_expired_subscriptions()

if __name__ == "__main__":
    asyncio.run(daily_subscription_tasks())

