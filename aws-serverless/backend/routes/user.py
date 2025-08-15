from fastapi import APIRouter, Depends, HTTPException, status
from database import db
from utils import get_current_user
from email_utils import send_pro_welcome_email
from bson import ObjectId
from datetime import datetime
import razorpay
import os

router = APIRouter()
users_collection = db["users"]

razorpay_client = razorpay.Client(
    auth=(os.getenv("RAZORPAY_KEY_ID"), os.getenv("RAZORPAY_KEY_SECRET"))
)

@router.post("/upgrade", status_code=status.HTTP_200_OK)
async def upgrade_to_pro(current_user: dict = Depends(get_current_user)):
    user_email = current_user.get("email")
    user_name = current_user.get("name")
    if not user_email:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User not authenticated",
        )

    result = await users_collection.update_one(
        {"email": user_email},
        {"$set": {"plan_type": "pro"}}
    )

    if result.modified_count == 0:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found or already a pro member."
        )

    await send_pro_welcome_email(user_email, user_name)

    return {"message": "User successfully upgraded to Pro"}

@router.get("/subscription", status_code=status.HTTP_200_OK)
async def get_subscription_details(current_user: dict = Depends(get_current_user)):
    user_email = current_user.get("email")
    user = await users_collection.find_one({"email": user_email})

    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )

    return {
        "plan_status": user.get("plan_status"),
        "subscription_valid_until": user.get("subscription_valid_until"),
    }

@router.get("/me", status_code=status.HTTP_200_OK)
async def get_user_me(current_user: dict = Depends(get_current_user)):
    user_email = current_user.get("email")
    user = await users_collection.find_one({"email": user_email})

    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )

    subscription_id = user.get("razorpay_subscription_id")
    if subscription_id:
        try:
            subscription_details = razorpay_client.subscription.fetch(subscription_id)
            
            status = subscription_details.get("status")
            valid_until_timestamp = subscription_details.get("current_end")
            valid_until_dt = datetime.fromtimestamp(valid_until_timestamp) if valid_until_timestamp else None

            # Determine plan_type based on status and expiry date
            is_expired = not valid_until_dt or datetime.utcnow() > valid_until_dt

            if is_expired:
                current_plan_type = "free"
                # If the subscription expired, we might want to clear the status or set it to 'expired'
                # For now, we just downgrade the plan_type
            elif status == "cancelled":
                # If cancelled, they retain pro access until the period ends.
                current_plan_type = "pro"
            elif status in ["active", "pending", "halted"]:
                current_plan_type = "pro"
            else: # Covers 'expired', 'completed', or any other unforeseen statuses
                current_plan_type = "free"

            # Update our database with the latest info from Razorpay
            await users_collection.update_one(
                {"_id": user["_id"]},
                {"$set": {
                    "plan_status": status,
                    "subscription_valid_until": valid_until_dt,
                    "plan_type": current_plan_type
                }}
            )
            # Re-fetch user data after update to ensure consistency
            user = await users_collection.find_one({"email": user_email})

        except Exception as e:
            print(f"Could not fetch subscription from Razorpay: {e}")
            # If subscription is not found on razorpay, it might be invalid or old.
            # Default to a free plan status.
            await users_collection.update_one(
                {"_id": user["_id"]},
                {"$set": {"plan_type": "free", "plan_status": "expired"}}
            )
            user = await users_collection.find_one({"email": user_email})

    # Convert ObjectId to string for JSON serialization
    user["_id"] = str(user["_id"])

    return user
