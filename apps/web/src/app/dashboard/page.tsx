'use client';

import { useEffect, useState } from 'react';
import DashboardLayout from '../../components/layout/dashboard-layout';
import { useAuthStore } from '../../store/auth-store';
import { api } from '../../lib/api';
import { 
  AlertTriangle, 
  CheckCircle2, 
  Users, 
  ClipboardList, 
  TrendingUp,
  MapPin
} from 'lucide-react';

export default function DashboardController() {
  const user = useAuthStore((state) => state.user);
  
  if (!user) return <div className="text-white text-center p-10">Loading...</div>;

  return (
    <DashboardLayout>
      {user.role === 'volunteer' ? <VolunteerDashboard /> : <NgoDashboard />}
    </DashboardLayout>
  );
}

// ============================================
// NGO DASHBOARD
// ============================================
function NgoDashboard() {
  const [stats, setStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get('/dashboard/stats');
        if (res.data.success) {
          setStats(res.data.data);
        }
      } catch (err) {
        console.error("Failed to load stats", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchStats();
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
        <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-3">
          Overview
          <div className="px-3 py-1 text-xs font-semibold rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            NGO Coordinator
          </div>
        </h1>
        <p className="text-slate-400 mt-1">Platform metrics and priority overview</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Total Needs Identified" 
          value={stats?.totalNeeds || 0} 
          icon={<MapPin className="w-5 h-5 text-indigo-400" />} 
          trend="+12% this week"
        />
        <StatCard 
          title="Critical Emergencies" 
          value={stats?.criticalNeeds || 0} 
          icon={<AlertTriangle className="w-5 h-5 text-red-500" />} 
          trend="Needs immediate action"
          isAlert={stats?.criticalNeeds > 0}
        />
        <StatCard 
          title="Active Tasks" 
          value={stats?.totalTasks || 0} 
          icon={<ClipboardList className="w-5 h-5 text-emerald-400" />} 
        />
        <StatCard 
          title="Match Success Rate" 
          value={`${stats?.matchSuccessRate || 0}%`} 
          icon={<TrendingUp className="w-5 h-5 text-indigo-400" />} 
          trend="Volunteers to tasks"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Chart Area */}
        <div className="glass-card rounded-2xl p-6 lg:col-span-2 border border-slate-800">
          <h2 className="text-lg font-semibold text-slate-200 mb-6">Recent Needs Pipeline</h2>
          <div className="h-64 flex items-center justify-center border-2 border-dashed border-slate-700/50 rounded-xl bg-slate-800/20">
            <div className="text-center">
              <ClipboardList className="w-10 h-10 text-slate-500 mx-auto mb-3" />
              <p className="text-slate-400">Recharts Visualization Goes Here</p>
            </div>
          </div>
        </div>

        {/* Needs Feed */}
        <div className="glass-card rounded-2xl p-6 border border-slate-800">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-slate-200">Critical Needs</h2>
            <button className="text-sm text-indigo-400 hover:text-indigo-300 font-medium">View All</button>
          </div>
          
          <div className="space-y-4">
            {stats?.criticalNeeds === 0 ? (
              <div className="text-center py-6 text-slate-400">No critical needs active.</div>
            ) : (
              [1, 2, 3].map((i) => (
                <div key={i} className="flex items-start gap-4 p-4 rounded-xl bg-slate-800/50 border border-slate-700/50">
                  <div className="p-2 rounded-lg bg-red-500/10 text-red-500 shrink-0">
                    <AlertTriangle className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-slate-200">Flood Relief Needed</h3>
                    <p className="text-xs text-slate-400 mt-1">Mumbai Suburbs • 2 hrs ago</p>
                  </div>
                </div>
              ))
            )}
          </div>
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
