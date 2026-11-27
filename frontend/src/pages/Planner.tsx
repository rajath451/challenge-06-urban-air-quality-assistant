import React, { useState, useEffect } from 'react';
import {
  Calendar,
  Clock,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Compass,
  ArrowRight,
  ShieldCheck,
  Sun,
  Flame
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { EnvironmentalReadings, LocationInfo, PlannerResponse } from '../types';
import { fetchPlanner } from '../services/api';

interface PlannerProps {
  readings: EnvironmentalReadings | null;
  currentLocation: LocationInfo | null;
  onNavigate: (tab: string) => void;
  onOpenCityModal: () => void;
}

export const Planner: React.FC<PlannerProps> = ({
  readings,
  currentLocation,
  onNavigate,
  onOpenCityModal
}) => {
  const [activity, setActivity] = useState<string>('exercise');
  const [duration, setDuration] = useState<number>(45);
  const [sensitivity, setSensitivity] = useState<string>('normal');
  const [plan, setPlan] = useState<PlannerResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function load() {
      if (!readings || !currentLocation) {
        setIsLoading(false);
        return;
      }
      setIsLoading(true);
      try {
        const res = await fetchPlanner(readings, currentLocation, activity, duration, sensitivity);
        setPlan(res);
      } catch (err) {
        console.error('Planner load error:', err);
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, [readings, currentLocation, activity, duration, sensitivity]);

  if (!currentLocation || !readings) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 sm:py-24 text-center font-sans animate-fade-in">
        <div className="rounded-3xl bg-white p-8 sm:p-14 border border-slate-200/90 shadow-sm">
          <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-4 border border-emerald-200">
            <Calendar className="w-8 h-8" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-heading font-extrabold text-slate-900 mb-3">
            Select a Monitoring Station
          </h2>
          <p className="text-sm sm:text-base text-slate-600 mb-8 max-w-lg mx-auto leading-relaxed">
            The 24-Hour Best Time Planner models diurnal atmospheric dispersion curves for your specific geographic station.
          </p>
          <button
            onClick={onOpenCityModal}
            className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-sm shadow-md shadow-emerald-950/20 transition cursor-pointer"
          >
            <span>Choose Monitoring Station</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  const activityOptions = [
    { id: 'exercise', label: 'Aerobic Exercise / Running' },
    { id: 'walk', label: 'Walking & Outdoor Stroll' },
    { id: 'cycling', label: 'Cycling Commute' },
    { id: 'errands', label: 'Outdoor Errands' }
  ];

  const durationOptions = [15, 30, 45, 60, 90];

  const sensitivityOptions = [
    { id: 'normal', label: 'General Population' },
    { id: 'sensitive', label: 'Sensitive / Asthma Risk' },
    { id: 'athletic', label: 'High-Performance Athlete' }
  ];

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-5 sm:py-8 space-y-6 sm:space-y-8 animate-fade-in w-full overflow-hidden">
      
      {/* Header */}
      <div className="pb-4 border-b border-slate-200/80">
        <div className="flex items-center gap-2 text-[10px] sm:text-xs font-mono font-semibold text-emerald-800 uppercase tracking-wider">
          <Calendar className="w-3.5 h-3.5" />
          <span>24-Hour Atmospheric Trajectory & Suitability Engine</span>
        </div>
        <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-slate-900 font-sans tracking-tight mt-0.5 break-words">
          Best Time Activity Planner
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-3xl">
          Don't exercise blindly. Diurnal atmospheric dynamics, boundary layer mixing, and wind shifts create sharp particulate variance across 24 hours in urban regions. Select your planned duration to identify the cleanest atmospheric window for your location.
        </p>
      </div>

      {/* Control Panel */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-5">
        
        {/* Activity Selection */}
        <div>
          <label className="text-xs font-bold text-slate-700 font-sans block mb-2">
            Target Activity Type
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {activityOptions.map((opt) => (
              <button
                key={opt.id}
                onClick={() => setActivity(opt.id)}
                className={`p-2.5 rounded-xl border text-xs font-medium text-center transition-all cursor-pointer ${
                  activity === opt.id
                    ? 'bg-emerald-50 border-emerald-600 text-emerald-900 font-bold shadow-2xs'
                    : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Duration & Sensitivity Selectors */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2 border-t border-slate-100">
          
          {/* Duration */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold text-slate-700 font-sans">
                Activity Duration
              </label>
              <span className="font-mono text-xs font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                {duration} minutes
              </span>
            </div>
            <div className="flex items-center gap-2">
              {durationOptions.map((d) => (
                <button
                  key={d}
                  onClick={() => setDuration(d)}
                  className={`flex-1 py-1.5 rounded-lg border text-xs font-mono font-medium transition-colors cursor-pointer ${
                    duration === d
                      ? 'bg-emerald-800 text-white font-bold'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {d}m
                </button>
              ))}
            </div>
          </div>

          {/* Sensitivity Profile */}
          <div>
            <label className="text-xs font-bold text-slate-700 font-sans block mb-2">
              Individual Sensitivity Profile
            </label>
            <div className="flex items-center gap-2">
              {sensitivityOptions.map((s) => (
                <button
                  key={s.id}
                  onClick={() => setSensitivity(s.id)}
                  className={`flex-1 py-1.5 px-2 rounded-lg border text-xs font-sans text-center transition-colors cursor-pointer ${
                    sensitivity === s.id
                      ? 'bg-emerald-50 border-emerald-600 text-emerald-900 font-bold'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

        </div>

      </div>

      {/* Top 3 Ranked Safe Windows */}
      {plan && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-mono font-bold uppercase tracking-wider text-slate-700">
              Top Ranked Windows Based On Forecast Telemetry
            </h3>
            <span className="text-[10px] font-mono text-slate-400">
              Confidence: {plan.confidence_level}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {plan.best_windows.map((win, idx) => (
              <div
                key={idx}
                className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs relative flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-mono text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      Rank #{idx + 1}
                    </span>
                    <span className="font-mono text-xs font-bold text-emerald-700">
                      Score: {win.avg_suitability}/100
                    </span>
                  </div>
                  <h4 className="text-lg font-bold text-slate-900 font-mono my-1">
                    {win.window_label}
                  </h4>
                  <p className="text-xs text-slate-500 font-mono">
                    Expected PM2.5: ~{win.expected_avg_pm25} µg/m³
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-emerald-800 font-semibold">{win.recommendation}</span>
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 24-Hour Hourly Suitability Chart */}
      {plan && (
        <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h3 className="text-base font-bold text-slate-900 font-sans">
                Hourly Suitability Trajectory (Next 24 Hours)
              </h3>
              <p className="text-xs text-slate-500 font-sans">
                Higher scores (75+) represent optimal times when wind dispersion drops ambient particulate concentrations.
              </p>
            </div>
            <span className="text-xs font-mono text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200">
              Arabian Sea Breeze Window Active Midday
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={plan.hourly_schedule} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="suitabilityGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#059669" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#059669" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="hour" stroke="#64748b" fontSize={11} fontFamily="JetBrains Mono" tickLine={false} />
                <YAxis stroke="#64748b" fontSize={11} fontFamily="JetBrains Mono" tickLine={false} domain={[0, 100]} />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-slate-900 text-white p-3 rounded-xl font-mono text-xs shadow-lg border border-slate-700 space-y-1">
                          <span className="text-slate-400 block border-b border-slate-700 pb-1">{data.time_label} ({data.hour})</span>
                          <div>Suitability Score: <strong className="text-emerald-400">{data.suitability_score}/100 ({data.suitability_label})</strong></div>
                          <div>Expected PM2.5: <strong className="text-teal-400">{data.pm2_5} µg/m³</strong></div>
                          <div>Wind: <strong className="text-sky-400">{data.wind_speed} km/h</strong></div>
                          <p className="text-[10px] text-slate-300 font-sans pt-1">{data.notes}</p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Area type="monotone" dataKey="suitability_score" stroke="#059669" strokeWidth={2.5} fill="url(#suitabilityGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Uncertainty & Limitations Strip */}
          <div className="mt-3 pt-3 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[11px] text-slate-500 font-sans">
            <span>{plan.uncertainty_explanation}</span>
            <span className="font-semibold text-rose-700">{plan.disclaimer}</span>
          </div>
        </div>
      )}

    </div>
  );
};
