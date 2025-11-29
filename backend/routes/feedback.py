from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field
from database import db
from utils import get_current_user
from bson import ObjectId
from datetime import datetime

router = APIRouter()

feedback_collection = db["feedback"]
users_collection = db["users"]

class FeedbackSubmission(BaseModel):
    rating: int = Field(..., ge=1, le=5, description="Rating from 1-5")
    comment: str | None = Field(None, max_length=200, description="Optional comment")
    trigger: str = Field(..., pattern="^(job_generation|manual|periodic)$")

class FeedbackStatsResponse(BaseModel):
    total_responses: int
    average_rating: float
    five_star_count: int

@router.post("/feedback", status_code=status.HTTP_201_CREATED)
async def submit_feedback(
    feedback: FeedbackSubmission,
    current_user: dict = Depends(get_current_user)
):
    """Submit user feedback"""
    user_id = current_user.get("_id")
    
    feedback_doc = {
        "user_id": ObjectId(user_id),
        "rating": feedback.rating,
        "comment": feedback.comment,
        "trigger": feedback.trigger,
        "created_at": datetime.utcnow(),
        "plan_type": current_user.get("plan_type", "free"),
        "approved_for_display": False,  # Requires admin approval
        "display_name": None
    }
    
    result = await feedback_collection.insert_one(feedback_doc)
    
    #Update user's last feedback timestamp
    await users_collection.update_one(
        {"_id": ObjectId(user_id)},
        {"$set": {"last_feedback_given": datetime.utcnow()}}
    )
    
    return {
        "message": "Thank you for your feedback!",
        "feedback_id": str(result.inserted_id)
    }

@router.get("/feedback/stats", response_model=FeedbackStatsResponse)
async def get_feedback_stats():
    """Get public feedback statistics for landing page"""
    total_feedback = await feedback_collection.count_documents({})
    
    if total_feedback == 0:
        return {
            "total_responses": 0,
            "average_rating": 0,
            "five_star_count": 0
        }
    
    # Calculate average rating
    pipeline = [
        {"$group": {"_id": None, "avg": {"$avg": "$rating"}}}
    ]
    avg_result = await feedback_collection.aggregate(pipeline).to_list(1)
    avg_rating = round(avg_result[0]["avg"], 1) if avg_result else 0
    
    # Count 5-star ratings
    five_star_count = await feedback_collection.count_documents({"rating": 5})
    
    return {
        "total_responses": total_feedback,
        "average_rating": avg_rating,
        "five_star_count": five_star_count
    }

@router.get("/feedback/user/history")
async def get_user_feedback_history(current_user: dict = Depends(get_current_user)):
    """Get current user's feedback history"""
    user_id = current_user.get("_id")
    
    feedback_list = await feedback_collection.find(
        {"user_id": ObjectId(user_id)}
    ).sort("created_at", -1).to_list(length=10)
    
    # Convert ObjectIds to strings
    for feedback in feedback_list:
        feedback["_id"] = str(feedback["_id"])
        feedback["user_id"] = str(feedback["user_id"])
        
    return {"feedback": feedback_list}
