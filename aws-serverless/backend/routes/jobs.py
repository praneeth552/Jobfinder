from fastapi import APIRouter, HTTPException, Request
from models import Job
from database import db
import logging

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

router = APIRouter()
jobs_collection = db["jobs"]

@router.post("/")
async def create_job(request: Request):
    # Log raw request body to see what's actually being sent
    try:
        job_data = await request.json()
        logger.info(f"Received job data: {job_data}")
    except Exception as e:
        logger.error(f"Could not parse request JSON: {e}")
        raise HTTPException(status_code=400, detail="Invalid JSON format.")

    # Now, validate with Pydantic
    try:
        job = Job(**job_data)
        job_dict = job.dict()
        
        result = await jobs_collection.insert_one(job_dict)
        created_job = await jobs_collection.find_one({"_id": result.inserted_id})
        
        logger.info(f"Successfully inserted job with ID: {result.inserted_id}")
        
        created_job["_id"] = str(created_job["_id"])
        return created_job
    except Exception as e:
        # This will catch Pydantic validation errors and any other exceptions
        logger.error(f"Validation or Database Error: {e}", exc_info=True)
        raise HTTPException(status_code=422, detail=f"Failed to process job data: {e}")

@router.get("/")
async def read_jobs():
    jobs = []
    async for job in jobs_collection.find():
        job["_id"] = str(job["_id"])
        jobs.append(job)
    return jobs
