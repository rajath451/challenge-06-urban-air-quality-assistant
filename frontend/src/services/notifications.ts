import { getStoredToken } from './auth';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://127.0.0.1:8000';

export interface NotificationPreferences {
  user_id: string;
  email: string;
  email_notifications_enabled: boolean;
  categories: string[];
  preferred_report_time: string;
  preferred_location: string;
  preferred_lat: number;
  preferred_lon: number;
  unsubscribe_token: string;
  unsubscribed_at?: string | null;
  updated_at: string;
}

export interface EmailDeliveryLog {
  id: string;
  user_id?: string;
  recipient_email: string;
  email_type: string;
  subject: string;
  status: 'SENT' | 'QUEUED' | 'FAILED' | 'SUPPRESSED';
  sent_at?: string | null;
  retry_count: number;
  last_error?: string | null;
  message_id?: string | null;
  dedup_key?: string | null;
  created_at: string;
}

export interface SmtpStatus {
  smtp_provider: string;
  smtp_host: string;
  smtp_port: number;
  smtp_from_email: string;
  smtp_from_name: string;
  use_tls: boolean;
  use_ssl: boolean;
  mock_fallback_enabled: boolean;
  max_emails_per_hour: number;
  dedup_cooldown_hours: number;
  total_emails_logged: number;
}

export async function fetchNotificationPreferences(): Promise<NotificationPreferences> {
  const token = getStoredToken();
  const res = await fetch(`${API_BASE}/api/notifications/preferences`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  if (!res.ok) {
    throw new Error('Failed to fetch notification preferences.');
  }
  return await res.json();
}

export async function updateNotificationPreferences(
  payload: Partial<NotificationPreferences>
): Promise<NotificationPreferences> {
  const token = getStoredToken();
  const res = await fetch(`${API_BASE}/api/notifications/preferences`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify(payload)
  });
  if (!res.ok) {
    throw new Error('Failed to update notification preferences.');
  }
  const data = await res.json();
  return data.preferences;
}

export async function fetchMyDeliveryLogs(): Promise<EmailDeliveryLog[]> {
  const token = getStoredToken();
  const res = await fetch(`${API_BASE}/api/notifications/logs`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  if (!res.ok) return [];
  const data = await res.json();
  return data.logs || [];
}

export async function requestPasswordReset(email: string): Promise<string> {
  const res = await fetch(`${API_BASE}/api/auth/forgot-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email })
  });
  if (!res.ok) throw new Error('Password reset request failed.');
  const data = await res.json();
  return data.message;
}

export async function submitPasswordReset(token: string, new_password: string): Promise<string> {
  const res = await fetch(`${API_BASE}/api/auth/reset-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token, new_password })
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.detail || 'Password reset failed.');
  }
  const data = await res.json();
  return data.message;
}

export async function verifyEmailToken(token: string): Promise<string> {
  const res = await fetch(`${API_BASE}/api/auth/verify-email`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token })
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.detail || 'Email verification failed.');
  }
  const data = await res.json();
  return data.message;
}

// -------------------------------------------------------------
// ADMIN EMAIL & SMTP CALLS
// -------------------------------------------------------------
export async function fetchSmtpStatus(): Promise<SmtpStatus> {
  const token = getStoredToken();
  const res = await fetch(`${API_BASE}/api/admin/email/status`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  if (!res.ok) throw new Error('Failed to load SMTP status.');
  return await res.json();
}

export async function sendAdminTestEmail(
  recipient_email: string,
  template_type: string
): Promise<any> {
  const token = getStoredToken();
  const res = await fetch(`${API_BASE}/api/admin/email/test`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({ recipient_email, template_type })
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.detail || 'Failed to dispatch test email.');
  }
  return await res.json();
}

export async function fetchAllEmailLogs(): Promise<EmailDeliveryLog[]> {
  const token = getStoredToken();
  const res = await fetch(`${API_BASE}/api/admin/email/logs`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  if (!res.ok) return [];
  const data = await res.json();
  return data.logs || [];
}

export async function triggerAdminDailyBriefing(): Promise<any> {
  const token = getStoredToken();
  const res = await fetch(`${API_BASE}/api/admin/email/trigger-daily`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` }
  });
  if (!res.ok) throw new Error('Daily briefing trigger failed.');
  return await res.json();
}

export async function triggerAdminAqiCheck(threshold: number = 100): Promise<any> {
  const token = getStoredToken();
  const res = await fetch(`${API_BASE}/api/admin/email/trigger-aqi-check?threshold=${threshold}`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` }
  });
  if (!res.ok) throw new Error('Live AQI check trigger failed.');
  return await res.json();
}
