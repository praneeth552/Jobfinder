"""
Experience Extraction Utilities for Job Scrapers
Extracts experience requirements from job descriptions and API responses.
"""
import re
from typing import Tuple, Optional


def extract_experience_from_text(text: str) -> Tuple[Optional[str], Optional[int]]:
    """
    Extract experience requirements from text using regex patterns.
    
    Args:
        text: Job description or any text containing experience info
        
    Returns:
        Tuple of (experience_required: str, experience_min_years: int)
        e.g., ("3-5 years", 3) or ("Fresher", 0) or (None, None)
    """
    if not text:
        return None, None
    
    text_lower = text.lower()
    
    # Pattern 1: "X-Y years" or "X to Y years"
    range_pattern = r'(\d+)\s*[-–to]+\s*(\d+)\s*(?:years?|yrs?)'
    range_match = re.search(range_pattern, text_lower)
    if range_match:
        min_years = int(range_match.group(1))
        max_years = int(range_match.group(2))
        return f"{min_years}-{max_years} years", min_years
    
    # Pattern 2: "X+ years" or "X years+"
    plus_pattern = r'(\d+)\s*\+?\s*(?:years?|yrs?)\s*\+?(?:\s+of\s+)?(?:experience)?'
    plus_match = re.search(plus_pattern, text_lower)
    if plus_match:
        min_years = int(plus_match.group(1))
        return f"{min_years}+ years", min_years
    
    # Pattern 3: "minimum X years" or "at least X years"
    min_pattern = r'(?:minimum|at\s+least|min)\s*[:\s]*(\d+)\s*(?:years?|yrs?)'
    min_match = re.search(min_pattern, text_lower)
    if min_match:
        min_years = int(min_match.group(1))
        return f"{min_years}+ years", min_years
    
    # Pattern 4: "Experience: X years" or "X years experience"
    exp_pattern = r'(?:experience\s*[:\-–]\s*)?(\d+)\s*(?:years?|yrs?)\s*(?:of\s+)?(?:experience)?'
    exp_match = re.search(exp_pattern, text_lower)
    if exp_match:
        min_years = int(exp_match.group(1))
        return f"{min_years} years", min_years
    
    # Pattern 5: Fresher/Entry-level keywords
    fresher_keywords = ['fresher', 'freshers', 'entry level', 'entry-level', 'graduate', 
                        'new grad', 'college hire', '0 years', 'no experience', 'trainee']
    if any(kw in text_lower for kw in fresher_keywords):
        return "Fresher", 0
    
    # Pattern 6: Intern keywords
    intern_keywords = ['intern', 'internship', 'student']
    if any(kw in text_lower for kw in intern_keywords):
        return "Internship", 0
    
    # Pattern 7: Senior keywords often indicate 5+ years
    senior_keywords = ['senior', 'lead', 'principal', 'staff', 'architect']
    if any(kw in text_lower for kw in senior_keywords):
        # Check if title, not description
        return "Senior", 5
    
    return None, None


def parse_experience_level(exp_string: str) -> Tuple[Optional[str], Optional[int]]:
    """
    Parse structured experience level strings like "Mid-Senior level" or "Entry level".
    
    Args:
        exp_string: Experience level from structured API field
        
    Returns:
        Tuple of (normalized_string, min_years)
    """
    if not exp_string:
        return None, None
        
    exp_lower = exp_string.lower().strip()
    
    # Map common structured experience levels to years
    experience_map = {
        'entry': ('Entry Level', 0),
        'entry level': ('Entry Level', 0),
        'entry-level': ('Entry Level', 0),
        'fresher': ('Fresher', 0),
        'junior': ('Junior', 0),
        'associate': ('Associate', 1),
        'mid': ('Mid-Level', 3),
        'mid level': ('Mid-Level', 3),
        'mid-level': ('Mid-Level', 3),
        'intermediate': ('Mid-Level', 3),
        'senior': ('Senior', 5),
        'lead': ('Lead', 7),
        'principal': ('Principal', 8),
        'staff': ('Staff', 8),
        'manager': ('Manager', 5),
        'director': ('Director', 10),
        'executive': ('Executive', 12),
        'intern': ('Internship', 0),
        'internship': ('Internship', 0),
    }
    
    for key, (label, years) in experience_map.items():
        if key in exp_lower:
            return label, years
    
    # Try to extract number from string
    return extract_experience_from_text(exp_string)


# For testing
if __name__ == "__main__":
    test_cases = [
        "3-5 years of experience in Python",
        "5+ years experience required",
        "Minimum 3 years in software development",
        "Fresher or entry level candidates",
        "Looking for an intern to join our team",
        "Senior Software Engineer position",
        "Experience: 7-10 years",
        "2 years experience with React",
        "Mid-Senior level",
    ]
    
    print("Testing extract_experience_from_text:")
    for text in test_cases:
        result = extract_experience_from_text(text)
        print(f"  '{text}' -> {result}")
