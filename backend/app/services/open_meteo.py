"""
Open-Meteo Environmental Telemetry Service
Provides live real-time air quality, weather, and geocoding for Mangaluru, Karnataka,
and other Indian metropolitan areas.
"""

import httpx
from typing import Dict, Any, List, Optional
from datetime import datetime
from app.models.schemas import EnvironmentalReadings, LocationInfo
from app.services.data_normalizer import calculate_indian_naqi, calculate_us_aqi, assess_data_quality

AIR_QUALITY_URL = "https://air-quality-api.open-meteo.com/v1/air-quality"
WEATHER_URL = "https://api.open-meteo.com/v1/forecast"
GEOCODING_URL = "https://geocoding-api.open-meteo.com/v1/search"

# Curated Indian cities with Mangaluru as the primary default
FEATURED_LOCATIONS: Dict[str, LocationInfo] = {
    "mangaluru": LocationInfo(
        name="Mangaluru, Karnataka, India",
        latitude=12.9141,
        longitude=74.8560,
        state="Karnataka",
        country="India",
        station_name="Baikampady / Kadri CPCB-KSPCB Station",
        is_coastal=True
    ),
    "bengaluru": LocationInfo(
        name="Bengaluru, Karnataka, India",
        latitude=12.9716,
        longitude=77.5946,
        state="Karnataka",
        country="India",
        station_name="BTM Layout / City Railway Station",
        is_coastal=False
    ),
    "delhi": LocationInfo(
        name="New Delhi, India",
        latitude=28.6139,
        longitude=77.2090,
        state="Delhi",
        country="India",
        station_name="Anand Vihar / RK Puram CPCB",
        is_coastal=False
    ),
    "mumbai": LocationInfo(
        name="Mumbai, Maharashtra, India",
        latitude=19.0760,
        longitude=72.8777,
        state="Maharashtra",
        country="India",
        station_name="Bandra / Colaba Coastal Station",
        is_coastal=True
    ),
    "chennai": LocationInfo(
        name="Chennai, Tamil Nadu, India",
        latitude=13.0827,
        longitude=80.2707,
        state="Tamil Nadu",
        country="India",
        station_name="Alandur / Manali Industrial",
        is_coastal=True
    ),
    "hyderabad": LocationInfo(
        name="Hyderabad, Telangana, India",
        latitude=17.3850,
        longitude=78.4867,
        state="Telangana",
        country="India",
        station_name="Sanathnagar / Zoo Park Station",
        is_coastal=False
    )
}

WEATHER_CODE_MAP = {
    0: "Clear Sky",
    1: "Mainly Clear",
    2: "Partly Cloudy",
    3: "Overcast",
    45: "Fog / Smog Haze",
    48: "Depositing Rime Fog",
    51: "Light Drizzle",
    61: "Slight Rain",
    80: "Rain Showers"
}

async def fetch_environmental_data(lat: float, lon: float, location_name: str = "Mangaluru, Karnataka") -> EnvironmentalReadings:
    aq_data = {}
    weather_data = {}
    ts_now = datetime.utcnow().isoformat() + "Z"

    async with httpx.AsyncClient(timeout=8.0) as client:
        # 1. Fetch Air Quality
        try:
            aq_resp = await client.get(AIR_QUALITY_URL, params={
                "latitude": lat,
                "longitude": lon,
                "current": "pm2_5,pm10,carbon_monoxide,nitrogen_dioxide,sulphur_dioxide,ozone",
                "timezone": "Asia/Kolkata"
            })
            if aq_resp.status_code == 200:
                aq_data = aq_resp.json().get("current", {})
        except Exception as e:
            print(f"[Open-Meteo Air Quality Error]: {e}")

        # 2. Fetch Weather
        try:
            w_resp = await client.get(WEATHER_URL, params={
                "latitude": lat,
                "longitude": lon,
                "current": "temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,wind_speed_10m,wind_direction_10m,weather_code",
                "timezone": "Asia/Kolkata"
            })
            if w_resp.status_code == 200:
                weather_data = w_resp.json().get("current", {})
        except Exception as e:
            print(f"[Open-Meteo Weather Error]: {e}")

    # Fallback to realistic Mangaluru baseline if network error
    pm25 = float(aq_data.get("pm2_5", 0.0) or 26.5)
    pm10 = float(aq_data.get("pm10", 0.0) or 32.0)
    no2 = float(aq_data.get("nitrogen_dioxide", 0.0) or 4.5)
    co = float(aq_data.get("carbon_monoxide", 0.0) or 280.0)
    so2 = float(aq_data.get("sulphur_dioxide", 0.0) or 3.2)
    ozone = float(aq_data.get("ozone", 0.0) or 140.0)

    # Compute both official Indian NAQI and US AQI
    naqi_val, naqi_cat, _ = calculate_indian_naqi(pm25, pm10)
    us_aqi_val, us_cat, _ = calculate_us_aqi(pm25)

    temp = float(weather_data.get("temperature_2m", 31.0))
    hum = float(weather_data.get("relative_humidity_2m", 62.0))
    wind_spd = float(weather_data.get("wind_speed_10m", 11.5))
    wind_dir = float(weather_data.get("wind_direction_10m", 250.0))
    w_code = int(weather_data.get("weather_code", 1))
    w_desc = WEATHER_CODE_MAP.get(w_code, "Fair Weather")

    # Assess data freshness
    quality = assess_data_quality(aq_data.get("time", ts_now))

    return EnvironmentalReadings(
        pm2_5=round(pm25, 1),
        pm10=round(pm10, 1),
        indian_naqi=naqi_val,
        indian_naqi_category=naqi_cat,
        us_aqi=us_aqi_val,
        us_aqi_category=us_cat,
        primary_pollutant="PM2.5",
        nitrogen_dioxide=round(no2, 1),
        carbon_monoxide=round(co, 1),
        sulphur_dioxide=round(so2, 1),
        ozone=round(ozone, 1),
        temperature=round(temp, 1),
        relative_humidity=round(hum, 1),
        wind_speed=round(wind_spd, 1),
        wind_direction=round(wind_dir, 1),
        weather_condition=w_desc,
        timestamp=aq_data.get("time", ts_now),
        data_source="Open-Meteo High-Resolution Atmospheric & Weather API",
        data_freshness_minutes=quality["age_minutes"],
        is_live=bool(aq_data)
    )

async def search_indian_cities(query: str) -> List[LocationInfo]:
    if not query or len(query.strip()) < 2:
        return list(FEATURED_LOCATIONS.values())

    clean_q = query.strip().lower()
    matches = []

    # Check featured first
    for k, loc in FEATURED_LOCATIONS.items():
        if clean_q in loc.name.lower() or clean_q in k:
            matches.append(loc)

    try:
        async with httpx.AsyncClient(timeout=6.0) as client:
            resp = await client.get(GEOCODING_URL, params={
                "name": query,
                "count": 6,
                "language": "en",
                "format": "json"
            })
            if resp.status_code == 200:
                data = resp.json()
                for item in data.get("results", []):
                    # Prefer Indian locations or relevant cities
                    country = item.get("country", "")
                    admin1 = item.get("admin1", "")
                    loc_name = f"{item.get('name')}, {admin1}, {country}" if admin1 else f"{item.get('name')}, {country}"
                    matches.append(LocationInfo(
                        name=loc_name,
                        latitude=item.get("latitude"),
                        longitude=item.get("longitude"),
                        state=admin1,
                        country=country,
                        station_name="CPCB / SPCB Regional Monitoring Grid",
                        is_coastal="coastal" in loc_name.lower() or "mangaluru" in loc_name.lower() or "mumbai" in loc_name.lower()
                    ))
    except Exception as e:
        print(f"[Geocoding API Error]: {e}")

    # Remove duplicates
    seen = set()
    unique = []
    for m in matches:
        key = f"{m.name}_{round(m.latitude, 2)}_{round(m.longitude, 2)}"
        if key not in seen:
            seen.add(key)
            unique.append(m)
    return unique
