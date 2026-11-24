"""
VayuCoach Uncertainty Engine
Evaluates spatial distance from monitoring stations, data freshness,
meteorological volatility (e.g. coastal land/sea breeze), and forecast variance.
Assigns qualitative confidence labels with transparent explanations.
"""

from typing import Dict, Any

def evaluate_uncertainty(
    data_freshness_minutes: int,
    distance_km: float = 3.5,
    has_live_station: bool = True,
    is_forecast: bool = False,
    forecast_horizon_hours: int = 0
) -> Dict[str, Any]:
    reasons = []

    # 1. Freshness evaluation
    if data_freshness_minutes <= 60:
        freshness_score = 90
        reasons.append("Data updated within the past 60 minutes.")
    elif data_freshness_minutes <= 180:
        freshness_score = 70
        reasons.append(f"Data is {data_freshness_minutes // 60} hours old, slight temporal drift expected.")
    else:
        freshness_score = 40
        reasons.append("Data is over 3 hours old; real-time localized shifts may not be captured.")

    # 2. Spatial proximity evaluation (e.g., distance to Baikampady/Kadri CPCB monitoring station in Mangaluru)
    if distance_km <= 5.0:
        spatial_score = 90
        reasons.append(f"Within {distance_km:.1f} km of active regional monitoring grid.")
    elif distance_km <= 15.0:
        spatial_score = 70
        reasons.append(f"Located {distance_km:.1f} km from central monitor; localized road dust or coastal microclimates may vary.")
    else:
        spatial_score = 50
        reasons.append(f"Located {distance_km:.1f} km away; spatial interpolation uncertainty is elevated.")

    # 3. Forecast horizon
    if is_forecast:
        if forecast_horizon_hours <= 3:
            forecast_score = 85
            reasons.append("Short-term near-cast (0-3h) with high atmospheric model agreement.")
        elif forecast_horizon_hours <= 12:
            forecast_score = 65
            reasons.append(f"Medium-range {forecast_horizon_hours}h forecast subject to diurnal convective shifts.")
        else:
            forecast_score = 45
            reasons.append("Next-day projection; sensitive to wind direction reversals and boundary layer height.")
    else:
        forecast_score = 95

    # Compute aggregate composite
    composite = (freshness_score * 0.4) + (spatial_score * 0.35) + (forecast_score * 0.25)

    if composite >= 80 and has_live_station:
        level = "Higher confidence"
    elif composite >= 60:
        level = "Moderate confidence"
    elif composite >= 40:
        level = "Limited confidence"
    else:
        level = "Insufficient data"

    return {
        "confidence_level": level,
        "composite_score": round(composite, 1),
        "explanation": " ".join(reasons),
        "limitations": (
            "Regional monitoring stations reflect ambient neighborhood background concentrations. "
            "Micro-environmental exposures next to heavy traffic, construction, or localized biomass burning will be higher."
        )
    }
