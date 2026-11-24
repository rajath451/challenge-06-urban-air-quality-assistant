"""
VayuCoach Scheduled Mailer
Dispatches personalized daily morning briefings and weekly environmental digests.
"""

from datetime import datetime
from typing import Dict, Any, List, Optional
from app.config import settings
from app.models.schemas import EnvironmentalReadings
from app.services.email.smtp_client import send_email, SmtpDeliveryResult
from app.services.email.templates import (
    render_daily_report,
    render_weekly_summary
)
from app.services.email.preferences_service import get_or_create_preferences, is_user_subscribed
from app.services.email.deduplicator import generate_dedup_key, is_duplicate, mark_sent

async def send_daily_morning_briefing(
    user_id: str,
    user_name: str,
    recipient_email: str,
    city_name: str,
    readings: EnvironmentalReadings,
    optimal_window: str = "1:00 PM – 4:00 PM (Sea Breeze Peak)",
    daily_advice: Optional[str] = None
) -> Optional[SmtpDeliveryResult]:
    """Sends personalized morning air quality briefing based on user preferences."""
    if not is_user_subscribed(user_id, "daily_briefing"):
        return None

    # Date-based deduplication (at most 1 daily briefing per calendar day)
    today_str = datetime.utcnow().strftime("%Y-%m-%d")
    dedup_key = generate_dedup_key(user_id, "daily_briefing", today_str)
    if is_duplicate(dedup_key, window_hours=20):
        return None

    prefs = get_or_create_preferences(user_id, recipient_email)
    
    coastal_wind_note = (
        f"In {city_name}, morning continental land breezes typically concentrate fine particulates near ground level. "
        f"Convective mixing and onshore marine breezes accelerate after 1:00 PM, improving atmospheric dispersion."
    )
    
    advice = daily_advice or (
        f"Current particulate levels are {readings.indian_naqi_category}. "
        f"Plan outdoor sports and commuting during the afternoon clearing window. Keep windows cracked only between 1:00 PM and 4:30 PM."
    )

    rendered = render_daily_report(
        user_name=user_name,
        city_name=city_name,
        current_naqi=readings.indian_naqi,
        category=readings.indian_naqi_category,
        optimal_window=optimal_window,
        coastal_wind_note=coastal_wind_note,
        daily_advice=advice,
        unsubscribe_token=prefs["unsubscribe_token"]
    )

    result = await send_email(
        recipient_email=recipient_email,
        subject=rendered["subject"],
        html_content=rendered["html"],
        email_type="daily_report",
        user_id=user_id,
        unsubscribe_url=f"{settings.FRONTEND_URL}/api/notifications/unsubscribe?token={prefs['unsubscribe_token']}",
        dedup_key=dedup_key,
        metadata={"city": city_name, "date": today_str, "naqi": readings.indian_naqi}
    )

    if result.success:
        mark_sent(dedup_key)

    return result


async def send_weekly_summary_digest(
    user_id: str,
    user_name: str,
    recipient_email: str,
    city_name: str,
    clean_air_days: int = 5,
    avg_naqi: int = 48,
    total_dose_averted_ug: float = 142.0,
    top_insight: Optional[str] = None
) -> Optional[SmtpDeliveryResult]:
    """Sends 7-day environmental summary digest."""
    if not is_user_subscribed(user_id, "weekly_summary"):
        return None

    week_str = datetime.utcnow().strftime("%Y-W%U")
    dedup_key = generate_dedup_key(user_id, "weekly_summary", week_str)
    if is_duplicate(dedup_key, window_hours=140):
        return None

    prefs = get_or_create_preferences(user_id, recipient_email)
    insight = top_insight or (
        f"Shifting outdoor cardiovascular workouts from early dawn (6:00 AM) to late afternoon (3:30 PM) "
        f"reduced your personal fine particulate inhalation dose by ~38% this week."
    )

    rendered = render_weekly_summary(
        user_name=user_name,
        city_name=city_name,
        clean_air_days=clean_air_days,
        avg_naqi=avg_naqi,
        total_dose_averted_ug=total_dose_averted_ug,
        top_insight=insight,
        unsubscribe_token=prefs["unsubscribe_token"]
    )

    result = await send_email(
        recipient_email=recipient_email,
        subject=rendered["subject"],
        html_content=rendered["html"],
        email_type="weekly_summary",
        user_id=user_id,
        unsubscribe_url=f"{settings.FRONTEND_URL}/api/notifications/unsubscribe?token={prefs['unsubscribe_token']}",
        dedup_key=dedup_key,
        metadata={"week": week_str, "clean_air_days": clean_air_days}
    )

    if result.success:
        mark_sent(dedup_key)

    return result
