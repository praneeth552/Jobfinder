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
    user_id = str(current_user["_id"]) # Convert ObjectId to string for consistent use
    
    # Fetch the full user document to get current time_saved_minutes and job_applications
    user_doc = await db.users.find_one({"_id": ObjectId(user_id)})
    if not user_doc:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Convert user_doc to a Pydantic User model instance for easier manipulation
    user_model = User(**user_doc)

    time_to_add = 0
    old_status = None
    
    # Check if the job already exists in job_applications
    existing_app_index = -1
    for i, app in enumerate(user_model.job_applications):
        if app.job_details.job_url == job_to_save.job_url:
            existing_app_index = i
            old_status = app.status
            break

    if existing_app_index != -1:
        # Update existing application
        user_model.job_applications[existing_app_index].status = job_to_save.status
        
        # Calculate time saved for status change (including REVERSE transitions)
        if old_status == JobApplicationStatus.recommended and job_to_save.status == JobApplicationStatus.saved:
            time_to_add += 1  # Forward: recommended → saved
        elif old_status == JobApplicationStatus.recommended and job_to_save.status == JobApplicationStatus.applied:
            time_to_add += 3  # Forward: recommended → applied
        elif old_status == JobApplicationStatus.saved and job_to_save.status == JobApplicationStatus.applied:
            time_to_add += 2  # Forward: saved → applied (3 - 1)
        
        # REVERSE transitions (subtract time)
        elif old_status == JobApplicationStatus.saved and job_to_save.status == JobApplicationStatus.recommended:
            time_to_add -= 1  # Reverse: saved → recommended (undo the 1 min)
        elif old_status == JobApplicationStatus.applied and job_to_save.status == JobApplicationStatus.recommended:
            time_to_add -= 3  # Reverse: applied → recommended (undo the 3 min)
        elif old_status == JobApplicationStatus.applied and job_to_save.status == JobApplicationStatus.saved:
            time_to_add -= 2  # Reverse: applied → saved (undo 2 min difference)
    else:
        # Add new application
        new_job_application = JobApplication(
            job_details=job_to_save,
            status=job_to_save.status
        )
        user_model.job_applications.append(new_job_application)
        
        # Calculate time saved for new job
        if job_to_save.status == JobApplicationStatus.saved:
            time_to_add += 1
        elif job_to_save.status == JobApplicationStatus.applied:
            time_to_add += 3

    # Update the user document in MongoDB
    update_fields = {"job_applications": [app.dict() for app in user_model.job_applications]}
    if time_to_add != 0:  # Only update if there's a change (can be negative now)
        update_fields["time_saved_minutes"] = user_model.time_saved_minutes + time_to_add

    await db.users.update_one(
        {"_id": ObjectId(user_id)},
        {"$set": update_fields}
    )

    # Remove the job from the recommendations list (if it was there)
    # This part of the logic seems to be for a different collection,
    # ensure it's intended to remove from 'recommendations' collection, not user's job_applications
    await db.recommendations.delete_one(
        {"user_id": ObjectId(user_id), "job_url": job_to_save.job_url}
    )

    return {"message": "Job application saved successfully"}

@router.post("/application/move_to_recommendations")
async def move_to_recommendations(
    job_to_move: RecommendedJob,
    current_user: User = Depends(get_current_user)
):
    user_id = str(current_user["_id"])
    
    # Fetch the full user document to get current time_saved_minutes and job_applications
    user_doc = await db.users.find_one({"_id": ObjectId(user_id)})
    if not user_doc:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Convert user_doc to a Pydantic User model instance
    user_model = User(**user_doc)
    
    # Find the job in job_applications to get its current status
    old_status = None
    job_index = -1
    for i, app in enumerate(user_model.job_applications):
        if app.job_details.job_url == job_to_move.job_url:
            old_status = app.status
            job_index = i
            break
    
    if job_index == -1:
        raise HTTPException(status_code=404, detail="Job application not found in user profile.")
    
    # Calculate time to subtract based on old status
    time_to_subtract = 0
    if old_status == JobApplicationStatus.saved:
        time_to_subtract = 1  # Reverse: saved → recommended (undo the 1 min)
    elif old_status == JobApplicationStatus.applied:
        time_to_subtract = 3  # Reverse: applied → recommended (undo the 3 min)
    
    # Update the job status
    user_model.job_applications[job_index].status = JobApplicationStatus.recommended
    
    # Update in MongoDB
    update_fields = {"job_applications": [app.dict() for app in user_model.job_applications]}
    if time_to_subtract > 0:
        update_fields["time_saved_minutes"] = max(0, user_model.time_saved_minutes - time_to_subtract)
    
    await db.users.update_one(
        {"_id": ObjectId(user_id)},
        {"$set": update_fields}
    )

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