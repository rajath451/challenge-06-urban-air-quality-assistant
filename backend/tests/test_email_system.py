import pytest
import asyncio
from datetime import datetime, timedelta
from fastapi.testclient import TestClient
from app.main import app
from app.config import settings
from app.models.schemas import EnvironmentalReadings
from app.services.email import (
    send_email,
    get_delivery_logs,
    render_welcome_verification,
    render_password_reset,
    render_aqi_warning,
    render_daily_report,
    render_activity_alert,
    render_weekly_summary,
    render_admin_test,
    get_or_create_preferences,
    update_preferences,
    unsubscribe_by_token,
    is_user_subscribed,
    issue_verification_token,
    verify_email_token,
    issue_password_reset_token,
    verify_password_reset_token,
    send_welcome_and_verification,
    send_password_reset,
    send_aqi_warning_alert,
    send_daily_morning_briefing,
    send_weekly_summary_digest,
    generate_dedup_key,
    is_duplicate,
    mark_sent,
    clear_dedup_cache
)

client = TestClient(app)

@pytest.fixture
def anyio_backend():
    return 'asyncio'

# -------------------------------------------------------------
# 1. TEMPLATE ENGINE & CAN-SPAM COMPLIANCE TESTS
# -------------------------------------------------------------
def test_all_templates_render_valid_html():
    # 1. Welcome & Verification
    w = render_welcome_verification("Test User", "test-token-123", "unsub-token-abc")
    assert "Test User" in w["html"]
    assert "test-token-123" in w["html"]
    assert "unsubscribe" in w["html"].lower()
    assert "subject" in w

    # 2. Password Reset
    pr = render_password_reset("Test User", "reset-token-xyz")
    assert "reset-token-xyz" in pr["html"]
    assert "Password Reset" in pr["subject"]

    # 3. AQI Warning
    aqi = render_aqi_warning(
        user_name="Test Citizen",
        city_name="Mangaluru",
        indian_naqi=165,
        category="Moderate",
        pm2_5=78.2,
        action_items=["Wear N95 mask outdoors", "Keep windows closed"],
        unsubscribe_token="unsub-123"
    )
    assert "165" in aqi["html"]
    assert "Moderate" in aqi["html"]
    assert "78.2" in aqi["html"]
    assert "Wear N95 mask" in aqi["html"]

    # 4. Daily Morning Briefing
    db = render_daily_report(
        user_name="Test Citizen",
        city_name="Mangaluru",
        current_naqi=45,
        category="Good",
        optimal_window="1:00 PM – 4:00 PM",
        coastal_wind_note="Sea breeze active",
        daily_advice="Great air for outdoor running",
        unsubscribe_token="unsub-123"
    )
    assert "NAQI 45" in db["html"]
    assert "1:00 PM – 4:00 PM" in db["html"]

    # 5. Activity Alert
    act = render_activity_alert(
        user_name="Runner",
        activity_name="Morning Sprint",
        status="Avoid / Postpone",
        reason="Inversion layer elevated PM2.5",
        alternative_suggestion="Indoor treadmill session",
        unsubscribe_token="unsub-123"
    )
    assert "Morning Sprint" in act["html"]
    assert "Indoor treadmill session" in act["html"]

    # 6. Weekly Summary
    ws = render_weekly_summary(
        user_name="Citizen",
        city_name="Mangaluru",
        clean_air_days=5,
        avg_naqi=42,
        total_dose_averted_ug=120.0,
        top_insight="Afternoon workouts reduced particulate dose",
        unsubscribe_token="unsub-123"
    )
    assert "5 / 7" in ws["html"]
    assert "120 µg" in ws["html"]

    # 7. Admin Test Email
    adm = render_admin_test(
        admin_name="Dr. Prathima",
        smtp_provider="Brevo",
        smtp_host="smtp-relay.brevo.com",
        smtp_port=587,
        sender_email="notifications@vayucoach.in"
    )
    assert "smtp-relay.brevo.com:587" in adm["html"]
    assert "notifications@vayucoach.in" in adm["html"]


# -------------------------------------------------------------
# 2. TOKEN SECURITY & EXPIRATION TESTS
# -------------------------------------------------------------
def test_email_verification_token_lifecycle():
    token = issue_verification_token("user-test-lifecycle", "lifecycle@vayucoach.in")
    assert len(token) > 20

    # 1. Successful verification
    record = verify_email_token(token)
    assert record["email"] == "lifecycle@vayucoach.in"
    assert record["consumed"] is True

    # 2. Single-use enforcement (re-verifying must fail)
    with pytest.raises(ValueError, match="already been used"):
        verify_email_token(token)

def test_password_reset_token_lifecycle():
    token = issue_password_reset_token("user-reset-lifecycle", "reset@vayucoach.in")
    assert len(token) > 20

    # 1. Successful consumption
    record = verify_password_reset_token(token)
    assert record["email"] == "reset@vayucoach.in"
    assert record["consumed"] is True

    # 2. Single-use enforcement
    with pytest.raises(ValueError, match="already been used"):
        verify_password_reset_token(token)


# -------------------------------------------------------------
# 3. NOTIFICATION PREFERENCES & 1-CLICK UNSUBSCRIBE
# -------------------------------------------------------------
def test_preferences_and_one_click_unsubscribe():
    uid = "test-unsub-user-001"
    email = "unsub_test@vayucoach.in"
    
    prefs = get_or_create_preferences(uid, email)
    assert prefs["email_notifications_enabled"] is True
    assert "aqi_alerts" in prefs["categories"]

    # Update preferences
    updated = update_preferences(uid, {
        "categories": ["aqi_alerts", "daily_briefing"],
        "preferred_report_time": "08:00"
    })
    assert updated["preferred_report_time"] == "08:00"
    assert is_user_subscribed(uid, "aqi_alerts") is True
    assert is_user_subscribed(uid, "weekly_summary") is False

    # Perform 1-click unsubscribe
    token = prefs["unsubscribe_token"]
    unsub_res = unsubscribe_by_token(token)
    assert unsub_res["email_notifications_enabled"] is False
    assert is_user_subscribed(uid, "aqi_alerts") is False


# -------------------------------------------------------------
# 4. ALERT DEDUPLICATION ENGINE TESTS
# -------------------------------------------------------------
def test_alert_deduplication():
    clear_dedup_cache()
    key = generate_dedup_key("user-1", "aqi_warning", "Moderate:Mangaluru")
    
    # Initially not a duplicate
    assert is_duplicate(key) is False
    
    # Mark sent
    mark_sent(key)
    
    # Must now be detected as duplicate within cooldown
    assert is_duplicate(key) is True

    # Different key must not be duplicate
    diff_key = generate_dedup_key("user-1", "aqi_warning", "Severe:Mangaluru")
    assert is_duplicate(diff_key) is False


# -------------------------------------------------------------
# 5. ASYNC SMTP DISPATCH & DELIVERY LOGGING
# -------------------------------------------------------------
@pytest.mark.anyio
async def test_async_smtp_send_and_logging():
    res = await send_email(
        recipient_email="evaluator@vayucoach.in",
        subject="Test Dispatch",
        html_content="<p>Test Content</p>",
        email_type="test_email",
        user_id="usr-evaluator"
    )
    assert res.success is True
    assert res.status in ["SENT", "QUEUED"]
    assert res.message_id != ""

    # Verify log was created
    logs = get_delivery_logs(limit=10, recipient_email="evaluator@vayucoach.in")
    assert len(logs) > 0
    assert logs[0]["email_type"] == "test_email"


# -------------------------------------------------------------
# 6. VALIDATED PHYSICAL DATA GROUNDING IN ALERTS
# -------------------------------------------------------------
@pytest.mark.anyio
async def test_aqi_warning_requires_validated_data():
    clear_dedup_cache()
    uid = "usr-grounding-test"
    email = "grounding@vayucoach.in"
    get_or_create_preferences(uid, email)

    # Clean air (NAQI 35) should not trigger warning
    clean_readings = EnvironmentalReadings(
        pm2_5=12.0, pm10=20.0, indian_naqi=35, indian_naqi_category="Good",
        us_aqi=45, us_aqi_category="Good", temperature=28.0, relative_humidity=65.0,
        wind_speed=10.0, wind_direction=240.0, weather_condition="Clear",
        timestamp="2026-11-24T12:00:00Z", data_source="Validated",
        data_freshness_minutes=10, is_live=True
    )
    res_clean = await send_aqi_warning_alert(uid, "Grounding User", email, "Mangaluru", clean_readings, threshold_aqi=100)
    assert res_clean is None

    # Elevated air (NAQI 175) should trigger warning
    elevated_readings = EnvironmentalReadings(
        pm2_5=85.0, pm10=140.0, indian_naqi=175, indian_naqi_category="Moderate",
        us_aqi=162, us_aqi_category="Unhealthy", temperature=27.0, relative_humidity=70.0,
        wind_speed=4.0, wind_direction=45.0, weather_condition="Haze",
        timestamp="2026-11-24T12:00:00Z", data_source="Validated",
        data_freshness_minutes=10, is_live=True
    )
    res_elevated = await send_aqi_warning_alert(uid, "Grounding User", email, "Mangaluru", elevated_readings, threshold_aqi=100)
    assert res_elevated is not None
    assert res_elevated.success is True

    # Immediate duplicate attempt should be suppressed
    res_dup = await send_aqi_warning_alert(uid, "Grounding User", email, "Mangaluru", elevated_readings, threshold_aqi=100)
    assert res_dup is None


# -------------------------------------------------------------
# 7. FASTAPI API INTEGRATION TESTS
# -------------------------------------------------------------
def test_notification_endpoints():
    # Login as citizen
    login_res = client.post("/api/auth/login", json={
        "email": "user@vayucoach.in",
        "password": "User@123"
    }).json()
    token = login_res["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # 1. GET preferences
    prefs_res = client.get("/api/notifications/preferences", headers=headers)
    assert prefs_res.status_code == 200
    data = prefs_res.json()
    assert "categories" in data
    assert "unsubscribe_token" in data

    # 2. POST update preferences
    update_res = client.post(
        "/api/notifications/preferences",
        headers=headers,
        json={
            "preferred_report_time": "06:00",
            "preferred_location": "Mangaluru Kadri"
        }
    )
    assert update_res.status_code == 200
    assert update_res.json()["preferences"]["preferred_report_time"] == "06:00"

    # 3. GET user delivery logs
    logs_res = client.get("/api/notifications/logs", headers=headers)
    assert logs_res.status_code == 200
    assert "logs" in logs_res.json()

    # 4. 1-Click Unsubscribe HTML Endpoint
    unsub_token = data["unsubscribe_token"]
    unsub_res = client.get(f"/api/notifications/unsubscribe?token={unsub_token}")
    assert unsub_res.status_code == 200
    assert "Unsubscribed" in unsub_res.text

def test_admin_email_endpoints():
    # Login as admin
    login_res = client.post("/api/auth/login", json={
        "email": "admin@vayucoach.in",
        "password": "Admin@123"
    }).json()
    token = login_res["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # 1. GET SMTP status
    status_res = client.get("/api/admin/email/status", headers=headers)
    assert status_res.status_code == 200
    s_data = status_res.json()
    assert "smtp_host" in s_data
    assert "smtp_from_email" in s_data

    # 2. POST admin test email
    test_res = client.post(
        "/api/admin/email/test",
        headers=headers,
        json={
            "recipient_email": "evaluator.admin@vayucoach.in",
            "template_type": "admin_test"
        }
    )
    assert test_res.status_code == 200
    assert test_res.json()["status"] == "success"

    # 3. GET all email logs
    all_logs_res = client.get("/api/admin/email/logs", headers=headers)
    assert all_logs_res.status_code == 200
    assert len(all_logs_res.json()["logs"]) > 0

    # 4. POST trigger daily briefing
    daily_res = client.post("/api/admin/email/trigger-daily", headers=headers)
    assert daily_res.status_code == 200
    assert "dispatched_count" in daily_res.json()
