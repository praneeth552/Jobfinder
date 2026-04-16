"""
Taste Profile Builder for Tackleit v2.5

Aggregates user feedback signals (thumbs up/down, saves, applies, ignores)
to build a compact text summary that gets injected into the Gemini prompt.

This is a Pro-only feature that makes recommendations smarter over time.

NO LLM calls needed — pure MongoDB aggregation + Python logic.
"""

from datetime import datetime
from database import db
from bson import ObjectId

# Collections
job_feedback_collection = db["job_feedback"]
users_collection = db["users"]
jobs_collection = db["jobs"]


async def build_taste_profile(user_id: str) -> str:
    """
    Build a user's taste profile from their interaction history.
    
    Analyzes:
    - Thumbs up/down feedback on job cards
    - Jobs saved vs ignored
    - Jobs applied to
    - Company patterns
    - Role/skill patterns
    
    Args:
        user_id: The user's ID string
        
    Returns:
        A formatted string (10-15 lines) summarizing learned preferences,
        ready to inject into the Gemini prompt. Returns empty string if
        insufficient data.
    """
    # Gather all feedback for this user
    feedback_cursor = job_feedback_collection.find({"user_id": user_id})
    feedback_records = await feedback_cursor.to_list(length=500)
    
    if not feedback_records:
        return ""
    
    # Get user's job applications for save/apply patterns
    try:
        user = await users_collection.find_one({"_id": ObjectId(user_id)})
    except Exception:
        user = None
    
    job_applications = user.get("job_applications", []) if user else []
    
    # --- Analyze Feedback Patterns ---
    liked_jobs = []
    disliked_jobs = []
    
    for record in feedback_records:
        feedback_type = record.get("feedback_type") or record.get("type")
        job_data = record.get("job_data", {})
        
        if feedback_type in ["thumbs_up", "like", "positive"]:
            liked_jobs.append(job_data)
        elif feedback_type in ["thumbs_down", "dislike", "negative"]:
            disliked_jobs.append(job_data)
    
    # --- Analyze Application Patterns ---
    saved_jobs = [app for app in job_applications if app.get("status") == "saved"]
    applied_jobs = [app for app in job_applications if app.get("status") == "applied"]
    
    # Minimum data threshold - need at least 3 signals to be meaningful
    total_signals = len(liked_jobs) + len(disliked_jobs) + len(saved_jobs) + len(applied_jobs)
    if total_signals < 3:
        return ""
    
    # --- Extract Patterns ---
    profile_lines = ["LEARNED PREFERENCES (from your activity):"]
    
    # Company preferences
    liked_companies = _extract_field(liked_jobs, "company")
    disliked_companies = _extract_field(disliked_jobs, "company")
    saved_companies = _extract_field_from_apps(saved_jobs, "company")
    applied_companies = _extract_field_from_apps(applied_jobs, "company")
    
    positive_companies = _merge_counts(liked_companies, saved_companies, applied_companies)
    
    if positive_companies:
        top_positive = sorted(positive_companies.items(), key=lambda x: x[1], reverse=True)[:3]
        profile_lines.append(
            f"- Preferred companies: {', '.join(f'{c} ({n}x)' for c, n in top_positive)}"
        )
    
    if disliked_companies:
        top_negative = sorted(disliked_companies.items(), key=lambda x: x[1], reverse=True)[:3]
        profile_lines.append(
            f"- Avoided companies: {', '.join(f'{c} ({n}x)' for c, n in top_negative)}"
        )
    
    # Role/title patterns  
    liked_titles = _extract_field(liked_jobs, "title")
    disliked_titles = _extract_field(disliked_jobs, "title")
    
    # Extract common keywords from liked/disliked titles
    liked_keywords = _extract_title_keywords(liked_jobs)
    disliked_keywords = _extract_title_keywords(disliked_jobs)
    
    if liked_keywords:
        top_liked_kw = sorted(liked_keywords.items(), key=lambda x: x[1], reverse=True)[:5]
        profile_lines.append(
            f"- Preferred role keywords: {', '.join(f'{k}' for k, _ in top_liked_kw)}"
        )
    
    if disliked_keywords:
        top_disliked_kw = sorted(disliked_keywords.items(), key=lambda x: x[1], reverse=True)[:3]
        profile_lines.append(
            f"- Avoided role keywords: {', '.join(f'{k}' for k, _ in top_disliked_kw)}"
        )
    
    # Location patterns
    liked_locations = _extract_field(liked_jobs, "location")
    saved_locations = _extract_field_from_apps(saved_jobs, "location")
    positive_locations = _merge_counts(liked_locations, saved_locations)
    
    if positive_locations:
        top_locations = sorted(positive_locations.items(), key=lambda x: x[1], reverse=True)[:3]
        remote_count = sum(v for k, v in positive_locations.items() if "remote" in k.lower())
        onsite_count = sum(v for k, v in positive_locations.items() if "remote" not in k.lower())
        
        if remote_count > onsite_count and remote_count >= 2:
            profile_lines.append(f"- Strong remote preference (liked {remote_count} remote vs {onsite_count} on-site)")
        elif onsite_count > remote_count and onsite_count >= 2:
            profile_lines.append(f"- Prefers on-site roles in: {', '.join(f'{l}' for l, _ in top_locations[:2])}")
    
    # Save vs ignore ratio
    if len(saved_jobs) + len(applied_jobs) > 0:
        action_summary = []
        if applied_jobs:
            action_summary.append(f"applied to {len(applied_jobs)}")
        if saved_jobs:
            action_summary.append(f"saved {len(saved_jobs)}")
        profile_lines.append(f"- Action pattern: {', '.join(action_summary)} jobs")
    
    # Summary stats
    if liked_jobs or disliked_jobs:
        profile_lines.append(
            f"- Feedback signals: {len(liked_jobs)} liked, {len(disliked_jobs)} disliked"
        )
    
    # Only return if we have meaningful insights (at least 2 pattern lines beyond the header)
    if len(profile_lines) < 3:
        return ""
    
    return "\n".join(profile_lines)


def _extract_field(jobs: list, field: str) -> dict:
    """Count occurrences of a field value across job records."""
    counts = {}
    for job in jobs:
        value = job.get(field) or job.get("job_details", {}).get(field, "")
        if value:
            # Normalize company names
            value = str(value).strip()
            if value:
                counts[value] = counts.get(value, 0) + 1
    return counts


def _extract_field_from_apps(apps: list, field: str) -> dict:
    """Extract field from job_applications format (has job_details nested)."""
    counts = {}
    for app in apps:
        job_details = app.get("job_details", {})
        value = job_details.get(field, "")
        if value:
            value = str(value).strip()
            if value:
                counts[value] = counts.get(value, 0) + 1
    return counts


def _extract_title_keywords(jobs: list) -> dict:
    """Extract meaningful keywords from job titles."""
    # Common words to skip
    STOP_WORDS = {
        "the", "a", "an", "and", "or", "at", "in", "for", "of", "to", "with",
        "is", "are", "was", "i", "ii", "iii", "iv", "v", "-", "/", "&",
        "job", "position", "role", "opening", "opportunity"
    }
    
    keyword_counts = {}
    for job in jobs:
        title = job.get("title") or job.get("job_details", {}).get("title", "")
        if title:
            words = title.lower().split()
            for word in words:
                word = word.strip("()[]{}.,;:-/")
                if word and word not in STOP_WORDS and len(word) > 2:
                    keyword_counts[word] = keyword_counts.get(word, 0) + 1
    
    # Only return keywords that appear at least twice
    return {k: v for k, v in keyword_counts.items() if v >= 2}


def _merge_counts(*count_dicts) -> dict:
    """Merge multiple count dictionaries."""
    merged = {}
    for d in count_dicts:
        for key, count in d.items():
            merged[key] = merged.get(key, 0) + count
    return merged
