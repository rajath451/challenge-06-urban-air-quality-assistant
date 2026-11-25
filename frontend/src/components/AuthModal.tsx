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
  KeyRound
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-md bg-[#0F172A] border border-slate-800 rounded-2xl shadow-2xl p-6 border-t-2 border-t-emerald-500 overflow-hidden text-slate-100">
        
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header: Shield Icon Badge + Title + Subtitle */}
        <div className="flex items-center gap-3 mb-2 pr-6">
          <div className="p-2.5 rounded-xl bg-emerald-950/60 text-emerald-400 border border-emerald-800/40 shrink-0">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white tracking-tight">
              {tab === 'login' && 'Sign In to VayuCoach'}
              {tab === 'register' && 'Create Citizen Account'}
              {tab === 'forgot_password' && 'Password Recovery'}
              {tab === 'verify_email' && 'Verify Email Address'}
            </h3>
            <p className="text-xs text-slate-400 mt-0.5 leading-snug">
              Access personalized sensitivity, notifications & station governance
            </p>
          </div>
        </div>

        {/* Quick Evaluator Demo Logins Box */}
        {(tab === 'login' || tab === 'register') && (
          <div className="mt-4 mb-4 p-3.5 rounded-xl bg-slate-900/70 border border-slate-800">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-300 mb-2.5">
              <span className="flex items-center gap-1.5 text-slate-200">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                ✨ Quick Evaluator Demo Logins
              </span>
              <span className="text-[10px] text-emerald-400 font-mono uppercase bg-emerald-950/60 px-1.5 py-0.5 rounded border border-emerald-800/40">
                1-Click
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => fillDemo('user')}
                className="py-1.5 px-2.5 rounded-lg text-xs font-medium text-emerald-300 bg-emerald-950/30 hover:bg-emerald-900/50 border border-emerald-500/30 transition flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
              >
                <UserIcon className="w-3.5 h-3.5 text-emerald-400" />
                Citizen User
              </button>
              <button
                type="button"
                onClick={() => fillDemo('admin')}
                className="py-1.5 px-2.5 rounded-lg text-xs font-medium text-indigo-300 bg-indigo-950/30 hover:bg-indigo-900/50 border border-indigo-500/30 transition flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
              >
                <Shield className="w-3.5 h-3.5 text-indigo-400" />
                Admin Officer
              </button>
            </div>
          </div>
        )}

        {/* 4-Column Auth Tabs with Emerald Bottom Indicator */}
        <div className="flex border-b border-slate-800 mb-4 text-xs font-medium">
          <button
            type="button"
            onClick={() => { setTab('login'); setError(null); }}
            className={`flex-1 py-2 text-center transition cursor-pointer ${
              tab === 'login'
                ? 'border-b-2 border-emerald-500 text-emerald-400 font-semibold'
                : 'border-b-2 border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => { setTab('register'); setError(null); }}
            className={`flex-1 py-2 text-center transition cursor-pointer ${
              tab === 'register'
                ? 'border-b-2 border-emerald-500 text-emerald-400 font-semibold'
                : 'border-b-2 border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Register
          </button>
          <button
            type="button"
            onClick={() => { setTab('forgot_password'); setError(null); }}
            className={`flex-1 py-2 text-center transition cursor-pointer ${
              tab === 'forgot_password'
                ? 'border-b-2 border-emerald-500 text-emerald-400 font-semibold'
                : 'border-b-2 border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Reset Pass
          </button>
          <button
            type="button"
            onClick={() => { setTab('verify_email'); setError(null); }}
            className={`flex-1 py-2 text-center transition cursor-pointer ${
              tab === 'verify_email'
                ? 'border-b-2 border-emerald-500 text-emerald-400 font-semibold'
                : 'border-b-2 border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Verify
          </button>
        </div>

        {/* Feedback Messages */}
        {error && (
          <div className="mb-4 p-3 rounded-lg bg-rose-950/50 border border-rose-800/80 text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{error}</span>
          </div>
        )}

        {successMsg && (
          <div className="mb-4 p-3 rounded-lg bg-emerald-950/50 border border-emerald-800/80 text-emerald-300 text-xs flex items-center gap-2">
            <CheckCircle className="w-4 h-4 shrink-0 text-emerald-400" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Form Inputs & CTA */}
        <form onSubmit={handleSubmit} className="space-y-3.5">
          {tab === 'register' && (
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
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
                  className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm rounded-lg bg-slate-900/90 border border-slate-700/80 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition"
                />
              </div>
            </div>
          )}

          {(tab === 'login' || tab === 'register' || (tab === 'forgot_password' && !tokenInput)) && (
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
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
                  className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm rounded-lg bg-slate-900/90 border border-slate-700/80 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition"
                />
              </div>
            </div>
          )}

          {(tab === 'login' || tab === 'register') && (
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-xs font-medium text-slate-300">
                  Password
                </label>
                {tab === 'login' && (
                  <button
                    type="button"
                    onClick={() => setTab('forgot_password')}
                    className="text-[11px] text-emerald-400 hover:underline cursor-pointer"
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
                  className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm rounded-lg bg-slate-900/90 border border-slate-700/80 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition"
                />
              </div>
            </div>
          )}

          {tab === 'forgot_password' && tokenInput && (
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
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
                  className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm rounded-lg bg-slate-900/90 border border-slate-700/80 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition"
                />
              </div>
            </div>
          )}

          {(tab === 'verify_email' || (tab === 'forgot_password' && tokenInput)) && (
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Security Token (From Email)
              </label>
              <input
                type="text"
                required
                value={tokenInput}
                onChange={(e) => setTokenInput(e.target.value)}
                placeholder="Paste single-use token here..."
                className="w-full px-3 py-2 text-xs font-mono rounded-lg bg-slate-900/90 border border-slate-700/80 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition"
              />
            </div>
          )}

          {tab === 'forgot_password' && !tokenInput && (
            <div className="text-right">
              <button
                type="button"
                onClick={() => setTokenInput('enter_token_mode')}
                className="text-[11px] text-emerald-400 hover:underline cursor-pointer"
              >
                Already have a reset token? Enter it here
              </button>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-2.5 px-4 rounded-lg text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-500 active:scale-[0.99] disabled:opacity-50 transition shadow-md shadow-emerald-500/20 cursor-pointer"
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

        {/* Footer Prompt */}
        <div className="mt-4 text-center">
          <p className="text-[11px] text-slate-400">
            {tab === 'login' ? (
              <>
                Don't have an account?{' '}
                <button
                  type="button"
                  onClick={() => setTab('register')}
                  className="text-emerald-400 font-medium hover:underline cursor-pointer"
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
                  className="text-emerald-400 font-medium hover:underline cursor-pointer"
                >
                  Sign in here
                </button>
              </>
            )}
          </p>
        </div>

      </div>
    </div>
  );
};
