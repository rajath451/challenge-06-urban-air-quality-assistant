import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Layers,
  Clock,
  BookOpen,
  Info,
  Cpu,
  Wind
} from 'lucide-react';
import { TransparencyInfo } from '../types';
import { fetchTransparency } from '../services/api';

export const DataTransparency: React.FC = () => {
  const [data, setData] = useState<TransparencyInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setIsLoading(true);
      try {
        const res = await fetchTransparency();
        setData(res);
      } catch (err) {
        console.error('Transparency load error:', err);
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10 animate-fade-in">
      
      {/* Header */}
      <div className="pb-4 border-b border-slate-200/80">
        <div className="flex items-center gap-2 text-xs font-mono font-semibold text-emerald-800 uppercase tracking-wider">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Scientific Governance & Transparency Architecture</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-sans tracking-tight mt-0.5">
          Data Integrity, Standards & Provenance
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-3xl">
          VayuCoach strictly adheres to honest uncertainty communication. We explicitly disclose scientific provenance and distinguish real sensor measurements from mathematical simulations and physiological estimates.
        </p>
      </div>

      {/* 1. DATA TAXONOMY: Measured vs Forecasted vs Simulated vs Estimated */}
      <section className="space-y-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 font-sans flex items-center gap-2">
            <Layers className="w-5 h-5 text-emerald-700" />
            <span>Information Classification Taxonomy</span>
          </h2>
          <p className="text-xs text-slate-500">
            Every reading and prediction in VayuCoach is strictly classified into one of four distinct scientific tiers:
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          
          <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 uppercase">
                Tier 1: Measured Ambient Telemetry
              </span>
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            </div>
            <h4 className="text-sm font-bold text-slate-900 font-sans">
              Outdoor PM2.5, PM10 & Weather
            </h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Real physical atmospheric measurements calibrated against Continuous Ambient Air Quality Monitoring Stations (CPCB and State Pollution Control Boards CAAQMS national grid).
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs font-bold text-sky-800 bg-sky-50 px-2 py-0.5 rounded border border-sky-200 uppercase">
                Tier 2: Forecasted Trajectory
              </span>
              <Clock className="w-4 h-4 text-sky-600" />
            </div>
            <h4 className="text-sm font-bold text-slate-900 font-sans">
              24-Hour Diurnal Activity Windows
            </h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Derived from atmospheric boundary layer numerical models and local wind vector persistence, capturing diurnal convective sea-breeze dispersion in coastal corridors.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 uppercase">
                Tier 3: Simulated (HomeBreath)
              </span>
              <Wind className="w-4 h-4 text-amber-600" />
            </div>
            <h4 className="text-sm font-bold text-slate-900 font-sans">
              Virtual Indoor Air Dynamics
            </h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              <strong>STRICTLY SOFTWARE-ONLY:</strong> Single-compartment mass balance differential equation modeling frying aerosols, coils, and air changes. Zero IoT hardware required.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs font-bold text-purple-800 bg-purple-50 px-2 py-0.5 rounded border border-purple-200 uppercase">
                Tier 4: Estimated Dosimetry
              </span>
              <Cpu className="w-4 h-4 text-purple-600" />
            </div>
            <h4 className="text-sm font-bold text-slate-900 font-sans">
              Inhaled Particulate Mass (µg)
            </h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Physiological calculations combining EPA Exposure minute volumes with duration and concentration. Educational exposure comparison, not a medical diagnosis.
            </p>
          </div>

        </div>
      </section>

      {/* 2. CPCB NAQI STANDARDS SPECIFICATION */}
      <section className="space-y-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 font-sans flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-emerald-700" />
            <span>Central Pollution Control Board (CPCB) NAQI Breakpoints</span>
          </h2>
          <p className="text-xs text-slate-500">
            Official Indian standard for 24-hour average PM2.5 and PM10 concentration thresholds:
          </p>
        </div>

        <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-2xs">
          <table className="w-full text-left text-xs font-sans">
            <thead className="bg-slate-50 border-b border-slate-200 font-mono text-slate-700 text-[11px] uppercase tracking-wider">
              <tr>
                <th className="p-3.5">Category</th>
                <th className="p-3.5">NAQI Range</th>
                <th className="p-3.5">PM2.5 (µg/m³)</th>
                <th className="p-3.5">PM10 (µg/m³)</th>
                <th className="p-3.5">Official Health Advisory</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono text-xs">
              <tr className="hover:bg-emerald-50/40">
                <td className="p-3.5 font-bold text-emerald-800">Good</td>
                <td className="p-3.5">0 – 50</td>
                <td className="p-3.5">0 – 30</td>
                <td className="p-3.5">0 – 50</td>
                <td className="p-3.5 font-sans text-slate-600">Minimal impact; ideal for all outdoor activities.</td>
              </tr>
              <tr className="hover:bg-teal-50/40">
                <td className="p-3.5 font-bold text-teal-800">Satisfactory</td>
                <td className="p-3.5">51 – 100</td>
                <td className="p-3.5">31 – 60</td>
                <td className="p-3.5">51 – 100</td>
                <td className="p-3.5 font-sans text-slate-600">Minor breathing discomfort to sensitive people.</td>
              </tr>
              <tr className="hover:bg-amber-50/40">
                <td className="p-3.5 font-bold text-amber-800">Moderate</td>
                <td className="p-3.5">101 – 200</td>
                <td className="p-3.5">61 – 90</td>
                <td className="p-3.5">101 – 250</td>
                <td className="p-3.5 font-sans text-slate-600">Breathing discomfort to people with lung disease, asthma.</td>
              </tr>
              <tr className="hover:bg-orange-50/40">
                <td className="p-3.5 font-bold text-orange-800">Poor</td>
                <td className="p-3.5">201 – 300</td>
                <td className="p-3.5">91 – 120</td>
                <td className="p-3.5">251 – 350</td>
                <td className="p-3.5 font-sans text-slate-600">Breathing discomfort to most people on prolonged exposure.</td>
              </tr>
              <tr className="hover:bg-rose-50/40">
                <td className="p-3.5 font-bold text-rose-800">Very Poor</td>
                <td className="p-3.5">301 – 400</td>
                <td className="p-3.5">121 – 250</td>
                <td className="p-3.5">351 – 430</td>
                <td className="p-3.5 font-sans text-slate-600">Respiratory illness on prolonged exposure.</td>
              </tr>
              <tr className="hover:bg-red-50/40">
                <td className="p-3.5 font-bold text-red-950 font-extrabold">Severe</td>
                <td className="p-3.5">401 – 500</td>
                <td className="p-3.5">250+</td>
                <td className="p-3.5">430+</td>
                <td className="p-3.5 font-sans text-slate-600">Affects healthy people; seriously impacts those with existing disease.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* 3. KNOWN LIMITATIONS & UNCERTAINTIES */}
      {data && (
        <section className="p-6 sm:p-7 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-4">
          <div className="flex items-center gap-2 text-rose-800">
            <AlertTriangle className="w-5 h-5" />
            <h3 className="text-base font-bold font-sans">Known Scientific Limitations & Spatial Bounds</h3>
          </div>
          <ul className="space-y-2 text-xs text-slate-600 leading-relaxed font-sans">
            {data.known_limitations.map((lim, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="text-rose-600 font-bold">•</span>
                <span>{lim}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* 4. OFFICIAL ATTRIBUTION */}
      {data && (
        <section className="p-6 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
          <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-500">
            Official Methodological & Standard Attribution
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            {data.attribution.map((att, i) => (
              <div key={i} className="p-3 rounded-xl bg-white border border-slate-200/80">
                <span className="font-bold text-slate-800 block">{att.source}</span>
                <span className="text-slate-500 text-[11px] block mt-0.5">{att.role}</span>
              </div>
            ))}
          </div>
        </section>
      )}

    </div>
  );
};
