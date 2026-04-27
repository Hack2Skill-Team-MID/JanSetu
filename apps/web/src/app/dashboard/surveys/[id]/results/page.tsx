'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import DashboardLayout from '../../../../../components/layout/dashboard-layout';
import { useAuthStore } from '../../../../../store/auth-store';
import { api } from '../../../../../lib/api';
import { BarChart2, Users, ChevronLeft, AlertCircle, CheckCircle, ClipboardList, MessageSquare } from 'lucide-react';

type StatEntry = {
  questionText: string; questionType: string;
  answers: any[]; tally: Record<string, number>;
};

export default function SurveyResultsPage() {
  const { id } = useParams<{ id: string }>();
  const user = useAuthStore((s) => s.user);
  const isManager = user?.role === 'ngo_coordinator' || user?.role === 'admin' || user?.role === 'platform_admin';

  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isManager) return;
    const load = async () => {
      try {
        const res = await api.get(`/surveys/${id}/responses`);
        setData(res.data.data);
      } catch (e: any) { setError(e.response?.data?.error || 'Failed to load results'); }
      finally { setLoading(false); }
    };
    load();
  }, [id, isManager]);

  if (!isManager) return (
    <DashboardLayout>
      <div className="glass-card rounded-2xl p-12 text-center border border-slate-800 max-w-md mx-auto">
        <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-white mb-2">Access Denied</h2>
        <p className="text-slate-400">Only NGO Coordinators and Admins can view survey results.</p>
      </div>
    </DashboardLayout>
  );

  if (loading) return (
    <DashboardLayout>
      <div className="flex items-center justify-center h-64">
        <div className="w-10 h-10 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
      </div>
    </DashboardLayout>
  );

  if (error) return (
    <DashboardLayout>
      <div className="glass-card rounded-2xl p-12 text-center border border-slate-800 max-w-md mx-auto">
        <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-white mb-2">Error</h2>
        <p className="text-slate-400 mb-4">{error}</p>
        <Link href="/dashboard/surveys" className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm">Back to Surveys</Link>
      </div>
    </DashboardLayout>
  );

  const { survey, stats, totalResponses } = data;
  const statEntries: [string, StatEntry][] = Object.entries(stats);

  const getMaxTally = (tally: Record<string, number>) => Math.max(1, ...Object.values(tally));

  const tallyColor = (i: number) => {
    const colors = ['bg-indigo-500', 'bg-violet-500', 'bg-blue-500', 'bg-emerald-500', 'bg-amber-500', 'bg-rose-500'];
    return colors[i % colors.length];
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-4xl mx-auto">
        {/* Back */}
        <Link href="/dashboard/surveys" className="inline-flex items-center gap-1.5 text-sm text-slate-400 hover:text-slate-200 transition-colors">
          <ChevronLeft className="w-4 h-4" /> Back to Surveys
        </Link>

        {/* Header */}
        <div className="glass-card rounded-2xl border border-slate-800 p-6">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-4">
              <span className="text-4xl">{survey.coverEmoji}</span>
              <div>
                <h1 className="text-xl font-bold text-white">{survey.title}</h1>
                <p className="text-slate-400 text-sm mt-0.5">{survey.description}</p>
              </div>
            </div>
            <Link href={`/dashboard/surveys/${id}`}
              className="flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-xl text-sm transition-all">
              <ClipboardList className="w-4 h-4" /> View Survey
            </Link>
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-3 gap-4 mt-6">
            <div className="bg-slate-800/50 rounded-xl p-4 text-center">
              <p className="text-3xl font-bold text-indigo-400">{totalResponses}</p>
              <p className="text-xs text-slate-400 mt-1 flex items-center justify-center gap-1"><Users className="w-3 h-3" />Total Responses</p>
            </div>
            <div className="bg-slate-800/50 rounded-xl p-4 text-center">
              <p className="text-3xl font-bold text-indigo-400">{survey.questions?.length || 0}</p>
              <p className="text-xs text-slate-400 mt-1 flex items-center justify-center gap-1"><ClipboardList className="w-3 h-3" />Questions</p>
            </div>
            <div className="bg-slate-800/50 rounded-xl p-4 text-center">
              <span className={`text-2xl font-bold capitalize ${survey.status === 'published' ? 'text-emerald-400' : 'text-slate-400'}`}>{survey.status}</span>
              <p className="text-xs text-slate-400 mt-1">Status</p>
            </div>
          </div>
        </div>

        {totalResponses === 0 ? (
          <div className="glass-card rounded-2xl border border-slate-800 p-16 text-center">
            <BarChart2 className="w-12 h-12 text-slate-600 mx-auto mb-4" />
            <h3 className="text-slate-300 font-medium mb-1">No responses yet</h3>
            <p className="text-slate-500 text-sm">Share the survey to start collecting data.</p>
          </div>
        ) : (
          <div className="space-y-5">
            {statEntries.map(([qId, stat], idx) => (
              <div key={qId} className="glass-card rounded-2xl border border-slate-800 p-6">
                <div className="flex items-start gap-3 mb-5">
                  <span className="w-7 h-7 rounded-lg bg-indigo-500/20 text-indigo-400 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">{idx + 1}</span>
                  <div>
                    <h3 className="font-semibold text-slate-200">{stat.questionText}</h3>
                    <span className="text-xs text-slate-500 capitalize mt-0.5 inline-block">{stat.questionType.replace('_',' ')} · {stat.answers.length} answer{stat.answers.length !== 1 ? 's' : ''}</span>
                  </div>
                </div>

                {/* Text answers */}
                {stat.questionType === 'text' && (
                  <div className="space-y-2 max-h-56 overflow-y-auto pr-1 custom-scrollbar">
                    {stat.answers.length === 0
                      ? <p className="text-slate-500 text-sm italic">No text answers recorded.</p>
                      : stat.answers.map((ans, i) => (
                        <div key={i} className="bg-slate-800/50 rounded-lg p-3 border border-slate-700/50 text-sm text-slate-300 flex gap-2">
                          <MessageSquare className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
                          {String(ans)}
                        </div>
                      ))}
                  </div>
                )}

                {/* Choice / Yes-No / Rating / Scale — bar chart */}
                {stat.questionType !== 'text' && (
                  <div className="space-y-3">
                    {Object.entries(stat.tally)
                      .sort(([, a], [, b]) => (b as number) - (a as number))
                      .map(([option, count], i) => {
                        const pct = Math.round(((count as number) / getMaxTally(stat.tally)) * 100);
                        const respPct = totalResponses > 0 ? Math.round(((count as number) / totalResponses) * 100) : 0;
                        return (
                          <div key={option}>
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-sm text-slate-300 truncate mr-2">{option}</span>
                              <span className="text-xs text-slate-400 shrink-0">{count as number} ({respPct}%)</span>
                            </div>
                            <div className="w-full h-6 bg-slate-800/60 rounded-lg overflow-hidden">
                              <div
                                className={`h-full ${tallyColor(i)} rounded-lg transition-all duration-700 flex items-center justify-end pr-2`}
                                style={{ width: `${pct}%`, minWidth: pct > 0 ? '2rem' : '0' }}>
                                {pct > 15 && <span className="text-white text-xs font-semibold">{respPct}%</span>}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
