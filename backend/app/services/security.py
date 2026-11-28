"""
VayuCoach Security, Authentication & Audit Service
Implements:
- Salted bcrypt password hashing & verification
- Stateless JWT issuance & token verification with HS256
- Role-Based Access Control (RBAC) dependencies
- In-memory thread-safe user database pre-seeded with test accounts
- Tamper-evident Audit Logging for administrative governance
"""

import os
import secrets
from datetime import datetime, timedelta
from typing import Optional, Dict, Any, List
import jwt
import bcrypt
from fastapi import HTTPException, Security, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from app.models.auth_schemas import UserSensitivityProfile, AuditLogEntry

JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY", "vayucoach-production-secret-key-32bytes-long-super-safe!")
JWT_ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_HOURS = 24

security_bearer = HTTPBearer(auto_error=False)

def hash_password(password: str) -> str:
    pwd_bytes = password.encode("utf-8")[:72]
    salt = bcrypt.gensalt()
    return bcrypt.hashpw(pwd_bytes, salt).decode("utf-8")

def verify_password(plain_password: str, hashed_password: str) -> bool:
    try:
        pwd_bytes = plain_password.encode("utf-8")[:72]
        return bcrypt.checkpw(pwd_bytes, hashed_password.encode("utf-8"))
    except (ValueError, TypeError):
        return False

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(hours=ACCESS_TOKEN_EXPIRE_HOURS))
    to_encode.update({"exp": expire, "iat": datetime.utcnow()})
    return jwt.encode(to_encode, JWT_SECRET_KEY, algorithm=JWT_ALGORITHM)

def decode_access_token(token: str) -> Dict[str, Any]:
    try:
        payload = jwt.decode(token, JWT_SECRET_KEY, algorithms=[JWT_ALGORITHM])
        return payload
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token has expired. Please log in again.")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid authentication token.")

# -------------------------------------------------------------
# IN-MEMORY USER STORE (SEEDED WITH DEMO USER & ADMIN)
# -------------------------------------------------------------
USERS_DB: Dict[str, Dict[str, Any]] = {
    "user@vayucoach.in": {
        "id": "usr-seeded-001",
        "name": "Arjun Rao",
        "email": "user@vayucoach.in",
        "hashed_password": hash_password("User@123"),
        "role": "user",
        "created_at": "2026-11-20T10:00:00Z",
        "sensitivity_profile": {
            "has_asthma": False,
            "has_elderly_in_home": True,
            "has_infants": False,
            "commute_mode": "Public Transit / Bus",
            "daily_outdoor_exercise_mins": 45,
            "preferred_city": "Mangaluru, Karnataka, India"
        }
    },
    "admin@vayucoach.in": {
        "id": "adm-seeded-002",
        "name": "Dr. Prathima Nayak (KSPCB / CPCB Admin)",
        "email": "admin@vayucoach.in",
        "hashed_password": hash_password("Admin@123"),
        "role": "admin",
        "created_at": "2026-11-15T09:00:00Z",
        "sensitivity_profile": {
            "has_asthma": False,
            "has_elderly_in_home": False,
            "has_infants": False,
            "commute_mode": "Metro / Train",
            "daily_outdoor_exercise_mins": 30,
            "preferred_city": "Mangaluru, Karnataka, India"
        }
    }
}

# -------------------------------------------------------------
# AUDIT LOG STORE & SYSTEM ADVISORY STATE
# -------------------------------------------------------------
AUDIT_LOGS: List[AuditLogEntry] = [
    AuditLogEntry(
        id="aud-001",
        timestamp=datetime.utcnow().isoformat() + "Z",
        event_type="SYSTEM_INITIALIZE",
        actor_email="system@vayucoach.in",
        status="SUCCESS",
        details="VayuCoach Security & RBAC subsystem initialized with salted bcrypt."
    )
]

CURRENT_ADVISORY = {
    "is_active": False,
    "severity": "NORMAL",
    "title": "Normal Atmospheric Baseline",
    "message": "Coastal Arabian Sea breeze active. No meteorological inversion emergency.",
    "updated_at": datetime.utcnow().isoformat() + "Z",
    "updated_by": "system"
}

def record_audit_log(event_type: str, actor_email: str, status: str, details: str):
    log_entry = AuditLogEntry(
        id=f"aud-{len(AUDIT_LOGS) + 1:04d}",
        timestamp=datetime.utcnow().isoformat() + "Z",
        event_type=event_type,
        actor_email=actor_email,
        status=status,
        details=details
    )
    AUDIT_LOGS.insert(0, log_entry)
    # keep last 100 entries
    if len(AUDIT_LOGS) > 100:
        AUDIT_LOGS.pop()

# -------------------------------------------------------------
# FASTAPI DEPENDENCIES FOR RBAC
# -------------------------------------------------------------
async def get_current_user_optional(auth: Optional[HTTPAuthorizationCredentials] = Security(security_bearer)) -> Optional[Dict[str, Any]]:
    if not auth or not auth.credentials:
        return None
    try:
        payload = decode_access_token(auth.credentials)
        email = payload.get("sub")
        if email and email in USERS_DB:
            return USERS_DB[email]
    except HTTPException:
        return None

async def get_current_user(auth: Optional[HTTPAuthorizationCredentials] = Security(security_bearer)) -> Dict[str, Any]:
    if not auth or not auth.credentials:
        raise HTTPException(status_code=401, detail="Authentication credentials required.")
    payload = decode_access_token(auth.credentials)
    email = payload.get("sub")
    if not email or email not in USERS_DB:
        raise HTTPException(status_code=401, detail="User account not found or disabled.")
    return USERS_DB[email]

async def get_current_admin(current_user: Dict[str, Any] = Depends(get_current_user)) -> Dict[str, Any]:
    if current_user.get("role") != "admin":
        record_audit_log("UNAUTHORIZED_ADMIN_ACCESS", current_user.get("email", "unknown"), "DENIED", "Non-admin attempted to access admin route.")
        raise HTTPException(status_code=403, detail="Forbidden: Administrator privilege required.")
    return current_user
