'use client';

import { useEffect, useState } from 'react';
import { api } from '../../../lib/api';
import DashboardLayout from '../../../components/layout/dashboard-layout';
import { useAuthStore } from '../../../store/auth-store';
import {
  Users, Search, Filter, Shield, MapPin, Clock, CheckCircle2,
  Star, Award, Briefcase, X, ChevronRight, Sparkles, UserCheck
} from 'lucide-react';

const SKILL_COLORS: Record<string, string> = {
  Teaching: 'bg-blue-500/15 text-blue-400',
  Medical: 'bg-red-500/15 text-red-400',
  Engineering: 'bg-orange-500/15 text-orange-400',
  Construction: 'bg-amber-500/15 text-amber-400',
  Cooking: 'bg-emerald-500/15 text-emerald-400',
  Driving: 'bg-indigo-500/15 text-indigo-400',
  Translation: 'bg-purple-500/15 text-purple-400',
  'First Aid': 'bg-pink-500/15 text-pink-400',
  'IT Support': 'bg-cyan-500/15 text-cyan-400',
};

const AVAILABILITY_LABEL: Record<string, { label: string; color: string }> = {
  'full-time': { label: 'Full-time', color: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30' },
  'part-time': { label: 'Part-time', color: 'bg-blue-500/15 text-blue-400 border-blue-500/30' },
  weekends: { label: 'Weekends', color: 'bg-purple-500/15 text-purple-400 border-purple-500/30' },
  evenings: { label: 'Evenings', color: 'bg-amber-500/15 text-amber-400 border-amber-500/30' },
};

export default function VolunteersPage() {
  const user = useAuthStore((s) => s.user);
  const [volunteers, setVolunteers] = useState<any[]>([]);
  const [tasks, setTasks] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterAvail, setFilterAvail] = useState('all');
  const [filterSkill, setFilterSkill] = useState('');
  const [assignModal, setAssignModal] = useState<{ volunteer: any; open: boolean } | null>(null);
  const [assigning, setAssigning] = useState(false);
  const [assignedTask, setAssignedTask] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [volRes, taskRes] = await Promise.all([
          api.get('/volunteers').catch(() => ({ data: { success: false } })),
          api.get('/tasks?status=open').catch(() => ({ data: { success: false } })),
        ]);
        if (volRes.data.success) setVolunteers(volRes.data.data || []);
        if (taskRes.data.success) setTasks(taskRes.data.data?.tasks || taskRes.data.data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleAssign = async () => {
    if (!assignedTask || !assignModal) return;
    setAssigning(true);
    try {
      await api.patch(`/tasks/${assignedTask}/assign`, {
        volunteerId: assignModal.volunteer._id,
      }).catch(() => null);
      setSuccessMsg(`${assignModal.volunteer.userId?.name || 'Volunteer'} assigned successfully!`);
      setAssignModal(null);
      setAssignedTask('');
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      console.error(err);
    } finally {
      setAssigning(false);
    }
  };

  const filtered = volunteers.filter((v) => {
    const name = v.userId?.name?.toLowerCase() || '';
    const loc = v.location?.toLowerCase() || '';
    const matchSearch = !search || name.includes(search.toLowerCase()) || loc.includes(search.toLowerCase());
    const matchAvail = filterAvail === 'all' || v.availability === filterAvail;
    const matchSkill = !filterSkill || v.skills?.includes(filterSkill);
    return matchSearch && matchAvail && matchSkill;
  });

  const allSkills = Array.from(new Set(volunteers.flatMap((v) => v.skills || []))).slice(0, 15);
  const isAdmin = ['ngo_coordinator', 'ngo_admin', 'admin', 'platform_admin'].includes(user?.role || '');

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-3">
              <Users className="w-6 h-6 text-indigo-400" />
              Volunteer Directory
            </h1>
            <p className="text-slate-400 mt-1">
              {filtered.length} of {volunteers.length} volunteers • AI-matched to your campaigns
            </p>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-sm font-medium">
            <Sparkles className="w-4 h-4" />
            AI Matching Active
          </div>
        </div>

        {/* Success banner */}
        {successMsg && (
          <div className="glass-card rounded-2xl border border-emerald-500/30 p-4 flex items-center gap-3 bg-emerald-500/5">
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            <span className="text-sm text-emerald-400 font-medium">{successMsg}</span>
          </div>
        )}

        {/* Stats Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: 'Total Volunteers', value: volunteers.length, icon: Users, color: 'indigo' },
            { label: 'Full-time', value: volunteers.filter(v => v.availability === 'full-time').length, icon: Clock, color: 'emerald' },
            { label: 'Avg Trust Score', value: volunteers.length > 0 ? Math.round(volunteers.reduce((s, v) => s + (v.impactScore || 50), 0) / volunteers.length) : 0, icon: Shield, color: 'purple' },
            { label: 'Skills Offered', value: allSkills.length, icon: Star, color: 'amber' },
          ].map((stat, i) => (
            <div key={i} className="glass-card rounded-2xl border border-slate-800 p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-slate-400">{stat.label}</span>
                <stat.icon className={`w-4 h-4 text-${stat.color}-400`} />
              </div>
              <div className="text-2xl font-bold text-slate-100">{stat.value}</div>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="glass-card rounded-2xl border border-slate-800 p-4 flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name or location..."
              className="w-full pl-10 pr-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-slate-200 placeholder-slate-500 focus:border-indigo-500 focus:outline-none"
            />
          </div>

          {/* Availability */}
          <select
            value={filterAvail}
            onChange={(e) => setFilterAvail(e.target.value)}
            className="px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-slate-200 focus:border-indigo-500 focus:outline-none"
          >
            <option value="all">All Availability</option>
            <option value="full-time">Full-time</option>
            <option value="part-time">Part-time</option>
            <option value="weekends">Weekends</option>
            <option value="evenings">Evenings</option>
          </select>

          {/* Skill filter */}
          <select
            value={filterSkill}
            onChange={(e) => setFilterSkill(e.target.value)}
            className="px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-slate-200 focus:border-indigo-500 focus:outline-none"
          >
            <option value="">All Skills</option>
            {allSkills.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>

        {/* Volunteer Grid */}
        {isLoading ? (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="glass-card rounded-2xl border border-slate-800 p-16 text-center">
            <Users className="w-12 h-12 text-slate-600 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-slate-300">No volunteers found</h3>
            <p className="text-slate-500 mt-2">Try adjusting your search filters.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {filtered.map((vol) => {
              const avail = AVAILABILITY_LABEL[vol.availability] || { label: vol.availability || 'N/A', color: 'bg-slate-700 text-slate-400 border-slate-600' };
              return (
                <div key={vol._id} className="glass-card rounded-2xl border border-slate-800 p-5 hover:border-indigo-500/30 transition-all group">
                  {/* Header */}
                  <div className="flex items-start gap-3 mb-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center text-lg font-bold text-white shrink-0">
                      {vol.userId?.name?.[0]?.toUpperCase() || 'V'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-base font-semibold text-slate-100 group-hover:text-indigo-300 transition-colors">
                        {vol.userId?.name || 'Volunteer'}
                      </h3>
                      <p className="text-xs text-slate-400">{vol.userId?.email}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`px-2 py-0.5 text-xs font-semibold rounded-lg border ${avail.color}`}>
                          {avail.label}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Location */}
                  {vol.location && (
                    <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-3">
                      <MapPin className="w-3 h-3" />
                      {vol.location}
                    </div>
                  )}

                  {/* Bio */}
                  {vol.bio && (
                    <p className="text-xs text-slate-400 line-clamp-2 mb-3 italic">"{vol.bio}"</p>
                  )}

                  {/* Trust / Impact Score */}
                  <div className="mb-4">
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="text-slate-400 flex items-center gap-1"><Shield className="w-3 h-3" /> Impact Score</span>
                      <span className="text-indigo-400 font-bold">{vol.impactScore || 0}/100</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-800 rounded-full">
                      <div
                        className="h-full bg-gradient-to-r from-indigo-600 to-emerald-500 rounded-full transition-all duration-700"
                        style={{ width: `${Math.min(vol.impactScore || 0, 100)}%` }}
                      />
                    </div>
                  </div>

                  {/* Stats row */}
                  <div className="grid grid-cols-3 gap-2 mb-4">
                    <div className="text-center p-2 rounded-lg bg-slate-800/50">
                      <div className="text-sm font-bold text-slate-100">{vol.tasksCompleted || 0}</div>
                      <div className="text-xs text-slate-500">Tasks</div>
                    </div>
                    <div className="text-center p-2 rounded-lg bg-slate-800/50">
                      <div className="text-sm font-bold text-slate-100">{vol.hoursLogged || 0}</div>
                      <div className="text-xs text-slate-500">Hours</div>
                    </div>
                    <div className="text-center p-2 rounded-lg bg-slate-800/50">
                      <div className="text-sm font-bold text-slate-100">{vol.badges?.length || 0}</div>
                      <div className="text-xs text-slate-500">Badges</div>
                    </div>
                  </div>

                  {/* Skills */}
                  {vol.skills?.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-4">
                      {vol.skills.slice(0, 4).map((skill: string) => (
                        <span key={skill} className={`px-2 py-0.5 text-xs rounded-md font-medium ${SKILL_COLORS[skill] || 'bg-slate-700 text-slate-300'}`}>
                          {skill}
                        </span>
                      ))}
                      {vol.skills.length > 4 && (
                        <span className="px-2 py-0.5 text-xs rounded-md bg-slate-700 text-slate-400">
                          +{vol.skills.length - 4} more
                        </span>
                      )}
                    </div>
                  )}

                  {/* Action button */}
                  {isAdmin && (
                    <button
                      onClick={() => setAssignModal({ volunteer: vol, open: true })}
                      className="w-full py-2.5 rounded-xl bg-indigo-600/10 border border-indigo-500/20 text-indigo-400 text-sm font-semibold hover:bg-indigo-600 hover:text-white transition-all flex items-center justify-center gap-2"
                    >
                      <UserCheck className="w-4 h-4" /> Assign to Task
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Assign Modal */}
      {assignModal?.open && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4" onClick={() => setAssignModal(null)}>
          <div className="glass-card rounded-2xl border border-slate-700 p-6 w-full max-w-md space-y-5" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-indigo-400" /> Assign to Task
              </h2>
              <button onClick={() => setAssignModal(null)} className="p-1.5 rounded-lg hover:bg-slate-700 text-slate-400 transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Volunteer summary */}
            <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-800/50">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center font-bold text-white">
                {assignModal.volunteer.userId?.name?.[0]?.toUpperCase()}
              </div>
              <div>
                <div className="text-sm font-semibold text-slate-200">{assignModal.volunteer.userId?.name}</div>
                <div className="text-xs text-slate-400">{assignModal.volunteer.skills?.slice(0, 3).join(', ')}</div>
              </div>
            </div>

            {/* Task selector */}
            <div>
              <label className="text-sm text-slate-300 font-medium block mb-2">Select an Open Task</label>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {tasks.length === 0 ? (
                  <p className="text-sm text-slate-400 text-center py-4">No open tasks available</p>
                ) : (
                  tasks.map((task) => (
                    <button
                      key={task._id}
                      onClick={() => setAssignedTask(task._id)}
                      className={`w-full text-left p-3 rounded-xl border transition-all ${
                        assignedTask === task._id
                          ? 'border-indigo-500/50 bg-indigo-500/10'
                          : 'border-slate-700 bg-slate-800/50 hover:border-slate-600'
                      }`}
                    >
                      <div className="text-sm font-medium text-slate-200">{task.title}</div>
                      <div className="text-xs text-slate-400 mt-0.5 flex items-center gap-2">
                        <MapPin className="w-3 h-3" /> {task.location}
                        <span className="ml-auto">{task.volunteersNeeded} needed</span>
                      </div>
                    </button>
                  ))
                )}
              </div>
            </div>

            <div className="flex gap-3">
              <button onClick={() => setAssignModal(null)} className="flex-1 py-2.5 rounded-xl bg-slate-700 hover:bg-slate-600 text-slate-300 text-sm font-medium transition-colors">
                Cancel
              </button>
              <button
                onClick={handleAssign}
                disabled={!assignedTask || assigning}
                className="flex-1 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold disabled:opacity-40 transition-colors flex items-center justify-center gap-2"
              >
                {assigning ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <><UserCheck className="w-4 h-4" /> Assign</>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
