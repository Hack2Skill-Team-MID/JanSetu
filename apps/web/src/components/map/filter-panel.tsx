'use client';

import { SlidersHorizontal, X } from 'lucide-react';
import type { CrisisFilters, CrisisNGO } from '../../types/crisis-map.types';

interface FilterPanelProps {
  filters: CrisisFilters;
  onChange: (filters: CrisisFilters) => void;
  ngos: CrisisNGO[];
}

const URGENCIES = ['all', 'critical', 'high', 'medium', 'low'];
const CATEGORIES = ['all', 'health', 'food', 'disaster', 'education', 'water', 'safety', 'other'];

const URGENCY_COLORS: Record<string, string> = {
  critical: 'bg-red-500/20 text-red-400 border-red-500/40',
  high:     'bg-orange-500/20 text-orange-400 border-orange-500/40',
  medium:   'bg-yellow-500/20 text-yellow-400 border-yellow-500/40',
  low:      'bg-emerald-500/20 text-emerald-400 border-emerald-500/40',
};

export default function FilterPanel({ filters, onChange, ngos }: FilterPanelProps) {
  const hasActive =
    filters.urgency !== 'all' || filters.category !== 'all' || filters.ngoId !== 'all';

  const reset = () =>
    onChange({ urgency: 'all', category: 'all', ngoId: 'all' });

  return (
    <div className="bg-slate-900/80 backdrop-blur-md border border-slate-800 rounded-2xl p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-semibold text-slate-400 flex items-center gap-1.5 uppercase tracking-wider">
          <SlidersHorizontal className="w-3.5 h-3.5" /> Filters
        </h3>
        {hasActive && (
          <button
            onClick={reset}
            className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
          >
            <X className="w-3 h-3" /> Clear
          </button>
        )}
      </div>

      {/* Urgency */}
      <div>
        <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-2">Urgency</p>
        <div className="flex flex-wrap gap-1.5">
          {URGENCIES.map((u) => (
            <button
              key={u}
              onClick={() => onChange({ ...filters, urgency: u })}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition-all ${
                filters.urgency === u
                  ? u === 'all'
                    ? 'bg-indigo-600 border-indigo-500 text-white'
                    : URGENCY_COLORS[u]
                  : 'bg-slate-800/60 border-slate-700 text-slate-400 hover:border-slate-500'
              }`}
            >
              {u === 'all' ? 'All' : u.charAt(0).toUpperCase() + u.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Category */}
      <div>
        <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-2">Category</p>
        <div className="flex flex-wrap gap-1.5">
          {CATEGORIES.map((c) => (
            <button
              key={c}
              onClick={() => onChange({ ...filters, category: c })}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition-all ${
                filters.category === c
                  ? 'bg-indigo-600 border-indigo-500 text-white'
                  : 'bg-slate-800/60 border-slate-700 text-slate-400 hover:border-slate-500'
              }`}
            >
              {c === 'all' ? 'All' : c.charAt(0).toUpperCase() + c.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* NGO */}
      {ngos.length > 0 && (
        <div>
          <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-2">NGO</p>
          <select
            value={filters.ngoId}
            onChange={(e) => onChange({ ...filters, ngoId: e.target.value })}
            className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
          >
            <option value="all">All NGOs</option>
            {ngos.map((n) => (
              <option key={n._id} value={n._id}>{n.name}</option>
            ))}
          </select>
        </div>
      )}
    </div>
  );
}
