import React from 'react';
import {
  Wind,
  Compass,
  Calendar,
  Activity,
  Sparkles,
  ShieldCheck,
  ArrowRight,
  CheckCircle2,
  Clock,
  Waves,
  Cpu,
  Info,
  MapPin,
  TrendingDown,
  Droplets,
  Thermometer
} from 'lucide-react';
import { EnvironmentalReadings, LocationInfo } from '../types';

interface LandingProps {
  readings: EnvironmentalReadings | null;
  currentLocation: LocationInfo;
  onNavigate: (tab: string) => void;
  onOpenCityModal: () => void;
}

export const Landing: React.FC<LandingProps> = ({
  readings,
  currentLocation,
  onNavigate,
  onOpenCityModal
}) => {
  const naqiVal = readings ? readings.indian_naqi : 43;
  const naqiCat = readings ? readings.indian_naqi_category : 'Good';
  const pm25 = readings ? readings.pm2_5 : 25.6;

  return (
    <div className="flex flex-col w-full min-h-screen bg-slate-50 selection:bg-emerald-600 selection:text-white">
      
      {/* 1. HERO SECTION */}
      <section className="relative overflow-hidden pt-12 pb-16 sm:pt-20 sm:pb-28 border-b border-slate-200/80 bg-gradient-to-b from-emerald-50/50 via-slate-50 to-white">
        
        {/* Subtle atmospheric ambient glow */}
        <div className="absolute -top-36 left-1/2 -translate-x-1/2 w-[720px] h-[380px] bg-gradient-to-b from-emerald-200/25 via-teal-100/20 to-transparent blur-3xl pointer-events-none rounded-full" />
        <div className="absolute top-96 right-8 w-96 h-96 bg-sky-200/15 blur-3xl pointer-events-none rounded-full" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center flex flex-col items-center">
          
          {/* Eyebrow Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/95 border border-emerald-200/90 shadow-2xs mb-6 backdrop-blur-md">
            <Sparkles className="w-4 h-4 text-emerald-700 animate-pulse" />
            <span className="font-mono text-xs font-semibold text-emerald-900 tracking-tight">
              AI-Powered Urban Air Quality Decision Intelligence
            </span>
          </div>

          {/* Main Hero Headline */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-slate-900 max-w-4xl font-sans leading-tight sm:leading-none mb-6">
            <span>Your environment changes.</span>{' '}
            <span className="bg-gradient-to-r from-emerald-800 via-emerald-700 to-teal-700 bg-clip-text text-transparent">
              Your decisions should too.
            </span>
          </h1>

          {/* Supporting text */}
          <p className="text-base sm:text-xl text-slate-600 max-w-2xl mb-8 leading-relaxed font-sans font-normal">
            Turn air-quality and weather intelligence into smarter everyday decisions. From safe outdoor aerobic training to optimal window cross-ventilation and virtual indoor cooking simulations.
          </p>

          {/* CTAs */}
          <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 mb-12">
            <button
              onClick={() => onNavigate('decisions')}
              className="flex items-center gap-2 px-6 py-3.5 rounded-xl bg-emerald-800 hover:bg-emerald-700 text-white font-semibold text-sm shadow-md shadow-emerald-900/20 transition-all hover:scale-102 cursor-pointer"
            >
              <Compass className="w-4 h-4" />
              <span>Launch Decision Console</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => onNavigate('dashboard')}
              className="flex items-center gap-2 px-6 py-3.5 rounded-xl bg-white hover:bg-slate-50 text-slate-800 font-semibold text-sm border border-slate-200 shadow-2xs transition-all hover:border-emerald-300 cursor-pointer"
            >
              <span>Explore Live Telemetry</span>
            </button>
          </div>

          {/* Live Environmental Snapshot Card (Mangaluru) */}
          <div className="w-full max-w-2xl bg-white/95 backdrop-blur-md rounded-2xl p-6 border border-slate-200/90 shadow-lg text-left">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <span className="w-3 h-3 rounded-full bg-emerald-600 animate-ping" />
                <div>
                  <span className="text-xs font-mono font-semibold text-slate-400 uppercase tracking-wider">
                    Regional Station Telemetry
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-base font-bold text-slate-900 font-sans">
                      {currentLocation.name}
                    </span>
                    <button
                      onClick={onOpenCityModal}
                      className="text-xs text-emerald-700 hover:underline font-medium"
                    >
                      (Change)
                    </button>
                  </div>
                </div>
              </div>

              {/* NAQI Index Readout */}
              <div className="flex items-center gap-3 font-mono">
                <div className="text-right">
                  <span className="text-3xl font-extrabold text-emerald-800 tabular-nums">
                    {naqiVal}
                  </span>
                  <span className="text-[10px] text-slate-400 block -mt-1 font-sans">CPCB NAQI</span>
                </div>
                <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                  {naqiCat}
                </span>
              </div>
            </div>

            {/* Quick Metrics Array */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 text-center font-mono">
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-[10px] text-slate-400 block uppercase">PM2.5</span>
                <span className="text-sm font-bold text-slate-800">{pm25} µg/m³</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-[10px] text-slate-400 block uppercase">Temp / RH</span>
                <span className="text-sm font-bold text-slate-800">
                  {readings?.temperature || 31}°C • {readings?.relative_humidity || 62}%
                </span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-[10px] text-slate-400 block uppercase">Coastal Breeze</span>
                <span className="text-sm font-bold text-emerald-700">
                  {readings?.wind_speed || 11.2} km/h (WSW)
                </span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-[10px] text-slate-400 block uppercase">Clean Window</span>
                <span className="text-sm font-bold text-teal-700">1:00 – 4:00 PM</span>
              </div>
            </div>
          </div>

          {/* Standards Attribution Strip */}
          <div className="flex flex-wrap items-center justify-center gap-6 mt-8 text-xs font-mono text-slate-500">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>CPCB Indian National AQI (NAQI)</span>
            </span>
            <span>•</span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>Open-Meteo & OpenAQ Feeds</span>
            </span>
            <span>•</span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>Grounded Google Gemini 2.5 AI</span>
            </span>
          </div>

        </div>
      </section>

      {/* 2. CORE CAPABILITIES (Beyond Ordinary Dashboards) */}
      <section className="py-16 sm:py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-emerald-800 mb-2">
            Environmental Decision Intelligence
          </h2>
          <h3 className="text-2xl sm:text-4xl font-extrabold text-slate-900 font-sans tracking-tight">
            Stop Guessing. Know Exactly When To Act.
          </h3>
          <p className="text-slate-600 text-sm sm:text-base mt-3">
            Ordinary air apps merely tell you the air is unhealthy. VayuCoach computes what that means for your workout, walking pace, window status, and household cooking fumes.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
          
          {/* Card 1: Smart Decision Engine */}
          <div
            onClick={() => onNavigate('decisions')}
            className="rounded-2xl bg-white p-6 sm:p-7 border border-slate-200/90 hover:border-emerald-400 hover:shadow-lg transition-all cursor-pointer group flex flex-col justify-between"
          >
            <div>
              <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                <Compass className="w-6 h-6" />
              </div>
              <h4 className="text-lg font-bold text-slate-900 font-sans mb-2">
                Deterministic Decision Engine
              </h4>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Evaluates outdoor exercise, walking, cycling, commuting, and household ventilation against official CPCB NAQI thresholds and coastal wind dispersion patterns.
              </p>
            </div>
            <div className="mt-6 flex items-center gap-1 text-xs font-bold text-emerald-800 group-hover:gap-2 transition-all">
              <span>View Decisions</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </div>

          {/* Card 2: Best Time Planner */}
          <div
            onClick={() => onNavigate('planner')}
            className="rounded-2xl bg-white p-6 sm:p-7 border border-slate-200/90 hover:border-emerald-400 hover:shadow-lg transition-all cursor-pointer group flex flex-col justify-between"
          >
            <div>
              <div className="w-12 h-12 rounded-xl bg-teal-100 text-teal-800 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                <Calendar className="w-6 h-6" />
              </div>
              <h4 className="text-lg font-bold text-slate-900 font-sans mb-2">
                24-Hour Best Time Planner
              </h4>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Scores every hour (0-100) based on diurnal particulate trajectories and temperature. Ranks the cleanest available window for workouts and outdoor errands.
              </p>
            </div>
            <div className="mt-6 flex items-center gap-1 text-xs font-bold text-teal-800 group-hover:gap-2 transition-all">
              <span>Plan Outdoor Time</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </div>

          {/* Card 3: HomeBreath Simulator */}
          <div
            onClick={() => onNavigate('homebreath')}
            className="rounded-2xl bg-white p-6 sm:p-7 border border-slate-200/90 hover:border-emerald-400 hover:shadow-lg transition-all cursor-pointer group flex flex-col justify-between"
          >
            <div>
              <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                <Wind className="w-6 h-6" />
              </div>
              <h4 className="text-lg font-bold text-slate-900 font-sans mb-2">
                HomeBreath Virtual Indoor Air
              </h4>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Software-only mass-balance simulation. Models how tadka frying, mosquito coils, incense, and window/exhaust fan states alter indoor PM2.5 decay over 6 hours.
              </p>
            </div>
            <div className="mt-6 flex items-center gap-1 text-xs font-bold text-amber-800 group-hover:gap-2 transition-all">
              <span>Simulate Indoor Air</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </div>

        </div>
      </section>

      {/* 3. HOW THE DECISION ENGINE WORKS */}
      <section className="py-16 bg-slate-100/70 border-y border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-xl mx-auto mb-12">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-emerald-800">
              Rigorous Mathematical Methodology
            </span>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-sans mt-1">
              How VayuCoach Decides
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-6">
            
            <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs">
              <span className="font-mono text-2xl font-bold text-emerald-800">01</span>
              <h4 className="font-bold text-slate-900 text-sm mt-2 mb-1">Telemetry Ingestion</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Pulls hourly PM2.5, PM10, ozone, temperature, and wind vectors via Open-Meteo & OpenAQ stations.
              </p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs">
              <span className="font-mono text-2xl font-bold text-emerald-800">02</span>
              <h4 className="font-bold text-slate-900 text-sm mt-2 mb-1">Threshold Normalization</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Interpolates piecewise breakpoints for CPCB Indian NAQI (0-500) and US-EPA AQI without mixing standards.
              </p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs">
              <span className="font-mono text-2xl font-bold text-emerald-800">03</span>
              <h4 className="font-bold text-slate-900 text-sm mt-2 mb-1">Dosimetry & Uncertainty</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Factors in activity minute volumes (0.5 to 3.8 m³/h), distance from stations, and data freshness.
              </p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs">
              <span className="font-mono text-2xl font-bold text-emerald-800">04</span>
              <h4 className="font-bold text-slate-900 text-sm mt-2 mb-1">Actionable Decisions</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Outputs clear, deterministic advice with alternatives, limitations, and grounded Gemini natural language explanations.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* 4. FOOTER */}
      <footer className="mt-auto py-10 bg-white border-t border-slate-200 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Wind className="w-4 h-4 text-emerald-700" />
            <span className="font-bold text-slate-800 font-sans">VayuCoach Environmental Intelligence</span>
            <span>•</span>
            <span>Pan-India Coverage • Live Station: {currentLocation.name.split(',')[0]}</span>
          </div>
          <div className="flex items-center gap-4 font-mono text-[11px]">
            <button onClick={() => onNavigate('transparency')} className="hover:underline text-emerald-700">
              Data & Transparency
            </button>
            <span>•</span>
            <span>CPCB NAQI Standards</span>
          </div>
        </div>
      </footer>

    </div>
  );
};
