from pydantic import BaseModel, EmailStr, field_validator, model_validator, Field
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


class SubscriptionStatus(str, Enum):
    active = "active"
    cancelled = "cancelled"
    past_due = "past_due"
    unpaid = "unpaid"
    trialing = "trialing"

class JobApplicationStatus(str, Enum):
    recommended = "recommended"
    saved = "saved"
    applied = "applied"

class RecommendedJob(BaseModel):
    title: str
    company: str
    location: str
    match_score: Optional[int] = None
    reason: Optional[str] = None
    job_url: Optional[str] = None
    status: Optional[JobApplicationStatus] = None

class JobApplication(BaseModel):
    job_details: RecommendedJob
    status: JobApplicationStatus
    updated_at: datetime = Field(default_factory=datetime.utcnow)

class User(BaseModel):
    name: str
    email: EmailStr
    password: Optional[str] = None
    is_first_time_user: bool = True
    preferences: Optional[UserPreferences] = None
    plan_type: PlanType = PlanType.free
    razorpay_subscription_id: Optional[str] = None
    plan_status: Optional[str] = None
    subscription_status: Optional[SubscriptionStatus] = None
    subscription_valid_until: Optional[datetime] = None
    last_resume_upload: Optional[datetime] = None
    job_applications: List[JobApplication] = []
    google_tokens: Optional[str] = None
    sheets_enabled: bool = False
    spreadsheet_id: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    deletion_requested_at: Optional[datetime] = None


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
    date_scraped: datetime = Field(default_factory=datetime.utcnow)


class Recommendation(BaseModel):
    user_id: str
    recommended_jobs: List[RecommendedJob]
    generated_at: datetime = Field(default_factory=datetime.utcnow)

# --- Response Models ---

class UserProfileResponse(BaseModel):
    id: str = Field(..., alias="_id")
    name: str
    email: EmailStr
    plan_type: PlanType
    plan_status: Optional[str] = None
    is_first_time_user: bool
    sheets_enabled: bool
    preferences: Optional[UserPreferences] = None
    created_at: datetime
    next_generation_allowed_at: Optional[datetime] = None
    next_resume_upload_allowed_at: Optional[datetime] = None

    class Config:
        populate_by_name = True
        from_attributes = True


class ResumeDataResponse(BaseModel):
    skills: Optional[List[str]] = None
    roles: Optional[List[str]] = None
    education: Optional[List[str]] = None
    experience: Optional[List[str]] = None
    name: Optional[str] = None
    email: Optional[EmailStr] = None
    phone: Optional[str] = None

class UserDataResponse(BaseModel):
    user_profile: UserProfileResponse
    resume_data: Optional[ResumeDataResponse] = None

class DeleteAccountResponse(BaseModel):
    message: str