# 📁 File: aws-serverless/routes/sheets.py
# ⛳ Purpose: Handles Google Sheets OAuth flow — authorization and callback routes.

from fastapi import APIRouter, Request, Depends, HTTPException
from fastapi.responses import RedirectResponse
from google_auth_oauthlib.flow import Flow
from services.google_sheets import handle_oauth_callback
from database import db
import os
import json
import httpx
from dotenv import load_dotenv
from bson import ObjectId
from utils import get_current_user, get_user_from_token_query

load_dotenv()
router = APIRouter()

# Load environment variables
CLIENT_SECRET_FILE = os.getenv("GOOGLE_CLIENT_SECRET_FILE", "client_secret.json")
GOOGLE_CLIENT_SECRET_JSON = os.getenv("GOOGLE_CLIENT_SECRET_JSON")
SCOPES = [
    "https://www.googleapis.com/auth/spreadsheets",
    "https://www.googleapis.com/auth/drive.file",
    "openid",
    "https://www.googleapis.com/auth/userinfo.email",
    "https://www.googleapis.com/auth/userinfo.profile",
]
REDIRECT_URI = os.getenv("GOOGLE_REDIRECT_URI")
FRONTEND_URL = os.getenv("FRONTEND_URL", "https://tackleit.xyz")

def _resolve_client_secret_path() -> str:
    """
    Resolve a real path to client_secret.json that works in Lambda and locally.
    Order:
      1) GOOGLE_CLIENT_SECRET_FILE env if it exists
      2) /var/task/client_secret.json (Lambda task root)
      3) ../client_secret.json relative to this file
      4) Fallback to CLIENT_SECRET_FILE (even if missing, to surface clear error)
    """
    candidate_paths = []
    if CLIENT_SECRET_FILE:
        candidate_paths.append(CLIENT_SECRET_FILE)
    # Lambda container default task root
    lambda_root = os.getenv("LAMBDA_TASK_ROOT")
    if lambda_root:
        candidate_paths.append(os.path.join(lambda_root, "client_secret.json"))
    # Common absolute path used in Lambda
    candidate_paths.append("/var/task/client_secret.json")
    current_dir = os.path.dirname(__file__)
    candidate_paths.append(os.path.realpath(os.path.join(current_dir, "..", "client_secret.json")))

    # Debug: log candidate paths without revealing contents
    print(f"--- Resolving client_secret.json, candidates: {candidate_paths} ---")

    for path in candidate_paths:
        try:
            if path and os.path.isfile(path):
                print(f"--- Using client_secret.json at: {path} ---")
                return path
        except Exception:
            continue
    return CLIENT_SECRET_FILE

def _resolve_redirect_uri() -> str:
    """
    Resolve a safe redirect URI for Google OAuth:
    1) Prefer GOOGLE_REDIRECT_URI env when set and non-empty.
    2) Otherwise, try reading redirect_uris from client secret JSON (env or file).
       Prefer a URI ending with "/sheets/callback" if present, else take the first.
    """
    if REDIRECT_URI and REDIRECT_URI.strip():
        return REDIRECT_URI

    # Attempt to resolve from provided client config (env var)
    try:
        if GOOGLE_CLIENT_SECRET_JSON:
            client_config = json.loads(GOOGLE_CLIENT_SECRET_JSON)
        else:
            resolved_secret_path = _resolve_client_secret_path()
            with open(resolved_secret_path, "r") as f:
                client_config = json.load(f)

        web_cfg = client_config.get("web") or {}
        redirect_uris = web_cfg.get("redirect_uris") or []
        if not redirect_uris:
            raise ValueError("No redirect_uris found in client_secret configuration")

        # Prefer the sheets callback if present
        preferred = [u for u in redirect_uris if u.endswith("/sheets/callback")]
        return preferred[0] if preferred else redirect_uris[0]
    except Exception as e:
        # Last resort fallback for local dev
        print(f"--- Failed to resolve GOOGLE_REDIRECT_URI from client_secret: {e} ---")
        return "https://uuv7o727ua.execute-api.us-east-1.amazonaws.com/sheets/callback"


def get_google_flow():
    """Initializes the Google OAuth Flow from env var or file with a robust redirect URI."""
    redirect_uri = _resolve_redirect_uri()
    if GOOGLE_CLIENT_SECRET_JSON:
        client_config = json.loads(GOOGLE_CLIENT_SECRET_JSON)
        return Flow.from_client_config(
            client_config, scopes=SCOPES, redirect_uri=redirect_uri
        )
    else:
        return Flow.from_client_secrets_file(
            _resolve_client_secret_path(), scopes=SCOPES, redirect_uri=redirect_uri
        )

@router.get("/auth")
async def authorize_sheet_access(current_user: dict = Depends(get_user_from_token_query)):
    """
    Starts the OAuth 2.0 flow for the user to grant access to their Google Sheets.
    """
    user_id = current_user.get("_id")
    if not user_id:
        raise HTTPException(status_code=400, detail="User not found")

    try:
        resolved_redirect = _resolve_redirect_uri()
        print(f"--- USING RESOLVED REDIRECT URI: '{resolved_redirect}' ---")

        flow = get_google_flow()
        auth_url, state = flow.authorization_url(
            access_type='offline',
            include_granted_scopes='true',
            prompt='consent',
            state=str(user_id)
        )
        return RedirectResponse(auth_url)
    except FileNotFoundError as e:
        # Explicitly surface missing client secret file issues
        resolved_path = _resolve_client_secret_path()
        raise HTTPException(status_code=500, detail=f"Google client_secret.json not found at '{resolved_path}': {e}")
    except Exception as e:
        # Provide actionable context in production
        raise HTTPException(status_code=500, detail=f"Failed to initialize Google OAuth flow. Details: {e}")


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
