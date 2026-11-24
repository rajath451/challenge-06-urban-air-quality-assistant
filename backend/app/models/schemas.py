from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any

class LocationInfo(BaseModel):
    name: str = "Mangaluru, Karnataka, India"
    latitude: float = 12.9141
    longitude: float = 74.8560
    state: Optional[str] = "Karnataka"
    country: Optional[str] = "India"
    station_name: Optional[str] = "Baikampady / Kadri CPCB Station"
    is_coastal: bool = True

class EnvironmentalReadings(BaseModel):
    pm2_5: float = Field(..., description="PM2.5 concentration in µg/m³")
    pm10: float = Field(..., description="PM10 concentration in µg/m³")
    indian_naqi: int = Field(..., description="CPCB Indian National Air Quality Index (0-500)")
    indian_naqi_category: str = Field(..., description="Good, Satisfactory, Moderate, Poor, Very Poor, Severe")
    us_aqi: int = Field(..., description="US-EPA Air Quality Index (0-500)")
    us_aqi_category: str = Field(..., description="US-EPA Category")
    primary_pollutant: str = "PM2.5"
    nitrogen_dioxide: Optional[float] = None
    carbon_monoxide: Optional[float] = None
    sulphur_dioxide: Optional[float] = None
    ozone: Optional[float] = None
    temperature: float = 29.5
    relative_humidity: float = 75.0
    wind_speed: float = 12.0
    wind_direction: float = 240.0 # Onshore sea breeze in Mangaluru
    weather_condition: str = "Partly Cloudy"
    timestamp: str
    data_source: str = "Open-Meteo Air Quality & Weather API"
    data_freshness_minutes: int = 12
    is_live: bool = True

class DecisionItem(BaseModel):
    activity_type: str # "exercise", "walking", "cycling", "commuting", "ventilation", "outdoor_leisure"
    activity_title: str
    recommendation: str # "Recommended", "Proceed with Caution", "Modify Intensity/Time", "Avoid / Postpone"
    recommendation_tier: str # "optimal", "caution", "restricted", "avoid"
    reason: str
    environmental_rationale: str
    key_metrics: Dict[str, Any]
    alternative_action: str
    best_time_window: Optional[str] = None
    confidence_level: str # "Higher confidence", "Moderate confidence", "Limited confidence", "Insufficient data"
    confidence_reason: str
    important_limitations: str

class DecisionResponse(BaseModel):
    location: LocationInfo
    readings: EnvironmentalReadings
    overall_status: str
    main_advice: str
    decisions: List[DecisionItem]
    generated_at: str

class ActivitySlotForecast(BaseModel):
    hour: str
    time_label: str
    pm2_5: float
    indian_naqi: int
    naqi_category: str
    temperature: float
    relative_humidity: float
    wind_speed: float
    suitability_score: float # 0 to 100
    suitability_label: str # "Optimal", "Acceptable", "Poor", "Hazardous"
    ventilation_recommended: bool
    notes: str

class PlannerRequest(BaseModel):
    activity_type: str = "exercise" # "exercise", "walk", "cycling", "errands"
    duration_minutes: int = 45 # 15, 30, 45, 60, 90, 120
    preferred_window: str = "any" # "morning", "afternoon", "evening", "night", "any"
    sensitivity_level: str = "normal" # "sensitive", "normal", "athletic"

class PlannerResponse(BaseModel):
    location: LocationInfo
    activity_type: str
    duration_minutes: int
    best_windows: List[Dict[str, Any]]
    hourly_schedule: List[ActivitySlotForecast]
    confidence_level: str
    uncertainty_explanation: str
    disclaimer: str

class IndoorSimulationRequest(BaseModel):
    room_area_sqft: float = 200.0 # approx 18.5 m²
    ceiling_height_ft: float = 9.8 # approx 3 m -> ~55 m³
    outdoor_pm2_5: float = 38.0
    cooking_activity: str = "deep_frying" # "none", "light_boiling", "stir_frying", "deep_frying_tadka"
    cooking_duration_minutes: int = 30
    mosquito_coil_count: int = 0 # common in coastal areas
    incense_sticks_count: int = 0
    windows_open: bool = False
    exhaust_fan_on: bool = False
    ac_running: bool = False
    air_purifier_cadrm3h: float = 0.0 # 0 if none, or CADR e.g. 250 m³/h

class IndoorSimulationDataPoint(BaseModel):
    minute: int
    time_label: str
    indoor_pm2_5: float
    outdoor_pm2_5: float
    indoor_naqi_category: str
    active_sources: str

class IndoorSimulationResponse(BaseModel):
    inputs_echo: Dict[str, Any]
    peak_indoor_pm2_5: float
    baseline_indoor_pm2_5: float
    final_indoor_pm2_5: float
    indoor_to_outdoor_ratio_peak: float
    time_to_safe_baseline_minutes: int
    trajectory: List[IndoorSimulationDataPoint]
    counterfactual_scenario: Dict[str, Any] # e.g. "If exhaust fan had been ON"
    practical_action: str
    model_assumptions: List[str]
    uncertainty_warning: str

class ExposureRequest(BaseModel):
    activity: str = "jogging" # "resting", "walking", "jogging", "cycling", "heavy_workout"
    duration_minutes: int = 45
    pm2_5_concentration: float = 45.0
    body_weight_kg: float = 65.0
    is_child: bool = False

class ExposureResponse(BaseModel):
    activity: str
    duration_minutes: int
    pm2_5_concentration: float
    ventilation_rate_m3h: float
    air_volume_inhaled_m3: float
    inhaled_mass_micrograms: float
    equivalent_baseline_hours: float
    who_daily_budget_percentage: float
    dose_comparison_clean_window: Dict[str, Any]
    scientific_basis: str
    limitations_and_disclaimer: str

class ChatMessage(BaseModel):
    role: str # "user" | "assistant" | "system"
    content: str

class AssistantChatRequest(BaseModel):
    message: str
    history: Optional[List[ChatMessage]] = []
    location: Optional[LocationInfo] = None
    readings: Optional[EnvironmentalReadings] = None
    user_context: Optional[Dict[str, Any]] = None

class AssistantChatResponse(BaseModel):
    reply: str
    grounded_data: Dict[str, Any]
    deterministic_recommendations: List[str]
    confidence_level: str
    data_limitations: str
    is_fallback: bool = False

class TransparencyInfo(BaseModel):
    connected_apis: List[Dict[str, Any]]
    data_availability_status: str
    last_successful_sync: str
    active_station: str
    model_version: str
    data_taxonomy: Dict[str, str] # Measured vs Forecasted vs Simulated vs Estimated
    known_limitations: List[str]
    attribution: List[Dict[str, str]]
