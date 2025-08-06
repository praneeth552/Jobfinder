from pydantic import BaseModel, EmailStr, field_validator, model_validator
from typing import List, Optional, Union
from datetime import datetime
from enum import Enum

class PlanType(str, Enum):
    free = "free"
    pro = "pro"


class UserPreferences(BaseModel):
    role: List[str]
    location: List[str]
    tech_stack: List[str]
    experience_level: Optional[str] = None
    desired_salary: Optional[str] = None
    company_size: Optional[List[str]] = None
    job_type: Optional[List[str]] = None
    work_arrangement: Optional[List[str]] = None

    @model_validator(mode="after")
    def validate_max_lengths(cls, values):
        if len(values.role) > 3:
            raise ValueError("You can select up to 3 roles only.")
        if len(values.location) > 3:
            raise ValueError("You can select up to 3 locations only.")
        if len(values.tech_stack) > 25:
            raise ValueError("You can select up to 25 tech stack items only.")
        if values.company_size and len(values.company_size) > 2:
            raise ValueError("You can select up to 2 company sizes only.")
        if values.job_type and len(values.job_type) > 2:
            raise ValueError("You can select up to 2 job types only.")
        if values.work_arrangement and len(values.work_arrangement) > 2:
            raise ValueError("You can select up to 2 work arrangements only.")
        return values


class User(BaseModel):
    name: str
    email: EmailStr
    password: Optional[str] = None
    is_first_time_user: bool = True
    preferences: Optional[UserPreferences] = None
    plan_type: PlanType = PlanType.free  # 🔥 default to 'free'
    created_at: datetime = datetime.utcnow()
    updated_at: datetime = datetime.utcnow()


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserGoogle(BaseModel):
    name: str
    email: EmailStr
    google_id: str


class Job(BaseModel):
    title: str
    company: str
    location: str
    description: Optional[str] = None
    job_url: Optional[str] = None
    date_scraped: datetime = datetime.utcnow()


# 🔷 NEW MODELS FOR RECOMMENDATIONS

class RecommendedJob(BaseModel):
    title: str
    company: str
    location: str
    match_score: Optional[int] = None
    reason: Optional[str] = None
    job_url: Optional[str] = None

class Recommendation(BaseModel):
    user_id: str
    recommended_jobs: List[RecommendedJob]
    generated_at: datetime = datetime.utcnow()
