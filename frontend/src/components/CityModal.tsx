import React, { useState } from 'react';
import { Search, MapPin, X, Navigation, Building2, Check } from 'lucide-react';
import { LocationInfo } from '../types';
import { FEATURED_CITIES, searchCities } from '../services/api';

interface CityModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectCity: (loc: LocationInfo) => void;
  currentLocation: LocationInfo | null;
}

export const CityModal: React.FC<CityModalProps> = ({
  isOpen,
  onClose,
  onSelectCity,
  currentLocation
}) => {
  const [query, setQuery] = useState('');
  const [searchResults, setSearchResults] = useState<LocationInfo[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isLocating, setIsLocating] = useState(false);

  if (!isOpen) return null;

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    setIsSearching(true);
    try {
      const results = await searchCities(query);
      setSearchResults(results);
    } catch (err) {
      console.error('Search error:', err);
    } finally {
      setIsSearching(false);
    }
  };

  const handleDetectGPS = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setIsLocating(false);
        onSelectCity({
          name: 'Current Detected Location (via GPS)',
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
          state: 'Detected State',
          country: 'India',
          station_name: 'Local CAAQMS Grid Station',
          is_coastal: false
        });
        onClose();
      },
      (err) => {
        setIsLocating(false);
        alert(`Location detection failed: ${err.message}. Using current station.`);
      },
      { timeout: 8000 }
    );
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fade-in"
      role="dialog"
      aria-modal="true"
      aria-label="Select Environmental Monitoring Station"
    >
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[85vh]">
        
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MapPin className="w-5 h-5 text-emerald-700" />
            <div>
              <h3 className="font-bold text-slate-900 text-base font-sans">
                Select Environmental Monitoring Station
              </h3>
              <p className="text-[11px] text-slate-500">
                Pan-India live telemetry calibrated against national CPCB and State CAAQMS stations.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close station selector"
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search Input & GPS Button */}
        <div className="p-5 border-b border-slate-100 space-y-3">
          <form onSubmit={handleSearch} className="relative flex items-center">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search any Indian city, district, or region (e.g. Bengaluru, Delhi, Mumbai, Hyderabad)..."
              className="w-full pl-10 pr-24 py-2.5 rounded-xl border border-slate-200 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100 text-xs sm:text-sm text-slate-800 placeholder-slate-400 outline-hidden transition-all"
            />
            <button
              type="submit"
              disabled={isSearching}
              className="absolute right-1.5 px-3 py-1.5 rounded-lg bg-emerald-800 hover:bg-emerald-700 text-white font-medium text-xs shadow-2xs transition-colors disabled:opacity-50"
            >
              {isSearching ? 'Searching...' : 'Search'}
            </button>
          </form>

          {/* GPS Auto-detect Button */}
          <button
            onClick={handleDetectGPS}
            disabled={isLocating}
            className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-semibold border border-slate-200 transition-colors"
          >
            <Navigation className={`w-3.5 h-3.5 text-emerald-700 ${isLocating ? 'animate-spin' : ''}`} />
            <span>{isLocating ? 'Acquiring GPS coordinates...' : 'Auto-detect My Exact Coordinates (GPS)'}</span>
          </button>
        </div>

        {/* Body & Presets */}
        <div className="p-5 overflow-y-auto space-y-4">
          
          {/* Live Search Results */}
          {searchResults.length > 0 && (
            <div>
              <span className="text-[11px] font-mono font-semibold text-slate-400 uppercase tracking-wider block mb-2">
                Search Results ({searchResults.length})
              </span>
              <div className="space-y-1.5">
                {searchResults.map((loc, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      onSelectCity(loc);
                      onClose();
                    }}
                    className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-emerald-50 text-left border border-slate-100 hover:border-emerald-200 transition-colors group"
                  >
                    <div className="flex items-center gap-2.5">
                      <Building2 className="w-4 h-4 text-slate-400 group-hover:text-emerald-700" />
                      <div>
                        <span className="text-xs font-semibold text-slate-800 block">
                          {loc.name}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">
                          {loc.latitude.toFixed(2)}° N, {loc.longitude.toFixed(2)}° E • {loc.station_name || 'CPCB Grid'}
                        </span>
                      </div>
                    </div>
                    {currentLocation?.name === loc.name && (
                      <Check className="w-4 h-4 text-emerald-700" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Featured Indian Monitoring Locations */}
          <div>
            <span className="text-[11px] font-mono font-semibold text-slate-400 uppercase tracking-wider block mb-2">
              Supported Indian Regional Stations
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {FEATURED_CITIES.map((loc, idx) => {
                const isSelected = currentLocation?.name === loc.name;

                return (
                  <button
                    key={idx}
                    onClick={() => {
                      onSelectCity(loc);
                      onClose();
                    }}
                    className={`flex items-start justify-between p-3 rounded-xl text-left border transition-all ${
                      isSelected
                        ? 'bg-emerald-50/90 border-emerald-500 ring-1 ring-emerald-300'
                        : 'bg-white hover:bg-slate-50 border-slate-200/80'
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-slate-900 font-sans">
                          {loc.name.split(',')[0]}
                        </span>
                        {isSelected && (
                          <span className="text-[9px] font-mono px-1.5 py-0.2 bg-emerald-100 text-emerald-800 rounded font-semibold">
                            Active Station
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-slate-500 font-mono block mt-0.5">
                        {loc.station_name}
                      </span>
                    </div>
                    {isSelected && <Check className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />}
                  </button>
                );
              })}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
