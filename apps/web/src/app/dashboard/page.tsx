'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import DashboardLayout from '../../components/layout/dashboard-layout';
import { useAuthStore } from '../../store/auth-store';
import { api } from '../../lib/api';
import { 
  AlertTriangle, 
  CheckCircle2, 
  Users, 
  ClipboardList, 
  TrendingUp,
  MapPin,
  Plus,
  Target,
  Package,
  Mic,
  Zap,
  ChevronRight
} from 'lucide-react';

export default function DashboardController() {
  const user = useAuthStore((state) => state.user);
  const router = useRouter();
  
  if (!user) return <div className="text-white text-center p-10">Loading...</div>;

  const role = user.role;
  const isDonor = role === 'donor';
  const isVolunteer = role === 'volunteer';

  return (
    <DashboardLayout>
      {isVolunteer ? <VolunteerDashboard /> : isDonor ? <DonorDashboard /> : <NgoDashboard />}
    </DashboardLayout>
  );
}

// ============================================
// NGO DASHBOARD
// ============================================
function NgoDashboard() {
  const [stats, setStats] = useState<any>(null);
  const [criticalNeeds, setCriticalNeeds] = useState<any[]>([]);
  const [recentTasks, setRecentTasks] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const user = useAuthStore((state) => state.user);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [statsRes, needsRes, tasksRes] = await Promise.all([
          api.get('/dashboard/stats').catch(() => ({ data: { success: false } })),
          api.get('/needs?urgency=critical&limit=3').catch(() => ({ data: { success: false } })),
          api.get('/tasks?status=open&limit=3').catch(() => ({ data: { success: false } })),
        ]);
        if (statsRes.data.success) setStats(statsRes.data.data);
        if (needsRes.data.success) setCriticalNeeds(needsRes.data.data?.needs || needsRes.data.data || []);
        if (tasksRes.data.success) setRecentTasks(tasksRes.data.data?.tasks || tasksRes.data.data || []);
      } catch (err) {
        console.error("Failed to load stats", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchStats();
  }, []);

  const quickActions = [
    { label: 'Report a Need', icon: Mic, href: '/dashboard/report-need', color: 'text-amber-400 bg-amber-500/10 border-amber-500/20' },
    { label: 'Create Campaign', icon: Target, href: '/dashboard/campaigns', color: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20' },
    { label: 'Manage Tasks', icon: ClipboardList, href: '/dashboard/tasks', color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' },
    { label: 'Add Resource', icon: Package, href: '/dashboard/resources', color: 'text-purple-400 bg-purple-500/10 border-purple-500/20' },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-3">
            Welcome back, {user?.name?.split(' ')[0]} 👋
            <div className="px-3 py-1 text-xs font-semibold rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              NGO Coordinator
            </div>
          </h1>
          <p className="text-slate-400 mt-1">Here's what's happening across your platform today</p>
        </div>
        <button
          onClick={() => router.push('/dashboard/emergency')}
          className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-semibold hover:bg-red-500/20 transition-colors"
        >
          <Zap className="w-4 h-4" /> Emergency
        </button>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {quickActions.map((action) => (
          <Link
            key={action.label}
            href={action.href}
            className={`glass-card rounded-2xl p-4 border flex items-center gap-3 hover:scale-[1.02] transition-all group ${action.color}`}
          >
            <div className={`p-2 rounded-xl ${action.color}`}>
              <action.icon className="w-5 h-5" />
            </div>
            <span className="text-sm font-semibold text-slate-200 group-hover:text-white transition-colors">{action.label}</span>
            <ChevronRight className="w-4 h-4 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
          </Link>
        ))}
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Total Needs" 
          value={stats?.totalNeeds || 0} 
          icon={<MapPin className="w-5 h-5 text-indigo-400" />} 
          trend="+12% this week"
        />
        <StatCard 
          title="Critical Emergencies" 
          value={criticalNeeds.length || stats?.criticalNeeds || 0} 
          icon={<AlertTriangle className="w-5 h-5 text-red-500" />} 
          trend="Needs immediate action"
          isAlert={(criticalNeeds.length || stats?.criticalNeeds || 0) > 0}
        />
        <StatCard 
          title="Active Tasks" 
          value={stats?.totalTasks || recentTasks.length || 0} 
          icon={<ClipboardList className="w-5 h-5 text-emerald-400" />} 
        />
        <StatCard 
          title="Match Rate" 
          value={`${stats?.matchSuccessRate || 78}%`} 
          icon={<TrendingUp className="w-5 h-5 text-indigo-400" />} 
          trend="Volunteers to tasks"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Open Tasks */}
        <div className="glass-card rounded-2xl p-6 lg:col-span-2 border border-slate-800">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-slate-200">Open Tasks</h2>
            <button onClick={() => router.push('/dashboard/tasks')} className="text-sm text-indigo-400 hover:text-indigo-300 font-medium flex items-center gap-1">
              View All <ChevronRight className="w-4 h-4" />
            </button>
          </div>
          <div className="space-y-3">
            {recentTasks.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-32 text-center">
                <ClipboardList className="w-10 h-10 text-slate-600 mb-3" />
                <p className="text-slate-400 text-sm">No open tasks right now</p>
                <button onClick={() => router.push('/dashboard/tasks')} className="mt-3 text-xs text-indigo-400 hover:text-indigo-300">Create a task →</button>
              </div>
            ) : (
              recentTasks.map((task: any) => (
                <div key={task._id} className="flex items-center gap-4 p-3 rounded-xl bg-slate-800/50 border border-slate-700/50 hover:border-indigo-500/30 transition-colors group">
                  <div className="p-2 rounded-lg bg-indigo-500/10">
                    <ClipboardList className="w-4 h-4 text-indigo-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-medium text-slate-200 truncate">{task.title}</h3>
                    <p className="text-xs text-slate-400 mt-0.5">{task.location} • {task.volunteersNeeded} volunteers needed</p>
                  </div>
                  <span className="text-xs px-2 py-1 rounded-lg bg-emerald-500/15 text-emerald-400 font-semibold shrink-0">OPEN</span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Critical Needs Feed */}
        <div className="glass-card rounded-2xl p-6 border border-slate-800">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-slate-200">🚨 Critical Needs</h2>
            <button onClick={() => router.push('/dashboard/needs')} className="text-sm text-indigo-400 hover:text-indigo-300 font-medium">View All</button>
          </div>
          
          <div className="space-y-3">
            {criticalNeeds.length === 0 ? (
              <div className="text-center py-8">
                <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
                <p className="text-sm text-slate-400">No critical needs right now</p>
                <p className="text-xs text-slate-500 mt-1">All clear ✓</p>
              </div>
            ) : (
              criticalNeeds.map((need: any) => (
                <div key={need._id} className="flex items-start gap-3 p-3 rounded-xl bg-red-500/5 border border-red-500/20">
                  <div className="p-1.5 rounded-lg bg-red-500/10 text-red-500 shrink-0 mt-0.5">
                    <AlertTriangle className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-sm font-medium text-slate-200 line-clamp-1">{need.title}</h3>
                    <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-1">
                      <MapPin className="w-3 h-3" /> {need.location}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>

          <button
            onClick={() => router.push('/dashboard/report-need')}
            className="w-full mt-4 py-2.5 rounded-xl border border-dashed border-slate-700 text-slate-400 text-sm hover:border-indigo-500 hover:text-indigo-400 transition-colors flex items-center justify-center gap-2"
          >
            <Plus className="w-4 h-4" /> Report New Need
          </button>
        </div>
      </div>
    </div>
  );
}

// ============================================
// VOLUNTEER DASHBOARD
// ============================================
function VolunteerDashboard() {
  const [matches, setMatches] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchMatches = async () => {
      try {
        const res = await api.get('/volunteers/matches');
        if (res.data.success) {
          setMatches(res.data.data);
        }
      } catch (err) {
        console.error("Failed to load matches", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchMatches();
  }, []);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-3">
          My Portal
          <div className="px-3 py-1 text-xs font-semibold rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            Volunteer
          </div>
        </h1>
        <p className="text-slate-400 mt-1">AI-Recommended opportunities based on your skills</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard title="Tasks Completed" value={0} icon={<CheckCircle2 className="w-5 h-5 text-emerald-400" />} />
        <StatCard title="Hours Logged" value={0} icon={<ClipboardList className="w-5 h-5 text-indigo-400" />} />
        <StatCard title="Impact Score" value={50} icon={<TrendingUp className="w-5 h-5 text-purple-400" />} />
      </div>

      <div className="glass-card rounded-2xl p-6 border border-slate-800">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-slate-200">Recommended For You</h2>
          <span className="text-sm text-slate-400 font-medium">Powered by Gemini AI</span>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center h-40">
             <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : matches.length === 0 ? (
          <div className="text-center py-12 border-2 border-dashed border-slate-700/50 rounded-xl">
             <ClipboardList className="w-12 h-12 text-slate-600 mx-auto mb-4" />
             <h3 className="text-lg font-medium text-slate-300">No active tasks right now</h3>
             <p className="text-slate-400 mt-2">We'll notify you when new opportunities match your profile.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {matches.map((match, idx) => (
              <div key={idx} className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-5 hover:border-indigo-500/50 transition-colors">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-base font-semibold text-slate-200 line-clamp-2">{match.task.title}</h3>
                  <div className={`px-2 py-1 text-xs font-bold rounded-lg ${
                    match.matchScore > 80 ? 'bg-emerald-500/20 text-emerald-400' :
                    match.matchScore > 50 ? 'bg-indigo-500/20 text-indigo-400' :
                    'bg-slate-700 text-slate-300'
                  }`}>
                    {match.matchScore}% Match
                  </div>
                </div>
                
                <p className="text-sm text-slate-400 line-clamp-2 mb-4">{match.task.description}</p>
                
                <div className="flex items-center gap-2 mb-4">
                  <MapPin className="w-4 h-4 text-slate-500" />
                  <span className="text-xs text-slate-300">{match.task.location}</span>
                </div>

                <div className="space-y-2 mb-6">
                  {match.matchReasons.slice(0, 2).map((r: string, i: number) => (
                    <div key={i} className="flex items-center gap-2 text-xs text-indigo-300">
                      <div className="w-1 h-1 rounded-full bg-indigo-400"></div>
                      {r}
                    </div>
                  ))}
                </div>

                <button className="w-full py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium transition-colors">
                  Apply for Task
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================
// SHARED COMPONENTS
// ============================================
function StatCard({ title, value, icon, trend, isAlert }: any) {
  return (
    <div className={`glass-card p-6 rounded-2xl border ${isAlert ? 'border-red-500/30' : 'border-slate-800'}`}>
      <div className="flex justify-between items-start">
        <div>
          <p className="text-sm font-medium text-slate-400">{title}</p>
          <p className="text-3xl font-bold text-slate-100 mt-2">{value}</p>
        </div>
        <div className={`p-3 rounded-xl ${isAlert ? 'bg-red-500/10' : 'bg-slate-800/50'}`}>
          {icon}
        </div>
      </div>
      {trend && (
        <div className={`mt-4 text-xs font-medium ${isAlert ? 'text-red-400' : 'text-slate-500'}`}>
          {trend}
        </div>
      )}
    </div>
  );
}

// ============================================
// DONOR DASHBOARD
// ============================================
function DonorDashboard() {
  const [donations, setDonations] = useState<any>(null);
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const user = useAuthStore((state) => state.user);
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [donRes, campRes] = await Promise.all([
          api.get('/donations/my').catch(() => ({ data: { success: false } })),
          api.get('/campaigns').catch(() => ({ data: { success: false } })),
        ]);
        if (donRes.data.success) setDonations(donRes.data.data);
        if (campRes.data.success) setCampaigns(campRes.data.data.campaigns || []);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white">
          Welcome back, {user?.name?.split(' ')[0]} 👋
        </h1>
        <p className="text-slate-400 mt-1">Your giving makes a real difference</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard title="Total Donated" value={`₹${(donations?.totalDonated || 0).toLocaleString()}`}
          icon={<TrendingUp className="w-5 h-5 text-pink-400" />} trend="Every rupee counts" />
        <StatCard title="Campaigns Funded" value={String(donations?.count || 0)}
          icon={<ClipboardList className="w-5 h-5 text-indigo-400" />} />
        <StatCard title="Lives Impacted" value={String(Math.round((donations?.totalDonated || 0) / 50))}
          icon={<Users className="w-5 h-5 text-emerald-400" />} trend="Estimated direct impact" />
      </div>

      <div>
        <h2 className="text-lg font-semibold text-slate-200 mb-4">Campaigns You Can Fund</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {campaigns.slice(0, 4).map((c: any) => (
            <div key={c._id} className="glass-card rounded-2xl border border-slate-800 p-5 hover:border-pink-500/30 transition-colors">
              <h3 className="text-sm font-semibold text-slate-100 mb-1">{c.title}</h3>
              <p className="text-xs text-slate-400 mb-3">{c.description?.slice(0, 80)}</p>
              <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden mb-2">
                <div className="h-full bg-gradient-to-r from-pink-600 to-indigo-500 rounded-full"
                  style={{ width: `${c.goals?.fundingGoal ? Math.min((c.goals.fundingRaised / c.goals.fundingGoal) * 100, 100) : 0}%` }} />
              </div>
              <div className="flex justify-between text-xs text-slate-400 mb-3">
                <span>₹{(c.goals?.fundingRaised || 0).toLocaleString()} raised</span>
                <span>₹{(c.goals?.fundingGoal || 0).toLocaleString()} goal</span>
              </div>
              <button onClick={() => router.push(`/dashboard/donate?campaign=${c._id}`)} className="w-full py-2 rounded-lg bg-gradient-to-r from-pink-600/20 to-indigo-600/20 border border-pink-500/20 text-pink-400 text-xs font-semibold hover:from-pink-600 hover:to-indigo-600 hover:text-white transition-all">❤️ Donate Now</button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
