'use client';

import dynamic from 'next/dynamic';

const CHART_COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6', '#06b6d4'];

const FundDonut = dynamic(
  () => import('recharts').then((m) => {
    const { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } = m;
    return function FundDonut({ data }: { data: { name: string; value: number; color?: string }[] }) {
      return (
        <ResponsiveContainer width="100%" height={220}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={55}
              outerRadius={85}
              dataKey="value"
              paddingAngle={3}
              strokeWidth={0}
            >
              {data.map((entry, i) => (
                <Cell key={i} fill={entry.color || CHART_COLORS[i % CHART_COLORS.length]} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                background: '#1e293b',
                border: '1px solid #334155',
                borderRadius: '12px',
                fontSize: 12,
                color: '#e2e8f0',
              }}
              formatter={(val: number) => [`₹${val.toLocaleString()}`, 'Allocated']}
            />
            <Legend
              iconType="circle"
              iconSize={8}
              formatter={(val) => <span style={{ color: '#94a3b8', fontSize: 11 }}>{val}</span>}
            />
          </PieChart>
        </ResponsiveContainer>
      );
    };
  }),
  {
    ssr: false,
    loading: () => <div className="h-[220px] bg-slate-800/30 rounded-xl animate-pulse" />,
  }
);

interface Props {
  campaigns?: { title: string; goals?: { fundingRaised?: number }; category?: string }[];
}

const CAT_COLORS_MAP: Record<string, string> = {
  water: '#6366f1', healthcare: '#10b981', education: '#8b5cf6',
  infrastructure: '#f59e0b', employment: '#ec4899', food: '#f97316',
};

export default function FundDistributionChart({ campaigns = [] }: Props) {
  const distributed = campaigns
    .filter((c) => (c.goals?.fundingRaised || 0) > 0)
    .map((c, i) => ({
      name: c.title.length > 22 ? c.title.slice(0, 22) + '…' : c.title,
      value: c.goals?.fundingRaised || 0,
      color: CAT_COLORS_MAP[c.category || ''] || CHART_COLORS[i % CHART_COLORS.length],
    }))
    .slice(0, 6);

  // Fallback demo data
  const data = distributed.length > 0 ? distributed : [
    { name: 'Flood Relief', value: 1876000, color: '#6366f1' },
    { name: 'Digital Classrooms', value: 1260000, color: '#10b981' },
    { name: 'Mobile Healthcare', value: 1984000, color: '#f59e0b' },
    { name: 'Solar Energy', value: 2100000, color: '#ec4899' },
    { name: 'Micro-Finance', value: 1050000, color: '#8b5cf6' },
  ];

  const total = data.reduce((s, d) => s + d.value, 0);

  return (
    <div className="glass-card rounded-2xl border border-slate-800 p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-bold text-slate-200">Fund Distribution</h3>
        <span className="text-xs text-slate-500">Total: ₹{(total / 100000).toFixed(1)}L</span>
      </div>
      <FundDonut data={data} />
    </div>
  );
}
