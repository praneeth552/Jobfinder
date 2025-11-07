
from fastapi import APIRouter, Depends, Query
from typing import List, Dict, Any, Optional

from dependencies import get_current_user_optional
from models import User

router = APIRouter()

@router.get("/search", response_model=Dict[str, List[Dict[str, Any]]])
async def search(
    query: str = Query(..., min_length=3, description="Search query for jobs and pages"),
    current_user: Optional[User] = Depends(get_current_user_optional)
):
    """
    Search for jobs and pages based on a query string.
    """
    if not query:
        return {"jobs": [], "pages": []}

    jobs = []
    if current_user:
        job_applications = current_user.get("job_applications", [])
        lower_query = query.lower()
        
        for app in job_applications:
            job_details = app.get("job_details", {})
            if (
                lower_query in job_details.get("title", "").lower()
                or lower_query in job_details.get("company", "").lower()
                or lower_query in job_details.get("location", "").lower()
            ):
                jobs.append(job_details)

    # Search for pages
    all_pages = [
        {"title": "Dashboard", "path": "/dashboard"},
        {"title": "Billing", "path": "/billing"},
        {"title": "Saved Jobs", "path": "/saved"},
        {"title": "Applied Jobs", "path": "/applied"},
        {"title": "Preferences", "path": "/preferences"},
        {"title": "Data", "path": "/data"},
        {"title": "Pricing", "path": "/pricing"},
        {"title": "Upgrade", "path": "/upgrade"},
        {"title": "Workflow", "path": "/workflow"},
        {"title": "About", "path": "/about"},
        {"title": "Contact", "path": "/contact"},
        {"title": "Delete Account", "path": "/delete"},
        {"title": "Forgot Password", "path": "/forgot-password"},
        {"title": "Jobs", "path": "/jobs"},
        {"title": "OTP", "path": "/otp"},
        {"title": "Privacy Policy", "path": "/privacy"},
        {"title": "Refund Policy", "path": "/refund"},
        {"title": "Reset Password", "path": "/reset-password"},
        {"title": "Sign In", "path": "/signin"},
        {"title": "Terms of Service", "path": "/terms"},
    ]

    pages = [page for page in all_pages if query.lower() in page["title"].lower()]

    return {"jobs": jobs, "pages": pages}
