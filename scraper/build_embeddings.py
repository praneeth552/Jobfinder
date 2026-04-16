"""
FAISS Embedding Index Builder for Tackleit v2.5

This script runs AFTER all scrapers in the GitHub Action.
It:
1. Fetches all jobs from MongoDB
2. Embeds each job using Gemini text-embedding-004
3. Builds a FAISS IndexFlatIP (cosine similarity)
4. Stores the index + ID mapping in MongoDB GridFS

Usage:
    python scraper/build_embeddings.py

Environment Variables Required:
    MONGO_URI: MongoDB connection string
    GEMINI_API_KEY: Google Gemini API key
"""

import os
import sys
import json
import time
import tempfile
import numpy as np

# Add backend to path for database import
sys.path.append(os.path.join(os.path.dirname(__file__), '..', 'backend'))

from pymongo import MongoClient
from gridfs import GridFS
from dotenv import load_dotenv
import google.generativeai as genai

# Load environment variables
dotenv_path = os.path.join(os.path.dirname(__file__), '..', 'backend', '.env')
if os.path.exists(dotenv_path):
    load_dotenv(dotenv_path=dotenv_path)
else:
    load_dotenv()

# Try importing faiss
try:
    import faiss
except ImportError:
    print("ERROR: faiss-cpu not installed. Run: pip install faiss-cpu")
    sys.exit(1)

# Configuration
MONGO_URI = os.getenv("MONGO_URI")
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
EMBEDDING_MODEL = "models/text-embedding-004"
EMBEDDING_DIMENSION = 768
BATCH_SIZE = 100  # Gemini batch embedding limit

if not MONGO_URI:
    print("ERROR: MONGO_URI not set")
    sys.exit(1)

if not GEMINI_API_KEY:
    print("ERROR: GEMINI_API_KEY not set")
    sys.exit(1)

# Configure Gemini
genai.configure(api_key=GEMINI_API_KEY)


def create_job_text(job: dict) -> str:
    """
    Create a text representation of a job for embedding.
    Combines title, company, location, and description into a single string.
    """
    parts = []
    
    title = job.get("title", "")
    if title:
        parts.append(f"{title}")
    
    company = job.get("company", "")
    if company:
        parts.append(f"at {company}")
    
    location = job.get("location", "")
    if location:
        parts.append(f"in {location}")
    
    description = job.get("description", "")
    if description:
        # Truncate description to keep embedding focused
        parts.append(f". {description[:500]}")
    
    return " ".join(parts) if parts else "Job listing"


def embed_batch(texts: list) -> np.ndarray:
    """Embed a batch of texts using Gemini."""
    result = genai.embed_content(
        model=EMBEDDING_MODEL,
        content=texts,
        task_type="retrieval_document"
    )
    return np.array(result['embedding'], dtype=np.float32)


def build_index():
    """Main function to build the FAISS index and store it in GridFS."""
    print("=" * 60)
    print("TACKLEIT EMBEDDING INDEX BUILDER v2.5")
    print("=" * 60)
    
    # Connect to MongoDB
    print("\n📡 Connecting to MongoDB...")
    client = MongoClient(MONGO_URI)
    db = client["jobfinder"]
    jobs_collection = db["jobs"]
    fs = GridFS(db)
    
    # Fetch all jobs
    print("📋 Fetching jobs from database...")
    jobs = list(jobs_collection.find({}))
    total_jobs = len(jobs)
    
    if total_jobs == 0:
        print("⚠️  No jobs found in database. Skipping index build.")
        return
    
    print(f"✅ Found {total_jobs} jobs to embed")
    
    # Create text representations
    print("\n📝 Creating text representations...")
    job_texts = []
    job_ids = []
    
    for job in jobs:
        text = create_job_text(job)
        job_texts.append(text)
        job_ids.append(str(job["_id"]))
    
    # Embed in batches
    print(f"\n🧠 Embedding {total_jobs} jobs (batch size: {BATCH_SIZE})...")
    all_embeddings = []
    
    for i in range(0, len(job_texts), BATCH_SIZE):
        batch = job_texts[i:i + BATCH_SIZE]
        batch_num = (i // BATCH_SIZE) + 1
        total_batches = (len(job_texts) + BATCH_SIZE - 1) // BATCH_SIZE
        
        print(f"  Batch {batch_num}/{total_batches} ({len(batch)} jobs)...", end=" ")
        
        try:
            embeddings = embed_batch(batch)
            all_embeddings.append(embeddings)
            print("✅")
        except Exception as e:
            print(f"❌ Error: {e}")
            # Wait and retry once
            print(f"  Retrying in 5 seconds...")
            time.sleep(5)
            try:
                embeddings = embed_batch(batch)
                all_embeddings.append(embeddings)
                print(f"  Retry ✅")
            except Exception as e2:
                print(f"  Retry failed: {e2}")
                print(f"  Skipping batch {batch_num}")
                # Create zero vectors for failed batch
                zero_embeddings = np.zeros((len(batch), EMBEDDING_DIMENSION), dtype=np.float32)
                all_embeddings.append(zero_embeddings)
        
        # Rate limiting: be nice to the API
        if i + BATCH_SIZE < len(job_texts):
            time.sleep(1)
    
    # Combine all embeddings
    embeddings_matrix = np.vstack(all_embeddings)
    print(f"\n📊 Embedding matrix shape: {embeddings_matrix.shape}")
    
    # Normalize vectors for cosine similarity
    print("🔄 Normalizing vectors for cosine similarity...")
    faiss.normalize_L2(embeddings_matrix)
    
    # Build FAISS index
    print("🏗️  Building FAISS index (IndexFlatIP for cosine similarity)...")
    index = faiss.IndexFlatIP(EMBEDDING_DIMENSION)
    index.add(embeddings_matrix)
    print(f"✅ Index built with {index.ntotal} vectors")
    
    # Create ID mapping (FAISS position -> MongoDB job _id)
    id_map = {str(i): job_id for i, job_id in enumerate(job_ids)}
    
    # Save to temporary files
    tmp_dir = tempfile.gettempdir()
    index_path = os.path.join(tmp_dir, "faiss_index.bin")
    map_path = os.path.join(tmp_dir, "faiss_id_map.json")
    
    print(f"\n💾 Saving index to temporary files...")
    faiss.write_index(index, index_path)
    with open(map_path, "w") as f:
        json.dump(id_map, f)
    
    index_size_kb = os.path.getsize(index_path) / 1024
    map_size_kb = os.path.getsize(map_path) / 1024
    print(f"  Index size: {index_size_kb:.1f} KB")
    print(f"  ID map size: {map_size_kb:.1f} KB")
    print(f"  Total: {(index_size_kb + map_size_kb):.1f} KB")
    
    # Upload to GridFS (overwrite existing)
    print(f"\n☁️  Uploading to MongoDB GridFS...")
    
    # Delete old files if they exist
    for filename in ["faiss_index.bin", "faiss_id_map.json"]:
        existing = db["fs.files"].find_one({"filename": filename})
        if existing:
            fs.delete(existing["_id"])
            print(f"  Deleted old {filename}")
    
    # Upload new files
    with open(index_path, "rb") as f:
        fs.put(f, filename="faiss_index.bin", metadata={
            "total_jobs": total_jobs,
            "dimension": EMBEDDING_DIMENSION,
            "model": EMBEDDING_MODEL,
            "built_at": time.strftime("%Y-%m-%d %H:%M:%S UTC", time.gmtime())
        })
    print(f"  ✅ Uploaded faiss_index.bin")
    
    with open(map_path, "rb") as f:
        fs.put(f, filename="faiss_id_map.json", metadata={
            "total_mappings": len(id_map),
            "built_at": time.strftime("%Y-%m-%d %H:%M:%S UTC", time.gmtime())
        })
    print(f"  ✅ Uploaded faiss_id_map.json")
    
    # Clean up temp files
    os.remove(index_path)
    os.remove(map_path)
    
    print(f"\n{'=' * 60}")
    print(f"✅ EMBEDDING INDEX BUILD COMPLETE")
    print(f"   Jobs indexed: {total_jobs}")
    print(f"   Vector dimension: {EMBEDDING_DIMENSION}")
    print(f"   Index type: IndexFlatIP (cosine similarity)")
    print(f"   Storage: MongoDB GridFS")
    print(f"   Total size: {(index_size_kb + map_size_kb):.1f} KB")
    print(f"{'=' * 60}")


if __name__ == "__main__":
    build_index()
