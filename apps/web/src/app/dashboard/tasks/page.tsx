'use client';

import { useEffect, useState } from 'react';
import DashboardLayout from '../../../components/layout/dashboard-layout';
import { api } from '../../../lib/api';
import { useToast } from '../../../components/ui/toast';
import { Briefcase, MapPin, Clock, Users, CheckCircle, XCircle, ChevronRight } from 'lucide-react';

const STATUS_STYLES: Record<string, string> = {
  open: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  in_progress: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  completed: 'bg-slate-500/20 text-slate-400 border-slate-500/30',
  cancelled: 'bg-red-500/20 text-red-400 border-red-500/30',
};

export default function TasksPage() {
  const [tasks, setTasks] = useState<any[]>([]);
  const [applying, setApplying] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [successId, setSuccessId] = useState<string | null>(null);
  const [errorId, setErrorId] = useState<string | null>(null);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await api.get('/tasks?status=open&limit=20');
        if (res.data.success) setTasks(res.data.data.tasks || res.data.data);
      } catch (e) { console.error(e); }
      finally { setIsLoading(false); }
    };
    fetch();
  }, []);

  const { success, error } = useToast();

  const handleApply = async (taskId: string) => {
    setApplying(taskId);
    setErrorId(null);
    try {
      await api.post(`/tasks/${taskId}/apply`);
      setSuccessId(taskId);
      setTasks(prev => prev.map(t => t._id === taskId ? { ...t, _applied: true } : t));
      success('Successfully applied to task!');
    } catch (e: any) {
      setErrorId(taskId);
      error(e.response?.data?.error || 'Failed to apply to task.');
      console.error(e);
    } finally {
      setApplying(null);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">Open Tasks</h1>
          <p className="text-slate-400 mt-1">Tasks available for volunteers to apply to</p>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : tasks.length === 0 ? (
          <div className="glass-card rounded-2xl p-16 text-center border border-slate-800">
            <Briefcase className="w-12 h-12 text-slate-600 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-slate-300">No open tasks right now</h3>
            <p className="text-slate-500 mt-2">Check back soon for new volunteer opportunities.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {tasks.map((task) => (
              <div key={task._id} className="glass-card rounded-2xl p-5 border border-slate-800 hover:border-indigo-500/30 transition-all group">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      <span className={`px-2.5 py-1 text-xs font-semibold rounded-lg border capitalize ${STATUS_STYLES[task.status]}`}>
                        {task.status.replace('_', ' ')}
                      </span>
                      <span className="text-xs text-slate-500">
                        {task.volunteersAssigned}/{task.volunteersNeeded} volunteers
                      </span>
                    </div>

                    <h3 className="text-base font-semibold text-slate-200 mb-2">{task.title}</h3>
                    <p className="text-sm text-slate-400 line-clamp-2 mb-3">{task.description}</p>

                    <div className="flex flex-wrap gap-4 text-xs text-slate-400 mb-3">
                      <span className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5 text-slate-500" />{task.location}</span>
                      <span className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-slate-500" />
                        Deadline: {new Date(task.deadline).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </span>
                    </div>

                    {task.requiredSkills?.length > 0 && (
                      <div className="flex flex-wrap gap-1.5">
                        {task.requiredSkills.map((skill: string) => (
                          <span key={skill} className="px-2 py-0.5 text-xs rounded-md bg-slate-700/50 text-slate-300 border border-slate-600/50">
                            {skill}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col items-end gap-2 shrink-0">
                    {task._applied || successId === task._id ? (
                      <div className="flex items-center gap-1.5 text-emerald-400 text-sm font-medium">
                        <CheckCircle className="w-4 h-4" /> Applied!
                      </div>
                    ) : (
                      <button
                        onClick={() => handleApply(task._id)}
                        disabled={applying === task._id}
                        className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium transition-all disabled:opacity-60 flex items-center gap-2"
                      >
                        {applying === task._id ? (
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        ) : (
                          <>Apply <ChevronRight className="w-4 h-4" /></>
                        )}
                      </button>
                    )}
                    {errorId === task._id && (
                      <span className="text-xs text-red-400 flex items-center gap-1">
                        <XCircle className="w-3.5 h-3.5" /> Already applied or error
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
