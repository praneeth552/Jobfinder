from fastapi import APIRouter, Depends, HTTPException, status
from database import db
from utils import get_current_user
from email_utils import send_pro_welcome_email
from bson import ObjectId

router = APIRouter()
users_collection = db["users"]

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
async def get_user_details(current_user: dict = Depends(get_current_user)):
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

    return {
        "name": user.get("name"),
        "email": user.get("email"),
        "plan_type": user.get("plan_type", "free"),
        "is_first_time_user": user.get("is_first_time_user", True),
        "user_id": str(user.get("_id")),
        "sheets_enabled": user.get("sheets_enabled", False)
    }

@router.get("/{user_id}/plan")
async def get_user_plan(user_id: str):
    try:
        user_object_id = ObjectId(user_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid user ID format")

    user = await users_collection.find_one({"_id": user_object_id})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    return {"plan_type": user.get("plan_type", "free")}
