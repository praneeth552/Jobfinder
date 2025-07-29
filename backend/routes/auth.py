from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from models import User, UserLogin, UserGoogle
from database import db
from utils import hash_password, verify_password, create_access_token
from google.oauth2 import id_token
from google.auth.transport import requests
import os
from dotenv import load_dotenv
from datetime import datetime
import razorpay
import httpx

load_dotenv()
router = APIRouter()
users_collection = db["users"]

razorpay_client = razorpay.Client(
    auth=(os.getenv("RAZORPAY_KEY_ID"), os.getenv("RAZORPAY_KEY_SECRET"))
)

TURNSTILE_SECRET_KEY = os.getenv("TURNSTILE_SECRET_KEY")

async def verify_turnstile(turnstile_token: str):
    if not turnstile_token:
        raise HTTPException(status_code=400, detail="Turnstile token is required")
    
    async with httpx.AsyncClient() as client:
        response = await client.post(
            "https://challenges.cloudflare.com/turnstile/v0/siteverify",
            data={"secret": TURNSTILE_SECRET_KEY, "response": turnstile_token},
        )
        data = response.json()
        if not data.get("success"):
            raise HTTPException(status_code=400, detail="Invalid Turnstile token")

class UserSignup(User):
    turnstile_token: str

import re

# Password validation function
def is_password_strong(password: str) -> bool:
    if len(password) < 8:
        return False
    if not re.search(r"[A-Z]", password):
        return False
    if not re.search(r"[a-z]", password):
        return False
    if not re.search(r"[0-9]", password):
        return False
    if not re.search(r"[^A-Za-z0-9]", password):
        return False
    return True

@router.post("/signup")
async def signup(user: UserSignup):
    await verify_turnstile(user.turnstile_token)
    existing_user = await users_collection.find_one({"email": user.email})
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")

    if not is_password_strong(user.password):
        raise HTTPException(status_code=400, detail="Password does not meet the required criteria.")
    
    user_dict = user.dict(exclude={"turnstile_token"})
    user_dict["password"] = hash_password(user.password)
    user_dict["auth_type"] = "standard"
    user_dict["is_first_time_user"] = True
    user_dict["preferences"] = {}
    user_dict["plan_type"] = "free"
    
    try:
        customer = razorpay_client.customer.create({
            "name": user.name,
            "email": user.email,
        })
        user_dict["razorpay_customer_id"] = customer["id"]
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to create Razorpay customer: {str(e)}")

    await users_collection.insert_one(user_dict)
    return {"message": "User created successfully"}

class UserLoginWithTurnstile(UserLogin):
    turnstile_token: str

@router.post("/login")
async def login(user: UserLoginWithTurnstile):
    await verify_turnstile(user.turnstile_token)
    db_user = await users_collection.find_one({"email": user.email})
    if not db_user or not verify_password(user.password, db_user["password"]):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    token = create_access_token({"email": db_user["email"]})
    return {
        "access_token": token,
        "token_type": "bearer",
        "is_first_time_user": db_user.get("is_first_time_user", True),
        "user_id": str(db_user["_id"]),
        "plan_type": db_user.get("plan_type", "free")
    }

class GoogleToken(BaseModel):
    token: str

@router.post("/google")
async def google_login(data: GoogleToken):
    try:
        idinfo = id_token.verify_oauth2_token(
            data.token,
            requests.Request(),
            os.environ.get("GOOGLE_CLIENT_ID")
        )

        email = idinfo["email"]
        name = idinfo.get("name", "")
        google_id_value = idinfo["sub"]

        db_user = await users_collection.find_one({"email": email})

        if not db_user:
            new_user_data = {
                "name": name,
                "email": email,
                "google_id": google_id_value,
                "auth_type": "google",
                "password": None,
                "is_first_time_user": True,
                "preferences": {},
                "plan_type": "free",
                "created_at": datetime.utcnow(),
                "updated_at": datetime.utcnow()
            }
            
            try:
                customer = razorpay_client.customer.create({
                    "name": name,
                    "email": email,
                })
                new_user_data["razorpay_customer_id"] = customer["id"]
            except Exception as e:
                raise HTTPException(status_code=500, detail=f"Failed to create Razorpay customer: {str(e)}")

            result = await users_collection.insert_one(new_user_data)
            user_id = str(result.inserted_id)
            is_first_time_user = True
            user_plan = "free"
        else:
            await users_collection.update_one(
                {"email": email},
                {"$set": {"updated_at": datetime.utcnow()}}
            )
            user_id = str(db_user["_id"])
            is_first_time_user = db_user.get("is_first_time_user", True)
            user_plan = db_user.get("plan_type", "free")

        token = create_access_token({"email": email})

        return {
            "access_token": token,
            "token_type": "bearer",
            "is_first_time_user": is_first_time_user,
            "user_id": user_id,
            "message": "Google login successful",
            "email": email,
            "name": name,
            "plan_type": user_plan
        }

    except ValueError:
        raise HTTPException(status_code=401, detail="Invalid Google token")
