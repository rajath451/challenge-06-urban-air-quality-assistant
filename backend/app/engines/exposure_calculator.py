"""
VayuCoach Respiratory Particulate Dosimetry & Exposure Engine
Calculates estimated inhaled mass of PM2.5 based on activity ventilation rates (minute volume)
and environmental concentration.

Formulation:
Inhaled Particulate Mass (µg) = Ambient PM2.5 (µg/m³) * Ventilation Rate (m³/h) * Duration (h)

Ventilation Rates derived from EPA Exposure Factors Handbook and peer-reviewed exercise physiology:
- Resting / Sitting: 0.45 - 0.55 m³/h
- Light Walking (3.5 - 4 km/h): 1.10 - 1.30 m³/h
- Jogging / Cycling (moderate exertion): 2.40 - 2.80 m³/h
- High-Intensity Cardio / Running (>10 km/h): 3.80 - 4.50 m³/h
"""

from typing import Dict, Any
from app.models.schemas import ExposureRequest, ExposureResponse

VENTILATION_RATES = {
    "resting": 0.50,
    "walking": 1.20,
    "jogging": 2.50,
    "cycling": 2.40,
    "heavy_workout": 3.80
}

def calculate_exposure(req: ExposureRequest) -> ExposureResponse:
    base_rate = VENTILATION_RATES.get(req.activity.lower(), 1.20)
    
    # Children have higher ventilation per unit body weight (~30-50% higher air volume relative to mass)
    if req.is_child:
        vent_rate = base_rate * 0.65 # smaller absolute lungs, but higher respiratory rate
    else:
        # Scale slightly by body weight compared to 70kg reference
        weight_scale = (req.body_weight_kg / 70.0) ** 0.67
        vent_rate = base_rate * max(0.7, min(1.3, weight_scale))

    duration_hours = req.duration_minutes / 60.0
    air_volume = vent_rate * duration_hours
    inhaled_mass = req.pm2_5_concentration * air_volume

    # Baseline resting volume for same duration
    baseline_resting_mass = req.pm2_5_concentration * 0.50 * duration_hours
    equivalent_baseline_hours = (inhaled_mass / (req.pm2_5_concentration * 0.50)) if req.pm2_5_concentration > 0 else 0

    # WHO 24-hr Reference Inhaled Budget:
    # 24h at 15 µg/m³ with avg daily intake ~12 m³ = 180 µg of PM2.5 per day.
    who_daily_budget = 180.0
    budget_pct = (inhaled_mass / who_daily_budget) * 100.0

    # Clean window comparison: assuming optimal afternoon sea breeze in Mangaluru drops PM2.5 to 22 µg/m³
    clean_conc = min(22.0, req.pm2_5_concentration * 0.55)
    clean_inhaled = clean_conc * air_volume
    saved_micrograms = inhaled_mass - clean_inhaled

    return ExposureResponse(
        activity=req.activity.title(),
        duration_minutes=req.duration_minutes,
        pm2_5_concentration=req.pm2_5_concentration,
        ventilation_rate_m3h=round(vent_rate, 2),
        air_volume_inhaled_m3=round(air_volume, 2),
        inhaled_mass_micrograms=round(inhaled_mass, 1),
        equivalent_baseline_hours=round(equivalent_baseline_hours, 1),
        who_daily_budget_percentage=round(budget_pct, 1),
        dose_comparison_clean_window={
            "clean_window_pm25": round(clean_conc, 1),
            "clean_window_dose_ug": round(clean_inhaled, 1),
            "dose_avoided_ug": round(saved_micrograms, 1),
            "percentage_saved": f"{max(0, int((saved_micrograms / max(1.0, inhaled_mass)) * 100))}%"
        },
        scientific_basis=(
            "Calculated using respiratory minute volumes from the EPA Exposure Factors Handbook. "
            "At vigorous intensity, breathing shifts from nasal to oronasal, bypassing nasal filtration hairs."
        ),
        limitations_and_disclaimer=(
            "SCIENTIFIC ESTIMATE ONLY — NOT A CLINICAL OR MEDICAL ASSESSMENT. "
            "Personal lung deposition fractions vary by airway geometry, pre-existing asthma, and proximity to direct vehicular tailpipes."
        )
    )
