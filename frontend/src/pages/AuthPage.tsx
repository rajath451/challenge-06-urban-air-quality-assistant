import React, { useState } from 'react';
import {
  Wind,
  Shield,
  Lock,
  Mail,
  User as UserIcon,
  Eye,
  EyeOff,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Activity,
  Layers,
  Database
} from 'lucide-react';
import { loginUser, registerUser, saveAuthSession } from '../services/auth';
import { User } from '../types/auth';
import { ThemeToggle } from '../components/ThemeToggle';
import { getErrorMessage } from '../utils/errors';

interface AuthPageProps {
  onSuccess: (user: User) => void;
}

export const AuthPage: React.FC<AuthPageProps> = ({ onSuccess }) => {
  const [mode, setMode] = useState<'signin' | 'signup' | 'forgot'>('signin');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Handle Form Submission (Native VayuCoach JWT Auth)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    if (mode === 'signup') {
      if (!name.trim()) {
        setError('Please enter your full name.');
        return;
      }
      if (password !== confirmPassword) {
        setError('Passwords do not match.');
        return;
      }
      if (password.length < 6) {
        setError('Password must be at least 6 characters.');
        return;
      }
    }

    setLoading(true);

    try {
      if (mode === 'forgot') {
        // Instant simulated reset instructions
        setSuccessMsg(`If an account exists for ${email}, a password reset link has been dispatched.`);
        setLoading(false);
        return;
      }

      if (mode === 'signin') {
        const res = await loginUser(email, password);
        saveAuthSession(res.access_token, res.user);
        setSuccessMsg(`Welcome back, ${res.user.name}!`);
        setTimeout(() => onSuccess(res.user), 400);
      } else {
        // Sign Up Mode
        const res = await registerUser(name, email, password);
        saveAuthSession(res.access_token, res.user);
        setSuccessMsg(`Account created! Welcome to VayuCoach, ${res.user.name}!`);
        setTimeout(() => onSuccess(res.user), 600);
      }
    } catch (err: unknown) {
      const msg = getErrorMessage(err, '');
      if (msg.toLowerCase().includes('not found') || msg.toLowerCase().includes('failed to fetch')) {
        setError('Invalid email or password. Please verify your credentials or use the demo accounts below.');
      } else {
        setError(msg || 'Authentication failed. Please verify credentials.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemo = (demoEmail: string, demoPass: string) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setMode('signin');
    setError(null);
  };

  return (
    <div className="min-h-screen w-full bg-[#0B1320] text-slate-100 flex flex-col justify-between selection:bg-emerald-600 selection:text-white relative overflow-hidden">
      {/* Background glow effects */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-emerald-600/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 -right-40 w-[30rem] h-[30rem] bg-cyan-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-20 left-1/3 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top Header bar with Theme Toggle & Security Status */}
      <header className="relative z-10 w-full border-b border-slate-800/80 bg-[#0B1320]/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shadow-lg shadow-emerald-950/40">
              <Wind className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-lg tracking-tight text-white font-mono">VayuCoach</span>
                <span className="px-1.5 py-0.5 rounded text-[10px] font-mono tracking-wider bg-emerald-500/20 border border-emerald-500/40 text-emerald-300">
                  CPCB NAQI
                </span>
                <span className="hidden sm:inline-flex px-1.5 py-0.5 rounded text-[10px] font-mono bg-emerald-500/10 border border-emerald-500/30 text-emerald-300">
                  Secure Access
                </span>
              </div>
              <p className="text-[11px] text-slate-400 hidden sm:block">
                Understand Your Air. Make Better Decisions.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <ThemeToggle />
            <div className="flex items-center gap-2 text-xs font-mono text-emerald-400 bg-emerald-950/50 border border-emerald-500/30 px-3 py-1.5 rounded-lg shadow-xs">
              <Shield className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">256-Bit Encrypted</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="relative z-10 flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 flex flex-col lg:flex-row items-center justify-center gap-10 lg:gap-16">
        
        {/* Left Side: Product Value & Standards */}
        <div className="flex-1 max-w-xl space-y-6 text-center lg:text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-mono">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Secure Enterprise Authentication & Telemetry</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white leading-tight">
            Protect Every Breath with{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400">
              Prescriptive Intelligence
            </span>
          </h1>

          <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
            VayuCoach replaces passive air quality monitoring with continuous CPCB NAQI telemetry, dynamic activity windows, virtual home airflow physics, and personalized particulate dosimetry.
          </p>

          {/* Value Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
            <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800/80 text-left">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mb-2">
                <Activity className="w-4 h-4" />
              </div>
              <h3 className="text-xs font-bold text-white mb-1">CPCB Sub-Index</h3>
              <p className="text-[11px] text-slate-400">
                True Indian National Air Quality Index standard with dynamic breakpoints.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800/80 text-left">
              <div className="w-8 h-8 rounded-lg bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-400 mb-2">
                <Layers className="w-4 h-4" />
              </div>
              <h3 className="text-xs font-bold text-white mb-1">HomeBreath Sim</h3>
              <p className="text-[11px] text-slate-400">
                Virtual multi-zone room physics with air change rates & filter efficiency.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800/80 text-left">
              <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 mb-2">
                <Database className="w-4 h-4" />
              </div>
              <h3 className="text-xs font-bold text-white mb-1">Encrypted Vault</h3>
              <p className="text-[11px] text-slate-400">
                JWT sessions, role-based access control, and zero telemetry leakage.
              </p>
            </div>
          </div>

          {/* Demo Login Shortcuts */}
          <div className="pt-2 p-3 rounded-2xl bg-slate-900/40 border border-slate-800/60 text-xs">
            <p className="text-slate-400 font-mono text-[11px] mb-2">Instant Demo Accounts:</p>
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => handleQuickDemo('user@vayucoach.in', 'user@123')}
                className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-emerald-300 font-mono text-[11px] border border-slate-700 transition cursor-pointer"
              >
                Citizen Demo (user@vayucoach.in)
              </button>
              <button
                type="button"
                onClick={() => handleQuickDemo('admin@vayucoach.in', 'admin@123')}
                className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-indigo-300 font-mono text-[11px] border border-slate-700 transition cursor-pointer"
              >
                Admin Demo (admin@vayucoach.in)
              </button>
            </div>
          </div>

          <div className="pt-2 flex items-center justify-center lg:justify-start gap-4 text-xs text-slate-400 font-mono">
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>450+ CPCB Stations</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Encrypted JWT Sessions</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Zero-Lag Telemetry</span>
            </div>
          </div>
        </div>

        {/* Right Side: Auth Form Card */}
        <div className="w-full max-w-md">
          <div className="bg-[#0F172A] border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative border-t-2 border-t-emerald-500 backdrop-blur-xl">
            
            {/* Session Security Header */}
            <div className="flex items-center justify-between pb-5 mb-5 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-emerald-600/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                  <Shield className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-white leading-tight">
                    {mode === 'signin' && 'Sign In to VayuCoach'}
                    {mode === 'signup' && 'Create Your Account'}
                    {mode === 'forgot' && 'Reset Password'}
                  </h2>
                  <p className="text-[11px] text-slate-400">Secure Telemetry Session</p>
                </div>
              </div>
              <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[10px] font-mono text-emerald-300">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                <span>Protected</span>
              </div>
            </div>

            {/* Mode Switcher Tabs */}
            {mode !== 'forgot' && (
              <div className="flex rounded-xl bg-slate-900 p-1 mb-5 border border-slate-800">
                <button
                  type="button"
                  onClick={() => {
                    setMode('signin');
                    setError(null);
                    setSuccessMsg(null);
                  }}
                  className={`flex-1 py-2 text-xs font-semibold rounded-lg transition cursor-pointer ${
                    mode === 'signin'
                      ? 'bg-emerald-600 text-white shadow-md'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Sign In
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMode('signup');
                    setError(null);
                    setSuccessMsg(null);
                  }}
                  className={`flex-1 py-2 text-xs font-semibold rounded-lg transition cursor-pointer ${
                    mode === 'signup'
                      ? 'bg-emerald-600 text-white shadow-md'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Create Account
                </button>
              </div>
            )}

            {/* Error & Success Alerts */}
            {error && (
              <div className="mb-4 p-3 rounded-xl bg-red-950/40 border border-red-500/40 text-red-300 text-xs flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-400" />
                <span className="leading-snug">{error}</span>
              </div>
            )}
            {successMsg && (
              <div className="mb-4 p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/40 text-emerald-300 text-xs flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-400" />
                <span className="leading-snug">{successMsg}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-3.5">
              {mode === 'signup' && (
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Full Name</label>
                  <div className="relative">
                    <UserIcon className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Dr. Rajesh Sharma"
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-9 pr-3 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Email Address</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="user@vayucoach.in"
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-9 pr-3 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
              </div>

              {mode !== 'forgot' && (
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-medium text-slate-300">Password</label>
                    {mode === 'signin' && (
                      <button
                        type="button"
                        onClick={() => {
                          setMode('forgot');
                          setError(null);
                          setSuccessMsg(null);
                        }}
                        className="text-[11px] text-emerald-400 hover:text-emerald-300 transition cursor-pointer"
                      >
                        Forgot?
                      </button>
                    )}
                  </div>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-9 pr-10 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              )}

              {mode === 'signup' && (
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Confirm Password</label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-9 pr-3 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white font-semibold text-xs tracking-wide transition shadow-lg shadow-emerald-950/50 flex items-center justify-center gap-2 disabled:opacity-50 mt-2 cursor-pointer"
              >
                {loading ? (
                  <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <span>
                      {mode === 'signin' && 'Sign In'}
                      {mode === 'signup' && 'Create Account'}
                      {mode === 'forgot' && 'Send Reset Email'}
                    </span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </form>

            {/* Footer / Switch link */}
            <div className="mt-5 pt-4 border-t border-slate-800 text-center">
              {mode === 'forgot' ? (
                <button
                  type="button"
                  onClick={() => {
                    setMode('signin');
                    setError(null);
                    setSuccessMsg(null);
                  }}
                  className="text-xs text-emerald-400 hover:underline cursor-pointer"
                >
                  ← Back to Sign In
                </button>
              ) : (
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span>
                    {mode === 'signin' ? "Don't have an account?" : 'Already have an account?'}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setMode(mode === 'signin' ? 'signup' : 'signin');
                      setError(null);
                      setSuccessMsg(null);
                    }}
                    className="font-medium text-emerald-400 hover:underline ml-1 cursor-pointer"
                  >
                    {mode === 'signin' ? 'Sign Up' : 'Sign In'}
                  </button>
                </div>
              )}
            </div>

          </div>
        </div>

      </main>

      {/* Footer Note */}
      <footer className="relative z-10 w-full py-4 border-t border-slate-800/80 bg-[#0B1320]/80 text-center text-xs text-slate-500 font-mono">
        VayuCoach Urban Environmental Intelligence • High-Precision CPCB NAQI Decision Engine
      </footer>
    </div>
  );
};
