from fastapi import APIRouter, HTTPException, Depends, Query, BackgroundTasks
from fastapi.responses import HTMLResponse
from typing import Dict, Any, List, Optional
from pydantic import BaseModel, Field
from app.services.security import get_current_user
from app.services.email import (
    get_or_create_preferences,
    update_preferences,
    unsubscribe_by_token,
    get_delivery_logs
)

router = APIRouter(prefix="/api/notifications", tags=["Notification Preferences & Consent"])

class NotificationPreferencesUpdate(BaseModel):
    email_notifications_enabled: Optional[bool] = None
    categories: Optional[List[str]] = None
    preferred_report_time: Optional[str] = None
    preferred_location: Optional[str] = None
    preferred_lat: Optional[float] = None
    preferred_lon: Optional[float] = None

class UnsubscribeRequest(BaseModel):
    token: str

@router.get("/preferences")
async def get_my_preferences(current_user: dict = Depends(get_current_user)):
    """Retrieves current authenticated user's notification preferences."""
    prefs = get_or_create_preferences(current_user["id"], current_user["email"])
    return prefs

@router.post("/preferences")
async def update_my_preferences(
    payload: NotificationPreferencesUpdate,
    current_user: dict = Depends(get_current_user)
):
    """Updates user notification preferences (categories, daily report time, preferred city)."""
    updates = payload.dict(exclude_unset=True)
    updated = update_preferences(current_user["id"], updates)
    return {
        "status": "success",
        "message": "Notification preferences updated successfully.",
        "preferences": updated
    }

@router.get("/unsubscribe", response_class=HTMLResponse)
async def one_click_unsubscribe_get(token: str = Query(..., description="Unsubscribe token")):
    """
    CAN-SPAM / RFC 8058 One-Click Unsubscribe Endpoint.
    Does not require login; displays a clean confirmation page.
    """
    try:
        pref = unsubscribe_by_token(token)
        return f"""<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Unsubscribed — VayuCoach</title>
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <style>
    body {{ font-family: -apple-system, BlinkMacSystemFont, sans-serif; background: #f8fafc; padding: 40px 20px; color: #1e293b; text-align: center; }}
    .card {{ max-width: 480px; margin: 40px auto; background: #fff; padding: 32px; border-radius: 16px; border: 1px solid #e2e8f0; box-shadow: 0 4px 6px rgba(0,0,0,0.05); }}
    .btn {{ display: inline-block; margin-top: 20px; padding: 10px 20px; background: #047857; color: #fff; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 14px; }}
  </style>
</head>
<body>
  <div class="card">
    <div style="font-size: 40px; margin-bottom: 16px;">🌱</div>
    <h2 style="margin: 0 0 8px 0; color: #0f172a;">You Have Been Unsubscribed</h2>
    <p style="font-size: 14px; color: #64748b; line-height: 1.5;">
      You will no longer receive recurring air quality alerts or scheduled briefings for <strong>{pref['email']}</strong>.
    </p>
    <p style="font-size: 12px; color: #94a3b8; margin-top: 16px;">
      You can re-enable email notifications anytime inside your VayuCoach account settings.
    </p>
    <a href="/" class="btn">Return to VayuCoach Dashboard</a>
  </div>
</body>
</html>"""
    except Exception as e:
        return HTMLResponse(
            content=f"<h3>Unsubscribe Error</h3><p>{str(e)}</p>",
            status_code=400
        )

@router.post("/unsubscribe")
async def one_click_unsubscribe_post(payload: UnsubscribeRequest):
    """API endpoint for 1-click unsubscribe via JSON payload."""
    try:
        pref = unsubscribe_by_token(payload.token)
        return {
            "status": "success",
            "message": "Successfully unsubscribed from all email notifications.",
            "email": pref["email"]
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/logs")
async def get_my_email_logs(
    limit: int = Query(25, ge=1, le=100),
    current_user: dict = Depends(get_current_user)
):
    """Returns recent email delivery audit records for the authenticated user."""
    logs = get_delivery_logs(limit=limit, user_id=current_user["id"])
    return {"logs": logs, "count": len(logs)}
