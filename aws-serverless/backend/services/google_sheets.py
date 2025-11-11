from database import db
from google.oauth2.credentials import Credentials
from googleapiclient.discovery import build
from google.auth.transport.requests import Request
from google.auth.exceptions import RefreshError
import json
from bson import ObjectId
import os
import asyncio
from typing import Optional, List

# Define the scopes required for the application
SCOPES = [
    "https://www.googleapis.com/auth/spreadsheets",
    "https://www.googleapis.com/auth/drive.file",
    "openid",
    "https://www.googleapis.com/auth/userinfo.email",
    "https://www.googleapis.com/auth/userinfo.profile",
]

async def get_google_service(user_id, service_name, version):
    user = await db.users.find_one({"_id": ObjectId(user_id)})
    if not user or "google_tokens" not in user:
        return None

    creds = Credentials.from_authorized_user_info(json.loads(user["google_tokens"]), SCOPES)

    if creds.expired and creds.refresh_token:
        try:
            await asyncio.to_thread(creds.refresh, Request())
            await db.users.update_one(
                {"_id": ObjectId(user_id)},
                {"$set": {"google_tokens": creds.to_json()}}
            )
        except RefreshError as e:
            print(f"--- Google Token Refresh Error for user {user_id}: {e} ---")
            # Token is expired or revoked, reset the user's sheet integration
            await db.users.update_one(
                {"_id": ObjectId(user_id)},
                {"$set": {
                    "google_tokens": None,
                    "sheets_enabled": False,
                    "spreadsheet_id": None
                }}
            )
            print(f"--- Reset Google Sheets integration for user {user_id} ---")
            return None

    return build(service_name, version, credentials=creds)

async def _find_or_create_spreadsheet_id(user_id: str) -> Optional[str]:
    try:
        drive_service = await get_google_service(user_id, 'drive', 'v3')
        if not drive_service:
            raise Exception("Could not create Drive service")

        sheet_name = "Tackleit Job Recommendations"
        query = f"name='{sheet_name}' and mimeType='application/vnd.google-apps.spreadsheet' and trashed=false"
        
        search_request = drive_service.files().list(q=query, spaces='drive', fields='files(id, name)')
        response = await asyncio.to_thread(search_request.execute)

        files = response.get('files', [])

        if files:
            spreadsheet_id = files[0].get('id')
            print(f"--- Found existing spreadsheet with ID: {spreadsheet_id} ---")
            return spreadsheet_id
        else:
            sheets_service = await get_google_service(user_id, 'sheets', 'v4')
            if not sheets_service:
                raise Exception("Could not create Sheets service")

            spreadsheet_body = {'properties': {'title': sheet_name}}
            create_request = sheets_service.spreadsheets().create(body=spreadsheet_body, fields='spreadsheetId')
            sheet = await asyncio.to_thread(create_request.execute)
            
            spreadsheet_id = sheet.get('spreadsheetId')
            print(f"--- Created new spreadsheet with ID: {spreadsheet_id} ---")
            return spreadsheet_id

    except Exception as e:
        print(f"--- An error occurred during sheet creation/finding: {e} ---")
        return None

async def handle_oauth_callback(user_id: str, tokens: str):
    user_object_id = ObjectId(user_id)
    
    # Fetch the user to check the bonus flag
    user_doc = await db.users.find_one({"_id": user_object_id})
    
    update_fields = {
        "google_tokens": tokens,
        "sheets_enabled": True,
        "spreadsheet_id": None
    }
    
    if user_doc and not user_doc.get("google_sheets_bonus_awarded", False):
        update_fields["time_saved_minutes"] = user_doc.get("time_saved_minutes", 0) + 15
        update_fields["google_sheets_bonus_awarded"] = True

    await db.users.update_one(
        {"_id": user_object_id},
        {"$set": update_fields},
        upsert=True
    )
    print(f"--- Successfully enabled sheets for user {user_id} and stored tokens. ---")

async def write_to_sheet(user_id: str, data: List) -> bool:
    print(f"--- Attempting to write to sheet for user {user_id} ---")
    user = await db.users.find_one({"_id": ObjectId(user_id)})
    
    if not user or not user.get("sheets_enabled"):
        return False

    spreadsheet_id = user.get("spreadsheet_id")

    if not spreadsheet_id:
        print("--- Spreadsheet ID not found, triggering lazy creation. ---")
        spreadsheet_id = await _find_or_create_spreadsheet_id(user_id)
        
        if spreadsheet_id:
            await db.users.update_one(
                {"_id": ObjectId(user_id)},
                {"$set": {"spreadsheet_id": spreadsheet_id}}
            )
        else:
            print("--- Failed to create or find spreadsheet ID. Aborting write. ---")
            return False

    TARGET_SHEET_NAME = "Tackleit Jobs"
    try:
        service = await get_google_service(user_id, 'sheets', 'v4')
        if not service:
            print("--- Failed to create Google service for writing. ---")
            return False

        print(f"--- Ensuring sheet '{TARGET_SHEET_NAME}' exists in spreadsheet ID: {spreadsheet_id} ---")

        # Get spreadsheet properties to check for our target sheet
        spreadsheet_properties = await asyncio.to_thread(
            service.spreadsheets().get(spreadsheetId=spreadsheet_id).execute
        )
        sheets = spreadsheet_properties.get('sheets', [])
        
        target_sheet_exists = any(sheet['properties']['title'] == TARGET_SHEET_NAME for sheet in sheets)
        default_sheet = next((sheet for sheet in sheets if sheet['properties']['title'] == 'Sheet1'), None)

        if not target_sheet_exists and default_sheet:
            print(f"--- Renaming 'Sheet1' to '{TARGET_SHEET_NAME}' ---")
            rename_request = {
                "updateSheetProperties": {
                    "properties": {"sheetId": default_sheet['properties']['sheetId'], "title": TARGET_SHEET_NAME},
                    "fields": "title"
                }
            }
            await asyncio.to_thread(
                service.spreadsheets().batchUpdate(
                    spreadsheetId=spreadsheet_id, body={'requests': [rename_request]}
                ).execute
            )
        elif not target_sheet_exists:
            print(f"--- Creating new sheet named '{TARGET_SHEET_NAME}' ---")
            add_sheet_request = {"addSheet": {"properties": {"title": TARGET_SHEET_NAME}}}
            await asyncio.to_thread(
                service.spreadsheets().batchUpdate(
                    spreadsheetId=spreadsheet_id, body={'requests': [add_sheet_request]}
                ).execute
            )

        # Now, clear and write to the target sheet
        print(f"--- Clearing and writing to sheet: {TARGET_SHEET_NAME} ---")
        
        header = ["Title", "Company", "Location", "Match Score", "Reason", "Job URL"]
        rows = [header] + [[job.get(key, "") for key in ["title", "company", "location", "match_score", "reason", "job_url"]] for job in data]
        
        body = {'values': rows}
        
        # Clear the sheet first
        clear_request = service.spreadsheets().values().clear(spreadsheetId=spreadsheet_id, range=TARGET_SHEET_NAME)
        await asyncio.to_thread(clear_request.execute)

        # Update the sheet with new data
        update_request = service.spreadsheets().values().update(
            spreadsheetId=spreadsheet_id,
            range=TARGET_SHEET_NAME,
            valueInputOption='USER_ENTERED',
            body=body
        )
        result = await asyncio.to_thread(update_request.execute)
        
        print(f"--- {result.get('updatedCells')} cells updated in sheet. ---")
        return True

    except Exception as e:
        print(f"--- An error occurred writing to the sheet: {e} ---")
        if "was not found" in str(e):
            print("--- Spreadsheet not found. Resetting spreadsheet_id for user. ---")
            await db.users.update_one(
                {"_id": ObjectId(user_id)},
                {"$set": {"spreadsheet_id": None}}
            )
        return False