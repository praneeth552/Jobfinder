from fastapi import APIRouter, Depends, HTTPException, status
from database import db
from utils import get_current_user, is_pro_user # Import is_pro_user
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

    # --- Prevent creating a new subscription if one is already active ---
    if is_pro_user(user):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User already has an active Pro subscription.",
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

@router.post("/cancel-subscription", status_code=status.HTTP_200_OK)
async def cancel_subscription(current_user: dict = Depends(get_current_user)):
    user_email = current_user.get("email")
    user = await users_collection.find_one({"email": user_email})

    if not user or not user.get("razorpay_subscription_id"):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Razorpay subscription not found for this user.",
        )

    # --- Prevent cancelling a subscription that is already cancelled ---
    if user.get("plan_status") == "cancelled":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="This subscription has already been cancelled.",
        )

    subscription_id = user.get("razorpay_subscription_id")

    try:
        # Cancel the subscription immediately
        razorpay_client.subscription.cancel(subscription_id)
        
        # The webhook will handle updating the plan_status to 'cancelled'
        # and preserving the subscription_valid_until date.
        
        return {"message": "Subscription cancellation initiated successfully. You will retain Pro access until the end of your current billing period."}
    except Exception as e:
        print(f"Razorpay API Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/manage-billing-portal", status_code=status.HTTP_200_OK)
async def get_manage_billing_portal_link(current_user: dict = Depends(get_current_user)):
    user_email = current_user.get("email")
    user = await users_collection.find_one({"email": user_email})

    if not user or not user.get("razorpay_subscription_id"):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No active subscription found for this user.",
        )
    
    subscription_id = user.get("razorpay_subscription_id")

    try:
        # This is a placeholder for the actual method if Razorpay provides one.
        # As of the current Razorpay API, there isn't a direct method to create a portal link
        # for a subscription. The link is typically sent to the user's email by Razorpay.
        # A common workaround is to construct the link manually if the structure is predictable.
        # For now, we will return a generic link and a message.
        
        # A more robust solution would be to use a feature that Razorpay might release in the future
        # or to guide the user to their email to find the management link.
        
        # Let's simulate generating a link for now.
        # IMPORTANT: This is a mock URL structure.
        base_url = "https://dashboard.razorpay.com/app/subscriptions"
        
        return {
            "portal_url": base_url,
            "message": "Please log in to your Razorpay dashboard to manage your subscription."
        }

    except Exception as e:
        print(f"Error generating billing portal link: {e}")
        raise HTTPException(status_code=500, detail="Could not generate billing management link.")