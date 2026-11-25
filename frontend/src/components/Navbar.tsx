import React from 'react';
import {
  Wind,
  Compass,
  Calendar,
  Home as HomeIcon,
  Activity,
  Sparkles,
  ShieldCheck,
  MapPin,
  RefreshCw,
  LayoutDashboard,
  ShieldAlert,
  User as UserIcon,
  LogOut,
  Bell
} from 'lucide-react';
import { EnvironmentalReadings, LocationInfo } from '../types';
import { User } from '../types/auth';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  readings: EnvironmentalReadings | null;
  currentLocation: LocationInfo;
  onOpenCityModal: () => void;
  onRefresh: () => void;
  isLoading: boolean;
  currentUser: User | null;
  onOpenAuth: () => void;
  onLogout: () => void;
  onOpenPreferences: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  readings,
  currentLocation,
  onOpenCityModal,
  onRefresh,
  isLoading,
  currentUser,
  onOpenAuth,
  onLogout,
  onOpenPreferences
}) => {
  const isAdmin = currentUser?.role === 'admin';

  const navItems = [
    { id: 'landing', label: 'Overview', icon: HomeIcon },
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'decisions', label: 'Decisions', icon: Compass, badge: 'Core' },
    { id: 'planner', label: 'Best Time Planner', icon: Calendar },
    { id: 'homebreath', label: 'HomeBreath', icon: Wind, badge: 'Virtual' },
    { id: 'exposure', label: 'Exposure Dose', icon: Activity },
    { id: 'assistant', label: 'AI Copilot', icon: Sparkles, badge: 'Gemini' },
    { id: 'transparency', label: 'Transparency', icon: ShieldCheck },
    ...(isAdmin ? [{ id: 'admin', label: 'Admin Console', icon: ShieldAlert, badge: 'Gov' }] : [])
  ];

  const naqiVal = readings ? readings.indian_naqi : '--';
  const naqiCat = readings ? readings.indian_naqi_category : 'Monitoring...';

  // Indian NAQI color mapping
  const getNaqiColor = (cat: string) => {
    switch (cat) {
      case 'Good': return '#006c4a';
      case 'Satisfactory': return '#059669';
      case 'Moderate': return '#d97706';
      case 'Poor': return '#ea580c';
      case 'Very Poor': return '#dc2626';
      case 'Severe': return '#7f1d1d';
      default: return '#006c4a';
    }
  };

  const badgeColor = getNaqiColor(naqiCat);
  const cityName = currentLocation.name.split(',')[0].trim();

  return (
    <header className="sticky top-0 z-50 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-b border-slate-200/90 dark:border-slate-800 shadow-xs transition-colors">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        
        {/* Main Header Bar */}
        <div className="flex items-center justify-between h-15 sm:h-18 gap-2 sm:gap-4">

          {/* Left: VayuCoach Brand & Tagline */}
          <div
            onClick={() => setActiveTab('landing')}
            className="flex items-center gap-2.5 sm:gap-3 cursor-pointer select-none group shrink-0"
          >
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-emerald-800 via-emerald-700 to-teal-500 flex items-center justify-center text-white shadow-md shadow-emerald-700/25 group-hover:scale-105 transition-transform shrink-0">
              <Wind className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5 sm:gap-2">
                <span className="font-extrabold text-lg sm:text-xl tracking-tight text-slate-900 dark:text-white font-sans">
                  Vayu<span className="text-emerald-700 dark:text-emerald-400">Coach</span>
                </span>
                <span className="px-1.5 py-0.5 text-[8px] sm:text-[9px] font-mono font-bold uppercase tracking-wider rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200 dark:bg-emerald-950/70 dark:text-emerald-300 dark:border-emerald-800">
                  CPCB NAQI
                </span>
              </div>
              <p className="text-[10px] sm:text-[11px] text-slate-500 dark:text-slate-400 font-medium hidden md:block">
                Understand Your Air. Make Better Decisions.
              </p>
            </div>
          </div>

          {/* Center: Desktop Navigation Tabs (Vibrant & Distinct Active States) */}
          <nav className="hidden lg:flex items-center gap-1 bg-slate-100/90 dark:bg-slate-800/90 p-1.5 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 shadow-inner">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all duration-200 cursor-pointer ${
                    isActive
                      ? 'bg-gradient-to-r from-emerald-700 via-emerald-600 to-teal-600 text-white shadow-md shadow-emerald-700/30 ring-1 ring-emerald-400/40 scale-[1.02]'
                      : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-white/80 dark:hover:bg-slate-700/70'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-white' : 'text-slate-400 dark:text-slate-400'}`} />
                  <span>{item.label}</span>
                  {isActive && (
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-200 animate-pulse shrink-0" />
                  )}
                  {item.badge && (
                    <span className={`text-[8px] sm:text-[9px] px-1.5 py-0.2 rounded-md font-mono uppercase font-bold tracking-tight ${
                      isActive
                        ? 'bg-white/20 text-white border border-white/30 backdrop-blur-xs'
                        : item.id === 'admin'
                          ? 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950/80 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800/40'
                          : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/40'
                    }`}>
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Right Controls: Location, Telemetry, Preferences, User Auth */}
          <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">

            {/* Location Pill */}
            <button
              onClick={onOpenCityModal}
              title={`Switch city (Current: ${currentLocation.name})`}
              className="flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-emerald-500 text-xs text-slate-700 dark:text-slate-200 shadow-2xs hover:bg-emerald-50/50 dark:hover:bg-slate-700/80 transition-all cursor-pointer"
            >
              <MapPin className="w-3.5 h-3.5 text-emerald-700 dark:text-emerald-400 shrink-0" />
              <span className="font-semibold text-xs max-w-[80px] sm:max-w-[120px] truncate">
                {cityName}
              </span>
            </button>

            {/* Live CPCB NAQI Badge (Visible on all screens, compact on mobile) */}
            <div
              className="flex items-center gap-1.5 px-2 sm:px-2.5 py-1 rounded-xl border shadow-2xs font-mono select-none"
              style={{
                backgroundColor: `${badgeColor}15`,
                borderColor: `${badgeColor}40`,
                color: badgeColor
              }}
              title={`Current Indian NAQI: ${naqiVal} (${naqiCat})`}
            >
              <span className="w-2 h-2 rounded-full animate-pulse shrink-0" style={{ backgroundColor: badgeColor }} />
              <span className="font-bold text-xs">
                {naqiVal}
              </span>
              <span className="text-[11px] font-semibold hidden sm:inline opacity-95">
                {naqiCat}
              </span>
            </div>

            {/* Refresh Feed */}
            <button
              onClick={onRefresh}
              disabled={isLoading}
              title="Refresh environmental telemetry"
              className="p-1.5 sm:p-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:text-emerald-700 hover:border-emerald-300 transition-colors disabled:opacity-50 cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-emerald-600' : ''}`} />
            </button>

            {/* Email Notification Preferences Trigger */}
            <button
              onClick={currentUser ? onOpenPreferences : onOpenAuth}
              title="Email Notification Preferences"
              className="p-1.5 sm:p-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:text-emerald-700 hover:border-emerald-300 transition-colors relative cursor-pointer"
            >
              <Bell className="w-3.5 h-3.5" />
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-slate-900" />
            </button>

            {/* Auth Pill / User Profile */}
            {currentUser ? (
              <div className="flex items-center gap-1 bg-slate-50 dark:bg-slate-800 pl-2 pr-1 py-1 rounded-xl border border-slate-200 dark:border-slate-700 text-xs">
                <span className="font-semibold text-slate-800 dark:text-slate-200 max-w-[70px] sm:max-w-[100px] truncate text-[11px] sm:text-xs">
                  {currentUser.name.split(' ')[0]}
                </span>
                {currentUser.role === 'admin' ? (
                  <span className="px-1 py-0.2 rounded text-[8px] font-mono font-bold uppercase bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                    Admin
                  </span>
                ) : (
                  <span className="px-1 py-0.2 rounded text-[8px] font-mono font-bold uppercase bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                    User
                  </span>
                )}
                <button
                  onClick={onLogout}
                  title="Sign Out"
                  className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-white dark:hover:bg-slate-700 transition cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <button
                onClick={onOpenAuth}
                className="flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl border border-emerald-600/30 bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300 font-semibold text-xs transition cursor-pointer"
              >
                <UserIcon className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Sign In</span>
              </button>
            )}

            {/* Quick Decisions Shortcut (Desktop Only) */}
            <button
              onClick={() => setActiveTab('decisions')}
              className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-800 hover:bg-emerald-700 text-white font-medium text-xs shadow-xs transition-colors shrink-0 cursor-pointer"
            >
              <Compass className="w-3.5 h-3.5" />
              <span>Decisions</span>
            </button>
          </div>
        </div>

        {/* Mobile Navigation Strip (Zero Scrollbar, Touch-Friendly, Vibrant Active States) */}
        <div className="lg:hidden relative">
          <div className="flex items-center gap-1.5 overflow-x-auto py-2 px-0.5 no-scrollbar snap-x snap-mandatory scroll-smooth border-t border-slate-200/70 dark:border-slate-800">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs whitespace-nowrap transition-all duration-200 snap-start shrink-0 cursor-pointer ${
                    isActive
                      ? 'bg-gradient-to-r from-emerald-700 via-emerald-600 to-teal-600 text-white font-bold shadow-md shadow-emerald-700/30 ring-1 ring-emerald-400/40 scale-[1.02]'
                      : 'bg-slate-100/90 dark:bg-slate-800/90 text-slate-700 dark:text-slate-300 border border-slate-200/60 dark:border-slate-700/60 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-white' : 'text-slate-500 dark:text-slate-400'}`} />
                  <span>{item.label}</span>
                  {isActive && (
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-200 animate-pulse shrink-0" />
                  )}
                  {item.badge && (
                    <span className={`text-[8px] px-1 py-0.2 rounded font-mono uppercase font-bold ${
                      isActive
                        ? 'bg-white/20 text-white border border-white/30'
                        : 'bg-emerald-200/70 dark:bg-emerald-950 text-emerald-900 dark:text-emerald-300'
                    }`}>
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

      </div>
    </header>
  );
};
