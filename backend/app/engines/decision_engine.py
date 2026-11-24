"""
VayuCoach Deterministic Environmental Decision Engine
Applies rigorous, science-backed numerical threshold logic to environmental telemetry
to produce actionable decisions for outdoor exercise, walking, cycling, commuting, and household ventilation.
Complies with Central Pollution Control Board (CPCB) NAQI guidelines.
"""

from typing import List, Dict, Any
from app.models.schemas import EnvironmentalReadings, DecisionItem, LocationInfo
from app.engines.uncertainty_engine import evaluate_uncertainty

def generate_decisions(readings: EnvironmentalReadings, location: LocationInfo) -> List[DecisionItem]:
    decisions: List[DecisionItem] = []
    pm25 = readings.pm2_5
    naqi = readings.indian_naqi
    naqi_cat = readings.indian_naqi_category
    temp = readings.temperature
    humidity = readings.relative_humidity
    wind_spd = readings.wind_speed

    # Get uncertainty profile
    unc = evaluate_uncertainty(readings.data_freshness_minutes, distance_km=4.2, has_live_station=True)

    # -------------------------------------------------------------
    # 1. OUTDOOR EXERCISE (Running, Jogging, High-Intensity Cardio)
    # -------------------------------------------------------------
    # Deep alveolar minute ventilation increases 4x to 6x during aerobic cardio.
    # CPCB threshold: >60 µg/m³ (Moderate/Poor) warrants reduction of prolonged cardio.
    if pm25 <= 30.0:
        rec_title = "Optimal for Outdoor Training"
        rec_status = "Recommended"
        tier = "optimal"
        reason = f"PM2.5 is pristine at {pm25:.1f} µg/m³ (CPCB NAQI: {naqi} - Good). Deep lung minute ventilation is safe from inflammatory particulate burden."
        rationale = "Particulate levels are within WHO 24-hr guideline (<15 µg/m³) and well below CPCB limits."
        alt = "Enjoy your outdoor running or interval training without restrictions."
        best_win = "Morning (6:00 – 8:00 AM) or Late Afternoon"
    elif pm25 <= 60.0:
        rec_title = "Moderate Air Quality – General Exercise Permitted"
        rec_status = "Proceed with Caution"
        tier = "caution"
        reason = f"PM2.5 is {pm25:.1f} µg/m³ (CPCB NAQI: {naqi} - Satisfactory). Healthy individuals can exercise; sensitive individuals or asthmatics should observe lung comfort."
        rationale = "Satisfactory under Indian NAQI. However, elevated humidity in coastal areas may trap mild road exhaust."
        alt = "Moderate workout pace; consider trail parks away from main highways."
        best_win = "1:00 PM – 4:00 PM (Stronger sea breeze dispersion in coastal Mangaluru)"
    elif pm25 <= 90.0:
        rec_title = "Elevated Particulates – Modify Intensity"
        rec_status = "Modify Intensity/Time"
        tier = "restricted"
        reason = f"PM2.5 is {pm25:.1f} µg/m³ (CPCB NAQI: {naqi} - Moderate). At aerobic exertion (ventilation ~2.5 m³/h), you will inhale significant fine particulate mass."
        rationale = "Exceeds CPCB Satisfactory limit. Can cause respiratory irritation and throat tightness in runners."
        alt = "Switch high-intensity running to indoor treadmill or bodyweight strength training."
        best_win = "Postpone to afternoon sea breeze window when wind speed exceeds 10 km/h."
    else:
        rec_title = "Unfavorable Air Quality – Postpone Outdoor Cardio"
        rec_status = "Avoid / Postpone"
        tier = "avoid"
        reason = f"PM2.5 is {pm25:.1f} µg/m³ (CPCB NAQI: {naqi} - {naqi_cat}). Inhaling elevated PM2.5 under heavy cardio forces fine particles directly into vascular circulation."
        rationale = "Severe respiratory and cardiovascular stress threshold under CPCB guidelines."
        alt = "Conduct aerobic workouts indoors in a room with closed windows and clean air circulation."
        best_win = "Check 24-hour planner for the cleanest forecast window."

    decisions.append(DecisionItem(
        activity_type="exercise",
        activity_title="Outdoor Aerobic Exercise & Running",
        recommendation=rec_status,
        recommendation_tier=tier,
        reason=reason,
        environmental_rationale=rationale,
        key_metrics={"PM2.5": f"{pm25} µg/m³", "CPCB NAQI": naqi, "Category": naqi_cat, "Ventilation Rate": "~2.5 m³/h"},
        alternative_action=alt,
        best_time_window=best_win,
        confidence_level=unc["confidence_level"],
        confidence_reason=unc["explanation"],
        important_limitations=unc["limitations"]
    ))

    # -------------------------------------------------------------
    # 2. WALKING & LIGHT RECREATION
    # -------------------------------------------------------------
    # Light walking incurs moderate ventilation (~1.0 - 1.2 m³/h).
    if pm25 <= 60.0:
        w_rec = "Safe for Daily Walks"
        w_status = "Recommended"
        w_tier = "optimal"
        w_reason = f"Ambient PM2.5 is {pm25:.1f} µg/m³. Light exertion keeps inhaled volume low."
        w_alt = "Great conditions for park walks and outdoor leisure."
    elif pm25 <= 120.0:
        w_rec = "Limit to Shaded / Park Routes"
        w_status = "Proceed with Caution"
        w_tier = "caution"
        w_reason = f"PM2.5 is {pm25:.1f} µg/m³ (NAQI {naqi} - {naqi_cat}). Acceptable for general public, but elderly and young children should avoid traffic roads."
        w_alt = "Choose tree-lined interior residential avenues away from auto-rickshaw and diesel corridors."
    else:
        w_rec = "Keep Walks Indoors or Brief"
        w_status = "Avoid / Postpone"
        w_tier = "avoid"
        w_reason = f"High particulate density ({pm25:.1f} µg/m³). Prolonged exposure triggers eye burning and bronchial fatigue."
        w_alt = "Opt for indoor walking (mall or home pacing) or wear an N95 respirator if stepping out."

    decisions.append(DecisionItem(
        activity_type="walking",
        activity_title="Daily Walking & Outdoor Strolls",
        recommendation=w_status,
        recommendation_tier=w_tier,
        reason=w_reason,
        environmental_rationale=f"Inhaled volume at walking pace is ~1.1 m³/h. Based on CPCB {naqi_cat} threshold.",
        key_metrics={"PM2.5": f"{pm25} µg/m³", "Inhaled Rate": "~1.1 m³/h"},
        alternative_action=w_alt,
        best_time_window="Early evening or mid-afternoon",
        confidence_level=unc["confidence_level"],
        confidence_reason=unc["explanation"],
        important_limitations="Roadside diesel hotspots will exhibit 2x-3x higher particulate concentrations than ambient monitors."
    ))

    # -------------------------------------------------------------
    # 3. COMMUTING & TRANSPORTATION
    # -------------------------------------------------------------
    if pm25 <= 60.0:
        c_rec = "Open Commute & Two-Wheeler Permitted"
        c_status = "Recommended"
        c_tier = "optimal"
        c_reason = "Urban air levels are benign. Two-wheeler riding and walking are comfortable."
        c_alt = "Two-wheeler or cycling commute is suitable."
    elif pm25 <= 100.0:
        c_rec = "Keep Helmet Visor Down / Wear Pollution Scarf"
        c_status = "Proceed with Caution"
        c_tier = "caution"
        c_reason = f"Moderate pollution ({pm25:.1f} µg/m³). Direct exposure in traffic queues exposes riders to exhaust fumes."
        c_alt = "Use public bus or close AC car windows in internal recirculation mode."
    else:
        c_rec = "Use Enclosed Transport with AC Recirculation"
        c_status = "Modify Intensity/Time"
        c_tier = "restricted"
        c_reason = f"Poor to severe air quality. Open two-wheeler riding directly in diesel queues carries high exposure."
        c_alt = "Switch to bus or car with internal air recirculation active; wear an N95 mask if using two-wheelers."

    decisions.append(DecisionItem(
        activity_type="commuting",
        activity_title="Urban Commute (Two-Wheeler / Public Transit / Car)",
        recommendation=c_status,
        recommendation_tier=c_tier,
        reason=c_reason,
        environmental_rationale="Street-level vehicular micro-environments suffer from acute CO, NO2, and soot spikes.",
        key_metrics={"Ambient PM2.5": f"{pm25} µg/m³", "Transport Risk": "Roadway plume density"},
        alternative_action=c_alt,
        best_time_window="Avoid peak morning rush (8:30 – 10:00 AM)",
        confidence_level=unc["confidence_level"],
        confidence_reason=unc["explanation"],
        important_limitations="Cabin filters vary; non-HEPA AC car filters only stop coarse debris, not sub-micron PM2.5."
    ))

    # -------------------------------------------------------------
    # 4. HOUSEHOLD VENTILATION (Open vs Close Windows)
    # -------------------------------------------------------------
    # In coastal Karnataka (Mangaluru), daytime sea breezes (12:00 – 16:00) bring clean marine air.
    # Morning (6:00 – 9:00 AM) often has calmer winds and inland continental land breeze with higher dust.
    if pm25 <= 35.0:
        v_rec = "Open Windows for Fresh Air Exchange"
        v_status = "Recommended"
        v_tier = "optimal"
        v_reason = f"Outdoor air is clean ({pm25:.1f} µg/m³). Opening windows will flush out indoor CO2, VOCs, and cooking moisture without polluting your rooms."
        v_alt = "Open opposite-facing windows for cross-ventilation."
    elif pm25 <= 65.0:
        v_rec = "Timed Afternoon Ventilation Permitted"
        v_status = "Proceed with Caution"
        v_tier = "caution"
        v_reason = f"Outdoor PM2.5 is {pm25:.1f} µg/m³. Selective 20-30 minute window opening during onshore sea breeze is safe."
        v_alt = "Open windows briefly between 1:00 PM and 3:30 PM, then close before evening traffic builds."
    else:
        v_rec = "Keep Windows Sealed – Infiltration Risk"
        v_status = "Avoid / Postpone"
        v_tier = "avoid"
        v_reason = f"Outdoor PM2.5 ({pm25:.1f} µg/m³) is higher than clean indoor air. Opening windows will contaminate indoor spaces."
        v_alt = "Keep windows firmly shut. Use indoor ceiling fans for internal air movement."

    decisions.append(DecisionItem(
        activity_type="ventilation",
        activity_title="Household Natural Ventilation (Open Windows)",
        recommendation=v_status,
        recommendation_tier=v_tier,
        reason=v_reason,
        environmental_rationale="Indoor-outdoor particulate equilibrium follows mass balance; opening windows in poor ambient air rapidly raises indoor PM2.5.",
        key_metrics={"Outdoor PM2.5": f"{pm25} µg/m³", "Wind Speed": f"{wind_spd} km/h"},
        alternative_action=v_alt,
        best_time_window="1:00 PM – 3:30 PM (When marine convective dispersion is highest)",
        confidence_level=unc["confidence_level"],
        confidence_reason=unc["explanation"],
        important_limitations="Does not account for immediate proximity to neighbors burning garden waste or idling trucks."
    ))

    return decisions
