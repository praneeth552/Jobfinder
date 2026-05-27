from datetime import datetime, timedelta
from typing import Optional
import re

from bson import ObjectId
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field

from database import db
from dependencies import get_current_user

router = APIRouter()

users_collection = db["users"]
feedback_collection = db["feedback"]
widget_feedback_collection = db["widget_feedback"]
job_feedback_collection = db["job_feedback"]
usage_events_collection = db["usage_events"]
jobs_collection = db["jobs"]


class SessionEvent(BaseModel):
    page: str = Field(default="dashboard", max_length=100)
    source: Optional[str] = Field(default=None, max_length=80)


VALID_EVENT_TYPES = {
    "signup", "preferences_saved", "jobs_generated", "job_viewed",
    "job_saved", "job_applied", "feedback_given", "upgrade_clicked",
    "digest_unsubscribed", "whats_new_seen",
}


class UsageEvent(BaseModel):
    event: str = Field(..., max_length=60)
    metadata: Optional[dict] = Field(default=None)


class WhatsNewResponse(BaseModel):
    new_jobs_count: int
    new_jobs_since: Optional[datetime] = None
    has_new_jobs: bool
    days_away: int
    message: str
    top_titles: list[str]


class PublicMetricsResponse(BaseModel):
    total_users: int
    active_users_30d: int
    returning_users: int
    return_rate: float
    pro_users: int
    total_feedback: int
    average_rating: float
    satisfaction_rate: float
    total_time_saved_minutes: int
    total_jobs_tracked: int
    saved_jobs: int
    applied_jobs: int
    last_updated_at: datetime


class DashboardNudge(BaseModel):
    label: str
    description: str
    action: str


class UserMetricsResponse(BaseModel):
    visit_count: int
    dashboard_visit_count: int
    days_since_signup: int
    total_feedback: int
    job_feedback_signals: int
    latest_rating: Optional[int] = None
    total_minutes_saved: int
    recommended_jobs: int
    saved_jobs: int
    applied_jobs: int
    plan_type: str
    nudge: DashboardNudge


def _active_user_filter() -> dict:
    return {"plan_status": {"$ne": "pending_deletion"}}


def _round_percent(numerator: int, denominator: int) -> float:
    if denominator <= 0:
        return 0
    return round((numerator / denominator) * 100, 1)


def _extract_job_counts(job_applications: list[dict]) -> tuple[int, int, int]:
    recommended = 0
    saved = 0
    applied = 0

    for app in job_applications:
        status_value = app.get("status")
        if status_value == "recommended":
            recommended += 1
        elif status_value == "saved":
            saved += 1
        elif status_value == "applied":
            applied += 1

    return recommended, saved, applied


def _build_dashboard_nudge(
    plan_type: str,
    recommended_jobs: int,
    saved_jobs: int,
    applied_jobs: int,
    total_feedback: int,
    dashboard_visit_count: int,
) -> DashboardNudge:
    if recommended_jobs + saved_jobs + applied_jobs == 0:
        return DashboardNudge(
            label="Generate your first job batch",
            description="Users need an immediate win. Start with a fresh AI-matched list.",
            action="generate",
        )

    if saved_jobs > 0 and applied_jobs == 0:
        return DashboardNudge(
            label="Turn a saved job into an application",
            description="Applying to one saved role creates a stronger success signal than browsing alone.",
            action="applied",
        )

    if total_feedback == 0 and dashboard_visit_count >= 2:
        return DashboardNudge(
            label="Ask for one quick rating",
            description="A one-tap rating converts this visit into a testimonial metric.",
            action="feedback",
        )

    if plan_type == "free" and saved_jobs + applied_jobs >= 2:
        return DashboardNudge(
            label="Upgrade for weekly refreshes",
            description="This user has shown intent. Weekly recommendations are the clearest Pro value.",
            action="upgrade",
        )

    return DashboardNudge(
        label="Review the next best matches",
        description="Keep momentum by saving, applying, or rating the recommendations.",
        action="review",
    )


@router.post("/session", status_code=status.HTTP_200_OK)
async def record_session(
    event: SessionEvent,
    current_user: dict = Depends(get_current_user),
):
    user_id = current_user.get("_id")
    if not user_id:
        raise HTTPException(status_code=401, detail="User not authenticated")

    now = datetime.utcnow()
    page = (event.page or "dashboard").strip().lower()[:100]

    set_fields = {
        "last_seen_at": now,
        "updated_at": now,
    }
    inc_fields = {"visit_count": 1}

    if page == "dashboard":
        set_fields["last_dashboard_visit_at"] = now
        inc_fields["dashboard_visit_count"] = 1

    await users_collection.update_one(
        {"_id": ObjectId(user_id)},
        {"$set": set_fields, "$inc": inc_fields},
    )

    await usage_events_collection.insert_one(
        {
            "user_id": ObjectId(user_id),
            "page": page,
            "source": event.source,
            "created_at": now,
        }
    )

    return {"message": "Session recorded", "last_seen_at": now}


@router.post("/event", status_code=status.HTTP_200_OK)
async def record_event(
    event: UsageEvent,
    current_user: dict = Depends(get_current_user),
):
    """Record a structured usage event for analytics/funnels"""
    user_id = current_user.get("_id")
    if not user_id:
        raise HTTPException(status_code=401, detail="User not authenticated")

    event_name = (event.event or "").strip().lower()
    if event_name not in VALID_EVENT_TYPES:
        raise HTTPException(status_code=400, detail=f"Unknown event type: {event_name}")

    now = datetime.utcnow()

    await usage_events_collection.insert_one(
        {
            "user_id": ObjectId(user_id),
            "event": event_name,
            "metadata": event.metadata or {},
            "created_at": now,
        }
    )

    # Lightweight side-effects for common events
    inc_fields: dict = {}
    set_fields: dict = {"last_seen_at": now}

    if event_name == "job_viewed":
        inc_fields["jobs_viewed_count"] = 1
    elif event_name == "feedback_given":
        inc_fields["feedback_count"] = 1

    update_ops: dict = {"$set": set_fields}
    if inc_fields:
        update_ops["$inc"] = inc_fields

    await users_collection.update_one(
        {"_id": ObjectId(user_id)},
        update_ops,
    )

    return {"message": "Event recorded", "event": event_name}


@router.get("/whats-new", response_model=WhatsNewResponse)
async def get_whats_new(
    current_user: dict = Depends(get_current_user),
):
    """Return count of new jobs matching user preferences since their last visit"""
    user_id = current_user.get("_id")
    user = await users_collection.find_one({"_id": ObjectId(user_id)})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # Determine the anchor time: last_seen_at from previous session
    last_seen = user.get("last_seen_at")
    if not last_seen or not isinstance(last_seen, datetime):
        return WhatsNewResponse(
            new_jobs_count=0,
            new_jobs_since=None,
            has_new_jobs=False,
            days_away=0,
            message="Welcome! Generate your first recommendations.",
            top_titles=[],
        )

    days_away = max(0, (datetime.utcnow() - last_seen).days)

    # Build a lightweight text filter from user preferences
    preferences = user.get("preferences", {})
    keywords: list[str] = []
    for field in ["role", "tech_stack", "location"]:
        vals = preferences.get(field, [])
        if isinstance(vals, list):
            keywords.extend([v.strip().lower() for v in vals if v])

    if not keywords:
        return WhatsNewResponse(
            new_jobs_count=0,
            new_jobs_since=last_seen,
            has_new_jobs=False,
            days_away=days_away,
            message="Set your preferences to see new matching jobs.",
            top_titles=[],
        )

    # Build a $or regex query across title, location, description
    regex_conditions = []
    for kw in keywords[:10]:  # cap at 10 to avoid slow queries
        escaped = re.escape(kw)
        regex_conditions.append({"title": {"$regex": escaped, "$options": "i"}})
        regex_conditions.append({"location": {"$regex": escaped, "$options": "i"}})

    query = {
        "created_at": {"$gte": last_seen},
        "$or": regex_conditions,
    }

    new_count = await jobs_collection.count_documents(query)

    # Get top 3 titles for the message
    top_jobs = await jobs_collection.find(
        query, {"title": 1}
    ).sort("created_at", -1).to_list(length=3)
    top_titles = [j.get("title", "") for j in top_jobs if j.get("title")]

    has_new = new_count > 0
    if has_new:
        message = f"{new_count} new job{'s' if new_count != 1 else ''} matched your profile while you were away"
    else:
        message = "No new matches since your last visit — check back soon!"

    return WhatsNewResponse(
        new_jobs_count=new_count,
        new_jobs_since=last_seen,
        has_new_jobs=has_new,
        days_away=days_away,
        message=message,
        top_titles=top_titles,
    )


@router.get("/public", response_model=PublicMetricsResponse)
async def get_public_metrics():
    now = datetime.utcnow()
    user_filter = _active_user_filter()

    total_users = await users_collection.count_documents(user_filter)
    active_users_30d = await users_collection.count_documents(
        {**user_filter, "last_seen_at": {"$gte": now - timedelta(days=30)}}
    )
    returning_users = await users_collection.count_documents(
        {**user_filter, "visit_count": {"$gte": 2}}
    )
    pro_users = await users_collection.count_documents(
        {**user_filter, "plan_type": "pro"}
    )

    total_feedback = await feedback_collection.count_documents({})
    positive_feedback = await feedback_collection.count_documents({"rating": {"$gte": 4}})

    avg_rating = 0
    if total_feedback:
        avg_result = await feedback_collection.aggregate(
            [{"$group": {"_id": None, "average": {"$avg": "$rating"}}}]
        ).to_list(length=1)
        avg_rating = round(avg_result[0]["average"], 1) if avg_result else 0

    time_result = await users_collection.aggregate(
        [
            {"$match": user_filter},
            {
                "$group": {
                    "_id": None,
                    "minutes": {"$sum": {"$ifNull": ["$time_saved_minutes", 0]}},
                }
            },
        ]
    ).to_list(length=1)
    total_time_saved_minutes = int(time_result[0]["minutes"]) if time_result else 0

    job_result = await users_collection.aggregate(
        [
            {"$match": user_filter},
            {"$unwind": "$job_applications"},
            {
                "$group": {
                    "_id": None,
                    "total": {"$sum": 1},
                    "saved": {
                        "$sum": {
                            "$cond": [
                                {"$eq": ["$job_applications.status", "saved"]},
                                1,
                                0,
                            ]
                        }
                    },
                    "applied": {
                        "$sum": {
                            "$cond": [
                                {"$eq": ["$job_applications.status", "applied"]},
                                1,
                                0,
                            ]
                        }
                    },
                }
            },
        ]
    ).to_list(length=1)

    job_metrics = job_result[0] if job_result else {}

    return PublicMetricsResponse(
        total_users=total_users,
        active_users_30d=active_users_30d,
        returning_users=returning_users,
        return_rate=_round_percent(returning_users, total_users),
        pro_users=pro_users,
        total_feedback=total_feedback,
        average_rating=avg_rating,
        satisfaction_rate=_round_percent(positive_feedback, total_feedback),
        total_time_saved_minutes=total_time_saved_minutes,
        total_jobs_tracked=int(job_metrics.get("total", 0)),
        saved_jobs=int(job_metrics.get("saved", 0)),
        applied_jobs=int(job_metrics.get("applied", 0)),
        last_updated_at=now,
    )


@router.get("/me", response_model=UserMetricsResponse)
async def get_user_metrics(current_user: dict = Depends(get_current_user)):
    user_id = current_user.get("_id")
    user = await users_collection.find_one({"_id": ObjectId(user_id)})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    job_applications = user.get("job_applications", [])
    recommended_jobs, saved_jobs, applied_jobs = _extract_job_counts(job_applications)

    user_object_id = ObjectId(user_id)
    rating_feedback_count = await feedback_collection.count_documents({"user_id": user_object_id})
    widget_feedback_count = await widget_feedback_collection.count_documents({"user_id": user_object_id})
    job_feedback_signals = await job_feedback_collection.count_documents({"user_id": user_object_id})

    latest_rating_doc = await feedback_collection.find_one(
        {"user_id": user_object_id},
        sort=[("created_at", -1)],
    )

    created_at = user.get("created_at") or datetime.utcnow()
    if isinstance(created_at, str):
        try:
            created_at = datetime.fromisoformat(created_at)
        except ValueError:
            created_at = datetime.utcnow()

    plan_type = user.get("plan_type", "free")
    total_feedback = rating_feedback_count + widget_feedback_count
    dashboard_visit_count = user.get("dashboard_visit_count", 0)

    return UserMetricsResponse(
        visit_count=user.get("visit_count", 0),
        dashboard_visit_count=dashboard_visit_count,
        days_since_signup=max(0, (datetime.utcnow() - created_at).days),
        total_feedback=total_feedback,
        job_feedback_signals=job_feedback_signals,
        latest_rating=latest_rating_doc.get("rating") if latest_rating_doc else None,
        total_minutes_saved=user.get("time_saved_minutes", 0),
        recommended_jobs=recommended_jobs,
        saved_jobs=saved_jobs,
        applied_jobs=applied_jobs,
        plan_type=plan_type,
        nudge=_build_dashboard_nudge(
            plan_type=plan_type,
            recommended_jobs=recommended_jobs,
            saved_jobs=saved_jobs,
            applied_jobs=applied_jobs,
            total_feedback=total_feedback,
            dashboard_visit_count=dashboard_visit_count,
        ),
    )
