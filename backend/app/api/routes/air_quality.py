from fastapi import APIRouter, Query, HTTPException
from typing import List, Optional
from app.models.schemas import EnvironmentalReadings, LocationInfo
from app.services.open_meteo import fetch_environmental_data, search_indian_cities, FEATURED_LOCATIONS
from app.services.openaq import get_nearby_stations

router = APIRouter(prefix="/api/air-quality", tags=["Air Quality & Telemetry"])

@router.get("/current", response_model=EnvironmentalReadings)
async def get_current_air_quality(
    lat: float = Query(12.9141, description="Latitude (default: Mangaluru)"),
    lon: float = Query(74.8560, description="Longitude (default: Mangaluru)"),
    name: Optional[str] = Query("Mangaluru, Karnataka, India")
):
    try:
        return await fetch_environmental_data(lat, lon, name)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch environmental data: {str(e)}")

@router.get("/stations")
async def get_monitoring_stations(
    lat: float = Query(12.9141),
    lon: float = Query(74.8560)
):
    return await get_nearby_stations(lat, lon)

@router.get("/locations/search", response_model=List[LocationInfo])
async def search_locations(query: str = Query(..., min_length=2)):
    return await search_indian_cities(query)

@router.get("/locations/presets", response_model=List[LocationInfo])
async def get_preset_cities():
    return list(FEATURED_LOCATIONS.values())
