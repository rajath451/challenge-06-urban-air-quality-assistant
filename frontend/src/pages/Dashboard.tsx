import React from 'react';
import {
  Wind,
  Droplets,
  Thermometer,
  Compass,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Calendar,
  Layers
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, ReferenceLine } from 'recharts';
import { EnvironmentalReadings, LocationInfo } from '../types';

interface DashboardProps {
  readings: EnvironmentalReadings;
  currentLocation: LocationInfo;
  onNavigate: (tab: string) => void;
  onOpenCityModal: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  readings,
  currentLocation,
  onNavigate,
  onOpenCityModal
}) => {
  const {
    pm2_5,
    pm10,
    indian_naqi,
    indian_naqi_category,
    us_aqi,
    us_aqi_category,
    temperature,
    relative_humidity,
    wind_speed,
    wind_direction,
    weather_condition,
    data_source,
    data_freshness_minutes
  } = readings;

  // Hourly synthetic or simulated curve for Mangaluru coastal diurnal pattern
  const hourlyData = [
    { time: '05:00', aqi: Math.round(indian_naqi * 1.3), pm25: Math.round(pm2_5 * 1.3) },
    { time: '07:00', aqi: Math.round(indian_naqi * 1.4), pm25: Math.round(pm2_5 * 1.4) },
    { time: '09:00', aqi: Math.round(indian_naqi * 1.25), pm25: Math.round(pm2_5 * 1.25) },
    { time: '11:00', aqi: Math.round(indian_naqi * 0.95), pm25: Math.round(pm2_5 * 0.95) },
    { time: '13:00', aqi: Math.round(indian_naqi * 0.65), pm25: Math.round(pm2_5 * 0.65) },
    { time: '15:00', aqi: Math.round(indian_naqi * 0.60), pm25: Math.round(pm2_5 * 0.60) },
    { time: '17:00', aqi: Math.round(indian_naqi * 0.85), pm25: Math.round(pm2_5 * 0.85) },
    { time: '19:00', aqi: Math.round(indian_naqi * 1.15), pm25: Math.round(pm2_5 * 1.15) },
    { time: '21:00', aqi: Math.round(indian_naqi * 1.20), pm25: Math.round(pm2_5 * 1.20) },
    { time: '23:00', aqi: Math.round(indian_naqi * 1.05), pm25: Math.round(pm2_5 * 1.05) }
  ];

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

  const naqiColor = getNaqiColor(indian_naqi_category);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fade-in">
      
      {/* Location Station Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200/80">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono font-semibold text-emerald-800 uppercase tracking-wider">
            <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
            <span>Active Environmental Monitoring Station</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-sans tracking-tight mt-0.5">
            {currentLocation.name}
          </h1>
          <p className="text-xs text-slate-500 font-mono mt-0.5">
            Coordinates: {currentLocation.latitude.toFixed(4)}° N, {currentLocation.longitude.toFixed(4)}° E • Station: {currentLocation.station_name || 'Regional CAAQMS'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onOpenCityModal}
            className="px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-700 shadow-2xs hover:border-emerald-400 transition-colors cursor-pointer"
          >
            Change Station
          </button>
          <button
            onClick={() => onNavigate('decisions')}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-800 hover:bg-emerald-700 text-xs font-semibold text-white shadow-xs transition-colors cursor-pointer"
          >
            <Compass className="w-3.5 h-3.5" />
            <span>Evaluate Decisions</span>
          </button>
        </div>
      </div>

      {/* Main CPCB NAQI Hero Card */}
      <div className="rounded-2xl bg-white p-6 sm:p-8 border border-slate-200/90 shadow-sm relative overflow-hidden">
        
        {/* Soft radial ambient glow */}
        <div
          className="absolute -top-24 -right-24 w-80 h-80 rounded-full blur-3xl opacity-15 pointer-events-none"
          style={{ backgroundColor: naqiColor }}
        />

        <div className="flex flex-col lg:flex-row items-center justify-between gap-8 relative z-10">
          
          {/* Numerical Readout */}
          <div className="flex flex-col items-center lg:items-start text-center lg:text-left w-full lg:w-auto">
            <div className="flex items-center gap-2 mb-2">
              <span
                className="px-3 py-1 rounded-full text-xs font-mono font-semibold uppercase tracking-wider"
                style={{ backgroundColor: `${naqiColor}15`, color: naqiColor, border: `1px solid ${naqiColor}40` }}
              >
                {indian_naqi_category}
              </span>
              <span className="text-xs text-slate-400 font-mono">CPCB National Standard</span>
            </div>

            <div className="flex items-baseline gap-3 my-1">
              <span className="font-mono text-6xl sm:text-7xl font-extrabold tracking-tight tabular-nums" style={{ color: naqiColor }}>
                {indian_naqi}
              </span>
              <div className="text-left">
                <span className="text-xs font-mono font-bold text-slate-400 uppercase tracking-widest block">
                  Indian NAQI
                </span>
                <span className="text-lg font-bold text-slate-800">
                  {indian_naqi_category}
                </span>
              </div>
            </div>

            {/* Linear NAQI Spectrum Scale */}
            <div className="w-full max-w-sm mt-4">
              <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden relative shadow-inner">
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{
                    width: `${Math.min(100, Math.round((indian_naqi / 500) * 100))}%`,
                    backgroundColor: naqiColor
                  }}
                />
              </div>
              <div className="flex justify-between items-center text-[10px] font-mono text-slate-400 font-medium mt-1.5">
                <span>0 (Good)</span>
                <span>100 (Satisfactory)</span>
                <span>200 (Moderate)</span>
                <span>300+ (Poor)</span>
              </div>
            </div>

            {/* US-EPA Comparison Pill */}
            <div className="mt-4 flex items-center gap-2 text-xs font-mono text-slate-500">
              <span>US-EPA AQI: <strong>{us_aqi} ({us_aqi_category})</strong></span>
              <span>•</span>
              <span className="text-[11px] text-slate-400">Freshness: {data_freshness_minutes}m ago</span>
            </div>
          </div>

          {/* Quick Decision Diagnostic */}
          <div className="w-full lg:max-w-md bg-slate-50/80 rounded-xl p-5 border border-slate-200/80 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-wider text-emerald-800 mb-2">
                <Compass className="w-4 h-4 text-emerald-700" />
                <span>Primary Recommendation</span>
              </div>
              <h4 className="font-bold text-slate-900 text-sm sm:text-base leading-snug">
                {indian_naqi <= 50 ? 'Safe for All Outdoor Activities & Running' : 'Moderate Quality – Prefer Midday Sea Breeze Window'}
              </h4>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                {indian_naqi <= 50
                  ? `PM2.5 is pristine at ${pm2_5} µg/m³. Full natural ventilation and intense outdoor cardio are favorable.`
                  : `PM2.5 is ${pm2_5} µg/m³. Reschedule heavy aerobic runs to 1:00 – 4:00 PM when Arabian Sea onshore winds disperse surface dust.`}
              </p>
            </div>

            <button
              onClick={() => onNavigate('decisions')}
              className="mt-4 flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-emerald-800 hover:bg-emerald-700 text-white text-xs font-semibold shadow-2xs transition-colors cursor-pointer"
            >
              <span>View Activity-Specific Decisions</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

        </div>
      </div>

      {/* Meteorological Array */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        
        <div className="p-4 rounded-xl bg-white border border-slate-200/90 shadow-2xs flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-emerald-100 text-emerald-800">
            <Thermometer className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-mono text-slate-400 block">Temperature</span>
            <span className="text-base font-bold text-slate-900 font-mono">{temperature}°C</span>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200/90 shadow-2xs flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-teal-100 text-teal-800">
            <Droplets className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-mono text-slate-400 block">Relative Humidity</span>
            <span className="text-base font-bold text-slate-900 font-mono">{relative_humidity}%</span>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200/90 shadow-2xs flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-sky-100 text-sky-800">
            <Wind className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-mono text-slate-400 block">Wind Velocity</span>
            <span className="text-base font-bold text-slate-900 font-mono">{wind_speed} km/h</span>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200/90 shadow-2xs flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-amber-100 text-amber-800">
            <Compass className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-mono text-slate-400 block">Coastal Vector</span>
            <span className="text-base font-bold text-emerald-800 font-mono">
              {wind_direction >= 200 && wind_direction <= 300 ? 'Onshore Sea Breeze' : 'Inland Breeze'}
            </span>
          </div>
        </div>

      </div>

      {/* Hourly Diurnal Curve (Recharts) */}
      <div className="p-5 sm:p-6 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-base font-bold text-slate-900 font-sans flex items-center gap-2">
              <Clock className="w-4 h-4 text-emerald-700" />
              <span>Coastal Diurnal Particulate Trajectory (24-Hour Model)</span>
            </h3>
            <p className="text-xs text-slate-500">
              Modeled boundary layer expansion in coastal Karnataka shows particulate dips during afternoon sea breezes.
            </p>
          </div>
          <span className="text-[10px] font-mono text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200 self-start sm:self-auto">
            Cleanest Window: 1:00 – 4:00 PM
          </span>
        </div>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={hourlyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="vayuGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#006c4a" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#006c4a" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis dataKey="time" stroke="#64748b" fontSize={11} fontFamily="JetBrains Mono" tickLine={false} />
              <YAxis stroke="#64748b" fontSize={11} fontFamily="JetBrains Mono" tickLine={false} />
              <Tooltip
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="bg-slate-900 text-white p-3 rounded-xl font-mono text-xs shadow-lg border border-slate-700">
                        <span className="text-slate-400 block border-b border-slate-700 pb-1 mb-1">{label}</span>
                        <div>NAQI: <strong className="text-emerald-400">{payload[0].payload.aqi}</strong></div>
                        <div>PM2.5: <strong className="text-teal-400">{payload[0].payload.pm25} µg/m³</strong></div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <ReferenceLine y={50} stroke="#059669" strokeDasharray="3 3" label={{ value: 'Good (50)', fill: '#059669', fontSize: 10 }} />
              <ReferenceLine y={100} stroke="#d97706" strokeDasharray="3 3" label={{ value: 'Satisfactory (100)', fill: '#d97706', fontSize: 10 }} />
              <Area type="monotone" dataKey="aqi" stroke="#006c4a" strokeWidth={2.5} fill="url(#vayuGradient)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

    </div>
  );
};
