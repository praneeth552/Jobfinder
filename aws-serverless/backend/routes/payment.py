from fastapi import APIRouter, Depends, HTTPException, status
from database import db
from utils import get_current_user
import razorpay
import os
from dotenv import load_dotenv

load_dotenv()

router = APIRouter()

razorpay_client = razorpay.Client(
    auth=(os.getenv("RAZORPAY_KEY_ID"), os.getenv("RAZORPAY_KEY_SECRET"))
)

users_collection = db["users"]

@router.post("/create-pro-subscription", status_code=status.HTTP_200_OK)
async def create_pro_subscription(current_user: dict = Depends(get_current_user)):
    user_email = current_user.get("email")
    if not user_email:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User not authenticated",
        )

    user = await users_collection.find_one({"email": user_email})
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )

    razorpay_customer_id = user.get("razorpay_customer_id")
    if not razorpay_customer_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Razorpay customer ID not found for this user.",
        )

    plan_id = os.getenv("RAZORPAY_PRO_PLAN_ID")
    
    # --- DEBUG LOGGING ---
    print(f"Attempting to create subscription for: {user_email}")
    print(f"Using Razorpay Customer ID: {razorpay_customer_id}")
    print(f"Using Razorpay Plan ID: {plan_id}")
    # --- END DEBUG LOGGING ---

    if not plan_id:
        print("ERROR: RAZORPAY_PRO_PLAN_ID is not set in the environment.")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Razorpay plan ID is not configured.",
        )

    try:
        subscription = razorpay_client.subscription.create({
            "plan_id": plan_id,
            "customer_id": razorpay_customer_id,
            "customer_notify": 1,
            "total_count": 12,
        })

        # Save the subscription ID to the user's record
        await users_collection.update_one(
            {"email": user_email},
            {"$set": {"razorpay_subscription_id": subscription["id"]}}
        )

        return {
            "subscription_id": subscription["id"],
            "plan_id": plan_id,
        }

    except Exception as e:
        print(f"Razorpay API Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/create-portal-session", status_code=status.HTTP_200_OK)
async def create_portal_session(current_user: dict = Depends(get_current_user)):
    user_email = current_user.get("email")
    user = await users_collection.find_one({"email": user_email})

    if not user or not user.get("razorpay_customer_id"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User is not a Razorpay customer.",
        )
    
    subscription_id = user.get("razorpay_subscription_id")
    if not subscription_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Razorpay subscription ID not found for this user.",
        )

    try:
        portal_session = razorpay_client.invoice.create({
            "type": "link",
            "subscription_id": subscription_id
        })
        return {"portal_url": portal_session["short_url"]}
    except Exception as e:
        print(f"Razorpay Portal Session Error: {e}")
        raise HTTPException(status_code=500, detail="Could not create customer portal session.")