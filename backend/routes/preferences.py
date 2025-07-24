from fastapi import APIRouter, Depends, HTTPException
from models import UserPreferences
from database import db
from utils import get_current_user

router = APIRouter()

users_collection = db["users"]

@router.post("")
async def save_preferences(preferences: UserPreferences, current_user: dict = Depends(get_current_user)):
    email = current_user["email"]

    # Update user preferences in DB
    result = await users_collection.update_one(
        {"email": email},
        {"$set": {
            "preferences": {
                "role": preferences.role,
                "location": preferences.location,
                "tech_stack": preferences.tech_stack,
                "experience_level": preferences.experience_level
            },
            "is_first_time_user": False
        }}
    )

    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="User not found or no changes made")

    return {"message": "Preferences saved successfully"}


@router.get("")
async def get_preferences(current_user: dict = Depends(get_current_user)):
    email = current_user["email"]
    user = await users_collection.find_one({"email": email})

    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    return user.get("preferences", {})

