from database import db
from google.oauth2.credentials import Credentials
from googleapiclient.discovery import build
from google.auth.transport.requests import Request
import json
from bson import ObjectId
import os
import asyncio

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
        await asyncio.to_thread(creds.refresh, Request())
        await db.users.update_one(
            {"_id": ObjectId(user_id)},
            {"$set": {"google_tokens": creds.to_json()}}
        )

    return build(service_name, version, credentials=creds)

async def _find_or_create_spreadsheet_id(user_id: str) -> str | None:
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
    await db.users.update_one(
        {"_id": user_object_id},
        {"$set": {
            "google_tokens": tokens,
            "sheets_enabled": True,
            "spreadsheet_id": None
        }},
        upsert=True
    )
    print(f"--- Successfully enabled sheets for user {user_id} and stored tokens. ---")

async def write_to_sheet(user_id: str, data: list) -> bool:
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

    try:
        service = await get_google_service(user_id, 'sheets', 'v4')
        if not service:
            print("--- Failed to create Google service for writing. ---")
            return False

        print(f"--- Writing to spreadsheet ID: {spreadsheet_id} ---")
        
        header = ["Title", "Company", "Location", "Match Score", "Reason", "Job URL"]
        rows = [header] + [[job.get(key, "") for key in ["title", "company", "location", "match_score", "reason", "job_url"]] for job in data]

        body = {'values': rows}
        
        clear_request = service.spreadsheets().values().clear(spreadsheetId=spreadsheet_id, range='Sheet1')
        await asyncio.to_thread(clear_request.execute)

        update_request = service.spreadsheets().values().update(
            spreadsheetId=spreadsheet_id,
            range='Sheet1',
            valueInputOption='USER_ENTERED',
            body=body
        )
        result = await asyncio.to_thread(update_request.execute)
        
        print(f"--- {result.get('updatedCells')} cells updated in sheet. ---")
        return True

    except Exception as e:
        print(f"--- An error occurred writing to the sheet: {e} ---")
        return False