import React, { useState, useEffect } from 'react';
import {
  Compass,
  CheckCircle2,
  AlertTriangle,
  Info,
  Clock,
  ShieldAlert,
  ArrowRight,
  Sparkles,
  RefreshCw,
  Sliders,
  Check
} from 'lucide-react';
import { EnvironmentalReadings, LocationInfo, DecisionItem, DecisionResponse } from '../types';
import { fetchDecisions } from '../services/api';

interface DecisionsProps {
  readings: EnvironmentalReadings | null;
  currentLocation: LocationInfo | null;
  onNavigate: (tab: string) => void;
  onOpenCityModal: () => void;
}

export const Decisions: React.FC<DecisionsProps> = ({
  readings,
  currentLocation,
  onNavigate,
  onOpenCityModal
}) => {
  const [decisionData, setDecisionData] = useState<DecisionResponse | null>(null);
  const [selectedFilter, setSelectedFilter] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function load() {
      if (!readings || !currentLocation) {
        setIsLoading(false);
        return;
      }
      setIsLoading(true);
      try {
        const res = await fetchDecisions(readings, currentLocation);
        setDecisionData(res);
      } catch (err) {
        console.error('Failed to load decisions:', err);
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, [readings, currentLocation]);

  if (!currentLocation || !readings) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 sm:py-24 text-center font-sans animate-fade-in">
        <div className="rounded-3xl bg-white p-8 sm:p-14 border border-slate-200/90 shadow-sm">
          <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-4 border border-emerald-200">
            <Compass className="w-8 h-8" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-heading font-extrabold text-slate-900 mb-3">
            Select a Monitoring Station
          </h2>
          <p className="text-sm sm:text-base text-slate-600 mb-8 max-w-lg mx-auto leading-relaxed">
            Real-time outdoor activity safety, window ventilation timing, and mask requirements depend on local atmospheric telemetry.
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

  const filterOptions = [
    { id: 'all', label: 'All Activities' },
    { id: 'exercise', label: 'Exercise & Running' },
    { id: 'walking', label: 'Walking & Recreation' },
    { id: 'commuting', label: 'Commute & Travel' },
    { id: 'ventilation', label: 'Window Ventilation' },
  ];

  const filteredDecisions = decisionData?.decisions.filter(d => {
    if (selectedFilter === 'all') return true;
    return d.activity_type === selectedFilter;
  }) || [];

  const getTierBadge = (tier: string) => {
    switch (tier) {
      case 'optimal':
        return { bg: 'bg-emerald-50 text-emerald-800 border-emerald-200', icon: CheckCircle2 };
      case 'caution':
        return { bg: 'bg-amber-50 text-amber-800 border-amber-200', icon: AlertTriangle };
      case 'restricted':
        return { bg: 'bg-orange-50 text-orange-800 border-orange-200', icon: AlertTriangle };
      case 'avoid':
      default:
        return { bg: 'bg-rose-50 text-rose-800 border-rose-200', icon: ShieldAlert };
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-5 sm:py-8 space-y-6 sm:space-y-8 animate-fade-in w-full overflow-hidden">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 sm:gap-4 pb-4 border-b border-slate-200/80">
        <div>
          <div className="flex items-center gap-2 text-[10px] sm:text-xs font-mono font-semibold text-emerald-800 uppercase tracking-wider">
            <Compass className="w-3.5 h-3.5" />
            <span>Deterministic Environmental Decision Support</span>
          </div>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-slate-900 font-sans tracking-tight mt-0.5 break-words">
            Smart Decision Engine
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Transforming {currentLocation.name.split(',')[0]} ambient telemetry into verified decisions. Standards: CPCB Indian National AQI.
          </p>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            onClick={() => onNavigate('planner')}
            className="w-full sm:w-auto flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-800 hover:bg-emerald-700 text-xs font-semibold text-white shadow-xs transition-colors cursor-pointer"
          >
            <span>24-Hour Best Time Planner</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Primary Global Advice Banner */}
      {decisionData && (
        <div className="p-5 rounded-2xl bg-gradient-to-r from-emerald-50/80 via-teal-50/70 to-slate-50 border border-emerald-200 shadow-2xs flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-emerald-800 text-white flex items-center justify-center shrink-0 mt-0.5">
            <Compass className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm text-slate-900 font-sans">
                {decisionData.overall_status}
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded font-semibold">
                NAQI {readings.indian_naqi} ({readings.indian_naqi_category})
              </span>
            </div>
            <p className="text-xs text-slate-700 mt-1 leading-relaxed">
              {decisionData.main_advice}
            </p>
          </div>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
        {filterOptions.map((f) => (
          <button
            key={f.id}
            onClick={() => setSelectedFilter(f.id)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
              selectedFilter === f.id
                ? 'bg-emerald-800 text-white shadow-2xs'
                : 'bg-white hover:bg-slate-50 border border-slate-200 text-slate-700'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Decision Cards List */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="p-12 text-center text-slate-400 font-mono text-xs">
            Evaluating deterministic environmental decision matrices...
          </div>
        ) : (
          filteredDecisions.map((item, idx) => {
            const badge = getTierBadge(item.recommendation_tier);
            const StatusIcon = badge.icon;

            return (
              <div
                key={idx}
                className="rounded-2xl bg-white p-5 sm:p-6 border border-slate-200/90 shadow-2xs hover:border-emerald-300 transition-all space-y-4"
              >
                {/* Header Slot */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                  <div>
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 block">
                      Activity Category
                    </span>
                    <h3 className="text-base font-bold text-slate-900 font-sans">
                      {item.activity_title}
                    </h3>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold border ${badge.bg}`}>
                      <StatusIcon className="w-3.5 h-3.5" />
                      <span>{item.recommendation}</span>
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-slate-100 text-slate-600">
                      {item.confidence_level}
                    </span>
                  </div>
                </div>

                {/* Primary Reason & Environmental Rationale */}
                <div className="space-y-2 text-xs text-slate-700 leading-relaxed font-sans">
                  <p>
                    <strong>Primary Reason:</strong> {item.reason}
                  </p>
                  <p className="text-slate-500 text-[11px]">
                    <strong>Scientific Rationale:</strong> {item.environmental_rationale}
                  </p>
                </div>

                {/* Concrete Alternative & Best Window */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2 text-xs">
                  <div className="p-3 rounded-xl bg-emerald-50/60 border border-emerald-100">
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-emerald-800 block mb-1">
                      Actionable Alternative
                    </span>
                    <span className="text-emerald-950 font-medium">
                      {item.alternative_action}
                    </span>
                  </div>

                  {item.best_time_window && (
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                      <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500 block mb-1">
                        Optimal Window
                      </span>
                      <span className="text-slate-800 font-medium font-mono">
                        {item.best_time_window}
                      </span>
                    </div>
                  )}
                </div>

                {/* Limitations & Confidence Strip */}
                <div className="pt-2 text-[11px] text-slate-400 font-mono flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-t border-slate-50">
                  <span>Confidence: {item.confidence_reason}</span>
                  <span className="text-slate-500">Note: {item.important_limitations}</span>
                </div>
              </div>
            );
          })
        )}
      </div>

    </div>
  );
};
