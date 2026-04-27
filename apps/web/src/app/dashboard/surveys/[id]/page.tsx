'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import DashboardLayout from '../../../../components/layout/dashboard-layout';
import { api } from '../../../../lib/api';
import { ClipboardList, ChevronLeft, ChevronRight, CheckCircle, AlertCircle, Users, Clock, Star } from 'lucide-react';

type Question = {
  id: string; questionText: string; questionType: string;
  options: string[]; isRequired: boolean; helperText?: string; order: number;
};
type Survey = {
  id: string; title: string; description: string; coverEmoji: string;
  category: string; status: string; isAnonymous: boolean; deadline?: string;
  createdBy: { name: string }; hasResponded: boolean;
  questions: Question[]; _count: { responses: number };
};

const CAT_COLOR: Record<string, string> = {
  healthcare:'bg-rose-500/20 text-rose-300', education:'bg-blue-500/20 text-blue-300',
  infrastructure:'bg-amber-500/20 text-amber-300', food_security:'bg-orange-500/20 text-orange-300',
  environment:'bg-green-500/20 text-green-300', employment:'bg-violet-500/20 text-violet-300',
  safety:'bg-red-500/20 text-red-300', general:'bg-indigo-500/20 text-indigo-300', other:'bg-slate-500/20 text-slate-300',
};

export default function TakeSurveyPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [survey, setSurvey] = useState<Survey | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [step, setStep] = useState(0); // 0 = intro, 1..n = questions, n+1 = done
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get(`/surveys/${id}`);
        setSurvey(res.data.data);
        if (res.data.data.hasResponded) setSubmitted(true);
      } catch (e: any) {
        setError(e.response?.data?.error || 'Survey not found');
      } finally { setLoading(false); }
    };
    load();
  }, [id]);

  const questions = survey?.questions || [];
  const totalSteps = questions.length;
  const currentQ = step > 0 && step <= totalSteps ? questions[step - 1] : null;
  const progress = step === 0 ? 0 : Math.round((step / totalSteps) * 100);

  const setAnswer = (qId: string, val: any) => setAnswers(a => ({ ...a, [qId]: val }));

  const toggleMulti = (qId: string, option: string) => {
    const current: string[] = answers[qId] || [];
    setAnswers(a => ({ ...a, [qId]: current.includes(option) ? current.filter(x => x !== option) : [...current, option] }));
  };

  const canProceed = () => {
    if (!currentQ) return true;
    if (!currentQ.isRequired) return true;
    const ans = answers[currentQ.id];
    if (ans === undefined || ans === '' || ans === null) return false;
    if (Array.isArray(ans) && ans.length === 0) return false;
    return true;
  };

  const handleSubmit = async () => {
    setSubmitError('');
    // Validate all required
    for (const q of questions) {
      if (q.isRequired) {
        const ans = answers[q.id];
        if (ans === undefined || ans === '' || ans === null || (Array.isArray(ans) && ans.length === 0)) {
          setSubmitError(`Please answer: "${q.questionText}"`);
          setStep(questions.indexOf(q) + 1);
          return;
        }
      }
    }
    setSubmitting(true);
    try {
      await api.post(`/surveys/${id}/responses`, { answers });
      setSubmitted(true);
      setStep(totalSteps + 1);
    } catch (e: any) {
      setSubmitError(e.response?.data?.error || 'Failed to submit. Please try again.');
    } finally { setSubmitting(false); }
  };

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
        <h2 className="text-xl font-bold text-white mb-2">Survey Not Found</h2>
        <p className="text-slate-400 mb-6">{error}</p>
        <Link href="/dashboard/surveys" className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm transition-all">Back to Surveys</Link>
      </div>
    </DashboardLayout>
  );

  // ─── SUCCESS / Already Responded ───
  if (submitted || step > totalSteps) return (
    <DashboardLayout>
      <div className="max-w-xl mx-auto">
        <div className="glass-card rounded-2xl border border-emerald-500/30 p-12 text-center">
          <div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-emerald-500/20">
            <CheckCircle className="w-10 h-10 text-emerald-400" />
          </div>
          <div className="text-4xl mb-4">{survey?.coverEmoji}</div>
          <h2 className="text-2xl font-bold text-white mb-2">{survey?.hasResponded && !step ? 'Already Submitted!' : 'Thank You!'}</h2>
          <p className="text-slate-400 mb-8">
            {survey?.hasResponded && !step
              ? 'You have already submitted a response to this survey.'
              : 'Your response has been recorded. Your feedback helps us make a bigger impact!'}
          </p>
          <div className="flex gap-3 justify-center">
            <Link href="/dashboard/surveys" className="px-5 py-2.5 bg-slate-700 hover:bg-slate-600 text-white rounded-xl text-sm font-medium transition-all">
              Browse Surveys
            </Link>
            <Link href="/dashboard" className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-medium transition-all">
              Go to Dashboard
            </Link>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Back */}
        <Link href="/dashboard/surveys" className="inline-flex items-center gap-1.5 text-sm text-slate-400 hover:text-slate-200 transition-colors">
          <ChevronLeft className="w-4 h-4" /> Back to Surveys
        </Link>

        {/* Progress bar */}
        {step > 0 && (
          <div>
            <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
              <span>Question {step} of {totalSteps}</span>
              <span>{progress}% complete</span>
            </div>
            <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
              <div className="h-full bg-indigo-500 rounded-full transition-all duration-500" style={{ width: `${progress}%` }} />
            </div>
          </div>
        )}

        {/* ─── INTRO STEP ─── */}
        {step === 0 && survey && (
          <div className="glass-card rounded-2xl border border-slate-800 overflow-hidden">
            <div className="bg-gradient-to-br from-indigo-600/20 to-purple-600/20 p-10 text-center border-b border-slate-800">
              <div className="text-6xl mb-5">{survey.coverEmoji}</div>
              <h1 className="text-3xl font-bold text-white mb-3">{survey.title}</h1>
              <p className="text-slate-300 leading-relaxed max-w-md mx-auto">{survey.description}</p>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="bg-slate-800/50 rounded-xl p-3">
                  <ClipboardList className="w-5 h-5 text-indigo-400 mx-auto mb-1" />
                  <p className="text-xs text-slate-400">{totalSteps} Questions</p>
                </div>
                <div className="bg-slate-800/50 rounded-xl p-3">
                  <Users className="w-5 h-5 text-indigo-400 mx-auto mb-1" />
                  <p className="text-xs text-slate-400">{survey._count.responses} Responses</p>
                </div>
                <div className="bg-slate-800/50 rounded-xl p-3">
                  <Clock className="w-5 h-5 text-indigo-400 mx-auto mb-1" />
                  <p className="text-xs text-slate-400">~{Math.ceil(totalSteps * 0.5)} min</p>
                </div>
              </div>
              <div className="flex items-center justify-between text-sm text-slate-400">
                <span>Created by <span className="text-slate-200">{survey.createdBy?.name}</span></span>
                {survey.isAnonymous && <span className="px-2 py-0.5 bg-slate-700 rounded-full text-xs text-slate-300">🔒 Anonymous</span>}
                <span className={`px-2 py-0.5 rounded-full text-xs capitalize ${CAT_COLOR[survey.category]}`}>{survey.category.replace('_',' ')}</span>
              </div>
              {survey.status !== 'published' && (
                <div className="flex gap-2 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 text-sm">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" /> This survey is currently {survey.status} and not accepting responses.
                </div>
              )}
              <button onClick={() => setStep(1)} disabled={survey.status !== 'published'}
                className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold text-lg flex items-center justify-center gap-2 transition-all shadow-[0_0_20px_rgba(79,70,229,0.3)]">
                Start Survey <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}

        {/* ─── QUESTION STEP ─── */}
        {step > 0 && step <= totalSteps && currentQ && (
          <div className="glass-card rounded-2xl border border-slate-800 p-8">
            <div className="mb-6">
              <span className="text-xs font-semibold text-indigo-400 uppercase tracking-wider">Question {step}</span>
              <h2 className="text-xl font-bold text-white mt-2 leading-snug">{currentQ.questionText}
                {currentQ.isRequired && <span className="text-red-400 ml-1">*</span>}
              </h2>
              {currentQ.helperText && <p className="text-slate-400 text-sm mt-1">{currentQ.helperText}</p>}
            </div>

            {/* Text */}
            {currentQ.questionType === 'text' && (
              <textarea value={answers[currentQ.id] || ''} onChange={e => setAnswer(currentQ.id, e.target.value)}
                rows={4} placeholder="Type your answer here..."
                className="w-full bg-slate-800/60 border border-slate-700/50 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 resize-none transition-colors" />
            )}

            {/* Yes/No */}
            {currentQ.questionType === 'yes_no' && (
              <div className="flex gap-3">
                {['Yes', 'No'].map(opt => (
                  <button key={opt} onClick={() => setAnswer(currentQ.id, opt)}
                    className={`flex-1 py-4 rounded-xl text-lg font-semibold transition-all border-2 ${answers[currentQ.id] === opt ? 'border-indigo-500 bg-indigo-500/20 text-indigo-300' : 'border-slate-700 bg-slate-800/50 text-slate-300 hover:border-slate-600'}`}>
                    {opt === 'Yes' ? '✅ Yes' : '❌ No'}
                  </button>
                ))}
              </div>
            )}

            {/* Single Choice */}
            {currentQ.questionType === 'single_choice' && (
              <div className="space-y-2">
                {currentQ.options.map(opt => (
                  <button key={opt} onClick={() => setAnswer(currentQ.id, opt)}
                    className={`w-full text-left px-4 py-3 rounded-xl border-2 transition-all ${answers[currentQ.id] === opt ? 'border-indigo-500 bg-indigo-500/10 text-indigo-300' : 'border-slate-700 bg-slate-800/30 text-slate-300 hover:border-slate-600'}`}>
                    <span className={`inline-block w-4 h-4 rounded-full border-2 mr-3 transition-all ${answers[currentQ.id] === opt ? 'border-indigo-500 bg-indigo-500' : 'border-slate-500'}`} />
                    {opt}
                  </button>
                ))}
              </div>
            )}

            {/* Multiple Choice */}
            {currentQ.questionType === 'multiple_choice' && (
              <div className="space-y-2">
                <p className="text-xs text-slate-500 mb-3">Select all that apply</p>
                {currentQ.options.map(opt => {
                  const checked = (answers[currentQ.id] || []).includes(opt);
                  return (
                    <button key={opt} onClick={() => toggleMulti(currentQ.id, opt)}
                      className={`w-full text-left px-4 py-3 rounded-xl border-2 transition-all ${checked ? 'border-indigo-500 bg-indigo-500/10 text-indigo-300' : 'border-slate-700 bg-slate-800/30 text-slate-300 hover:border-slate-600'}`}>
                      <span className={`inline-block w-4 h-4 rounded border-2 mr-3 transition-all ${checked ? 'border-indigo-500 bg-indigo-500' : 'border-slate-500'}`} />
                      {opt}
                    </button>
                  );
                })}
              </div>
            )}

            {/* Rating 1-5 */}
            {currentQ.questionType === 'rating' && (
              <div className="flex gap-3 justify-center">
                {[1,2,3,4,5].map(n => (
                  <button key={n} onClick={() => setAnswer(currentQ.id, n)}
                    className={`w-14 h-14 rounded-xl text-2xl transition-all border-2 ${answers[currentQ.id] === n ? 'border-yellow-400 bg-yellow-400/10 scale-110' : 'border-slate-700 bg-slate-800/30 hover:border-slate-500'}`}>
                    <Star className={`w-6 h-6 mx-auto ${answers[currentQ.id] >= n ? 'text-yellow-400 fill-yellow-400' : 'text-slate-500'}`} />
                  </button>
                ))}
              </div>
            )}

            {/* Scale 1-10 */}
            {currentQ.questionType === 'scale' && (
              <div>
                <div className="flex gap-2 flex-wrap justify-center mb-2">
                  {[1,2,3,4,5,6,7,8,9,10].map(n => (
                    <button key={n} onClick={() => setAnswer(currentQ.id, n)}
                      className={`w-12 h-12 rounded-xl font-bold text-sm transition-all border-2 ${answers[currentQ.id] === n ? 'border-indigo-500 bg-indigo-500/20 text-indigo-300 scale-110' : 'border-slate-700 bg-slate-800/30 text-slate-300 hover:border-slate-500'}`}>
                      {n}
                    </button>
                  ))}
                </div>
                <div className="flex justify-between text-xs text-slate-500 mt-1 px-1">
                  <span>Not at all</span><span>Extremely</span>
                </div>
              </div>
            )}

            {submitError && (
              <div className="mt-4 flex gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />{submitError}
              </div>
            )}

            {/* Navigation */}
            <div className="flex gap-3 mt-8">
              <button onClick={() => setStep(s => s - 1)}
                className="flex items-center gap-2 px-5 py-2.5 bg-slate-700 hover:bg-slate-600 text-white rounded-xl text-sm font-medium transition-all">
                <ChevronLeft className="w-4 h-4" /> Back
              </button>
              {step < totalSteps ? (
                <button onClick={() => setStep(s => s + 1)} disabled={!canProceed()}
                  className="flex-1 flex items-center justify-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white rounded-xl text-sm font-medium transition-all">
                  Next <ChevronRight className="w-4 h-4" />
                </button>
              ) : (
                <button onClick={handleSubmit} disabled={submitting || !canProceed()}
                  className="flex-1 flex items-center justify-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white rounded-xl text-sm font-medium transition-all shadow-[0_0_15px_rgba(16,185,129,0.3)]">
                  {submitting ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Submitting...</> : <><CheckCircle className="w-4 h-4" />Submit Response</>}
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
