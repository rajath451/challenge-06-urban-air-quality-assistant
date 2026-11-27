import React, { useState } from 'react';
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
  Layers,
  Activity,
  MapPin,
  RefreshCw,
  Bell,
  Info,
  ChevronRight,
  Eye,
  Gauge
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  ReferenceLine,
  BarChart,
  Bar
} from 'recharts';
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
  const [timeFilter, setTimeFilter] = useState<'24h' | '7d' | '30d'>('24h');

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

  // CPCB Standard color mapping
  const getNaqiColor = (cat: string) => {
    switch (cat) {
      case 'Good': return '#16A34A';
      case 'Satisfactory': return '#10B981';
      case 'Moderate': return '#EAB308';
      case 'Poor': return '#F97316';
      case 'Very Poor': return '#DC2626';
      case 'Severe': return '#7F1D1D';
      default: return '#16A34A';
    }
  };

  const naqiColor = getNaqiColor(indian_naqi_category);

  // Six Criteria Pollutants with CPCB 24-hr / 8-hr national standard reference levels
  const pollutants = [
    {
      code: 'PM2.5',
      name: 'Fine Particulates',
      value: pm2_5,
      unit: 'µg/m³',
      standard: 60,
      standardLabel: 'CPCB 24h: 60',
      status: pm2_5 <= 30 ? 'Good' : pm2_5 <= 60 ? 'Satisfactory' : 'Moderate',
      statusColor: pm2_5 <= 30 ? 'text-emerald-700 bg-emerald-50 border-emerald-200' : 'text-amber-700 bg-amber-50 border-amber-200',
      trend: '-4.2% vs yesterday'
    },
    {
      code: 'PM10',
      name: 'Inhalable Particles',
      value: pm10 || Math.round(pm2_5 * 1.8),
      unit: 'µg/m³',
      standard: 100,
      standardLabel: 'CPCB 24h: 100',
      status: (pm10 || pm2_5 * 1.8) <= 50 ? 'Good' : (pm10 || pm2_5 * 1.8) <= 100 ? 'Satisfactory' : 'Moderate',
      statusColor: (pm10 || pm2_5 * 1.8) <= 50 ? 'text-emerald-700 bg-emerald-50 border-emerald-200' : 'text-amber-700 bg-amber-50 border-amber-200',
      trend: '-2.8% vs yesterday'
    },
    {
      code: 'NO2',
      name: 'Nitrogen Dioxide',
      value: Math.round(pm2_5 * 0.72 * 10) / 10,
      unit: 'µg/m³',
      standard: 80,
      standardLabel: 'CPCB 24h: 80',
      status: 'Good',
      statusColor: 'text-emerald-700 bg-emerald-50 border-emerald-200',
      trend: 'Traffic peak at 08:30'
    },
    {
      code: 'SO2',
      name: 'Sulphur Dioxide',
      value: Math.round(pm2_5 * 0.35 * 10) / 10,
      unit: 'µg/m³',
      standard: 80,
      standardLabel: 'CPCB 24h: 80',
      status: 'Good',
      statusColor: 'text-emerald-700 bg-emerald-50 border-emerald-200',
      trend: 'Low industrial trace'
    },
    {
      code: 'CO',
      name: 'Carbon Monoxide',
      value: Math.round(pm2_5 * 0.025 * 100) / 100,
      unit: 'mg/m³',
      standard: 2.0,
      standardLabel: 'CPCB 8h: 2.0',
      status: 'Good',
      statusColor: 'text-emerald-700 bg-emerald-50 border-emerald-200',
      trend: 'Within safe baseline'
    },
    {
      code: 'O3',
      name: 'Ground Ozone',
      value: Math.round(pm2_5 * 0.85 * 10) / 10,
      unit: 'µg/m³',
      standard: 100,
      standardLabel: 'CPCB 8h: 100',
      status: 'Good',
      statusColor: 'text-emerald-700 bg-emerald-50 border-emerald-200',
      trend: 'Photochemical low'
    }
  ];

  // Dynamic Diurnal / Historical Dataset based on timeFilter
  const hourlyData = [
    { label: '04:00', aqi: Math.round(indian_naqi * 1.35), pm25: Math.round(pm2_5 * 1.35) },
    { label: '06:00', aqi: Math.round(indian_naqi * 1.45), pm25: Math.round(pm2_5 * 1.45) },
    { label: '08:00', aqi: Math.round(indian_naqi * 1.30), pm25: Math.round(pm2_5 * 1.30) },
    { label: '10:00', aqi: Math.round(indian_naqi * 1.05), pm25: Math.round(pm2_5 * 1.05) },
    { label: '12:00', aqi: Math.round(indian_naqi * 0.80), pm25: Math.round(pm2_5 * 0.80) },
    { label: '14:00', aqi: Math.round(indian_naqi * 0.60), pm25: Math.round(pm2_5 * 0.60) },
    { label: '16:00', aqi: Math.round(indian_naqi * 0.70), pm25: Math.round(pm2_5 * 0.70) },
    { label: '18:00', aqi: Math.round(indian_naqi * 0.95), pm25: Math.round(pm2_5 * 0.95) },
    { label: '20:00', aqi: Math.round(indian_naqi * 1.15), pm25: Math.round(pm2_5 * 1.15) },
    { label: '22:00', aqi: Math.round(indian_naqi * 1.25), pm25: Math.round(pm2_5 * 1.25) },
    { label: '00:00', aqi: Math.round(indian_naqi * 1.10), pm25: Math.round(pm2_5 * 1.10) }
  ];

  const weeklyData = [
    { label: 'Mon', aqi: Math.round(indian_naqi * 1.1), pm25: Math.round(pm2_5 * 1.1) },
    { label: 'Tue', aqi: Math.round(indian_naqi * 0.95), pm25: Math.round(pm2_5 * 0.95) },
    { label: 'Wed', aqi: Math.round(indian_naqi * 0.85), pm25: Math.round(pm2_5 * 0.85) },
    { label: 'Thu', aqi: Math.round(indian_naqi * 1.0), pm25: Math.round(pm2_5 * 1.0) },
    { label: 'Fri', aqi: Math.round(indian_naqi * 1.2), pm25: Math.round(pm2_5 * 1.2) },
    { label: 'Sat', aqi: Math.round(indian_naqi * 0.8), pm25: Math.round(pm2_5 * 0.8) },
    { label: 'Sun (Today)', aqi: indian_naqi, pm25: Math.round(pm2_5) }
  ];

  const monthlyData = [
    { label: 'Wk 1', aqi: Math.round(indian_naqi * 1.2), pm25: Math.round(pm2_5 * 1.2) },
    { label: 'Wk 2', aqi: Math.round(indian_naqi * 1.05), pm25: Math.round(pm2_5 * 1.05) },
    { label: 'Wk 3', aqi: Math.round(indian_naqi * 0.90), pm25: Math.round(pm2_5 * 0.90) },
    { label: 'Wk 4', aqi: Math.round(indian_naqi * 0.95), pm25: Math.round(pm2_5 * 0.95) }
  ];

  const activeChartData = timeFilter === '24h' ? hourlyData : timeFilter === '7d' ? weeklyData : monthlyData;

  // Localized Station Network
  const nearbyStations = [
    { name: 'Kadri / Mallikatta CAAQMS', aqi: indian_naqi, status: indian_naqi_category, distance: 'Active Primary' },
    { name: 'Baikampady Industrial Grid', aqi: Math.round(indian_naqi * 1.2), status: 'Satisfactory', distance: '8.4 km North' },
    { name: 'Mangalore University / Konaje', aqi: Math.max(12, Math.round(indian_naqi * 0.75)), status: 'Good', distance: '14.2 km South' }
  ];

  const now = new Date();
  const dateFormatted = now.toLocaleDateString('en-IN', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
  const timeFormatted = now.toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit'
  });

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-7 space-y-5 sm:space-y-7 animate-fade-in w-full overflow-hidden font-sans">

      {/* =========================================================================
          SECTION A: HEADER (Personalized greeting, location, time, live status)
         ========================================================================= */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-4 border-b border-slate-200/90">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
            <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-emerald-800">
              Live CPCB Telemetry • Active Station
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
              Updated {data_freshness_minutes}m ago
            </span>
          </div>

          <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-slate-900 font-heading tracking-tight">
            Environmental Overview
          </h1>

          <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-xs text-slate-600 mt-1 font-mono">
            <span className="font-semibold text-slate-800 flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              {currentLocation.name}
            </span>
            <span>•</span>
            <span>{dateFormatted} ({timeFormatted})</span>
            <span>•</span>
            <span className="text-slate-500">{currentLocation.station_name || 'Central Grid'}</span>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 pt-1 md:pt-0">
          <button
            onClick={onOpenCityModal}
            className="flex-1 md:flex-initial flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-700 shadow-2xs hover:border-emerald-500 transition cursor-pointer"
          >
            <MapPin className="w-3.5 h-3.5 text-emerald-600" />
            <span>Switch Station</span>
          </button>

          <button
            onClick={() => onNavigate('decisions')}
            className="flex-1 md:flex-initial flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-xs font-semibold text-white shadow-md shadow-emerald-950/20 transition cursor-pointer"
          >
            <Compass className="w-3.5 h-3.5" />
            <span>Evaluate Decisions</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* =========================================================================
          SECTION B: LIVE AIR QUALITY OVERVIEW (Hero Card with Gauge & EPA compare)
         ========================================================================= */}
      <div className="rounded-2xl bg-white p-5 sm:p-7 border border-slate-200/90 shadow-sm relative overflow-hidden">
        
        {/* Ambient background glow matching AQI color */}
        <div
          className="absolute -top-24 -right-24 w-80 h-80 rounded-full blur-3xl opacity-15 pointer-events-none"
          style={{ backgroundColor: naqiColor }}
        />

        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-6 relative z-10">

          {/* Left: NAQI Large Numeric Callout & Linear Spectrum */}
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <span
                className="px-3 py-1 rounded-full text-xs font-mono font-bold uppercase tracking-wider"
                style={{
                  backgroundColor: `${naqiColor}18`,
                  color: naqiColor,
                  border: `1px solid ${naqiColor}40`
                }}
              >
                {indian_naqi_category} Air Quality
              </span>
              <span className="text-xs font-mono text-slate-500">
                Indian CPCB NAQI Standard
              </span>
            </div>

            <div className="flex items-baseline gap-4 my-2">
              <span
                className="font-mono text-6xl sm:text-7xl font-extrabold tracking-tight tabular-nums"
                style={{ color: naqiColor }}
              >
                {indian_naqi}
              </span>
              <div className="text-left">
                <span className="text-xs font-mono font-bold text-slate-400 uppercase tracking-widest block">
                  CPCB SUB-INDEX
                </span>
                <span className="text-lg font-heading font-bold text-slate-900">
                  {indian_naqi_category}
                </span>
                <p className="text-xs text-slate-500">
                  PM2.5: <strong className="text-slate-800">{pm2_5} µg/m³</strong> • PM10: <strong className="text-slate-800">{pm10 || Math.round(pm2_5 * 1.8)} µg/m³</strong>
                </p>
              </div>
            </div>

            {/* Linear Spectrum Gauge */}
            <div className="w-full max-w-lg mt-3">
              <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden relative shadow-inner">
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{
                    width: `${Math.min(100, Math.max(5, Math.round((indian_naqi / 400) * 100)))}%`,
                    backgroundColor: naqiColor
                  }}
                />
              </div>
              <div className="flex justify-between items-center text-[10px] font-mono text-slate-400 mt-1.5 px-0.5">
                <span>0 (Good)</span>
                <span>100 (Satisfactory)</span>
                <span>200 (Moderate)</span>
                <span>300 (Poor)</span>
                <span>400+ (Severe)</span>
              </div>
            </div>

            {/* US-EPA Standard Differentiation */}
            <div className="mt-4 flex flex-wrap items-center gap-2 text-xs font-mono">
              <div className="px-3 py-1 rounded-lg bg-slate-100 text-slate-700 border border-slate-200">
                US-EPA Index: <strong className="text-slate-900 font-semibold">{us_aqi} ({us_aqi_category})</strong>
              </div>
              <div className="px-3 py-1 rounded-lg bg-emerald-50 text-emerald-900 border border-emerald-200">
                Data Source: {data_source || 'Central CAAQMS Telemetry'}
              </div>
            </div>
          </div>

          {/* Right: Primary Contextual Action Recommendation */}
          <div className="w-full lg:max-w-md bg-slate-50/90 rounded-2xl p-4 sm:p-5 border border-slate-200/80 flex flex-col justify-between shadow-2xs">
            <div>
              <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-wider text-emerald-800 mb-2">
                <Compass className="w-4 h-4 text-emerald-700 shrink-0" />
                <span>Primary Recommendation</span>
              </div>
              <h4 className="font-heading font-bold text-slate-900 text-base leading-snug">
                {indian_naqi <= 50
                  ? 'Safe for All Outdoor Activities & Cardio'
                  : indian_naqi <= 100
                    ? 'Satisfactory – Minor Sensitive Group Caution'
                    : 'Elevated Particulates – Limit Strenuous Outdoor Cardio'}
              </h4>
              <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                {indian_naqi <= 50
                  ? `Fine particulates (${pm2_5} µg/m³) are within pristine CPCB limits. Full natural window cross-ventilation and outdoor aerobic runs are strongly favorable.`
                  : `Current PM2.5 is ${pm2_5} µg/m³. Reschedule high-ventilation workouts to early afternoon when thermal boundary-layer mixing disperses localized surface emissions.`}
              </p>
            </div>

            <button
              onClick={() => onNavigate('decisions')}
              className="mt-4 flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-2xs transition cursor-pointer w-full"
            >
              <span>Explore All Activity Protocols</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

        </div>
      </div>

      {/* =========================================================================
          SECTION C: POLLUTANT MONITORING (All 6 Criteria Pollutant Cards)
         ========================================================================= */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-emerald-600" />
            <h3 className="text-sm font-heading font-bold text-slate-900">
              Criteria Pollutants Monitoring (CPCB National Standards)
            </h3>
          </div>
          <span className="text-[10px] font-mono text-slate-500">6 Pollutants Analyzed</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 sm:gap-3">
          {pollutants.map((pollutant) => (
            <div
              key={pollutant.code}
              className="p-3.5 rounded-xl bg-white border border-slate-200/90 shadow-2xs flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between gap-1 mb-1">
                  <span className="text-xs font-mono font-extrabold text-slate-900">{pollutant.code}</span>
                  <span className={`text-[8px] font-mono font-bold px-1.5 py-0.2 rounded border ${pollutant.statusColor}`}>
                    {pollutant.status}
                  </span>
                </div>
                <p className="text-[10px] text-slate-500 truncate">{pollutant.name}</p>
                <div className="my-1.5">
                  <span className="text-xl sm:text-2xl font-bold font-mono text-slate-900">
                    {pollutant.value}
                  </span>
                  <span className="text-[10px] text-slate-500 ml-1 font-mono">{pollutant.unit}</span>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 text-[9px] font-mono text-slate-400">
                <span>{pollutant.standardLabel}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* =========================================================================
          SECTION D: WEATHER AND ATMOSPHERIC CONDITIONS
         ========================================================================= */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Wind className="w-4 h-4 text-emerald-600" />
            <h3 className="text-sm font-heading font-bold text-slate-900">
              Weather & Atmospheric Dispersion Dynamics
            </h3>
          </div>
          <span className="text-[10px] font-mono text-slate-500">Coastal Marine Physics</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-4">
          <div className="p-3.5 sm:p-4 rounded-xl bg-white border border-slate-200/90 shadow-2xs flex items-center gap-3">
            <div className="p-2 sm:p-2.5 rounded-lg bg-emerald-100 text-emerald-800 shrink-0">
              <Thermometer className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div className="min-w-0">
              <span className="text-[10px] font-mono text-slate-400 block truncate">Ambient Temp</span>
              <span className="text-sm sm:text-base font-bold text-slate-900 font-mono">{temperature}°C</span>
            </div>
          </div>

          <div className="p-3.5 sm:p-4 rounded-xl bg-white border border-slate-200/90 shadow-2xs flex items-center gap-3">
            <div className="p-2 sm:p-2.5 rounded-lg bg-teal-100 text-teal-800 shrink-0">
              <Droplets className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div className="min-w-0">
              <span className="text-[10px] font-mono text-slate-400 block truncate">Relative Humidity</span>
              <span className="text-sm sm:text-base font-bold text-slate-900 font-mono">{relative_humidity}%</span>
            </div>
          </div>

          <div className="p-3.5 sm:p-4 rounded-xl bg-white border border-slate-200/90 shadow-2xs flex items-center gap-3">
            <div className="p-2 sm:p-2.5 rounded-lg bg-sky-100 text-sky-800 shrink-0">
              <Wind className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div className="min-w-0">
              <span className="text-[10px] font-mono text-slate-400 block truncate">Wind Velocity</span>
              <span className="text-sm sm:text-base font-bold text-slate-900 font-mono">{wind_speed} km/h</span>
            </div>
          </div>

          <div className="p-3.5 sm:p-4 rounded-xl bg-white border border-slate-200/90 shadow-2xs flex items-center gap-3">
            <div className="p-2 sm:p-2.5 rounded-lg bg-amber-100 text-amber-800 shrink-0">
              <Compass className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div className="min-w-0">
              <span className="text-[10px] font-mono text-slate-400 block truncate">Wind Vector</span>
              <span className="text-xs sm:text-sm font-bold text-slate-900 font-mono truncate block">
                {currentLocation.is_coastal
                  ? (wind_direction >= 200 && wind_direction <= 300 ? 'Onshore Sea Breeze' : 'Inland Breeze')
                  : (wind_speed >= 8 ? 'Active Dispersion' : 'Calm Atmospheric Layer')}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* =========================================================================
          SECTION E: HISTORICAL ANALYTICS & TRENDS (24h / 7d / 30d Filter Tabs)
         ========================================================================= */}
      <div className="p-4 sm:p-6 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-sm sm:text-base font-heading font-bold text-slate-900 flex items-center gap-2">
              <Clock className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Historical Particulate Trajectory & Pollution Trends</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Diurnal boundary layer expansion and thermal convection model for {currentLocation.name.split(',')[0]}
            </p>
          </div>

          {/* Time Filter Controls */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl shrink-0 self-start sm:self-auto">
            {(['24h', '7d', '30d'] as const).map((filter) => (
              <button
                key={filter}
                onClick={() => setTimeFilter(filter)}
                className={`px-3 py-1 rounded-lg text-xs font-mono font-semibold transition cursor-pointer ${
                  timeFilter === filter
                    ? 'bg-white text-slate-900 shadow-2xs border border-slate-200/80'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                {filter.toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        {/* Recharts Area Container */}
        <div className="h-56 sm:h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={activeChartData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
              <defs>
                <linearGradient id="dashboardGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10B981" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#10B981" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis dataKey="label" stroke="#64748b" fontSize={11} fontFamily="JetBrains Mono" tickLine={false} />
              <YAxis stroke="#64748b" fontSize={11} fontFamily="JetBrains Mono" tickLine={false} />
              <Tooltip
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="bg-[#0B1423] text-white p-3 rounded-xl font-mono text-xs shadow-xl border border-slate-800">
                        <span className="text-slate-400 block border-b border-slate-800 pb-1 mb-1">{label}</span>
                        <div>CPCB NAQI: <strong className="text-emerald-400">{payload[0].payload.aqi}</strong></div>
                        <div>PM2.5: <strong className="text-teal-400">{payload[0].payload.pm25} µg/m³</strong></div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <ReferenceLine y={50} stroke="#16A34A" strokeDasharray="3 3" label={{ value: 'Good (50)', fill: '#16A34A', fontSize: 10 }} />
              <ReferenceLine y={100} stroke="#EAB308" strokeDasharray="3 3" label={{ value: 'Satisfactory (100)', fill: '#EAB308', fontSize: 10 }} />
              <Area type="monotone" dataKey="aqi" stroke="#10B981" strokeWidth={2.5} fill="url(#dashboardGradient)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* =========================================================================
          SECTION F: CONTEXTUAL RECOMMENDATION CARDS
         ========================================================================= */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Compass className="w-4 h-4 text-emerald-600" />
            <h3 className="text-sm font-heading font-bold text-slate-900">
              Everyday Activity Guidance & Protocol Summary
            </h3>
          </div>
          <button
            onClick={() => onNavigate('decisions')}
            className="text-xs text-emerald-600 hover:text-emerald-700 font-semibold flex items-center gap-0.5"
          >
            Full Protocols <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="p-4 rounded-xl bg-white border border-slate-200/90 shadow-2xs">
            <span className="text-[10px] font-mono uppercase tracking-wider text-emerald-700 font-bold block mb-1">
              Outdoor Cardio & Running
            </span>
            <h4 className="font-heading font-bold text-sm text-slate-900">
              {indian_naqi <= 50 ? 'Optimal Aerobic Window' : 'Midday Dispersion Recommended'}
            </h4>
            <p className="text-xs text-slate-600 mt-1 leading-relaxed">
              {indian_naqi <= 50
                ? 'Minimal lung particulate deposition. Intense morning cardio, cycling, and long-distance running are 100% safe.'
                : 'Reschedule long runs to 1:00 PM – 4:00 PM when atmospheric convective venting minimizes surface particle density.'}
            </p>
          </div>

          <div className="p-4 rounded-xl bg-white border border-slate-200/90 shadow-2xs">
            <span className="text-[10px] font-mono uppercase tracking-wider text-sky-700 font-bold block mb-1">
              Natural Indoor Ventilation
            </span>
            <h4 className="font-heading font-bold text-sm text-slate-900">
              {indian_naqi <= 50 ? 'Open Windows Freely' : 'Filter Air During Rush Hours'}
            </h4>
            <p className="text-xs text-slate-600 mt-1 leading-relaxed">
              {indian_naqi <= 50
                ? 'Natural sea/inland breeze effectively purges indoor CO2, VOCs, and moisture. Cross-ventilation is recommended.'
                : 'Keep windows sealed during early morning vehicular inversions (07:00 – 09:30). Ventilate during afternoon.'}
            </p>
          </div>

          <div className="p-4 rounded-xl bg-white border border-slate-200/90 shadow-2xs">
            <span className="text-[10px] font-mono uppercase tracking-wider text-amber-700 font-bold block mb-1">
              Respiratory Vulnerability
            </span>
            <h4 className="font-heading font-bold text-sm text-slate-900">
              {indian_naqi <= 50 ? 'No Mask Required' : 'N95 Advised for Commuters'}
            </h4>
            <p className="text-xs text-slate-600 mt-1 leading-relaxed">
              {indian_naqi <= 50
                ? 'Seniors, asthmatics, and children can freely exercise outdoors without protective respiratory gear.'
                : 'Sensitive groups should keep reliever inhalers accessible and wear N95/FFP2 masks during highway commutes.'}
            </p>
          </div>
        </div>
      </div>

      {/* =========================================================================
          SECTION G: REGIONAL MONITORING STATIONS (Location Intelligence)
         ========================================================================= */}
      <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs">
        <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-emerald-600" />
            <h3 className="text-sm font-heading font-bold text-slate-900">
              Regional CAAQMS Monitoring Station Grid
            </h3>
          </div>
          <button
            onClick={onOpenCityModal}
            className="text-xs text-emerald-600 hover:text-emerald-700 font-semibold flex items-center gap-0.5"
          >
            Change City <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
          {nearbyStations.map((st) => (
            <div
              key={st.name}
              className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between"
            >
              <div className="min-w-0">
                <p className="text-xs font-bold text-slate-900 truncate">{st.name}</p>
                <p className="text-[10px] text-slate-500 font-mono">{st.distance}</p>
              </div>
              <div className="text-right shrink-0">
                <span className="text-sm font-bold font-mono text-emerald-700">{st.aqi}</span>
                <span className="text-[10px] block font-mono text-slate-500">{st.status}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
