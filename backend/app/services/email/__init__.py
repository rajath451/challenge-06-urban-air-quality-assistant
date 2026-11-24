from app.services.email.smtp_client import (
    send_email,
    get_delivery_logs,
    SmtpDeliveryResult
)
from app.services.email.templates import (
    render_welcome_verification,
    render_password_reset,
    render_aqi_warning,
    render_daily_report,
    render_activity_alert,
    render_weekly_summary,
    render_admin_test
)
from app.services.email.preferences_service import (
    get_or_create_preferences,
    update_preferences,
    unsubscribe_by_token,
    is_user_subscribed,
    PREFERENCES_DB
)
from app.services.email.auth_mailer import (
    issue_verification_token,
    verify_email_token,
    issue_password_reset_token,
    verify_password_reset_token,
    send_welcome_and_verification,
    send_password_reset
)
from app.services.email.alert_mailer import (
    send_aqi_warning_alert,
    send_activity_advisory_alert
)
from app.services.email.scheduled_mailer import (
    send_daily_morning_briefing,
    send_weekly_summary_digest
)
from app.services.email.deduplicator import (
    generate_dedup_key,
    is_duplicate,
    mark_sent,
    clear_dedup_cache
)

__all__ = [
    "send_email",
    "get_delivery_logs",
    "SmtpDeliveryResult",
    "render_welcome_verification",
    "render_password_reset",
    "render_aqi_warning",
    "render_daily_report",
    "render_activity_alert",
    "render_weekly_summary",
    "render_admin_test",
    "get_or_create_preferences",
    "update_preferences",
    "unsubscribe_by_token",
    "is_user_subscribed",
    "issue_verification_token",
    "verify_email_token",
    "issue_password_reset_token",
    "verify_password_reset_token",
    "send_welcome_and_verification",
    "send_password_reset",
    "send_aqi_warning_alert",
    "send_activity_advisory_alert",
    "send_daily_morning_briefing",
    "send_weekly_summary_digest",
    "generate_dedup_key",
    "is_duplicate",
    "mark_sent",
    "clear_dedup_cache",
]
