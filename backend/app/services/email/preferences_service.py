"""
VayuCoach Notification Preferences & Consent Service
Handles user subscription settings, category opt-ins, and 1-click CAN-SPAM compliant unsubscribes.
"""

import secrets
from datetime import datetime
from typing import Dict, Any, List, Optional
from pydantic import BaseModel, Field

class NotificationPreferencesModel(BaseModel):
    user_id: str
    email: str
    email_notifications_enabled: bool = True
    categories: List[str] = Field(
        default_factory=lambda: [
            "aqi_alerts",
            "daily_briefing",
            "activity_recommendations",
            "weekly_summary"
        ]
    )
    preferred_report_time: str = "07:00"
    preferred_location: str = "Mangaluru, Karnataka, India"
    preferred_lat: float = 12.914142
    preferred_lon: float = 74.855957
    unsubscribe_token: str
    unsubscribed_at: Optional[str] = None
    updated_at: str

# In-memory preference store (seeded with demo user and admin preferences)
PREFERENCES_DB: Dict[str, Dict[str, Any]] = {
    "usr-seeded-001": {
        "user_id": "usr-seeded-001",
        "email": "user@vayucoach.in",
        "email_notifications_enabled": True,
        "categories": [
            "aqi_alerts",
            "daily_briefing",
            "activity_recommendations",
            "weekly_summary"
        ],
        "preferred_report_time": "07:00",
        "preferred_location": "Mangaluru, Karnataka, India",
        "preferred_lat": 12.914142,
        "preferred_lon": 74.855957,
        "unsubscribe_token": "unsub-token-usr-seeded-001-99824f",
        "unsubscribed_at": None,
        "updated_at": datetime.utcnow().isoformat() + "Z"
    },
    "adm-seeded-002": {
        "user_id": "adm-seeded-002",
        "email": "admin@vayucoach.in",
        "email_notifications_enabled": True,
        "categories": [
            "aqi_alerts",
            "daily_briefing",
            "activity_recommendations",
            "weekly_summary"
        ],
        "preferred_report_time": "08:00",
        "preferred_location": "Mangaluru, Karnataka, India",
        "preferred_lat": 12.914142,
        "preferred_lon": 74.855957,
        "unsubscribe_token": "unsub-token-adm-seeded-002-8812a1",
        "unsubscribed_at": None,
        "updated_at": datetime.utcnow().isoformat() + "Z"
    }
}

# Token lookup index: maps unsubscribe_token -> user_id
UNSUB_TOKEN_INDEX: Dict[str, str] = {
    "unsub-token-usr-seeded-001-99824f": "usr-seeded-001",
    "unsub-token-adm-seeded-002-8812a1": "adm-seeded-002"
}

def get_or_create_preferences(user_id: str, email: str) -> Dict[str, Any]:
    """Retrieves existing user preferences or initializes compliant defaults."""
    if user_id in PREFERENCES_DB:
        return PREFERENCES_DB[user_id]
    
    token = secrets.token_urlsafe(32)
    new_pref = {
        "user_id": user_id,
        "email": email,
        "email_notifications_enabled": True,
        "categories": [
            "aqi_alerts",
            "daily_briefing",
            "activity_recommendations",
            "weekly_summary"
        ],
        "preferred_report_time": "07:00",
        "preferred_location": "Mangaluru, Karnataka, India",
        "preferred_lat": 12.914142,
        "preferred_lon": 74.855957,
        "unsubscribe_token": token,
        "unsubscribed_at": None,
        "updated_at": datetime.utcnow().isoformat() + "Z"
    }
    PREFERENCES_DB[user_id] = new_pref
    UNSUB_TOKEN_INDEX[token] = user_id
    return new_pref


def update_preferences(user_id: str, updates: Dict[str, Any]) -> Dict[str, Any]:
    """Updates user notification preferences."""
    current = PREFERENCES_DB.get(user_id)
    if not current:
        raise ValueError(f"Preferences not found for user {user_id}")
    
    # Update allowed fields
    if "email_notifications_enabled" in updates:
        current["email_notifications_enabled"] = bool(updates["email_notifications_enabled"])
    if "categories" in updates:
        current["categories"] = list(updates["categories"])
    if "preferred_report_time" in updates:
        current["preferred_report_time"] = str(updates["preferred_report_time"])
    if "preferred_location" in updates:
        current["preferred_location"] = str(updates["preferred_location"])
    if "preferred_lat" in updates:
        current["preferred_lat"] = float(updates["preferred_lat"])
    if "preferred_lon" in updates:
        current["preferred_lon"] = float(updates["preferred_lon"])
    
    current["updated_at"] = datetime.utcnow().isoformat() + "Z"
    PREFERENCES_DB[user_id] = current
    return current


def unsubscribe_by_token(token: str) -> Dict[str, Any]:
    """One-click unsubscribe endpoint execution (CAN-SPAM / GDPR)."""
    user_id = UNSUB_TOKEN_INDEX.get(token)
    if not user_id or user_id not in PREFERENCES_DB:
        raise ValueError("Invalid or expired unsubscribe token.")
    
    pref = PREFERENCES_DB[user_id]
    pref["email_notifications_enabled"] = False
    pref["unsubscribed_at"] = datetime.utcnow().isoformat() + "Z"
    pref["updated_at"] = datetime.utcnow().isoformat() + "Z"
    return pref


def is_user_subscribed(user_id: str, category: str) -> bool:
    """Checks if a user is opted in for a given email notification category."""
    pref = PREFERENCES_DB.get(user_id)
    if not pref:
        return True # Default to subscribed if not customized yet
    
    if not pref.get("email_notifications_enabled", True):
        return False
    
    categories = pref.get("categories", [])
    return category in categories
