# 📁 File: backend/routes/sheets.py
# ⛳ Purpose: Handles Google Sheets OAuth flow — authorization and callback routes.

from fastapi import APIRouter, Request, Depends, HTTPException
from fastapi.responses import RedirectResponse
from google_auth_oauthlib.flow import Flow
from services.google_sheets import handle_oauth_callback
from database import db
import os
import json
from dotenv import load_dotenv
from bson import ObjectId
from utils import get_current_user, get_user_from_token_query

load_dotenv()
router = APIRouter()

# --- Construct absolute path for client_secret.json ---
# The script is in /routes, so we go up one level to the 'backend' directory
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CLIENT_SECRET_PATH = os.path.join(BASE_DIR, "client_secret.json")

# Load environment variables
GOOGLE_CLIENT_SECRET_JSON = os.getenv("GOOGLE_CLIENT_SECRET_JSON")
SCOPES = [
    "https://www.googleapis.com/auth/spreadsheets",
    "https://www.googleapis.com/auth/drive.file",
    "openid",
    "https://www.googleapis.com/auth/userinfo.email",
    "https://www.googleapis.com/auth/userinfo.profile",
]
REDIRECT_URI = os.getenv("GOOGLE_REDIRECT_URI")
FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:3000")

def get_google_flow():
    """Initializes the Google OAuth Flow from env var or file."""
    if GOOGLE_CLIENT_SECRET_JSON:
        client_config = json.loads(GOOGLE_CLIENT_SECRET_JSON)
        return Flow.from_client_config(
            client_config, scopes=SCOPES, redirect_uri=REDIRECT_URI
        )
    elif os.path.exists(CLIENT_SECRET_PATH):
        return Flow.from_client_secrets_file(
            CLIENT_SECRET_PATH, scopes=SCOPES, redirect_uri=REDIRECT_URI
        )
    else:
        raise FileNotFoundError(
            "Google client secret not found. "
            "Set GOOGLE_CLIENT_SECRET_JSON env var or place client_secret.json in the backend root."
        )

@router.get("/auth")
async def authorize_sheet_access(current_user: dict = Depends(get_user_from_token_query)):
    """
    Starts the OAuth 2.0 flow for the user to grant access to their Google Sheets.
    """
    user_id = current_user.get("_id")
    if not user_id:
        raise HTTPException(status_code=400, detail="User not found")

    print(f"--- USING REDIRECT URI: '{REDIRECT_URI}' ---")
    flow = get_google_flow()
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
        flow = get_google_flow()
        flow.fetch_token(code=code)
        credentials = flow.credentials
        
        # The user_id is passed in the 'state' parameter
        user_id = state
        await handle_oauth_callback(user_id, credentials.to_json())
        
        return RedirectResponse(f"{FRONTEND_URL}/dashboard?sheets_success=true")

    except Exception as e:
        print(f"Error during OAuth callback: {e}")
        return RedirectResponse(f"{FRONTEND_URL}/dashboard?sheets_error=token_exchange_failed")


@router.get("/status")
async def get_sheet_status(current_user: dict = Depends(get_current_user)):
    """
    Checks if a user has Google Sheets integration enabled.
    """
    return {"enabled": current_user.get("sheets_enabled", False)}


@router.post("/disable")
async def disable_sheet_sync(current_user: dict = Depends(get_current_user)):
    """
    Disables Google Sheets integration for the user by revoking the token
    and clearing the data from the database.
    """
    user_id = current_user.get("_id")
    user = await db.users.find_one({"_id": ObjectId(user_id)})
    
    if user and user.get("google_tokens"):
        try:
            tokens = json.loads(user["google_tokens"])
            token_to_revoke = tokens.get("token") # This is usually the access_token

            async with httpx.AsyncClient() as client:
                response = await client.post(
                    "https://oauth2.googleapis.com/revoke",
                    params={"token": token_to_revoke},
                    headers={"Content-Type": "application/x-www-form-urlencoded"}
                )
            
            if response.status_code == 200:
                print(f"--- Successfully revoked token for user {user_id} ---")
            else:
                # Log error but proceed with cleanup
                print(f"--- Failed to revoke token for user {user_id}. Status: {response.status_code}, Body: {response.text} ---")

        except Exception as e:
            print(f"--- An error occurred during token revocation: {e} ---")

    # Always clear user data regardless of revocation success
    try:
        await db.users.update_one(
            {"_id": ObjectId(user_id)},
            {"$set": {"sheets_enabled": False, "google_tokens": None, "spreadsheet_id": None}}
        )
        return {"message": "Google Sheets integration disabled successfully."}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to disable integration: {e}")
