from fastapi import APIRouter
from typing import List
from app.models.schemas import DecisionResponse, EnvironmentalReadings, LocationInfo, DecisionItem
from app.engines.decision_engine import generate_decisions
from datetime import datetime

router = APIRouter(prefix="/api/decisions", tags=["Decision Intelligence Engine"])

class DecisionEvaluationRequest:
    pass

from pydantic import BaseModel
class EvaluateRequest(BaseModel):
    readings: EnvironmentalReadings
    location: LocationInfo

@router.post("/evaluate", response_model=DecisionResponse)
async def evaluate_environmental_decisions(req: EvaluateRequest):
    decisions = generate_decisions(req.readings, req.location)
    
    # Overall summary based on Indian NAQI
    naqi = req.readings.indian_naqi
    cat = req.readings.indian_naqi_category
    
    if naqi <= 50:
        overall = "Favorable Atmospheric Conditions"
        advice = "Air is clean across Mangaluru. Ideal conditions for outdoor cardio, running, and natural window ventilation."
    elif naqi <= 100:
        overall = "Satisfactory Air Quality"
        advice = "General outdoor activities are safe. Take advantage of afternoon onshore sea breeze for window airing."
    elif naqi <= 200:
        overall = "Moderate Air Pollution – Selective Timing Advised"
        advice = "Modify strenuous morning cardio. Reschedule outdoor runs to mid-afternoon sea breeze window."
    else:
        overall = "Poor to Severe Air Quality – Indoor Protection Active"
        advice = "Avoid prolonged outdoor exertion. Keep windows sealed and conduct workouts indoors."

    return DecisionResponse(
        location=req.location,
        readings=req.readings,
        overall_status=overall,
        main_advice=advice,
        decisions=decisions,
        generated_at=datetime.utcnow().isoformat() + "Z"
    )
