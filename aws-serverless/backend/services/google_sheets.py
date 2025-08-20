from database import db
from google.oauth2.credentials import Credentials
from googleapiclient.discovery import build
from google.auth.transport.requests import Request
import json
from bson import ObjectId
import os

# Define the scopes required for the application
SCOPES = [
    "https://www.googleapis.com/auth/spreadsheets",
    "openid",
    "https://www.googleapis.com/auth/userinfo.email",
    "https://www.googleapis.com/auth/userinfo.profile",
]

async def get_google_service(user_id):
    """
    Creates and returns a Google API service object for a given user.
    Handles credential loading, validation, and refreshing.
    """
    user = await db.users.find_one({"_id": ObjectId(user_id)})
    if not user or "google_tokens" not in user:
        return None

    creds = Credentials.from_authorized_user_info(json.loads(user["google_tokens"]), SCOPES)

    # Refresh credentials if they are expired
    if creds.expired and creds.refresh_token:
        creds.refresh(Request())
        # Update the stored tokens after refreshing
        await db.users.update_one(
            {"_id": ObjectId(user_id)},
            {"$set": {"google_tokens": creds.to_json()}}
        )

    return build('sheets', 'v4', credentials=creds)


async def create_sheet_if_not_exists(user_id, tokens):
    user_object_id = ObjectId(user_id)
    user = await db.users.find_one({"_id": user_object_id})
    spreadsheet_id = user.get("spreadsheet_id") if user else None

    # Save the initial tokens first
    await db.users.update_one(
        {"_id": user_object_id},
        {"$set": {"google_tokens": tokens, "sheets_enabled": True}},
        upsert=True
    )

    if not spreadsheet_id:
        try:
            service = await get_google_service(user_id)
            if not service:
                print("Failed to create Google service.")
                return

            spreadsheet_body = {
                'properties': {'title': 'Tackleit Job Recommendations'}
            }
            sheet = service.spreadsheets().create(body=spreadsheet_body, fields='spreadsheetId').execute()
            spreadsheet_id = sheet.get('spreadsheetId')
            print(f"--- Created new spreadsheet with ID: {spreadsheet_id} ---")

            # Save the new spreadsheet ID
            await db.users.update_one(
                {"_id": user_object_id},
                {"$set": {"spreadsheet_id": spreadsheet_id}}
            )
        except Exception as e:
            print(f"An error occurred creating the sheet: {e}")
            # Optionally, disable sheets_enabled if creation fails
            await db.users.update_one(
                {"_id": user_object_id},
                {"$set": {"sheets_enabled": False}}
            )
            return

    print(f"--- Successfully configured spreadsheet for user {user_id} ---")


async def get_user_tokens(user_id):
    user = await db.users.find_one({"_id": ObjectId(user_id)})
    return user.get("google_tokens") if user else None


async def write_to_sheet(user_id: str, data: list):
    print(f"--- Attempting to write to sheet for user {user_id} ---")
    user = await db.users.find_one({"_id": ObjectId(user_id)})
    
    if not user:
        print("--- User not found in database. ---")
        return
    if not user.get("sheets_enabled"):
        print("--- User has not enabled Google Sheets integration. ---")
        return
    if not user.get("spreadsheet_id"):
        print("--- Spreadsheet ID not found for user. ---")
        return

    try:
        print("--- Getting Google service... ---")
        service = await get_google_service(user_id)
        if not service:
            print("--- Failed to create Google service for writing. ---")
            return

        spreadsheet_id = user.get("spreadsheet_id")
        print(f"--- Writing to spreadsheet ID: {spreadsheet_id} ---")
        
        header = ["Title", "Company", "Location", "Match Score", "Reason", "Job URL"]
        rows = [header] + [[job.get(key, "") for key in ["title", "company", "location", "match_score", "reason", "job_url"]] for job in data]

        body = {
            'values': rows
        }
        
        print("--- Clearing existing sheet content... ---")
        service.spreadsheets().values().clear(
            spreadsheetId=spreadsheet_id,
            range='Sheet1'
        ).execute()

        print("--- Updating sheet with new data... ---")
        result = service.spreadsheets().values().update(
            spreadsheetId=spreadsheet_id,
            range='Sheet1',
            valueInputOption='USER_ENTERED',
            body=body
        ).execute()
        
        print(f"--- {result.get('updatedCells')} cells updated in sheet. ---")

    except Exception as e:
        print(f"--- An error occurred writing to the sheet: {e} ---")