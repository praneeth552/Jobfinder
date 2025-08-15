from passlib.context import CryptContext
from jose import jwt, JWTError
from fastapi import Depends, HTTPException
from fastapi.security import OAuth2PasswordBearer
import time
import os
from dotenv import load_dotenv
from database import db

load_dotenv()

SECRET_KEY = os.getenv("SECRET_KEY")
ALGORITHM = "HS256"

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

def hash_password(password: str):
    return pwd_context.hash(password)

def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def create_access_token(data: dict, expires_delta: int = 3600):
    to_encode = data.copy()
    to_encode.update({"exp": time.time() + expires_delta})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

async def get_current_user(token: str = Depends(oauth2_scheme)):
    credentials_exception = HTTPException(
        status_code=401,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("email")
        if email is None:
            raise credentials_exception
    except JWTError as e:
        raise HTTPException(
            status_code=401,
            detail=f"Invalid token: {e}",
            headers={"WWW-Authenticate": "Bearer"},
        )

    user = await db.users.find_one({"email": email})
    if user is None:
        raise credentials_exception
    # Convert ObjectId to string for JSON serialization if needed elsewhere
    user["_id"] = str(user["_id"])
    return user

from datetime import datetime

def is_pro_user(user: dict) -> bool:
    """
    Checks if a user has an active pro subscription.
    Handles both 'pro' plan_type and subscription-based status.
    """
    if not user:
        return False

    # Legacy check for simple "pro" plan type
    if user.get("plan_type") == "pro" and not user.get("subscription_valid_until"):
        return True

    plan_status = user.get("plan_status")
    valid_until = user.get("subscription_valid_until")

    if valid_until and isinstance(valid_until, datetime) and valid_until > datetime.utcnow():
        if plan_status in ["active", "cancelled"]:
            return True

    return False


async def get_current_pro_user(current_user: dict = Depends(get_current_user)):
    """
    Dependency to verify if the current user has an active pro subscription.
    """
    # The user object from get_current_user is already what we need
    # but we refetch to ensure we have the absolute latest data from the DB
    # in case their plan changed since the token was issued.
    user = await db.users.find_one({"email": current_user.get("email")})

    if not is_pro_user(user):
        raise HTTPException(
            status_code=403,
            detail="This feature is available for Pro users only. Please upgrade your plan.",
        )

    # Return the user object from get_current_user which has the stringified _id
    return current_user
