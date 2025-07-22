from fastapi import APIRouter
from models import Job
from database import db

router = APIRouter()

jobs_collection = db["jobs"]

@router.post("/")
async def create_job(job: Job):
    job_dict = job.dict()
    result = await jobs_collection.insert_one(job_dict)
    created_job = await jobs_collection.find_one({"_id": result.inserted_id})
    created_job["_id"] = str(created_job["_id"])
    return created_job

@router.get("/")
async def read_jobs():
    jobs = []
    async for job in jobs_collection.find():
        job["_id"] = str(job["_id"])
        jobs.append(job)
    return jobs
