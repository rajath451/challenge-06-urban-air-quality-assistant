import React, { useState, useEffect } from 'react';
import {
  Activity as ActivityIcon,
  Clock,
  Sparkles,
  TrendingDown,
  ShieldCheck,
  AlertTriangle,
  Info,
  Scale,
  HeartPulse,
  User
} from 'lucide-react';
import { EnvironmentalReadings, ExposureResponse } from '../types';
import { calculateExposure } from '../services/api';

interface ExposureProps {
  readings: EnvironmentalReadings | null;
}

export const Exposure: React.FC<ExposureProps> = ({ readings }) => {
  const [activity, setActivity] = useState<string>('jogging');
  const [duration, setDuration] = useState<number>(45);
  const [concentration, setConcentration] = useState<number>(readings ? readings.pm2_5 : 25.0);
  const [weight, setWeight] = useState<number>(68);
  const [isChild, setIsChild] = useState<boolean>(false);

  const [result, setResult] = useState<ExposureResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setIsLoading(true);
      try {
        const res = await calculateExposure({
          activity,
          duration_minutes: duration,
          pm2_5_concentration: concentration,
          body_weight_kg: weight,
          is_child: isChild
        });
        setResult(res);
      } catch (err) {
        console.error('Exposure calc error:', err);
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, [activity, duration, concentration, weight, isChild]);

  const activityOptions = [
    { id: 'resting', label: 'Resting / Sitting', rate: '0.50 m³/h' },
    { id: 'walking', label: 'Light Walking (4 km/h)', rate: '1.20 m³/h' },
    { id: 'jogging', label: 'Jogging (8 km/h)', rate: '2.50 m³/h' },
    { id: 'cycling', label: 'Moderate Cycling', rate: '2.40 m³/h' },
    { id: 'heavy_workout', label: 'High-Intensity Cardio', rate: '3.80 m³/h' }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fade-in">
      
      {/* Header */}
      <div className="pb-4 border-b border-slate-200/80">
        <div className="flex items-center gap-2 text-xs font-mono font-semibold text-emerald-800 uppercase tracking-wider">
          <ActivityIcon className="w-3.5 h-3.5" />
          <span>Respiratory Dosimetry & Pulmonary Burden Calculator</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-sans tracking-tight mt-0.5">
          Inhaled Particulate Exposure Simulator
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-3xl">
          Fixed-site ambient monitors only tell you what is in the air. This engine uses physiological ventilation minute volumes from the EPA Exposure Factors Handbook to calculate the exact mass of PM2.5 deposited in your lungs.
        </p>
      </div>

      {/* Mandatory Non-Medical Disclaimer */}
      <div className="p-4 rounded-2xl bg-amber-50/90 border border-amber-200/90 shadow-2xs flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
        <div>
          <span className="text-xs font-mono font-bold text-amber-900 uppercase tracking-wider block">
            Non-Clinical Physiological Model Notice
          </span>
          <p className="text-xs text-amber-950/80 mt-0.5 leading-relaxed">
            This dosimetry model is for <strong>educational decision-support and exposure comparison</strong>. It does not provide medical diagnoses or assess pre-existing clinical pulmonary disease.
          </p>
        </div>
      </div>

      {/* Input Form */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-6">
        
        {/* Activity Selection */}
        <div>
          <label className="text-xs font-bold text-slate-700 font-sans block mb-2">
            Activity Intensity & Minute Ventilation Rate
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-5 gap-2">
            {activityOptions.map((opt) => (
              <button
                key={opt.id}
                onClick={() => setActivity(opt.id)}
                className={`p-3 rounded-xl border text-xs text-left transition-all cursor-pointer ${
                  activity === opt.id
                    ? 'bg-emerald-50 border-emerald-600 text-emerald-950 font-bold shadow-2xs'
                    : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                <span className="block font-bold">{opt.label}</span>
                <span className="text-[10px] text-slate-400 font-mono block mt-0.5">{opt.rate}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Sliders: Duration, PM2.5, Weight */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-3 border-t border-slate-100">
          
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold text-slate-700 font-sans">
                Activity Duration
              </label>
              <span className="font-mono text-xs font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                {duration} mins
              </span>
            </div>
            <input
              type="range"
              min="15"
              max="180"
              step="15"
              value={duration}
              onChange={(e) => setDuration(parseInt(e.target.value))}
              className="w-full accent-emerald-800 cursor-pointer"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold text-slate-700 font-sans">
                Ambient PM2.5 Concentration
              </label>
              <span className="font-mono text-xs font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                {concentration} µg/m³
              </span>
            </div>
            <input
              type="range"
              min="10"
              max="250"
              step="5"
              value={concentration}
              onChange={(e) => setConcentration(parseFloat(e.target.value))}
              className="w-full accent-emerald-800 cursor-pointer"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold text-slate-700 font-sans">
                Body Weight
              </label>
              <span className="font-mono text-xs font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                {weight} kg
              </span>
            </div>
            <input
              type="range"
              min="30"
              max="120"
              step="2"
              value={weight}
              onChange={(e) => setWeight(parseInt(e.target.value))}
              className="w-full accent-emerald-800 cursor-pointer"
            />
          </div>

        </div>

        {/* Child vs Adult Toggle */}
        <div className="pt-2 flex items-center justify-between border-t border-slate-100">
          <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-slate-700">
            <input
              type="checkbox"
              checked={isChild}
              onChange={(e) => setIsChild(e.target.checked)}
              className="rounded text-emerald-700 focus:ring-emerald-500 w-4 h-4 cursor-pointer"
            />
            <span>Apply Pediatric Respiratory Parameters (Children inhale ~50% more air per kg body mass)</span>
          </label>
          <span className="text-xs font-mono text-slate-400">
            EPA Child Dosimetry Factor Active: {isChild ? 'Yes' : 'No'}
          </span>
        </div>

      </div>

      {/* Exposure Dosimetry Results Grid */}
      {result && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs flex flex-col justify-between">
            <span className="text-[10px] font-mono text-slate-400 uppercase">Estimated Inhaled PM2.5 Mass</span>
            <div className="my-2">
              <span className="text-4xl font-extrabold font-mono text-slate-900 tabular-nums">
                {result.inhaled_mass_micrograms} <span className="text-sm font-sans font-normal text-slate-500">µg</span>
              </span>
              <span className="text-xs text-slate-500 block mt-1">
                Mass entering respiratory airways
              </span>
            </div>
            <span className="text-[11px] font-mono text-slate-400 border-t border-slate-100 pt-2">
              Air Volume: {result.air_volume_inhaled_m3} m³
            </span>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs flex flex-col justify-between">
            <span className="text-[10px] font-mono text-slate-400 uppercase">WHO 24-Hour Intake Budget</span>
            <div className="my-2">
              <span className={`text-4xl font-extrabold font-mono tabular-nums ${result.who_daily_budget_percentage > 50 ? 'text-amber-700' : 'text-emerald-800'}`}>
                {result.who_daily_budget_percentage}%
              </span>
              <span className="text-xs text-slate-500 block mt-1">
                Consumed in just this single workout
              </span>
            </div>
            <span className="text-[11px] font-mono text-slate-400 border-t border-slate-100 pt-2">
              Reference Limit: 180 µg/day
            </span>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs flex flex-col justify-between">
            <span className="text-[10px] font-mono text-slate-400 uppercase">Equivalent Resting Exposure</span>
            <div className="my-2">
              <span className="text-4xl font-extrabold font-mono text-slate-900 tabular-nums">
                {result.equivalent_baseline_hours} <span className="text-sm font-sans font-normal text-slate-500">hours</span>
              </span>
              <span className="text-xs text-slate-500 block mt-1">
                Of resting in the same room
              </span>
            </div>
            <span className="text-[11px] font-mono text-slate-400 border-t border-slate-100 pt-2">
              Ventilation Multiplier: {(result.ventilation_rate_m3h / 0.5).toFixed(1)}x
            </span>
          </div>

          <div className="p-5 rounded-2xl bg-emerald-50/80 border border-emerald-200 shadow-2xs flex flex-col justify-between">
            <span className="text-[10px] font-mono text-emerald-800 uppercase font-bold">Dose Avoided if Shifted</span>
            <div className="my-2">
              <span className="text-4xl font-extrabold font-mono text-emerald-950 tabular-nums">
                {result.dose_comparison_clean_window.dose_avoided_ug} <span className="text-sm font-sans font-normal text-emerald-800">µg</span>
              </span>
              <span className="text-xs text-emerald-900 block mt-1 font-semibold">
                {result.dose_comparison_clean_window.percentage_saved} dose reduction by shifting to 1:00 PM sea-breeze window
              </span>
            </div>
            <span className="text-[11px] font-mono text-emerald-900 border-t border-emerald-200/60 pt-2 font-semibold">
              Clean Window: {result.dose_comparison_clean_window.clean_window_pm25} µg/m³
            </span>
          </div>

        </div>
      )}

      {/* Scientific Basis & Documentation */}
      {result && (
        <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-2 text-xs text-slate-700 leading-relaxed font-sans">
          <h4 className="font-bold text-slate-900 text-sm">
            Scientific Respiratory Dosimetry Methodology
          </h4>
          <p>{result.scientific_basis}</p>
          <p className="text-slate-500 text-[11px] pt-1 border-t border-slate-100">
            {result.limitations_and_disclaimer}
          </p>
        </div>
      )}

    </div>
  );
};
