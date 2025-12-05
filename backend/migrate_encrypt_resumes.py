"""
One-time migration script to encrypt existing resume data.
Run this ONCE after deploying the encryption changes.

Usage: python3 migrate_encrypt_resumes.py
"""
import asyncio
import os
from dotenv import load_dotenv
from motor.motor_asyncio import AsyncIOMotorClient
from cryptography.fernet import Fernet

load_dotenv()

# MongoDB connection
MONGO_URI = os.getenv("MONGO_URI")
ENCRYPTION_KEY = os.getenv("ENCRYPTION_KEY")

if not MONGO_URI:
    raise ValueError("MONGO_URI not set in .env")
if not ENCRYPTION_KEY:
    raise ValueError("ENCRYPTION_KEY not set in .env")

client = AsyncIOMotorClient(MONGO_URI)
db = client["jobfinder"]  # Match the database name in database.py
resumes_collection = db["resumes"]
users_collection = db["users"]

cipher = Fernet(ENCRYPTION_KEY.encode())


def is_encrypted(value: str) -> bool:
    """Check if a value is already Fernet-encrypted."""
    if not value or not isinstance(value, str):
        return False
    # Fernet tokens start with 'gAAAAA' and are long
    return value.startswith('gAAAAA') and len(value) > 100


def encrypt_field(value: str) -> str:
    """Encrypt a string field."""
    if not value:
        return value
    if is_encrypted(value):
        print(f"  Already encrypted, skipping")
        return value
    return cipher.encrypt(value.encode()).decode()


async def migrate_resumes():
    """Encrypt all unencrypted resume PII fields."""
    print("=" * 50)
    print("RESUME DATA ENCRYPTION MIGRATION")
    print("=" * 50)
    
    cursor = resumes_collection.find({})
    total = 0
    encrypted_count = 0
    skipped_count = 0
    
    async for resume in cursor:
        total += 1
        resume_id = resume.get("_id")
        user_id = resume.get("user_id")
        
        print(f"\nProcessing resume {total} (user_id: {user_id})...")
        
        update_fields = {}
        needs_update = False
        
        # Check and encrypt name
        if resume.get("name") and not is_encrypted(resume["name"]):
            update_fields["name"] = encrypt_field(resume["name"])
            needs_update = True
            print(f"  → Encrypting name: {resume['name'][:20]}...")
        
        # Check and encrypt email
        if resume.get("email") and not is_encrypted(resume["email"]):
            update_fields["email"] = encrypt_field(resume["email"])
            needs_update = True
            print(f"  → Encrypting email: {resume['email'][:20]}...")
        
        # Check and encrypt phone
        if resume.get("phone") and not is_encrypted(resume["phone"]):
            update_fields["phone"] = encrypt_field(resume["phone"])
            needs_update = True
            print(f"  → Encrypting phone: {resume['phone'][:10]}...")
        
        if needs_update:
            await resumes_collection.update_one(
                {"_id": resume_id},
                {"$set": update_fields}
            )
            encrypted_count += 1
            print(f"  ✓ Updated resume for user {user_id}")
        else:
            skipped_count += 1
            print(f"  - Already encrypted or no PII fields")
    
    print("\n" + "=" * 50)
    print(f"MIGRATION COMPLETE")
    print(f"Total resumes processed: {total}")
    print(f"Encrypted: {encrypted_count}")
    print(f"Skipped (already encrypted): {skipped_count}")
    print("=" * 50)


async def migrate_google_tokens():
    """Encrypt all unencrypted Google OAuth tokens."""
    print("\n" + "=" * 50)
    print("GOOGLE TOKENS ENCRYPTION MIGRATION")
    print("=" * 50)
    
    cursor = users_collection.find({"google_tokens": {"$exists": True, "$ne": None}})
    total = 0
    encrypted_count = 0
    skipped_count = 0
    
    async for user in cursor:
        total += 1
        user_id = user.get("_id")
        email = user.get("email", "unknown")
        
        print(f"\nProcessing user {total} ({email})...")
        
        tokens = user.get("google_tokens")
        if tokens and not is_encrypted(tokens):
            encrypted_tokens = encrypt_field(tokens)
            await users_collection.update_one(
                {"_id": user_id},
                {"$set": {"google_tokens": encrypted_tokens}}
            )
            encrypted_count += 1
            print(f"  ✓ Encrypted Google tokens")
        else:
            skipped_count += 1
            print(f"  - Already encrypted or empty")
    
    print("\n" + "=" * 50)
    print(f"MIGRATION COMPLETE")
    print(f"Total users with tokens: {total}")
    print(f"Encrypted: {encrypted_count}")
    print(f"Skipped (already encrypted): {skipped_count}")
    print("=" * 50)


async def migrate_razorpay_customer_ids():
    """Encrypt all unencrypted Razorpay customer IDs."""
    print("\n" + "=" * 50)
    print("RAZORPAY CUSTOMER ID ENCRYPTION MIGRATION")
    print("=" * 50)
    
    cursor = users_collection.find({"razorpay_customer_id": {"$exists": True, "$ne": None}})
    total = 0
    encrypted_count = 0
    skipped_count = 0
    
    async for user in cursor:
        total += 1
        user_id = user.get("_id")
        email = user.get("email", "unknown")
        
        print(f"\nProcessing user {total} ({email})...")
        
        customer_id = user.get("razorpay_customer_id")
        if customer_id and not is_encrypted(customer_id):
            encrypted_customer_id = encrypt_field(customer_id)
            await users_collection.update_one(
                {"_id": user_id},
                {"$set": {"razorpay_customer_id": encrypted_customer_id}}
            )
            encrypted_count += 1
            print(f"  ✓ Encrypted Razorpay customer ID")
        else:
            skipped_count += 1
            print(f"  - Already encrypted or empty")
    
    print("\n" + "=" * 50)
    print(f"MIGRATION COMPLETE")
    print(f"Total users with customer IDs: {total}")
    print(f"Encrypted: {encrypted_count}")
    print(f"Skipped (already encrypted): {skipped_count}")
    print("=" * 50)


async def main():
    print("\n🔒 Starting Encryption Migration...\n")
    await migrate_resumes()
    await migrate_google_tokens()
    await migrate_razorpay_customer_ids()
    print("\n✅ All migrations complete!\n")


if __name__ == "__main__":
    asyncio.run(main())
