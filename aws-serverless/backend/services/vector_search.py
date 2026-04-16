"""
Vector Search Service for Tackleit v2.5

Provides FAISS-based semantic similarity search over job listings.
The FAISS index is stored in MongoDB GridFS and cached locally on Lambda's /tmp.

Uses Gemini text-embedding-004 for embeddings (768-dimensional vectors).
"""

import os
import json
import tempfile
import numpy as np

try:
    import faiss
    FAISS_AVAILABLE = True
except ImportError:
    FAISS_AVAILABLE = False
    print("WARNING: faiss not installed. Semantic vector search will fall back to full collection scan.")

import google.generativeai as genai
from database import db, client as mongo_client
from gridfs import GridFS
from pymongo import MongoClient
from dotenv import load_dotenv

load_dotenv()

# Configure Gemini for embeddings
genai.configure(api_key=os.environ.get("GEMINI_API_KEY", ""))

EMBEDDING_MODEL = "models/text-embedding-004"
EMBEDDING_DIMENSION = 768

# Module-level cache for the FAISS index
_cached_index = None
_cached_id_map = None
_cached_version = None

# GridFS uses synchronous pymongo, so we need sync client
_sync_mongo_uri = os.getenv("MONGO_URI", "")
_sync_client = None
_sync_db = None
_sync_fs = None


def _get_sync_gridfs():
    """Get a synchronous GridFS instance (GridFS doesn't support motor/async)."""
    global _sync_client, _sync_db, _sync_fs
    if _sync_fs is None:
        _sync_client = MongoClient(_sync_mongo_uri)
        _sync_db = _sync_client["jobfinder"]
        _sync_fs = GridFS(_sync_db)
    return _sync_fs


def embed_text(text: str) -> np.ndarray:
    """
    Embed a single text string using Gemini text-embedding-004.
    
    Args:
        text: The text to embed
        
    Returns:
        numpy array of shape (768,)
    """
    result = genai.embed_content(
        model=EMBEDDING_MODEL,
        content=text,
        task_type="retrieval_query"
    )
    return np.array(result['embedding'], dtype=np.float32)


def embed_texts_batch(texts: list, task_type: str = "retrieval_document") -> np.ndarray:
    """
    Embed multiple texts in a batch using Gemini.
    
    Args:
        texts: List of strings to embed
        task_type: "retrieval_document" for indexing, "retrieval_query" for searching
        
    Returns:
        numpy array of shape (len(texts), 768)
    """
    result = genai.embed_content(
        model=EMBEDDING_MODEL,
        content=texts,
        task_type=task_type
    )
    return np.array(result['embedding'], dtype=np.float32)


def load_index():
    """
    Load the FAISS index from MongoDB GridFS, with caching.
    
    Caching strategy:
    1. Check module-level cache (warmest — zero I/O)
    2. Check /tmp filesystem cache (warm Lambda — no MongoDB call)
    3. Download from GridFS (cold start — one MongoDB call)
    
    Returns:
        tuple of (faiss.Index, dict mapping faiss_position -> job_id_string)
        or (None, None) if no index exists
    """
    global _cached_index, _cached_id_map, _cached_version
    
    if not FAISS_AVAILABLE:
        print("DEBUG: FAISS is not available, cannot load index.")
        return None, None
        
    fs = _get_sync_gridfs()
    
    # Check if index exists in GridFS
    index_file = _sync_db["fs.files"].find_one({"filename": "faiss_index.bin"})
    if not index_file:
        print("DEBUG: No FAISS index found in GridFS")
        return None, None
    
    current_version = str(index_file.get("uploadDate", ""))
    
    # 1. Module-level cache hit
    if _cached_index is not None and _cached_version == current_version:
        print("DEBUG: Using module-level cached FAISS index")
        return _cached_index, _cached_id_map
    
    # 2. Check /tmp cache
    tmp_index_path = os.path.join(tempfile.gettempdir(), "faiss_index.bin")
    tmp_map_path = os.path.join(tempfile.gettempdir(), "faiss_id_map.json")
    tmp_version_path = os.path.join(tempfile.gettempdir(), "faiss_version.txt")
    
    if os.path.exists(tmp_index_path) and os.path.exists(tmp_version_path):
        with open(tmp_version_path, "r") as f:
            cached_ver = f.read().strip()
        if cached_ver == current_version:
            print("DEBUG: Using /tmp cached FAISS index")
            index = faiss.read_index(tmp_index_path)
            with open(tmp_map_path, "r") as f:
                id_map = json.load(f)
            _cached_index = index
            _cached_id_map = id_map
            _cached_version = current_version
            return index, id_map
    
    # 3. Download from GridFS (cold start)
    print("DEBUG: Downloading FAISS index from GridFS...")
    
    # Download index binary
    grid_out = fs.get_last_version("faiss_index.bin")
    with open(tmp_index_path, "wb") as f:
        f.write(grid_out.read())
    
    # Download ID map
    grid_out_map = fs.get_last_version("faiss_id_map.json")  
    with open(tmp_map_path, "wb") as f:
        f.write(grid_out_map.read())
    
    # Save version marker
    with open(tmp_version_path, "w") as f:
        f.write(current_version)
    
    # Load into memory
    index = faiss.read_index(tmp_index_path)
    with open(tmp_map_path, "r") as f:
        id_map = json.load(f)
    
    # Cache at module level
    _cached_index = index
    _cached_id_map = id_map
    _cached_version = current_version
    
    print(f"DEBUG: FAISS index loaded — {index.ntotal} vectors, {len(id_map)} job mappings")
    return index, id_map


async def search_similar_jobs(query_text: str, top_k: int = 200) -> list:
    """
    Search for the most semantically similar jobs to a query.
    
    Args:
        query_text: Natural language description of what the user is looking for
                    (built from preferences + resume data)
        top_k: Number of top results to return
        
    Returns:
        List of MongoDB job _id strings, ordered by similarity (most similar first).
        Returns empty list if no index is available.
    """
    index, id_map = load_index()
    
    if index is None or id_map is None:
        print("DEBUG: No FAISS index available, falling back to full scan")
        return []
    
    # Embed the query
    query_vector = embed_text(query_text)
    query_vector = query_vector.reshape(1, -1)
    
    # Normalize for cosine similarity (IndexFlatIP uses inner product)
    faiss.normalize_L2(query_vector)
    
    # Search
    actual_k = min(top_k, index.ntotal)
    distances, indices = index.search(query_vector, actual_k)
    
    # Map FAISS indices back to MongoDB job IDs
    result_ids = []
    for idx in indices[0]:
        if idx >= 0:  # FAISS returns -1 for empty slots
            str_idx = str(idx)
            if str_idx in id_map:
                result_ids.append(id_map[str_idx])
    
    print(f"DEBUG: Vector search returned {len(result_ids)} candidates from query: '{query_text[:80]}...'")
    return result_ids


def build_search_query(preferences: dict, resume_data: dict = None) -> str:
    """
    Build a natural language search query from user preferences and resume.
    This query gets embedded and used for FAISS similarity search.
    
    Args:
        preferences: User preference dict (roles, skills, locations, etc.)
        resume_data: Optional parsed resume data
        
    Returns:
        A natural language string optimized for embedding search
    """
    parts = []
    
    # Roles are the most important signal
    roles = preferences.get("role", [])
    if roles:
        parts.append(f"Looking for: {', '.join(roles)}")
    
    # Resume roles as additional signal
    if resume_data and resume_data.get("roles"):
        resume_roles = resume_data.get("roles", [])
        parts.append(f"Background in: {', '.join(resume_roles[:3])}")
    
    # Tech stack
    tech_stack = preferences.get("tech_stack", [])
    if tech_stack:
        parts.append(f"Skills: {', '.join(tech_stack[:10])}")
    
    # Resume skills
    if resume_data and resume_data.get("skills"):
        resume_skills = [s for s in resume_data.get("skills", [])[:5] if s not in tech_stack]
        if resume_skills:
            parts.append(f"Also experienced with: {', '.join(resume_skills)}")
    
    # Location
    locations = preferences.get("location", [])
    if locations:
        parts.append(f"Location: {', '.join(locations)}")
    
    # Experience level
    exp = preferences.get("experience_level", "")
    if exp:
        parts.append(f"Experience: {exp}")
    
    # Seniority
    seniority = preferences.get("seniority_level", "")
    if seniority:
        parts.append(f"Seniority: {seniority}")
    
    # Work arrangement
    work = preferences.get("work_arrangement", [])
    if work:
        parts.append(f"Work type: {', '.join(work)}")
    
    # Must-have keywords
    must_have = preferences.get("must_have_keywords", [])
    if must_have:
        parts.append(f"Must include: {', '.join(must_have)}")
    
    query = ". ".join(parts) if parts else "Software engineering job"
    return query
