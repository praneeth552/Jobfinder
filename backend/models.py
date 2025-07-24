from pydantic import BaseModel, EmailStr

class User(BaseModel):
    name: str
    email: EmailStr
    password: str

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
