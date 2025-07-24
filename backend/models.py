from pydantic import BaseModel, EmailStr, field_validator, model_validator
from typing import List, Optional

class User(BaseModel):
    name: str
    email: EmailStr
    password: str | None = None
    is_first_time_user: bool = True
    preferences: dict = {}


class UserLogin(BaseModel):
    email: EmailStr
    password: str

class Job(BaseModel):
    title: str
    company: str
    location: str

class UserGoogle(BaseModel):
    name: str
    email: EmailStr
    google_id: str

class UserPreferences(BaseModel):
    role: List[str]
    location: List[str]
    tech_stack: List[str]
    experience_level: Optional[str]  # "fresher", "1-3 years", "3+ years"

    @model_validator(mode="after")
    def validate_max_lengths(cls, values):
        if len(values.role) > 3:
            raise ValueError("You can select up to 3 roles only.")
        if len(values.location) > 3:
            raise ValueError("You can select up to 3 locations only.")
        if len(values.tech_stack) > 10:
            raise ValueError("You can select up to 10 tech stack items only.")
        return values
