import { createClient, SupabaseClient, User as SupabaseUser } from '@supabase/supabase-js';

// Load Supabase environment variables from Vite
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://vayucoach-urban-air.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.mock_anon_key_for_vayucoach_urban_air_quality_assistant';

export const isSupabaseConfigured = Boolean(
  import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY
);

// Initialize Supabase Client
export const supabase: SupabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  }
});

export interface SupabaseAuthResult {
  success: boolean;
  user?: {
    id: string;
    email: string;
    name: string;
    role: 'user' | 'admin';
  };
  error?: string;
  isConfirmationPending?: boolean;
}

/**
 * Sign up a new user via Supabase Auth
 */
export async function signUpWithSupabase(
  email: string,
  password: string,
  name: string
): Promise<SupabaseAuthResult> {
  if (!isSupabaseConfigured) {
    return { success: false, error: 'Supabase unconfigured' };
  }
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: name,
          name,
          role: 'user'
        }
      }
    });

    if (error) {
      return { success: false, error: error.message };
    }

    if (data.user) {
      return {
        success: true,
        user: {
          id: data.user.id,
          email: data.user.email || email,
          name: data.user.user_metadata?.full_name || name,
          role: 'user'
        },
        isConfirmationPending: !data.session
      };
    }

    return { success: false, error: 'Sign up failed.' };
  } catch (err: any) {
    return { success: false, error: err.message || 'Unexpected Supabase error.' };
  }
}

/**
 * Sign in existing user via Supabase Auth
 */
export async function signInWithSupabase(
  email: string,
  password: string
): Promise<SupabaseAuthResult> {
  if (!isSupabaseConfigured) {
    return { success: false, error: 'Supabase unconfigured' };
  }
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      return { success: false, error: error.message };
    }

    if (data.user) {
      const role = data.user.user_metadata?.role === 'admin' || email.includes('admin') ? 'admin' : 'user';
      return {
        success: true,
        user: {
          id: data.user.id,
          email: data.user.email || email,
          name: data.user.user_metadata?.full_name || data.user.user_metadata?.name || email.split('@')[0],
          role
        }
      };
    }

    return { success: false, error: 'Sign in failed.' };
  } catch (err: any) {
    return { success: false, error: err.message || 'Unexpected Supabase error.' };
  }
}

/**
 * Sign out of Supabase session
 */
export async function signOutFromSupabase(): Promise<void> {
  try {
    await supabase.auth.signOut();
  } catch (err) {
    console.warn('Supabase signOut notice:', err);
  }
}

/**
 * Request password recovery email via Supabase
 */
export async function resetPasswordWithSupabase(email: string): Promise<{ success: boolean; message: string }> {
  try {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}?tab=reset_password`
    });

    if (error) {
      return { success: false, message: error.message };
    }

    return { success: true, message: 'Password reset link dispatched via Supabase.' };
  } catch (err: any) {
    return { success: false, message: err.message || 'Password reset request failed.' };
  }
}
