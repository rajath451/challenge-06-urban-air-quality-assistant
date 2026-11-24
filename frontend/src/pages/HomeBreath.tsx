import React, { useState, useEffect } from 'react';
import {
  Wind,
  Flame,
  AlertTriangle,
  Info,
  Sliders,
  Sparkles,
  TrendingDown,
  Clock,
  ShieldCheck,
  CheckCircle2,
  RefreshCw,
  Home
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, ReferenceLine } from 'recharts';
import { EnvironmentalReadings, IndoorSimulationResponse } from '../types';
import { simulateIndoor } from '../services/api';

interface HomeBreathProps {
  readings: EnvironmentalReadings;
}

export const HomeBreath: React.FC<HomeBreathProps> = ({ readings }) => {
  const [roomArea, setRoomArea] = useState<number>(200); // sq ft
  const [cookingActivity, setCookingActivity] = useState<string>('deep_frying_tadka');
  const [cookingDuration, setCookingDuration] = useState<number>(25);
  const [mosquitoCoils, setMosquitoCoils] = useState<number>(0);
  const [incenseSticks, setIncenseSticks] = useState<number>(0);
  const [windowsOpen, setWindowsOpen] = useState<boolean>(false);
  const [exhaustFanOn, setExhaustFanOn] = useState<boolean>(false);
  const [purifierCadrm3h, setPurifierCadrm3h] = useState<number>(0);

  const [simResult, setSimResult] = useState<IndoorSimulationResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const runSimulation = async () => {
    setIsLoading(true);
    try {
      const res = await simulateIndoor({
        room_area_sqft: roomArea,
        ceiling_height_ft: 9.8,
        outdoor_pm2_5: readings.pm2_5,
        cooking_activity: cookingActivity,
        cooking_duration_minutes: cookingDuration,
        mosquito_coil_count: mosquitoCoils,
        incense_sticks_count: incenseSticks,
        windows_open: windowsOpen,
        exhaust_fan_on: exhaustFanOn,
        air_purifier_cadrm3h: purifierCadrm3h
      });
      setSimResult(res);
    } catch (err) {
      console.error('Simulation error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    runSimulation();
  }, [roomArea, cookingActivity, cookingDuration, mosquitoCoils, incenseSticks, windowsOpen, exhaustFanOn, purifierCadrm3h, readings.pm2_5]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fade-in">
      
      {/* Header */}
      <div className="pb-4 border-b border-slate-200/80">
        <div className="flex items-center gap-2 text-xs font-mono font-semibold text-emerald-800 uppercase tracking-wider">
          <Wind className="w-3.5 h-3.5" />
          <span>HomeBreath — Virtual Indoor Air Intelligence</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-sans tracking-tight mt-0.5">
          Virtual Indoor Air Simulator
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-3xl">
          Zero IoT sensors required. Uses a first-principles single-compartment mass balance physical model to simulate how cooking, mosquito coils, and ventilation states alter indoor PM2.5 decay over 6 hours.
        </p>
      </div>

      {/* Mandatory Software-Only Modeling Disclaimer Banner */}
      <div className="p-4 rounded-2xl bg-amber-50/90 border border-amber-200/90 shadow-2xs flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
        <div>
          <span className="text-xs font-mono font-bold text-amber-900 uppercase tracking-wider block">
            Mathematical Modeling Transparency Notice
          </span>
          <p className="text-xs text-amber-950/80 mt-0.5 leading-relaxed">
            All indoor particulate values presented in HomeBreath are <strong>mathematical simulations based on peer-reviewed mass-balance equations</strong>, NOT physical sensor readings. Actual concentrations will be higher directly adjacent to unvented frying pans or burning mosquito coils.
          </p>
        </div>
      </div>

      {/* Simulator Inputs & Controls */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-6">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-700">
            Household Parameters & Combustion Sources
          </span>
          <span className="text-xs font-mono text-slate-400">
            Outdoor Baseline: {readings.pm2_5} µg/m³
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Room Size */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold text-slate-700 font-sans">
                Room Floor Area
              </label>
              <span className="font-mono text-xs font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                {roomArea} sq ft (~{Math.round(roomArea * 0.0929)} m²)
              </span>
            </div>
            <input
              type="range"
              min="100"
              max="600"
              step="50"
              value={roomArea}
              onChange={(e) => setRoomArea(parseInt(e.target.value))}
              className="w-full accent-emerald-800 cursor-pointer"
            />
          </div>

          {/* Cooking Activity */}
          <div>
            <label className="text-xs font-bold text-slate-700 font-sans block mb-2">
              Cooking Type
            </label>
            <select
              value={cookingActivity}
              onChange={(e) => setCookingActivity(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-800 outline-hidden focus:border-emerald-600"
            >
              <option value="none">No Cooking (Ambient Baseline)</option>
              <option value="light_boiling">Light Boiling / Steaming (Low Emission)</option>
              <option value="stir_frying">Stir Frying / Sautéing (Moderate Oil Aerosols)</option>
              <option value="deep_frying_tadka">Deep Frying / Tadka Seasoning (High Aerosols)</option>
            </select>
          </div>

          {/* Cooking Duration */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold text-slate-700 font-sans">
                Cooking Duration
              </label>
              <span className="font-mono text-xs font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                {cookingDuration} mins
              </span>
            </div>
            <input
              type="range"
              min="10"
              max="90"
              step="5"
              value={cookingDuration}
              onChange={(e) => setCookingDuration(parseInt(e.target.value))}
              className="w-full accent-emerald-800 cursor-pointer"
            />
          </div>

        </div>

        {/* Secondary Combustion: Coils & Incense */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-slate-100">
          
          <div>
            <label className="text-xs font-bold text-slate-700 font-sans block mb-1.5">
              Active Mosquito Coils
            </label>
            <select
              value={mosquitoCoils}
              onChange={(e) => setMosquitoCoils(parseInt(e.target.value))}
              className="w-full p-2 rounded-xl border border-slate-200 bg-white text-xs text-slate-800 outline-hidden focus:border-emerald-600"
            >
              <option value="0">0 (None)</option>
              <option value="1">1 Active Burning Coil</option>
              <option value="2">2 Coils</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 font-sans block mb-1.5">
              Active Incense Sticks (Agarbatti)
            </label>
            <select
              value={incenseSticks}
              onChange={(e) => setIncenseSticks(parseInt(e.target.value))}
              className="w-full p-2 rounded-xl border border-slate-200 bg-white text-xs text-slate-800 outline-hidden focus:border-emerald-600"
            >
              <option value="0">0 (None)</option>
              <option value="1">1 Stick</option>
              <option value="2">2 Sticks</option>
              <option value="4">4 Sticks (Pooja/Ceremony)</option>
            </select>
          </div>

          {/* Windows Toggle */}
          <div className="flex flex-col justify-end">
            <button
              type="button"
              onClick={() => setWindowsOpen(!windowsOpen)}
              className={`p-2.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                windowsOpen
                  ? 'bg-emerald-50 border-emerald-600 text-emerald-900 shadow-2xs'
                  : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              Windows: {windowsOpen ? 'OPEN (Cross-Ventilation)' : 'CLOSED (Sealed)'}
            </button>
          </div>

          {/* Exhaust Fan Toggle */}
          <div className="flex flex-col justify-end">
            <button
              type="button"
              onClick={() => setExhaustFanOn(!exhaustFanOn)}
              className={`p-2.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                exhaustFanOn
                  ? 'bg-emerald-800 text-white shadow-2xs'
                  : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              Kitchen Exhaust: {exhaustFanOn ? 'ACTIVE (ON)' : 'OFF'}
            </button>
          </div>

        </div>

      </div>

      {/* Simulation Results & Trajectory */}
      {simResult && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Key Metric 1 */}
          <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs flex flex-col justify-between">
            <span className="text-[10px] font-mono text-slate-400 uppercase">Modeled Peak Indoor PM2.5</span>
            <div className="my-2">
              <span className={`text-3xl font-extrabold font-mono tabular-nums ${simResult.peak_indoor_pm2_5 > 60 ? 'text-rose-700' : 'text-emerald-800'}`}>
                {simResult.peak_indoor_pm2_5} <span className="text-sm font-sans font-normal text-slate-500">µg/m³</span>
              </span>
              <span className="text-xs text-slate-500 block mt-1">
                {simResult.indoor_to_outdoor_ratio_peak}x outdoor concentration
              </span>
            </div>
            <div className="pt-2 border-t border-slate-100 text-[11px] font-mono text-slate-500">
              Outdoor: {readings.pm2_5} µg/m³
            </div>
          </div>

          {/* Key Metric 2 */}
          <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs flex flex-col justify-between">
            <span className="text-[10px] font-mono text-slate-400 uppercase">Decay Time to Safe Baseline</span>
            <div className="my-2">
              <span className="text-3xl font-extrabold font-mono text-slate-900 tabular-nums">
                {simResult.time_to_safe_baseline_minutes} <span className="text-sm font-sans font-normal text-slate-500">mins</span>
              </span>
              <span className="text-xs text-slate-500 block mt-1">
                To return below CPCB Good threshold (30 µg/m³)
              </span>
            </div>
            <div className="pt-2 border-t border-slate-100 text-[11px] font-mono text-slate-500">
              Natural Air Changes: {simResult.inputs_echo.air_exchange_rate_ach} ACH
            </div>
          </div>

          {/* Key Metric 3: Counterfactual */}
          <div className="p-5 rounded-2xl bg-emerald-50/80 border border-emerald-200 shadow-2xs flex flex-col justify-between">
            <span className="text-[10px] font-mono text-emerald-800 uppercase font-bold">
              What-If Scenario Comparison
            </span>
            <div className="my-2">
              <span className="text-2xl font-extrabold font-mono text-emerald-950">
                {simResult.counterfactual_scenario.reduction_percentage} Reduction
              </span>
              <p className="text-xs text-emerald-900 mt-1 leading-relaxed">
                {simResult.counterfactual_scenario.benefit}
              </p>
            </div>
            <div className="pt-2 border-t border-emerald-200/60 text-[11px] font-mono text-emerald-900 font-semibold">
              Peak Drops to: {simResult.counterfactual_scenario.estimated_peak_pm25} µg/m³
            </div>
          </div>

        </div>
      )}

      {/* 6-Hour Simulation Trajectory Chart */}
      {simResult && (
        <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h3 className="text-base font-bold text-slate-900 font-sans">
                Modeled 6-Hour Indoor Particulate Ingress & Decay Curve
              </h3>
              <p className="text-xs text-slate-500 font-sans">
                Simulates minute-by-minute indoor emission accumulation followed by natural deposition and room air exchange.
              </p>
            </div>
            <span className="text-xs font-mono text-slate-500">
              Room Volume: {simResult.inputs_echo.room_volume_m3} m³
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={simResult.trajectory} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="indoorGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#d97706" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#d97706" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="time_label" stroke="#64748b" fontSize={11} fontFamily="JetBrains Mono" tickLine={false} />
                <YAxis stroke="#64748b" fontSize={11} fontFamily="JetBrains Mono" tickLine={false} />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-slate-900 text-white p-3 rounded-xl font-mono text-xs shadow-lg border border-slate-700 space-y-1">
                          <span className="text-slate-400 block border-b border-slate-700 pb-1">{data.time_label}</span>
                          <div>Modeled Indoor PM2.5: <strong className="text-amber-400">{data.indoor_pm2_5} µg/m³</strong></div>
                          <div>Outdoor Reference: <strong className="text-emerald-400">{data.outdoor_pm2_5} µg/m³</strong></div>
                          <span className="text-[10px] text-slate-400 block pt-1">{data.active_sources}</span>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <ReferenceLine y={30} stroke="#059669" strokeDasharray="3 3" label={{ value: 'CPCB Good (30)', fill: '#059669', fontSize: 10 }} />
                <Area type="monotone" dataKey="indoor_pm2_5" stroke="#d97706" strokeWidth={2.5} fill="url(#indoorGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Practical Action Box */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 leading-relaxed font-sans">
            <strong>Practical Recommendation:</strong> {simResult.practical_action}
          </div>
        </div>
      )}

    </div>
  );
};
