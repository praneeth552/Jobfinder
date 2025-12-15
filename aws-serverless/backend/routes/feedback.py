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
    trigger: str = Field(..., pattern="^(job_generation|manual|periodic|applied_milestone|time_based|return_visit|success_story|inline_widget)$")

class WidgetFeedback(BaseModel):
    """For inline feedback widget (bug reports, feature requests, experience ratings)"""
    type: str = Field(..., pattern="^(bug|feature|rating)$", description="Type of feedback")
    message: str = Field(..., min_length=1, max_length=500, description="Feedback message")
    trigger: str = Field(default="inline_widget")

class JobFeedback(BaseModel):
    job_url: str = Field(..., description="URL of the job being rated")
    feedback_type: str = Field(..., pattern="^(thumbs_up|thumbs_down)$")
    job_title: str | None = Field(None, description="Job title for reference")

class FeedbackStatsResponse(BaseModel):
    total_responses: int
    average_rating: float
    five_star_count: int

@router.post("/feedback", status_code=status.HTTP_201_CREATED)
async def submit_feedback(
    feedback: FeedbackSubmission,
    current_user: dict = Depends(get_current_user)
):
    """Submit user feedback (rating-based)"""
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
    
    # Update user's last feedback timestamp
    await users_collection.update_one(
        {"_id": ObjectId(user_id)},
        {"$set": {"last_feedback_given": datetime.utcnow()}}
    )
    
    return {
        "message": "Thank you for your feedback!",
        "feedback_id": str(result.inserted_id)
    }

@router.post("/feedback/widget", status_code=status.HTTP_201_CREATED)
async def submit_widget_feedback(
    feedback: WidgetFeedback,
    current_user: dict = Depends(get_current_user)
):
    """Submit inline widget feedback (bug reports, feature requests, ratings)"""
    user_id = current_user.get("_id")
    
    widget_feedback_doc = {
        "user_id": ObjectId(user_id),
        "type": feedback.type,
        "message": feedback.message,
        "trigger": "inline_widget",
        "created_at": datetime.utcnow(),
        "plan_type": current_user.get("plan_type", "free"),
    }
    
    widget_feedback_collection = db["widget_feedback"]
    result = await widget_feedback_collection.insert_one(widget_feedback_doc)
    
    return {
        "message": "Thanks for your feedback! 🙏",
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

@router.post("/feedback/job", status_code=status.HTTP_201_CREATED)
async def submit_job_feedback(
    job_feedback: JobFeedback,
    current_user: dict = Depends(get_current_user)
):
    """Submit quick feedback for a specific job (thumbs up/down)"""
    user_id = current_user.get("_id")
    
    job_feedback_doc = {
        "user_id": ObjectId(user_id),
        "job_url": job_feedback.job_url,
        "job_title": job_feedback.job_title,
        "feedback_type": job_feedback.feedback_type,
        "created_at": datetime.utcnow()
    }
    
    # Store in a separate job_feedback collection - use upsert to prevent duplicates
    job_feedback_collection = db["job_feedback"]
    await job_feedback_collection.update_one(
        {"user_id": ObjectId(user_id), "job_url": job_feedback.job_url},
        {"$set": job_feedback_doc},
        upsert=True
    )
    
    return {
        "message": "Thanks for the quick feedback!",
        "feedback_type": job_feedback.feedback_type
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
