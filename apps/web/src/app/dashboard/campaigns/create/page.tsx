'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '../../../lib/api';
import DashboardLayout from '../../../components/layout/dashboard-layout';
import {
  Target, MapPin, Calendar, Users, IndianRupee,
  Plus, Sparkles, X, ChevronRight, Check
} from 'lucide-react';

const CATEGORIES = [
  { value: 'water', label: 'Water & Sanitation', icon: '💧' },
  { value: 'healthcare', label: 'Healthcare', icon: '🏥' },
  { value: 'education', label: 'Education', icon: '📚' },
  { value: 'food_security', label: 'Food Security', icon: '🍚' },
  { value: 'employment', label: 'Employment', icon: '💼' },
  { value: 'infrastructure', label: 'Infrastructure', icon: '🏗️' },
  { value: 'environment', label: 'Environment', icon: '🌱' },
  { value: 'safety', label: 'Safety', icon: '🛡️' },
];

export default function CreateCampaignPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    title: '',
    description: '',
    category: 'water',
    location: '',
    region: '',
    visibility: 'public',
    startDate: new Date().toISOString().split('T')[0],
    endDate: '',
    volunteersNeeded: 10,
    fundingGoal: 0,
    peopleToHelp: 0,
    milestones: [{ title: '', targetDate: '' }],
  });

  const updateField = (field: string, value: any) => setForm((p) => ({ ...p, [field]: value }));

  const addMilestone = () => {
    setForm((p) => ({ ...p, milestones: [...p.milestones, { title: '', targetDate: '' }] }));
  };

  const updateMilestone = (idx: number, field: string, value: string) => {
    const updated = [...form.milestones];
    (updated[idx] as any)[field] = value;
    setForm((p) => ({ ...p, milestones: updated }));
  };

  const removeMilestone = (idx: number) => {
    setForm((p) => ({ ...p, milestones: p.milestones.filter((_, i) => i !== idx) }));
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const payload = {
        title: form.title,
        description: form.description,
        category: form.category,
        location: form.location,
        region: form.region,
        visibility: form.visibility,
        startDate: form.startDate,
        endDate: form.endDate,
        status: 'active',
        goals: {
          volunteersNeeded: form.volunteersNeeded,
          volunteersJoined: 0,
          fundingGoal: form.fundingGoal,
          fundingRaised: 0,
          peopleToHelp: form.peopleToHelp,
          peopleHelped: 0,
        },
        milestones: form.milestones
          .filter((m) => m.title)
          .map((m) => ({ ...m, completed: false })),
      };
      const res = await api.post('/campaigns', payload);
      if (res.data.success) {
        router.push('/dashboard/campaigns');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto space-y-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-3">
            <Sparkles className="w-6 h-6 text-indigo-400" />
            Create Campaign
          </h1>
          <p className="text-slate-400 mt-1">Launch a new campaign for your organization</p>
        </div>

        {/* Step indicator */}
        <div className="flex items-center gap-2">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                step === s ? 'bg-indigo-600 text-white' :
                step > s ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-400'
              }`}>
                {step > s ? <Check className="w-4 h-4" /> : s}
              </div>
              <span className={`text-xs font-medium ${step >= s ? 'text-slate-200' : 'text-slate-500'}`}>
                {s === 1 ? 'Details' : s === 2 ? 'Goals' : 'Milestones'}
              </span>
              {s < 3 && <ChevronRight className="w-4 h-4 text-slate-600" />}
            </div>
          ))}
        </div>

        <div className="glass-card rounded-2xl border border-slate-800 p-6">
          {/* Step 1: Details */}
          {step === 1 && (
            <div className="space-y-5">
              <div>
                <label className="text-sm font-medium text-slate-300 block mb-1.5">Campaign Title</label>
                <input value={form.title} onChange={(e) => updateField('title', e.target.value)}
                  placeholder="e.g., Clean Water for Dharavi 2025"
                  className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-sm text-slate-200 focus:border-indigo-500 focus:outline-none" />
              </div>

              <div>
                <label className="text-sm font-medium text-slate-300 block mb-1.5">Description</label>
                <textarea value={form.description} onChange={(e) => updateField('description', e.target.value)}
                  placeholder="Describe the campaign goals, context, and expected impact..."
                  rows={4}
                  className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-sm text-slate-200 focus:border-indigo-500 focus:outline-none resize-none" />
              </div>

              <div>
                <label className="text-sm font-medium text-slate-300 block mb-1.5">Category</label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {CATEGORIES.map((cat) => (
                    <button key={cat.value} onClick={() => updateField('category', cat.value)}
                      className={`p-3 rounded-xl text-sm text-left transition-all ${
                        form.category === cat.value
                          ? 'bg-indigo-600/15 border border-indigo-500/40 text-indigo-300'
                          : 'bg-slate-800 border border-slate-700 text-slate-400 hover:border-slate-600'
                      }`}>
                      <span className="text-lg">{cat.icon}</span>
                      <div className="text-xs mt-1">{cat.label}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-slate-300 block mb-1.5">Location</label>
                  <input value={form.location} onChange={(e) => updateField('location', e.target.value)}
                    placeholder="e.g., Dharavi, Mumbai"
                    className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-sm text-slate-200 focus:border-indigo-500 focus:outline-none" />
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-300 block mb-1.5">Region / State</label>
                  <input value={form.region} onChange={(e) => updateField('region', e.target.value)}
                    placeholder="e.g., Maharashtra"
                    className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-sm text-slate-200 focus:border-indigo-500 focus:outline-none" />
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Goals */}
          {step === 2 && (
            <div className="space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-slate-300 block mb-1.5">Start Date</label>
                  <input type="date" value={form.startDate} onChange={(e) => updateField('startDate', e.target.value)}
                    className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-sm text-slate-200 focus:border-indigo-500 focus:outline-none" />
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-300 block mb-1.5">End Date</label>
                  <input type="date" value={form.endDate} onChange={(e) => updateField('endDate', e.target.value)}
                    className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-sm text-slate-200 focus:border-indigo-500 focus:outline-none" />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium text-slate-300 flex items-center gap-1 mb-1.5">
                    <Users className="w-4 h-4" /> Volunteers Needed
                  </label>
                  <input type="number" value={form.volunteersNeeded} onChange={(e) => updateField('volunteersNeeded', parseInt(e.target.value) || 0)}
                    className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-sm text-slate-200 focus:border-indigo-500 focus:outline-none" />
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-300 flex items-center gap-1 mb-1.5">
                    <IndianRupee className="w-4 h-4" /> Funding Goal (₹)
                  </label>
                  <input type="number" value={form.fundingGoal} onChange={(e) => updateField('fundingGoal', parseInt(e.target.value) || 0)}
                    className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-sm text-slate-200 focus:border-indigo-500 focus:outline-none" />
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-300 flex items-center gap-1 mb-1.5">
                    <Target className="w-4 h-4" /> People to Help
                  </label>
                  <input type="number" value={form.peopleToHelp} onChange={(e) => updateField('peopleToHelp', parseInt(e.target.value) || 0)}
                    className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-sm text-slate-200 focus:border-indigo-500 focus:outline-none" />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-slate-300 block mb-1.5">Visibility</label>
                <div className="flex gap-3">
                  {['public', 'private'].map((v) => (
                    <button key={v} onClick={() => updateField('visibility', v)}
                      className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-all capitalize ${
                        form.visibility === v
                          ? 'bg-indigo-600 text-white'
                          : 'bg-slate-800 border border-slate-700 text-slate-400'
                      }`}>{v}</button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Milestones */}
          {step === 3 && (
            <div className="space-y-4">
              <p className="text-sm text-slate-400">Define milestones to track campaign progress</p>

              {form.milestones.map((m, idx) => (
                <div key={idx} className="flex items-center gap-3 p-3 bg-slate-800/50 rounded-xl">
                  <div className="w-7 h-7 rounded-full bg-indigo-600/20 flex items-center justify-center text-xs font-bold text-indigo-400">
                    {idx + 1}
                  </div>
                  <input value={m.title} onChange={(e) => updateMilestone(idx, 'title', e.target.value)}
                    placeholder={`Milestone ${idx + 1} title`}
                    className="flex-1 px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-slate-200 focus:border-indigo-500 focus:outline-none" />
                  <input type="date" value={m.targetDate} onChange={(e) => updateMilestone(idx, 'targetDate', e.target.value)}
                    className="px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-slate-200 focus:border-indigo-500 focus:outline-none w-40" />
                  {form.milestones.length > 1 && (
                    <button onClick={() => removeMilestone(idx)} className="p-1.5 hover:bg-red-500/10 rounded-lg text-slate-400 hover:text-red-400">
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}

              <button onClick={addMilestone}
                className="flex items-center gap-2 text-sm text-indigo-400 hover:text-indigo-300 transition-colors">
                <Plus className="w-4 h-4" /> Add Milestone
              </button>
            </div>
          )}

          {/* Navigation */}
          <div className="flex justify-between mt-8 pt-6 border-t border-slate-800">
            {step > 1 ? (
              <button onClick={() => setStep(step - 1)}
                className="px-6 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-slate-300 hover:bg-slate-700 transition-colors">
                Back
              </button>
            ) : <div />}

            {step < 3 ? (
              <button onClick={() => setStep(step + 1)} disabled={step === 1 && !form.title}
                className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-semibold disabled:opacity-40 flex items-center gap-2 transition-colors">
                Next <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button onClick={handleSubmit} disabled={submitting || !form.title}
                className="px-6 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl text-sm font-semibold disabled:opacity-40 flex items-center gap-2">
                {submitting ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <><Sparkles className="w-4 h-4" /> Launch Campaign</>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
