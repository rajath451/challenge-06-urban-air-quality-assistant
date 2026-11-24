import React, { useState } from 'react';
import {
  X,
  Lock,
  Mail,
  User as UserIcon,
  Shield,
  AlertCircle,
  CheckCircle,
  Sparkles,
  KeyRound,
  CheckCheck
} from 'lucide-react';
import { loginUser, registerUser, saveAuthSession } from '../services/auth';
import {
  requestPasswordReset,
  submitPasswordReset,
  verifyEmailToken
} from '../services/notifications';
import { User } from '../types/auth';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (user: User) => void;
  defaultTab?: 'login' | 'register' | 'forgot_password' | 'verify_email';
  initialToken?: string;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  defaultTab = 'login',
  initialToken = ''
}) => {
  const [tab, setTab] = useState<'login' | 'register' | 'forgot_password' | 'verify_email'>(defaultTab);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [name, setName] = useState('');
  const [tokenInput, setTokenInput] = useState(initialToken);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);
    setLoading(true);

    try {
      if (tab === 'login') {
        const res = await loginUser(email, password);
        saveAuthSession(res.access_token, res.user);
        setSuccessMsg(`Welcome back, ${res.user.name}!`);
        setTimeout(() => {
          onSuccess(res.user);
          onClose();
        }, 500);
      } else if (tab === 'register') {
        const res = await registerUser(name, email, password);
        saveAuthSession(res.access_token, res.user);
        setSuccessMsg(`Account created! A welcome & verification email has been dispatched.`);
        setTimeout(() => {
          onSuccess(res.user);
          onClose();
        }, 700);
      } else if (tab === 'forgot_password') {
        if (!tokenInput) {
          const msg = await requestPasswordReset(email);
          setSuccessMsg(msg);
        } else {
          const msg = await submitPasswordReset(tokenInput, newPassword);
          setSuccessMsg(msg);
          setTimeout(() => {
            setTab('login');
            setTokenInput('');
          }, 1200);
        }
      } else if (tab === 'verify_email') {
        const msg = await verifyEmailToken(tokenInput);
        setSuccessMsg(msg);
        setTimeout(() => {
          setTab('login');
        }, 1200);
      }
    } catch (err: any) {
      setError(err.message || 'Operation failed. Please check your credentials or token.');
    } finally {
      setLoading(false);
    }
  };

  const fillDemo = (userRole: 'user' | 'admin') => {
    setError(null);
    setSuccessMsg(null);
    setTab('login');
    if (userRole === 'user') {
      setEmail('user@vayucoach.in');
      setPassword('User@123');
    } else {
      setEmail('admin@vayucoach.in');
      setPassword('Admin@123');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
        {/* Header gradient line */}
        <div className="h-2 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500" />

        <div className="p-6">
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Title & Badge */}
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/40">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                {tab === 'login' && 'Sign In to VayuCoach'}
                {tab === 'register' && 'Create Citizen Account'}
                {tab === 'forgot_password' && 'Password Recovery'}
                {tab === 'verify_email' && 'Verify Email Address'}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {tab === 'login' || tab === 'register'
                  ? 'Access personalized sensitivity, notifications & station governance'
                  : 'Centralized transactional email security service'}
              </p>
            </div>
          </div>

          {/* 1-Click Demo Fill Pill Bar (Shown for login/register) */}
          {(tab === 'login' || tab === 'register') && (
            <div className="mt-4 mb-4 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-600 dark:text-slate-300 mb-2">
                <span className="flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  Quick Evaluator Demo Logins
                </span>
                <span className="text-[10px] text-slate-400 font-mono">1-Click</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => fillDemo('user')}
                  className="py-1.5 px-2.5 rounded-lg text-xs font-medium text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-700 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 hover:text-emerald-700 dark:hover:text-emerald-300 border border-slate-200 dark:border-slate-600 transition flex items-center justify-center gap-1.5"
                >
                  <UserIcon className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  Citizen User
                </button>
                <button
                  type="button"
                  onClick={() => fillDemo('admin')}
                  className="py-1.5 px-2.5 rounded-lg text-xs font-medium text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-700 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 hover:text-indigo-700 dark:hover:text-indigo-300 border border-slate-200 dark:border-slate-600 transition flex items-center justify-center gap-1.5"
                >
                  <Shield className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                  Admin Officer
                </button>
              </div>
            </div>
          )}

          {/* Tab Switchers */}
          <div className="flex border-b border-slate-200 dark:border-slate-800 mb-4 text-xs">
            <button
              type="button"
              onClick={() => { setTab('login'); setError(null); }}
              className={`flex-1 py-2 font-semibold border-b-2 transition ${
                tab === 'login'
                  ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400'
                  : 'border-transparent text-slate-500 hover:text-slate-700'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => { setTab('register'); setError(null); }}
              className={`flex-1 py-2 font-semibold border-b-2 transition ${
                tab === 'register'
                  ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400'
                  : 'border-transparent text-slate-500 hover:text-slate-700'
              }`}
            >
              Register
            </button>
            <button
              type="button"
              onClick={() => { setTab('forgot_password'); setError(null); }}
              className={`flex-1 py-2 font-semibold border-b-2 transition ${
                tab === 'forgot_password'
                  ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400'
                  : 'border-transparent text-slate-500 hover:text-slate-700'
              }`}
            >
              Reset Pass
            </button>
            <button
              type="button"
              onClick={() => { setTab('verify_email'); setError(null); }}
              className={`flex-1 py-2 font-semibold border-b-2 transition ${
                tab === 'verify_email'
                  ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400'
                  : 'border-transparent text-slate-500 hover:text-slate-700'
              }`}
            >
              Verify
            </button>
          </div>

          {/* Feedback Messages */}
          {error && (
            <div className="mb-4 p-3 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {successMsg && (
            <div className="mb-4 p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs flex items-center gap-2">
              <CheckCircle className="w-4 h-4 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Forms */}
          <form onSubmit={handleSubmit} className="space-y-3.5">
            {tab === 'register' && (
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Full Name
                </label>
                <div className="relative">
                  <UserIcon className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Ramesh Hegde"
                    className="w-full pl-9 pr-3 py-2 text-sm rounded-lg bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:text-white"
                  />
                </div>
              </div>
            )}

            {(tab === 'login' || tab === 'register' || (tab === 'forgot_password' && !tokenInput)) && (
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="user@vayucoach.in"
                    className="w-full pl-9 pr-3 py-2 text-sm rounded-lg bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:text-white"
                  />
                </div>
              </div>
            )}

            {(tab === 'login' || tab === 'register') && (
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
                    Password
                  </label>
                  {tab === 'login' && (
                    <button
                      type="button"
                      onClick={() => setTab('forgot_password')}
                      className="text-[11px] text-emerald-600 dark:text-emerald-400 hover:underline"
                    >
                      Forgot?
                    </button>
                  )}
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-9 pr-3 py-2 text-sm rounded-lg bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:text-white"
                  />
                </div>
              </div>
            )}

            {tab === 'forgot_password' && tokenInput && (
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  New Password
                </label>
                <div className="relative">
                  <KeyRound className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                  <input
                    type="password"
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Min 6 characters"
                    className="w-full pl-9 pr-3 py-2 text-sm rounded-lg bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:text-white"
                  />
                </div>
              </div>
            )}

            {(tab === 'verify_email' || (tab === 'forgot_password' && tokenInput)) && (
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Security Token (From Email)
                </label>
                <input
                  type="text"
                  required
                  value={tokenInput}
                  onChange={(e) => setTokenInput(e.target.value)}
                  placeholder="Paste single-use token here..."
                  className="w-full px-3 py-2 text-xs font-mono rounded-lg bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:text-white"
                />
              </div>
            )}

            {tab === 'forgot_password' && !tokenInput && (
              <div className="text-right">
                <button
                  type="button"
                  onClick={() => setTokenInput('enter_token_mode')}
                  className="text-[11px] text-emerald-600 dark:text-emerald-400 hover:underline"
                >
                  Already have a reset token? Enter it here
                </button>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-2.5 px-4 rounded-xl text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 active:scale-[0.99] disabled:opacity-50 transition shadow-md shadow-emerald-500/20"
            >
              {loading
                ? 'Processing Request...'
                : tab === 'login'
                ? 'Sign In to Portal'
                : tab === 'register'
                ? 'Complete Registration & Send Verification'
                : tab === 'forgot_password' && !tokenInput
                ? 'Send Secure Password Reset Email'
                : tab === 'forgot_password' && tokenInput
                ? 'Reset & Confirm New Password'
                : 'Confirm Email Verification Token'}
            </button>
          </form>

          {/* Footer note */}
          <div className="mt-4 text-center">
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              {tab === 'login' ? (
                <>
                  Don't have an account?{' '}
                  <button
                    type="button"
                    onClick={() => setTab('register')}
                    className="text-emerald-600 dark:text-emerald-400 font-medium hover:underline"
                  >
                    Create one here
                  </button>
                </>
              ) : (
                <>
                  Remembered your password?{' '}
                  <button
                    type="button"
                    onClick={() => { setTab('login'); setTokenInput(''); }}
                    className="text-emerald-600 dark:text-emerald-400 font-medium hover:underline"
                  >
                    Sign in here
                  </button>
                </>
              )}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
