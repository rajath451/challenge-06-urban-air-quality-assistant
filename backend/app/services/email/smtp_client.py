"""
VayuCoach Centralized SMTP Client
Implements:
- Async/Threaded SMTP dispatch via standard library smtplib
- Automatic TLS/SSL negotiation (Brevo, SendGrid, Amazon SES, or custom relay)
- Exponential backoff retry logic (up to 3 attempts)
- Rate limiting per recipient per hour
- Immutable in-memory & database-ready delivery status logs
- CAN-SPAM compliant headers (List-Unsubscribe, From, Message-ID)
- Graceful test/mock fallback mode when credentials are blank
"""

import os
import smtplib
import ssl
import asyncio
import uuid
import time
import email
import email.utils
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from datetime import datetime, timedelta
from typing import Dict, Any, List, Optional
from app.config import settings

# In-memory delivery log store (synchronizable with Supabase email_delivery_logs table)
EMAIL_DELIVERY_LOGS: List[Dict[str, Any]] = []

# Rate limiting registry: maps recipient email -> list of timestamps
RATE_LIMIT_STORE: Dict[str, List[float]] = {}

class SmtpDeliveryResult:
    def __init__(
        self,
        success: bool,
        message_id: str,
        recipient: str,
        status: str,
        error: Optional[str] = None,
        retries: int = 0
    ):
        self.success = success
        self.message_id = message_id
        self.recipient = recipient
        self.status = status
        self.error = error
        self.retries = retries

    def to_dict(self) -> Dict[str, Any]:
        return {
            "success": self.success,
            "message_id": self.message_id,
            "recipient": self.recipient,
            "status": self.status,
            "error": self.error,
            "retries": self.retries
        }


def _check_rate_limit(recipient: str) -> bool:
    """Verifies that recipient has not exceeded MAX_EMAILS_PER_USER_PER_HOUR within rolling 60 minutes."""
    now = time.time()
    one_hour_ago = now - 3600
    
    # Prune old timestamps
    timestamps = [ts for ts in RATE_LIMIT_STORE.get(recipient, []) if ts > one_hour_ago]
    RATE_LIMIT_STORE[recipient] = timestamps
    
    if len(timestamps) >= settings.MAX_EMAILS_PER_USER_PER_HOUR:
        return False # Rate limit exceeded
    
    return True


def _record_rate_limit(recipient: str):
    RATE_LIMIT_STORE.setdefault(recipient, []).append(time.time())


def _build_mime_message(
    recipient_email: str,
    subject: str,
    html_content: str,
    text_content: Optional[str] = None,
    unsubscribe_url: Optional[str] = None
) -> MIMEMultipart:
    msg = MIMEMultipart("alternative")
    msg["Subject"] = subject
    msg["From"] = f"{settings.SMTP_FROM_NAME} <{settings.SMTP_FROM_EMAIL}>"
    msg["To"] = recipient_email
    msg["Date"] = email.utils.formatdate(localtime=True) if hasattr(email, 'utils') else datetime.utcnow().strftime("%a, %d %b %Y %H:%M:%S +0000")
    message_id = f"<{uuid.uuid4()}@{settings.SMTP_FROM_EMAIL.split('@')[-1]}>"
    msg["Message-ID"] = message_id
    
    # CAN-SPAM / RFC 8058 One-Click List-Unsubscribe Header
    if unsubscribe_url:
        msg["List-Unsubscribe"] = f"<{unsubscribe_url}>"
        msg["List-Unsubscribe-Post"] = "List-Unsubscribe=One-Click"
    
    # Plain text fallback
    plain_text = text_content or "Please view this email in an HTML-compatible client to see your VayuCoach air quality intelligence."
    msg.attach(MIMEText(plain_text, "plain", "utf-8"))
    msg.attach(MIMEText(html_content, "html", "utf-8"))
    
    return msg


def _send_sync_smtp(
    recipient_email: str,
    mime_message: MIMEMultipart
) -> SmtpDeliveryResult:
    """Synchronous SMTP worker with TLS/SSL negotiation and retry backoff."""
    msg_id = mime_message.get("Message-ID", str(uuid.uuid4()))
    max_retries = 3
    current_retry = 0
    last_error = None

    # Check if mock fallback should be used (credentials not set or test mode)
    if not settings.SMTP_USER or not settings.SMTP_PASSWORD or settings.SMTP_MOCK_FALLBACK:
        # Mock mode: Successfully simulate delivery, log to outbox
        print(f"[SMTP MOCK DISPATCH] Sent to {recipient_email} | Subject: {mime_message['Subject']} | Message-ID: {msg_id}")
        return SmtpDeliveryResult(
            success=True,
            message_id=msg_id,
            recipient=recipient_email,
            status="SENT",
            retries=0
        )

    while current_retry < max_retries:
        try:
            if settings.SMTP_USE_SSL:
                context = ssl.create_default_context()
                with smtplib.SMTP_SSL(settings.SMTP_HOST, settings.SMTP_PORT, context=context, timeout=settings.SMTP_TIMEOUT) as server:
                    server.login(settings.SMTP_USER, settings.SMTP_PASSWORD)
                    server.send_message(mime_message)
            else:
                with smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT, timeout=settings.SMTP_TIMEOUT) as server:
                    if settings.SMTP_USE_TLS:
                        context = ssl.create_default_context()
                        server.starttls(context=context)
                    server.login(settings.SMTP_USER, settings.SMTP_PASSWORD)
                    server.send_message(mime_message)

            return SmtpDeliveryResult(
                success=True,
                message_id=msg_id,
                recipient=recipient_email,
                status="SENT",
                retries=current_retry
            )
        except Exception as e:
            last_error = str(e)
            current_retry += 1
            if current_retry < max_retries:
                # Exponential backoff sleep: 1s, 2s, 4s
                time.sleep(1.0 * (2 ** (current_retry - 1)))

    return SmtpDeliveryResult(
        success=False,
        message_id=msg_id,
        recipient=recipient_email,
        status="FAILED",
        error=last_error,
        retries=current_retry
    )


async def send_email(
    recipient_email: str,
    subject: str,
    html_content: str,
    email_type: str = "general",
    user_id: Optional[str] = None,
    unsubscribe_url: Optional[str] = None,
    dedup_key: Optional[str] = None,
    metadata: Optional[Dict[str, Any]] = None
) -> SmtpDeliveryResult:
    """
    Centralized async email dispatch function.
    Handles rate limiting, non-blocking SMTP execution, and delivery logging.
    """
    log_id = str(uuid.uuid4())
    now_iso = datetime.utcnow().isoformat() + "Z"

    # 1. Rate Limiting Check
    if not _check_rate_limit(recipient_email):
        log_entry = {
            "id": log_id,
            "user_id": user_id,
            "recipient_email": recipient_email,
            "email_type": email_type,
            "subject": subject,
            "status": "SUPPRESSED",
            "sent_at": None,
            "retry_count": 0,
            "last_error": "Rate limit exceeded: maximum emails per hour reached.",
            "message_id": None,
            "dedup_key": dedup_key,
            "metadata": metadata or {},
            "created_at": now_iso
        }
        EMAIL_DELIVERY_LOGS.insert(0, log_entry)
        return SmtpDeliveryResult(
            success=False,
            message_id="",
            recipient=recipient_email,
            status="SUPPRESSED",
            error="Hourly rate limit exceeded."
        )

    # 2. Build MIME message
    mime_msg = _build_mime_message(
        recipient_email=recipient_email,
        subject=subject,
        html_content=html_content,
        unsubscribe_url=unsubscribe_url
    )

    # 3. Dispatch in non-blocking thread
    result = await asyncio.to_thread(_send_sync_smtp, recipient_email, mime_msg)

    if result.success:
        _record_rate_limit(recipient_email)

    # 4. Record to Delivery Audit Log
    log_entry = {
        "id": log_id,
        "user_id": user_id,
        "recipient_email": recipient_email,
        "email_type": email_type,
        "subject": subject,
        "status": result.status,
        "sent_at": now_iso if result.success else None,
        "retry_count": result.retries,
        "last_error": result.error,
        "message_id": result.message_id,
        "dedup_key": dedup_key,
        "metadata": metadata or {},
        "created_at": now_iso
    }
    EMAIL_DELIVERY_LOGS.insert(0, log_entry)

    return result


def get_delivery_logs(
    limit: int = 50,
    user_id: Optional[str] = None,
    recipient_email: Optional[str] = None
) -> List[Dict[str, Any]]:
    """Fetches recent delivery logs with optional filtering."""
    logs = EMAIL_DELIVERY_LOGS
    if user_id:
        logs = [l for l in logs if l.get("user_id") == user_id]
    if recipient_email:
        logs = [l for l in logs if l.get("recipient_email") == recipient_email]
    return logs[:limit]
