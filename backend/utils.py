from passlib.context import CryptContext
from jose import jwt, JWTError
from fastapi import Depends, HTTPException, Request
from fastapi.security import OAuth2PasswordBearer
from datetime import datetime, timedelta
import os
from dotenv import load_dotenv
from database import db
from subscription_manager import check_and_downgrade_user_if_expired

load_dotenv()

SECRET_KEY = os.getenv("SECRET_KEY")
ALGORITHM = "HS256"

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

def hash_password(password: str):
    return pwd_context.hash(password)

def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def create_access_token(data: dict, expires_delta: timedelta | None = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
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


async def get_user_from_token_query(request: Request):
    token = request.query_params.get("token")
    if not token:
        raise HTTPException(
            status_code=401,
            detail="Missing authentication token in query",
        )
    
    credentials_exception = HTTPException(
        status_code=401,
        detail="Could not validate credentials from token",
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
from models import PlanType, SubscriptionStatus

def is_pro_user(user: dict) -> bool:
    """
    Checks if a user has an active pro subscription, accounting for grace periods and cancellations.
    """
    if not user or user.get("plan_type") != PlanType.pro:
        return False

    # For backward compatibility for users who upgraded before subscription status was added.
    if "plan_status" not in user:
        return True

    status = user.get("plan_status")
    valid_until = user.get("subscription_valid_until")

    # Ensure valid_until is a datetime object for comparison
    if valid_until and isinstance(valid_until, str):
        try:
            valid_until = datetime.fromisoformat(valid_until)
        except (TypeError, ValueError):
            valid_until = datetime.min
    elif not isinstance(valid_until, datetime):
        valid_until = datetime.min

    now = datetime.utcnow()

    # 1. Active or trialing users are always Pro.
    if status in [SubscriptionStatus.active, SubscriptionStatus.trialing]:
        return True

    # 2. Users who cancelled but are within their paid period are still Pro.
    if status == SubscriptionStatus.cancelled and valid_until > now:
        return True

    # 3. Users with past_due status might be in a grace period.
    #    (This logic can be adjusted based on business rules)
    if status == SubscriptionStatus.past_due and valid_until + timedelta(days=3) > now:
        print(f"User {user.get('email')} is in grace period.")
        return True

    return False


async def get_current_pro_user(current_user: dict = Depends(get_current_user)) -> dict:
    """
    Dependency that fetches the user's latest data and verifies they have Pro access.
    Raises HTTPException if the user is not a Pro member.
    """
    # Refetch the user from the database to ensure the subscription status is current.
    user_from_db = await db.users.find_one({"email": current_user.get("email")})

    if not user_from_db or not is_pro_user(user_from_db):
        raise HTTPException(
            status_code=403,
            detail="This feature is available for Pro users only. Please upgrade your plan.",
        )
    
    # Return the original user object from get_current_user which has the stringified _id
    return current_user
