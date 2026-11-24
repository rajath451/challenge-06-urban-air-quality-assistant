from fastapi import APIRouter, Query, HTTPException
from typing import Optional, List
from app.schemas.models import CurrentAirQuality, AirQualityForecast, LocationInfo
from app.services.open_meteo import (
    get_current_air_quality, get_hourly_forecast, search_cities, PRESET_LOCATIONS
)

router = APIRouter(prefix="/api/air-quality", tags=["Air Quality"])

@router.get("/current", response_model=CurrentAirQuality)
async def get_current_aqi(
    lat: float = Query(28.6139, description="Latitude"),
    lon: float = Query(77.2090, description="Longitude"),
    name: Optional[str] = Query("New Delhi", description="Location Name")
):
    try:
        return await get_current_air_quality(lat, lon, name)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch air quality: {str(e)}")

@router.get("/forecast", response_model=AirQualityForecast)
async def get_forecast(
    lat: float = Query(28.6139, description="Latitude"),
    lon: float = Query(77.2090, description="Longitude")
):
    try:
        return await get_hourly_forecast(lat, lon)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch forecast: {str(e)}")

@router.get("/locations/search", response_model=List[LocationInfo])
async def search_location_endpoint(query: str = Query(..., min_length=2)):
    return await search_cities(query)

@router.get("/presets", response_model=List[LocationInfo])
async def get_preset_locations():
    return [LocationInfo(**p) for p in PRESET_LOCATIONS.values()]
