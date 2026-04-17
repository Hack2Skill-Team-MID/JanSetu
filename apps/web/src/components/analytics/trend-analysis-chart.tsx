'use client';

import dynamic from 'next/dynamic';

const TrendChart = dynamic(
  () => import('recharts').then((m) => {
    const { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } = m;
    return function TrendChart({ data }: { data: any[] }) {
      return (
        <ResponsiveContainer width="100%" height={260}>
          <LineChart data={data} margin={{ top: 5, right: 10, bottom: 5, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
            <XAxis dataKey="month" stroke="#475569" fontSize={11} tickLine={false} axisLine={false} />
            <YAxis stroke="#475569" fontSize={11} tickLine={false} axisLine={false} />
            <Tooltip
              contentStyle={{ background: '#0f172a', border: '1px solid #334155', borderRadius: 12, fontSize: 12, color: '#e2e8f0' }}
              labelStyle={{ color: '#94a3b8' }}
            />
            <Legend
              iconType="circle"
              iconSize={8}
              formatter={(val) => <span style={{ color: '#94a3b8', fontSize: 11 }}>{val}</span>}
            />
            <Line type="monotone" dataKey="donations" stroke="#6366f1" strokeWidth={2.5} dot={false} name="Donations (₹k)" />
            <Line type="monotone" dataKey="volunteers" stroke="#10b981" strokeWidth={2.5} dot={false} name="Volunteers" />
            <Line type="monotone" dataKey="impact" stroke="#f59e0b" strokeWidth={2.5} dot={false} strokeDasharray="5 3" name="Impact Score" />
          </LineChart>
        </ResponsiveContainer>
      );
    };
  }),
  { ssr: false, loading: () => <div className="h-[260px] bg-slate-800/30 rounded-xl animate-pulse" /> }
);

const TREND_DATA = [
  { month: 'Jan', donations: 42, volunteers: 18, impact: 35 },
  { month: 'Feb', donations: 58, volunteers: 24, impact: 48 },
  { month: 'Mar', donations: 51, volunteers: 31, impact: 55 },
  { month: 'Apr', donations: 74, volunteers: 38, impact: 68 },
  { month: 'May', donations: 68, volunteers: 42, impact: 72 },
  { month: 'Jun', donations: 89, volunteers: 57, impact: 84 },
  { month: 'Jul', donations: 96, volunteers: 63, impact: 90 },
];

interface Props { data?: any[] }

export default function TrendAnalysisChart({ data = TREND_DATA }: Props) {
  return (
    <div className="glass-card rounded-2xl border border-slate-800 p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-bold text-slate-200">Trend Analysis</h3>
          <p className="text-xs text-slate-500 mt-0.5">Donations · Volunteers · Impact over time</p>
        </div>
      </div>
      <TrendChart data={data} />
    </div>
  );
}
