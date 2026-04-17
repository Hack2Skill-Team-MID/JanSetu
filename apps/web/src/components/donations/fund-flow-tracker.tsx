'use client';

import { ArrowRight, Wallet, BarChart2, Package, Heart } from 'lucide-react';

interface Props {
  totalDonated?: number;
  allocated?: number;
  utilized?: number;
  impacted?: number;
}

export default function FundFlowTracker({ totalDonated = 0, allocated, utilized, impacted }: Props) {
  const alloc   = allocated ?? Math.round(totalDonated * 0.88);
  const util    = utilized  ?? Math.round(alloc * 0.82);
  const impact  = impacted  ?? Math.round(util * 0.95);

  const steps = [
    {
      icon: Wallet,
      label: 'Donations Received',
      amount: totalDonated,
      color: 'text-indigo-400',
      bg: 'bg-indigo-500/10',
      border: 'border-indigo-500/25',
      glow: 'shadow-[0_0_12px_rgba(99,102,241,0.15)]',
    },
    {
      icon: BarChart2,
      label: 'Allocated to Campaigns',
      amount: alloc,
      color: 'text-emerald-400',
      bg: 'bg-emerald-500/10',
      border: 'border-emerald-500/25',
      glow: 'shadow-[0_0_12px_rgba(16,185,129,0.15)]',
    },
    {
      icon: Package,
      label: 'Resources Utilized',
      amount: util,
      color: 'text-amber-400',
      bg: 'bg-amber-500/10',
      border: 'border-amber-500/25',
      glow: 'shadow-[0_0_12px_rgba(245,158,11,0.15)]',
    },
    {
      icon: Heart,
      label: 'Impact Achieved',
      amount: impact,
      color: 'text-pink-400',
      bg: 'bg-pink-500/10',
      border: 'border-pink-500/25',
      glow: 'shadow-[0_0_12px_rgba(236,72,153,0.15)]',
    },
  ];

  const efficiency = totalDonated > 0 ? Math.round((util / totalDonated) * 100) : 0;

  return (
    <div className="glass-card rounded-2xl border border-slate-800 p-5">
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-sm font-bold text-slate-200">Fund Flow Tracker</h3>
        <span className="text-xs text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full font-semibold">
          {efficiency}% efficiency
        </span>
      </div>

      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        {steps.map((step, i) => (
          <div key={step.label} className="flex sm:flex-col items-center gap-3 sm:gap-0 flex-1">
            <div className={`flex-1 sm:flex-none rounded-xl border p-4 w-full ${step.bg} ${step.border} ${step.glow} transition-all`}>
              <div className="flex sm:flex-col items-center sm:items-start gap-3">
                <div className={`w-9 h-9 rounded-lg ${step.bg} flex items-center justify-center flex-shrink-0`}>
                  <step.icon className={`w-4 h-4 ${step.color}`} />
                </div>
                <div>
                  <p className="text-[10px] text-slate-500 mb-0.5">{step.label}</p>
                  <p className={`text-base font-bold ${step.color}`}>
                    ₹{step.amount.toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
            {i < steps.length - 1 && (
              <ArrowRight className="w-4 h-4 text-slate-600 flex-shrink-0 rotate-90 sm:rotate-0 hidden sm:block" />
            )}
          </div>
        ))}
      </div>

      {/* Progress bar */}
      {totalDonated > 0 && (
        <div className="mt-4 pt-4 border-t border-slate-800">
          <div className="flex justify-between text-[11px] text-slate-500 mb-1.5">
            <span>Utilization Rate</span>
            <span className="text-emerald-400 font-medium">{efficiency}%</span>
          </div>
          <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-indigo-600 via-emerald-500 to-amber-500 transition-all duration-1000"
              style={{ width: `${efficiency}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
