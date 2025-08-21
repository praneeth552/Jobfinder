from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from database import db
from bson import ObjectId
from utils import get_current_user
from models import JobApplication, JobApplicationStatus, User, RecommendedJob
from typing import List

router = APIRouter()

class JobStatusUpdate(BaseModel):
    job_id: str
    status: JobApplicationStatus

@router.get("/applications/{status}", response_model=List[RecommendedJob])
async def get_job_applications_by_status(
    status: JobApplicationStatus,
    current_user: User = Depends(get_current_user)
):
    user_id = current_user["_id"]
    user = await db.users.find_one({"_id": ObjectId(user_id)})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    applications = user.get("job_applications", [])
    
    filtered_jobs = []
    for app in applications:
        if app.get('status') == status.value:
            job_details = app['job_details']
            if 'status' in job_details:
                del job_details['status']
            filtered_jobs.append(RecommendedJob(**job_details, status=app.get('status')))
    
    return filtered_jobs

@router.post("/application/save_job")
async def save_job_application(
    job_to_save: RecommendedJob,
    current_user: User = Depends(get_current_user)
):
    user_id = current_user["_id"]
    
    # Ensure job_applications field exists and is a list
    if "job_applications" not in current_user or not isinstance(current_user["job_applications"], list):
        current_user["job_applications"] = []

    # Check if the job already exists in job_applications
    existing_app_index = -1
    for i, app in enumerate(current_user["job_applications"]):
        if app['job_details']['job_url'] == job_to_save.job_url:
            existing_app_index = i
            break

    if existing_app_index != -1:
        # Update existing application
        current_user["job_applications"][existing_app_index]["status"] = job_to_save.status
    else:
        # Add new application
        new_job_application = JobApplication(
            job_details=job_to_save,
            status=job_to_save.status
        )
        current_user["job_applications"].append(new_job_application.dict())

    # Update the user document in MongoDB
    await db.users.update_one(
        {"_id": ObjectId(user_id)},
        {"$set": {"job_applications": current_user["job_applications"]}}
    )

    # Remove the job from the recommendations list
    await db.recommendations.delete_one(
        {"user_id": ObjectId(user_id), "job_url": job_to_save.job_url}
    )

    return {"message": "Job application saved successfully"}

@router.post("/application/move_to_recommendations")
async def move_to_recommendations(
    job_to_move: RecommendedJob,
    current_user: User = Depends(get_current_user)
):
    user_id = current_user["_id"]

    # Correctly update the status of the job within the user's job_applications array
    result = await db.users.update_one(
        {
            "_id": ObjectId(user_id),
            "job_applications.job_details.job_url": job_to_move.job_url
        },
        {
            "$set": { "job_applications.$.status": "recommended" }
        }
    )

    if result.modified_count == 0:
        # This might happen if the job is not found, which would be unexpected
        # but we can handle it gracefully.
        raise HTTPException(status_code=404, detail="Job application not found in user profile.")

    return {"message": "Job moved to recommendations successfully"}


@router.delete("/applications/{status}")
async def delete_job_applications_by_status(
    status: JobApplicationStatus,
    current_user: User = Depends(get_current_user)
):
    user_id = current_user["_id"]

    # Pull all applications with the given status from the job_applications array
    result = await db.users.update_one(
        {"_id": ObjectId(user_id)},
        {"$pull": {"job_applications": {"status": status.value}}}
    )

    if result.modified_count == 0:
        # This is not an error, it just means there were no jobs to delete
        pass

    return {"message": f"All {status.value} job applications deleted successfully"}