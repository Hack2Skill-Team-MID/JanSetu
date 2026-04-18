'use client';

import { useState } from 'react';
import {
  X, AlertTriangle, Users, Building2, Heart, UserPlus,
  Sparkles, ChevronDown, ChevronUp, MapPin, TrendingUp,
} from 'lucide-react';
import type { Crisis } from '../../types/crisis-map.types';
import { CATEGORY_COLORS, URGENCY_COLORS } from '../../types/crisis-map.types';

interface RightPanelProps {
  crisis: Crisis | null;
  onClose: () => void;
  onAssignVolunteer: () => void;
  onDonate: (crisisId: string) => void;
  onFetchInsights: (crisisId: string) => Promise<string>;
}

const URGENCY_BADGE: Record<string, { bg: string; text: string; dot: string }> = {
  critical: { bg: 'bg-red-500/20',     text: 'text-red-400',    dot: 'bg-red-400' },
  high:     { bg: 'bg-orange-500/20',  text: 'text-orange-400', dot: 'bg-orange-400' },
  medium:   { bg: 'bg-yellow-500/20',  text: 'text-yellow-400', dot: 'bg-yellow-400' },
  low:      { bg: 'bg-emerald-500/20', text: 'text-emerald-400',dot: 'bg-emerald-400' },
};

export default function RightPanel({
  crisis,
  onClose,
  onAssignVolunteer,
  onDonate,
  onFetchInsights,
}: RightPanelProps) {
  const [insight, setInsight]         = useState<string | null>(null);
  const [loadingInsight, setLoading]  = useState(false);
  const [showInsight, setShowInsight] = useState(false);
  const [insightFetched, setFetched]  = useState<string | null>(null);

  const handleInsight = async () => {
    if (!crisis) return;
    if (insightFetched === crisis._id && insight) {
      setShowInsight(!showInsight);
      return;
    }
    setLoading(true);
    try {
      const result = await onFetchInsights(crisis._id);
      setInsight(result);
      setFetched(crisis._id);
      setShowInsight(true);
    } finally {
      setLoading(false);
    }
  };

  /* Empty state */
  if (!crisis) {
    return (
      <div
        className="h-full flex flex-col items-center justify-center gap-4 p-6 text-center"
        style={{ background: 'rgba(15,23,42,0.85)', backdropFilter: 'blur(12px)' }}
      >
        <div className="w-14 h-14 rounded-2xl bg-slate-800/80 flex items-center justify-center border border-slate-700/50">
          <MapPin className="w-6 h-6 text-slate-600" />
        </div>
        <div>
          <p className="text-sm font-medium text-slate-400">No crisis selected</p>
          <p className="text-xs text-slate-600 mt-1">Click a marker on the map</p>
        </div>
      </div>
    );
  }

  const catColor  = CATEGORY_COLORS[crisis.category] || '#6366f1';
  const urgBadge  = URGENCY_BADGE[crisis.urgencyLevel] || URGENCY_BADGE.low;
  const ngoName   = typeof crisis.ngoId === 'object' ? crisis.ngoId?.name : 'Unknown NGO';
  const priorityPct = Math.min(crisis.priorityScore || 50, 100);

  return (
    <div
      className="h-full flex flex-col overflow-hidden"
      style={{ background: 'rgba(10,17,32,0.92)', backdropFilter: 'blur(16px)' }}
    >
      {/* ── Top accent bar ── */}
      <div className="h-0.5 w-full flex-shrink-0" style={{ background: catColor }} />

      {/* ── Header ── */}
      <div className="flex-shrink-0 px-4 pt-4 pb-3 border-b border-slate-800/60">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
              <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase ${urgBadge.bg} ${urgBadge.text}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${urgBadge.dot}`} />
                {crisis.urgencyLevel}
              </span>
              <span className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-slate-800/80 text-slate-400 capitalize border border-slate-700/50">
                {crisis.category}
              </span>
            </div>
            <h3 className="text-sm font-bold text-slate-100 leading-snug line-clamp-2">{crisis.title}</h3>
          </div>
          <button
            onClick={onClose}
            className="flex-shrink-0 w-7 h-7 rounded-lg bg-slate-800/80 hover:bg-slate-700/80 flex items-center justify-center text-slate-500 hover:text-slate-300 transition-all"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* ── Scrollable body ── */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">

        {/* Description */}
        <p className="text-xs text-slate-400 leading-relaxed">{crisis.description}</p>

        {/* Stats row */}
        <div className="grid grid-cols-2 gap-2">
          <div className="rounded-xl bg-slate-800/50 border border-slate-700/40 p-3 flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-indigo-500/15 flex items-center justify-center flex-shrink-0">
              <Users className="w-3.5 h-3.5 text-indigo-400" />
            </div>
            <div>
              <p className="text-[9px] text-slate-500 uppercase tracking-widest">Affected</p>
              <p className="text-sm font-bold text-slate-100">
                {crisis.affectedPopulation ? crisis.affectedPopulation.toLocaleString('en-IN') : '—'}
              </p>
            </div>
          </div>
          <div className="rounded-xl bg-slate-800/50 border border-slate-700/40 p-3 flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-amber-500/15 flex items-center justify-center flex-shrink-0">
              <TrendingUp className="w-3.5 h-3.5 text-amber-400" />
            </div>
            <div>
              <p className="text-[9px] text-slate-500 uppercase tracking-widest">Priority</p>
              <p className="text-sm font-bold text-slate-100">{crisis.priorityScore ?? 50}/100</p>
            </div>
          </div>
        </div>

        {/* Priority bar */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-[9px] text-slate-500 uppercase tracking-widest">
            <span>Priority Score</span>
            <span>{priorityPct}%</span>
          </div>
          <div className="h-1.5 w-full bg-slate-800/80 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{
                width: `${priorityPct}%`,
                background: priorityPct >= 80 ? '#ef4444' : priorityPct >= 60 ? '#f97316' : '#eab308',
              }}
            />
          </div>
        </div>

        {/* NGO */}
        <div className="flex items-center gap-3 rounded-xl bg-slate-800/50 border border-slate-700/40 p-3">
          <div className="w-7 h-7 rounded-lg bg-emerald-500/15 flex items-center justify-center flex-shrink-0">
            <Building2 className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <div className="min-w-0">
            <p className="text-[9px] text-slate-500 uppercase tracking-widest">Responding NGO</p>
            <p className="text-xs font-semibold text-slate-200 truncate">{ngoName}</p>
          </div>
        </div>

        {/* Location */}
        <div className="flex items-center gap-3 rounded-xl bg-slate-800/50 border border-slate-700/40 p-3">
          <div className="w-7 h-7 rounded-lg bg-blue-500/15 flex items-center justify-center flex-shrink-0">
            <MapPin className="w-3.5 h-3.5 text-blue-400" />
          </div>
          <div className="min-w-0">
            <p className="text-[9px] text-slate-500 uppercase tracking-widest">Location</p>
            <p className="text-xs font-medium text-slate-300 truncate">{crisis.location}</p>
            <p className="text-[10px] text-slate-500">{crisis.region}</p>
          </div>
        </div>

        {/* AI Insight accordion */}
        <div className="rounded-xl border border-slate-700/40 overflow-hidden">
          <button
            onClick={handleInsight}
            className="w-full flex items-center justify-between px-3 py-2.5 bg-slate-800/40 hover:bg-slate-800/70 text-xs font-medium text-slate-300 transition-colors"
          >
            <span className="flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              AI Crisis Insight
              {crisis.aiInsights && !insight && (
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
              )}
            </span>
            {loadingInsight
              ? <span className="w-3 h-3 border border-indigo-400 border-t-transparent rounded-full animate-spin" />
              : showInsight
                ? <ChevronUp className="w-3.5 h-3.5 text-slate-500" />
                : <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
            }
          </button>
          {showInsight && insight && (
            <div className="px-3 py-3 bg-indigo-950/20 border-t border-slate-800/60">
              <p className="text-[11px] text-slate-300 leading-relaxed">{insight}</p>
            </div>
          )}
        </div>
      </div>

      {/* ── Action buttons ── */}
      <div className="flex-shrink-0 px-4 pb-4 pt-3 border-t border-slate-800/60 space-y-2">
        <button
          onClick={onAssignVolunteer}
          className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 active:scale-[0.98] text-white text-xs font-bold transition-all shadow-[0_0_16px_rgba(99,102,241,0.25)]"
        >
          <UserPlus className="w-3.5 h-3.5" />
          Assign Volunteer
        </button>
        <button
          onClick={() => onDonate(crisis._id)}
          className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-rose-600/20 hover:bg-rose-600/30 active:scale-[0.98] border border-rose-500/50 text-rose-400 hover:text-rose-300 text-xs font-bold transition-all"
        >
          <Heart className="w-3.5 h-3.5" />
          Donate to Relief
        </button>
      </div>
    </div>
  );
}
