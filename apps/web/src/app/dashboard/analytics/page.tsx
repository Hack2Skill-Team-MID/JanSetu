'use client';

import { useEffect, useState } from 'react';
import { api } from '../../../lib/api';
import DashboardLayout from '../../../components/layout/dashboard-layout';
import { useTranslation } from '../../../lib/i18n';
import {
  BarChart3, TrendingUp, Target, Users, IndianRupee,
  MapPin, Zap, Download, RefreshCw,
} from 'lucide-react';

import AnalyticsKPIGrid from '../../../components/analytics/analytics-kpi-grid';
import TrendAnalysisChart from '../../../components/analytics/trend-analysis-chart';
import RegionComparisonChart from '../../../components/analytics/region-comparison-chart';
import PredictiveInsights from '../../../components/analytics/predictive-insights';
import NGOTrustScore from '../../../components/analytics/ngo-trust-score';

/* ─── Tabs ─────────────────────────────────────────────────── */
const TABS = [
  { key: 'overview',     label: 'Overview',    icon: BarChart3 },
  { key: 'regions',      label: 'Regions',     icon: MapPin },
  { key: 'predictions',  label: 'AI Insights', icon: Zap },
  { key: 'trust',        label: 'Trust',       icon: Target },
];

export default function AnalyticsPage() {
  const { t } = useTranslation();
  const [stats, setStats]     = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = async () => {
    try {
      const [dashRes, campRes, donRes] = await Promise.all([
        api.get('/dashboard/stats').catch(() => ({ data: { success: false } })),
        api.get('/campaigns').catch(() => ({ data: { success: false } })),
        api.get('/donations/my').catch(() => ({ data: { success: false } })),
      ]);
      setStats({
        dashboard: dashRes.data?.data || {},
        campaigns: campRes.data?.data?.campaigns || campRes.data?.data || [],
        donations: donRes.data?.data || {},
      });
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleRefresh = () => { setRefreshing(true); fetchData(); };

  const handleExport = () => {
    const exportData = {
      exportedAt: new Date().toISOString(),
      stats: stats?.dashboard || {},
      campaigns: (stats?.campaigns || []).length,
      totalDonated: stats?.donations?.totalDonated || 0,
    };
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `jansetu-analytics-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  /* Derived values */
  const totalNeeds     = stats?.dashboard?.totalNeeds     || 234;
  const totalTasks     = stats?.dashboard?.activeTasks    || 47;
  const totalCampaigns = (stats?.campaigns || []).length  || 5;
  const totalDonated   = stats?.donations?.totalDonated   || 420000;
  const volunteers     = stats?.dashboard?.activeVolunteers || 89;

  /* KPI config */
  const kpis = [
    {
      label: 'Issues Resolved',
      value: Math.round(totalNeeds * 0.72),
      change: '+12%',
      up: true,
      icon: Target,
      color: 'text-indigo-400',
      bgColor: 'bg-indigo-500/10',
      borderColor: 'border-indigo-500/20',
    },
    {
      label: 'Avg Response Time',
      value: '3.4h',
      change: '-18%',
      up: true,
      icon: Zap,
      color: 'text-emerald-400',
      bgColor: 'bg-emerald-500/10',
      borderColor: 'border-emerald-500/20',
    },
    {
      label: 'Active Campaigns',
      value: totalCampaigns,
      change: '+3',
      up: true,
      icon: BarChart3,
      color: 'text-amber-400',
      bgColor: 'bg-amber-500/10',
      borderColor: 'border-amber-500/20',
    },
    {
      label: 'Volunteer Engagement',
      value: `${volunteers}`,
      change: '+8%',
      up: true,
      icon: Users,
      color: 'text-pink-400',
      bgColor: 'bg-pink-500/10',
      borderColor: 'border-pink-500/20',
    },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">

        {/* ── Header ── */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-3">
              <BarChart3 className="w-6 h-6 text-indigo-400" />
              Analytics Dashboard
            </h1>
            <p className="text-slate-400 mt-1">Data-driven insights for transparent and impactful operations</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="p-2.5 rounded-xl border border-slate-700 hover:border-slate-600 text-slate-400 hover:text-slate-200 transition-all"
              title="Refresh data"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={handleExport}
              className="px-4 py-2.5 rounded-xl border border-slate-700 hover:border-indigo-500/50 text-slate-400 hover:text-indigo-400 text-sm font-medium transition-all flex items-center gap-2"
            >
              <Download className="w-4 h-4" /> Export
            </button>
          </div>
        </div>

        {/* ── KPI Grid ── */}
        {isLoading ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => <div key={i} className="h-28 bg-slate-800/30 rounded-2xl animate-pulse" />)}
          </div>
        ) : (
          <AnalyticsKPIGrid kpis={kpis} />
        )}

        {/* ── Tab Navigation ── */}
        <div className="flex gap-1 p-1 bg-slate-900/60 rounded-xl border border-slate-800 w-fit">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === tab.key
                  ? 'bg-indigo-600 text-white shadow-[0_0_10px_rgba(99,102,241,0.3)]'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <tab.icon className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          ))}
        </div>

        {/* ── Tab Content ── */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Trend + Donut */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <TrendAnalysisChart />
              </div>
              {/* Status Donut (existing inline) */}
              <InlineDonutChart totalNeeds={totalNeeds} />
            </div>

            {/* Top Campaigns */}
            <div className="glass-card rounded-2xl border border-slate-800 p-5">
              <h3 className="text-sm font-bold text-slate-200 mb-4">Top Campaigns by Funding</h3>
              {(stats?.campaigns || []).length === 0 ? (
                <p className="text-center py-8 text-slate-500 text-sm">No campaign data available</p>
              ) : (
                <div className="space-y-3">
                  {(stats?.campaigns || []).slice(0, 5).map((c: any, i: number) => {
                    const pct = c.goals?.fundingGoal
                      ? Math.min(Math.round((c.goals.fundingRaised / c.goals.fundingGoal) * 100), 100)
                      : 0;
                    return (
                      <div key={i} className="flex items-center gap-4">
                        <span className="w-6 h-6 rounded-lg bg-indigo-600/20 flex items-center justify-center text-xs font-bold text-indigo-400 flex-shrink-0">{i + 1}</span>
                        <div className="flex-1">
                          <div className="flex justify-between text-sm mb-1">
                            <span className="text-slate-200 font-medium truncate">{c.title}</span>
                            <span className="text-xs text-slate-400 ml-2">₹{(c.goals?.fundingRaised || 0).toLocaleString()}</span>
                          </div>
                          <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                            <div className="h-full bg-gradient-to-r from-indigo-600 to-purple-500 rounded-full" style={{ width: `${pct}%` }} />
                          </div>
                        </div>
                        <span className="text-xs text-slate-500 w-10 text-right">{pct}%</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Summary Stats Row */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                { label: 'Total Needs', value: totalNeeds, icon: Target, color: 'text-indigo-400', change: '+12%', up: true },
                { label: 'Active Tasks', value: totalTasks, icon: Users, color: 'text-emerald-400', change: '+8%', up: true },
                { label: 'Funds Raised', value: `₹${(totalDonated / 100000).toFixed(1)}L`, icon: IndianRupee, color: 'text-pink-400', change: '+₹5K', up: true },
                { label: 'Resolution Rate', value: '72%', icon: TrendingUp, color: 'text-amber-400', change: '+5%', up: true },
              ].map((item) => (
                <div key={item.label} className="glass-card rounded-2xl border border-slate-800 p-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs text-slate-400">{item.label}</span>
                    <item.icon className={`w-4 h-4 ${item.color}`} />
                  </div>
                  <div className={`text-xl font-bold ${item.color}`}>{item.value}</div>
                  <div className={`text-xs mt-1 ${item.up ? 'text-emerald-400' : 'text-red-400'}`}>{item.change} this month</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'regions' && (
          <div className="space-y-6">
            <RegionComparisonChart />
            <div className="glass-card rounded-2xl border border-slate-800 p-5">
              <h3 className="text-sm font-bold text-slate-200 mb-4">Regional Summary</h3>
              <div className="grid gap-3">
                {[
                  { region: 'Rajasthan', needs: 48, resolved: 36, volunteers: 12 },
                  { region: 'Bihar',     needs: 62, resolved: 48, volunteers: 18 },
                  { region: 'Uttar Pradesh', needs: 55, resolved: 40, volunteers: 15 },
                  { region: 'Assam',     needs: 38, resolved: 32, volunteers: 9 },
                  { region: 'Jharkhand', needs: 29, resolved: 22, volunteers: 7 },
                  { region: 'Odisha',    needs: 44, resolved: 38, volunteers: 11 },
                ].map((r) => (
                  <div key={r.region} className="flex items-center gap-4 p-3 rounded-xl bg-slate-800/40 border border-slate-800">
                    <div className="flex items-center gap-2 w-32">
                      <MapPin className="w-3 h-3 text-slate-500" />
                      <span className="text-sm text-slate-200 font-medium">{r.region}</span>
                    </div>
                    <div className="flex-1 grid grid-cols-3 gap-4 text-xs text-slate-400">
                      <span>Needs: <b className="text-slate-200">{r.needs}</b></span>
                      <span>Resolved: <b className="text-emerald-400">{r.resolved}</b></span>
                      <span>Volunteers: <b className="text-indigo-400">{r.volunteers}</b></span>
                    </div>
                    <div className="w-16">
                      <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                        <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${Math.round((r.resolved/r.needs)*100)}%` }} />
                      </div>
                      <p className="text-[10px] text-slate-500 text-right mt-0.5">{Math.round((r.resolved/r.needs)*100)}%</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'predictions' && (
          <div className="space-y-6">
            <PredictiveInsights />
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                { title: 'Next Quarter Forecast', value: '+22% impact', detail: 'Based on current volunteer engagement and campaign momentum.', color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' },
                { title: 'Critical Need Hotspot', value: 'Bihar / UP', detail: 'AI predicts 40% surge in relief needs in the next 30 days.', color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20' },
                { title: 'Optimal Donation Window', value: 'Weekends', detail: 'Donations peak Sat–Sun (+38%). Schedule campaigns accordingly.', color: 'text-indigo-400', bg: 'bg-indigo-500/10', border: 'border-indigo-500/20' },
              ].map((item) => (
                <div key={item.title} className={`glass-card rounded-2xl border ${item.border} ${item.bg} p-5`}>
                  <p className="text-xs text-slate-500 mb-1">{item.title}</p>
                  <p className={`text-lg font-bold ${item.color}`}>{item.value}</p>
                  <p className="text-xs text-slate-400 mt-2">{item.detail}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'trust' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <NGOTrustScore score={92} label="Assam Relief Foundation" />
            <NGOTrustScore
              score={78}
              label="EduReach India"
              checks={[
                { label: 'FCRA Compliant', pass: true },
                { label: 'Annual Report Filed', pass: true },
                { label: 'Govt Registration', pass: true },
                { label: 'Fund Audit Complete', pass: false },
                { label: 'Impact Verified', pass: true },
                { label: '80G Tax Exemption', pass: false },
              ]}
            />
            <NGOTrustScore
              score={65}
              label="Green Earth NGO"
              checks={[
                { label: 'FCRA Compliant', pass: true },
                { label: 'Annual Report Filed', pass: false },
                { label: 'Govt Registration', pass: true },
                { label: 'Fund Audit Complete', pass: false },
                { label: 'Impact Verified', pass: true },
                { label: '80G Tax Exemption', pass: true },
              ]}
            />
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

/* ── Inline donut chart (existing, inline) ─────────────────── */
import dynamic from 'next/dynamic';

const ChartDonut = dynamic(
  () => import('recharts').then((m) => {
    const { PieChart: PC, Pie, Cell, ResponsiveContainer, Tooltip } = m;
    const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444'];
    return function Chart({ data }: { data: any[] }) {
      return (
        <ResponsiveContainer width="100%" height={200}>
          <PC>
            <Pie data={data} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value" paddingAngle={3} strokeWidth={0}>
              {data.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
            </Pie>
            <Tooltip contentStyle={{ background: '#0f172a', border: '1px solid #334155', borderRadius: 12, fontSize: 12, color: '#e2e8f0' }} />
          </PC>
        </ResponsiveContainer>
      );
    };
  }),
  { ssr: false, loading: () => <div className="h-[200px] bg-slate-800/30 rounded-xl animate-pulse" /> }
);

function InlineDonutChart({ totalNeeds }: { totalNeeds: number }) {
  const statusData = [
    { name: 'Resolved',    value: Math.round(totalNeeds * 0.48) },
    { name: 'In Progress', value: Math.round(totalNeeds * 0.27) },
    { name: 'Pending',     value: Math.round(totalNeeds * 0.17) },
    { name: 'Critical',    value: Math.round(totalNeeds * 0.08) },
  ];
  const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444'];
  return (
    <div className="glass-card rounded-2xl border border-slate-800 p-5">
      <h3 className="text-sm font-bold text-slate-200 mb-4">Status Distribution</h3>
      <ChartDonut data={statusData} />
      <div className="grid grid-cols-2 gap-2 mt-2">
        {statusData.map((s, i) => (
          <div key={i} className="flex items-center gap-2 text-xs text-slate-400">
            <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: COLORS[i] }} />
            {s.name}: <b className="text-slate-200">{s.value}</b>
          </div>
        ))}
      </div>
    </div>
  );
}
