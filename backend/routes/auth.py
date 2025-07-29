from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from models import User, UserLogin, UserGoogle
from database import db
from utils import hash_password, verify_password, create_access_token
from google.oauth2 import id_token
from google.auth.transport import requests
import os
from dotenv import load_dotenv
from datetime import datetime

load_dotenv()
router = APIRouter()
users_collection = db["users"]

# ✅ Signup route (standard)
@router.post("/signup")
async def signup(user: User):
    existing_user = await users_collection.find_one({"email": user.email})
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    user_dict = user.dict()
    user_dict["password"] = hash_password(user.password)
    user_dict["auth_type"] = "standard"
    user_dict["is_first_time_user"] = True
    user_dict["preferences"] = {}
    user_dict["plan_type"] = "free"  # ⬅️ NEW: default plan is 'free'
    
    await users_collection.insert_one(user_dict)
    return {"message": "User created successfully"}

# ✅ Login route (standard)
@router.post("/login")
async def login(user: UserLogin):
    db_user = await users_collection.find_one({"email": user.email})
    if not db_user or not verify_password(user.password, db_user["password"]):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    token = create_access_token({"email": db_user["email"]})
    return {
        "access_token": token,
        "token_type": "bearer",
        "is_first_time_user": db_user.get("is_first_time_user", True),
        "user_id": str(db_user["_id"]),
        "plan_type": db_user.get("plan_type", "free")  # ⬅️ NEW: include plan in response
    }

# ✅ New Pydantic model to receive Google token
class GoogleToken(BaseModel):
    token: str

# ✅ Google login route
@router.post("/google")
async def google_login(data: GoogleToken):
    try:
        # Verify token with Google
        idinfo = id_token.verify_oauth2_token(
            data.token,
            requests.Request(),
            os.environ.get("GOOGLE_CLIENT_ID")
        )

        email = idinfo["email"]
        name = idinfo.get("name", "")
        google_id_value = idinfo["sub"]

        # Check if user exists
        db_user = await users_collection.find_one({"email": email})

        if not db_user:
            # Create new user
            new_user_data = {
                "name": name,
                "email": email,
                "google_id": google_id_value,
                "auth_type": "google",
                "password": None,
                "is_first_time_user": True,
                "preferences": {},
                "plan_type": "free",  # ⬅️ NEW: default plan for new Google user
                "created_at": datetime.utcnow(),
                "updated_at": datetime.utcnow()
            }
            result = await users_collection.insert_one(new_user_data)
            user_id = str(result.inserted_id)
            is_first_time_user = True
            user_plan = "free"
        else:
            # For existing users, update the updated_at field
            await users_collection.update_one(
                {"email": email},
                {"$set": {"updated_at": datetime.utcnow()}}
            )
            user_id = str(db_user["_id"])
            is_first_time_user = db_user.get("is_first_time_user", True)
            user_plan = db_user.get("plan_type", "free")

        # Generate your app's JWT token
        token = create_access_token({"email": email})

        return {
            "access_token": token,
            "token_type": "bearer",
            "is_first_time_user": is_first_time_user,
            "user_id": user_id,
            "message": "Google login successful",
            "email": email,
            "name": name,
            "plan_type": user_plan  # ⬅️ NEW: send plan in response
        }

    except ValueError:
        raise HTTPException(status_code=401, detail="Invalid Google token")
