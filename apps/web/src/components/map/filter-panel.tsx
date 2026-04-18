'use client';

import { SlidersHorizontal, X } from 'lucide-react';
import type { CrisisFilters, CrisisNGO } from '../../types/crisis-map.types';

interface FilterPanelProps {
  filters: CrisisFilters;
  onChange: (filters: CrisisFilters) => void;
  ngos: CrisisNGO[];
  totalVisible: number;
}

const URGENCIES = [
  { value: 'all',      label: 'All' },
  { value: 'critical', label: '🔴 Critical' },
  { value: 'high',     label: '🟠 High' },
  { value: 'medium',   label: '🟡 Medium' },
  { value: 'low',      label: '🟢 Low' },
];

const CATEGORIES = [
  { value: 'all',       label: 'All' },
  { value: 'health',    label: '❤️ Health' },
  { value: 'food',      label: '🍊 Food' },
  { value: 'disaster',  label: '⚡ Disaster' },
  { value: 'education', label: '📘 Education' },
  { value: 'water',     label: '💧 Water' },
  { value: 'safety',    label: '🛡️ Safety' },
  { value: 'other',     label: '⚙️ Other' },
];

export default function FilterPanel({ filters, onChange, ngos, totalVisible }: FilterPanelProps) {
  const hasActive = filters.urgency !== 'all' || filters.category !== 'all' || filters.ngoId !== 'all';

  const reset = () => onChange({ urgency: 'all', category: 'all', ngoId: 'all' });

  return (
    <div className="h-full flex flex-col gap-4 overflow-y-auto pb-2 pr-0.5">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <SlidersHorizontal className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Filters</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-slate-500">{totalVisible} shown</span>
          {hasActive && (
            <button onClick={reset} className="text-[10px] text-indigo-400 hover:text-indigo-300 flex items-center gap-0.5 transition-colors">
              <X className="w-2.5 h-2.5" /> Clear
            </button>
          )}
        </div>
      </div>

      {/* Urgency */}
      <div>
        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Urgency</p>
        <div className="flex flex-col gap-1">
          {URGENCIES.map((u) => (
            <button
              key={u.value}
              onClick={() => onChange({ ...filters, urgency: u.value })}
              className={`w-full text-left px-3 py-1.5 rounded-lg text-xs transition-all ${
                filters.urgency === u.value
                  ? 'bg-indigo-600/30 text-indigo-300 font-semibold'
                  : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'
              }`}
            >
              {u.label}
            </button>
          ))}
        </div>
      </div>

      {/* Divider */}
      <div className="border-t border-slate-800/60" />

      {/* Category */}
      <div>
        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Category</p>
        <div className="flex flex-col gap-1">
          {CATEGORIES.map((c) => (
            <button
              key={c.value}
              onClick={() => onChange({ ...filters, category: c.value })}
              className={`w-full text-left px-3 py-1.5 rounded-lg text-xs transition-all ${
                filters.category === c.value
                  ? 'bg-indigo-600/30 text-indigo-300 font-semibold'
                  : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>
      </div>

      {/* NGO */}
      {ngos.length > 0 && (
        <>
          <div className="border-t border-slate-800/60" />
          <div>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">NGO</p>
            <select
              value={filters.ngoId}
              onChange={(e) => onChange({ ...filters, ngoId: e.target.value })}
              className="w-full px-3 py-2 bg-slate-800/60 border border-slate-700/50 rounded-xl text-xs text-slate-300 focus:outline-none focus:border-indigo-500/50 appearance-none"
            >
              <option value="all">All NGOs</option>
              {ngos.map((n) => (
                <option key={n._id} value={n._id}>{n.name}</option>
              ))}
            </select>
          </div>
        </>
      )}
    </div>
  );
}
