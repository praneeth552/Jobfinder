from fastapi import APIRouter, Depends, HTTPException, status
from database import db
from dependencies import get_current_user
from utils import is_pro_user
from email_utils import send_pro_welcome_email, send_account_deletion_email
from models import UserDataResponse, UserProfileResponse, DeleteAccountResponse, ResumeDataResponse, UserStatsResponse
from bson import ObjectId
from datetime import datetime, timedelta
from encryption import decrypt_field
import razorpay
import os
import asyncio
import uuid

router = APIRouter()
users_collection = db["users"]
recommendations_collection = db["recommendations"]
tasks_collection = db["generation_tasks"]

# Import recommendation generation function (lazy import to avoid circular dependency)
def get_recommendation_generator():
    from routes.recommendations import _run_recommendation_generation
    return _run_recommendation_generation

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
            },
            "$inc": {"loyalty_coins": 10}
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

        # --- Defensive check for user preferences ---
        if "preferences" not in current_user or not current_user.get("preferences"):
            current_user["preferences"] = {"role": [], "location": [], "tech_stack": []}
        else:
            if "role" not in current_user["preferences"]:
                current_user["preferences"]["role"] = []
            if "location" not in current_user["preferences"]:
                current_user["preferences"]["location"] = []
            if "tech_stack" not in current_user["preferences"]:
                current_user["preferences"]["tech_stack"] = []

        # --- Data Consistency Check for Pro Users ---
        if current_user.get("plan_type") == "pro" and not current_user.get("subscription_valid_until"):
            subscription_id = current_user.get("razorpay_subscription_id")
            if subscription_id:
                try:
                    print(f"User {current_user.get('email')} is missing billing date. Fetching from Razorpay.")
                    subscription = razorpay_client.subscription.fetch(subscription_id)
                    # Use 'current_end' for the next billing date
                    next_billing_date = datetime.fromtimestamp(subscription['current_end'])
                    
                    # Update the database for future requests
                    await users_collection.update_one(
                        {"_id": ObjectId(user_id_str)},
                        {"$set": {"subscription_valid_until": next_billing_date}}
                    )
                    
                    # Update the object for the current request
                    current_user["subscription_valid_until"] = next_billing_date
                    print(f"Successfully updated billing date for {current_user.get('email')}")

                except Exception as e:
                    print(f"Could not fetch subscription from Razorpay for user {current_user.get('email')}: {e}")
                    # If Razorpay fetch fails, we can't do much, but the app won't crash.

        # --- Set default for sheets_enabled if missing ---
        if "sheets_enabled" not in current_user:
            current_user["sheets_enabled"] = False

        if "auth_type" not in current_user:
            current_user["auth_type"] = "standard" # Fallback for older users

        # --- Calculate Next Allowed Generation Time ---
        last_recommendation = await recommendations_collection.find_one(
            {"user_id": user_id_str}, sort=[("generated_at", -1)]
        )
        if last_recommendation and last_recommendation.get("generated_at"):
            gen_interval = timedelta(days=7) if is_pro_user(current_user) else timedelta(days=30)
            current_user["next_generation_allowed_at"] = last_recommendation["generated_at"] + gen_interval
        else:
            current_user["next_generation_allowed_at"] = datetime.utcnow()

        # --- Calculate Next Allowed Resume Upload Time ---
        if current_user.get("last_resume_upload"):
            upload_interval = timedelta(days=7) if is_pro_user(current_user) else timedelta(days=30)
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
    user_id = current_user.get("_id")  # Already a string from dependencies.py
    user = await users_collection.find_one({"_id": ObjectId(user_id)})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    if "sheets_enabled" not in user:
        user["sheets_enabled"] = False

    resume_data = await db.resumes.find_one({"user_id": ObjectId(user_id)})

    user["_id"] = str(user["_id"])
    if resume_data:
        resume_data["_id"] = str(resume_data["_id"])
        resume_data["user_id"] = str(resume_data["user_id"])
        # Decrypt resume PII fields before returning
        if resume_data.get("name"):
            resume_data["name"] = decrypt_field(resume_data["name"])
        if resume_data.get("email"):
            resume_data["email"] = decrypt_field(resume_data["email"])
        if resume_data.get("phone"):
            resume_data["phone"] = decrypt_field(resume_data["phone"])

    return {
        "user_profile": user,
        "resume_data": resume_data,
    }

@router.get("/me/stats", response_model=UserStatsResponse, status_code=status.HTTP_200_OK)
async def get_user_stats(current_user: dict = Depends(get_current_user)):
    user_id = current_user.get("_id")
    user = await users_collection.find_one({"_id": ObjectId(user_id)})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    total_minutes_saved = user.get("time_saved_minutes", 0)
    return {"total_minutes_saved": total_minutes_saved}

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
    
    # This is a temporary solution. In a real-world scenario, this should be handled
    # by a scheduled task that runs after the 30-day grace period.
    deleted_users_collection = db["deleted_users"]
    await deleted_users_collection.insert_one({"email": user_email, "deleted_at": datetime.utcnow()})
    
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



@router.post("/redeem-reward", status_code=status.HTTP_200_OK)

async def redeem_reward(current_user: dict = Depends(get_current_user)):

    user_id = current_user.get("_id")

    user = await users_collection.find_one({"_id": ObjectId(user_id)})



    if not user:

        raise HTTPException(status_code=404, detail="User not found")



    if user.get("loyalty_coins", 0) < 99:

        raise HTTPException(status_code=400, detail="Not enough TackleTokens to redeem a reward.")



    # Decrement coins and extend subscription in one operation

    current_expiry = user.get("subscription_valid_until")

    if current_expiry and current_expiry > datetime.utcnow():

        new_expiry = current_expiry + timedelta(days=31)

    else:

        new_expiry = datetime.utcnow() + timedelta(days=31)



    await users_collection.update_one(

        {"_id": ObjectId(user_id)},

        {

            "$inc": {"loyalty_coins": -99},

            "$set": {"subscription_valid_until": new_expiry}

        }

    )



    return {"message": "Reward redeemed successfully! Your Pro plan has been extended by one month."}


# --- Onboarding Endpoints ---

@router.post("/onboarding/complete", status_code=status.HTTP_200_OK)
async def complete_onboarding(current_user: dict = Depends(get_current_user)):
    """Mark onboarding as completed for the user and auto-generate recommendations if applicable"""
    user_id = current_user.get("_id")
    
    await users_collection.update_one(
        {"_id": ObjectId(user_id)},
        {
            "$set": {
                "onboarding_completed": True,
                "onboarding_completed_at": datetime.utcnow()
            }
        }
    )
    
    # Auto-trigger recommendation generation for new users with preferences
    auto_generation_started = False
    task_id = None
    
    try:
        user = await users_collection.find_one({"_id": ObjectId(user_id)})
        if user:
            preferences = user.get("preferences", {})
            # Check if user has meaningful preferences set
            has_preferences = bool(
                preferences.get("role") or 
                preferences.get("tech_stack") or 
                preferences.get("location")
            )
            
            if has_preferences:
                # Check if user already has recommendations
                existing_recs = await recommendations_collection.find_one({"user_id": str(user_id)})
                existing_jobs = user.get("job_applications", [])
                
                if not existing_recs and not existing_jobs:
                    # Create a generation task and start background recommendation generation
                    task_id = str(uuid.uuid4())
                    await tasks_collection.insert_one({
                        "_id": task_id,
                        "user_id": str(user_id),
                        "status": "pending",
                        "source": "onboarding_auto",
                        "created_at": datetime.utcnow(),
                        "updated_at": datetime.utcnow()
                    })
                    
                    # Get the recommendation generator and run it
                    _run_recommendation_generation = get_recommendation_generator()
                    asyncio.create_task(_run_recommendation_generation(str(user_id), task_id))
                    auto_generation_started = True
                    print(f"DEBUG: Auto-started recommendation generation for new user {user_id}")
    except Exception as e:
        print(f"DEBUG: Failed to auto-start recommendations for user {user_id}: {e}")
        # Don't fail the onboarding request if auto-generation fails
    
    return {
        "message": "Onboarding completed successfully",
        "auto_generation_started": auto_generation_started,
        "task_id": task_id
    }


@router.post("/onboarding/skip", status_code=status.HTTP_200_OK)
async def skip_onboarding(current_user: dict = Depends(get_current_user)):
    """Mark onboarding as skipped and auto-generate recommendations if applicable"""
    user_id = current_user.get("_id")
    
    await users_collection.update_one(
        {"_id": ObjectId(user_id)},
        {
            "$set": {
                "onboarding_completed": True,  # Treat skip as completion
                "onboarding_completed_at": datetime.utcnow()
            }
        }
    )
    
    # Auto-trigger recommendation generation for new users with preferences
    auto_generation_started = False
    task_id = None
    
    try:
        user = await users_collection.find_one({"_id": ObjectId(user_id)})
        if user:
            preferences = user.get("preferences", {})
            # Check if user has meaningful preferences set
            has_preferences = bool(
                preferences.get("role") or 
                preferences.get("tech_stack") or 
                preferences.get("location")
            )
            
            if has_preferences:
                # Check if user already has recommendations
                existing_recs = await recommendations_collection.find_one({"user_id": str(user_id)})
                existing_jobs = user.get("job_applications", [])
                
                if not existing_recs and not existing_jobs:
                    # Create a generation task and start background recommendation generation
                    task_id = str(uuid.uuid4())
                    await tasks_collection.insert_one({
                        "_id": task_id,
                        "user_id": str(user_id),
                        "status": "pending",
                        "source": "onboarding_skip_auto",
                        "created_at": datetime.utcnow(),
                        "updated_at": datetime.utcnow()
                    })
                    
                    # Get the recommendation generator and run it
                    _run_recommendation_generation = get_recommendation_generator()
                    asyncio.create_task(_run_recommendation_generation(str(user_id), task_id))
                    auto_generation_started = True
                    print(f"DEBUG: Auto-started recommendation generation for skipped-onboarding user {user_id}")
    except Exception as e:
        print(f"DEBUG: Failed to auto-start recommendations for user {user_id}: {e}")
        # Don't fail the skip request if auto-generation fails
    
    return {
        "message": "Onboarding skipped",
        "auto_generation_started": auto_generation_started,
        "task_id": task_id
    }


@router.post("/onboarding/reset", status_code=status.HTTP_200_OK)
async def reset_onboarding(current_user: dict = Depends(get_current_user)):
    """Reset onboarding to allow user to replay the tutorial"""
    user_id = current_user.get("_id")
    
    await users_collection.update_one(
        {"_id": ObjectId(user_id)},
        {
            "$set": {
                "onboarding_completed": False
            },
            "$unset": {
                "onboarding_completed_at": ""
            }
        }
    )
    
    return {"message": "Onboarding reset successfully. Reload the page to see the tour again."}


@router.post("/changelog/seen", status_code=status.HTTP_200_OK)
async def mark_changelog_seen(request: dict, current_user: dict = Depends(get_current_user)):
    """Mark that user has seen a specific changelog version"""
    user_id = current_user.get("_id")
    version = request.get("version", "2.1.1")
    
    await users_collection.update_one(
        {"_id": ObjectId(user_id)},
        {"$set": {"last_seen_version": version}}
    )
    
    return {"message": "Changelog marked as seen", "version": version}


@router.post("/preferences/animations", status_code=status.HTTP_200_OK)
async def update_animation_preference(
    request: dict,
    current_user: dict = Depends(get_current_user)
):
    """Update user's animation preference"""
    user_id = current_user.get("_id")
    enabled = request.get("enabled", True)
    
    await users_collection.update_one(
        {"_id": ObjectId(user_id)},
        {"$set": {"animations_enabled": enabled}}
    )
    
    return {"message": "Animation preference updated", "enabled": enabled}
