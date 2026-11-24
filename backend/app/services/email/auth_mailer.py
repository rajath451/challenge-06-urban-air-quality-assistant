"""
VayuCoach Authentication Mailer
Handles welcome emails, email verification, and single-use password reset tokens with expiration.
"""

import secrets
from datetime import datetime, timedelta
from typing import Dict, Any, Optional
from app.config import settings
from app.services.email.smtp_client import send_email, SmtpDeliveryResult
from app.services.email.templates import (
    render_welcome_verification,
    render_password_reset
)
from app.services.email.preferences_service import get_or_create_preferences

# In-memory security tokens store: maps token -> token metadata
SECURITY_TOKENS_DB: Dict[str, Dict[str, Any]] = {}

def issue_verification_token(user_id: str, email: str) -> str:
    """Issues a secure URL-safe verification token expiring in 24 hours."""
    token = secrets.token_urlsafe(32)
    expires_at = datetime.utcnow() + timedelta(hours=settings.TOKEN_VERIFICATION_EXPIRY_HOURS)
    SECURITY_TOKENS_DB[token] = {
        "token": token,
        "user_id": user_id,
        "email": email,
        "token_type": "email_verification",
        "expires_at": expires_at,
        "consumed": False,
        "created_at": datetime.utcnow()
    }
    return token


def verify_email_token(token: str) -> Dict[str, Any]:
    """Validates and consumes an email verification token."""
    token_record = SECURITY_TOKENS_DB.get(token)
    if not token_record:
        raise ValueError("Invalid verification token.")
    
    if token_record["token_type"] != "email_verification":
        raise ValueError("Token is not an email verification token.")
    
    if token_record["consumed"]:
        raise ValueError("This verification token has already been used.")
    
    if datetime.utcnow() > token_record["expires_at"]:
        raise ValueError("Verification token has expired. Please request a new one.")
    
    token_record["consumed"] = True
    token_record["consumed_at"] = datetime.utcnow()
    return token_record


def issue_password_reset_token(user_id: str, email: str) -> str:
    """Issues a secure single-use password reset token expiring in 1 hour."""
    token = secrets.token_urlsafe(32)
    expires_at = datetime.utcnow() + timedelta(hours=settings.TOKEN_PASSWORD_RESET_EXPIRY_HOURS)
    SECURITY_TOKENS_DB[token] = {
        "token": token,
        "user_id": user_id,
        "email": email,
        "token_type": "password_reset",
        "expires_at": expires_at,
        "consumed": False,
        "created_at": datetime.utcnow()
    }
    return token


def verify_password_reset_token(token: str) -> Dict[str, Any]:
    """Validates and consumes a password reset token."""
    token_record = SECURITY_TOKENS_DB.get(token)
    if not token_record:
        raise ValueError("Invalid password reset token.")
    
    if token_record["token_type"] != "password_reset":
        raise ValueError("Token is not a password reset token.")
    
    if token_record["consumed"]:
        raise ValueError("This password reset token has already been used.")
    
    if datetime.utcnow() > token_record["expires_at"]:
        raise ValueError("Password reset token has expired. Please request a new one.")
    
    token_record["consumed"] = True
    token_record["consumed_at"] = datetime.utcnow()
    return token_record


async def send_welcome_and_verification(
    user_id: str,
    user_name: str,
    recipient_email: str
) -> SmtpDeliveryResult:
    """Dispatches branded welcome email with embedded verification token."""
    v_token = issue_verification_token(user_id, recipient_email)
    prefs = get_or_create_preferences(user_id, recipient_email)
    
    rendered = render_welcome_verification(
        user_name=user_name,
        verification_token=v_token,
        unsubscribe_token=prefs["unsubscribe_token"]
    )
    
    return await send_email(
        recipient_email=recipient_email,
        subject=rendered["subject"],
        html_content=rendered["html"],
        email_type="welcome_verification",
        user_id=user_id,
        unsubscribe_url=f"{settings.FRONTEND_URL}/api/notifications/unsubscribe?token={prefs['unsubscribe_token']}",
        metadata={"verification_token": v_token}
    )


async def send_password_reset(
    user_id: str,
    user_name: str,
    recipient_email: str
) -> SmtpDeliveryResult:
    """Dispatches secure password reset email."""
    r_token = issue_password_reset_token(user_id, recipient_email)
    
    rendered = render_password_reset(
        user_name=user_name,
        reset_token=r_token
    )
    
    return await send_email(
        recipient_email=recipient_email,
        subject=rendered["subject"],
        html_content=rendered["html"],
        email_type="password_reset",
        user_id=user_id,
        metadata={"reset_token": r_token}
    )
