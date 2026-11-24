from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any

class LocationQuery(BaseModel):
    query: str

class LocationInfo(BaseModel):
    name: str
    latitude: float
    longitude: float
    country: Optional[str] = None
    admin1: Optional[str] = None
    timezone: Optional[str] = "UTC"

class CurrentAirQuality(BaseModel):
    aqi_us: int
    aqi_category: str
    aqi_color: str
    pm2_5: float
    pm10: float
    nitrogen_dioxide: Optional[float] = None
    carbon_monoxide: Optional[float] = None
    sulphur_dioxide: Optional[float] = None
    ozone: Optional[float] = None
    dust: Optional[float] = None
    timestamp: str
    location: LocationInfo
    weather: Dict[str, Any]
    source: str = "Open-Meteo Air Quality & Weather API"
    standard_used: str = "US-EPA Air Quality Index & WHO 2021 Reference Levels"

class HourlyForecastPoint(BaseModel):
    time: str
    aqi_us: int
    pm2_5: float
    pm10: float
    temperature: Optional[float] = None
    is_safe_window: bool = False

class AirQualityForecast(BaseModel):
    hourly: List[HourlyForecastPoint]
    daily_best_window: str
    daily_worst_window: str
    overall_trend: str

class UserPreferences(BaseModel):
    household_size: int = 4
    has_children: bool = True
    has_elderly: bool = True
    has_respiratory_sensitivity: bool = False
    commute_mode: str = "Metro / Bus" # "Walking", "Cycling", "Metro / Bus", "Car / Cab", "Motorcycle"
    daily_commute_km: float = 12.0
    home_purifier_owned: bool = False
    preferred_exercise_time: str = "Morning (6-8 AM)" # "Morning", "Afternoon", "Evening", "Indoor only"

class ChatMessage(BaseModel):
    role: str # "user" | "assistant" | "system"
    content: str

class ChatRequest(BaseModel):
    message: str
    history: Optional[List[ChatMessage]] = []
    location: Optional[LocationInfo] = None
    current_aqi: Optional[CurrentAirQuality] = None
    user_preferences: Optional[UserPreferences] = None

class ChatResponse(BaseModel):
    reply: str
    grounded_data: Dict[str, Any]
    actionable_tips: List[str] = []
    is_fallback: bool = False

class RecommendationItem(BaseModel):
    id: str
    title: str
    category: str # "health", "indoor", "commute", "routine"
    severity: str # "urgent", "moderate", "optimal"
    description: str
    why_it_matters: str
    impact_metrics: Dict[str, str]

class DailyRoutineScheduleItem(BaseModel):
    time_slot: str
    activity: str
    air_quality_risk: str # "Low", "Moderate", "High", "Extreme"
    recommended_action: str
    sustainable_alternative: str
    pm25_exposure_saved_ug: float
    co2_saved_kg: float

class DailyRoutinePlan(BaseModel):
    summary: str
    air_quality_alert: str
    schedule: List[DailyRoutineScheduleItem]
    total_pm25_avoided_ug: float
    total_co2_saved_kg: float
    sustainable_transport_advice: str

class IndoorHack(BaseModel):
    id: str
    title: str
    difficulty: str # "Easy", "Medium", "Advanced"
    estimated_cost: str
    expected_benefit: str
    icon_name: str
    description: str
    steps: List[str]
    scientific_basis: str
