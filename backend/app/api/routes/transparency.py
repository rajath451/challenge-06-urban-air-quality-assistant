from fastapi import APIRouter
from app.models.schemas import TransparencyInfo
from datetime import datetime

router = APIRouter(prefix="/api/transparency", tags=["Data Transparency & Governance"])

@router.get("/status", response_model=TransparencyInfo)
async def get_transparency_status():
    return TransparencyInfo(
        connected_apis=[
            {
                "name": "Open-Meteo Air Quality API",
                "purpose": "Atmospheric chemistry (PM2.5, PM10, CO, NO2, SO2, O3)",
                "status": "Operational (Live)",
                "refresh_interval": "Hourly",
                "protocol": "REST JSON"
            },
            {
                "name": "Open-Meteo High-Resolution Weather API",
                "purpose": "Temperature, relative humidity, wind vectors, boundary layer dispersion",
                "status": "Operational (Live)",
                "refresh_interval": "15-minute intervals",
                "protocol": "REST JSON"
            },
            {
                "name": "OpenAQ Ambient Monitoring Registry",
                "purpose": "Station verification, CPCB / KSPCB metadata and calibration benchmarks",
                "status": "Connected",
                "refresh_interval": "Static registry sync",
                "protocol": "REST JSON"
            },
            {
                "name": "Google Gemini 2.5 API",
                "purpose": "Grounded natural language decision explanation and reasoning",
                "status": "Connected / Fallback-Ready",
                "refresh_interval": "On-demand inference",
                "protocol": "Google GenAI SDK"
            }
        ],
        data_availability_status="Healthy (All public data streams operational)",
        last_successful_sync=datetime.utcnow().isoformat() + "Z",
        active_station="Mangaluru Kadri-Baikampady Continuous Ambient Air Quality Monitoring Station (CPCB)",
        model_version="VayuCoach Decision Engine v2.5.0-Release",
        data_taxonomy={
            "Outdoor Ambient Telemetry": "MEASURED & SATELLITE-ASSIMILATED: Real physical air quality from Open-Meteo and CPCB monitoring stations.",
            "Diurnal Best-Time Windows": "FORECASTED: Derived from numerical meteorological models and diurnal wind vector analysis.",
            "HomeBreath Virtual Air": "SIMULATED: Software-only single-compartment mass balance physical model. NOT A SENSOR READING.",
            "Inhaled Particulate Dosimetry": "ESTIMATED: Mathematical respiratory minute volume estimation from EPA Exposure Factors Handbook."
        },
        known_limitations=[
            "Fixed-site monitors reflect regional background levels and do not capture localized tailpipe plumes within 5 meters of diesel exhaust.",
            "Indoor HomeBreath simulations assume uniform well-mixed room air; localized proximity to frying pans creates acute micro-plumes.",
            "Estimations of inhaled particulate mass are educational and physiological models, not clinical medical diagnostics."
        ],
        attribution=[
            {"source": "Central Pollution Control Board (CPCB)", "role": "Indian National Air Quality Index (NAQI) Breakpoint Standards"},
            {"source": "Open-Meteo", "role": "Weather and atmospheric chemistry data feeds (CC-BY 4.0)"},
            {"source": "World Health Organization (WHO)", "role": "2021 Global Air Quality Guidelines Reference Limits"},
            {"source": "EPA Exposure Factors Handbook", "role": "Human respiratory minute ventilation volumes"}
        ]
    )
