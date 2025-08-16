from fastapi import APIRouter, Request, HTTPException
from database import db
from models import SubscriptionStatus, PlanType
import razorpay
import os
from datetime import datetime, timedelta
from email_utils import send_email

router = APIRouter()

users_collection = db["users"]

RAZORPAY_WEBHOOK_SECRET = os.environ.get('RAZORPAY_WEBHOOK_SECRET')

@router.post("/razorpay")
async def razorpay_webhook(request: Request):
    webhook_body = await request.body()
    webhook_signature = request.headers.get('x-razorpay-signature')

    if not webhook_signature:
        raise HTTPException(status_code=400, detail="Signature missing")

    if not RAZORPAY_WEBHOOK_SECRET:
        raise HTTPException(status_code=500, detail="Webhook secret not configured")

    try:
        client = razorpay.Client(auth=(os.environ.get("RAZORPAY_KEY_ID"), os.environ.get("RAZORPAY_KEY_SECRET")))
        client.utility.verify_webhook_signature(webhook_body.decode('utf-8'), webhook_signature, RAZORPAY_WEBHOOK_SECRET)
    except razorpay.errors.SignatureVerificationError:
        raise HTTPException(status_code=400, detail="Invalid signature")

    webhook_event = await request.json()
    event_type = webhook_event.get('event')
    payload = webhook_event.get('payload', {})

    if event_type == 'subscription.charged':
        subscription_id = payload.get('subscription', {}).get('id')
        if subscription_id:
            new_valid_until = datetime.utcnow() + timedelta(days=31)
            await users_collection.update_one(
                {"razorpay_subscription_id": subscription_id},
                {"$set": {
                    "plan_status": "active",
                    "subscription_status": SubscriptionStatus.active,
                    "subscription_valid_until": new_valid_until,
                    "updated_at": datetime.utcnow()
                }}
            )
            user = await users_collection.find_one({"razorpay_subscription_id": subscription_id})
            if user:
                subject = "Your Tackleit Pro Subscription is Active"
                body = f"""Hi {user.get('name', 'there')},<br><br>
                           Your payment for the Tackleit Pro subscription has been successfully processed. Your Pro features are now active.<br><br>
                           Your subscription will renew on {new_valid_until.strftime('%Y-%m-%d')}.<br><br>
                           Best,<br>The Tackleit Team"""
                await send_email(subject, [user["email"]], body)

    elif event_type == 'subscription.cancelled':
        subscription_id = payload.get('subscription', {}).get('id')
        if subscription_id:
            user = await users_collection.find_one({"razorpay_subscription_id": subscription_id})
            if user:
                await users_collection.update_one(
                    {"_id": user["_id"]},
                    {"$set": {
                        "plan_status": "cancelled",
                        "subscription_status": SubscriptionStatus.cancelled,
                        "updated_at": datetime.utcnow()
                    }}
                )
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
                    {"$set": {
                        "plan_status": "halted",
                        "subscription_status": SubscriptionStatus.past_due,
                        "updated_at": datetime.utcnow()
                    }}
                )
                subject = "Action Required: Your Tackleit Pro Payment Failed"
                body = f"""Hi {user.get('name', 'there')},<br><br>
                           We're having trouble processing your payment for your Tackleit Pro subscription. This might be due to an expired card or insufficient funds.<br><br>
                           Please update your payment method in your Razorpay customer portal to continue enjoying Pro features without interruption.<br><br>
                           Best,<br>The Tackleit Team"""
                await send_email(subject, [user["email"]], body)

    elif event_type == 'subscription.resumed':
        subscription_id = payload.get('subscription', {}).get('id')
        if subscription_id:
            user = await users_collection.find_one({"razorpay_subscription_id": subscription_id})
            if user:
                await users_collection.update_one(
                    {"_id": user["_id"]},
                    {"$set": {
                        "plan_status": "active",
                        "subscription_status": SubscriptionStatus.active,
                        "updated_at": datetime.utcnow()
                    }}
                )
                subject = "Your Tackleit Pro Subscription Has Been Resumed"
                body = f"""Hi {user.get('name', 'there')},<br><br>
                           Welcome back! Your subscription to Tackleit Pro has been successfully resumed. You can now continue to enjoy all the Pro features.<br><br>
                           Best,<br>The Tackleit Team"""
                await send_email(subject, [user["email"]], body)

    elif event_type == 'refund.processed':
        payment_id = payload.get('refund', {}).get('payment_id')
        if payment_id:
            # We need to find the user via the payment, this is a bit indirect.
            # This part of the logic depends on how you store payment details.
            # Assuming you have a payments collection or can find the user by other means.
            # For now, let's assume we can't reliably find the user from a refund and log it.
            # In a real-world scenario, you'd want a way to link refunds back to users.
            print(f"Refund processed for payment_id: {payment_id}. Manual user intervention may be required.")

    return {"status": "ok"}