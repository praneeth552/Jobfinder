from motor.motor_asyncio import AsyncIOMotorClient
import os
from dotenv import load_dotenv
import dns.resolver

load_dotenv()

# Set a fallback DNS resolver
try:
    dns.resolver.default_resolver = dns.resolver.Resolver()
    dns.resolver.default_resolver.nameservers = ['8.8.8.8']
except Exception as e:
    print(f"Could not set DNS resolver: {e}")

MONGO_URI = os.getenv("MONGO_URI")

client = AsyncIOMotorClient(MONGO_URI)
db = client["jobfinder"]

async def create_text_index():
    await db.jobs.create_index([
        ("title", "text"),
        ("company", "text"),
        ("location", "text")
    ])
    await db.users.create_index("last_seen_at")
    await db.users.create_index("visit_count")
    await db.feedback.create_index("rating")
    await db.usage_events.create_index([("user_id", 1), ("created_at", -1)])
