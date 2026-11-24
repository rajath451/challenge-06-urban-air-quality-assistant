from fastapi import APIRouter, Query
from typing import List
from app.schemas.models import (
    CurrentAirQuality, UserPreferences, RecommendationItem, DailyRoutinePlan, IndoorHack
)
from app.services.open_meteo import get_current_air_quality
from app.services.recommendation_engine import (
    generate_recommendations, generate_daily_routine_plan, INDOOR_HACKS_CATALOG
)

router = APIRouter(prefix="/api/recommendations", tags=["Recommendations & Routines"])

@router.post("/daily", response_model=List[RecommendationItem])
async def get_daily_recommendations(
    aqi_data: CurrentAirQuality,
    prefs: UserPreferences
):
    return generate_recommendations(aqi_data, prefs)

@router.post("/routine-plan", response_model=DailyRoutinePlan)
async def get_routine_plan(
    aqi_data: CurrentAirQuality,
    prefs: UserPreferences
):
    return generate_daily_routine_plan(aqi_data, prefs)

@router.get("/hacks", response_model=List[IndoorHack])
async def get_indoor_hacks():
    return INDOOR_HACKS_CATALOG
