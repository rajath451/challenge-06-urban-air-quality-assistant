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

  return (
    <header className="sticky top-0 z-50 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-b border-slate-200/80 dark:border-slate-800 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20 gap-2 sm:gap-4">

          {/* VayuCoach Brand & Tagline */}
          <div
            onClick={() => setActiveTab('landing')}
            className="flex items-center gap-3 cursor-pointer select-none group"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-800 via-emerald-700 to-teal-600 flex items-center justify-center text-white shadow-md shadow-emerald-800/20 group-hover:scale-105 transition-transform shrink-0">
              <Wind className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-xl tracking-tight text-slate-900 dark:text-white font-sans">
                  Vayu<span className="text-emerald-700 dark:text-emerald-400 font-extrabold">Coach</span>
                </span>
                <span className="px-1.5 py-0.5 text-[9px] font-mono font-bold uppercase tracking-wider rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800">
                  CPCB NAQI
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium hidden sm:block">
                Understand Your Air. Make Better Decisions.
              </p>
            </div>
          </div>

          {/* Desktop Nav Items */}
          <nav className="hidden xl:flex items-center gap-1 bg-slate-100/80 dark:bg-slate-800/80 p-1.5 rounded-xl border border-slate-200/60 dark:border-slate-700 shadow-inner">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-white dark:bg-slate-900 text-emerald-900 dark:text-emerald-300 shadow-xs font-semibold'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:white hover:bg-white/60 dark:hover:bg-slate-700/50'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-emerald-700 dark:text-emerald-400' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                  {item.badge && (
                    <span className={`text-[9px] px-1 py-0.2 rounded font-mono uppercase ${
                      item.id === 'admin'
                        ? 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950/80 dark:text-indigo-300'
                        : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300'
                    }`}>
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Right Status Pill & Controls */}
          <div className="flex items-center gap-2 sm:gap-3">

            {/* Location Pill */}
            <button
              onClick={onOpenCityModal}
              title="Switch city or view monitoring station"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-emerald-400 text-xs text-slate-700 dark:text-slate-200 shadow-2xs hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
            >
              <MapPin className="w-3.5 h-3.5 text-emerald-700 dark:text-emerald-400 shrink-0" />
              <span className="font-semibold max-w-[90px] sm:max-w-[130px] truncate">
                {currentLocation.name.split(',')[0]}
              </span>
            </button>

            {/* Live CPCB NAQI Badge */}
            <div
              className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl border shadow-2xs font-mono"
              style={{
                backgroundColor: `${badgeColor}12`,
                borderColor: `${badgeColor}35`,
                color: badgeColor
              }}
            >
              <span className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: badgeColor }} />
              <span className="font-bold text-xs">NAQI {naqiVal}</span>
              <span className="text-[11px] font-medium hidden md:inline opacity-90 truncate max-w-[100px]">
                {naqiCat}
              </span>
            </div>

            {/* Refresh */}
            <button
              onClick={onRefresh}
              disabled={isLoading}
              title="Refresh environmental feeds"
              className="p-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:text-emerald-700 hover:border-emerald-300 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-emerald-600' : ''}`} />
            </button>

            {/* Notification Preferences Trigger */}
            <button
              onClick={currentUser ? onOpenPreferences : onOpenAuth}
              title="Email Notification Preferences"
              className="p-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:text-emerald-700 hover:border-emerald-300 transition-colors relative"
            >
              <Bell className="w-3.5 h-3.5" />
              <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-emerald-500" />
            </button>

            {/* Auth Pill / User Profile */}
            {currentUser ? (
              <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-800 pl-2.5 pr-1 py-1 rounded-xl border border-slate-200 dark:border-slate-700 text-xs">
                <span className="font-medium text-slate-800 dark:text-slate-200 max-w-[90px] truncate">
                  {currentUser.name}
                </span>
                {currentUser.role === 'admin' ? (
                  <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold uppercase bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                    Admin
                  </span>
                ) : (
                  <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold uppercase bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                    Citizen
                  </span>
                )}
                <button
                  onClick={onLogout}
                  title="Sign Out"
                  className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-white dark:hover:bg-slate-700 transition"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <button
                onClick={onOpenAuth}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-emerald-600/30 bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300 font-semibold text-xs transition"
              >
                <UserIcon className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Sign In</span>
              </button>
            )}

            {/* Decision Console Action */}
            <button
              onClick={() => setActiveTab('decisions')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-800 hover:bg-emerald-700 text-white font-medium text-xs shadow-xs transition-colors shrink-0"
            >
              <Compass className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Decisions</span>
            </button>
          </div>
        </div>

        {/* Mobile Navigation Strip */}
        <div className="xl:hidden flex items-center gap-1 overflow-x-auto py-2 border-t border-slate-200/60 dark:border-slate-800 no-scrollbar">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs whitespace-nowrap transition-colors ${
                  isActive
                    ? 'bg-emerald-800 text-white font-semibold shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <Icon className="w-3 h-3" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>

      </div>
    </header>
  );
};
