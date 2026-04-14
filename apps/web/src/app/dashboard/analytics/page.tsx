'use client';

import { useEffect, useState } from 'react';
import { api } from '../../../lib/api';
import DashboardLayout from '../../../components/layout/dashboard-layout';
import {
  BarChart3, TrendingUp, PieChart, Users, Target,
  IndianRupee, ArrowUpRight, ArrowDownRight
} from 'lucide-react';
import dynamic from 'next/dynamic';

const ChartArea = dynamic(
  () => import('recharts').then((m) => {
    const { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } = m;
    return function Chart({ data }: { data: any[] }) {
      return (
        <ResponsiveContainer width="100%" height={220}>
          <AreaChart data={data}>
            <defs>
              <linearGradient id="colorNeeds" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis dataKey="month" stroke="#475569" fontSize={11} tickLine={false} axisLine={false} />
            <YAxis stroke="#475569" fontSize={11} tickLine={false} axisLine={false} />
            <Tooltip
              contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '12px', fontSize: 12 }}
              labelStyle={{ color: '#94a3b8' }}
            />
            <Area type="monotone" dataKey="needs" stroke="#6366f1" fill="url(#colorNeeds)" strokeWidth={2} />
            <Area type="monotone" dataKey="resolved" stroke="#10b981" fill="none" strokeWidth={2} strokeDasharray="4 4" />
          </AreaChart>
        </ResponsiveContainer>
      );
    };
  }),
  { ssr: false, loading: () => <div className="h-[220px] bg-slate-800/30 rounded-xl animate-pulse" /> }
);

const ChartBar = dynamic(
  () => import('recharts').then((m) => {
    const { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } = m;
    return function Chart({ data }: { data: any[] }) {
      return (
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={data}>
            <XAxis dataKey="category" stroke="#475569" fontSize={10} tickLine={false} axisLine={false} />
            <YAxis stroke="#475569" fontSize={11} tickLine={false} axisLine={false} />
            <Tooltip
              contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '12px', fontSize: 12 }}
            />
            <Bar dataKey="count" fill="#6366f1" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      );
    };
  }),
  { ssr: false, loading: () => <div className="h-[220px] bg-slate-800/30 rounded-xl animate-pulse" /> }
);

const ChartDonut = dynamic(
  () => import('recharts').then((m) => {
    const { PieChart: PC, Pie, Cell, ResponsiveContainer, Tooltip } = m;
    const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];
    return function Chart({ data }: { data: any[] }) {
      return (
        <ResponsiveContainer width="100%" height={200}>
          <PC>
            <Pie data={data} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value" paddingAngle={3}>
              {data.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
            </Pie>
            <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '12px', fontSize: 12 }} />
          </PC>
        </ResponsiveContainer>
      );
    };
  }),
  { ssr: false, loading: () => <div className="h-[200px] bg-slate-800/30 rounded-xl animate-pulse" /> }
);

export default function AnalyticsPage() {
  const [stats, setStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [dashRes, campRes, donRes] = await Promise.all([
          api.get('/dashboard/stats').catch(() => ({ data: { success: false } })),
          api.get('/campaigns').catch(() => ({ data: { success: false } })),
          api.get('/donations/my').catch(() => ({ data: { success: false } })),
        ]);

        setStats({
          dashboard: dashRes.data?.data || {},
          campaigns: campRes.data?.data?.campaigns || [],
          donations: donRes.data?.data || {},
        });
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  // Mock chart data (would come from real analytics API)
  const trendData = [
    { month: 'Jan', needs: 12, resolved: 8 },
    { month: 'Feb', needs: 19, resolved: 14 },
    { month: 'Mar', needs: 15, resolved: 11 },
    { month: 'Apr', needs: 25, resolved: 18 },
    { month: 'May', needs: 22, resolved: 20 },
    { month: 'Jun', needs: 30, resolved: 24 },
  ];

  const categoryData = [
    { category: 'Water', count: 8 },
    { category: 'Health', count: 12 },
    { category: 'Education', count: 6 },
    { category: 'Food', count: 9 },
    { category: 'Sanitation', count: 5 },
    { category: 'Infra', count: 4 },
  ];

  const statusData = [
    { name: 'Resolved', value: 35 },
    { name: 'In Progress', value: 20 },
    { name: 'Pending', value: 15 },
    { name: 'Critical', value: 5 },
  ];

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
        </div>
      </DashboardLayout>
    );
  }

  const totalNeeds = stats?.dashboard?.totalNeeds || 5;
  const totalTasks = stats?.dashboard?.activeTasks || 5;
  const totalCampaigns = stats?.campaigns?.length || 3;
  const totalDonated = stats?.donations?.totalDonated || 42000;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-3">
            <BarChart3 className="w-6 h-6 text-indigo-400" />
            Analytics & Reports
          </h1>
          <p className="text-slate-400 mt-1">Platform performance and impact metrics</p>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Total Needs', value: totalNeeds, icon: Target, color: 'indigo', change: '+12%', up: true },
            { label: 'Active Tasks', value: totalTasks, icon: Users, color: 'emerald', change: '+8%', up: true },
            { label: 'Campaigns', value: totalCampaigns, icon: TrendingUp, color: 'purple', change: '+3', up: true },
            { label: 'Donations', value: `₹${totalDonated.toLocaleString()}`, icon: IndianRupee, color: 'pink', change: '+₹5K', up: true },
          ].map((kpi, i) => (
            <div key={i} className="glass-card rounded-2xl border border-slate-800 p-5">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs text-slate-400">{kpi.label}</span>
                <kpi.icon className={`w-4 h-4 text-${kpi.color}-400`} />
              </div>
              <div className="text-2xl font-bold text-slate-100">{kpi.value}</div>
              <div className={`text-xs mt-1 flex items-center gap-1 ${kpi.up ? 'text-emerald-400' : 'text-red-400'}`}>
                {kpi.up ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                {kpi.change} this month
              </div>
            </div>
          ))}
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Trend chart */}
          <div className="glass-card rounded-2xl border border-slate-800 p-5">
            <h3 className="text-sm font-semibold text-slate-200 mb-4 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-indigo-400" /> Needs vs Resolved (6 months)
            </h3>
            <ChartArea data={trendData} />
            <div className="flex items-center gap-6 mt-3 text-xs text-slate-400">
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-0.5 bg-indigo-500 rounded" /> Reported</span>
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-0.5 bg-emerald-500 rounded border-dashed" /> Resolved</span>
            </div>
          </div>

          {/* Category bar chart */}
          <div className="glass-card rounded-2xl border border-slate-800 p-5">
            <h3 className="text-sm font-semibold text-slate-200 mb-4 flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-indigo-400" /> Needs by Category
            </h3>
            <ChartBar data={categoryData} />
          </div>
        </div>

        {/* Bottom row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Donut chart */}
          <div className="glass-card rounded-2xl border border-slate-800 p-5">
            <h3 className="text-sm font-semibold text-slate-200 mb-4 flex items-center gap-2">
              <PieChart className="w-4 h-4 text-indigo-400" /> Status Distribution
            </h3>
            <ChartDonut data={statusData} />
            <div className="grid grid-cols-2 gap-2 mt-3">
              {statusData.map((s, i) => (
                <div key={i} className="flex items-center gap-2 text-xs text-slate-400">
                  <span className={`w-2 h-2 rounded-full`} style={{ background: ['#6366f1', '#10b981', '#f59e0b', '#ef4444'][i] }} />
                  {s.name}: {s.value}
                </div>
              ))}
            </div>
          </div>

          {/* Top campaigns */}
          <div className="lg:col-span-2 glass-card rounded-2xl border border-slate-800 p-5">
            <h3 className="text-sm font-semibold text-slate-200 mb-4">Top Campaigns by Funding</h3>
            <div className="space-y-3">
              {(stats?.campaigns || []).slice(0, 4).map((c: any, i: number) => {
                const pct = c.goals?.fundingGoal ? Math.min((c.goals.fundingRaised / c.goals.fundingGoal) * 100, 100) : 0;
                return (
                  <div key={i} className="flex items-center gap-4">
                    <span className="w-6 h-6 rounded-lg bg-indigo-600/20 flex items-center justify-center text-xs font-bold text-indigo-400">{i + 1}</span>
                    <div className="flex-1">
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-slate-200 font-medium truncate">{c.title}</span>
                        <span className="text-xs text-slate-400">₹{(c.goals?.fundingRaised || 0).toLocaleString()}</span>
                      </div>
                      <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-indigo-600 to-purple-500 rounded-full" style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                    <span className="text-xs text-slate-500 w-10 text-right">{Math.round(pct)}%</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
