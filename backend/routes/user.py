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
    # The get_current_user dependency already fetches the user from the DB.
    # We can trust our webhooks and daily cron job to keep the user's
    # subscription status up-to-date in our database.
    # This makes the API faster and avoids hitting Razorpay on every page load.
    
    # The user object from the dependency is already what we need.
    # Just ensure the _id is a string for JSON serialization.
    current_user["_id"] = str(current_user["_id"])
    
    return current_user