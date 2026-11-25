import React, { useState } from 'react';
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
  Bell,
  Menu,
  X
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
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const isAdmin = currentUser?.role === 'admin';

  const navItems = [
    { id: 'landing', label: 'Overview', icon: HomeIcon },
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'decisions', label: 'Decisions', icon: Compass, badge: 'CORE' },
    { id: 'planner', label: 'Best Time Planner', icon: Calendar },
    { id: 'homebreath', label: 'HomeBreath', icon: Wind, badge: 'VIRTUAL' },
    { id: 'exposure', label: 'Exposure Dose', icon: Activity },
    { id: 'assistant', label: 'AI Copilot', icon: Sparkles, badge: 'GEMINI' },
    { id: 'transparency', label: 'Transparency', icon: ShieldCheck },
    ...(isAdmin ? [{ id: 'admin', label: 'Admin Console', icon: ShieldAlert, badge: 'GOV' }] : [])
  ];

  const naqiVal = readings ? readings.indian_naqi : '--';
  const naqiCat = readings ? readings.indian_naqi_category : 'Monitoring...';

  // Indian NAQI color mapping
  const getNaqiColor = (cat: string) => {
    switch (cat) {
      case 'Good': return '#10b981';
      case 'Satisfactory': return '#059669';
      case 'Moderate': return '#d97706';
      case 'Poor': return '#ea580c';
      case 'Very Poor': return '#dc2626';
      case 'Severe': return '#7f1d1d';
      default: return '#10b981';
    }
  };

  const badgeColor = getNaqiColor(naqiCat);
  const cityName = currentLocation.name.split(',')[0].trim();

  const handleNavClick = (id: string) => {
    setActiveTab(id);
    setMobileDrawerOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-[#0B1320] border-b border-slate-800/80 shadow-md">
      <div className="max-w-[1440px] mx-auto px-4 lg:px-6 h-16 flex items-center justify-between gap-4">
        
        {/* Left Brand Section (shrink-0, vertically centered, no clipping) */}
        <div
          onClick={() => handleNavClick('landing')}
          className="flex items-center gap-3 cursor-pointer select-none group shrink-0"
        >
          <div className="w-9 h-9 rounded-lg bg-emerald-600/20 border border-emerald-500/30 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
            <Wind className="w-5 h-5 text-emerald-400" />
          </div>
          <div className="flex flex-col justify-center">
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-lg sm:text-xl tracking-tight text-white font-sans leading-none">
                Vayu<span className="text-emerald-400">Coach</span>
              </span>
              <span className="px-1.5 py-0.5 text-[9px] font-mono font-bold uppercase tracking-wider rounded-md bg-emerald-950/70 text-emerald-300 border border-emerald-800">
                CPCB NAQI
              </span>
            </div>
            <p className="text-[11px] text-slate-400 leading-tight whitespace-nowrap mt-1 hidden sm:block">
              Understand Your Air. Make Better Decisions.
            </p>
          </div>
        </div>

        {/* Center Navigation Links (Visible on >= 1150px, single clean row, zero clipping) */}
        <nav className="hidden min-[1150px]:flex items-center gap-1 xl:gap-1.5 overflow-x-auto no-scrollbar">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs xl:text-sm font-medium whitespace-nowrap shrink-0 transition-all duration-150 cursor-pointer ${
                  isActive
                    ? 'bg-gradient-to-r from-emerald-700 via-emerald-600 to-teal-600 text-white font-semibold shadow-md shadow-emerald-700/30 ring-1 ring-emerald-400/40'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <span className="whitespace-nowrap shrink-0">{item.label}</span>
                {isActive && (
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-200 animate-pulse shrink-0" />
                )}
                {item.badge && (
                  <span className={`text-[8px] sm:text-[9px] px-1.5 py-0.2 rounded font-mono font-bold uppercase whitespace-nowrap shrink-0 ${
                    isActive
                      ? 'bg-white/20 text-white border border-white/30 backdrop-blur-xs'
                      : item.id === 'admin'
                        ? 'bg-indigo-950 text-indigo-300 border border-indigo-800/60'
                        : 'bg-emerald-950/80 text-emerald-300 border border-emerald-800/60'
                  }`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Right Auth / Profile Action & Quick Controls (shrink-0, pinned to right) */}
        <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">

          {/* Location Pill */}
          <button
            onClick={onOpenCityModal}
            title={`Switch monitoring station (Current: ${currentLocation.name})`}
            className="flex items-center gap-1 sm:gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-900/90 border border-slate-700 hover:border-emerald-500 text-xs text-slate-200 shadow-2xs hover:bg-slate-800 transition-all cursor-pointer whitespace-nowrap shrink-0"
          >
            <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span className="font-semibold text-xs max-w-[80px] sm:max-w-[110px] truncate">
              {cityName}
            </span>
          </button>

          {/* Live NAQI Badge */}
          <div
            className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-lg border shadow-2xs font-mono select-none whitespace-nowrap shrink-0"
            style={{
              backgroundColor: `${badgeColor}18`,
              borderColor: `${badgeColor}40`,
              color: badgeColor
            }}
            title={`Current Indian NAQI: ${naqiVal} (${naqiCat})`}
          >
            <span className="w-2 h-2 rounded-full animate-pulse shrink-0" style={{ backgroundColor: badgeColor }} />
            <span className="font-bold text-xs">
              {naqiVal}
            </span>
            <span className="text-[11px] font-semibold hidden md:inline opacity-95">
              {naqiCat}
            </span>
          </div>

          {/* Refresh Feed */}
          <button
            onClick={onRefresh}
            disabled={isLoading}
            title="Refresh environmental telemetry"
            className="p-1.5 sm:p-2 rounded-lg bg-slate-900/90 border border-slate-700 text-slate-300 hover:text-emerald-400 hover:border-emerald-400/50 transition-colors disabled:opacity-50 cursor-pointer shrink-0"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-emerald-400' : ''}`} />
          </button>

          {/* Email Notification Preferences Trigger */}
          <button
            onClick={currentUser ? onOpenPreferences : onOpenAuth}
            title="Email Notification Preferences"
            className="p-1.5 sm:p-2 rounded-lg bg-slate-900/90 border border-slate-700 text-slate-300 hover:text-emerald-400 hover:border-emerald-400/50 transition-colors relative cursor-pointer shrink-0"
          >
            <Bell className="w-3.5 h-3.5" />
            <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-[#0B1320]" />
          </button>

          {/* Pinned Auth Button / Logged-in User Profile Pill (shrink-0) */}
          <div className="shrink-0">
            {currentUser ? (
              <div className="flex items-center gap-1.5 bg-slate-900/90 pl-2.5 pr-1 py-1 rounded-lg border border-slate-700 text-xs shrink-0">
                <span className="font-semibold text-slate-200 max-w-[80px] sm:max-w-[110px] truncate text-xs">
                  {currentUser.name.split(' ')[0]}
                </span>
                {currentUser.role === 'admin' ? (
                  <span className="px-1.5 py-0.2 rounded text-[8px] font-mono font-bold uppercase bg-indigo-950 text-indigo-300 border border-indigo-800">
                    Admin
                  </span>
                ) : (
                  <span className="px-1.5 py-0.2 rounded text-[8px] font-mono font-bold uppercase bg-emerald-950 text-emerald-300 border border-emerald-800">
                    Citizen
                  </span>
                )}
                <button
                  onClick={onLogout}
                  title="Sign Out"
                  className="p-1 rounded text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <button
                onClick={onOpenAuth}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-emerald-500/40 bg-emerald-950/40 hover:bg-emerald-900/60 text-emerald-300 font-semibold text-xs transition cursor-pointer shrink-0 whitespace-nowrap shadow-xs"
              >
                <UserIcon className="w-3.5 h-3.5" />
                <span>Sign In</span>
              </button>
            )}
          </div>

          {/* Mobile / Tablet Hamburger Toggle (< 1150px) */}
          <button
            onClick={() => setMobileDrawerOpen((prev) => !prev)}
            aria-label="Toggle Navigation Menu"
            className="min-[1150px]:hidden p-1.5 sm:p-2 rounded-lg bg-slate-900/90 border border-slate-700 text-slate-300 hover:text-white hover:border-slate-600 transition cursor-pointer shrink-0"
          >
            {mobileDrawerOpen ? <X className="w-4 h-4 text-emerald-400" /> : <Menu className="w-4 h-4" />}
          </button>

        </div>
      </div>

      {/* Responsive Collapsible Drawer (< 1150px) */}
      {mobileDrawerOpen && (
        <div className="min-[1150px]:hidden bg-[#0F172A] border-t border-slate-800 px-4 py-4 animate-fadeIn shadow-2xl">
          <div className="flex flex-col gap-1.5 max-w-md mx-auto">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`flex items-center justify-between w-full px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all duration-150 cursor-pointer ${
                    isActive
                      ? 'bg-gradient-to-r from-emerald-700 via-emerald-600 to-teal-600 text-white shadow-md shadow-emerald-700/30'
                      : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className={`text-[9px] px-1.5 py-0.5 rounded font-mono uppercase font-bold ${
                      isActive
                        ? 'bg-white/20 text-white border border-white/30'
                        : 'bg-emerald-950 text-emerald-300 border border-emerald-800/60'
                    }`}>
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </header>
  );
};
