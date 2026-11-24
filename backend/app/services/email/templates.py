"""
VayuCoach Responsive HTML Email Template Engine
Generates mobile-friendly, accessible, CAN-SPAM compliant transactional and advisory emails.
"""

from typing import Dict, Any, Optional
from app.config import settings

def _base_email_wrapper(
    title: str,
    preheader: str,
    content_html: str,
    unsubscribe_url: Optional[str] = None,
    preferences_url: Optional[str] = None
) -> str:
    """Wraps body content in a responsive, beautifully styled VayuCoach branded email shell."""
    unsub_link = unsubscribe_url or f"{settings.FRONTEND_URL}/?tab=preferences&unsub=default"
    pref_link = preferences_url or f"{settings.FRONTEND_URL}/?tab=preferences"
    
    return f"""<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{title}</title>
  <!--[if mso]>
  <noscript>
    <xml>
      <o:OfficeDocumentSettings>
        <o:PixelsPerInch>96</o:PixelsPerInch>
      </o:OfficeDocumentSettings>
    </xml>
  </noscript>
  <![endif]-->
  <style>
    body {{
      margin: 0;
      padding: 0;
      background-color: #f1f5f9;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      color: #1e293b;
      -webkit-font-smoothing: antialiased;
    }}
    table {{ border-collapse: collapse; }}
    a {{ color: #059669; text-decoration: none; font-weight: 600; }}
    .btn {{
      display: inline-block;
      padding: 12px 24px;
      background-color: #047857;
      color: #ffffff !important;
      font-weight: 600;
      font-size: 14px;
      text-decoration: none;
      border-radius: 8px;
      text-align: center;
    }}
    .badge {{
      display: inline-block;
      padding: 4px 10px;
      font-size: 11px;
      font-weight: 700;
      border-radius: 6px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }}
    @media only screen and (max-width: 600px) {{
      .container {{ width: 100% !important; }}
      .p-mobile {{ padding: 20px !important; }}
    }}
  </style>
</head>
<body style="margin: 0; padding: 24px 0; background-color: #f1f5f9;">
  <!-- Hidden preheader text for inbox preview -->
  <div style="display: none; max-height: 0px; overflow: hidden; mso-hide: all;">
    {preheader}
  </div>

  <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0">
    <tr>
      <td align="center" style="padding: 12px;">
        <table role="presentation" class="container" width="600" border="0" cellspacing="0" cellpadding="0" style="background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -2px rgba(0, 0, 0, 0.05); border: 1px solid #e2e8f0;">
          
          <!-- Header Bar -->
          <tr>
            <td style="background: linear-gradient(135deg, #064e3b 0%, #047857 50%, #0d9488 100%); padding: 24px 32px;">
              <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0">
                <tr>
                  <td>
                    <div style="font-size: 22px; font-weight: 800; color: #ffffff; letter-spacing: -0.5px;">
                      Vayu<span style="color: #6ee7b7;">Coach</span>
                    </div>
                    <div style="font-size: 11px; color: #a7f3d0; text-transform: uppercase; letter-spacing: 1px; font-weight: 600; margin-top: 2px;">
                      Decision Intelligence & Public Health
                    </div>
                  </td>
                  <td align="right">
                    <span style="font-family: monospace; font-size: 10px; color: #ecfdf5; background-color: rgba(255,255,255,0.15); padding: 4px 8px; border-radius: 6px; border: 1px solid rgba(255,255,255,0.2);">
                      CPCB NAQI STANDARD
                    </span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Main Body Content -->
          <tr>
            <td class="p-mobile" style="padding: 32px;">
              {content_html}
            </td>
          </tr>

          <!-- Footer & CAN-SPAM Compliance -->
          <tr>
            <td style="background-color: #f8fafc; padding: 24px 32px; border-top: 1px solid #e2e8f0; font-size: 12px; color: #64748b; line-height: 1.6;">
              <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0">
                <tr>
                  <td>
                    <p style="margin: 0 0 8px 0; font-weight: 600; color: #334155;">
                      VayuCoach — Environmental Decision Intelligence
                    </p>
                    <p style="margin: 0 0 12px 0;">
                      Station Core: Kadri Hills & Baikampady CAAQMS, Mangaluru, Karnataka, India.
                    </p>
                    <p style="margin: 0 0 12px 0; font-size: 11px; color: #94a3b8;">
                      You are receiving this email because you opted into environmental intelligence updates for your region. All environmental telemetry is grounded in certified Central Pollution Control Board (CPCB) standards.
                    </p>
                    <div style="font-size: 11px; color: #047857;">
                      <a href="{pref_link}" style="color: #047857; text-decoration: underline;">Notification Preferences</a>
                      &nbsp;•&nbsp;
                      <a href="{unsub_link}" style="color: #64748b; text-decoration: underline;">1-Click Unsubscribe</a>
                      &nbsp;•&nbsp;
                      <a href="{settings.FRONTEND_URL}/?tab=transparency" style="color: #64748b; text-decoration: underline;">Scientific Methodology</a>
                    </div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>"""


# -------------------------------------------------------------------------
# 1. WELCOME & EMAIL VERIFICATION TEMPLATE
# -------------------------------------------------------------------------
def render_welcome_verification(
    user_name: str,
    verification_token: str,
    unsubscribe_token: str
) -> Dict[str, str]:
    verify_url = f"{settings.FRONTEND_URL}/?verify_token={verification_token}"
    unsub_url = f"{settings.FRONTEND_URL}/api/notifications/unsubscribe?token={unsubscribe_token}"

    content = f"""
    <h1 style="font-size: 20px; font-weight: 700; color: #0f172a; margin: 0 0 12px 0;">
      Welcome to VayuCoach, {user_name}!
    </h1>
    <p style="font-size: 14px; line-height: 1.6; color: #334155; margin: 0 0 20px 0;">
      Thank you for creating an account on VayuCoach. Your personalized environmental decision engine is ready to protect you and your family from urban air pollution and severe winter smog.
    </p>

    <div style="background-color: #ecfdf5; border-left: 4px solid #059669; padding: 16px; border-radius: 0 8px 8px 0; margin-bottom: 24px;">
      <div style="font-size: 13px; font-weight: 700; color: #065f46; margin-bottom: 4px;">
        Action Required: Confirm Your Email Address
      </div>
      <div style="font-size: 12px; color: #047857; line-height: 1.5;">
        Please verify your email address to enable personalized morning air briefings, urgent AQI alerts, and customized respiratory sensitivity settings.
      </div>
    </div>

    <div style="text-align: center; margin: 28px 0;">
      <a href="{verify_url}" class="btn">
        Verify My Email Address
      </a>
    </div>

    <p style="font-size: 12px; color: #64748b; line-height: 1.5; margin: 24px 0 0 0;">
      Or copy and paste this verification URL into your browser:<br>
      <span style="font-family: monospace; color: #047857; word-break: break-all;">{verify_url}</span>
    </p>
    <p style="font-size: 11px; color: #94a3b8; margin-top: 8px;">
      This verification link will expire in {settings.TOKEN_VERIFICATION_EXPIRY_HOURS} hours.
    </p>
    """
    return {
        "subject": "Welcome to VayuCoach — Please Verify Your Email",
        "html": _base_email_wrapper("Welcome to VayuCoach", "Verify your email to activate environmental intelligence", content, unsub_url)
    }


# -------------------------------------------------------------------------
# 2. PASSWORD RESET TEMPLATE
# -------------------------------------------------------------------------
def render_password_reset(
    user_name: str,
    reset_token: str
) -> Dict[str, str]:
    reset_url = f"{settings.FRONTEND_URL}/?reset_token={reset_token}"

    content = f"""
    <h1 style="font-size: 20px; font-weight: 700; color: #0f172a; margin: 0 0 12px 0;">
      Password Reset Request
    </h1>
    <p style="font-size: 14px; line-height: 1.6; color: #334155; margin: 0 0 20px 0;">
      Hello {user_name}, we received a request to securely reset the password for your VayuCoach account.
    </p>

    <div style="background-color: #fffbeb; border-left: 4px solid #d97706; padding: 16px; border-radius: 0 8px 8px 0; margin-bottom: 24px;">
      <div style="font-size: 13px; font-weight: 700; color: #92400e; margin-bottom: 4px;">
        Security Notice
      </div>
      <div style="font-size: 12px; color: #b45309; line-height: 1.5;">
        This password reset link is single-use and will expire in {settings.TOKEN_PASSWORD_RESET_EXPIRY_HOURS} hour. If you did not make this request, you can safely ignore this email.
      </div>
    </div>

    <div style="text-align: center; margin: 28px 0;">
      <a href="{reset_url}" class="btn" style="background-color: #0f172a;">
        Reset My Password
      </a>
    </div>

    <p style="font-size: 12px; color: #64748b; line-height: 1.5; margin: 24px 0 0 0;">
      Direct reset link:<br>
      <span style="font-family: monospace; color: #334155; word-break: break-all;">{reset_url}</span>
    </p>
    """
    return {
        "subject": "VayuCoach Password Reset Request",
        "html": _base_email_wrapper("Reset Password", "Secure link to reset your VayuCoach account password", content)
    }


# -------------------------------------------------------------------------
# 3. URGENT AQI WARNING ALERT TEMPLATE (Grounding Validated Readings)
# -------------------------------------------------------------------------
def render_aqi_warning(
    user_name: str,
    city_name: str,
    indian_naqi: int,
    category: str,
    pm2_5: float,
    action_items: list,
    unsubscribe_token: str
) -> Dict[str, str]:
    unsub_url = f"{settings.FRONTEND_URL}/api/notifications/unsubscribe?token={unsubscribe_token}"
    
    # Severity Color
    if category in ("Very Poor", "Severe"):
        badge_bg = "#dc2626"
        badge_text = "#ffffff"
        callout_bg = "#fef2f2"
        callout_border = "#dc2626"
    elif category == "Poor":
        badge_bg = "#ea580c"
        badge_text = "#ffffff"
        callout_bg = "#fff7ed"
        callout_border = "#ea580c"
    else:
        badge_bg = "#d97706"
        badge_text = "#ffffff"
        callout_bg = "#fffbeb"
        callout_border = "#d97706"

    actions_html = "".join([f"<li style='margin-bottom: 8px; color: #334155;'><strong>{item}</strong></li>" for item in action_items])

    content = f"""
    <div style="display: inline-block; background-color: {badge_bg}; color: {badge_text}; padding: 6px 12px; border-radius: 6px; font-size: 12px; font-weight: 700; text-transform: uppercase; margin-bottom: 12px;">
      AQI Warning • {category} Condition
    </div>
    <h1 style="font-size: 22px; font-weight: 800; color: #0f172a; margin: 0 0 12px 0;">
      Elevated Air Pollution Alert in {city_name}
    </h1>
    <p style="font-size: 14px; line-height: 1.6; color: #334155; margin: 0 0 20px 0;">
      Dear {user_name}, physical ambient monitoring feeds in <strong>{city_name}</strong> have crossed your safety threshold. Particulate concentrations currently present heightened respiratory exposure risk.
    </p>

    <!-- Measured Environmental Metrics Grid -->
    <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="margin-bottom: 24px; background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden;">
      <tr>
        <td width="50%" style="padding: 16px; border-right: 1px solid #e2e8f0; text-align: center;">
          <div style="font-size: 11px; text-transform: uppercase; color: #64748b; font-weight: 600; margin-bottom: 4px;">Indian NAQI Index</div>
          <div style="font-size: 32px; font-weight: 800; color: {badge_bg}; font-family: monospace;">{indian_naqi}</div>
          <div style="font-size: 12px; font-weight: 700; color: {badge_bg};">{category}</div>
        </td>
        <td width="50%" style="padding: 16px; text-align: center;">
          <div style="font-size: 11px; text-transform: uppercase; color: #64748b; font-weight: 600; margin-bottom: 4px;">Measured PM2.5</div>
          <div style="font-size: 32px; font-weight: 800; color: #0f172a; font-family: monospace;">{pm2_5:.1f}</div>
          <div style="font-size: 12px; color: #64748b;">µg/m³ (Ambient)</div>
        </td>
      </tr>
    </table>

    <div style="background-color: {callout_bg}; border-left: 4px solid {callout_border}; padding: 16px; border-radius: 0 8px 8px 0; margin-bottom: 24px;">
      <div style="font-size: 13px; font-weight: 700; color: #0f172a; margin-bottom: 8px;">
        Immediate Health & Activity Directives:
      </div>
      <ul style="margin: 0; padding-left: 18px; font-size: 13px; line-height: 1.5;">
        {actions_html}
      </ul>
    </div>

    <div style="text-align: center; margin: 28px 0;">
      <a href="{settings.FRONTEND_URL}/?tab=decisions" class="btn">
        View Live Decision Dashboard
      </a>
    </div>
    """
    return {
        "subject": f"⚠️ Air Quality Alert: NAQI {indian_naqi} ({category}) in {city_name}",
        "html": _base_email_wrapper(f"Air Quality Alert ({city_name})", f"Urgent AQI {indian_naqi} warning for {city_name}", content, unsub_url)
    }


# -------------------------------------------------------------------------
# 4. PERSONALIZED DAILY MORNING AIR-QUALITY BRIEFING
# -------------------------------------------------------------------------
def render_daily_report(
    user_name: str,
    city_name: str,
    current_naqi: int,
    category: str,
    optimal_window: str,
    coastal_wind_note: str,
    daily_advice: str,
    unsubscribe_token: str
) -> Dict[str, str]:
    unsub_url = f"{settings.FRONTEND_URL}/api/notifications/unsubscribe?token={unsubscribe_token}"

    content = f"""
    <div style="font-size: 12px; font-weight: 700; color: #047857; text-transform: uppercase; margin-bottom: 6px;">
      🌅 Morning Environmental Briefing
    </div>
    <h1 style="font-size: 22px; font-weight: 800; color: #0f172a; margin: 0 0 8px 0;">
      Good Morning, {user_name}!
    </h1>
    <p style="font-size: 14px; line-height: 1.6; color: #334155; margin: 0 0 20px 0;">
      Here is your atmospheric forecast and daily activity timing for <strong>{city_name}</strong>.
    </p>

    <!-- Headline KPI Card -->
    <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px; margin-bottom: 24px;">
      <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0">
        <tr>
          <td>
            <div style="font-size: 11px; text-transform: uppercase; color: #64748b; font-weight: 600;">Current Baseline</div>
            <div style="font-size: 24px; font-weight: 800; color: #047857; font-family: monospace;">NAQI {current_naqi} • {category}</div>
          </td>
          <td align="right">
            <div style="font-size: 11px; text-transform: uppercase; color: #64748b; font-weight: 600;">Optimal Outdoor Window</div>
            <div style="font-size: 16px; font-weight: 700; color: #0f172a;">{optimal_window}</div>
          </td>
        </tr>
      </table>
    </div>

    <!-- Meteorological Insight -->
    <div style="background-color: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 12px; padding: 18px; margin-bottom: 24px;">
      <div style="font-size: 13px; font-weight: 700; color: #166534; margin-bottom: 6px;">
        Coastal Boundary Layer & Dispersion Dynamics
      </div>
      <p style="font-size: 13px; color: #15803d; line-height: 1.5; margin: 0;">
        {coastal_wind_note}
      </p>
    </div>

    <!-- Personalized Daily Plan -->
    <div style="margin-bottom: 24px;">
      <h3 style="font-size: 15px; font-weight: 700; color: #0f172a; margin: 0 0 10px 0;">
        Your Personalized Daily Recommendation
      </h3>
      <p style="font-size: 13px; line-height: 1.6; color: #334155; margin: 0;">
        {daily_advice}
      </p>
    </div>

    <div style="text-align: center; margin: 28px 0;">
      <a href="{settings.FRONTEND_URL}/?tab=planner" class="btn">
        Open 24-Hour Timing Planner
      </a>
    </div>
    """
    return {
        "subject": f"🌤️ Morning Air Briefing for {city_name}: NAQI {current_naqi} ({category})",
        "html": _base_email_wrapper(f"Morning Air Briefing — {city_name}", f"Your daily air quality forecast and best outdoor hours for {city_name}", content, unsub_url)
    }


# -------------------------------------------------------------------------
# 5. ACTIVITY RECOMMENDATION ALERT
# -------------------------------------------------------------------------
def render_activity_alert(
    user_name: str,
    activity_name: str,
    status: str,
    reason: str,
    alternative_suggestion: str,
    unsubscribe_token: str
) -> Dict[str, str]:
    unsub_url = f"{settings.FRONTEND_URL}/api/notifications/unsubscribe?token={unsubscribe_token}"

    content = f"""
    <div style="font-size: 12px; font-weight: 700; color: #0369a1; text-transform: uppercase; margin-bottom: 6px;">
      🏃 Fitness & Routine Recommendation
    </div>
    <h1 style="font-size: 20px; font-weight: 700; color: #0f172a; margin: 0 0 12px 0;">
      Activity Advisory: {activity_name}
    </h1>
    <p style="font-size: 14px; line-height: 1.6; color: #334155; margin: 0 0 20px 0;">
      Hi {user_name}, based on your sensitivity profile and real-time particulate load, our Decision Engine has generated this targeted activity advisory.
    </p>

    <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px; margin-bottom: 24px;">
      <div style="font-size: 12px; text-transform: uppercase; color: #64748b; font-weight: 600;">Evaluation Result</div>
      <div style="font-size: 18px; font-weight: 800; color: #0f172a; margin: 4px 0 10px 0;">{status}</div>
      <p style="font-size: 13px; color: #475569; margin: 0 0 12px 0; line-height: 1.5;">{reason}</p>
      
      <div style="border-top: 1px solid #e2e8f0; padding-top: 12px;">
        <span style="font-size: 12px; font-weight: 700; color: #047857;">Suggested Alternative:</span>
        <p style="font-size: 13px; color: #065f46; margin: 4px 0 0 0; font-weight: 500;">{alternative_suggestion}</p>
      </div>
    </div>

    <div style="text-align: center; margin: 24px 0;">
      <a href="{settings.FRONTEND_URL}/?tab=decisions" class="btn">
        Explore Activity Replacements
      </a>
    </div>
    """
    return {
        "subject": f"Activity Advisory: {status} for {activity_name}",
        "html": _base_email_wrapper("Activity Advisory", f"Air-quality recommendation for {activity_name}", content, unsub_url)
    }


# -------------------------------------------------------------------------
# 6. WEEKLY ENVIRONMENTAL SUMMARY TEMPLATE
# -------------------------------------------------------------------------
def render_weekly_summary(
    user_name: str,
    city_name: str,
    clean_air_days: int,
    avg_naqi: int,
    total_dose_averted_ug: float,
    top_insight: str,
    unsubscribe_token: str
) -> Dict[str, str]:
    unsub_url = f"{settings.FRONTEND_URL}/api/notifications/unsubscribe?token={unsubscribe_token}"

    content = f"""
    <div style="font-size: 12px; font-weight: 700; color: #047857; text-transform: uppercase; margin-bottom: 6px;">
      📊 Weekly Retrospective
    </div>
    <h1 style="font-size: 22px; font-weight: 800; color: #0f172a; margin: 0 0 12px 0;">
      Your 7-Day Air Intelligence Digest
    </h1>
    <p style="font-size: 14px; line-height: 1.6; color: #334155; margin: 0 0 24px 0;">
      Hello {user_name}, here is your weekly summary of ambient air quality trends and personal exposure mitigation in <strong>{city_name}</strong>.
    </p>

    <!-- 3-Column Stats -->
    <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="margin-bottom: 24px; background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden;">
      <tr>
        <td width="33%" style="padding: 16px; text-align: center; border-right: 1px solid #e2e8f0;">
          <div style="font-size: 10px; text-transform: uppercase; color: #64748b; font-weight: 700;">Clean Air Days</div>
          <div style="font-size: 24px; font-weight: 800; color: #059669; font-family: monospace; margin: 4px 0;">{clean_air_days} / 7</div>
          <div style="font-size: 11px; color: #64748b;">Good / Satisfactory</div>
        </td>
        <td width="34%" style="padding: 16px; text-align: center; border-right: 1px solid #e2e8f0;">
          <div style="font-size: 10px; text-transform: uppercase; color: #64748b; font-weight: 700;">7-Day Mean NAQI</div>
          <div style="font-size: 24px; font-weight: 800; color: #0f172a; font-family: monospace; margin: 4px 0;">{avg_naqi}</div>
          <div style="font-size: 11px; color: #64748b;">Coastal Average</div>
        </td>
        <td width="33%" style="padding: 16px; text-align: center;">
          <div style="font-size: 10px; text-transform: uppercase; color: #64748b; font-weight: 700;">Dose Averted</div>
          <div style="font-size: 24px; font-weight: 800; color: #047857; font-family: monospace; margin: 4px 0;">{total_dose_averted_ug:.0f} µg</div>
          <div style="font-size: 11px; color: #64748b;">By Timing Workouts</div>
        </td>
      </tr>
    </table>

    <div style="background-color: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 12px; padding: 18px; margin-bottom: 24px;">
      <div style="font-size: 13px; font-weight: 700; color: #166534; margin-bottom: 4px;">
        Key Pattern Identified
      </div>
      <p style="font-size: 13px; color: #15803d; line-height: 1.5; margin: 0;">
        {top_insight}
      </p>
    </div>

    <div style="text-align: center; margin: 28px 0;">
      <a href="{settings.FRONTEND_URL}/?tab=exposure" class="btn">
        View Full Exposure Analytics
      </a>
    </div>
    """
    return {
        "subject": f"📊 Your Weekly Air Quality Summary — {clean_air_days} Clean Air Days in {city_name}",
        "html": _base_email_wrapper("Weekly Environmental Summary", "Your 7-day environmental exposure review", content, unsub_url)
    }


# -------------------------------------------------------------------------
# 7. ADMINISTRATOR TEST EMAIL TEMPLATE
# -------------------------------------------------------------------------
def render_admin_test(
    admin_name: str,
    smtp_provider: str,
    smtp_host: str,
    smtp_port: int,
    sender_email: str
) -> Dict[str, str]:
    content = f"""
    <div style="font-size: 12px; font-weight: 700; color: #4338ca; text-transform: uppercase; margin-bottom: 6px;">
      🛠️ System Administrator Test
    </div>
    <h1 style="font-size: 20px; font-weight: 800; color: #0f172a; margin: 0 0 12px 0;">
      Centralized SMTP Relay Test
    </h1>
    <p style="font-size: 14px; line-height: 1.6; color: #334155; margin: 0 0 20px 0;">
      Hello {admin_name}, this test email confirms that your VayuCoach centralized SMTP notification subsystem is functioning properly.
    </p>

    <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 16px; margin-bottom: 20px; font-size: 13px;">
      <tr>
        <td style="padding: 6px 0; color: #64748b;">Configured Provider:</td>
        <td style="padding: 6px 0; font-weight: 700; color: #0f172a; font-family: monospace;">{smtp_provider}</td>
      </tr>
      <tr>
        <td style="padding: 6px 0; color: #64748b;">SMTP Relay Host:</td>
        <td style="padding: 6px 0; font-weight: 700; color: #0f172a; font-family: monospace;">{smtp_host}:{smtp_port}</td>
      </tr>
      <tr>
        <td style="padding: 6px 0; color: #64748b;">Verified Sender Address:</td>
        <td style="padding: 6px 0; font-weight: 700; color: #047857; font-family: monospace;">{sender_email}</td>
      </tr>
      <tr>
        <td style="padding: 6px 0; color: #64748b;">Template Rendering:</td>
        <td style="padding: 6px 0; font-weight: 700; color: #059669;">Verified (Responsive HTML + Inline CSS)</td>
      </tr>
    </table>

    <div style="background-color: #eff6ff; border-left: 4px solid #3b82f6; padding: 14px; border-radius: 0 8px 8px 0;">
      <div style="font-size: 12px; color: #1e40af; line-height: 1.5;">
        All user notifications (Welcome, AQI Warning Alerts, Daily Briefings, Password Resets) are routed through this centralized relay without exposing server credentials to client frontends.
      </div>
    </div>
    """
    return {
        "subject": "✅ VayuCoach SMTP System Test: Relay Operational",
        "html": _base_email_wrapper("SMTP Test Email", "VayuCoach Centralized SMTP Relay Test", content)
    }
