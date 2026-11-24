from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List, Dict, Any

class UserRegister(BaseModel):
    name: str = Field(..., min_length=2, max_length=50)
    email: EmailStr
    password: str = Field(..., min_length=6, max_length=50)
    role: Optional[str] = "user" # "user" | "admin"

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    role: str
    user: Dict[str, Any]

class UserSensitivityProfile(BaseModel):
    has_asthma: bool = False
    has_elderly_in_home: bool = False
    has_infants: bool = False
    commute_mode: str = "Public Transit / Bus"
    daily_outdoor_exercise_mins: int = 45
    preferred_city: str = "Mangaluru, Karnataka, India"

class UserProfile(BaseModel):
    id: str
    name: str
    email: str
    role: str
    created_at: str
    sensitivity_profile: UserSensitivityProfile

class AdminStats(BaseModel):
    total_users: int
    active_sessions_today: int
    primary_station: str
    cpcb_alert_status: str
    system_health: str
    last_backup_time: str
    emergency_advisory_active: bool
    active_advisory_message: Optional[str] = None

class AdminThresholdUpdate(BaseModel):
    pm25_caution_limit: float = 60.0
    pm25_severe_limit: float = 120.0
    enforce_emergency_lockdown: bool = False
    advisory_note: Optional[str] = "Calibrated to CPCB Coastal Dispersion Dynamics"

class BroadcastAlertRequest(BaseModel):
    severity: str = "WARNING" # "INFO", "WARNING", "EMERGENCY"
    title: str
    message: str
    target_region: str = "Mangaluru Metro Area"

class AuditLogEntry(BaseModel):
    id: str
    timestamp: str
    event_type: str
    actor_email: str
    status: str
    details: str
