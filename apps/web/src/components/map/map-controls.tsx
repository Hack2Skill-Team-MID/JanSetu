'use client';

import { Search, Radio, RadioOff, RefreshCw } from 'lucide-react';

interface MapControlsProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  isLive: boolean;
  onToggleLive: () => void;
  onRefresh: () => void;
  totalCrises: number;
  filteredCount: number;
}

export default function MapControls({
  searchQuery,
  onSearchChange,
  isLive,
  onToggleLive,
  onRefresh,
  totalCrises,
  filteredCount,
}: MapControlsProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
      {/* Search */}
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
        <input
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search crises by title, category, region..."
          className="w-full pl-9 pr-4 py-2.5 bg-slate-900/80 border border-slate-700 rounded-xl text-sm text-slate-200 focus:border-indigo-500 focus:outline-none placeholder:text-slate-500 backdrop-blur-sm"
        />
        {searchQuery && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-500">
            {filteredCount}/{totalCrises}
          </span>
        )}
      </div>

      {/* Live toggle */}
      <button
        onClick={onToggleLive}
        className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all border ${
          isLive
            ? 'bg-red-500/20 border-red-500/40 text-red-400 shadow-[0_0_12px_rgba(239,68,68,0.2)]'
            : 'bg-slate-800/60 border-slate-700 text-slate-400 hover:border-slate-500'
        }`}
      >
        <span
          className={`w-2 h-2 rounded-full ${
            isLive ? 'bg-red-500 animate-pulse' : 'bg-slate-600'
          }`}
        />
        {isLive ? 'LIVE' : 'PAUSED'}
      </button>

      {/* Refresh */}
      <button
        onClick={onRefresh}
        className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium bg-slate-800/60 border border-slate-700 text-slate-400 hover:text-slate-200 hover:border-slate-500 transition-all"
      >
        <RefreshCw className="w-4 h-4" />
        Refresh
      </button>
    </div>
  );
}
