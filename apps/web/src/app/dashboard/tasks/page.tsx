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
import { Plus, Filter, MapPin, Users, CalendarDays, Loader2, CheckCircle2, Clock, CircleDot, Zap, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

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

const STATUS_COLUMNS: { key: Status; label: string; icon: any; color: string }[] = [
  { key: 'open', label: 'To Do', icon: CircleDot, color: 'text-muted-foreground' },
  { key: 'in_progress', label: 'In Progress', icon: Clock, color: 'text-accent' },
  { key: 'completed', label: 'Completed', icon: CheckCircle2, color: 'text-secondary' },
];

const PRIORITY_COLORS: Record<string, string> = {
  critical: 'destructive',
  high: 'warning',
  medium: 'secondary',
  low: 'outline',
};

function TaskCard({ task, onMove }: { task: Task; onMove: (id: string, status: Status) => void }) {
  const skill = task.requiredSkills?.[0];
  const deadline = task.deadline ? new Date(task.deadline).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) : '';

  return (
    <div className="bg-card border border-border rounded-xl p-4 space-y-3 hover:shadow-md transition-shadow">
      {task.priority && (
        <Badge variant={(PRIORITY_COLORS[task.priority] as any) || 'outline'} className="capitalize text-[10px]">
          {task.priority}
        </Badge>
      )}
      <p className="font-medium text-sm text-foreground leading-snug">{task.title}</p>
      {task.description && (
        <p className="text-xs text-muted-foreground line-clamp-2">{task.description}</p>
      )}
      <div className="space-y-1.5 text-xs text-muted-foreground">
        {task.location && (
          <div className="flex items-center gap-1.5"><MapPin className="h-3 w-3 flex-shrink-0" />{task.location}</div>
        )}
        {deadline && (
          <div className="flex items-center gap-1.5"><CalendarDays className="h-3 w-3 flex-shrink-0" />Due {deadline}</div>
        )}
        <div className="flex items-center gap-1.5">
          <Users className="h-3 w-3 flex-shrink-0" />
          {task.volunteersAssigned}/{task.volunteersNeeded} volunteers
        </div>
      </div>
      {skill && (
        <Badge variant="outline" className="text-[10px]">{skill}</Badge>
      )}
      {/* Quick actions */}
      <div className="flex gap-1.5 pt-1">
        {task.status !== 'in_progress' && task.status !== 'completed' && (
          <Button size="sm" variant="outline" className="h-7 text-xs flex-1" onClick={() => onMove(task.id, 'in_progress')}>
            Start
          </Button>
        )}
        {task.status === 'in_progress' && (
          <Button size="sm" variant="outline" className="h-7 text-xs flex-1 text-secondary border-secondary/30 hover:bg-secondary/10" onClick={() => onMove(task.id, 'completed')}>
            Complete
          </Button>
        )}
      </div>
    </div>
  );
}

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNew, setShowNew] = useState(false);
  const [newTask, setNewTask] = useState({ title: '', description: '', location: '', deadline: '', volunteersNeeded: 1 });
  const [submitting, setSubmitting] = useState(false);
  const [filterPriority, setFilterPriority] = useState<string | null>(null);

  useEffect(() => {
    api.get('/tasks').then((res) => {
      if (res.data.success) setTasks(res.data.data?.tasks || res.data.data || []);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const handleMove = async (id: string, status: Status) => {
    setTasks((prev) => prev.map((t) => t.id === id ? { ...t, status } : t));
    try { await api.patch(`/tasks/${id}`, { status }); } catch { /* revert on error */ }
  };

  const handleCreate = async () => {
    setSubmitting(true);
    try {
      const res = await api.post('/tasks', {
        ...newTask,
        deadline: newTask.deadline || new Date(Date.now() + 7 * 86400000).toISOString(),
        status: 'open',
      });
      if (res.data.success) {
        setTasks((prev) => [res.data.data, ...prev]);
        setShowNew(false);
        setNewTask({ title: '', description: '', location: '', deadline: '', volunteersNeeded: 1 });
      }
    } catch { /* ignore */ } finally { setSubmitting(false); }
  };

  const filteredTasks = filterPriority ? tasks.filter((t) => t.priority === filterPriority) : tasks;

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Task Management</h1>
            <p className="text-muted-foreground mt-1">Manage and track all relief tasks across campaigns</p>
          </div>
          <Button className="gap-2 w-fit" onClick={() => setShowNew(true)}>
            <Plus className="h-4 w-4" /> New Task
          </Button>
        </div>

        {/* Priority Filter */}
        <div className="flex gap-2 flex-wrap">
          {[null, 'critical', 'high', 'medium', 'low'].map((p) => (
            <Button
              key={p || 'all'}
              size="sm"
              variant={filterPriority === p ? 'default' : 'outline'}
              onClick={() => setFilterPriority(p)}
              className="capitalize h-8 text-xs"
            >
              {p || 'All'}
            </Button>
          ))}
        </div>

        {/* Kanban Board */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {STATUS_COLUMNS.map((col) => (
              <div key={col.key} className="space-y-3">
                <Skeleton className="h-8 w-32" />
                {Array(3).fill(0).map((_, i) => <Skeleton key={i} className="h-40" />)}
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
                  <div className="flex items-center gap-2 pb-2 border-b border-border">
                    <Icon className={cn('h-4 w-4', col.color)} />
                    <span className="font-semibold text-sm text-foreground">{col.label}</span>
                    <Badge variant="outline" className="ml-auto text-xs">{colTasks.length}</Badge>
                  </div>
                  <div className="space-y-3 min-h-[200px]">
                    {colTasks.map((task) => (
                      <TaskCard key={task.id} task={task} onMove={handleMove} />
                    ))}
                    {colTasks.length === 0 && (
                      <div className="flex items-center justify-center h-32 rounded-xl border-2 border-dashed border-border">
                        <p className="text-xs text-muted-foreground">No tasks here</p>
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
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><Plus className="h-4 w-4" /> New Task</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">Title *</label>
              <Input placeholder="e.g., Distribute food packets in Sector 12" value={newTask.title} onChange={(e) => setNewTask((p) => ({ ...p, title: e.target.value }))} />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">Description</label>
              <textarea rows={3} placeholder="What needs to be done..." value={newTask.description} onChange={(e) => setNewTask((p) => ({ ...p, description: e.target.value }))}
                className="w-full px-3 py-2 rounded-md border border-input bg-transparent text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring resize-none" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground">Location</label>
                <Input placeholder="Delhi, India" value={newTask.location} onChange={(e) => setNewTask((p) => ({ ...p, location: e.target.value }))} />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground">Volunteers Needed</label>
                <Input type="number" min={1} value={newTask.volunteersNeeded} onChange={(e) => setNewTask((p) => ({ ...p, volunteersNeeded: parseInt(e.target.value) || 1 }))} />
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">Deadline</label>
              <Input type="date" value={newTask.deadline} onChange={(e) => setNewTask((p) => ({ ...p, deadline: e.target.value }))} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNew(false)}>Cancel</Button>
            <Button disabled={!newTask.title || submitting} onClick={handleCreate} className="gap-2">
              {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Zap className="h-4 w-4" />}
              Create Task
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
