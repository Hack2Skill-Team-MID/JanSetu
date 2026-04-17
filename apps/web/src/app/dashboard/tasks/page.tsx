'use client';

import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/layout/dashboard-layout';
import { api } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Plus, MapPin, Users, CalendarDays, Loader2, CheckCircle2, Clock, CircleDot, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/lib/i18n';


type Priority = 'critical' | 'high' | 'medium' | 'low';
type Status = 'open' | 'in_progress' | 'completed';

interface Task {
  id: string;
  title: string;
  description: string;
  status: Status;
  requiredSkills: string[];
  location: string;
  deadline: string;
  volunteersNeeded: number;
  volunteersAssigned: number;
  priority?: Priority;
}

// defined inside component so labels can use t()
const PRIORITY_BADGE: Record<string, string> = {
  critical: 'bg-red-500/20 text-red-400 border-red-500/30',
  high: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  medium: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  low: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
};


const DEMO_TASKS: Task[] = [
  // Open
  { id: 't1', title: 'Distribute food packets — Sector 12 Relief Camp', description: 'Coordinate with local distributors to hand out 500 dry-ration kits to displaced families in Sector 12.', status: 'open', priority: 'critical', requiredSkills: ['Logistics', 'Driving'], location: 'Dhubri, Assam', deadline: new Date(Date.now() + 2 * 24 * 3600000).toISOString(), volunteersNeeded: 8, volunteersAssigned: 2 },
  { id: 't2', title: 'Set up water purification station at flood camp', description: 'Install and operate 3 RO purification units at the main relief camp for 2,400 displaced persons.', status: 'open', priority: 'critical', requiredSkills: ['Water Engineering', 'Plumbing'], location: 'Bhadrachalam, Telangana', deadline: new Date(Date.now() + 1 * 24 * 3600000).toISOString(), volunteersNeeded: 4, volunteersAssigned: 0 },
  { id: 't3', title: 'Conduct door-to-door vaccination survey', description: 'Visit 300 households in Taluka 4 to register unvaccinated residents and schedule mobile camp follow-ups.', status: 'open', priority: 'high', requiredSkills: ['Healthcare', 'Data Entry'], location: 'Bastar, Chhattisgarh', deadline: new Date(Date.now() + 5 * 24 * 3600000).toISOString(), volunteersNeeded: 6, volunteersAssigned: 1 },
  // In Progress
  { id: 't4', title: 'Install solar panels at Gram Panchayat office', description: 'Set up a 5kW rooftop solar system to power the panchayat building and adjacent health sub-centre 24×7.', status: 'in_progress', priority: 'high', requiredSkills: ['Electrical', 'Solar Tech'], location: 'Barmer, Rajasthan', deadline: new Date(Date.now() + 7 * 24 * 3600000).toISOString(), volunteersNeeded: 3, volunteersAssigned: 3 },
  { id: 't5', title: 'Run digital literacy workshop for women SHGs', description: 'Teach 80 self-help group members to use UPI, online banking, and WhatsApp Business for their micro-enterprises.', status: 'in_progress', priority: 'medium', requiredSkills: ['Teaching', 'Technology'], location: 'Lucknow, Uttar Pradesh', deadline: new Date(Date.now() + 10 * 24 * 3600000).toISOString(), volunteersNeeded: 4, volunteersAssigned: 4 },
  { id: 't6', title: 'Map flood-affected households using mobile app', description: 'Use the JanSetu field app to geo-tag 500+ flood-affected homes for resource allocation algorithms.', status: 'in_progress', priority: 'medium', requiredSkills: ['GIS Mapping', 'Mobile Tech'], location: 'Dhubri, Assam', deadline: new Date(Date.now() + 3 * 24 * 3600000).toISOString(), volunteersNeeded: 10, volunteersAssigned: 7 },
  // Completed
  { id: 't7', title: 'Establish first-aid station at relief camp entrance', description: 'Set up and staff a 24-hour first-aid post with basic OPD facilities for the 5,000-person flood relief camp.', status: 'completed', priority: 'critical', requiredSkills: ['First Aid', 'Nursing'], location: 'Dhubri, Assam', deadline: new Date(Date.now() - 5 * 24 * 3600000).toISOString(), volunteersNeeded: 5, volunteersAssigned: 5 },
  { id: 't8', title: 'Distribute educational tablets to school children', description: 'Hand out 200 pre-loaded tablets to Class 5-8 students at the 25 newly-digitised government schools.', status: 'completed', priority: 'high', requiredSkills: ['Logistics', 'Teaching'], location: 'Dumka, Jharkhand', deadline: new Date(Date.now() - 8 * 24 * 3600000).toISOString(), volunteersNeeded: 6, volunteersAssigned: 6 },
  { id: 't9', title: 'Conduct environmental awareness drive in schools', description: 'Deliver 2-hour sessions on waste management, water conservation, and tree planting in 12 tribal schools.', status: 'completed', priority: 'low', requiredSkills: ['Teaching', 'Environment'], location: 'Bandipur, Karnataka', deadline: new Date(Date.now() - 12 * 24 * 3600000).toISOString(), volunteersNeeded: 3, volunteersAssigned: 3 },
];

function TaskCard({ task, onMove }: { task: Task; onMove: (id: string, status: Status) => void }) {
  const skill = task.requiredSkills?.[0];
  const deadline = task.deadline ? new Date(task.deadline).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) : '';
  const isOverdue = task.deadline && new Date(task.deadline) < new Date() && task.status !== 'completed';

  return (
    <div className="glass-card border border-slate-800 hover:border-slate-600 rounded-xl p-4 space-y-3 transition-all card-hover cursor-default">
      {task.priority && (
        <div className="flex items-center justify-between">
          <span className={`px-2 py-0.5 text-[10px] font-semibold rounded-md border capitalize ${PRIORITY_BADGE[task.priority]}`}>
            {task.priority}
          </span>
          {isOverdue && <span className="text-[10px] text-red-400 font-semibold">OVERDUE</span>}
        </div>
      )}
      <p className="font-medium text-sm text-slate-200 leading-snug">{task.title}</p>
      {task.description && (
        <p className="text-xs text-slate-500 line-clamp-2">{task.description}</p>
      )}
      <div className="space-y-1.5 text-xs text-slate-400">
        {task.location && (
          <div className="flex items-center gap-1.5"><MapPin className="h-3 w-3 flex-shrink-0" />{task.location}</div>
        )}
        {deadline && (
          <div className={`flex items-center gap-1.5 ${isOverdue ? 'text-red-400' : ''}`}>
            <CalendarDays className="h-3 w-3 flex-shrink-0" />Due {deadline}
          </div>
        )}
        <div className="flex items-center gap-1.5">
          <Users className="h-3 w-3 flex-shrink-0" />
          <span className={task.volunteersAssigned >= task.volunteersNeeded ? 'text-emerald-400' : ''}>
            {task.volunteersAssigned}/{task.volunteersNeeded} volunteers
          </span>
        </div>
      </div>
      {skill && (
        <span className="inline-flex px-2 py-0.5 text-[10px] rounded-md border border-slate-700 text-slate-400 bg-slate-800/50">{skill}</span>
      )}
      <div className="flex gap-1.5 pt-1">
        {task.status !== 'in_progress' && task.status !== 'completed' && (
          <Button size="sm" variant="outline" className="h-7 text-xs flex-1 border-slate-700 hover:border-indigo-500 hover:text-indigo-400" onClick={() => onMove(task.id, 'in_progress')}>
            Start
          </Button>
        )}
        {task.status === 'in_progress' && (
          <Button size="sm" variant="outline" className="h-7 text-xs flex-1 border-emerald-800 text-emerald-400 hover:bg-emerald-500/10" onClick={() => onMove(task.id, 'completed')}>
            Complete
          </Button>
        )}
        {task.status === 'completed' && (
          <span className="text-xs text-emerald-400 flex items-center gap-1 w-full justify-center py-1">
            <CheckCircle2 className="h-3.5 w-3.5" /> Done
          </span>
        )}
      </div>
    </div>
  );
}

export default function TasksPage() {
  const { t } = useTranslation();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNew, setShowNew] = useState(false);
  const [newTask, setNewTask] = useState({ title: '', description: '', location: '', deadline: '', volunteersNeeded: 1 });
  const [submitting, setSubmitting] = useState(false);
  const [filterPriority, setFilterPriority] = useState<string | null>(null);

  const STATUS_COLUMNS = [
    { key: 'open' as Status, label: t('tasks.open'), icon: CircleDot, color: 'text-slate-400', bg: 'bg-slate-500/10' },
    { key: 'in_progress' as Status, label: t('tasks.inProgress'), icon: Clock, color: 'text-amber-400', bg: 'bg-amber-500/10' },
    { key: 'completed' as Status, label: t('tasks.completed'), icon: CheckCircle2, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
  ];

  useEffect(() => {
    api.get('/tasks').then((res) => {
      if (res.data.success) {
        const data = res.data.data?.tasks || res.data.data || [];
        if (Array.isArray(data) && data.length > 0) { setTasks(data); return; }
      }
      setTasks(DEMO_TASKS);
    }).catch(() => setTasks(DEMO_TASKS)).finally(() => setLoading(false));
  }, []);

  const handleMove = async (id: string, status: Status) => {
    setTasks((prev) => prev.map((t) => t.id === id ? { ...t, status } : t));
    try { await api.patch(`/tasks/${id}`, { status }); } catch { /* optimistic, no revert for demo */ }
  };

  const handleCreate = async () => {
    setSubmitting(true);
    try {
      const res = await api.post('/tasks', { ...newTask, deadline: newTask.deadline || new Date(Date.now() + 7 * 86400000).toISOString(), status: 'open' });
      if (res.data.success) {
        setTasks((prev) => [res.data.data, ...prev]);
      } else { throw new Error(); }
    } catch {
      // Add locally for demo
      const localTask: Task = {
        id: `local-${Date.now()}`, title: newTask.title, description: newTask.description,
        status: 'open', priority: 'medium', requiredSkills: [],
        location: newTask.location, deadline: newTask.deadline || new Date(Date.now() + 7 * 86400000).toISOString(),
        volunteersNeeded: newTask.volunteersNeeded, volunteersAssigned: 0,
      };
      setTasks((prev) => [localTask, ...prev]);
    } finally {
      setShowNew(false);
      setNewTask({ title: '', description: '', location: '', deadline: '', volunteersNeeded: 1 });
      setSubmitting(false);
    }
  };

  const filteredTasks = filterPriority ? tasks.filter((t) => t.priority === filterPriority) : tasks;

  const completionRate = tasks.length > 0
    ? Math.round((tasks.filter(t => t.status === 'completed').length / tasks.length) * 100)
    : 0;

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-100">{t('tasks.title')}</h1>
            <p className="text-slate-400 mt-1">{t('tasks.subtitle')}</p>
          </div>
          <Button className="gap-2 w-fit bg-indigo-600 hover:bg-indigo-500 shadow-[0_0_15px_rgba(79,70,229,0.3)]" onClick={() => setShowNew(true)}>
            <Plus className="h-4 w-4" /> {t('tasks.createTask')}
          </Button>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {STATUS_COLUMNS.map(col => {
            const count = tasks.filter(t => t.status === col.key).length;
            const Icon = col.icon;
            return (
              <div key={col.key} className={`glass-card rounded-xl border border-slate-800 p-3 flex items-center gap-3`}>
                <div className={`p-2 rounded-lg ${col.bg}`}>
                  <Icon className={`h-4 w-4 ${col.color}`} />
                </div>
                <div>
                  <div className="text-xl font-bold text-slate-100">{count}</div>
                  <div className="text-xs text-slate-400">{col.label}</div>
                </div>
              </div>
            );
          })}
          <div className="glass-card rounded-xl border border-slate-800 p-3 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-indigo-500/10">
              <Zap className="h-4 w-4 text-indigo-400" />
            </div>
            <div>
              <div className="text-xl font-bold text-slate-100">{completionRate}%</div>
              <div className="text-xs text-slate-400">Done Rate</div>
            </div>
          </div>
        </div>

        {/* Priority Filter */}
        <div className="flex gap-2 flex-wrap">
          {[null, 'critical', 'high', 'medium', 'low'].map((p) => (
            <button
              key={p || 'all'}
              onClick={() => setFilterPriority(p)}
              className={`px-4 py-1.5 rounded-xl text-xs font-semibold border transition-all capitalize ${
                filterPriority === p
                  ? 'bg-indigo-600/20 border-indigo-500/50 text-indigo-300'
                  : 'bg-slate-800/50 border-slate-700/50 text-slate-400 hover:text-slate-200'
              }`}
            >
              {p || 'All'} {p ? `(${tasks.filter(t => t.priority === p).length})` : `(${tasks.length})`}
            </button>
          ))}
        </div>

        {/* Kanban Board */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {STATUS_COLUMNS.map((col) => (
              <div key={col.key} className="space-y-3">
                <Skeleton className="h-8 w-32 bg-slate-800" />
                {Array(3).fill(0).map((_, i) => <Skeleton key={i} className="h-40 bg-slate-800" />)}
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {STATUS_COLUMNS.map((col) => {
              const Icon = col.icon;
              const colTasks = filteredTasks.filter((t) => t.status === col.key);
              return (
                <div key={col.key} className="space-y-3">
                  <div className={`flex items-center gap-2 pb-3 border-b border-slate-800`}>
                    <div className={`p-1.5 rounded-lg ${col.bg}`}>
                      <Icon className={`h-3.5 w-3.5 ${col.color}`} />
                    </div>
                    <span className="font-semibold text-sm text-slate-200">{col.label}</span>
                    <span className={`ml-auto text-xs px-2 py-0.5 rounded-full font-bold ${col.bg} ${col.color}`}>{colTasks.length}</span>
                  </div>
                  <div className="space-y-3 min-h-[200px]">
                    {colTasks.map((task) => (
                      <TaskCard key={task.id} task={task} onMove={handleMove} />
                    ))}
                    {colTasks.length === 0 && (
                      <div className="flex items-center justify-center h-32 rounded-xl border-2 border-dashed border-slate-800">
                        <p className="text-xs text-slate-600">No tasks here</p>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* New Task Dialog */}
      <Dialog open={showNew} onOpenChange={setShowNew}>
        <DialogContent className="max-w-md bg-slate-900 border-slate-700">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-slate-100"><Plus className="h-4 w-4" /> New Task</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-300">Title *</label>
              <Input placeholder="e.g., Distribute food packets in Sector 12" value={newTask.title}
                onChange={(e) => setNewTask((p) => ({ ...p, title: e.target.value }))}
                className="bg-slate-800 border-slate-700 text-slate-200 focus:border-indigo-500" />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-300">Description</label>
              <textarea rows={3} placeholder="What needs to be done..." value={newTask.description}
                onChange={(e) => setNewTask((p) => ({ ...p, description: e.target.value }))}
                className="w-full px-3 py-2 rounded-md border border-slate-700 bg-slate-800 text-slate-200 text-sm placeholder:text-slate-500 focus-visible:outline-none focus-visible:border-indigo-500 resize-none" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-300">Location</label>
                <Input placeholder="Delhi, India" value={newTask.location}
                  onChange={(e) => setNewTask((p) => ({ ...p, location: e.target.value }))}
                  className="bg-slate-800 border-slate-700 text-slate-200" />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-300">Volunteers Needed</label>
                <Input type="number" min={1} value={newTask.volunteersNeeded}
                  onChange={(e) => setNewTask((p) => ({ ...p, volunteersNeeded: parseInt(e.target.value) || 1 }))}
                  className="bg-slate-800 border-slate-700 text-slate-200" />
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-300">Deadline</label>
              <Input type="date" value={newTask.deadline}
                onChange={(e) => setNewTask((p) => ({ ...p, deadline: e.target.value }))}
                className="bg-slate-800 border-slate-700 text-slate-200" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNew(false)} className="border-slate-700 text-slate-300">Cancel</Button>
            <Button disabled={!newTask.title || submitting} onClick={handleCreate} className="gap-2 bg-indigo-600 hover:bg-indigo-500">
              {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Zap className="h-4 w-4" />}
              Create Task
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
