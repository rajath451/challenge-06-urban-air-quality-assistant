"""
VayuCoach Alert Deduplication Engine
Prevents sending redundant AQI warning emails and repeated activity alerts within a cooling window.
"""

import time
import hashlib
from typing import Dict, Optional
from app.config import settings

# In-memory deduplication registry: maps dedup_key -> timestamp
_DEDUP_CACHE: Dict[str, float] = {}

def generate_dedup_key(
    user_id: str,
    category: str,
    identifier: str
) -> str:
    """Generates a reproducible SHA256 deduplication key."""
    raw = f"{user_id}:{category}:{identifier}"
    return hashlib.sha256(raw.encode("utf-8")).hexdigest()[:24]


def is_duplicate(
    dedup_key: str,
    window_hours: Optional[int] = None
) -> bool:
    """
    Checks if an alert with the same key was already dispatched within the cooldown window.
    Default cooldown is settings.AQI_ALERT_DEDUPLICATION_HOURS (e.g. 6 hours).
    """
    cooldown_seconds = (window_hours or settings.AQI_ALERT_DEDUPLICATION_HOURS) * 3600
    last_sent = _DEDUP_CACHE.get(dedup_key)
    
    if last_sent is None:
        return False
    
    if (time.time() - last_sent) < cooldown_seconds:
        return True # Within duplicate suppression window
    
    return False


def mark_sent(dedup_key: str):
    """Records alert dispatch timestamp in deduplication cache."""
    _DEDUP_CACHE[dedup_key] = time.time()


def clear_dedup_cache():
    """Testing utility to clear deduplication cache."""
    _DEDUP_CACHE.clear()
