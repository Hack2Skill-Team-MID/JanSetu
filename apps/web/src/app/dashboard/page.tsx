'use client';

import { useEffect, useState } from 'react';
import { api } from '../../lib/api';
import DashboardLayout from '../../components/layout/dashboard-layout';
import { useAuthStore } from '../../store/auth-store';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Users, Zap, Heart, TrendingUp, AlertCircle, CheckCircle2,
  MessageSquare, LogIn, ArrowUpRight, ArrowDownRight, AlertTriangle,
  MapPin, Activity,
} from 'lucide-react';
import Link from 'next/link';

// KPI Card component
function KPICard({ title, value, trend, icon: Icon, color }: {
  title: string;
  value: string | number;
  trend?: { direction: 'up' | 'down'; value: number };
  icon: any;
  color: 'primary' | 'secondary' | 'accent' | 'destructive';
}) {
  const colorCls = {
    primary: 'text-primary',
    secondary: 'text-secondary',
    accent: 'text-accent',
    destructive: 'text-destructive',
  }[color];

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        <Icon className={`h-4 w-4 ${colorCls}`} />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-foreground">{value}</div>
        {trend && (
          <div className={`flex items-center gap-1 text-xs font-medium mt-2 ${trend.direction === 'up' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
            {trend.direction === 'up' ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
            <span>{trend.value}% vs last month</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// AI Insight types
type InsightType = { id: string; type: 'alert' | 'recommendation' | 'trend'; severity: 'high' | 'medium' | 'low'; title: string; description: string; action?: string };

function AIInsightsPanel({ insights, onDismiss }: { insights: InsightType[]; onDismiss: (id: string) => void }) {
  const severityColor = (s: string) =>
    s === 'high' ? 'border-l-destructive bg-destructive/5' :
    s === 'medium' ? 'border-l-accent bg-accent/5' :
    'border-l-primary bg-primary/5';

  const getIcon = (type: string, severity: string) =>
    type === 'alert' ? <AlertCircle className={`h-5 w-5 ${severity === 'high' ? 'text-destructive' : 'text-accent'}`} /> :
    type === 'recommendation' ? <Zap className="h-5 w-5 text-primary" /> :
    <TrendingUp className="h-5 w-5 text-secondary" />;

  return (
    <Card className="lg:col-span-2">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="h-5 w-5 text-primary" /> AI Insights & Alerts
        </CardTitle>
        <CardDescription>Smart recommendations and critical alerts for your ecosystem</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {insights.map((insight) => (
          <div key={insight.id} className={`flex items-start gap-3 rounded-lg border-l-4 p-4 transition-all ${severityColor(insight.severity)}`}>
            <div className="mt-0.5">{getIcon(insight.type, insight.severity)}</div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm text-foreground">{insight.title}</p>
              <p className="text-xs text-muted-foreground mt-1">{insight.description}</p>
              {insight.action && (
                <Button variant="link" size="sm" className="h-auto p-0 mt-2 text-xs">{insight.action}</Button>
              )}
            </div>
            <Button variant="ghost" size="sm" onClick={() => onDismiss(insight.id)} className="h-6 w-6 p-0 opacity-50 hover:opacity-100 text-lg leading-none">×</Button>
          </div>
        ))}
        {insights.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <p className="text-sm">No active insights at this time</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Mini Map Hotspot
function MiniMapHotspots({ hotspots }: { hotspots: { id: string; name: string; count: number; severity: 'high' | 'medium' | 'low' }[] }) {
  const severityConfig = {
    high: { color: 'text-destructive', bgColor: 'bg-destructive/10', label: 'Critical' },
    medium: { color: 'text-accent', bgColor: 'bg-accent/10', label: 'High' },
    low: { color: 'text-primary', bgColor: 'bg-primary/10', label: 'Active' },
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="h-5 w-5 text-primary" /> Crisis Hotspots
        </CardTitle>
        <CardDescription>Active areas needing attention</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {hotspots.map((spot) => {
          const cfg = severityConfig[spot.severity];
          return (
            <div key={spot.id} className={`flex items-center justify-between p-3 rounded-lg ${cfg.bgColor}`}>
              <div>
                <p className="font-medium text-sm text-foreground">{spot.name}</p>
                <p className={`text-xs font-semibold ${cfg.color}`}>{cfg.label}</p>
              </div>
              <Badge variant="outline" className={`${cfg.color} border-current`}>{spot.count} tasks</Badge>
            </div>
          );
        })}
        <Button variant="outline" size="sm" className="w-full mt-2" asChild>
          <Link href="/dashboard/map">View Full Map</Link>
        </Button>
      </CardContent>
    </Card>
  );
}

// Activity Feed
function ActivityFeed({ activities }: { activities: { id: string; type: string; user: { name: string; initials: string }; description: string; timestamp: string }[] }) {
  const getIcon = (type: string) => {
    if (type === 'donation') return <Heart className="h-4 w-4 text-accent" />;
    if (type === 'volunteer_join') return <LogIn className="h-4 w-4 text-secondary" />;
    if (type === 'task_completed') return <CheckCircle2 className="h-4 w-4 text-green-400" />;
    return <MessageSquare className="h-4 w-4 text-primary" />;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2"><Activity className="h-5 w-5 text-primary" />Recent Activity</CardTitle>
        <CardDescription>Latest updates from your ecosystem</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.map((activity, index) => (
            <div key={activity.id} className="flex gap-4">
              <div className="relative flex flex-col items-center">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-muted text-xs">{activity.user.initials}</AvatarFallback>
                </Avatar>
                {index < activities.length - 1 && <div className="absolute top-10 h-6 w-0.5 bg-border" />}
              </div>
              <div className="flex-1 pt-1">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-sm font-medium text-foreground">{activity.user.name}</p>
                    <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1">
                      {getIcon(activity.type)}
                      {activity.description}
                    </p>
                  </div>
                  <span className="text-xs text-muted-foreground whitespace-nowrap">{activity.timestamp}</span>
                </div>
              </div>
            </div>
          ))}
          {activities.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <p className="text-sm">No recent activity</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// Urgent banner
function UrgentBanner({ emergency }: { emergency: any }) {
  if (!emergency) return null;
  return (
    <div className="flex items-center justify-between p-4 rounded-xl border border-destructive/30 bg-destructive/10 animate-pulse">
      <div className="flex items-center gap-3">
        <AlertTriangle className="h-5 w-5 text-destructive flex-shrink-0" />
        <div>
          <p className="font-semibold text-sm text-destructive">🚨 {emergency.title}</p>
          <p className="text-xs text-muted-foreground mt-0.5">{emergency.description}</p>
        </div>
      </div>
      <Button size="sm" variant="destructive" asChild>
        <Link href="/dashboard/emergency">Respond Now</Link>
      </Button>
    </div>
  );
}

export default function DashboardPage() {
  const user = useAuthStore((s) => s.user);
  const [stats, setStats] = useState<any>(null);
  const [emergency, setEmergency] = useState<any>(null);
  const [recentNeeds, setRecentNeeds] = useState<any[]>([]);
  const [loadingStats, setLoadingStats] = useState(true);
  const [insights, setInsights] = useState<InsightType[]>([]);

  useEffect(() => {
    // Fetch dashboard stats
    api.get('/dashboard/stats').then((res) => {
      if (res.data.success) setStats(res.data.data);
    }).catch(() => {}).finally(() => setLoadingStats(false));

    // Fetch active emergency
    api.get('/emergency/active').then((res) => {
      if (res.data.success && res.data.data?.length > 0) setEmergency(res.data.data[0]);
    }).catch(() => {});

    // Fetch recent critical needs for AI insights
    api.get('/needs?urgencyLevel=critical&limit=3').then((res) => {
      if (res.data.success) {
        const needs = (res.data.data?.needs || res.data.data || []).slice(0,3);
        const needInsights: InsightType[] = needs.map((n: any, i: number) => ({
          id: `need-${n.id || i}`,
          type: 'alert' as const,
          severity: 'high' as const,
          title: n.title,
          description: `${n.description?.slice(0,120) || ''}... — ${n.location}`,
          action: 'View Details',
        }));
        setInsights([
          ...needInsights,
          {
            id: 'rec-1',
            type: 'recommendation',
            severity: 'medium',
            title: 'Volunteer Surge Opportunity',
            description: 'Recent activity shows increased engagement. Consider launching new campaigns.',
            action: 'Launch Campaign',
          },
          {
            id: 'trend-1',
            type: 'trend',
            severity: 'low',
            title: 'Donation Pattern Detected',
            description: 'Donations peak on weekends. Schedule donation campaigns accordingly.',
          },
        ]);
      }
    }).catch(() => {
      setInsights([
        { id: 'rec-1', type: 'recommendation', severity: 'medium', title: 'Volunteer Surge Opportunity', description: 'Recent campaign attracted new volunteers. Consider launching related initiatives.', action: 'Launch Campaign' },
        { id: 'trend-1', type: 'trend', severity: 'low', title: 'Donation Pattern', description: 'Donations peak on weekends. Schedule campaigns accordingly.' },
      ]);
    });
  }, []);

  const role = user?.role || 'community';
  const isNGO = ['ngo_coordinator', 'admin', 'platform_admin'].includes(role);
  const isVolunteer = role === 'volunteer';
  const isDonor = role === 'donor';

  const kpis = isNGO ? [
    { title: 'Total Needs', value: loadingStats ? '...' : (stats?.totalNeeds ?? '—'), trend: { direction: 'up' as const, value: 12 }, icon: Zap, color: 'primary' as const },
    { title: 'Active Volunteers', value: loadingStats ? '...' : (stats?.activeVolunteers ?? '—'), trend: { direction: 'up' as const, value: 8 }, icon: Users, color: 'secondary' as const },
    { title: 'Funds Raised', value: loadingStats ? '...' : (stats?.fundsRaised ? `₹${(stats.fundsRaised/100000).toFixed(1)}L` : '—'), trend: { direction: 'up' as const, value: 15 }, icon: Heart, color: 'accent' as const },
    { title: 'People Impacted', value: loadingStats ? '...' : (stats?.peopleImpacted ?? '—'), trend: { direction: 'up' as const, value: 22 }, icon: TrendingUp, color: 'primary' as const },
  ] : isVolunteer ? [
    { title: 'Tasks Completed', value: loadingStats ? '...' : (stats?.tasksCompleted ?? 0), icon: CheckCircle2, color: 'secondary' as const },
    { title: 'Hours Logged', value: loadingStats ? '...' : (stats?.hoursLogged ?? 0), icon: Activity, color: 'primary' as const },
    { title: 'Impact Score', value: loadingStats ? '...' : (stats?.impactScore ?? 0), icon: TrendingUp, color: 'accent' as const },
    { title: 'Active Campaigns', value: loadingStats ? '...' : (stats?.activeCampaigns ?? 0), icon: Zap, color: 'primary' as const },
  ] : [
    { title: 'Total Donated', value: loadingStats ? '...' : (stats?.totalDonated ? `₹${Number(stats.totalDonated).toLocaleString()}` : '—'), icon: Heart, color: 'accent' as const },
    { title: 'Campaigns Funded', value: loadingStats ? '...' : (stats?.campaignsFunded ?? 0), icon: Zap, color: 'primary' as const },
    { title: 'Lives Impacted', value: loadingStats ? '...' : (stats?.livesImpacted ?? 0), icon: TrendingUp, color: 'secondary' as const },
    { title: 'Active Campaigns', value: loadingStats ? '...' : (stats?.activeCampaigns ?? 0), icon: Activity, color: 'primary' as const },
  ];

  const MOCK_ACTIVITIES = [
    { id: '1', type: 'donation', user: { name: 'Raj Patel', initials: 'RP' }, description: 'Donated ₹50,000 to Relief Fund', timestamp: '2 min ago' },
    { id: '2', type: 'volunteer_join', user: { name: 'Priya Singh', initials: 'PS' }, description: 'Joined as Medical Support Volunteer', timestamp: '15 min ago' },
    { id: '3', type: 'task_completed', user: { name: 'Amit Kumar', initials: 'AK' }, description: 'Completed flood relief distribution task', timestamp: '1 hour ago' },
    { id: '4', type: 'message', user: { name: 'NGO Coordinator', initials: 'NC' }, description: 'Sent coordination message to team', timestamp: '2 hours ago' },
  ];

  const MOCK_HOTSPOTS = [
    { id: '1', name: 'District X - Flood', count: 48, severity: 'high' as const },
    { id: '2', name: 'District Y - Medical', count: 12, severity: 'medium' as const },
    { id: '3', name: 'District Z - Relief', count: 5, severity: 'low' as const },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        {/* Page Header */}
        <div>
          <h1 className="text-3xl font-bold text-foreground text-pretty">
            {user?.name || 'Welcome'}
          </h1>
          <p className="text-muted-foreground mt-1">
            {isNGO ? "Your ecosystem overview — campaigns, volunteers, and impact at a glance." :
             isVolunteer ? "Your volunteer portal — tasks, campaigns, and your impact." :
             "Your giving makes a real difference. Here's your impact overview."}
          </p>
        </div>

        {/* Active Emergency Banner */}
        {emergency && <UrgentBanner emergency={emergency} />}

        {/* KPI Cards */}
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
          {loadingStats
            ? Array(4).fill(0).map((_, i) => <Skeleton key={i} className="h-32" />)
            : kpis.map((kpi) => <KPICard key={kpi.title} {...kpi} />)
          }
        </div>

        {/* Main Grid: AI Insights + Hotspots */}
        <div className="grid gap-6 lg:grid-cols-3">
          <AIInsightsPanel insights={insights} onDismiss={(id) => setInsights((prev) => prev.filter((i) => i.id !== id))} />
          <MiniMapHotspots hotspots={MOCK_HOTSPOTS} />
        </div>

        {/* Activity Feed */}
        <ActivityFeed activities={MOCK_ACTIVITIES} />
      </div>
    </DashboardLayout>
  );
}
