'use client';

import { Users, Clock, Target, Zap } from 'lucide-react';

const CATEGORY_COLORS: Record<string, { bg: string; text: string; dot: string }> = {
  water:          { bg: 'bg-blue-500/15',    text: 'text-blue-400',    dot: 'bg-blue-400' },
  healthcare:     { bg: 'bg-emerald-500/15', text: 'text-emerald-400', dot: 'bg-emerald-400' },
  education:      { bg: 'bg-violet-500/15',  text: 'text-violet-400',  dot: 'bg-violet-400' },
  infrastructure: { bg: 'bg-amber-500/15',   text: 'text-amber-400',   dot: 'bg-amber-400' },
  employment:     { bg: 'bg-pink-500/15',    text: 'text-pink-400',    dot: 'bg-pink-400' },
  food:           { bg: 'bg-orange-500/15',  text: 'text-orange-400',  dot: 'bg-orange-400' },
  default:        { bg: 'bg-slate-500/15',   text: 'text-slate-400',   dot: 'bg-slate-400' },
};

const URGENCY_CONFIG = {
  critical: { label: 'Critical',  bg: 'bg-red-500/15',    text: 'text-red-400',    pulse: true },
  high:     { label: 'High',      bg: 'bg-amber-500/15',  text: 'text-amber-400',  pulse: false },
  medium:   { label: 'Medium',    bg: 'bg-blue-500/15',   text: 'text-blue-400',   pulse: false },
  low:      { label: 'Low',       bg: 'bg-slate-500/15',  text: 'text-slate-400',  pulse: false },
};

interface Campaign {
  _id: string;
  title: string;
  description?: string;
  category: string;
  urgencyLevel?: string;
  organizationId?: { name?: string };
  goals?: { fundingGoal?: number; fundingRaised?: number; peopleToHelp?: number };
  endDate?: string;
  donors?: number;
}

interface Props {
  campaign: Campaign;
  onSelect: (id: string) => void;
  selected?: boolean;
}

export default function DonationCard({ campaign, onSelect, selected }: Props) {
  const cat = CATEGORY_COLORS[campaign.category] || CATEGORY_COLORS.default;
  const urgency = URGENCY_CONFIG[(campaign.urgencyLevel as keyof typeof URGENCY_CONFIG) || 'medium'];
  const goal = campaign.goals?.fundingGoal || 1;
  const raised = campaign.goals?.fundingRaised || 0;
  const pct = Math.min(Math.round((raised / goal) * 100), 100);
  const daysLeft = campaign.endDate
    ? Math.max(0, Math.ceil((new Date(campaign.endDate).getTime() - Date.now()) / 86400000))
    : 30;
  const orgName = campaign.organizationId?.name || 'JanSetu Network';

  return (
    <div
      onClick={() => onSelect(campaign._id)}
      className={`glass-card rounded-2xl border p-5 cursor-pointer transition-all duration-200 hover:scale-[1.01] hover:shadow-[0_0_20px_rgba(99,102,241,0.15)] ${
        selected
          ? 'border-indigo-500/60 shadow-[0_0_20px_rgba(99,102,241,0.25)] bg-indigo-500/5'
          : 'border-slate-800 hover:border-slate-700'
      }`}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-2 mb-3">
        <div className="flex flex-wrap gap-2">
          <span className={`inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-full ${cat.bg} ${cat.text}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${cat.dot}`} />
            {campaign.category}
          </span>
          <span className={`inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-full ${urgency.bg} ${urgency.text}`}>
            {urgency.pulse && <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />}
            {urgency.label}
          </span>
        </div>
        {selected && (
          <span className="flex-shrink-0 w-5 h-5 rounded-full bg-indigo-600 flex items-center justify-center">
            <svg className="w-3 h-3 text-white" viewBox="0 0 12 12" fill="none">
              <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </span>
        )}
      </div>

      {/* Title & Org */}
      <h3 className="text-sm font-bold text-slate-100 line-clamp-2 mb-1">{campaign.title}</h3>
      <p className="text-xs text-slate-500 mb-1">{orgName}</p>

      {/* Description */}
      {campaign.description && (
        <p className="text-xs text-slate-400 line-clamp-2 mb-3">{campaign.description}</p>
      )}

      {/* Progress */}
      <div className="mb-3">
        <div className="flex justify-between text-xs mb-1.5">
          <span className="text-indigo-400 font-semibold">₹{raised.toLocaleString()}</span>
          <span className="text-slate-500">of ₹{goal.toLocaleString()}</span>
        </div>
        <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-indigo-600 to-purple-500 transition-all duration-700"
            style={{ width: `${pct}%` }}
          />
        </div>
        <p className="text-right text-[10px] text-slate-500 mt-1">{pct}% funded</p>
      </div>

      {/* Stats Row */}
      <div className="flex items-center gap-4 text-[11px] text-slate-500">
        {campaign.goals?.peopleToHelp && (
          <span className="flex items-center gap-1"><Users className="w-3 h-3" />{campaign.goals.peopleToHelp.toLocaleString()} people</span>
        )}
        <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{daysLeft}d left</span>
        {campaign.donors && <span className="flex items-center gap-1"><Target className="w-3 h-3" />{campaign.donors} donors</span>}
      </div>

      {/* CTA */}
      <button
        onClick={(e) => { e.stopPropagation(); onSelect(campaign._id); }}
        className={`mt-4 w-full py-2 rounded-xl text-xs font-semibold transition-all ${
          selected
            ? 'bg-indigo-600 text-white'
            : 'bg-slate-800 text-indigo-400 hover:bg-indigo-600/20 border border-slate-700 hover:border-indigo-500/50'
        }`}
      >
        <span className="flex items-center justify-center gap-1.5">
          <Zap className="w-3 h-3" /> {selected ? 'Selected — Donate Now' : 'Donate to this Campaign'}
        </span>
      </button>
    </div>
  );
}
