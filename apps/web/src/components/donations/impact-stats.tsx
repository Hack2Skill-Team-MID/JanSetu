'use client';

import { Users, Package, CheckSquare, TrendingUp } from 'lucide-react';

interface Props {
  peopleHelped?: number;
  resourcesDelivered?: number;
  tasksCompleted?: number;
  growthRate?: number;
}

export default function ImpactStats({
  peopleHelped = 8420,
  resourcesDelivered = 1240,
  tasksCompleted = 347,
  growthRate = 38,
}: Props) {
  const stats = [
    {
      icon: Users,
      label: 'People Helped',
      value: peopleHelped.toLocaleString(),
      sub: 'across campaigns',
      color: 'text-indigo-400',
      bg: 'bg-indigo-500/10',
      border: 'border-indigo-500/20',
    },
    {
      icon: Package,
      label: 'Resources Delivered',
      value: resourcesDelivered.toLocaleString(),
      sub: 'units dispatched',
      color: 'text-emerald-400',
      bg: 'bg-emerald-500/10',
      border: 'border-emerald-500/20',
    },
    {
      icon: CheckSquare,
      label: 'Tasks Completed',
      value: tasksCompleted.toLocaleString(),
      sub: 'by volunteers',
      color: 'text-amber-400',
      bg: 'bg-amber-500/10',
      border: 'border-amber-500/20',
    },
    {
      icon: TrendingUp,
      label: 'YoY Growth',
      value: `+${growthRate}%`,
      sub: 'donor growth',
      color: 'text-pink-400',
      bg: 'bg-pink-500/10',
      border: 'border-pink-500/20',
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((s) => (
        <div
          key={s.label}
          className={`glass-card rounded-2xl border ${s.border} p-4 flex flex-col gap-3 hover:scale-[1.02] transition-transform`}
        >
          <div className={`w-9 h-9 rounded-xl ${s.bg} flex items-center justify-center`}>
            <s.icon className={`w-4 h-4 ${s.color}`} />
          </div>
          <div>
            <p className={`text-xl font-bold ${s.color}`}>{s.value}</p>
            <p className="text-xs font-semibold text-slate-200 mt-0.5">{s.label}</p>
            <p className="text-[11px] text-slate-500 mt-0.5">{s.sub}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
