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
    "https://www.googleapis.com/auth/drive.file",
    "openid",
    "https://www.googleapis.com/auth/userinfo.email",
    "https://www.googleapis.com/auth/userinfo.profile",
]

async def get_google_service(user_id, service_name, version):
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

    return build(service_name, version, credentials=creds)


async def create_sheet_if_not_exists(user_id, tokens):
    user_object_id = ObjectId(user_id)

    # Save tokens and enable sheets integration first
    await db.users.update_one(
        {"_id": user_object_id},
        {"$set": {"google_tokens": tokens, "sheets_enabled": True}},
        upsert=True
    )

    try:
        # Check if a spreadsheet already exists
        drive_service = await get_google_service(user_id, 'drive', 'v3')
        if not drive_service:
            print("Failed to create Google Drive service.")
            raise Exception("Could not create Drive service")

        sheet_name = "Tackleit Job Recommendations"
        query = f"name='{sheet_name}' and mimeType='application/vnd.google-apps.spreadsheet' and trashed=false"
        response = drive_service.files().list(q=query, spaces='drive', fields='files(id, name)').execute()
        files = response.get('files', [])

        spreadsheet_id = None
        if files:
            spreadsheet_id = files[0].get('id')
            print(f"--- Found existing spreadsheet with ID: {spreadsheet_id} ---")
        else:
            # If no sheet is found, create a new one
            sheets_service = await get_google_service(user_id, 'sheets', 'v4')
            if not sheets_service:
                print("Failed to create Google Sheets service.")
                raise Exception("Could not create Sheets service")

            spreadsheet_body = {'properties': {'title': sheet_name}}
            sheet = sheets_service.spreadsheets().create(body=spreadsheet_body, fields='spreadsheetId').execute()
            spreadsheet_id = sheet.get('spreadsheetId')
            print(f"--- Created new spreadsheet with ID: {spreadsheet_id} ---")

        # Save the spreadsheet ID to the database
        if spreadsheet_id:
            await db.users.update_one(
                {"_id": user_object_id},
                {"$set": {"spreadsheet_id": spreadsheet_id}}
            )
            print(f"--- Successfully configured spreadsheet for user {user_id} ---")

    except Exception as e:
        print(f"An error occurred: {e}")
        # Disable sheets integration on failure
        await db.users.update_one(
            {"_id": user_object_id},
            {"$set": {"sheets_enabled": False, "google_tokens": None, "spreadsheet_id": None}}
        )


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
        # If sheet ID is missing, try to create/find it again.
        print("--- Spreadsheet ID not found for user, attempting to create/find it. ---")
        try:
            await create_sheet_if_not_exists(user_id, user.get("google_tokens"))
            user = await db.users.find_one({"_id": ObjectId(user_id)}) # Re-fetch user
            if not user.get("spreadsheet_id"):
                print("--- Failed to create or find spreadsheet ID after retry. ---")
                return
        except Exception as e:
            print(f"--- Error during sheet creation/finding on write: {e} ---")
            return

    try:
        print("--- Getting Google service... ---")
        service = await get_google_service(user_id, 'sheets', 'v4')
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