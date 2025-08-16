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

from datetime import datetime, timedelta

def is_pro_user(user: dict) -> bool:
    """
    Checks if a user has an active pro subscription.
    """
    if not user or user.get("plan_type") != "pro":
        return False

    status = user.get("subscription_status")
    valid_until = user.get("subscription_valid_until")

    # Ensure valid_until is a datetime object for comparison
    if valid_until and not isinstance(valid_until, datetime):
        # Attempt to parse if it's a string, otherwise default to a past time
        try:
            valid_until = datetime.fromisoformat(valid_until)
        except (TypeError, ValueError):
            valid_until = datetime.min

    now = datetime.utcnow()

    if status == "active" or status == "trialing":
        return True

    if status == "cancelled" and valid_until and valid_until > now:
        return True

    # Grace period for payments (e.g., 3 days)
    if status == "past_due" and valid_until and valid_until + timedelta(days=3) > now:
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
