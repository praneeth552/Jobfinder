from fastapi import APIRouter, Depends, HTTPException
from models import UserPreferences
from database import db
from utils import get_current_user
from email_utils import send_email
import json

router = APIRouter()

users_collection = db["users"]

def format_preferences_for_email(prefs):
    if not prefs:
        return "No preferences set."
    
    def format_value(value):
        if isinstance(value, list):
            return ", ".join(value) if value else "Not set"
        return value or "Not set"

    return f"""
        - <b>Roles:</b> {format_value(prefs.get('role'))}
        - <b>Locations:</b> {format_value(prefs.get('location'))}
        - <b>Tech Stack:</b> {format_value(prefs.get('tech_stack'))}
        - <b>Experience Level:</b> {format_value(prefs.get('experience_level'))}
        - <b>Desired Salary:</b> {format_value(prefs.get('desired_salary'))}
        - <b>Company Size:</b> {format_value(prefs.get('company_size'))}
        - <b>Job Type:</b> {format_value(prefs.get('job_type'))}
        - <b>Work Arrangement:</b> {format_value(prefs.get('work_arrangement'))}
    """

@router.post("")
async def save_preferences(preferences: UserPreferences, current_user: dict = Depends(get_current_user)):
    email = current_user["email"]

    # Get user's current data to check plan and old preferences
    user_data = await users_collection.find_one({"email": email})
    if not user_data:
        raise HTTPException(status_code=404, detail="User not found")

    old_preferences = user_data.get("preferences", {})
    user_plan = user_data.get("plan_type", "free")

    # Update user preferences in DB
    new_preferences_dict = preferences.dict()
    result = await users_collection.update_one(
        {"email": email},
        {"$set": {
            "preferences": new_preferences_dict,
            "is_first_time_user": False
        }}
    )

    if result.modified_count == 0:
        # This might happen if the preferences are the same. 
        # We can still return success, as the state is what the user desires.
        return {"message": "Preferences are up to date."}

    # If the user is a Pro member, send a notification email
    if user_plan == "pro":
        try:
            email_body = f"""
            <html>
                <body>
                    <h2>Your Job Preferences Have Been Updated</h2>
                    <p>Hello {user_data.get('name', '')},</p>
                    <p>This is a confirmation that your job preferences on Job Finder have been successfully updated. Here are the changes:</p>
                    
                    <h3>Previous Preferences:</h3>
                    <ul>{format_preferences_for_email(old_preferences)}</ul>
                    
                    <h3>New Preferences:</h3>
                    <ul>{format_preferences_for_email(new_preferences_dict)}</ul>
                    
                    <p>Your future job recommendations will now be based on your new settings.</p>
                    <p>Best regards,<br>The Job Finder Team</p>
                </body>
            </html>
            """
            await send_email(
                subject="Your Job Finder Preferences Have Been Updated",
                recipients=[email],
                body=email_body
            )
        except Exception as e:
            # Log the error but don't block the user response
            print(f"Failed to send preference update email to {email}: {e}")

    return {"message": "Preferences saved successfully"}


@router.get("")
async def get_preferences(current_user: dict = Depends(get_current_user)):
    email = current_user["email"]
    user = await users_collection.find_one({"email": email})

    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    return user.get("preferences", {})
