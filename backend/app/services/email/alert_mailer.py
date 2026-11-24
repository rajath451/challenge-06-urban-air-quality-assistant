"""
VayuCoach Real-Time Alert Mailer
Dispatches urgent AQI warnings and activity advisories using only validated physical environmental feeds.
"""

from typing import Dict, Any, List, Optional
from app.config import settings
from app.models.schemas import EnvironmentalReadings
from app.services.email.smtp_client import send_email, SmtpDeliveryResult
from app.services.email.templates import (
    render_aqi_warning,
    render_activity_alert
)
from app.services.email.preferences_service import get_or_create_preferences, is_user_subscribed
from app.services.email.deduplicator import generate_dedup_key, is_duplicate, mark_sent

async def send_aqi_warning_alert(
    user_id: str,
    user_name: str,
    recipient_email: str,
    city_name: str,
    readings: EnvironmentalReadings,
    threshold_aqi: int = 100
) -> Optional[SmtpDeliveryResult]:
    """
    Evaluates real-time validated atmospheric readings against user/station thresholds.
    Suppresses sending if user has opted out or if an alert was already sent within the cooldown window.
    """
    # 1. Strictly validate readings
    if not readings or readings.indian_naqi is None:
        raise ValueError("Cannot dispatch alert without validated real-time environmental telemetry.")

    # 2. Check if readings exceed threshold
    if readings.indian_naqi < threshold_aqi:
        return None # Air quality is within acceptable bounds

    # 3. Check user subscription consent
    if not is_user_subscribed(user_id, "aqi_alerts"):
        return None

    # 4. Check deduplication key (cooldown suppression)
    dedup_key = generate_dedup_key(user_id, "aqi_warning", f"{readings.indian_naqi_category}:{city_name}")
    if is_duplicate(dedup_key):
        print(f"[DEDUP SUPPRESSION] AQI warning alert for {recipient_email} in {city_name} suppressed (within cooldown).")
        return None

    # 5. Formulate actionable health directives based on CPCB category
    action_items = [
        "Wear an N95/FFP2 respirator if traveling along major traffic arteries.",
        "Keep home windows sealed until afternoon onshore sea breeze develops (1:00 PM – 4:00 PM).",
        "Postpone strenuous outdoor workouts, high-intensity cycling, and morning sprints.",
        "Use active kitchen exhaust ventilation and avoid mosquito coils or indoor incense."
    ]
    if readings.indian_naqi >= 250:
        action_items.insert(0, "MANDATORY SHELTER: Severe particulate inversion. Limit all outdoor school/elderly activities.")

    prefs = get_or_create_preferences(user_id, recipient_email)
    rendered = render_aqi_warning(
        user_name=user_name,
        city_name=city_name,
        indian_naqi=readings.indian_naqi,
        category=readings.indian_naqi_category,
        pm2_5=readings.pm2_5,
        action_items=action_items,
        unsubscribe_token=prefs["unsubscribe_token"]
    )

    result = await send_email(
        recipient_email=recipient_email,
        subject=rendered["subject"],
        html_content=rendered["html"],
        email_type="aqi_warning",
        user_id=user_id,
        unsubscribe_url=f"{settings.FRONTEND_URL}/api/notifications/unsubscribe?token={prefs['unsubscribe_token']}",
        dedup_key=dedup_key,
        metadata={
            "indian_naqi": readings.indian_naqi,
            "category": readings.indian_naqi_category,
            "pm2_5": readings.pm2_5,
            "city": city_name
        }
    )

    if result.success:
        mark_sent(dedup_key)

    return result


async def send_activity_advisory_alert(
    user_id: str,
    user_name: str,
    recipient_email: str,
    activity_name: str,
    status: str,
    reason: str,
    alternative_suggestion: str
) -> Optional[SmtpDeliveryResult]:
    """Dispatches targeted exercise/activity modification alert."""
    if not is_user_subscribed(user_id, "activity_recommendations"):
        return None

    dedup_key = generate_dedup_key(user_id, "activity_alert", f"{activity_name}:{status}")
    if is_duplicate(dedup_key, window_hours=12):
        return None

    prefs = get_or_create_preferences(user_id, recipient_email)
    rendered = render_activity_alert(
        user_name=user_name,
        activity_name=activity_name,
        status=status,
        reason=reason,
        alternative_suggestion=alternative_suggestion,
        unsubscribe_token=prefs["unsubscribe_token"]
    )

    result = await send_email(
        recipient_email=recipient_email,
        subject=rendered["subject"],
        html_content=rendered["html"],
        email_type="activity_recommendation",
        user_id=user_id,
        unsubscribe_url=f"{settings.FRONTEND_URL}/api/notifications/unsubscribe?token={prefs['unsubscribe_token']}",
        dedup_key=dedup_key,
        metadata={"activity": activity_name, "status": status}
    )

    if result.success:
        mark_sent(dedup_key)

    return result
