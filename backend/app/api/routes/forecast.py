from fastapi import APIRouter
from app.models.schemas import PlannerRequest, PlannerResponse, LocationInfo, EnvironmentalReadings
from app.engines.forecasting_engine import generate_24h_planner
from pydantic import BaseModel

router = APIRouter(prefix="/api/planner", tags=["Best Time Planner"])

class PlannerExecutionRequest(BaseModel):
    request_params: PlannerRequest
    base_readings: EnvironmentalReadings
    location: LocationInfo

@router.post("/best-times", response_model=PlannerResponse)
async def get_best_time_windows(payload: PlannerExecutionRequest):
    return generate_24h_planner(
        base_pm25=payload.base_readings.pm2_5,
        current_temp=payload.base_readings.temperature,
        current_humidity=payload.base_readings.relative_humidity,
        current_wind=payload.base_readings.wind_speed,
        req=payload.request_params,
        location=payload.location
    )
