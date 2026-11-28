import React, { useState } from 'react';
import {
  LayoutDashboard,
  Compass,
  Sparkles,
  Calendar,
  Layers,
  Wind,
  Activity,
  ShieldCheck,
  Bell,
  MapPin,
  LogOut,
  User as UserIcon,
  X,
  ChevronRight,
  ShieldAlert,
  Home
} from 'lucide-react';
import { User } from '../types/auth';
import { LocationInfo, EnvironmentalReadings } from '../types';
import { ThemeToggle } from './ThemeToggle';

interface MobileBottomNavProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  currentUser: User | null;
  onOpenAuth: () => void;
  onLogout: () => void;
  onOpenPreferences: () => void;
  onOpenCityModal: () => void;
  currentLocation: LocationInfo | null;
  readings: EnvironmentalReadings | null;
  isAdmin: boolean;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  activeTab,
  setActiveTab,
  currentUser,
  onOpenAuth,
  onLogout,
  onOpenPreferences,
  onOpenCityModal,
  currentLocation,
  isAdmin
}) => {
  const [isMoreOpen, setIsMoreOpen] = useState(false);

  const primaryTabs = [
    { id: 'dashboard', label: 'Home', icon: LayoutDashboard },
    { id: 'decisions', label: 'Decisions', icon: Compass, badge: 'CORE' },
    { id: 'assistant', label: 'Copilot', icon: Sparkles, badge: 'AI' },
    { id: 'planner', label: 'Planner', icon: Calendar },
  ];

  const secondaryModules = [
    {
      id: 'homebreath',
      label: 'HomeBreath Simulation',
      desc: 'Multi-zone room physics & HEPA CADR',
      icon: Wind,
      badge: 'VIRTUAL'
    },
    {
      id: 'exposure',
      label: 'Exposure Dose Calculator',
      desc: 'ICRP lung deposition & particle uptake',
      icon: Activity
    },
    {
      id: 'landing',
      label: 'Platform Overview',
      desc: 'Hero overview, features & methodology',
      icon: Home
    },
    {
      id: 'transparency',
      label: 'Data Transparency',
      desc: 'CPCB sub-indices & calibration audits',
      icon: ShieldCheck
    },
    ...(isAdmin ? [{
      id: 'admin',
      label: 'Admin Console',
      desc: 'Station calibration & emergency broadcasts',
      icon: ShieldAlert,
      badge: 'GOV'
    }] : [])
  ];

  const handleSelectTab = (id: string) => {
    setActiveTab(id);
    setIsMoreOpen(false);
  };

  const isMoreActive = !primaryTabs.some(t => t.id === activeTab);

  return (
    <>
      {/* Fixed Bottom Navigation Bar (< 768px) */}
      <nav
        aria-label="Mobile Bottom Navigation"
        className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#0B1423]/95 backdrop-blur-lg border-t border-slate-800/80 px-2 py-1.5 shadow-2xl safe-area-pb"
      >
        <div className="flex items-center justify-around max-w-md mx-auto">
          {primaryTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                type="button"
                key={tab.id}
                onClick={() => handleSelectTab(tab.id)}
                aria-current={isActive ? 'page' : undefined}
                className={`flex flex-col items-center justify-center flex-1 py-1 px-1 rounded-xl transition-all cursor-pointer relative ${
                  isActive
                    ? 'text-emerald-400 font-semibold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <div className={`p-1 rounded-lg transition-colors ${
                  isActive ? 'bg-emerald-950/80 text-emerald-400' : ''
                }`}>
                  <Icon className="w-5 h-5 shrink-0" />
                </div>
                <span className="text-[10px] mt-0.5 tracking-tight">{tab.label}</span>
                {tab.badge && (
                  <span className="absolute top-0 right-2 w-1.5 h-1.5 rounded-full bg-emerald-400" />
                )}
              </button>
            );
          })}

          {/* 5th Tab: "More" */}
          <button
            type="button"
            onClick={() => setIsMoreOpen(prev => !prev)}
            aria-expanded={isMoreOpen}
            aria-label="More navigation options"
            className={`flex flex-col items-center justify-center flex-1 py-1 px-1 rounded-xl transition-all cursor-pointer relative ${
              isMoreActive || isMoreOpen
                ? 'text-emerald-400 font-semibold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <div className={`p-1 rounded-lg transition-colors ${
              isMoreActive || isMoreOpen ? 'bg-emerald-950/80 text-emerald-400' : ''
            }`}>
              <Layers className="w-5 h-5 shrink-0" />
            </div>
            <span className="text-[10px] mt-0.5 tracking-tight">More</span>
            {isMoreActive && (
              <span className="absolute top-0 right-2 w-1.5 h-1.5 rounded-full bg-emerald-400" />
            )}
          </button>
        </div>
      </nav>

      {/* "More" Bottom Sheet Modal (< 768px) */}
      {isMoreOpen && (
        <div
          className="md:hidden fixed inset-0 z-50 flex flex-col justify-end"
          role="dialog"
          aria-modal="true"
          aria-label="More modules and actions"
        >
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/70 backdrop-blur-xs transition-opacity"
            onClick={() => setIsMoreOpen(false)}
          />

          {/* Sheet Panel */}
          <div className="relative bg-[#0F172A] border-t border-slate-700/80 rounded-t-3xl p-4 shadow-2xl max-h-[85vh] overflow-y-auto z-10 animate-slide-up">
            
            {/* Header / Grab Handle */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <span className="w-8 h-1 bg-slate-600 rounded-full mx-auto absolute left-1/2 -translate-x-1/2 top-2" />
                <Layers className="w-4 h-4 text-emerald-400" />
                <span className="font-heading text-sm font-bold text-white">More Modules & Actions</span>
              </div>
              <button
                type="button"
                onClick={() => setIsMoreOpen(false)}
                aria-label="Close navigation menu"
                className="p-1 rounded-lg text-slate-400 hover:text-white bg-slate-800/80"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* User Account / Auth Section */}
            <div className="my-3 p-3 rounded-2xl bg-slate-900/90 border border-slate-800 flex items-center justify-between gap-3">
              {currentUser ? (
                <>
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-8 h-8 rounded-full bg-emerald-950 border border-emerald-700 flex items-center justify-center shrink-0">
                      <UserIcon className="w-4 h-4 text-emerald-400" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-white truncate">{currentUser.name}</p>
                      <p className="text-[10px] text-slate-400 truncate">{currentUser.email}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setIsMoreOpen(false);
                      onLogout();
                    }}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold text-rose-300 bg-rose-950/80 border border-rose-800/70 hover:bg-rose-900 transition shrink-0"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Sign Out</span>
                  </button>
                </>
              ) : (
                <button
                  onClick={() => {
                    setIsMoreOpen(false);
                    onOpenAuth();
                  }}
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 transition shadow-md"
                >
                  <UserIcon className="w-4 h-4" />
                  <span>Sign In / Create Account</span>
                </button>
              )}
            </div>

            {/* Quick Actions (Location, Alerts, Theme) */}
            <div className="grid grid-cols-3 gap-2 mb-3">
              <button
                onClick={() => {
                  setIsMoreOpen(false);
                  onOpenCityModal();
                }}
                className="flex flex-col items-center justify-center p-2 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-emerald-500/50 text-center cursor-pointer transition"
              >
                <MapPin className="w-4 h-4 text-emerald-400 mb-1 shrink-0" />
                <span className="text-[10px] text-slate-400 leading-none">Station</span>
                <span className="text-xs font-semibold text-white truncate max-w-full mt-0.5">{currentLocation ? currentLocation.name.split(',')[0] : 'Select'}</span>
              </button>

              <button
                onClick={() => {
                  setIsMoreOpen(false);
                  if (currentUser) {
                    onOpenPreferences();
                  } else {
                    onOpenAuth();
                  }
                }}
                className="flex flex-col items-center justify-center p-2 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-emerald-500/50 text-center cursor-pointer transition"
              >
                <Bell className="w-4 h-4 text-emerald-400 mb-1 shrink-0" />
                <span className="text-[10px] text-slate-400 leading-none">Alerts</span>
                <span className="text-xs font-semibold text-white truncate mt-0.5">Preferences</span>
              </button>

              <div className="flex flex-col items-center justify-center p-2 rounded-xl bg-slate-900/60 border border-slate-800 text-center">
                <ThemeToggle className="p-1 mb-0.5" />
                <span className="text-[10px] text-slate-400 leading-none">Display</span>
                <span className="text-[11px] font-semibold text-white mt-0.5">Theme</span>
              </div>
            </div>

            {/* Secondary Navigation List */}
            <div className="space-y-1.5 pb-2">
              <p className="text-[10px] font-mono uppercase tracking-wider text-slate-400 px-1">
                Advanced Environmental Engines
              </p>
              {secondaryModules.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleSelectTab(item.id)}
                    className={`w-full flex items-center justify-between p-2.5 rounded-xl transition cursor-pointer text-left ${
                      isActive
                        ? 'bg-emerald-950/70 border border-emerald-500/40 text-emerald-300'
                        : 'bg-slate-900/40 hover:bg-slate-800/80 border border-slate-800/60 text-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={`p-2 rounded-lg shrink-0 ${
                        isActive ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-emerald-400'
                      }`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-bold text-white truncate">{item.label}</span>
                          {item.badge && (
                            <span className="text-[8px] font-mono px-1 py-0.2 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
                              {item.badge}
                            </span>
                          )}
                        </div>
                        <p className="text-[10px] text-slate-400 truncate">{item.desc}</p>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-500 shrink-0" />
                  </button>
                );
              })}
            </div>

          </div>
        </div>
      )}
    </>
  );
};
