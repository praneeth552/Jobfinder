from database import db
from google.oauth2.credentials import Credentials
from googleapiclient.discovery import build
import json
from bson import ObjectId

async def create_sheet_if_not_exists(user_id, tokens):
    user_object_id = ObjectId(user_id)
    user = await db.users.find_one({"_id": user_object_id})
    spreadsheet_id = user.get("spreadsheet_id") if user else None

    creds = Credentials.from_authorized_user_info(json.loads(tokens))

    if not spreadsheet_id:
        try:
            service = build('sheets', 'v4', credentials=creds)
            spreadsheet_body = {
                'properties': {'title': 'Job Recommendations'}
            }
            sheet = service.spreadsheets().create(body=spreadsheet_body, fields='spreadsheetId').execute()
            spreadsheet_id = sheet.get('spreadsheetId')
            print(f"--- Created new spreadsheet with ID: {spreadsheet_id} ---")
        except Exception as e:
            print(f"An error occurred creating the sheet: {e}")
            return

    # Always update the user's record with the latest tokens and spreadsheet ID
    update_result = await db.users.update_one(
        {"_id": user_object_id},
        {
            "$set": {
                "google_tokens": tokens,
                "sheets_enabled": True,
                "spreadsheet_id": spreadsheet_id
            }
        }
    )
    
    if update_result.modified_count > 0:
        print(f"--- Successfully saved spreadsheet ID for user {user_id} ---")
    else:
        print(f"--- Failed to save spreadsheet ID for user {user_id} ---")

async def get_user_tokens(user_id):
    user = await db.users.find_one({"_id": ObjectId(user_id)})
    return user.get("google_tokens") if user else None

async def write_to_sheet(user_id: str, data: list):
    user_object_id = ObjectId(user_id)
    user = await db.users.find_one({"_id": user_object_id})
    
    if not user or not user.get("sheets_enabled") or not user.get("google_tokens"):
        print("User has not enabled Google Sheets integration or tokens are missing.")
        return

    creds = Credentials.from_authorized_user_info(json.loads(user["google_tokens"]))
    spreadsheet_id = user.get("spreadsheet_id")

    if not spreadsheet_id:
        print("No spreadsheet ID found for user.")
        return

    try:
        service = build('sheets', 'v4', credentials=creds)
        
        header = ["Title", "Company", "Location", "Match Score", "Reason", "Job URL"]
        rows = [header] + [[job.get(key, "") for key in ["title", "company", "location", "match_score", "reason", "job_url"]] for job in data]

        body = {
            'values': rows
        }
        
        service.spreadsheets().values().clear(
            spreadsheetId=spreadsheet_id,
            range='Sheet1'
        ).execute()

        result = service.spreadsheets().values().update(
            spreadsheetId=spreadsheet_id,
            range='Sheet1',
            valueInputOption='USER_ENTERED',
            body=body
        ).execute()
        
        print(f"{result.get('updatedCells')} cells updated in sheet.")

    except Exception as e:
        print(f"An error occurred writing to the sheet: {e}")

