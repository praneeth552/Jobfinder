from fastapi import APIRouter, Depends, HTTPException, status
from database import db
from utils import get_current_user, create_access_token
from email_utils import send_pro_welcome_email, send_account_deletion_email
from models import UserDataResponse, UserProfileResponse, DeleteAccountResponse, ResumeDataResponse
from bson import ObjectId
from datetime import datetime, timedelta
import razorpay
import os

router = APIRouter()
users_collection = db["users"]
recommendations_collection = db["recommendations"]

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

    user = await users_collection.find_one({"email": user_email})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    subscription_id = user.get("razorpay_subscription_id")
    if not subscription_id:
        raise HTTPException(status_code=400, detail="Subscription not found")

    try:
        subscription = razorpay_client.subscription.fetch(subscription_id)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch subscription from Razorpay: {e}")

    await users_collection.update_one(
        {"email": user_email},
        {
            "$set": {
                "plan_type": "pro",
                "plan_status": "active",
                "subscription_valid_until": datetime.fromtimestamp(subscription["end_at"]),
            }
        },
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

@router.get("/me", response_model=UserProfileResponse, status_code=status.HTTP_200_OK)
async def get_user_me(current_user: dict = Depends(get_current_user)):
    try:
        user_id_str = str(current_user["_id"])

        # --- Set default for sheets_enabled if missing ---
        if "sheets_enabled" not in current_user:
            current_user["sheets_enabled"] = False

        # --- Calculate Next Allowed Generation Time ---
        last_recommendation = await recommendations_collection.find_one(
            {"user_id": user_id_str}, sort=[("generated_at", -1)]
        )
        if last_recommendation and last_recommendation.get("generated_at"):
            gen_interval = timedelta(days=7) if current_user.get("plan_type") == "pro" else timedelta(days=30)
            current_user["next_generation_allowed_at"] = last_recommendation["generated_at"] + gen_interval
        else:
            current_user["next_generation_allowed_at"] = datetime.utcnow()

        # --- Calculate Next Allowed Resume Upload Time ---
        if current_user.get("last_resume_upload"):
            upload_interval = timedelta(days=7) if current_user.get("plan_type") == "pro" else timedelta(days=30)
            current_user["next_resume_upload_allowed_at"] = current_user["last_resume_upload"] + upload_interval
        else:
            current_user["next_resume_upload_allowed_at"] = datetime.utcnow()

        current_user["_id"] = user_id_str
        return current_user
    except Exception as e:
        print(f"Error in /user/me for user {current_user.get('email')}: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"An unexpected error occurred while fetching user data. Please try again later.",
        )

@router.get("/job_applications", status_code=status.HTTP_200_OK)
async def get_user_job_applications(current_user: dict = Depends(get_current_user)):
    user_id = current_user.get("_id")
    user = await users_collection.find_one({"_id": ObjectId(user_id)})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    job_applications = user.get("job_applications", [])
    
    for app in job_applications:
        if "_id" in app:
            app["_id"] = str(app["_id"])
        if "job_details" in app and "_id" in app["job_details"]:
            app["job_details"]["_id"] = str(app["job_details"]["_id"])

    return {"job_applications": job_applications}

@router.get("/me/data", response_model=UserDataResponse, status_code=status.HTTP_200_OK)
async def get_user_data(current_user: dict = Depends(get_current_user)):
    user_id = current_user.get("_id")
    user = await users_collection.find_one({"_id": ObjectId(user_id)})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    resume_data = await db.resumes.find_one({"user_id": ObjectId(user_id)})

    user["_id"] = str(user["_id"])
    if resume_data:
        resume_data["_id"] = str(resume_data["_id"])
        resume_data["user_id"] = str(resume_data["user_id"])

    return {
        "user_profile": user,
        "resume_data": resume_data,
    }

@router.delete("/me/delete", response_model=DeleteAccountResponse, status_code=status.HTTP_200_OK)
async def delete_user_account(current_user: dict = Depends(get_current_user)):
    user_id = current_user.get("_id")
    user_email = current_user.get("email")
    user_name = current_user.get("name")
    
    await users_collection.update_one(
        {"_id": ObjectId(user_id)},
        {
            "$set": {
                "plan_status": "pending_deletion",
                "deletion_requested_at": datetime.utcnow(),
            }
        },
    )
    
    await send_account_deletion_email(user_email, user_name)
    
    return {"message": "Your account has been scheduled for deletion."}

@router.post("/me/restore", status_code=status.HTTP_200_OK)
async def restore_user_account(current_user: dict = Depends(get_current_user)):
    user_id = current_user.get("_id")
    
    await users_collection.update_one(
        {"_id": ObjectId(user_id)},
        {
            "$set": {
                "plan_status": "active",
            },
            "$unset": {
                "deletion_requested_at": ""
            }
        },
    )
    
    db_user = await users_collection.find_one({"_id": ObjectId(user_id)})

    token = create_access_token({"email": db_user["email"]})
    
    return {
        "message": "Your account has been successfully restored.",
        "access_token": token,
        "token_type": "bearer",
        "is_first_time_user": db_user.get("is_first_time_user", False),
        "user_id": str(db_user["_id"]),
        "plan_type": db_user.get("plan_type", "free")
    }