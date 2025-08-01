import os
import sys
from pymongo import MongoClient
from dotenv import load_dotenv

# Add backend directory to sys.path to import database
sys.path.append(os.path.join(os.path.dirname(__file__), '..', 'backend'))

# Now you can import the database configuration
from database import MONGO_URI

def clear_jobs_collection():
    """
    Connects to the MongoDB database and clears the 'jobs' collection.
    """
    try:
        client = MongoClient(MONGO_URI)
        db = client["jobfinder"]
        print("Successfully connected to MongoDB.")

        if "jobs" in db.list_collection_names():
            db.drop_collection("jobs")
            print("Successfully dropped the 'jobs' collection.")
        else:
            print("'jobs' collection not found, no action taken.")

    except Exception as e:
        print(f"An error occurred: {e}")
        sys.exit(1)

if __name__ == "__main__":
    # Load environment variables from the backend .env file
    dotenv_path = os.path.join(os.path.dirname(__file__), '..', 'backend', '.env')
    if os.path.exists(dotenv_path):
        load_dotenv(dotenv_path=dotenv_path)
    else:
        print("Warning: .env file not found in backend directory. Make sure MONGO_URI is set.")
        
    clear_jobs_collection()
