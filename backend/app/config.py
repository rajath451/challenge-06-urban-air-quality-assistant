import os
from typing import List
from dotenv import load_dotenv

load_dotenv()

class Settings:
    # Core Application
    PROJECT_NAME: str = "VayuCoach — Urban Air Quality Intelligence"
    ENVIRONMENT: str = os.getenv("ENVIRONMENT", "development")
    HOST: str = os.getenv("HOST", "127.0.0.1")
    PORT: int = int(os.getenv("PORT", "8000"))
    CORS_ORIGINS: List[str] = ["*"]

    # AI Reasoning
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "")

    # Database & Authentication: Supabase
    SUPABASE_URL: str = os.getenv("SUPABASE_URL", "https://vayucoach-urban-air.supabase.co")
    SUPABASE_ANON_KEY: str = os.getenv("SUPABASE_ANON_KEY", "")
    SUPABASE_SERVICE_ROLE_KEY: str = os.getenv("SUPABASE_SERVICE_ROLE_KEY", "")

    # Security
    JWT_SECRET_KEY: str = os.getenv(
        "JWT_SECRET_KEY", 
        "vayucoach-production-secret-key-32bytes-long-super-safe!"
    )

    # Centralized SMTP Configuration (Brevo / Transactional Provider)
    SMTP_PROVIDER: str = os.getenv("SMTP_PROVIDER", "brevo")
    SMTP_HOST: str = os.getenv("SMTP_HOST", "smtp-relay.brevo.com")
    SMTP_PORT: int = int(os.getenv("SMTP_PORT", "587"))
    SMTP_USER: str = os.getenv("SMTP_USER", "")
    SMTP_PASSWORD: str = os.getenv("SMTP_PASSWORD", "")
    SMTP_FROM_EMAIL: str = os.getenv("SMTP_FROM_EMAIL", "notifications@vayucoach.in")
    SMTP_FROM_NAME: str = os.getenv("SMTP_FROM_NAME", "VayuCoach Environmental Intelligence")
    SMTP_USE_TLS: bool = os.getenv("SMTP_USE_TLS", "true").lower() in ("true", "1", "yes")
    SMTP_USE_SSL: bool = os.getenv("SMTP_USE_SSL", "false").lower() in ("true", "1", "yes")
    SMTP_TIMEOUT: int = int(os.getenv("SMTP_TIMEOUT", "15"))
    SMTP_MOCK_FALLBACK: bool = os.getenv("SMTP_MOCK_FALLBACK", "true").lower() in ("true", "1", "yes")

    # Frontend Link Resolution
    FRONTEND_URL: str = os.getenv("FRONTEND_URL", "http://localhost:5173")

    # Rate Limiting & Safety Windows
    MAX_EMAILS_PER_USER_PER_HOUR: int = int(os.getenv("MAX_EMAILS_PER_USER_PER_HOUR", "5"))
    AQI_ALERT_DEDUPLICATION_HOURS: int = int(os.getenv("AQI_ALERT_DEDUPLICATION_HOURS", "6"))
    TOKEN_VERIFICATION_EXPIRY_HOURS: int = int(os.getenv("TOKEN_VERIFICATION_EXPIRY_HOURS", "24"))
    TOKEN_PASSWORD_RESET_EXPIRY_HOURS: int = int(os.getenv("TOKEN_PASSWORD_RESET_EXPIRY_HOURS", "1"))

    # Geographic Defaults
    DEFAULT_CITY: str = "Mangaluru, Karnataka, India"
    DEFAULT_LAT: float = 12.914142
    DEFAULT_LON: float = 74.855957

settings = Settings()
