from fastapi import APIRouter, Depends, HTTPException, status
from database import db
from utils import get_current_user
from bson import ObjectId

router = APIRouter()
users_collection = db["users"]

@router.post("/upgrade", status_code=status.HTTP_200_OK)
async def upgrade_to_pro(current_user: dict = Depends(get_current_user)):
    user_email = current_user.get("email")
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

    return {"message": "User successfully upgraded to Pro"}
