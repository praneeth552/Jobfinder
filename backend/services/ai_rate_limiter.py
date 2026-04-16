"""
AI Rate Limiter Service for Tackleit v2.5

Tracks per-user, per-feature AI usage in MongoDB.
Resets daily at midnight UTC.
Enforces Free vs Pro tier limits.
"""

from datetime import datetime, timedelta
from fastapi import HTTPException
from database import db
from utils import is_pro_user

# Collection for tracking AI feature usage
ai_usage_collection = db["ai_usage"]

# Rate limits per feature (daily)
RATE_LIMITS = {
    "semantic_search": {"free": 5, "pro": 50},
    "gap_analysis": {"free": 0, "pro": 10},
    "interview_prep": {"free": 0, "pro": 5},
    "chat_agent": {"free": 0, "pro": 20},
}


async def check_ai_rate_limit(user_id: str, feature: str, user: dict) -> dict:
    """
    Check if a user has remaining quota for an AI feature.
    
    Args:
        user_id: The user's ID string
        feature: The feature key (e.g., "semantic_search", "gap_analysis")
        user: The full user document from MongoDB
        
    Returns:
        dict with {"allowed": True, "remaining": int, "limit": int}
        
    Raises:
        HTTPException(429) if limit exceeded
        HTTPException(403) if feature is Pro-only and user is Free
    """
    if feature not in RATE_LIMITS:
        raise HTTPException(status_code=400, detail=f"Unknown feature: {feature}")
    
    is_pro = is_pro_user(user)
    tier = "pro" if is_pro else "free"
    limit = RATE_LIMITS[feature][tier]
    
    # If limit is 0, this feature is not available for this tier
    if limit == 0:
        raise HTTPException(
            status_code=403,
            detail=f"This feature is available for Pro users only. Upgrade to unlock {feature.replace('_', ' ').title()}."
        )
    
    # Get today's date (UTC) for daily reset
    today = datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)
    
    # Find or create usage record for this user + feature + today
    usage_record = await ai_usage_collection.find_one({
        "user_id": user_id,
        "feature": feature,
        "date": today
    })
    
    current_count = usage_record["count"] if usage_record else 0
    
    if current_count >= limit:
        # Calculate time until reset (next midnight UTC)
        now = datetime.utcnow()
        next_reset = today + timedelta(days=1)
        hours_remaining = int((next_reset - now).total_seconds() / 3600)
        
        if is_pro:
            detail = f"Daily limit reached for {feature.replace('_', ' ')}. Resets in ~{hours_remaining} hours."
        else:
            detail = f"Free plan limit reached ({limit}/day). Upgrade to Pro for {RATE_LIMITS[feature]['pro']}/day."
        
        raise HTTPException(status_code=429, detail=detail)
    
    return {
        "allowed": True,
        "remaining": limit - current_count,
        "limit": limit,
        "used": current_count
    }


async def increment_ai_usage(user_id: str, feature: str):
    """
    Increment the usage counter for a user's AI feature.
    Call this AFTER successfully processing the request.
    """
    today = datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)
    
    await ai_usage_collection.update_one(
        {"user_id": user_id, "feature": feature, "date": today},
        {
            "$inc": {"count": 1},
            "$set": {"updated_at": datetime.utcnow()},
            "$setOnInsert": {"created_at": datetime.utcnow()}
        },
        upsert=True
    )


async def get_user_ai_quota(user_id: str, user: dict) -> dict:
    """
    Get the full quota status for all AI features for a user.
    Useful for displaying remaining limits on the frontend dashboard.
    
    Returns:
        dict mapping feature -> {limit, used, remaining}
    """
    is_pro = is_pro_user(user)
    tier = "pro" if is_pro else "free"
    today = datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)
    
    # Get all usage records for today
    cursor = ai_usage_collection.find({
        "user_id": user_id,
        "date": today
    })
    usage_records = await cursor.to_list(length=100)
    
    # Build usage map
    usage_map = {record["feature"]: record["count"] for record in usage_records}
    
    quota = {}
    for feature, limits in RATE_LIMITS.items():
        limit = limits[tier]
        used = usage_map.get(feature, 0)
        quota[feature] = {
            "limit": limit,
            "used": used,
            "remaining": max(0, limit - used),
            "available": limit > 0  # False if feature is not available for this tier
        }
    
    return quota
