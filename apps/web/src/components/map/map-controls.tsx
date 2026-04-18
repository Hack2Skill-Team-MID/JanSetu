'use client';

import { useState } from 'react';
import { Search, RefreshCw, X } from 'lucide-react';

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
    <div className="flex items-center gap-2">
      {/* Search */}
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500 pointer-events-none" />
        <input
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search crises, categories, regions..."
          className="w-full pl-9 pr-8 py-2 bg-slate-900/90 border border-slate-700/60 rounded-xl text-xs text-slate-200 focus:border-indigo-500/70 focus:outline-none placeholder:text-slate-600 backdrop-blur-sm transition-all"
        />
        {searchQuery && (
          <button
            onClick={() => onSearchChange('')}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
          >
            <X className="w-3 h-3" />
          </button>
        )}
      </div>

      {/* Live Toggle */}
      <button
        onClick={onToggleLive}
        className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold border transition-all whitespace-nowrap ${
          isLive
            ? 'bg-red-500/15 border-red-500/30 text-red-400'
            : 'bg-slate-800/80 border-slate-700/60 text-slate-500 hover:text-slate-300'
        }`}
      >
        <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${isLive ? 'bg-red-400 animate-pulse' : 'bg-slate-600'}`} />
        {isLive ? 'LIVE' : 'PAUSED'}
      </button>

      {/* Refresh */}
      <button
        onClick={onRefresh}
        className="p-2 rounded-xl bg-slate-800/80 border border-slate-700/60 text-slate-500 hover:text-slate-300 hover:border-slate-500 transition-all"
        title="Refresh"
      >
        <RefreshCw className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}
