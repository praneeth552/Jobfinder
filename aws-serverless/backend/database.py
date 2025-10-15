from motor.motor_asyncio import AsyncIOMotorClient
import os
from dotenv import load_dotenv

load_dotenv()

MONGO_URI = os.getenv("MONGO_URI")

client = AsyncIOMotorClient(MONGO_URI)
db = client["jobfinder"]

async def create_text_index():
    await db.jobs.create_index([
        ("title", "text"),
        ("company", "text"),
        ("location", "text")
    ])
