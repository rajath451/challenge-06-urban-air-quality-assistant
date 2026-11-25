import { User, AuthResponse, AdminStats, AuditLogEntry, UserSensitivityProfile } from '../types/auth';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://127.0.0.1:8000';
const TOKEN_KEY = 'vayucoach_auth_token';
const USER_KEY = 'vayucoach_user_profile';

export function getStoredToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function getStoredUser(): User | null {
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function saveAuthSession(token: string, user: User) {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function clearAuthSession() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

export async function loginUser(email: string, password: string): Promise<AuthResponse> {
  const res = await fetch(`${API_BASE}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.detail || 'Failed to log in.');
  }
  const data: AuthResponse = await res.json();
  saveAuthSession(data.access_token, data.user);
  return data;
}

export async function registerUser(name: string, email: string, password: string): Promise<AuthResponse> {
  const res = await fetch(`${API_BASE}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, email, password })
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.detail || 'Registration failed.');
  }
  const data: AuthResponse = await res.json();
  saveAuthSession(data.access_token, data.user);
  return data;
}

export async function fetchMyProfile(): Promise<User | null> {
  const token = getStoredToken();
  if (!token) return null;
  try {
    const res = await fetch(`${API_BASE}/api/auth/me`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (res.ok) {
      const user = await res.json();
      localStorage.setItem(USER_KEY, JSON.stringify(user));
      return user;
    }
  } catch (err) {
    console.warn('Failed to fetch user profile:', err);
  }
  return null;
}

export async function updateUserProfile(profile: UserSensitivityProfile): Promise<User> {
  const token = getStoredToken();
  const res = await fetch(`${API_BASE}/api/auth/profile`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify(profile)
  });
  if (!res.ok) {
    throw new Error('Failed to update sensitivity profile.');
  }
  const updatedUser: User = await res.json();
  localStorage.setItem(USER_KEY, JSON.stringify(updatedUser));
  return updatedUser;
}

// -------------------------------------------------------------
// ADMIN GOVERNANCE CALLS
// -------------------------------------------------------------
export async function fetchAdminOverview(): Promise<AdminStats> {
  const token = getStoredToken();
  const res = await fetch(`${API_BASE}/api/admin/overview`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  if (!res.ok) {
    throw new Error('Access denied. Administrator privileges required.');
  }
  return await res.json();
}

export async function fetchAdminAuditLogs(): Promise<AuditLogEntry[]> {
  const token = getStoredToken();
  const res = await fetch(`${API_BASE}/api/admin/audit-logs`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  if (!res.ok) {
    throw new Error('Failed to fetch security audit logs.');
  }
  return await res.json();
}

export async function updateAdminThresholds(payload: {
  pm25_caution_limit: number;
  pm25_severe_limit: number;
  enforce_emergency_lockdown: boolean;
  advisory_note?: string;
}) {
  const token = getStoredToken();
  const res = await fetch(`${API_BASE}/api/admin/thresholds`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify(payload)
  });
  if (!res.ok) throw new Error('Threshold update failed.');
  return await res.json();
}

export async function broadcastAdminAlert(payload: {
  severity: string;
  title: string;
  message: string;
  target_region: string;
}) {
  const token = getStoredToken();
  const res = await fetch(`${API_BASE}/api/admin/broadcast-alert`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify(payload)
  });
  if (!res.ok) throw new Error('Emergency broadcast failed.');
  return await res.json();
}
