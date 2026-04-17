'use client';

import dynamic from 'next/dynamic';
import { Sparkles } from 'lucide-react';

const PredictiveChart = dynamic(
  () => import('recharts').then((m) => {
    const { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, ReferenceLine, Legend } = m;
    return function PredictiveChart({ data }: { data: any[] }) {
      const cutoff = data.find((d) => d.isPredicted);
      return (
        <ResponsiveContainer width="100%" height={240}>
          <AreaChart data={data} margin={{ top: 5, right: 10, bottom: 5, left: 0 }}>
            <defs>
              <linearGradient id="gradActual" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor="#6366f1" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="gradPredicted" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor="#10b981" stopOpacity={0.2} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
              </linearGradient>
            </defs>
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
            {cutoff && (
              <ReferenceLine
                x={cutoff.month}
                stroke="#475569"
                strokeDasharray="4 4"
                label={{ value: 'AI Forecast', position: 'insideTopRight', fill: '#10b981', fontSize: 10 }}
              />
            )}
            <Area
              type="monotone"
              dataKey="actual"
              stroke="#6366f1"
              fill="url(#gradActual)"
              strokeWidth={2}
              name="Actual Impact"
              connectNulls
            />
            <Area
              type="monotone"
              dataKey="predicted"
              stroke="#10b981"
              fill="url(#gradPredicted)"
              strokeWidth={2}
              strokeDasharray="5 3"
              name="AI Predicted"
              connectNulls
            />
          </AreaChart>
        </ResponsiveContainer>
      );
    };
  }),
  { ssr: false, loading: () => <div className="h-[240px] bg-slate-800/30 rounded-xl animate-pulse" /> }
);

const PREDICTIVE_DATA = [
  { month: 'Jan', actual: 35, predicted: null },
  { month: 'Feb', actual: 48, predicted: null },
  { month: 'Mar', actual: 55, predicted: null },
  { month: 'Apr', actual: 68, predicted: null },
  { month: 'May', actual: 72, predicted: 74 },
  { month: 'Jun', actual: 84, predicted: 88, isPredicted: true },
  { month: 'Jul', actual: null, predicted: 96 },
  { month: 'Aug', actual: null, predicted: 108 },
  { month: 'Sep', actual: null, predicted: 118 },
];

interface Props { data?: any[] }

export default function PredictiveInsights({ data = PREDICTIVE_DATA }: Props) {
  return (
    <div className="glass-card rounded-2xl border border-slate-800 p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-emerald-400" /> AI Predictive Insights
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">Actual vs predicted impact trajectory</p>
        </div>
        <span className="text-[11px] bg-emerald-500/10 text-emerald-400 px-2.5 py-1 rounded-full font-medium border border-emerald-500/20">
          AI Model v2
        </span>
      </div>
      <PredictiveChart data={data} />
      <div className="mt-4 pt-4 border-t border-slate-800 grid grid-cols-3 gap-3">
        {[
          { label: 'Forecast Accuracy', value: '94.2%', color: 'text-emerald-400' },
          { label: 'Next Month Est.', value: '+14%', color: 'text-indigo-400' },
          { label: 'Confidence', value: 'High', color: 'text-amber-400' },
        ].map((item) => (
          <div key={item.label} className="text-center">
            <p className={`text-base font-bold ${item.color}`}>{item.value}</p>
            <p className="text-[11px] text-slate-500 mt-0.5">{item.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
