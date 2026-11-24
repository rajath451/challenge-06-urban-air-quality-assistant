import os
from typing import Optional, Dict, Any, List
from app.config import settings
from app.schemas.models import ChatMessage, CurrentAirQuality, UserPreferences, ChatResponse

try:
    from google import genai
    from google.genai import types
    HAS_GENAI = True
except ImportError:
    HAS_GENAI = False

def build_system_prompt(aqi_data: Optional[CurrentAirQuality], prefs: Optional[UserPreferences]) -> str:
    loc_str = aqi_data.location.name if aqi_data and aqi_data.location else "Unknown City"
    aqi_val = aqi_data.aqi_us if aqi_data else 165
    cat_val = aqi_data.aqi_category if aqi_data else "Unhealthy"
    pm25_val = aqi_data.pm2_5 if aqi_data else 85.0
    pm10_val = aqi_data.pm10 if aqi_data else 135.0
    temp_val = aqi_data.weather.get("temperature", 22) if aqi_data and aqi_data.weather else 22
    hum_val = aqi_data.weather.get("humidity", 65) if aqi_data and aqi_data.weather else 65

    pref_summary = "General Urban Family"
    if prefs:
        pref_summary = (
            f"Family of {prefs.household_size}, Children: {prefs.has_children}, Elderly: {prefs.has_elderly}, "
            f"Respiratory Sensitivity: {prefs.has_respiratory_sensitivity}, Commute: {prefs.commute_mode} ({prefs.daily_commute_km} km), "
            f"Purifier owned: {prefs.home_purifier_owned}, Exercise time: {prefs.preferred_exercise_time}"
        )

    return f"""You are the AeroPulse AI Urban Air Quality & Winter Smog Assistant.
Your mission is to help families and communities navigate severe winter smog and urban air pollution with practical, science-backed guidance, low-emission routines, and low-cost indoor hacks.

CURRENT MEASURED TELEMETRY (Grounded Truth - NEVER hallucinate different sensor values):
- Location: {loc_str}
- US AQI: {aqi_val} ({cat_val})
- PM2.5: {pm25_val} µg/m³ (WHO 24h reference limit is 15 µg/m³)
- PM10: {pm10_val} µg/m³ (WHO 24h limit is 45 µg/m³)
- Weather: {temp_val}°C, Humidity: {hum_val}%
- User Household Profile: {pref_summary}

STRICT INSTRUCTIONS:
1. Ground your advice directly in the measured AQI ({aqi_val}) and PM2.5 ({pm25_val} µg/m³).
2. Clearly distinguish between measured sensor facts and your AI-recommended actions.
3. Provide realistic, low-cost indoor hacks (e.g. wet mop cleaning to stop dust re-suspension, DIY Corsi-Rosenthal box filter, strategic afternoon ventilation when thermal inversion breaks).
4. Do not make medical diagnoses or claim to cure asthma/conditions. Give environmental risk reduction advice.
5. If AQI > 150, advise N95/FFP2 masks outdoors, keeping windows shut during morning inversion hours (6-10 AM), and switching commutes to mass transit / carpooling.
6. Tone: Authoritative, reassuring, empathetic to families with kids and elderly, scientifically rigorous, action-oriented.
"""

def generate_smart_fallback_response(query: str, aqi_data: Optional[CurrentAirQuality], prefs: Optional[UserPreferences]) -> ChatResponse:
    q = query.lower()
    aqi_val = aqi_data.aqi_us if aqi_data else 165
    cat_val = aqi_data.aqi_category if aqi_data else "Unhealthy"
    pm25_val = aqi_data.pm2_5 if aqi_data else 85.0
    loc_name = aqi_data.location.name if aqi_data and aqi_data.location else "your area"

    tips = []

    if "outside" in q or "safe" in q or "jog" in q or "exercise" in q or "walk" in q or "children" in q or "play" in q:
        if aqi_val > 200:
            reply = (
                f"**Outdoor Alert for {loc_name}: Unsafe for Strenuous Activities**\n\n"
                f"Current US AQI is **{aqi_val}** ({cat_val}) with PM2.5 at **{pm25_val} µg/m³** (over {int(pm25_val/15)}x the WHO daily guideline).\n\n"
                f"• **Children & Elderly**: Keep play and walks indoors today. Children breathe 50% more air per pound of body weight than adults.\n"
                f"• **Exercise**: Cancel outdoor cardio or running. Moving aerobic workouts indoors prevents deep alveolar deposition of fine particles.\n"
                f"• **If going outside**: Wear a snug-fitting N95 or FFP2 respirator. Cloth and standard surgical masks filter less than 30% of sub-micron winter smog particles."
            )
            tips = ["Switch workouts to indoor mobility/stretching", "Equip kids and seniors with certified N95 masks", "Seal balcony doors during morning smog"]
        elif aqi_val > 100:
            reply = (
                f"**Moderate Risk in {loc_name} (AQI {aqi_val})**\n\n"
                f"Current PM2.5 is **{pm25_val} µg/m³**. While healthy adults can perform light outdoor routines, sensitive groups (children, seniors, asthmatics) should minimize extended exertion.\n\n"
                f"• **Best Time Window**: Reschedule outdoor activities to between **1:00 PM and 3:30 PM**, when solar warmth breaks the thermal inversion layer and disperses trapped ground-level pollutants."
            )
            tips = ["Shift outdoor errands to 1:00–3:30 PM", "Keep windows sealed during early morning commute hours"]
        else:
            reply = (
                f"**Conditions are currently acceptable in {loc_name} (AQI {aqi_val} - {cat_val})**.\n\n"
                f"PM2.5 is **{pm25_val} µg/m³**. Outdoor activities and sports are safe for general healthy individuals. It is also an opportune time for a brief 20-minute cross-ventilation of your living spaces."
            )
            tips = ["Open opposite windows for 20 minutes to flush stale CO2", "Enjoy outdoor walks before evening traffic builds"]

    elif "mask" in q or "n95" in q or "cloth" in q:
        reply = (
            f"**Mask Selection Protocol for AQI {aqi_val}:**\n\n"
            f"1. **N95 / FFP2 / KN95 Respirators (Highly Recommended)**: Filter ≥95% of PM2.5 particles down to 0.3 microns. Crucial during winter smog when combustion aerosols and heavy metals are airborne.\n"
            f"2. **Surgical / Cloth Masks (Ineffective for Smog)**: They protect others from droplets, but leak significantly around edges, allowing up to 70-85% of fine toxic particulates directly into your lungs.\n"
            f"3. **Proper Fit Test**: Ensure the nose bridge clip is firmly molded to the contours of your nose, with no air leaking around the cheeks when inhaling deeply."
        )
        tips = ["Store reusable N95s in a clean, breathable paper bag between uses", "Check for tight facial seal, especially on children"]

    elif "indoor" in q or "purifier" in q or "hack" in q or "filter" in q or "plant" in q:
        reply = (
            f"**Proven Low-Cost Indoor Air Quality Hacks:**\n\n"
            f"1. **DIY Corsi-Rosenthal Box**: Fasten 4 MERV-13 furnace filters around a standard 20-inch box fan with duct tape. Delivers a Clean Air Delivery Rate (CADR) exceeding $400 commercial HEPA units for under $45.\n"
            f"2. **Damp Microfiber Mop vs Dry Sweeping**: Dry brooms re-suspend settled fine particulate into breathing zones. Damp mopping locks in dust permanently.\n"
            f"3. **Exhaust Hood First**: Cooking oils create intense indoor PM2.5 spikes (often 300+ µg/m³). Turn kitchen exhaust on 2 minutes before igniting burners and keep on for 5 minutes after cooking.\n"
            f"4. **Reality on Houseplants**: While beneficial for aesthetics, peer-reviewed NASA studies show you would need 10–100 plants per square meter to match one standard mechanical air filtration exchange."
        )
        tips = ["Build a DIY MERV-13 Corsi-Rosenthal filter box", "Avoid agarbatti, scented candles, and indoor smoking completely", "Damp-mop hard floors twice daily during smog weeks"]

    elif "pm2.5" in q or "pm10" in q or "what is" in q or "aqi" in q or "smog" in q:
        reply = (
            f"**Understanding Particulate Telemetry:**\n\n"
            f"• **PM2.5 ({pm25_val} µg/m³)**: Microscopic combustion particles under 2.5 microns (1/30th the width of a human hair). Because they bypass nasal hairs and bronchial cilia, they penetrate deep into the alveoli and pass directly into the bloodstream, triggering vascular inflammation.\n"
            f"• **PM10 ({aqi_data.pm10 if aqi_data else 140} µg/m³)**: Coarser inhalable dust, pollen, and road grit.\n"
            f"• **Winter Thermal Inversion**: Cold winter air gets trapped under a warm atmospheric layer, functioning like a lid that seals vehicular exhaust and industrial smog right at street level."
        )
        tips = ["Track hourly diurnal dispersion curves", "Avoid high-traffic intersections during morning thermal inversion"]
    else:
        reply = (
            f"**AeroPulse Environmental Analysis for {loc_name}:**\n\n"
            f"With current US AQI at **{aqi_val}** ({cat_val}) and PM2.5 at **{pm25_val} µg/m³**:\n\n"
            f"1. **Exposure Mitigation**: Prioritize staying in filtered or closed indoor spaces during early morning and late night.\n"
            f"2. **Commute Choice**: Choosing electric metro or organized carpools reduces both your personal exposure inside street-level exhaust tunnels and your household's carbon footprint.\n"
            f"3. **Indoor Routine**: Run HEPA or DIY MERV-13 filters in occupied bedrooms, keep kitchen doors closed when cooking, and avoid burning incense or mosquito coils indoors."
        )
        tips = ["Review today's personalized routine schedule", "Check the Indoor Hacks tab for budget air filtration options"]

    return ChatResponse(
        reply=reply,
        grounded_data={
            "location": loc_name,
            "aqi": aqi_val,
            "category": cat_val,
            "pm2_5": pm25_val,
            "pm10": aqi_data.pm10 if aqi_data else 140.0
        },
        actionable_tips=tips,
        is_fallback=True
    )

async def ask_gemini_assistant(
    message: str,
    history: List[ChatMessage],
    aqi_data: Optional[CurrentAirQuality],
    prefs: Optional[UserPreferences]
) -> ChatResponse:
    api_key = settings.GEMINI_API_KEY or os.environ.get("GEMINI_API_KEY", "")

    if not api_key or not HAS_GENAI:
        return generate_smart_fallback_response(message, aqi_data, prefs)

    try:
        client = genai.Client(api_key=api_key)
        sys_prompt = build_system_prompt(aqi_data, prefs)

        full_prompt = f"{sys_prompt}\n\nUser Question: {message}"
        response = client.models.generate_content(
            model="gemini-2.5-flash",
            contents=full_prompt,
        )

        reply_text = response.text if response and response.text else ""
        if not reply_text:
            return generate_smart_fallback_response(message, aqi_data, prefs)

        loc_name = aqi_data.location.name if aqi_data and aqi_data.location else "Current Location"
        return ChatResponse(
            reply=reply_text,
            grounded_data={
                "location": loc_name,
                "aqi": aqi_data.aqi_us if aqi_data else 165,
                "category": aqi_data.aqi_category if aqi_data else "Unhealthy",
                "pm2_5": aqi_data.pm2_5 if aqi_data else 85.0
            },
            actionable_tips=[
                "Check hourly dispersion window before leaving home",
                "Wear certified N95 mask outdoors",
                "Keep bedroom doors sealed with indoor air purifier active"
            ],
            is_fallback=False
        )
    except Exception as e:
        print(f"Gemini API error, using smart fallback: {e}")
        return generate_smart_fallback_response(message, aqi_data, prefs)
