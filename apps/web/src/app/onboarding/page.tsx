'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '../../lib/api';
import { useAuthStore } from '../../store/auth-store';
import {
  Building2, Users, FileText, Rocket, ChevronRight,
  Check, MapPin, Globe, Shield, ArrowLeft
} from 'lucide-react';
import Link from 'next/link';

const STEPS = [
  { title: 'Organization Details', icon: Building2 },
  { title: 'Contact & Location', icon: MapPin },
  { title: 'Team Setup', icon: Users },
  { title: 'Launch', icon: Rocket },
];

const ORG_TYPES = [
  { value: 'ngo', label: 'Non-Profit NGO', emoji: '🏛️' },
  { value: 'foundation', label: 'Foundation', emoji: '🏗️' },
  { value: 'trust', label: 'Public Trust', emoji: '🤝' },
  { value: 'cbo', label: 'Community Organization', emoji: '🏘️' },
  { value: 'social_enterprise', label: 'Social Enterprise', emoji: '💼' },
];

const FOCUS_AREAS = [
  'Education', 'Healthcare', 'Water & Sanitation', 'Food Security',
  'Environment', 'Women Empowerment', 'Child Welfare', 'Disability',
  'Employment', 'Housing', 'Disaster Relief', 'Rural Development',
];

export default function OnboardingPage() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    name: '',
    type: 'ngo',
    description: '',
    registrationNumber: '',
    focusAreas: [] as string[],
    contactEmail: user?.email || '',
    contactPhone: '',
    website: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    teamEmails: [''],
    mode: 'public',
  });

  const updateField = (field: string, value: any) => setForm((p) => ({ ...p, [field]: value }));

  const toggleFocus = (area: string) => {
    setForm((p) => ({
      ...p,
      focusAreas: p.focusAreas.includes(area)
        ? p.focusAreas.filter((a) => a !== area)
        : [...p.focusAreas, area],
    }));
  };

  const addTeamEmail = () => setForm((p) => ({ ...p, teamEmails: [...p.teamEmails, ''] }));
  const updateTeamEmail = (idx: number, val: string) => {
    const updated = [...form.teamEmails];
    updated[idx] = val;
    setForm((p) => ({ ...p, teamEmails: updated }));
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const res = await api.post('/organizations', {
        name: form.name,
        type: form.type,
        description: form.description,
        registrationNumber: form.registrationNumber,
        focusAreas: form.focusAreas,
        contactEmail: form.contactEmail,
        contactPhone: form.contactPhone,
        website: form.website,
        address: `${form.address}, ${form.city}, ${form.state} ${form.pincode}`,
        region: form.state,
        mode: form.mode,
      });
      if (res.data.success) {
        router.push('/dashboard');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden px-4 py-12">
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-600/8 rounded-full blur-[120px] pointer-events-none"></div>

      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-slate-200 mb-6 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back to Home
          </Link>
          <div className="w-14 h-14 bg-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Building2 className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white">Register Your Organization</h1>
          <p className="text-slate-400 mt-1">Set up your NGO workspace on JanSetu</p>
        </div>

        {/* Steps indicator */}
        <div className="flex items-center justify-center gap-1 mb-8">
          {STEPS.map((s, i) => (
            <div key={i} className="flex items-center gap-1">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                i === step ? 'bg-indigo-600 text-white scale-110' :
                i < step ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-500'
              }`}>
                {i < step ? <Check className="w-4 h-4" /> : i + 1}
              </div>
              {i < STEPS.length - 1 && (
                <div className={`w-8 h-0.5 ${i < step ? 'bg-emerald-600' : 'bg-slate-800'}`} />
              )}
            </div>
          ))}
        </div>

        <div className="glass-card rounded-2xl border border-slate-800 p-8">
          {/* Step 0: Org Details */}
          {step === 0 && (
            <div className="space-y-5">
              <div>
                <label className="text-sm font-medium text-slate-300 block mb-1.5">Organization Name</label>
                <input value={form.name} onChange={(e) => updateField('name', e.target.value)}
                  placeholder="e.g., HelpIndia Foundation"
                  className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-sm text-slate-200 focus:border-indigo-500 focus:outline-none" />
              </div>

              <div>
                <label className="text-sm font-medium text-slate-300 block mb-1.5">Organization Type</label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {ORG_TYPES.map((t) => (
                    <button key={t.value} onClick={() => updateField('type', t.value)}
                      className={`p-3 rounded-xl text-left text-sm transition-all ${
                        form.type === t.value
                          ? 'bg-indigo-600/15 border border-indigo-500/40 text-indigo-300'
                          : 'bg-slate-800 border border-slate-700 text-slate-400 hover:border-slate-600'
                      }`}>
                      <span className="text-lg">{t.emoji}</span>
                      <div className="text-xs mt-1">{t.label}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-slate-300 block mb-1.5">Description</label>
                <textarea value={form.description} onChange={(e) => updateField('description', e.target.value)}
                  placeholder="Tell us about your organization's mission..."
                  rows={3}
                  className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-sm text-slate-200 focus:border-indigo-500 focus:outline-none resize-none" />
              </div>

              <div>
                <label className="text-sm font-medium text-slate-300 block mb-1.5">Registration Number (optional)</label>
                <input value={form.registrationNumber} onChange={(e) => updateField('registrationNumber', e.target.value)}
                  placeholder="e.g., NGO-MH-2024-12345"
                  className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-sm text-slate-200 focus:border-indigo-500 focus:outline-none" />
              </div>

              <div>
                <label className="text-sm font-medium text-slate-300 block mb-2">Focus Areas</label>
                <div className="flex flex-wrap gap-2">
                  {FOCUS_AREAS.map((a) => (
                    <button key={a} onClick={() => toggleFocus(a)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                        form.focusAreas.includes(a)
                          ? 'bg-indigo-600 text-white'
                          : 'bg-slate-800 border border-slate-700 text-slate-400 hover:text-slate-200'
                      }`}>{a}</button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Step 1: Contact */}
          {step === 1 && (
            <div className="space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-slate-300 block mb-1.5">Contact Email</label>
                  <input value={form.contactEmail} onChange={(e) => updateField('contactEmail', e.target.value)}
                    className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-sm text-slate-200 focus:border-indigo-500 focus:outline-none" />
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-300 block mb-1.5">Phone</label>
                  <input value={form.contactPhone} onChange={(e) => updateField('contactPhone', e.target.value)}
                    placeholder="+91 98765 43210"
                    className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-sm text-slate-200 focus:border-indigo-500 focus:outline-none" />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-300 block mb-1.5">Website (optional)</label>
                <input value={form.website} onChange={(e) => updateField('website', e.target.value)}
                  placeholder="https://yourorg.org"
                  className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-sm text-slate-200 focus:border-indigo-500 focus:outline-none" />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-300 block mb-1.5">Address</label>
                <input value={form.address} onChange={(e) => updateField('address', e.target.value)}
                  placeholder="Street address"
                  className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-sm text-slate-200 focus:border-indigo-500 focus:outline-none" />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium text-slate-300 block mb-1.5">City</label>
                  <input value={form.city} onChange={(e) => updateField('city', e.target.value)}
                    className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-sm text-slate-200 focus:border-indigo-500 focus:outline-none" />
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-300 block mb-1.5">State</label>
                  <input value={form.state} onChange={(e) => updateField('state', e.target.value)}
                    className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-sm text-slate-200 focus:border-indigo-500 focus:outline-none" />
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-300 block mb-1.5">Pincode</label>
                  <input value={form.pincode} onChange={(e) => updateField('pincode', e.target.value)}
                    className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-sm text-slate-200 focus:border-indigo-500 focus:outline-none" />
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Team */}
          {step === 2 && (
            <div className="space-y-5">
              <p className="text-sm text-slate-400">Invite team members to your organization workspace</p>
              {form.teamEmails.map((email, idx) => (
                <div key={idx} className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-indigo-600/20 rounded-lg flex items-center justify-center text-xs font-bold text-indigo-400">
                    {idx + 1}
                  </div>
                  <input value={email} onChange={(e) => updateTeamEmail(idx, e.target.value)}
                    placeholder="team@email.com"
                    className="flex-1 px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-sm text-slate-200 focus:border-indigo-500 focus:outline-none" />
                </div>
              ))}
              <button onClick={addTeamEmail} className="text-sm text-indigo-400 hover:text-indigo-300">
                + Add another member
              </button>

              <div className="mt-6">
                <label className="text-sm font-medium text-slate-300 block mb-2">Visibility Mode</label>
                <div className="flex gap-3">
                  {[
                    { value: 'public', label: 'Public', desc: 'Visible on network', icon: Globe },
                    { value: 'private', label: 'Private', desc: 'Hidden from network', icon: Shield },
                  ].map((m) => (
                    <button key={m.value} onClick={() => updateField('mode', m.value)}
                      className={`flex-1 p-4 rounded-xl text-left transition-all ${
                        form.mode === m.value
                          ? 'bg-indigo-600/15 border border-indigo-500/40'
                          : 'bg-slate-800 border border-slate-700'
                      }`}>
                      <m.icon className={`w-5 h-5 mb-2 ${form.mode === m.value ? 'text-indigo-400' : 'text-slate-500'}`} />
                      <div className={`text-sm font-semibold ${form.mode === m.value ? 'text-indigo-300' : 'text-slate-400'}`}>{m.label}</div>
                      <div className="text-xs text-slate-500 mt-0.5">{m.desc}</div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Launch */}
          {step === 3 && (
            <div className="text-center space-y-6">
              <div className="w-16 h-16 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl flex items-center justify-center mx-auto">
                <Rocket className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-xl font-bold text-white">Ready to Launch!</h2>
              <p className="text-slate-400 text-sm">Review your organization details:</p>

              <div className="text-left glass-card rounded-xl border border-slate-800 p-5 space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Name</span>
                  <span className="text-slate-200 font-medium">{form.name || '—'}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Type</span>
                  <span className="text-slate-200">{ORG_TYPES.find((t) => t.value === form.type)?.label}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Focus Areas</span>
                  <span className="text-slate-200">{form.focusAreas.length} selected</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Location</span>
                  <span className="text-slate-200">{form.city || '—'}, {form.state || '—'}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Mode</span>
                  <span className={`font-semibold ${form.mode === 'public' ? 'text-emerald-400' : 'text-amber-400'}`}>
                    {form.mode === 'public' ? '🌐 Public' : '🔒 Private'}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="flex justify-between mt-8 pt-6 border-t border-slate-800">
            {step > 0 ? (
              <button onClick={() => setStep(step - 1)}
                className="px-6 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-slate-300 hover:bg-slate-700 transition-colors">
                Back
              </button>
            ) : <div />}

            {step < 3 ? (
              <button onClick={() => setStep(step + 1)} disabled={step === 0 && !form.name}
                className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-semibold disabled:opacity-40 flex items-center gap-2 transition-colors">
                Next <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button onClick={handleSubmit} disabled={submitting || !form.name}
                className="px-6 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl text-sm font-semibold disabled:opacity-40 flex items-center gap-2">
                {submitting ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <><Rocket className="w-4 h-4" /> Launch Organization</>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
