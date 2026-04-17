'use client';

import { useState } from 'react';
import { X, AlertTriangle, Users, Building2, Heart, UserPlus, Sparkles, ChevronDown, ChevronUp } from 'lucide-react';
import type { Crisis } from '../../../types/crisis-map.types';
import { CATEGORY_COLORS, URGENCY_COLORS } from '../../../types/crisis-map.types';

interface RightPanelProps {
  crisis: Crisis | null;
  onClose: () => void;
  onAssignVolunteer: () => void;
  onDonate: (crisisId: string) => void;
  onFetchInsights: (crisisId: string) => Promise<string>;
}

export default function RightPanel({
  crisis,
  onClose,
  onAssignVolunteer,
  onDonate,
  onFetchInsights,
}: RightPanelProps) {
  const [insight, setInsight]       = useState<string | null>(null);
  const [loadingInsight, setLoading] = useState(false);
  const [showInsight, setShowInsight] = useState(false);

  const handleInsight = async () => {
    if (!crisis) return;
    if (insight) { setShowInsight(!showInsight); return; }
    setLoading(true);
    try {
      const result = await onFetchInsights(crisis._id);
      setInsight(result);
      setShowInsight(true);
    } finally {
      setLoading(false);
    }
  };

  // Reset insight when crisis changes
  useState(() => {
    setInsight(null);
    setShowInsight(false);
  });

  if (!crisis) {
    return (
      <div className="h-full flex flex-col items-center justify-center gap-3 text-center p-6">
        <div className="w-16 h-16 rounded-2xl bg-slate-800/60 flex items-center justify-center">
          <AlertTriangle className="w-8 h-8 text-slate-600" />
        </div>
        <p className="text-sm text-slate-400">Click a crisis marker on the map to view details</p>
      </div>
    );
  }

  const catColor   = CATEGORY_COLORS[crisis.category] || '#6366f1';
  const urgColor   = URGENCY_COLORS[crisis.urgencyLevel] || '#6b7280';
  const ngoName    = typeof crisis.ngoId === 'object' ? crisis.ngoId?.name : 'Unknown NGO';

  const urgBadge: Record<string, string> = {
    critical: 'bg-red-500/20 text-red-400 border-red-500/40',
    high:     'bg-orange-500/20 text-orange-400 border-orange-500/40',
    medium:   'bg-yellow-500/20 text-yellow-400 border-yellow-500/40',
    low:      'bg-emerald-500/20 text-emerald-400 border-emerald-500/40',
  };

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div
        className="p-4 border-b border-slate-800 flex-shrink-0"
        style={{ borderLeft: `3px solid ${catColor}` }}
      >
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span
                className={`px-2 py-0.5 rounded-md text-[10px] font-bold border uppercase ${urgBadge[crisis.urgencyLevel] || 'bg-slate-700 text-slate-400 border-slate-600'}`}
              >
                {crisis.urgencyLevel}
              </span>
              <span
                className="px-2 py-0.5 rounded-md text-[10px] font-medium border border-slate-700 text-slate-400 capitalize"
              >
                {crisis.category}
              </span>
            </div>
            <h3 className="text-sm font-bold text-slate-100 leading-tight">{crisis.title}</h3>
          </div>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-300 flex-shrink-0">
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">

        {/* Description */}
        <p className="text-xs text-slate-400 leading-relaxed">{crisis.description}</p>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-slate-800/60 rounded-xl p-3 flex items-center gap-2">
            <Users className="w-4 h-4 text-indigo-400 flex-shrink-0" />
            <div>
              <p className="text-[10px] text-slate-500">Affected</p>
              <p className="text-sm font-bold text-slate-200">
                {crisis.affectedPopulation ? crisis.affectedPopulation.toLocaleString() : 'N/A'}
              </p>
            </div>
          </div>
          <div className="bg-slate-800/60 rounded-xl p-3 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0" />
            <div>
              <p className="text-[10px] text-slate-500">Priority</p>
              <p className="text-sm font-bold text-slate-200">{crisis.priorityScore}/100</p>
            </div>
          </div>
        </div>

        {/* NGO */}
        <div className="bg-slate-800/40 rounded-xl p-3 flex items-center gap-3">
          <Building2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
          <div className="min-w-0">
            <p className="text-[10px] text-slate-500">Responding NGO</p>
            <p className="text-xs font-semibold text-slate-200 truncate">{ngoName}</p>
          </div>
        </div>

        {/* Location */}
        <div className="bg-slate-800/40 rounded-xl p-3">
          <p className="text-[10px] text-slate-500 mb-1">Location</p>
          <p className="text-xs text-slate-300">{crisis.location}</p>
          <p className="text-[10px] text-slate-500 mt-0.5">Region: {crisis.region}</p>
        </div>

        {/* AI Insight */}
        <div className="border border-slate-800 rounded-xl overflow-hidden">
          <button
            onClick={handleInsight}
            className="w-full flex items-center justify-between px-3 py-2.5 bg-slate-800/40 text-xs font-medium text-slate-300 hover:bg-slate-800/70 transition-colors"
          >
            <span className="flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              AI Crisis Insight
            </span>
            {loadingInsight ? (
              <span className="w-3 h-3 border border-indigo-400 border-t-transparent rounded-full animate-spin" />
            ) : showInsight ? (
              <ChevronUp className="w-3.5 h-3.5" />
            ) : (
              <ChevronDown className="w-3.5 h-3.5" />
            )}
          </button>
          {showInsight && insight && (
            <div className="px-3 py-3 bg-indigo-950/30 border-t border-slate-800">
              <p className="text-xs text-slate-300 leading-relaxed">{insight}</p>
            </div>
          )}
          {crisis.aiInsights && !showInsight && (
            <div className="px-3 py-2 bg-indigo-950/20 border-t border-slate-800">
              <p className="text-[10px] text-slate-500 italic">Pre-loaded insight available — click to expand</p>
            </div>
          )}
        </div>
      </div>

      {/* Action buttons */}
      <div className="p-4 border-t border-slate-800 flex-shrink-0 space-y-2">
        <button
          onClick={onAssignVolunteer}
          className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold transition-all"
        >
          <UserPlus className="w-4 h-4" /> Assign Volunteer
        </button>
        <button
          onClick={() => onDonate(crisis._id)}
          className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-indigo-500/40 text-indigo-400 hover:bg-indigo-500/10 hover:border-indigo-400 text-sm font-semibold transition-all"
        >
          <Heart className="w-4 h-4" /> Donate to Relief
        </button>
      </div>
    </div>
  );
}
