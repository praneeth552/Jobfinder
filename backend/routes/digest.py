import os
import re
from datetime import datetime, timedelta

from bson import ObjectId
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field

from database import db
from dependencies import get_current_user
from email_utils import send_email

router = APIRouter()

users_collection = db["users"]
jobs_collection = db["jobs"]

ADMIN_SECRET = os.getenv("ADMIN_SECRET", "")
FRONTEND_URL = os.getenv("FRONTEND_URL", "https://tackleit.xyz")


class DigestResult(BaseModel):
    emails_sent: int
    skipped: int
    errors: int


class DigestPreference(BaseModel):
    enabled: bool


def _build_digest_html(user_name: str, new_count: int, top_titles: list[str], unsubscribe_url: str) -> str:
    """Build a clean HTML email for the weekly digest"""
    title_list = ""
    for title in top_titles[:3]:
        title_list += f"<li style='margin-bottom:6px;color:#333;'>{title}</li>"

    return f"""
    <html>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; color: #1a1a1a;">
        <div style="text-align:center; margin-bottom:24px;">
            <h1 style="font-size:24px; font-weight:700; margin:0;">Tackleit</h1>
            <p style="color:#737373; font-size:14px; margin-top:4px;">Your weekly job search update</p>
        </div>

        <div style="background:#F5F0E8; border-radius:12px; padding:24px; margin-bottom:24px;">
            <h2 style="font-size:20px; margin:0 0 8px 0;">Hi {user_name},</h2>
            <p style="font-size:16px; color:#333; margin:0;">
                <strong>{new_count} new job{"s" if new_count != 1 else ""}</strong> matched your profile this week.
            </p>
        </div>

        {"<div style='margin-bottom:24px;'><h3 style=\"font-size:16px; color:#525252; margin-bottom:12px;\">Top matches:</h3><ul style=\"padding-left:20px; margin:0;\">" + title_list + "</ul></div>" if title_list else ""}

        <div style="text-align:center; margin: 32px 0;">
            <a href="{FRONTEND_URL}/dashboard"
               style="display:inline-block; background:#1a1a1a; color:#fff; padding:14px 32px; border-radius:9999px; text-decoration:none; font-weight:600; font-size:15px;">
                View Your Dashboard →
            </a>
        </div>

        <div style="border-top:1px solid #DDD8D0; padding-top:16px; margin-top:32px; text-align:center;">
            <p style="font-size:12px; color:#a3a3a3; margin:0;">
                You're receiving this because you signed up on Tackleit.<br/>
                <a href="{unsubscribe_url}" style="color:#737373;">Unsubscribe from weekly digests</a>
            </p>
        </div>
    </body>
    </html>
    """


async def _count_new_jobs_for_user(user: dict) -> tuple[int, list[str]]:
    """Count new jobs matching user preferences since their last visit"""
    last_seen = user.get("last_seen_at")
    if not last_seen or not isinstance(last_seen, datetime):
        return 0, []

    preferences = user.get("preferences", {})
    keywords: list[str] = []
    for field in ["role", "tech_stack", "location"]:
        vals = preferences.get(field, [])
        if isinstance(vals, list):
            keywords.extend([v.strip().lower() for v in vals if v])

    if not keywords:
        return 0, []

    regex_conditions = []
    for kw in keywords[:10]:
        escaped = re.escape(kw)
        regex_conditions.append({"title": {"$regex": escaped, "$options": "i"}})
        regex_conditions.append({"location": {"$regex": escaped, "$options": "i"}})

    query = {
        "created_at": {"$gte": last_seen},
        "$or": regex_conditions,
    }

    count = await jobs_collection.count_documents(query)

    top_jobs = await jobs_collection.find(
        query, {"title": 1}
    ).sort("created_at", -1).to_list(length=3)
    top_titles = [j.get("title", "") for j in top_jobs if j.get("title")]

    return count, top_titles


@router.post("/send-weekly", response_model=DigestResult)
async def send_weekly_digest(
    request_body: dict = {},
):
    """
    Send weekly digest emails to eligible users.
    Protected by ADMIN_SECRET header.
    """
    # Verify admin secret
    admin_secret = request_body.get("admin_secret", "")
    if not ADMIN_SECRET or admin_secret != ADMIN_SECRET:
        raise HTTPException(status_code=403, detail="Invalid admin secret")

    now = datetime.utcnow()
    three_days_ago = now - timedelta(days=3)
    seven_days_ago = now - timedelta(days=7)

    # Find users who:
    # 1. Haven't visited in 3+ days
    # 2. Haven't received a digest in 7+ days (or never)
    # 3. Have digest_enabled != False (default True)
    # 4. Are not pending deletion
    # 5. Have preferences set
    eligible_users = await users_collection.find({
        "last_seen_at": {"$lte": three_days_ago},
        "plan_status": {"$ne": "pending_deletion"},
        "digest_enabled": {"$ne": False},  # default True if field missing
        "$or": [
            {"last_digest_sent_at": {"$exists": False}},
            {"last_digest_sent_at": {"$lte": seven_days_ago}},
        ],
        "preferences": {"$exists": True},
    }).to_list(length=200)  # Process max 200 per run

    emails_sent = 0
    skipped = 0
    errors = 0

    for user in eligible_users:
        try:
            user_email = user.get("email")
            user_name = user.get("name", "there")
            if not user_email:
                skipped += 1
                continue

            new_count, top_titles = await _count_new_jobs_for_user(user)

            if new_count == 0:
                skipped += 1
                continue

            user_id_str = str(user["_id"])
            unsubscribe_url = f"{FRONTEND_URL}/settings?unsubscribe_digest=true"

            html = _build_digest_html(user_name, new_count, top_titles, unsubscribe_url)

            await send_email(
                subject=f"🔍 {new_count} new job{'s' if new_count != 1 else ''} match your profile — Tackleit Weekly",
                recipients=[user_email],
                body=html,
            )

            # Mark digest as sent
            await users_collection.update_one(
                {"_id": user["_id"]},
                {"$set": {"last_digest_sent_at": now}},
            )

            emails_sent += 1

        except Exception as e:
            print(f"Digest email failed for user {user.get('email', 'unknown')}: {e}")
            errors += 1

    return DigestResult(emails_sent=emails_sent, skipped=skipped, errors=errors)


@router.post("/unsubscribe", status_code=status.HTTP_200_OK)
async def unsubscribe_digest(
    current_user: dict = Depends(get_current_user),
):
    """Opt out of weekly email digests"""
    user_id = current_user.get("_id")

    await users_collection.update_one(
        {"_id": ObjectId(user_id)},
        {"$set": {"digest_enabled": False}},
    )

    return {"message": "You've been unsubscribed from weekly digests."}


@router.post("/subscribe", status_code=status.HTTP_200_OK)
async def subscribe_digest(
    current_user: dict = Depends(get_current_user),
):
    """Opt back in to weekly email digests"""
    user_id = current_user.get("_id")

    await users_collection.update_one(
        {"_id": ObjectId(user_id)},
        {"$set": {"digest_enabled": True}},
    )

    return {"message": "You'll receive weekly job digests again."}


@router.get("/status", status_code=status.HTTP_200_OK)
async def get_digest_status(
    current_user: dict = Depends(get_current_user),
):
    """Check if user has digest enabled"""
    user_id = current_user.get("_id")
    user = await users_collection.find_one({"_id": ObjectId(user_id)})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    return {
        "digest_enabled": user.get("digest_enabled", True),  # Default True
        "last_digest_sent_at": user.get("last_digest_sent_at"),
    }
