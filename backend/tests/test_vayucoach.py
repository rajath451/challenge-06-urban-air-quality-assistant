import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.services.data_normalizer import calculate_indian_naqi, calculate_us_aqi, assess_data_quality
from app.engines.decision_engine import generate_decisions
from app.engines.indoor_simulator import simulate_indoor_air
from app.engines.exposure_calculator import calculate_exposure
from app.engines.forecasting_engine import generate_24h_planner
from app.engines.uncertainty_engine import evaluate_uncertainty
from app.models.schemas import (
    EnvironmentalReadings, LocationInfo, IndoorSimulationRequest, ExposureRequest, PlannerRequest
)

client = TestClient(app)

# -------------------------------------------------------------
# 1. DATA NORMALIZER & STANDARDS TESTS
# -------------------------------------------------------------
def test_indian_naqi_breakpoints():
    # Good (0-30 µg/m³) -> 0-50
    aqi, cat, col = calculate_indian_naqi(15.0)
    assert aqi <= 50
    assert cat == "Good"

    # Satisfactory (31-60 µg/m³) -> 51-100
    aqi, cat, col = calculate_indian_naqi(45.0)
    assert 51 <= aqi <= 100
    assert cat == "Satisfactory"

    # Moderate (61-90 µg/m³) -> 101-200
    aqi, cat, col = calculate_indian_naqi(75.0)
    assert 101 <= aqi <= 200
    assert cat == "Moderate"

    # Poor (91-120 µg/m³) -> 201-300
    aqi, cat, col = calculate_indian_naqi(110.0)
    assert 201 <= aqi <= 300
    assert cat == "Poor"

def test_us_aqi_breakpoints():
    aqi, cat, col = calculate_us_aqi(8.0)
    assert aqi <= 50
    assert cat == "Good"

    aqi, cat, col = calculate_us_aqi(25.0)
    assert 51 <= aqi <= 100
    assert cat == "Moderate"

def test_data_quality_assessment():
    quality = assess_data_quality("2026-11-24T16:30:00Z")
    assert "age_minutes" in quality
    assert quality["is_acceptable_for_decision"] is True

# -------------------------------------------------------------
# 2. DECISION ENGINE DETERMINISTIC LOGIC TESTS
# -------------------------------------------------------------
def test_decision_engine_clean_air():
    readings = EnvironmentalReadings(
        pm2_5=18.0,
        pm10=24.0,
        indian_naqi=30,
        indian_naqi_category="Good",
        us_aqi=63,
        us_aqi_category="Moderate",
        temperature=29.0,
        relative_humidity=65.0,
        wind_speed=12.0,
        wind_direction=250.0,
        weather_condition="Clear",
        timestamp="2026-11-24T12:00:00Z",
        data_source="Test Feed",
        data_freshness_minutes=10,
        is_live=True
    )
    loc = LocationInfo()
    decisions = generate_decisions(readings, loc)
    
    assert len(decisions) >= 4
    # Exercise must be Recommended in Good NAQI
    exercise_dec = next(d for d in decisions if d.activity_type == "exercise")
    assert exercise_dec.recommendation == "Recommended"
    assert exercise_dec.recommendation_tier == "optimal"

    # Ventilation must be Recommended
    vent_dec = next(d for d in decisions if d.activity_type == "ventilation")
    assert vent_dec.recommendation == "Recommended"

def test_decision_engine_poor_air():
    readings = EnvironmentalReadings(
        pm2_5=115.0,
        pm10=180.0,
        indian_naqi=285,
        indian_naqi_category="Poor",
        us_aqi=182,
        us_aqi_category="Unhealthy",
        temperature=26.0,
        relative_humidity=70.0,
        wind_speed=4.0,
        wind_direction=45.0,
        weather_condition="Haze",
        timestamp="2026-11-24T08:00:00Z",
        data_source="Test Feed",
        data_freshness_minutes=15,
        is_live=True
    )
    loc = LocationInfo()
    decisions = generate_decisions(readings, loc)
    
    exercise_dec = next(d for d in decisions if d.activity_type == "exercise")
    assert exercise_dec.recommendation in ["Avoid / Postpone", "Modify Intensity/Time"]
    
    vent_dec = next(d for d in decisions if d.activity_type == "ventilation")
    assert vent_dec.recommendation == "Avoid / Postpone"

# -------------------------------------------------------------
# 3. HOMEBREATH VIRTUAL INDOOR SIMULATION TESTS
# -------------------------------------------------------------
def test_indoor_simulator():
    req = IndoorSimulationRequest(
        room_area_sqft=200.0,
        ceiling_height_ft=9.8,
        outdoor_pm2_5=25.0,
        cooking_activity="deep_frying_tadka",
        cooking_duration_minutes=20,
        mosquito_coil_count=1,
        incense_sticks_count=0,
        windows_open=False,
        exhaust_fan_on=False
    )
    res = simulate_indoor_air(req)
    
    assert res.peak_indoor_pm2_5 > res.baseline_indoor_pm2_5
    assert len(res.trajectory) > 20
    assert "counterfactual_scenario" in res.dict()
    assert "%" in res.counterfactual_scenario["reduction_percentage"]
    assert len(res.model_assumptions) >= 3

# -------------------------------------------------------------
# 4. RESPIRATORY DOSIMETRY & EXPOSURE TESTS
# -------------------------------------------------------------
def test_exposure_calculator():
    req = ExposureRequest(
        activity="jogging",
        duration_minutes=60,
        pm2_5_concentration=40.0,
        body_weight_kg=70.0,
        is_child=False
    )
    res = calculate_exposure(req)
    
    # 60 mins at 2.5 m³/h = 2.5 m³ air volume
    assert res.air_volume_inhaled_m3 == 2.5
    # 2.5 m³ * 40 µg/m³ = 100 µg
    assert res.inhaled_mass_micrograms == 100.0
    assert res.who_daily_budget_percentage > 50.0

# -------------------------------------------------------------
# 5. UNCERTAINTY ENGINE TESTS
# -------------------------------------------------------------
def test_uncertainty_engine():
    unc_fresh = evaluate_uncertainty(data_freshness_minutes=20, distance_km=3.0)
    assert unc_fresh["confidence_level"] in ["Higher confidence", "Moderate confidence"]

    unc_stale = evaluate_uncertainty(data_freshness_minutes=300, distance_km=25.0)
    assert unc_stale["confidence_level"] in ["Limited confidence", "Insufficient data"]

# -------------------------------------------------------------
# 6. FASTAPI ENDPOINTS INTEGRATION TESTS
# -------------------------------------------------------------
def test_health_endpoint():
    res = client.get("/api/health")
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "healthy"
    assert data["product"] == "VayuCoach"

def test_air_quality_current():
    res = client.get("/api/air-quality/current?lat=12.9141&lon=74.8560")
    assert res.status_code == 200
    data = res.json()
    assert "pm2_5" in data
    assert "indian_naqi" in data
    assert "temperature" in data

def test_transparency_endpoint():
    res = client.get("/api/transparency/status")
    assert res.status_code == 200
    data = res.json()
    assert "connected_apis" in data
    assert "data_taxonomy" in data


# -------------------------------------------------------------
# 7. AUTHENTICATION & RBAC SECURITY INTEGRATION TESTS
# -------------------------------------------------------------
def test_user_login_success():
    res = client.post("/api/auth/login", json={
        "email": "user@vayucoach.in",
        "password": "User@123"
    })
    assert res.status_code == 200
    data = res.json()
    assert "access_token" in data
    assert data["role"] == "user"
    assert data["user"]["email"] == "user@vayucoach.in"

def test_admin_login_success():
    res = client.post("/api/auth/login", json={
        "email": "admin@vayucoach.in",
        "password": "Admin@123"
    })
    assert res.status_code == 200
    data = res.json()
    assert "access_token" in data
    assert data["role"] == "admin"
    assert data["user"]["email"] == "admin@vayucoach.in"

def test_admin_rbac_boundary_enforcement():
    # 1. Unauthenticated request to /api/admin/overview should fail 401 or 403
    unauth_res = client.get("/api/admin/overview")
    assert unauth_res.status_code in [401, 403]

    # 2. Authenticated as standard citizen 'user'
    user_login = client.post("/api/auth/login", json={
        "email": "user@vayucoach.in",
        "password": "User@123"
    }).json()
    user_token = user_login["access_token"]

    forbidden_res = client.get(
        "/api/admin/overview",
        headers={"Authorization": f"Bearer {user_token}"}
    )
    assert forbidden_res.status_code == 403

    # 3. Authenticated as 'admin'
    admin_login = client.post("/api/auth/login", json={
        "email": "admin@vayucoach.in",
        "password": "Admin@123"
    }).json()
    admin_token = admin_login["access_token"]

    admin_res = client.get(
        "/api/admin/overview",
        headers={"Authorization": f"Bearer {admin_token}"}
    )
    assert admin_res.status_code == 200
    stats = admin_res.json()
    assert "total_users" in stats
    assert "primary_station" in stats

def test_admin_threshold_calibration_and_audit():
    admin_login = client.post("/api/auth/login", json={
        "email": "admin@vayucoach.in",
        "password": "Admin@123"
    }).json()
    admin_token = admin_login["access_token"]

    # Update thresholds
    update_res = client.post(
        "/api/admin/thresholds",
        headers={"Authorization": f"Bearer {admin_token}"},
        json={
            "pm25_caution_limit": 65.0,
            "pm25_severe_limit": 130.0,
            "enforce_emergency_lockdown": False,
            "advisory_note": "Test calibration trigger"
        }
    )
    assert update_res.status_code == 200

    # Verify audit log captures this action
    audit_res = client.get(
        "/api/admin/audit-logs",
        headers={"Authorization": f"Bearer {admin_token}"}
    )
    assert audit_res.status_code == 200
    logs = audit_res.json()
    assert len(logs) > 0
    assert any(log["event_type"].lower() == "admin_threshold_update" for log in logs)
