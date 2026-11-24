import React from 'react';
import { Wind, Shield, HeartHandshake, MapPin, ExternalLink, Activity, Info } from 'lucide-react';

interface FooterProps {
  onNavigate: (tab: string) => void;
  onOpenAuth?: () => void;
  isAdmin?: boolean;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate, onOpenAuth, isAdmin }) => {
  return (
    <footer className="w-full bg-slate-900 text-slate-300 border-t border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {/* Brand and Mission */}
          <div className="space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-white shadow-md shadow-emerald-500/20">
                <Wind className="w-5 h-5" />
              </div>
              <div className="flex flex-col">
                <span className="font-extrabold text-xl tracking-tight text-white">
                  Vayu<span className="text-emerald-400">Coach</span>
                </span>
                <span className="text-[10px] text-emerald-400/80 font-medium tracking-wider uppercase">
                  Decision Intelligence
                </span>
              </div>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Understand Your Air. Make Better Decisions. Translating atmospheric chemistry into actionable timing, indoor protection, and personalized daily guidance.
            </p>
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>Initial Station Focus: Mangaluru, Karnataka</span>
            </div>
          </div>

          {/* Quick Nav: Modules */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-4">
              Intelligence Modules
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button
                  onClick={() => onNavigate('dashboard')}
                  className="text-slate-400 hover:text-emerald-400 transition"
                >
                  Live AQI Dashboard & Speciation
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('decisions')}
                  className="text-slate-400 hover:text-emerald-400 transition"
                >
                  Activity & Travel Decision Engine
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('planner')}
                  className="text-slate-400 hover:text-emerald-400 transition"
                >
                  Best Time Planner & Coastal Diurnal Wind
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('homebreath')}
                  className="text-slate-400 hover:text-emerald-400 transition"
                >
                  HomeBreath™ Indoor Infiltration Simulator
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('exposure')}
                  className="text-slate-400 hover:text-emerald-400 transition"
                >
                  Daily Exposure & Micro-Action Simulator
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('assistant')}
                  className="text-slate-400 hover:text-emerald-400 transition"
                >
                  AI Environmental Health Assistant
                </button>
              </li>
            </ul>
          </div>

          {/* Standards & Transparency */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-4">
              Scientific Standards
            </h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                <span>CPCB National AQI (NAQI) Standard</span>
              </li>
              <li className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-teal-400" />
                <span>Sub-index Breakpoint Interpolation</span>
              </li>
              <li className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                <span>Arabian Sea Afternoon Breeze Dispersion</span>
              </li>
              <li className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
                <span>Mass-Balance PM2.5 Infiltration Modeling</span>
              </li>
              <li className="pt-2">
                <button
                  onClick={() => onNavigate('transparency')}
                  className="text-emerald-400 hover:underline flex items-center gap-1 font-semibold"
                >
                  <Info className="w-3.5 h-3.5" />
                  View Data Transparency & Methodology
                </button>
              </li>
            </ul>
          </div>

          {/* Security & Access */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-4">
              Account & Governance
            </h4>
            <p className="text-xs text-slate-400 leading-relaxed mb-3">
              Role-Based Access Control (RBAC) enables customized personal sensitivity profiles for citizens and threshold calibration for environmental officers.
            </p>
            <div className="space-y-2">
              <button
                onClick={() => onNavigate('admin')}
                className="w-full py-2 px-3 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition flex items-center justify-between"
              >
                <span className="flex items-center gap-1.5">
                  <Shield className="w-3.5 h-3.5 text-indigo-400" />
                  Admin Governance Console
                </span>
                {isAdmin && <span className="text-[10px] bg-indigo-500/30 text-indigo-300 px-1.5 py-0.5 rounded">Active</span>}
              </button>
              {onOpenAuth && (
                <button
                  onClick={onOpenAuth}
                  className="w-full py-2 px-3 rounded-lg text-xs font-medium bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 transition text-center"
                >
                  Citizen / Admin Sign In
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Disclaimer & Bottom Bar */}
        <div className="pt-8 border-t border-slate-800 text-xs text-slate-400 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-start gap-2 max-w-2xl">
            <HeartHandshake className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <p className="text-[11px] leading-relaxed">
              <strong>Medical Disclaimer:</strong> VayuCoach provides simulated indoor models, exposure approximations, and environmental guidance based on ambient atmospheric feeds. It is strictly software-only and is not a medical device or certified indoor monitor. Consult a physician for acute respiratory management.
            </p>
          </div>
          <div className="text-right text-[11px] shrink-0">
            <p className="text-slate-400">
              © {new Date().getFullYear()} VayuCoach • Challenge 06
            </p>
            <p className="text-slate-400 text-[10px]">
              Built for Mangaluru & Indian Urban Environments
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};
