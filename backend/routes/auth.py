from fastapi import APIRouter, HTTPException, Request
from pydantic import BaseModel
from models import User, UserLogin, UserGoogle
from database import db
from utils import hash_password, verify_password, create_access_token
from jose import jwt
from google.oauth2 import id_token
from google.auth.transport import requests
import os
from dotenv import load_dotenv
from datetime import datetime, timedelta
import razorpay
import httpx
import random
import string
from email_utils import send_email
import pymongo
from dependencies import limiter

load_dotenv()
router = APIRouter()
users_collection = db["users"]
temp_users_collection = db["temp_users"]
password_reset_tokens_collection = db["password_reset_tokens"]

# Add a TTL index to the temp_users_collection
temp_users_collection.create_index("createdAt", expireAfterSeconds=600) # OTP expires in 10 minutes
password_reset_tokens_collection.create_index("createdAt", expireAfterSeconds=600) # Reset token expires in 10 minutes

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

def generate_otp(length=6):
    characters = string.digits
    return "".join(random.choice(characters) for _ in range(length))


class EmailCheck(BaseModel):
    email: str

@router.post("/check-email")
@limiter.limit("20/minute")
async def check_email_availability(request: Request, data: EmailCheck):
    """
    Checks if an email is already registered.
    """
    existing_user = await users_collection.find_one({"email": data.email})
    if existing_user:
        if existing_user.get("plan_status") == "pending_deletion":
            return {"available": False, "message": "Email associated with a deleted account."}
        return {"available": False, "message": "Email already registered."}
    
    deleted_users_collection = db["deleted_users"]
    if await deleted_users_collection.find_one({"email": data.email}):
        return {"available": False, "message": "Email associated with a deleted account."}
        
    return {"available": True}


@router.post("/signup-otp")
@limiter.limit("5/minute")
async def signup_otp(request: Request, user: UserSignup):
    await verify_turnstile(user.turnstile_token)
    
    deleted_users_collection = db["deleted_users"]
    if await deleted_users_collection.find_one({"email": user.email}):
        raise HTTPException(status_code=403, detail="This email address is associated with a deleted account and cannot be used to sign up again.")

    existing_user = await users_collection.find_one({"email": user.email})
    if existing_user:
        if existing_user.get("plan_status") == "pending_deletion":
            deletion_date = existing_user.get("deletion_requested_at")
            if deletion_date and datetime.utcnow() - deletion_date < timedelta(days=30):
                raise HTTPException(
                    status_code=403,
                    detail="This email address is associated with an account that is pending deletion. Please wait 30 days to create a new account."
                )
            else:
                # If the cooldown has passed, allow re-registration by deleting the old record first
                await users_collection.delete_one({"email": user.email})
        else:
            raise HTTPException(status_code=400, detail="Email already registered")

    if not is_password_strong(user.password):
        raise HTTPException(status_code=400, detail="Password does not meet the required criteria.")
    
    otp = generate_otp()
    
    temp_user_data = user.dict(exclude={"turnstile_token"})
    temp_user_data["otp"] = otp
    temp_user_data["createdAt"] = datetime.utcnow()
    
    await temp_users_collection.insert_one(temp_user_data)
    
    email_body = f"""
    <html>
        <body>
            <h2>Welcome to Tackleit!</h2>
            <p>Your One-Time Password (OTP) for account verification is:</p>
            <h3>{otp}</h3>
            <p>This OTP is valid for 10 minutes. Please do not share it with anyone.</p>
            <p>If you did not request this, please ignore this email.</p>
            <br>
            <p>Best regards,</p>
            <p>The Tackleit Team</p>
        </body>
    </html>
    """

    try:
        await send_email(
            subject="Your OTP for Job Finder Account Verification",
            recipients=[user.email],
            body=email_body
        )
        return {"message": "OTP sent to your email successfully."}
    except Exception as e:
        print(f"Error sending email: {e}")
        raise HTTPException(status_code=500, detail="Failed to send OTP email.")


class VerifyOTP(BaseModel):
    email: str
    otp: str

@router.post("/verify-otp")
@limiter.limit("10/minute")
async def verify_otp(request: Request, data: VerifyOTP):
    temp_user = await temp_users_collection.find_one({"email": data.email, "otp": data.otp})

    if not temp_user:
        raise HTTPException(status_code=400, detail="Invalid OTP or email.")

    user_dict = {
        "name": temp_user["name"],
        "email": temp_user["email"],
        "password": hash_password(temp_user["password"]),
        "auth_type": "standard",
        "is_first_time_user": True,
        "preferences": {},
        "plan_type": "free",
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow()
    }
    
    try:
        customer = razorpay_client.customer.create({
            "name": temp_user["name"],
            "email": temp_user["email"],
        })
        user_dict["razorpay_customer_id"] = customer["id"]
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to create Razorpay customer: {str(e)}")

    await users_collection.insert_one(user_dict)
    await temp_users_collection.delete_one({"email": data.email})
    
    return {"message": "User created successfully. Please log in."}


class ResendOtp(BaseModel):
    email: str

@router.post("/resend-otp")
@limiter.limit("5/minute")
async def resend_otp(request: Request, data: ResendOtp):
    temp_user = await temp_users_collection.find_one({"email": data.email})
    if not temp_user:
        raise HTTPException(status_code=404, detail="No pending OTP verification found for this email.")

    otp = generate_otp()
    await temp_users_collection.update_one(
        {"email": data.email},
        {"$set": {"otp": otp, "createdAt": datetime.utcnow()}}
    )

    email_body = f"""
    <html>
        <body>
            <h2>Here is your new Tackleit OTP</h2>
            <p>Your new One-Time Password (OTP) for account verification is:</p>
            <h3>{otp}</h3>
            <p>This OTP is valid for 10 minutes. Please do not share it with anyone.</p>
            <p>If you did not request this, please ignore this email.</p>
            <br>
            <p>Best regards,</p>
            <p>The Tackleit Team</p>
        </body>
    </html>
    """

    try:
        await send_email(
            subject="Your New OTP for Job Finder Account Verification",
            recipients=[data.email],
            body=email_body
        )
        return {"message": "A new OTP has been sent to your email."}
    except Exception as e:
        print(f"Error sending email: {e}")
        raise HTTPException(status_code=500, detail="Failed to send new OTP email.")


class UserLoginWithTurnstile(UserLogin):
    turnstile_token: str

@router.post("/login")
@limiter.limit("10/minute")
async def login(request: Request, user: UserLoginWithTurnstile):
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

        if db_user and db_user.get("plan_status") == "pending_deletion":
            deletion_date = db_user.get("deletion_requested_at")
            if deletion_date and datetime.utcnow() - deletion_date < timedelta(days=30):
                # Account is pending deletion, give user option to restore
                token = create_access_token({"email": db_user["email"], "scope": "restore"})
                return {
                    "account_status": "pending_deletion",
                    "message": "This account is scheduled for deletion. Would you like to restore it?",
                    "recovery_token": token,
                    "email": email,
                    "name": name,
                }
            else:
                # Deletion grace period has passed, allow re-registration
                await users_collection.delete_one({"email": email})
                db_user = None

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


class ForgotPassword(BaseModel):
    email: str

@router.post("/forgot-password")
@limiter.limit("5/minute")
async def forgot_password(request: Request, data: ForgotPassword):
    user = await users_collection.find_one({"email": data.email, "auth_type": "standard"})
    # We silently succeed even if the user doesn't exist to prevent email enumeration attacks
    if user:
        token = create_access_token(data={"email": data.email, "scope": "password_reset"}, expires_delta=timedelta(minutes=10))
        await password_reset_tokens_collection.insert_one({"token": token, "email": data.email, "createdAt": datetime.utcnow()})
        
        reset_link = f"https://tackleit.in/reset-password?token={token}"
        email_body = f"""
        <html>
            <body>
                <h2>Password Reset Request</h2>
                <p>You requested a password reset for your Tackleit account.</p>
                <p>Click the link below to set a new password. This link is valid for 10 minutes.</p>
                <a href="{reset_link}" target="_blank">Reset Your Password</a>
                <p>If you did not request this, please ignore this email.</p>
                <br>
                <p>Best regards,</p>
                <p>The Tackleit Team</p>
            </body>
        </html>
        """
        try:
            await send_email(
                subject="Your Tackleit Password Reset Link",
                recipients=[data.email],
                body=email_body
            )
        except Exception as e:
            print(f"Error sending password reset email: {e}")
            # Do not raise exception to the client

    return {"message": "If an account with that email exists, a password reset link has been sent."}


class ResetPassword(BaseModel):
    token: str
    new_password: str

@router.post("/reset-password")
@limiter.limit("5/minute")
async def reset_password(request: Request, data: ResetPassword):
    try:
        # First, check if token was used
        token_in_db = await password_reset_tokens_collection.find_one_and_delete({"token": data.token})
        if not token_in_db:
            raise HTTPException(status_code=400, detail="Password reset link is invalid or has expired.")

        payload = jwt.decode(data.token, os.getenv("SECRET_KEY"), algorithms=[os.getenv("ALGORITHM")])
        if payload.get("scope") != "password_reset":
            raise HTTPException(status_code=401, detail="Invalid token scope.")
        
        email = payload.get("email")
        if not email:
            raise HTTPException(status_code=400, detail="Invalid token payload.")

        if not is_password_strong(data.new_password):
            raise HTTPException(status_code=400, detail="New password does not meet the required criteria.")

        user = await users_collection.find_one({"email": email})
        if not user:
            raise HTTPException(status_code=404, detail="User not found.")

        # Check if the new password is the same as the old one
        if verify_password(data.new_password, user["password"]):
            raise HTTPException(status_code=400, detail="New password cannot be the same as the old password.")

        hashed_new_password = hash_password(data.new_password)
        result = await users_collection.update_one(
            {"email": email},
            {"$set": {"password": hashed_new_password}}
        )

        if result.matched_count == 0:
            raise HTTPException(status_code=404, detail="User not found.")

        return {"message": "Password has been reset successfully."}

    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=400, detail="Password reset link has expired.")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=400, detail="Invalid token.")
