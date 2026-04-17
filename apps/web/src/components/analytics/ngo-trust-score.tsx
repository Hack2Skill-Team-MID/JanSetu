'use client';

import { CheckCircle2, XCircle, Shield } from 'lucide-react';

interface Props {
  score?: number;
  label?: string;
  checks?: { label: string; pass: boolean }[];
}

const DEFAULT_CHECKS = [
  { label: 'FCRA Compliant', pass: true },
  { label: 'Annual Report Filed', pass: true },
  { label: 'Govt Registration', pass: true },
  { label: 'Fund Audit Complete', pass: true },
  { label: 'Impact Verified', pass: false },
  { label: '80G Tax Exemption', pass: true },
];

export default function NGOTrustScore({ score = 87, label = 'JanSetu Network', checks = DEFAULT_CHECKS }: Props) {
  const radius = 44;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference - (score / 100) * circumference;

  const scoreColor =
    score >= 80 ? '#10b981' :
    score >= 60 ? '#f59e0b' :
    '#ef4444';

  return (
    <div className="glass-card rounded-2xl border border-slate-800 p-5">
      <div className="flex items-center gap-2 mb-5">
        <Shield className="w-4 h-4 text-emerald-400" />
        <h3 className="text-sm font-bold text-slate-200">NGO Trust Score</h3>
      </div>

      {/* Circular gauge */}
      <div className="flex flex-col items-center mb-5">
        <div className="relative w-28 h-28">
          <svg className="w-28 h-28 -rotate-90" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r={radius} fill="none" stroke="#1e293b" strokeWidth={10} />
            <circle
              cx="50" cy="50" r={radius}
              fill="none"
              stroke={scoreColor}
              strokeWidth={10}
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={dashOffset}
              className="transition-all duration-1000"
              style={{ filter: `drop-shadow(0 0 6px ${scoreColor})` }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-2xl font-bold text-slate-100">{score}</span>
            <span className="text-[10px] text-slate-500">/ 100</span>
          </div>
        </div>
        <p className="text-xs font-semibold text-slate-300 mt-2">{label}</p>
        <span
          className="mt-1 text-[11px] font-medium px-2 py-0.5 rounded-full"
          style={{ background: `${scoreColor}18`, color: scoreColor, border: `1px solid ${scoreColor}33` }}
        >
          {score >= 80 ? 'Highly Trusted' : score >= 60 ? 'Trusted' : 'Needs Review'}
        </span>
      </div>

      {/* Compliance checks */}
      <div className="space-y-2">
        {checks.map((check) => (
          <div key={check.label} className="flex items-center justify-between text-xs">
            <span className="text-slate-400">{check.label}</span>
            {check.pass
              ? <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              : <XCircle className="w-4 h-4 text-red-400" />
            }
          </div>
        ))}
      </div>
    </div>
  );
}
