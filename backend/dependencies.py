from slowapi import Limiter
from slowapi.util import get_remote_address
from jose import jwt, JWTError
from fastapi import Depends, HTTPException
from fastapi.security import OAuth2PasswordBearer
from database import db
from subscription_manager import check_and_downgrade_user_if_expired
import os
from dotenv import load_dotenv

load_dotenv()

SECRET_KEY = os.getenv("SECRET_KEY")
ALGORITHM = "HS256"

limiter = Limiter(key_func=get_remote_address)
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")
oauth2_scheme_optional = OAuth2PasswordBearer(tokenUrl="token", auto_error=False)

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

    # --- Real-time Subscription Status Check ---
    user = await check_and_downgrade_user_if_expired(user)
    # -----------------------------------------

    if user.get("plan_status") == "pending_deletion":
        raise HTTPException(
            status_code=403,
            detail="This account is pending deletion and cannot be accessed.",
        )

    # Convert ObjectId to string for JSON serialization if needed elsewhere
    user["_id"] = str(user["_id"])
    return user

async def get_current_user_optional(token: str = Depends(oauth2_scheme_optional)):
    if token is None:
        return None
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("email")
        if email is None:
            return None
    except JWTError:
        return None

    user = await db.users.find_one({"email": email})
    if user is None:
        return None

    # --- Real-time Subscription Status Check ---
    user = await check_and_downgrade_user_if_expired(user)
    # -----------------------------------------

    if user.get("plan_status") == "pending_deletion":
        return None

    # Convert ObjectId to string for JSON serialization if needed elsewhere
    user["_id"] = str(user["_id"])
    return user
