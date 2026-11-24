-- =========================================================================
-- VayuCoach: Centralized SMTP Email Notification System & Governance Schema
-- Target Database: Supabase / PostgreSQL (14+)
-- Description:
--   1. Notification preferences table with category subscriptions and 1-click unsubscribe.
--   2. Email delivery audit logs tracking delivery status, retry count, and rate limiting.
--   3. Email verification and password reset token tracking.
--   4. Deduplication tracking for transient AQI and environmental alerts.
-- =========================================================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- -------------------------------------------------------------------------
-- 1. NOTIFICATION PREFERENCES TABLE
-- -------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.notification_preferences (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id VARCHAR(100) NOT NULL UNIQUE,
    email VARCHAR(255) NOT NULL,
    email_notifications_enabled BOOLEAN NOT NULL DEFAULT TRUE,
    
    -- Subscribed categories: aqi_alerts, daily_briefing, activity_recommendations, weekly_summary
    categories JSONB NOT NULL DEFAULT '["aqi_alerts", "daily_briefing", "activity_recommendations", "weekly_summary"]'::jsonb,
    
    -- User-configured schedule & location
    preferred_report_time VARCHAR(10) NOT NULL DEFAULT '07:00',
    preferred_location VARCHAR(150) NOT NULL DEFAULT 'Mangaluru, Karnataka, India',
    preferred_lat NUMERIC(9, 6) NOT NULL DEFAULT 12.914142,
    preferred_lon NUMERIC(9, 6) NOT NULL DEFAULT 74.855957,
    
    -- Compliance & Unsubscribe (CAN-SPAM / GDPR)
    unsubscribe_token VARCHAR(128) NOT NULL UNIQUE,
    unsubscribed_at TIMESTAMPTZ DEFAULT NULL,
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notification_prefs_user_id ON public.notification_preferences(user_id);
CREATE INDEX IF NOT EXISTS idx_notification_prefs_email ON public.notification_preferences(email);
CREATE INDEX IF NOT EXISTS idx_notification_prefs_unsub_token ON public.notification_preferences(unsubscribe_token);

-- -------------------------------------------------------------------------
-- 2. EMAIL DELIVERY AUDIT LOG TABLE
-- -------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.email_delivery_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id VARCHAR(100),
    recipient_email VARCHAR(255) NOT NULL,
    email_type VARCHAR(50) NOT NULL, -- welcome, verification, password_reset, aqi_warning, daily_report, activity_recommendation, weekly_summary, admin_test
    subject VARCHAR(255) NOT NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'QUEUED', -- QUEUED, SENT, FAILED, SUPPRESSED, RETRYING
    
    -- Delivery Diagnostics & Delivery Retries
    sent_at TIMESTAMPTZ DEFAULT NULL,
    retry_count INT NOT NULL DEFAULT 0,
    max_retries INT NOT NULL DEFAULT 3,
    last_error TEXT DEFAULT NULL,
    message_id VARCHAR(128) DEFAULT NULL,
    
    -- Deduplication key (e.g. hash of user_id + category + date / alert_hash)
    dedup_key VARCHAR(128) DEFAULT NULL,
    metadata JSONB DEFAULT '{}'::jsonb,
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_email_logs_recipient ON public.email_delivery_logs(recipient_email);
CREATE INDEX IF NOT EXISTS idx_email_logs_type_status ON public.email_delivery_logs(email_type, status);
CREATE INDEX IF NOT EXISTS idx_email_logs_created ON public.email_delivery_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_email_logs_dedup ON public.email_delivery_logs(dedup_key);

-- -------------------------------------------------------------------------
-- 3. SECURITY TOKENS TABLE (Email Verification & Password Reset)
-- -------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.security_tokens (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL,
    token_type VARCHAR(30) NOT NULL, -- 'email_verification', 'password_reset'
    token_hash VARCHAR(128) NOT NULL UNIQUE,
    expires_at TIMESTAMPTZ NOT NULL,
    consumed_at TIMESTAMPTZ DEFAULT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_sec_tokens_hash ON public.security_tokens(token_hash);
CREATE INDEX IF NOT EXISTS idx_sec_tokens_user_type ON public.security_tokens(user_id, token_type);

-- -------------------------------------------------------------------------
-- 4. RLS (Row-Level Security) POLICIES FOR SUPABASE
-- -------------------------------------------------------------------------
ALTER TABLE public.notification_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_delivery_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.security_tokens ENABLE ROW LEVEL SECURITY;

-- Allow service role full access (Backend server execution)
CREATE POLICY "Service role full access on preferences" 
    ON public.notification_preferences 
    FOR ALL 
    TO service_role 
    USING (true) 
    WITH CHECK (true);

CREATE POLICY "Service role full access on email logs" 
    ON public.email_delivery_logs 
    FOR ALL 
    TO service_role 
    USING (true) 
    WITH CHECK (true);

CREATE POLICY "Service role full access on security tokens" 
    ON public.security_tokens 
    FOR ALL 
    TO service_role 
    USING (true) 
    WITH CHECK (true);
