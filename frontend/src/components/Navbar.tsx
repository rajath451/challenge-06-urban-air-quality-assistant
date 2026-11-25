import React, { useState, useRef } from 'react';
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
  X,
  ChevronDown,
  Layers,
  ArrowRight
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

interface NavItem {
  id: string;
  label: string;
  icon: React.ElementType;
  badge?: string;
  desc: string;
  category: string;
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
  const [modulesHoverOpen, setModulesHoverOpen] = useState(false);
  const dropdownTimeoutRef = useRef<any>(null);

  const isAdmin = currentUser?.role === 'admin';

  const navItems: NavItem[] = [
    {
      id: 'landing',
      label: 'Overview',
      icon: HomeIcon,
      desc: 'Air quality summary, hero highlights & core stations',
      category: 'General'
    },
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
      desc: 'Live CPCB multi-pollutant telemetry & sub-indices',
      category: 'Analytics'
    },
    {
      id: 'decisions',
      label: 'Decisions',
      icon: Compass,
      badge: 'CORE',
      desc: 'Activity safety, window ventilation & mask protocols',
      category: 'Intelligence'
    },
    {
      id: 'planner',
      label: 'Best Time Planner',
      icon: Calendar,
      desc: '24-Hour diurnal outdoor exercise safety forecasting',
      category: 'Intelligence'
    },
    {
      id: 'homebreath',
      label: 'HomeBreath',
      icon: Wind,
      badge: 'VIRTUAL',
      desc: 'Multi-zone room physics, air change rate & HEPA filtration',
      category: 'Simulation'
    },
    {
      id: 'exposure',
      label: 'Exposure Dose',
      icon: Activity,
      desc: 'ICRP respiratory lung deposition & particle mass uptake',
      category: 'Health'
    },
    {
      id: 'assistant',
      label: 'AI Copilot',
      icon: Sparkles,
      badge: 'GEMINI',
      desc: 'Grounded atmospheric reasoning with Speech-to-Text & TTS',
      category: 'AI Assistant'
    },
    {
      id: 'transparency',
      label: 'Transparency',
      icon: ShieldCheck,
      desc: 'CPCB calibration breakpoints & governance audit logs',
      category: 'Governance'
    },
    ...(isAdmin ? [{
      id: 'admin',
      label: 'Admin Console',
      icon: ShieldAlert,
      badge: 'GOV',
      desc: 'Station calibration, public broadcasts & SMTP relays',
      category: 'Administration'
    }] : [])
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
    setModulesHoverOpen(false);
  };

  const handleMouseEnterModules = () => {
    if (dropdownTimeoutRef.current) clearTimeout(dropdownTimeoutRef.current);
    setModulesHoverOpen(true);
  };

  const handleMouseLeaveModules = () => {
    dropdownTimeoutRef.current = setTimeout(() => {
      setModulesHoverOpen(false);
    }, 200);
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-[#0B1320] border-b border-slate-800/80 shadow-md">
      <div className="max-w-[1440px] mx-auto px-3 lg:px-5 h-16 flex items-center justify-between gap-3">
        
        {/* Left Brand Section */}
        <div
          onClick={() => handleNavClick('landing')}
          className="flex items-center gap-2.5 cursor-pointer select-none group shrink-0"
        >
          <div className="w-9 h-9 rounded-lg bg-emerald-600/20 border border-emerald-500/30 flex items-center justify-center shrink-0 group-hover:scale-105 group-hover:border-emerald-400 transition-all">
            <Wind className="w-5 h-5 text-emerald-400" />
          </div>
          <div className="flex flex-col justify-center">
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-base sm:text-lg tracking-tight text-white font-sans leading-none">
                Vayu<span className="text-emerald-400">Coach</span>
              </span>
              <span className="px-1.5 py-0.5 text-[9px] font-mono font-bold uppercase tracking-wider rounded-md bg-emerald-950/70 text-emerald-300 border border-emerald-800">
                CPCB NAQI
              </span>
            </div>
            <p className="text-[10px] text-slate-400 leading-tight whitespace-nowrap mt-1 hidden sm:block">
              Understand Your Air. Make Better Decisions.
            </p>
          </div>
        </div>

        {/* Center Navigation Links with Hover Effects & Preview Cards */}
        <nav className="hidden min-[1100px]:flex items-center gap-1 xl:gap-1.5 overflow-visible">
          
          {/* "All Functions" Hover Mega Dropdown Trigger */}
          <div
            className="relative"
            onMouseEnter={handleMouseEnterModules}
            onMouseLeave={handleMouseLeaveModules}
          >
            <button
              type="button"
              className={`flex items-center gap-1 px-2 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap shrink-0 transition-all duration-150 cursor-pointer border ${
                modulesHoverOpen
                  ? 'bg-emerald-950/80 text-emerald-300 border-emerald-500/50 shadow-md shadow-emerald-950/50'
                  : 'bg-slate-900/60 text-slate-300 hover:text-white border-slate-700/60 hover:border-emerald-500/40 hover:bg-slate-800/80'
              }`}
            >
              <Layers className="w-3.5 h-3.5 text-emerald-400" />
              <span>All Functions</span>
              <ChevronDown className={`w-3 h-3 text-slate-400 transition-transform duration-200 ${modulesHoverOpen ? 'rotate-180 text-emerald-400' : ''}`} />
            </button>

            {/* Mega Dropdown Panel on Hover */}
            {modulesHoverOpen && (
              <div className="absolute top-full left-0 mt-2 w-[520px] rounded-2xl bg-[#0F172A] border border-slate-800 shadow-2xl p-3.5 z-50 animate-fadeIn backdrop-blur-xl border-t-2 border-t-emerald-500">
                <div className="flex items-center justify-between pb-2.5 mb-2.5 border-b border-slate-800 text-xs">
                  <span className="font-bold text-white flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Access All Environmental Modules</span>
                  </span>
                  <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800/40">
                    9 Integrated Engines
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  {navItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = activeTab === item.id;
                    return (
                      <button
                        key={item.id}
                        onClick={() => handleNavClick(item.id)}
                        className={`p-2.5 rounded-xl text-left transition-all flex items-start gap-2.5 cursor-pointer group/item ${
                          isActive
                            ? 'bg-emerald-950/50 border border-emerald-500/40 shadow-xs'
                            : 'bg-slate-900/40 hover:bg-slate-800/80 border border-slate-800/60 hover:border-emerald-500/30'
                        }`}
                      >
                        <div className={`p-2 rounded-lg shrink-0 transition-colors ${
                          isActive
                            ? 'bg-emerald-600 text-white'
                            : 'bg-slate-800 text-emerald-400 group-hover/item:bg-emerald-600 group-hover/item:text-white'
                        }`}>
                          <Icon className="w-4 h-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-1 mb-0.5">
                            <span className="text-xs font-bold text-white group-hover/item:text-emerald-300 truncate">
                              {item.label}
                            </span>
                            {item.badge && (
                              <span className="text-[8px] font-mono font-bold px-1.5 py-0.2 rounded bg-emerald-950 text-emerald-300 border border-emerald-800/50">
                                {item.badge}
                              </span>
                            )}
                          </div>
                          <p className="text-[10px] text-slate-400 line-clamp-1 leading-snug">
                            {item.desc}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          <div className="h-4 w-px bg-slate-800 mx-0.5" />

          {/* Individual Navigation Buttons with Hover Tooltip Previews */}
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <div key={item.id} className="relative group/nav">
                <button
                  onClick={() => handleNavClick(item.id)}
                  className={`flex items-center gap-1 px-2 xl:px-2.5 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap shrink-0 transition-all duration-200 cursor-pointer ${
                    isActive
                      ? 'bg-gradient-to-r from-emerald-700 via-emerald-600 to-teal-600 text-white font-semibold shadow-md shadow-emerald-700/30 ring-1 ring-emerald-400/40'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800 hover:border-slate-700 hover:shadow-sm'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 shrink-0 transition-transform duration-200 group-hover/nav:scale-110 ${isActive ? 'text-white' : 'text-slate-400 group-hover/nav:text-emerald-400'}`} />
                  <span className="whitespace-nowrap shrink-0">{item.label}</span>
                  {isActive && (
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-200 animate-pulse shrink-0" />
                  )}
                  {item.badge && (
                    <span className={`text-[8px] px-1 py-0.2 rounded font-mono font-bold uppercase whitespace-nowrap shrink-0 ${
                      isActive
                        ? 'bg-white/20 text-white border border-white/30'
                        : item.id === 'admin'
                          ? 'bg-indigo-950 text-indigo-300 border border-indigo-800/60'
                          : 'bg-emerald-950/80 text-emerald-300 border border-emerald-800/60'
                    }`}>
                      {item.badge}
                    </span>
                  )}
                </button>

                {/* Instant Hover Tooltip Preview */}
                <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-56 p-2.5 rounded-xl bg-[#0F172A] border border-slate-800 shadow-xl opacity-0 group-hover/nav:opacity-100 pointer-events-none translate-y-1 group-hover/nav:translate-y-0 transition-all duration-200 z-50 hidden xl:block border-t border-t-emerald-500/80">
                  <div className="flex items-center gap-1.5 mb-1">
                    <Icon className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-xs font-bold text-white">{item.label}</span>
                  </div>
                  <p className="text-[10px] text-slate-300 leading-snug">
                    {item.desc}
                  </p>
                  <div className="mt-1.5 pt-1.5 border-t border-slate-800 flex items-center justify-between text-[9px] font-mono text-emerald-400">
                    <span>{item.category}</span>
                    <span className="flex items-center gap-0.5">Switch <ArrowRight className="w-2.5 h-2.5" /></span>
                  </div>
                </div>
              </div>
            );
          })}
        </nav>

        {/* Right Auth / Profile Action & Quick Controls */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">

          {/* Location Pill */}
          <button
            onClick={onOpenCityModal}
            title={`Switch monitoring station (Current: ${currentLocation.name})`}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-900/90 border border-slate-700 hover:border-emerald-500 text-xs text-slate-200 shadow-2xs hover:bg-slate-800 transition-all cursor-pointer whitespace-nowrap shrink-0"
          >
            <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span className="font-semibold text-xs max-w-[80px] sm:max-w-[100px] truncate">
              {cityName}
            </span>
          </button>

          {/* Live NAQI Badge */}
          <div
            className="hidden sm:flex items-center gap-1.5 px-2 py-1 rounded-lg border shadow-2xs font-mono select-none whitespace-nowrap shrink-0"
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
            <span className="text-[10px] font-semibold hidden md:inline opacity-95">
              {naqiCat}
            </span>
          </div>

          {/* Refresh Feed */}
          <button
            onClick={onRefresh}
            disabled={isLoading}
            title="Refresh environmental telemetry"
            className="p-1.5 rounded-lg bg-slate-900/90 border border-slate-700 text-slate-300 hover:text-emerald-400 hover:border-emerald-400/50 transition-colors disabled:opacity-50 cursor-pointer shrink-0"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-emerald-400' : ''}`} />
          </button>

          {/* Email Notification Preferences Trigger */}
          <button
            onClick={currentUser ? onOpenPreferences : onOpenAuth}
            title="Email Notification Preferences"
            className="p-1.5 rounded-lg bg-slate-900/90 border border-slate-700 text-slate-300 hover:text-emerald-400 hover:border-emerald-400/50 transition-colors relative cursor-pointer shrink-0"
          >
            <Bell className="w-3.5 h-3.5" />
            <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-[#0B1320]" />
          </button>

          {/* Pinned Auth Button / Logged-in User Profile Pill */}
          <div className="shrink-0">
            {currentUser ? (
              <div className="flex items-center gap-1.5 bg-slate-900/90 pl-2 pr-1 py-1 rounded-lg border border-slate-700 text-xs shrink-0">
                <span className="font-semibold text-slate-200 max-w-[75px] sm:max-w-[100px] truncate text-xs">
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

          {/* Mobile / Tablet Hamburger Toggle (< 1100px) */}
          <button
            onClick={() => setMobileDrawerOpen((prev) => !prev)}
            aria-label="Toggle Navigation Menu"
            className="min-[1100px]:hidden p-1.5 rounded-lg bg-slate-900/90 border border-slate-700 text-slate-300 hover:text-white hover:border-slate-600 transition cursor-pointer shrink-0"
          >
            {mobileDrawerOpen ? <X className="w-4 h-4 text-emerald-400" /> : <Menu className="w-4 h-4" />}
          </button>

        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileDrawerOpen && (
        <div className="min-[1100px]:hidden bg-[#0F172A] border-b border-slate-800 p-4 space-y-2 animate-fadeIn shadow-2xl">
          <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400 px-2 pb-1 border-b border-slate-800 mb-2">
            Navigation Modules
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition cursor-pointer ${
                    isActive
                      ? 'bg-emerald-600 text-white font-semibold shadow-xs'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/80 border border-transparent hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-emerald-400'}`} />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className={`text-[8px] px-1.5 py-0.2 rounded font-mono font-bold uppercase ${
                      isActive
                        ? 'bg-white/20 text-white'
                        : 'bg-emerald-950 text-emerald-300 border border-emerald-800'
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
