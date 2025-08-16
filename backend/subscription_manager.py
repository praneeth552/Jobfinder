
import asyncio
from datetime import datetime, timedelta
from database import db
from models import PlanType, SubscriptionStatus
from email_utils import send_email

users_collection = db["users"]

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
    """
    print("Starting daily scan for expired subscriptions...")
    now = datetime.utcnow()
    
    expired_users_cursor = users_collection.find({
        "plan_type": PlanType.pro,
        "subscription_valid_until": {"$lt": now},
        "subscription_status": {"$ne": SubscriptionStatus.cancelled}
    })

    async for user in expired_users_cursor:
        user_id = user["_id"]
        print(f"Downgrading user {user_id} ({user['email']}) due to expired subscription.")
        
        await users_collection.update_one(
            {"_id": user_id},
            {"$set": {
                "plan_type": PlanType.free,
                "subscription_status": SubscriptionStatus.unpaid,
                "razorpay_subscription_id": None,
                "plan_status": "expired",
                "updated_at": now
            }}
        )

    cancelled_expired_cursor = users_collection.find({
        "plan_type": PlanType.pro,
        "subscription_status": SubscriptionStatus.cancelled,
        "subscription_valid_until": {"$lt": now}
    })

    async for user in cancelled_expired_cursor:
        user_id = user["_id"]
        print(f"Finalizing downgrade for cancelled user {user_id} ({user['email']}).")

        await users_collection.update_one(
            {"_id": user_id},
            {"$set": {
                "plan_type": PlanType.free,
                "razorpay_subscription_id": None,
                "plan_status": "expired",
                "updated_at": now
            }}
        )

    print("Finished daily scan for expired subscriptions.")

async def daily_subscription_tasks():
    await send_renewal_reminders()
    await downgrade_expired_subscriptions()

if __name__ == "__main__":
    asyncio.run(daily_subscription_tasks())
