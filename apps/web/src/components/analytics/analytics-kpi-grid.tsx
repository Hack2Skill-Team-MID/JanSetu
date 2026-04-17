'use client';

import { ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { LucideIcon } from 'lucide-react';

interface KPI {
  label: string;
  value: string | number;
  change: string;
  up: boolean;
  icon: LucideIcon;
  color: string;
  bgColor: string;
  borderColor: string;
}

interface Props { kpis: KPI[] }

export default function AnalyticsKPIGrid({ kpis }: Props) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {kpis.map((kpi) => (
        <div
          key={kpi.label}
          className={`glass-card rounded-2xl border ${kpi.borderColor} p-5 flex flex-col gap-3 hover:scale-[1.02] transition-transform`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium">{kpi.label}</span>
            <div className={`w-8 h-8 rounded-lg ${kpi.bgColor} flex items-center justify-center`}>
              <kpi.icon className={`w-4 h-4 ${kpi.color}`} />
            </div>
          </div>
          <div>
            <p className="text-2xl font-bold text-slate-100">{kpi.value}</p>
            <div className={`flex items-center gap-1 text-xs mt-1 ${kpi.up ? 'text-emerald-400' : 'text-red-400'}`}>
              {kpi.up
                ? <ArrowUpRight className="w-3 h-3" />
                : <ArrowDownRight className="w-3 h-3" />
              }
              <span>{kpi.change} this month</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
