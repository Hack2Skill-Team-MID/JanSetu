'use client';

import dynamic from 'next/dynamic';

const RegionBar = dynamic(
  () => import('recharts').then((m) => {
    const { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell } = m;
    const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6', '#06b6d4'];
    return function RegionBar({ data }: { data: any[] }) {
      return (
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={data} margin={{ top: 5, right: 10, bottom: 5, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
            <XAxis dataKey="region" stroke="#475569" fontSize={10} tickLine={false} axisLine={false} />
            <YAxis stroke="#475569" fontSize={11} tickLine={false} axisLine={false} />
            <Tooltip
              contentStyle={{ background: '#0f172a', border: '1px solid #334155', borderRadius: 12, fontSize: 12, color: '#e2e8f0' }}
              cursor={{ fill: 'rgba(255,255,255,0.03)' }}
            />
            <Bar dataKey="needs" name="Needs Reported" radius={[4, 4, 0, 0]}>
              {data.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      );
    };
  }),
  { ssr: false, loading: () => <div className="h-[240px] bg-slate-800/30 rounded-xl animate-pulse" /> }
);

const REGION_DATA = [
  { region: 'Rajasthan', needs: 48, resolved: 36 },
  { region: 'Bihar',     needs: 62, resolved: 48 },
  { region: 'UP',        needs: 55, resolved: 40 },
  { region: 'Assam',     needs: 38, resolved: 32 },
  { region: 'Jharkhand', needs: 29, resolved: 22 },
  { region: 'Odisha',    needs: 44, resolved: 38 },
];

interface Props { data?: any[] }

export default function RegionComparisonChart({ data = REGION_DATA }: Props) {
  return (
    <div className="glass-card rounded-2xl border border-slate-800 p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-bold text-slate-200">Region Comparison</h3>
          <p className="text-xs text-slate-500 mt-0.5">Needs reported by state</p>
        </div>
      </div>
      <RegionBar data={data} />
    </div>
  );
}
