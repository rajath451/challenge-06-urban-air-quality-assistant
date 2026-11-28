import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../hooks/useTheme';

interface ThemeToggleProps {
  showLabel?: boolean;
  className?: string;
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({ showLabel = false, className = '' }) => {
  const { toggleTheme, isDark } = useTheme();

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
      title={isDark ? 'Switch to Light Theme' : 'Switch to Dark Theme'}
      className={`group relative flex items-center justify-center gap-2 p-1.5 rounded-lg border transition-all duration-200 cursor-pointer select-none ${
        isDark
          ? 'bg-slate-900/90 border-slate-700/80 text-amber-300 hover:text-amber-200 hover:border-amber-400/40 hover:bg-slate-800 shadow-xs'
          : 'bg-slate-100/90 border-slate-300 text-slate-700 hover:text-indigo-600 hover:border-indigo-400/50 hover:bg-white shadow-xs'
      } ${className}`}
    >
      <div className="relative w-4 h-4 flex items-center justify-center transition-transform duration-300 group-hover:rotate-12">
        {isDark ? (
          <Sun className="w-4 h-4 text-amber-300 group-hover:text-amber-200 shrink-0 animate-fadeIn" />
        ) : (
          <Moon className="w-4 h-4 text-indigo-500 group-hover:text-indigo-600 shrink-0 animate-fadeIn" />
        )}
      </div>
      {showLabel && (
        <span className="text-xs font-medium tracking-tight">
          {isDark ? 'Light Mode' : 'Dark Mode'}
        </span>
      )}
    </button>
  );
};
