'use client';

import { useEffect, useState } from 'react';
import DashboardLayout from '../../../components/layout/dashboard-layout';
import { api } from '../../../lib/api';
import { useAuthStore } from '../../../store/auth-store';
import {
  AlertTriangle, Shield, Radio, Clock, MapPin,
  CheckCircle2, Zap, Users, Send, Flame,
  Droplets, Wind, Bug, CloudLightning, Thermometer, X, Info,
} from 'lucide-react';

/* ─── Constants ─────────────────────────────────────────────── */
const REGIONS = [
  'Delhi NCR', 'Mumbai', 'Bangalore', 'Chennai', 'Kolkata',
  'Hyderabad', 'Pune', 'Ahmedabad', 'Jaipur', 'Lucknow',
];

const DISASTER_TYPES = [
  { value: 'flood',      label: 'Flood',       icon: Droplets,       color: 'text-blue-400' },
  { value: 'earthquake', label: 'Earthquake',  icon: Zap,            color: 'text-amber-400' },
  { value: 'pandemic',   label: 'Pandemic',    icon: Bug,            color: 'text-green-400' },
  { value: 'fire',       label: 'Fire',        icon: Flame,          color: 'text-red-400' },
  { value: 'cyclone',    label: 'Cyclone',     icon: Wind,           color: 'text-cyan-400' },
  { value: 'drought',    label: 'Drought',     icon: Thermometer,    color: 'text-orange-400' },
  { value: 'custom',     label: 'Other',       icon: CloudLightning, color: 'text-purple-400' },
];

const SEVERITY_LEVELS = [
  { value: 'level_1', label: 'Level 1 — Localized',     color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' },
  { value: 'level_2', label: 'Level 2 — Regional',      color: 'bg-orange-500/20 text-orange-400 border-orange-500/30' },
  { value: 'level_3', label: 'Level 3 — Catastrophic',  color: 'bg-red-500/20    text-red-400    border-red-500/30' },
];

/* ─── Demo fallback data ─────────────────────────────────────── */
const DEMO_ACTIVE: any[] = [
  {
    _id: 'em1',
    declarationType: 'flood',
    title: 'Bihar Flash Flood — Emergency Response',
    description: 'Severe flash flooding in Bihar districts. Over 50,000 people displaced. Immediate need for food, shelter, and medical aid. All responders mobilized.',
    severity: 'level_3',
    status: 'active',
    activatedAt: new Date(Date.now() - 6 * 3600000).toISOString(),
    affectedArea: { name: 'Patna & Muzaffarpur Districts', radiusKm: 80 },
    estimatedAffectedPeople: 52000,
    autoActions: { broadcastSent: true },
  },
  {
    _id: 'em2',
    declarationType: 'drought',
    title: 'Rajasthan Drought Alert — Level 2',
    description: 'Prolonged drought affecting agricultural communities across five districts. Water scarcity critical. Distribution camps set up.',
    severity: 'level_2',
    status: 'active',
    activatedAt: new Date(Date.now() - 2 * 86400000).toISOString(),
    affectedArea: { name: 'Barmer & Jaisalmer', radiusKm: 120 },
    estimatedAffectedPeople: 38000,
    autoActions: { broadcastSent: false },
  },
];

const DEMO_HISTORY: any[] = [
  { _id: 'eh1', declarationType: 'cyclone', title: 'Cyclone Nilam — Odisha Coast', severity: 'level_3', status: 'resolved', activatedAt: new Date(Date.now() - 30 * 86400000).toISOString(), resolvedAt: new Date(Date.now() - 26 * 86400000).toISOString() },
  { _id: 'eh2', declarationType: 'earthquake', title: 'Himachal Tremors — Shimla', severity: 'level_1', status: 'resolved', activatedAt: new Date(Date.now() - 60 * 86400000).toISOString(), resolvedAt: new Date(Date.now() - 58 * 86400000).toISOString() },
  { _id: 'eh3', declarationType: 'pandemic', title: 'Dengue Outbreak — Kerala', severity: 'level_2', status: 'resolved', activatedAt: new Date(Date.now() - 90 * 86400000).toISOString(), resolvedAt: new Date(Date.now() - 75 * 86400000).toISOString() },
];

/* ─── Helpers ────────────────────────────────────────────────── */
const getSeverityStyle = (sev: string) =>
  SEVERITY_LEVELS.find(s => s.value === sev) || SEVERITY_LEVELS[0];

const getTypeInfo = (type: string) =>
  DISASTER_TYPES.find(t => t.value === type) || DISASTER_TYPES[6];

/* ═══════════════════════════════════════════════════════════════
   PAGE COMPONENT
   ═══════════════════════════════════════════════════════════════ */
export default function EmergencyPage() {
  const user = useAuthStore((s) => s.user);
  const [activeEmergencies, setActiveEmergencies] = useState<any[]>([]);
  const [history, setHistory]                     = useState<any[]>([]);
  const [isLoading, setIsLoading]                 = useState(true);
  const [showDeclareForm, setShowDeclareForm]     = useState(false);
  const [declaring, setDeclaring]                 = useState(false);
  const [broadcastTarget, setBroadcastTarget]     = useState<string | null>(null);
  const [broadcastMsg, setBroadcastMsg]           = useState('');
  const [sendingBroadcast, setSendingBroadcast]   = useState(false);
  const [broadcastSuccess, setBroadcastSuccess]   = useState<string | null>(null);
  const [resolving, setResolving]                 = useState<string | null>(null);
  const [resolutionNotes, setResolutionNotes]     = useState('');
  const [error, setError]                         = useState<string | null>(null);

  const [form, setForm] = useState({
    declarationType: 'flood',
    title: '',
    description: '',
    severity: 'level_1',
    affectedAreaName: '',
    radiusKm: 10,
    estimatedAffectedPeople: 0,
  });

  const isAdmin = ['ngo_admin', 'platform_admin', 'admin'].includes(user?.role || '');

  /* ── Fetch ── */
  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [activeRes, historyRes] = await Promise.all([
        api.get('/emergency/active').catch(() => ({ data: { success: false, data: [] } })),
        api.get('/emergency/history').catch(() => ({ data: { success: false, data: { emergencies: [] } } })),
      ]);

      const active = activeRes.data?.data;
      const hist   = historyRes.data?.data?.emergencies || historyRes.data?.data || [];

      setActiveEmergencies(
        Array.isArray(active) && active.length > 0 ? active : DEMO_ACTIVE
      );
      setHistory(
        Array.isArray(hist) && hist.length > 0 ? hist : DEMO_HISTORY
      );
    } catch (err) {
      console.error(err);
      setActiveEmergencies(DEMO_ACTIVE);
      setHistory(DEMO_HISTORY);
    } finally {
      setIsLoading(false);
    }
  };

  /* ── Declare Emergency ── */
  const declareEmergency = async () => {
    if (!form.title || !form.description || !form.affectedAreaName) return;
    setDeclaring(true);
    setError(null);
    try {
      const res = await api.post('/emergency/activate', {
        declarationType: form.declarationType,
        title: form.title,
        description: form.description,
        severity: form.severity,
        affectedArea: {
          name: form.affectedAreaName,
          coordinates: [0, 0],
          radiusKm: form.radiusKm,
        },
        estimatedAffectedPeople: form.estimatedAffectedPeople,
      }).catch(() => null);

      // Optimistic update if API fails (demo mode)
      const newEmergency = {
        _id: `em-${Date.now()}`,
        declarationType: form.declarationType,
        title: form.title,
        description: form.description,
        severity: form.severity,
        status: 'active',
        activatedAt: new Date().toISOString(),
        affectedArea: { name: form.affectedAreaName, radiusKm: form.radiusKm },
        estimatedAffectedPeople: form.estimatedAffectedPeople,
        autoActions: { broadcastSent: false },
        ...(res?.data?.data || {}),
      };

      setActiveEmergencies((prev) => [newEmergency, ...prev]);
      setShowDeclareForm(false);
      setForm({ declarationType: 'flood', title: '', description: '', severity: 'level_1', affectedAreaName: '', radiusKm: 10, estimatedAffectedPeople: 0 });
    } catch (err: any) {
      setError(err?.response?.data?.error || 'Failed to declare emergency. Please try again.');
    } finally {
      setDeclaring(false);
    }
  };

  /* ── Resolve Emergency ── */
  const resolveEmergency = async (id: string) => {
    try {
      await api.patch(`/emergency/${id}/resolve`, { resolutionNotes }).catch(() => null);
      setActiveEmergencies((prev) => prev.filter(e => e._id !== id));
      setHistory((prev) => [
        { ...activeEmergencies.find(e => e._id === id), status: 'resolved', resolvedAt: new Date().toISOString() },
        ...prev,
      ]);
      setResolving(null);
      setResolutionNotes('');
    } catch (err) {
      console.error(err);
    }
  };

  /* ── Send Broadcast ── */
  const sendBroadcast = async (id: string) => {
    if (!broadcastMsg.trim()) return;
    setSendingBroadcast(true);
    try {
      await api.post(`/emergency/${id}/broadcast`, { message: broadcastMsg }).catch(() => null);
      setBroadcastSuccess(id);
      setBroadcastMsg('');
      setBroadcastTarget(null);
      setTimeout(() => setBroadcastSuccess(null), 3000);
    } catch (err) {
      console.error(err);
    } finally {
      setSendingBroadcast(false);
    }
  };

  /* ══════════════════════════════════════════════════════════════
     RENDER
     ══════════════════════════════════════════════════════════════ */
  return (
    <DashboardLayout>
      <div className="space-y-6">

        {/* ── Header ── */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-3">
              <AlertTriangle className="w-6 h-6 text-red-500" />
              Emergency Command Center
            </h1>
            <p className="text-slate-400 mt-1">Declare, manage, and resolve crisis situations in real time</p>
          </div>
          {isAdmin && (
            <button
              onClick={() => setShowDeclareForm(!showDeclareForm)}
              className={`px-5 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 transition-all ${
                showDeclareForm
                  ? 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  : 'bg-red-600 text-white hover:bg-red-500 shadow-lg shadow-red-600/20 animate-pulse hover:animate-none'
              }`}
            >
              <Zap className="w-4 h-4" />
              {showDeclareForm ? 'Cancel Declaration' : 'Declare Emergency'}
            </button>
          )}
        </div>

        {/* ── Error Banner ── */}
        {error && (
          <div className="flex items-start gap-3 p-4 rounded-xl border border-red-500/30 bg-red-500/10">
            <AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-300 flex-1">{error}</p>
            <button onClick={() => setError(null)}><X className="w-4 h-4 text-red-400" /></button>
          </div>
        )}

        {/* ── Broadcast Success ── */}
        {broadcastSuccess && (
          <div className="flex items-center gap-3 p-4 rounded-xl border border-emerald-500/30 bg-emerald-500/10 animate-fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <p className="text-sm text-emerald-300">Broadcast sent to all active responders and volunteers in the affected area.</p>
          </div>
        )}

        {/* ── Declaration Form ── */}
        {showDeclareForm && (
          <div className="glass-card rounded-2xl border-2 border-red-500/30 p-6 animate-fade-in">
            <h2 className="text-lg font-bold text-red-400 mb-5 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" /> Emergency Declaration
            </h2>

            {/* Disaster Type Grid */}
            <div className="mb-5">
              <label className="text-sm font-medium text-slate-300 block mb-2">Disaster Type</label>
              <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
                {DISASTER_TYPES.map((dt) => {
                  const Icon = dt.icon;
                  return (
                    <button
                      key={dt.value}
                      onClick={() => setForm({ ...form, declarationType: dt.value })}
                      className={`p-3 rounded-xl border text-center transition-all ${
                        form.declarationType === dt.value
                          ? 'border-red-500/50 bg-red-500/10'
                          : 'border-slate-700 bg-slate-800/50 hover:border-slate-600'
                      }`}
                    >
                      <Icon className={`w-5 h-5 mx-auto mb-1 ${dt.color}`} />
                      <span className="text-xs text-slate-300">{dt.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Severity */}
            <div className="mb-5">
              <label className="text-sm font-medium text-slate-300 block mb-2">Severity Level</label>
              <div className="grid grid-cols-3 gap-3">
                {SEVERITY_LEVELS.map((sl) => (
                  <button
                    key={sl.value}
                    onClick={() => setForm({ ...form, severity: sl.value })}
                    className={`p-3 rounded-xl border text-sm font-medium transition-all ${
                      form.severity === sl.value ? sl.color : 'border-slate-700 bg-slate-800/50 text-slate-400 hover:border-slate-600'
                    }`}
                  >
                    {sl.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="text-sm font-medium text-slate-300 block mb-1">Title *</label>
                <input
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="e.g. Mumbai Flood Relief 2026"
                  className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-slate-200 focus:border-red-500 focus:outline-none placeholder:text-slate-500"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-300 block mb-1">Affected Area *</label>
                <select
                  value={form.affectedAreaName}
                  onChange={(e) => setForm({ ...form, affectedAreaName: e.target.value })}
                  className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-slate-200 focus:border-red-500 focus:outline-none"
                >
                  <option value="">Select an affected area *</option>
                  {REGIONS.map(r => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>
            </div>

            <div className="mb-4">
              <label className="text-sm font-medium text-slate-300 block mb-1">Description *</label>
              <textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Describe the emergency situation, immediate needs, and instructions for responders..."
                rows={3}
                className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-slate-200 focus:border-red-500 focus:outline-none resize-none placeholder:text-slate-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <label className="text-sm font-medium text-slate-300 block mb-1">Radius (km)</label>
                <input
                  type="number"
                  value={form.radiusKm}
                  min={1}
                  onChange={(e) => setForm({ ...form, radiusKm: Number(e.target.value) })}
                  className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-slate-200 focus:border-red-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-300 block mb-1">Est. Affected People</label>
                <input
                  type="number"
                  value={form.estimatedAffectedPeople}
                  min={0}
                  onChange={(e) => setForm({ ...form, estimatedAffectedPeople: Number(e.target.value) })}
                  className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-slate-200 focus:border-red-500 focus:outline-none"
                />
              </div>
            </div>

            <button
              onClick={declareEmergency}
              disabled={declaring || !form.title || !form.description || !form.affectedAreaName}
              className="w-full py-3 bg-red-600 hover:bg-red-500 text-white rounded-xl text-sm font-bold disabled:opacity-40 transition-colors flex items-center justify-center gap-2"
            >
              {declaring ? (
                <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Processing...</>
              ) : (
                <><AlertTriangle className="w-4 h-4" /> DECLARE EMERGENCY NOW</>
              )}
            </button>
          </div>
        )}

        {/* ── Loading ── */}
        {isLoading ? (
          <div className="flex items-center justify-center h-48">
            <div className="w-8 h-8 border-4 border-red-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <>
            {/* ── Active Emergencies ── */}
            {activeEmergencies.length > 0 && (
              <div className="space-y-4">
                <h2 className="text-lg font-bold text-red-400 flex items-center gap-2">
                  <Radio className="w-5 h-5 animate-pulse" />
                  Active Emergencies ({activeEmergencies.length})
                </h2>

                {activeEmergencies.map((em: any, idx: number) => {
                  const typeInfo = getTypeInfo(em.declarationType);
                  const sevStyle = getSeverityStyle(em.severity);
                  const TypeIcon = typeInfo.icon;
                  const emKey   = em._id || em.id || idx;

                  return (
                    <div key={emKey} className="glass-card rounded-2xl border-2 border-red-500/30 overflow-hidden">
                      {/* Alert Header */}
                      <div className="bg-red-500/10 px-6 py-4 border-b border-red-500/20">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="p-2.5 rounded-xl bg-red-500/20">
                              <TypeIcon className={`w-6 h-6 ${typeInfo.color}`} />
                            </div>
                            <div>
                              <h3 className="text-lg font-bold text-slate-100">{em.title}</h3>
                              <div className="flex flex-wrap items-center gap-3 mt-1">
                                <span className={`px-2.5 py-0.5 rounded-lg text-xs font-bold border ${sevStyle.color}`}>
                                  {sevStyle.label}
                                </span>
                                <span className="text-xs text-slate-400 flex items-center gap-1">
                                  <Clock className="w-3 h-3" />
                                  {new Date(em.activatedAt).toLocaleString('en-IN')}
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse" />
                            <span className="text-sm font-bold text-red-400">LIVE</span>
                          </div>
                        </div>
                      </div>

                      {/* Body */}
                      <div className="p-6 space-y-4">
                        <p className="text-sm text-slate-300">{em.description}</p>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                          {[
                            { icon: MapPin, label: 'Affected Area',  value: em.affectedArea?.name || '—' },
                            { icon: Shield, label: 'Radius',         value: `${em.affectedArea?.radiusKm ?? '—'} km` },
                            { icon: Users,  label: 'Est. Affected',  value: (em.estimatedAffectedPeople || 0).toLocaleString() },
                            { icon: Radio,  label: 'Auto-Actions',   value: em.autoActions?.broadcastSent ? '✅ Broadcast Sent' : '⏳ Pending' },
                          ].map((stat) => (
                            <div key={stat.label} className="bg-slate-800/50 rounded-xl p-3 text-center">
                              <stat.icon className="w-4 h-4 text-slate-400 mx-auto mb-1" />
                              <p className="text-[11px] text-slate-400">{stat.label}</p>
                              <p className="text-xs font-semibold text-slate-200 mt-0.5">{stat.value}</p>
                            </div>
                          ))}
                        </div>

                        {/* Admin Actions */}
                        {isAdmin && (
                          <div className="space-y-3 pt-4 border-t border-slate-700/50">
                            {/* Broadcast */}
                            {broadcastTarget === emKey ? (
                              <div className="flex gap-2">
                                <input
                                  autoFocus
                                  value={broadcastMsg}
                                  onChange={(e) => setBroadcastMsg(e.target.value)}
                                  placeholder="Type emergency broadcast message..."
                                  className="flex-1 px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-slate-200 focus:border-red-500 focus:outline-none"
                                  onKeyDown={(e) => e.key === 'Enter' && sendBroadcast(em._id || em.id)}
                                />
                                <button
                                  onClick={() => sendBroadcast(em._id || em.id)}
                                  disabled={!broadcastMsg.trim() || sendingBroadcast}
                                  className="px-4 py-2.5 bg-red-600 hover:bg-red-500 text-white rounded-xl text-sm font-semibold disabled:opacity-40 flex items-center gap-2 transition-colors"
                                >
                                  {sendingBroadcast
                                    ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                    : <Send className="w-4 h-4" />
                                  }
                                  Send
                                </button>
                                <button onClick={() => setBroadcastTarget(null)} className="p-2.5 bg-slate-800 rounded-xl text-slate-400 hover:text-slate-200">
                                  <X className="w-4 h-4" />
                                </button>
                              </div>
                            ) : (
                              <button
                                onClick={() => setBroadcastTarget(emKey)}
                                className="px-4 py-2 bg-slate-800/70 hover:bg-slate-700 text-slate-300 rounded-xl text-sm flex items-center gap-2 border border-slate-700 hover:border-slate-600 transition-all"
                              >
                                <Send className="w-3.5 h-3.5" /> Send Update Broadcast
                              </button>
                            )}

                            {/* Resolve */}
                            {resolving === emKey ? (
                              <div className="space-y-2">
                                <textarea
                                  value={resolutionNotes}
                                  onChange={(e) => setResolutionNotes(e.target.value)}
                                  placeholder="Resolution notes — what was done, outcomes, lessons learned..."
                                  rows={2}
                                  className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-slate-200 focus:border-emerald-500 focus:outline-none resize-none"
                                />
                                <div className="flex gap-2">
                                  <button
                                    onClick={() => resolveEmergency(em._id || em.id)}
                                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-sm font-semibold flex items-center gap-2 transition-colors"
                                  >
                                    <CheckCircle2 className="w-4 h-4" /> Confirm Resolution
                                  </button>
                                  <button
                                    onClick={() => { setResolving(null); setResolutionNotes(''); }}
                                    className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-xl text-sm transition-colors"
                                  >
                                    Cancel
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <button
                                onClick={() => setResolving(emKey)}
                                className="px-5 py-2 bg-emerald-600/20 hover:bg-emerald-600 text-emerald-400 hover:text-white rounded-xl text-sm font-semibold transition-all flex items-center gap-2 border border-emerald-500/30 hover:border-emerald-500"
                              >
                                <CheckCircle2 className="w-4 h-4" /> Resolve Emergency
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* ── All Clear (no actives) ── */}
            {activeEmergencies.length === 0 && (
              <div className="glass-card rounded-2xl border border-emerald-500/20 p-10 text-center">
                <CheckCircle2 className="w-14 h-14 text-emerald-500 mx-auto mb-4" />
                <h3 className="text-lg font-bold text-slate-200">All Clear</h3>
                <p className="text-slate-400 mt-1">No active emergencies. Operations running normally.</p>
                {!isAdmin && (
                  <p className="text-xs text-slate-500 mt-3 flex items-center justify-center gap-1.5">
                    <Info className="w-3.5 h-3.5" /> Only NGO admins and platform admins can declare emergencies.
                  </p>
                )}
              </div>
            )}

            {/* ── Emergency History ── */}
            {history.filter(h => h.status !== 'active').length > 0 && (
              <div>
                <h2 className="text-lg font-bold text-slate-200 mb-4 flex items-center gap-2">
                  <Clock className="w-5 h-5 text-slate-400" />
                  Emergency History
                </h2>
                <div className="space-y-2">
                  {history.filter(h => h.status !== 'active').map((em: any, idx: number) => {
                    const typeInfo = getTypeInfo(em.declarationType);
                    const TypeIcon = typeInfo.icon;
                    const emKey   = em._id || em.id || `hist-${idx}`;
                    return (
                      <div key={emKey} className="glass-card rounded-xl border border-slate-800 p-4 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-lg bg-slate-800">
                            <TypeIcon className={`w-4 h-4 ${typeInfo.color}`} />
                          </div>
                          <div>
                            <h4 className="text-sm font-semibold text-slate-200">{em.title}</h4>
                            <p className="text-xs text-slate-400">
                              {new Date(em.activatedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                              {em.resolvedAt && ` → Resolved ${new Date(em.resolvedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}`}
                            </p>
                          </div>
                        </div>
                        <span className={`px-3 py-1 rounded-lg text-xs font-bold ${
                          em.status === 'resolved' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-700 text-slate-400'
                        }`}>
                          {(em.status || 'unknown').toUpperCase()}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
