'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import DashboardLayout from '../../../components/layout/dashboard-layout';
import { useAuthStore } from '../../../store/auth-store';
import { api } from '../../../lib/api';
import {
  ClipboardList, Plus, ChevronRight, CheckCircle, Clock, Users,
  AlertCircle, Trash2, Eye, BarChart2, X, GripVertical, Star
} from 'lucide-react';

const CATEGORIES = ['general','healthcare','education','infrastructure','food_security','environment','employment','safety','other'];
const Q_TYPES = [
  { value: 'text', label: 'Short Answer' },
  { value: 'single_choice', label: 'Single Choice' },
  { value: 'multiple_choice', label: 'Multiple Choice' },
  { value: 'rating', label: 'Rating (1–5)' },
  { value: 'scale', label: 'Scale (1–10)' },
  { value: 'yes_no', label: 'Yes / No' },
];

const STATUS_COLOR: Record<string, string> = {
  draft: 'bg-slate-500/20 text-slate-400 border-slate-500/30',
  published: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  closed: 'bg-red-500/20 text-red-400 border-red-500/30',
};

const CAT_COLOR: Record<string, string> = {
  healthcare: 'bg-rose-500/20 text-rose-300',
  education: 'bg-blue-500/20 text-blue-300',
  infrastructure: 'bg-amber-500/20 text-amber-300',
  food_security: 'bg-orange-500/20 text-orange-300',
  environment: 'bg-green-500/20 text-green-300',
  employment: 'bg-violet-500/20 text-violet-300',
  safety: 'bg-red-500/20 text-red-300',
  general: 'bg-indigo-500/20 text-indigo-300',
  other: 'bg-slate-500/20 text-slate-300',
};

type Survey = {
  id: string; title: string; description: string; coverEmoji: string;
  category: string; status: string; targetAudience: string; isAnonymous: boolean;
  deadline?: string; createdAt: string; hasResponded: boolean;
  createdBy: { name: string };
  _count: { questions: number; responses: number };
};

type Question = { id: string; questionText: string; questionType: string; options: string[]; isRequired: boolean; helperText?: string };

export default function SurveysPage() {
  const user = useAuthStore((s) => s.user);
  const isManager = user?.role === 'ngo_coordinator' || user?.role === 'admin' || user?.role === 'platform_admin';

  const [tab, setTab] = useState<'browse' | 'create' | 'mine'>('browse');
  const [surveys, setSurveys] = useState<Survey[]>([]);
  const [myResponses, setMyResponses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Create form state
  const [form, setForm] = useState({ title: '', description: '', coverEmoji: '📋', category: 'general', status: 'published', targetAudience: 'all', isAnonymous: false, deadline: '' });
  const [questions, setQuestions] = useState<{ questionText: string; questionType: string; options: string[]; isRequired: boolean; helperText: string }[]>([
    { questionText: '', questionType: 'text', options: [], isRequired: true, helperText: '' }
  ]);
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState('');
  const [createSuccess, setCreateSuccess] = useState('');

  const fetchSurveys = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get('/surveys');
      setSurveys(res.data.data || []);
    } catch { setSurveys([]); } finally { setLoading(false); }
  }, []);

  const fetchMyResponses = useCallback(async () => {
    try {
      const res = await api.get('/surveys/my-responses');
      setMyResponses(res.data.data || []);
    } catch { setMyResponses([]); }
  }, []);

  useEffect(() => { fetchSurveys(); fetchMyResponses(); }, [fetchSurveys, fetchMyResponses]);

  // Question helpers
  const addQuestion = () => setQuestions(q => [...q, { questionText: '', questionType: 'text', options: [], isRequired: true, helperText: '' }]);
  const removeQuestion = (i: number) => setQuestions(q => q.filter((_, idx) => idx !== i));
  const updateQuestion = (i: number, key: string, val: any) => setQuestions(q => q.map((item, idx) => idx === i ? { ...item, [key]: val } : item));
  const addOption = (i: number) => setQuestions(q => q.map((item, idx) => idx === i ? { ...item, options: [...item.options, ''] } : item));
  const updateOption = (qi: number, oi: number, val: string) => setQuestions(q => q.map((item, idx) => idx === qi ? { ...item, options: item.options.map((o, j) => j === oi ? val : o) } : item));
  const removeOption = (qi: number, oi: number) => setQuestions(q => q.map((item, idx) => idx === qi ? { ...item, options: item.options.filter((_, j) => j !== oi) } : item));

  const handleCreate = async () => {
    setCreateError(''); setCreateSuccess('');
    if (!form.title.trim()) { setCreateError('Title is required'); return; }
    if (!form.description.trim()) { setCreateError('Description is required'); return; }
    if (questions.some(q => !q.questionText.trim())) { setCreateError('All questions must have text'); return; }
    setCreating(true);
    try {
      await api.post('/surveys', { ...form, questions });
      setCreateSuccess('Survey created successfully!');
      setForm({ title: '', description: '', coverEmoji: '📋', category: 'general', status: 'published', targetAudience: 'all', isAnonymous: false, deadline: '' });
      setQuestions([{ questionText: '', questionType: 'text', options: [], isRequired: true, helperText: '' }]);
      fetchSurveys();
      setTimeout(() => { setTab('browse'); setCreateSuccess(''); }, 1500);
    } catch (e: any) { setCreateError(e.response?.data?.error || 'Failed to create survey'); }
    finally { setCreating(false); }
  };

  const needsChoices = (type: string) => type === 'single_choice' || type === 'multiple_choice';

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-3">
              <ClipboardList className="w-7 h-7 text-indigo-400" />
              Community Surveys
              <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">{surveys.length} active</span>
            </h1>
            <p className="text-slate-400 mt-1 text-sm">Share your feedback. Every voice shapes our community impact.</p>
          </div>
          {isManager && (
            <button onClick={() => setTab('create')} className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-medium transition-all shadow-[0_0_15px_rgba(79,70,229,0.3)]">
              <Plus className="w-4 h-4" /> Create Survey
            </button>
          )}
        </div>

        {/* Tabs */}
        <div className="flex gap-1 p-1 bg-slate-800/60 rounded-xl w-fit border border-slate-700/50">
          {(['browse', ...(isManager ? ['create'] : []), 'mine'] as const).map(t => (
            <button key={t} onClick={() => setTab(t as any)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all capitalize ${tab === t ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'}`}>
              {t === 'mine' ? 'My Responses' : t === 'create' ? '+ Create' : 'Browse'}
            </button>
          ))}
        </div>

        {/* ─── BROWSE TAB ─── */}
        {tab === 'browse' && (
          <div>
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[...Array(6)].map((_, i) => <div key={i} className="glass-card rounded-2xl p-6 h-52 animate-pulse bg-slate-800/40" />)}
              </div>
            ) : surveys.length === 0 ? (
              <div className="glass-card rounded-2xl p-16 text-center border border-slate-800">
                <ClipboardList className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                <h3 className="text-slate-300 font-medium mb-1">No surveys available</h3>
                <p className="text-slate-500 text-sm">Check back later or ask your NGO coordinator to create one.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {surveys.map(s => (
                  <div key={s.id} className="glass-card rounded-2xl border border-slate-800 hover:border-indigo-500/40 transition-all flex flex-col overflow-hidden group">
                    <div className="p-6 flex-1">
                      <div className="flex items-start justify-between mb-3">
                        <span className="text-3xl">{s.coverEmoji}</span>
                        <div className="flex gap-2 flex-wrap justify-end">
                          <span className={`px-2 py-0.5 text-xs font-semibold rounded-full border ${STATUS_COLOR[s.status]}`}>{s.status}</span>
                          {s.hasResponded && <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1"><CheckCircle className="w-3 h-3" />Done</span>}
                        </div>
                      </div>
                      <h3 className="font-semibold text-slate-100 mb-1 line-clamp-2">{s.title}</h3>
                      <p className="text-slate-400 text-sm line-clamp-2 mb-3">{s.description}</p>
                      <div className="flex items-center gap-3 text-xs text-slate-500 flex-wrap">
                        <span className={`px-2 py-0.5 rounded-full capitalize ${CAT_COLOR[s.category] || CAT_COLOR.general}`}>{s.category.replace('_',' ')}</span>
                        <span className="flex items-center gap-1"><Users className="w-3 h-3" />{s._count.responses} responses</span>
                        <span className="flex items-center gap-1"><ClipboardList className="w-3 h-3" />{s._count.questions} questions</span>
                      </div>
                    </div>
                    <div className="border-t border-slate-800 px-6 py-3 flex items-center justify-between">
                      <span className="text-xs text-slate-500">By {s.createdBy?.name}</span>
                      <div className="flex gap-2">
                        {isManager && (
                          <Link href={`/dashboard/surveys/${s.id}/results`}
                            className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-700/50 hover:bg-slate-700 text-slate-300 text-xs transition-colors">
                            <BarChart2 className="w-3.5 h-3.5" /> Results
                          </Link>
                        )}
                        <Link href={`/dashboard/surveys/${s.id}`}
                          className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs transition-colors ${s.hasResponded ? 'bg-slate-700/50 hover:bg-slate-700 text-slate-300' : 'bg-indigo-600 hover:bg-indigo-500 text-white'}`}>
                          {s.hasResponded ? <><Eye className="w-3.5 h-3.5" /> View</> : <><ChevronRight className="w-3.5 h-3.5" /> Take Survey</>}
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ─── CREATE TAB ─── */}
        {tab === 'create' && isManager && (
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            {/* Form */}
            <div className="lg:col-span-3 space-y-4">
              <div className="glass-card rounded-2xl border border-slate-800 p-6 space-y-4">
                <h2 className="font-semibold text-slate-200 text-lg">Survey Details</h2>
                <div className="grid grid-cols-4 gap-3">
                  <div>
                    <label className="text-xs text-slate-400 mb-1 block">Emoji</label>
                    <input value={form.coverEmoji} onChange={e => setForm(f => ({...f, coverEmoji: e.target.value}))}
                      className="w-full bg-slate-800/60 border border-slate-700/50 rounded-lg px-3 py-2 text-white text-center text-xl focus:outline-none focus:border-indigo-500" maxLength={2} />
                  </div>
                  <div className="col-span-3">
                    <label className="text-xs text-slate-400 mb-1 block">Title *</label>
                    <input value={form.title} onChange={e => setForm(f => ({...f, title: e.target.value}))} placeholder="Survey title..."
                      className="w-full bg-slate-800/60 border border-slate-700/50 rounded-lg px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500" />
                  </div>
                </div>
                <div>
                  <label className="text-xs text-slate-400 mb-1 block">Description *</label>
                  <textarea value={form.description} onChange={e => setForm(f => ({...f, description: e.target.value}))} rows={3} placeholder="What is this survey about?"
                    className="w-full bg-slate-800/60 border border-slate-700/50 rounded-lg px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 resize-none" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-slate-400 mb-1 block">Category</label>
                    <select value={form.category} onChange={e => setForm(f => ({...f, category: e.target.value}))}
                      className="w-full bg-slate-800/60 border border-slate-700/50 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-indigo-500 capitalize">
                      {CATEGORIES.map(c => <option key={c} value={c}>{c.replace('_',' ')}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs text-slate-400 mb-1 block">Status</label>
                    <select value={form.status} onChange={e => setForm(f => ({...f, status: e.target.value}))}
                      className="w-full bg-slate-800/60 border border-slate-700/50 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-indigo-500">
                      <option value="draft">Draft</option>
                      <option value="published">Published</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs text-slate-400 mb-1 block">Target Audience</label>
                    <select value={form.targetAudience} onChange={e => setForm(f => ({...f, targetAudience: e.target.value}))}
                      className="w-full bg-slate-800/60 border border-slate-700/50 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-indigo-500">
                      <option value="all">All Users</option>
                      <option value="volunteer">Volunteers</option>
                      <option value="donor">Donors</option>
                      <option value="community">Community</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs text-slate-400 mb-1 block">Deadline (optional)</label>
                    <input type="date" value={form.deadline} onChange={e => setForm(f => ({...f, deadline: e.target.value}))}
                      className="w-full bg-slate-800/60 border border-slate-700/50 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-indigo-500" />
                  </div>
                </div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={form.isAnonymous} onChange={e => setForm(f => ({...f, isAnonymous: e.target.checked}))} className="w-4 h-4 accent-indigo-500" />
                  <span className="text-sm text-slate-300">Anonymous responses</span>
                </label>
              </div>

              {/* Questions */}
              <div className="glass-card rounded-2xl border border-slate-800 p-6 space-y-4">
                <h2 className="font-semibold text-slate-200 text-lg">Questions</h2>
                {questions.map((q, qi) => (
                  <div key={qi} className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50 space-y-3">
                    <div className="flex items-start gap-2">
                      <GripVertical className="w-4 h-4 text-slate-600 mt-2.5 shrink-0" />
                      <div className="flex-1 space-y-3">
                        <div className="flex gap-2">
                          <input value={q.questionText} onChange={e => updateQuestion(qi, 'questionText', e.target.value)} placeholder={`Question ${qi + 1}...`}
                            className="flex-1 bg-slate-900/60 border border-slate-600/50 rounded-lg px-3 py-2 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-indigo-500" />
                          <select value={q.questionType} onChange={e => updateQuestion(qi, 'questionType', e.target.value)}
                            className="bg-slate-900/60 border border-slate-600/50 rounded-lg px-2 py-2 text-white text-sm focus:outline-none focus:border-indigo-500">
                            {Q_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                          </select>
                        </div>
                        {needsChoices(q.questionType) && (
                          <div className="space-y-2">
                            {q.options.map((opt, oi) => (
                              <div key={oi} className="flex gap-2">
                                <input value={opt} onChange={e => updateOption(qi, oi, e.target.value)} placeholder={`Option ${oi + 1}`}
                                  className="flex-1 bg-slate-900/60 border border-slate-600/50 rounded-lg px-3 py-1.5 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-indigo-500" />
                                <button onClick={() => removeOption(qi, oi)} className="p-1.5 text-slate-500 hover:text-red-400 transition-colors"><X className="w-3.5 h-3.5" /></button>
                              </div>
                            ))}
                            <button onClick={() => addOption(qi)} className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1 transition-colors">
                              <Plus className="w-3 h-3" /> Add option
                            </button>
                          </div>
                        )}
                        <div className="flex items-center justify-between">
                          <label className="flex items-center gap-1.5 cursor-pointer">
                            <input type="checkbox" checked={q.isRequired} onChange={e => updateQuestion(qi, 'isRequired', e.target.checked)} className="accent-indigo-500 w-3.5 h-3.5" />
                            <span className="text-xs text-slate-400">Required</span>
                          </label>
                          {questions.length > 1 && (
                            <button onClick={() => removeQuestion(qi)} className="text-xs text-slate-500 hover:text-red-400 flex items-center gap-1 transition-colors">
                              <Trash2 className="w-3 h-3" /> Remove
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                <button onClick={addQuestion} className="w-full py-2.5 rounded-xl border-2 border-dashed border-slate-700 text-slate-400 hover:border-indigo-500/50 hover:text-indigo-400 text-sm flex items-center justify-center gap-2 transition-colors">
                  <Plus className="w-4 h-4" /> Add Question
                </button>
              </div>

              {createError && <div className="flex gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm"><AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />{createError}</div>}
              {createSuccess && <div className="flex gap-2 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm"><CheckCircle className="w-4 h-4 shrink-0 mt-0.5" />{createSuccess}</div>}

              <button onClick={handleCreate} disabled={creating}
                className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-medium flex items-center justify-center gap-2 transition-all shadow-[0_0_15px_rgba(79,70,229,0.3)]">
                {creating ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Creating...</> : <><ClipboardList className="w-4 h-4" />Publish Survey</>}
              </button>
            </div>

            {/* Preview Card */}
            <div className="lg:col-span-2">
              <div className="sticky top-24">
                <div className="glass-card rounded-2xl border border-slate-800 p-6">
                  <h3 className="text-sm font-medium text-slate-400 mb-4">Live Preview</h3>
                  <div className="text-3xl mb-3">{form.coverEmoji || '📋'}</div>
                  <h4 className="font-bold text-slate-100 text-lg mb-1">{form.title || 'Survey Title'}</h4>
                  <p className="text-slate-400 text-sm mb-4">{form.description || 'Survey description...'}</p>
                  <div className="flex flex-wrap gap-2 text-xs">
                    <span className={`px-2 py-0.5 rounded-full capitalize ${CAT_COLOR[form.category]}`}>{form.category.replace('_',' ')}</span>
                    <span className={`px-2 py-0.5 rounded-full border ${STATUS_COLOR[form.status]}`}>{form.status}</span>
                    <span className="px-2 py-0.5 rounded-full bg-slate-700 text-slate-300">{questions.length} question{questions.length !== 1 ? 's' : ''}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ─── MY RESPONSES TAB ─── */}
        {tab === 'mine' && (
          <div>
            {myResponses.length === 0 ? (
              <div className="glass-card rounded-2xl p-16 text-center border border-slate-800">
                <Star className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                <h3 className="text-slate-300 font-medium mb-1">No responses yet</h3>
                <p className="text-slate-500 text-sm">Head to Browse to take a survey!</p>
                <button onClick={() => setTab('browse')} className="mt-4 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm transition-all">Browse Surveys</button>
              </div>
            ) : (
              <div className="space-y-3">
                {myResponses.map((r: any) => (
                  <div key={r.id} className="glass-card rounded-xl border border-slate-800 p-5 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <span className="text-2xl">{r.survey?.coverEmoji}</span>
                      <div>
                        <h4 className="font-medium text-slate-200">{r.survey?.title}</h4>
                        <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1">
                          <Clock className="w-3 h-3" /> Submitted {new Date(r.submittedAt).toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'numeric' })}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 text-xs rounded-full capitalize ${CAT_COLOR[r.survey?.category] || CAT_COLOR.general}`}>{r.survey?.category?.replace('_',' ')}</span>
                      <Link href={`/dashboard/surveys/${r.survey?.id}`} className="flex items-center gap-1 px-3 py-1.5 bg-slate-700/50 hover:bg-slate-700 text-slate-300 rounded-lg text-xs transition-colors">
                        <Eye className="w-3.5 h-3.5" /> View Survey
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
