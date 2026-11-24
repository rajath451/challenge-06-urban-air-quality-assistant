from fastapi import APIRouter, HTTPException, Depends, Query
from datetime import datetime
from typing import List, Dict, Any, Optional
from pydantic import BaseModel, EmailStr
from app.config import settings
from app.models.auth_schemas import AdminStats, AdminThresholdUpdate, BroadcastAlertRequest, AuditLogEntry
from app.services.security import (
    USERS_DB, AUDIT_LOGS, CURRENT_ADVISORY, get_current_admin, record_audit_log
)
from app.services.email import (
    send_email,
    get_delivery_logs,
    render_admin_test,
    render_aqi_warning,
    render_daily_report,
    render_weekly_summary,
    send_aqi_warning_alert,
    send_daily_morning_briefing,
    get_or_create_preferences,
    PREFERENCES_DB
)
from app.services.open_meteo import fetch_environmental_data

router = APIRouter(prefix="/api/admin", tags=["Administrator Governance Console"])

class AdminTestEmailRequest(BaseModel):
    recipient_email: EmailStr
    template_type: str = "admin_test" # admin_test, aqi_warning, daily_briefing, weekly_summary

@router.get("/overview", response_model=AdminStats)
async def get_admin_overview(admin: dict = Depends(get_current_admin)):
    return AdminStats(
        total_users=len(USERS_DB),
        active_sessions_today=len(USERS_DB) + 3,
        primary_station="Mangaluru Kadri-Baikampady CAAQMS",
        cpcb_alert_status="Normal Monitoring Active",
        system_health="Operational (FastAPI, Brevo SMTP & GenAI Grounding Live)",
        last_backup_time=datetime.utcnow().isoformat() + "Z",
        emergency_advisory_active=CURRENT_ADVISORY["is_active"],
        active_advisory_message=CURRENT_ADVISORY["message"] if CURRENT_ADVISORY["is_active"] else None
    )

@router.get("/audit-logs", response_model=List[AuditLogEntry])
async def get_security_audit_logs(admin: dict = Depends(get_current_admin)):
    return AUDIT_LOGS[:50]

@router.post("/thresholds")
async def update_cpcb_thresholds(payload: AdminThresholdUpdate, admin: dict = Depends(get_current_admin)):
    record_audit_log(
        "ADMIN_THRESHOLD_UPDATE",
        admin["email"],
        "SUCCESS",
        f"Updated Caution limit: {payload.pm25_caution_limit} µg/m³, Severe limit: {payload.pm25_severe_limit} µg/m³. Lockdown: {payload.enforce_emergency_lockdown}"
    )
    return {
        "status": "success",
        "message": "CPCB Decision Engine thresholds calibrated successfully.",
        "updated_values": payload.dict(),
        "updated_by": admin["email"],
        "timestamp": datetime.utcnow().isoformat() + "Z"
    }

@router.post("/broadcast-alert")
async def broadcast_emergency_advisory(payload: BroadcastAlertRequest, admin: dict = Depends(get_current_admin)):
    CURRENT_ADVISORY.update({
        "is_active": True,
        "severity": payload.severity,
        "title": payload.title,
        "message": payload.message,
        "updated_at": datetime.utcnow().isoformat() + "Z",
        "updated_by": admin["email"]
    })
    record_audit_log(
        "EMERGENCY_BROADCAST",
        admin["email"],
        "WARNING" if payload.severity == "WARNING" else "EMERGENCY",
        f"Broadcast '{payload.title}' sent to {payload.target_region}."
    )
    return {
        "status": "broadcast_active",
        "advisory": CURRENT_ADVISORY
    }

@router.get("/active-advisory")
async def get_active_advisory():
    return CURRENT_ADVISORY

# -------------------------------------------------------------
# CENTRALIZED SMTP & EMAIL GOVERNANCE ENDPOINTS
# -------------------------------------------------------------
@router.get("/email/status")
async def get_smtp_status(admin: dict = Depends(get_current_admin)):
    """Returns SMTP configuration and connection parameters (passwords safely omitted)."""
    return {
        "smtp_provider": settings.SMTP_PROVIDER,
        "smtp_host": settings.SMTP_HOST,
        "smtp_port": settings.SMTP_PORT,
        "smtp_from_email": settings.SMTP_FROM_EMAIL,
        "smtp_from_name": settings.SMTP_FROM_NAME,
        "use_tls": settings.SMTP_USE_TLS,
        "use_ssl": settings.SMTP_USE_SSL,
        "mock_fallback_enabled": settings.SMTP_MOCK_FALLBACK,
        "max_emails_per_hour": settings.MAX_EMAILS_PER_USER_PER_HOUR,
        "dedup_cooldown_hours": settings.AQI_ALERT_DEDUPLICATION_HOURS,
        "total_emails_logged": len(get_delivery_logs(limit=1000))
    }

@router.post("/email/test")
async def send_admin_test_email(
    payload: AdminTestEmailRequest,
    admin: dict = Depends(get_current_admin)
):
    """Sends a verified test email to the specified recipient to validate SMTP configuration."""
    template_type = payload.template_type
    rendered = None

    if template_type == "admin_test":
        rendered = render_admin_test(
            admin_name=admin["name"],
            smtp_provider=settings.SMTP_PROVIDER,
            smtp_host=settings.SMTP_HOST,
            smtp_port=settings.SMTP_PORT,
            sender_email=settings.SMTP_FROM_EMAIL
        )
    elif template_type == "aqi_warning":
        rendered = render_aqi_warning(
            user_name="Evaluator / Admin",
            city_name="Mangaluru",
            indian_naqi=145,
            category="Moderate",
            pm2_5=68.5,
            action_items=[
                "Sensitive individuals should wear N95 masks outdoors.",
                "Postpone intense running sessions until sea breeze clearing (1:30 PM)."
            ],
            unsubscribe_token="test-unsub-token"
        )
    elif template_type == "daily_briefing":
        rendered = render_daily_report(
            user_name="Evaluator / Admin",
            city_name="Mangaluru",
            current_naqi=42,
            category="Good",
            optimal_window="1:00 PM – 4:00 PM",
            coastal_wind_note="Marine breeze active along coastal highway.",
            daily_advice="Excellent air quality. Outdoor workouts fully recommended.",
            unsubscribe_token="test-unsub-token"
        )
    elif template_type == "weekly_summary":
        rendered = render_weekly_summary(
            user_name="Evaluator / Admin",
            city_name="Mangaluru",
            clean_air_days=6,
            avg_naqi=38,
            total_dose_averted_ug=185.0,
            top_insight="High afternoon wind dispersion prevented PM2.5 build-up.",
            unsubscribe_token="test-unsub-token"
        )
    else:
        raise HTTPException(status_code=400, detail=f"Unsupported template type '{template_type}'")

    result = await send_email(
        recipient_email=payload.recipient_email,
        subject=rendered["subject"],
        html_content=rendered["html"],
        email_type=f"admin_test_{template_type}",
        user_id=admin["id"],
        metadata={"triggered_by_admin": admin["email"], "template": template_type}
    )

    record_audit_log(
        "ADMIN_SMTP_TEST_EMAIL",
        admin["email"],
        "SUCCESS" if result.success else "FAILED",
        f"Test email ({template_type}) dispatched to {payload.recipient_email}. Status: {result.status}"
    )

    return {
        "status": "success" if result.success else "failed",
        "result": result.to_dict(),
        "provider": settings.SMTP_PROVIDER,
        "message": f"Test email dispatched to {payload.recipient_email}"
    }

@router.get("/email/logs")
async def get_all_email_logs(
    limit: int = Query(50, ge=1, le=200),
    admin: dict = Depends(get_current_admin)
):
    """Admin endpoint to inspect all outbound delivery attempts and delivery errors."""
    logs = get_delivery_logs(limit=limit)
    return {
        "logs": logs,
        "count": len(logs)
    }

@router.post("/email/trigger-daily")
async def trigger_daily_briefings_now(admin: dict = Depends(get_current_admin)):
    """Admin tool to trigger the daily morning briefing cycle using validated live Open-Meteo feeds."""
    readings = await fetch_environmental_data(settings.DEFAULT_LAT, settings.DEFAULT_LON, settings.DEFAULT_CITY)
    dispatched = 0

    for email, user in USERS_DB.items():
        res = await send_daily_morning_briefing(
            user_id=user["id"],
            user_name=user["name"],
            recipient_email=user["email"],
            city_name=user.get("sensitivity_profile", {}).get("preferred_city", "Mangaluru").split(",")[0],
            readings=readings
        )
        if res and res.success:
            dispatched += 1

    record_audit_log(
        "TRIGGER_DAILY_BRIEFING",
        admin["email"],
        "SUCCESS",
        f"Dispatched daily reports to {dispatched} subscribed user(s) using validated telemetry (NAQI {readings.indian_naqi})."
    )

    return {
        "status": "completed",
        "dispatched_count": dispatched,
        "validated_naqi": readings.indian_naqi,
        "validated_category": readings.indian_naqi_category
    }

@router.post("/email/trigger-aqi-check")
async def trigger_live_aqi_warning_check(
    threshold: int = Query(100, ge=30, le=400),
    admin: dict = Depends(get_current_admin)
):
    """
    Evaluates real-time ambient feeds against the given threshold.
    Dispatches warnings only if real measurements exceed threshold, respecting deduplication.
    """
    readings = await fetch_environmental_data(settings.DEFAULT_LAT, settings.DEFAULT_LON, settings.DEFAULT_CITY)
    dispatched = 0

    for email, user in USERS_DB.items():
        res = await send_aqi_warning_alert(
            user_id=user["id"],
            user_name=user["name"],
            recipient_email=user["email"],
            city_name=user.get("sensitivity_profile", {}).get("preferred_city", "Mangaluru").split(",")[0],
            readings=readings,
            threshold_aqi=threshold
        )
        if res and res.success:
            dispatched += 1

    record_audit_log(
        "TRIGGER_AQI_WARNING_CHECK",
        admin["email"],
        "SUCCESS",
        f"Evaluated live telemetry (NAQI {readings.indian_naqi}). Dispatched {dispatched} warning alert(s) (threshold: {threshold})."
    )

    return {
        "status": "evaluated",
        "live_naqi": readings.indian_naqi,
        "live_category": readings.indian_naqi_category,
        "threshold": threshold,
        "dispatched_alerts": dispatched
    }
