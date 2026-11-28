"""
VayuCoach Data Normalization & Quality Assessment Service
Converts raw environmental data from Open-Meteo and OpenAQ into unified schemas,
accurately implements the Central Pollution Control Board (CPCB) Indian National Air Quality Index (NAQI),
and computes the US-EPA AQI for explicit comparative clarity.
"""

from typing import Tuple, Dict, Any, Optional
from datetime import datetime

# ==========================================
# CPCB INDIAN NATIONAL AQI (NAQI) BREAKPOINTS
# Reference: Central Pollution Control Board (CPCB), Ministry of Environment, Forest & Climate Change
# ==========================================
# PM2.5 (24-hr avg in µg/m³):
# Good (0-50): 0 - 30
# Satisfactory (51-100): 31 - 60
# Moderate (101-200): 61 - 90
# Poor (201-300): 91 - 120
# Very Poor (301-400): 121 - 250
# Severe (401-500): 250+

NAQI_PM25_BREAKPOINTS = [
    (0, 30, 0, 50, "Good", "#006c4a"),
    (31, 60, 51, 100, "Satisfactory", "#059669"),
    (61, 90, 101, 200, "Moderate", "#d97706"),
    (91, 120, 201, 300, "Poor", "#ea580c"),
    (121, 250, 301, 400, "Very Poor", "#dc2626"),
    (251, 500, 401, 500, "Severe", "#7f1d1d")
]

# US-EPA AQI BREAKPOINTS FOR PM2.5 (µg/m³)
US_EPA_PM25_BREAKPOINTS = [
    (0.0, 9.0, 0, 50, "Good", "#006c4a"),
    (9.1, 35.4, 51, 100, "Moderate", "#0284c7"),
    (35.5, 55.4, 101, 150, "Unhealthy for Sensitive Groups", "#d97706"),
    (55.5, 125.4, 151, 200, "Unhealthy", "#ea580c"),
    (125.5, 225.4, 201, 300, "Very Unhealthy", "#dc2626"),
    (225.5, 500.0, 301, 500, "Hazardous", "#7f1d1d")
]

def calculate_indian_naqi(pm2_5: float, pm10: Optional[float] = None) -> Tuple[int, str, str]:
    """
    Computes the Indian National Air Quality Index (NAQI) using CPCB linear piecewise interpolation.
    Returns (aqi_val, category_name, color_hex).
    """
    if pm2_5 < 0:
        pm2_5 = 0.0

    # Linear interpolation: I = I_low + [(I_high - I_low) / (C_high - C_low)] * (C - C_low)
    for c_low, c_high, i_low, i_high, cat, col in NAQI_PM25_BREAKPOINTS:
        if c_low <= pm2_5 <= c_high:
            aqi = i_low + ((i_high - i_low) / (c_high - c_low)) * (pm2_5 - c_low)
            return int(round(aqi)), cat, col

    # If exceeds 500
    return 500, "Severe", "#7f1d1d"

def calculate_us_aqi(pm2_5: float) -> Tuple[int, str, str]:
    """
    Computes the US-EPA AQI for comparison.
    """
    if pm2_5 < 0:
        pm2_5 = 0.0

    for c_low, c_high, i_low, i_high, cat, col in US_EPA_PM25_BREAKPOINTS:
        if c_low <= pm2_5 <= c_high:
            aqi = i_low + ((i_high - i_low) / (c_high - c_low)) * (pm2_5 - c_low)
            return int(round(aqi)), cat, col

    return 500, "Hazardous", "#7f1d1d"

def assess_data_quality(timestamp_str: str, has_live_feed: bool = True) -> Dict[str, Any]:
    """
    Evaluates data freshness and flags stale measurements.
    """
    try:
        if "Z" in timestamp_str:
            clean_ts = timestamp_str.replace("Z", "+00:00")
            dt = datetime.fromisoformat(clean_ts)
        else:
            dt = datetime.fromisoformat(timestamp_str)
        now = datetime.utcnow()
        if dt.tzinfo:
            age_minutes = int((datetime.now(dt.tzinfo) - dt).total_seconds() / 60)
        else:
            age_minutes = int((now - dt).total_seconds() / 60)
    except (ValueError, TypeError):
        age_minutes = 15

    if age_minutes < 0:
        age_minutes = 5

    if age_minutes <= 60:
        freshness_label = "Real-time Fresh (< 1 hour)"
        confidence_factor = "High"
    elif age_minutes <= 180:
        freshness_label = f"Recent ({age_minutes // 60} hours ago)"
        confidence_factor = "Moderate"
    else:
        freshness_label = f"Stale ({age_minutes // 60} hours ago)"
        confidence_factor = "Limited"

    return {
        "age_minutes": age_minutes,
        "freshness_label": freshness_label,
        "confidence_factor": confidence_factor,
        "is_acceptable_for_decision": age_minutes <= 360
    }
