
from fastapi import APIRouter, Request, HTTPException
from database import db
from models import User
import razorpay
import os
from datetime import datetime, timedelta
from email_utils import send_email

router = APIRouter()

users_collection = db["users"]

RAZORPAY_WEBHOOK_SECRET = os.environ.get('RAZORPAY_WEBHOOK_SECRET')

@router.post("/razorpay")
async def razorpay_webhook(request: Request):
    # Verify the webhook signature
    webhook_body = await request.body()
    webhook_signature = request.headers.get('x-razorpay-signature')

    if not webhook_signature:
        raise HTTPException(status_code=400, detail="Signature missing")

    if not RAZORPAY_WEBHOOK_SECRET:
        raise HTTPException(status_code=500, detail="Webhook secret not configured")

    try:
        client = razorpay.Client(auth=(os.environ.get("RAZORPAY_KEY_ID"), os.environ.get("RAZORPAY_KEY_SECRET")))
        client.utility.verify_webhook_signature(webhook_body.decode('utf-8'), webhook_signature, RAZORPAY_WEBHOOK_SECRET)
    except razorpay.errors.SignatureVerificationError as e:
        raise HTTPException(status_code=400, detail="Invalid signature")

    webhook_event = await request.json()
    event_type = webhook_event.get('event')
    payload = webhook_event.get('payload', {})

    if event_type == 'subscription.charged':
        subscription_id = payload.get('subscription', {}).get('id')
        if subscription_id:
            new_valid_until = datetime.utcnow() + timedelta(days=31) # Add 31 days for the next billing cycle
            await users_collection.update_one(
                {"razorpay_subscription_id": subscription_id},
                {"$set": {
                    "plan_status": "active",
                    "subscription_valid_until": new_valid_until,
                    "updated_at": datetime.utcnow()
                }}
            )

    elif event_type == 'subscription.cancelled':
        subscription_id = payload.get('subscription', {}).get('id')
        if subscription_id:
            user = await users_collection.find_one({"razorpay_subscription_id": subscription_id})
            if user:
                await users_collection.update_one(
                    {"_id": user["_id"]},
                    {"$set": {"plan_status": "cancelled", "updated_at": datetime.utcnow()}}
                )
                # Send cancellation email
                subject = "Your Tackleit Pro Subscription Has Been Cancelled"
                body = f"""Hi {user.get('name', 'there')},<br><br>
                           Your subscription to Tackleit Pro has been successfully cancelled. Your Pro access will remain active until the end of your current billing period.<br><br>
                           Thank you for using Tackleit Pro.<br><br>
                           Best,<br>The Tackleit Team"""
                await send_email(subject, [user["email"]], body)

    elif event_type == 'subscription.halted' or event_type == 'payment.failed':
        subscription_id = payload.get('subscription', {}).get('id')
        if not subscription_id and event_type == 'payment.failed':
             subscription_id = payload.get('payment', {}).get('subscription_id')

        if subscription_id:
            user = await users_collection.find_one({"razorpay_subscription_id": subscription_id})
            if user:
                await users_collection.update_one(
                    {"_id": user["_id"]},
                    {"$set": {"plan_status": "halted", "updated_at": datetime.utcnow()}}
                )
                # Send payment failed email
                subject = "Action Required: Your Tackleit Pro Payment Failed"
                body = f"""Hi {user.get('name', 'there')},<br><br>
                           We're having trouble processing your payment for your Tackleit Pro subscription. This might be due to an expired card or insufficient funds.<br><br>
                           Please update your payment method in your Razorpay customer portal to continue enjoying Pro features without interruption.<br><br>
                           Best,<br>The Tackleit Team"""
                await send_email(subject, [user["email"]], body)

    return {"status": "ok"}
