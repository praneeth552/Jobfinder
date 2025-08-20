# 📁 File: backend/routes/sheets.py
# ⛳ Purpose: Handles Google Sheets OAuth flow — authorization and callback routes.

from fastapi import APIRouter, Request, Depends, HTTPException
from fastapi.responses import RedirectResponse
from google_auth_oauthlib.flow import Flow
from services.google_sheets import create_sheet_if_not_exists
from database import db
import os
from dotenv import load_dotenv
from bson import ObjectId
from utils import get_current_user, get_user_from_token_query

load_dotenv()
router = APIRouter()

# Load environment variables
CLIENT_SECRET_FILE = os.getenv("GOOGLE_CLIENT_SECRET_FILE", "client_secret.json")
SCOPES = [
    "https://www.googleapis.com/auth/spreadsheets",
    "openid",
    "https://www.googleapis.com/auth/userinfo.email",
    "https://www.googleapis.com/auth/userinfo.profile",
]
REDIRECT_URI = os.getenv("GOOGLE_REDIRECT_URI")
FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:3000")


@router.get("/auth")
async def authorize_sheet_access(current_user: dict = Depends(get_user_from_token_query)):
    """
    Starts the OAuth 2.0 flow for the user to grant access to their Google Sheets.
    """
    user_id = current_user.get("_id")
    if not user_id:
        raise HTTPException(status_code=400, detail="User not found")

    print(f"--- USING REDIRECT URI: '{REDIRECT_URI}' ---")
    flow = Flow.from_client_secrets_file(
        CLIENT_SECRET_FILE, scopes=SCOPES, redirect_uri=REDIRECT_URI
    )
    auth_url, state = flow.authorization_url(
        access_type='offline',
        include_granted_scopes='true',
        prompt='consent',
        state=str(user_id)  # Ensure state is a string
    )
    return RedirectResponse(auth_url)


@router.get("/callback")
async def oauth_callback(request: Request):
    """
    Handles the redirect from Google's OAuth server and saves the user credentials.
    """
    state = request.query_params.get("state")
    code = request.query_params.get("code")
    error = request.query_params.get("error")

    if error:
        return RedirectResponse(f"{FRONTEND_URL}/dashboard?sheets_error={error}")

    if not state or not code:
        raise HTTPException(status_code=400, detail="Missing state or code from Google OAuth")

    try:
        flow = Flow.from_client_secrets_file(
            CLIENT_SECRET_FILE, scopes=SCOPES, redirect_uri=REDIRECT_URI
        )
        flow.fetch_token(code=code)
        credentials = flow.credentials
        
        # The user_id is passed in the 'state' parameter
        user_id = state
        await create_sheet_if_not_exists(user_id, credentials.to_json())
        
        return RedirectResponse(f"{FRONTEND_URL}/dashboard?sheets_success=true")

    except Exception as e:
        print(f"Error during OAuth callback: {e}")
        return RedirectResponse(f"{FRONTEND_URL}/dashboard?sheets_error=token_exchange_failed")


@router.get("/status")
async def get_sheet_status(current_user: dict = Depends(get_current_user)):
    user_id = current_user.get("_id")
    user = await db.users.find_one({"_id": ObjectId(user_id)})
    if user and user.get("sheets_enabled"):
        return {"enabled": True}
    return {"enabled": False}


@router.post("/disable")
async def disable_sheet_sync(current_user: dict = Depends(get_current_user)):
    user_id = current_user.get("_id")
    await db.users.update_one(
        {"_id": ObjectId(user_id)},
        {"$set": {"sheets_enabled": False, "spreadsheet_id": None, "google_tokens": None}}
    )
    return {"message": "Google Sheets sync disabled."}