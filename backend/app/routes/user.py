from fastapi import APIRouter
from app.schemas.models import UserPreferences

router = APIRouter(prefix="/api/user", tags=["User Preferences"])

# In-memory default store for demo session
_USER_PREFS = UserPreferences()

@router.get("/preferences", response_model=UserPreferences)
async def get_preferences():
    return _USER_PREFS

@router.post("/preferences", response_model=UserPreferences)
async def update_preferences(prefs: UserPreferences):
    global _USER_PREFS
    _USER_PREFS = prefs
    return _USER_PREFS
