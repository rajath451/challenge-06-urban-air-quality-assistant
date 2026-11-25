export interface UserSensitivityProfile {
  has_asthma: boolean;
  has_elderly_in_home: boolean;
  has_infants: boolean;
  commute_mode: string;
  daily_outdoor_exercise_mins: number;
  preferred_city: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'user' | 'admin' | string;
  created_at?: string;
  is_verified?: boolean;
  sensitivity_profile: UserSensitivityProfile;
}

export const DEFAULT_SENSITIVITY_PROFILE: UserSensitivityProfile = {
  has_asthma: false,
  has_elderly_in_home: false,
  has_infants: false,
  commute_mode: 'public',
  daily_outdoor_exercise_mins: 30,
  preferred_city: 'Mangaluru'
};

export interface AuthResponse {
  access_token: string;
  token_type: string;
  role: string;
  user: User;
}

export interface AdminStats {
  total_users: number;
  active_sessions_today: number;
  primary_station: string;
  cpcb_alert_status: string;
  system_health: string;
  last_backup_time: string;
  emergency_advisory_active: boolean;
  active_advisory_message?: string | null;
}

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  event_type: string;
  actor_email: string;
  status: string;
  details: string;
}
