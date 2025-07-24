from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from models import User, UserLogin, UserGoogle
from database import db
from utils import hash_password, verify_password, create_access_token
from google.oauth2 import id_token
from google.auth.transport import requests
import os


router = APIRouter()

users_collection = db["users"]

# ✅ Existing signup route
@router.post("/signup")
async def signup(user: User):
    existing_user = await users_collection.find_one({"email": user.email})
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    user_dict = user.dict()
    user_dict["password"] = hash_password(user.password)
    user_dict["auth_type"] = "standard"
    await users_collection.insert_one(user_dict)
    return {"message": "User created successfully"}

# ✅ Existing login route
@router.post("/login")
async def login(user: UserLogin):
    db_user = await users_collection.find_one({"email": user.email})
    if not db_user or not verify_password(user.password, db_user["password"]):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    token = create_access_token({"email": db_user["email"]})
    return {"access_token": token, "token_type": "bearer"}

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
            os.environ.get("GOOGLE_CLIENT_ID")  # Replace with your actual Google Client ID
        )

        email = idinfo["email"]
        name = idinfo.get("name", "")
        google_id = idinfo["sub"]

        # Check if user exists
        db_user = await users_collection.find_one({"email": email})

        if not db_user:
            # Create new user
            new_user = {
                "name": name,
                "email": email,
                "google_id": google_id,
                "auth_type": "google",
                "password": None,  # No password for Google users
            }
            await users_collection.insert_one(new_user)

        # Generate your app's JWT token
        token = create_access_token({"email": email})

        return {
            "access_token": token,
            "token_type": "bearer",
            "message": "Google login successful",
            "email": email,
            "name": name
        }

    except ValueError:
        raise HTTPException(status_code=401, detail="Invalid Google token")
    

@router.post("/google-login")
async def google_login(user: UserGoogle):
    db_user = await users_collection.find_one({"email": user.email})
    if db_user:
        token = create_access_token({"email": db_user["email"]})
        return {"access_token": token, "token_type": "bearer"}
    else:
        # Optionally create user if not exists
        user_dict = user.dict()
        user_dict["auth_type"] = "google"
        user_dict["password"] = None
        await users_collection.insert_one(user_dict)
        token = create_access_token({"email": user.email})
        return {"access_token": token, "token_type": "bearer"}

