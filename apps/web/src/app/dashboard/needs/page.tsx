'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '../../../components/layout/dashboard-layout';
import { api } from '../../../lib/api';
import { MapPin, AlertTriangle, Clock, Users, Plus, X } from 'lucide-react';

const URGENCY_STYLES: Record<string, string> = {
  critical: 'bg-red-500/20 text-red-400 border-red-500/30',
  high: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  medium: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  low: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
};

const CATEGORY_ICONS: Record<string, string> = {
  water: '💧', healthcare: '🏥', education: '📚', sanitation: '🚿',
  infrastructure: '🏗️', food_security: '🍚', employment: '💼',
  safety: '🛡️', environment: '🌿', other: '📋',
};

const DEMO_NEEDS = [
  {
    _id: 'n1', id: 'n1', title: 'Clean Drinking Water Crisis in Rajnandgaon',
    description: 'Over 2,400 villagers lack access to clean drinking water after the main supply pipeline burst. Waterborne diseases are rising rapidly — urgent intervention needed.',
    urgencyLevel: 'critical', urgency: 'critical', category: 'water',
    location: 'Rajnandgaon, Chhattisgarh', affectedPopulation: 2400, aiProcessed: true,
    createdAt: new Date(Date.now() - 2 * 3600000).toISOString(),
  },
  {
    _id: 'n2', id: 'n2', title: 'Emergency Medical Camp Required — Flood Victims',
    description: 'Hundreds of flood-displaced families need immediate primary healthcare and vaccination. The nearest government hospital is 40 km away.',
    urgencyLevel: 'critical', urgency: 'critical', category: 'healthcare',
    location: 'Bhadrachalam, Telangana', affectedPopulation: 860, aiProcessed: true,
    createdAt: new Date(Date.now() - 5 * 3600000).toISOString(),
  },
  {
    _id: 'n3', id: 'n3', title: 'School Rebuilding After Cyclone Damage',
    description: 'The primary school serving 350 children was destroyed in last month\'s cyclone. Classes are being held outdoors, affecting learning quality severely.',
    urgencyLevel: 'high', urgency: 'high', category: 'education',
    location: 'Bhitarkanika, Odisha', affectedPopulation: 350, aiProcessed: true,
    createdAt: new Date(Date.now() - 24 * 3600000).toISOString(),
  },
  {
    _id: 'n4', id: 'n4', title: 'Food Distribution for Drought-Hit Families',
    description: 'Severe drought has decimated local crops. ~1,200 families have exhausted food reserves and are dependent on external relief for survival.',
    urgencyLevel: 'high', urgency: 'high', category: 'food_security',
    location: 'Latur, Maharashtra', affectedPopulation: 1200, aiProcessed: false,
    createdAt: new Date(Date.now() - 48 * 3600000).toISOString(),
  },
  {
    _id: 'n5', id: 'n5', title: 'Bridge Repair Blocking Village Access',
    description: 'The only bridge connecting Chirmiri village to the main road has partially collapsed. Essential supplies and medical aid cannot reach 600 residents.',
    urgencyLevel: 'high', urgency: 'high', category: 'infrastructure',
    location: 'Chirmiri, Chhattisgarh', affectedPopulation: 600, aiProcessed: true,
    createdAt: new Date(Date.now() - 72 * 3600000).toISOString(),
  },
  {
    _id: 'n6', id: 'n6', title: 'Open Defecation in Tribal Settlement',
    description: 'A new tribal settlement of ~300 families lacks sanitation facilities. Health risks are increasing, especially for children and pregnant women.',
    urgencyLevel: 'medium', urgency: 'medium', category: 'sanitation',
    location: 'Koraput, Odisha', affectedPopulation: 300, aiProcessed: false,
    createdAt: new Date(Date.now() - 96 * 3600000).toISOString(),
  },
  {
    _id: 'n7', id: 'n7', title: 'Skill Training for Unemployed Youth',
    description: 'Post-pandemic unemployment has spiked among 18-28 year olds. Vocational training in electronics and plumbing can generate sustainable livelihoods.',
    urgencyLevel: 'medium', urgency: 'medium', category: 'employment',
    location: 'Varanasi, Uttar Pradesh', affectedPopulation: 180, aiProcessed: true,
    createdAt: new Date(Date.now() - 5 * 24 * 3600000).toISOString(),
  },
  {
    _id: 'n8', id: 'n8', title: 'Reforestation Drive in Degraded Forest Zone',
    description: 'Industrial encroachment has degraded 50 hectares of forest cover in the Bandipur buffer zone, impacting wildlife and local ecology.',
    urgencyLevel: 'low', urgency: 'low', category: 'environment',
    location: 'Bandipur, Karnataka', affectedPopulation: 0, aiProcessed: false,
    createdAt: new Date(Date.now() - 7 * 24 * 3600000).toISOString(),
  },
];

export default function NeedsPage() {
  const router = useRouter();
  const [needs, setNeeds] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [selectedNeed, setSelectedNeed] = useState<any>(null);

  useEffect(() => {
    const fetchNeeds = async () => {
      try {
        const res = await api.get('/needs?limit=20&sort=-priorityScore');
        if (res.data.success) {
          const data = res.data.data?.needs || res.data.data || [];
          if (data.length > 0) {
            // Normalize urgencyLevel → urgency for display
            setNeeds(data.map((n: any) => ({ ...n, urgency: n.urgencyLevel || n.urgency })));
            return;
          }
        }
        setNeeds(DEMO_NEEDS);
      } catch {
        setNeeds(DEMO_NEEDS);
      } finally {
        setIsLoading(false);
      }
    };
    fetchNeeds();
  }, []);

  const filtered = filter === 'all' ? needs : needs.filter(n => n.urgency === filter || n.urgencyLevel === filter);

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-100">Community Needs</h1>
            <p className="text-slate-400 mt-1">AI-prioritized needs from field surveys across India</p>
          </div>
          <button
            onClick={() => router.push('/dashboard/report-need')}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium transition-all text-sm shadow-[0_0_15px_rgba(79,70,229,0.3)]"
          >
            <Plus className="w-4 h-4" /> Report New Need
          </button>
        </div>

        {/* Stats bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'Critical', count: needs.filter(n => (n.urgency || n.urgencyLevel) === 'critical').length, color: 'text-red-400', bg: 'bg-red-500/10 border-red-500/20' },
            { label: 'High', count: needs.filter(n => (n.urgency || n.urgencyLevel) === 'high').length, color: 'text-orange-400', bg: 'bg-orange-500/10 border-orange-500/20' },
            { label: 'Medium', count: needs.filter(n => (n.urgency || n.urgencyLevel) === 'medium').length, color: 'text-blue-400', bg: 'bg-blue-500/10 border-blue-500/20' },
            { label: 'Low', count: needs.filter(n => (n.urgency || n.urgencyLevel) === 'low').length, color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20' },
          ].map(s => (
            <div key={s.label} className={`glass-card rounded-xl p-3 border ${s.bg} flex items-center justify-between`}>
              <span className="text-xs text-slate-400">{s.label}</span>
              <span className={`text-xl font-bold ${s.color}`}>{s.count}</span>
            </div>
          ))}
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 flex-wrap">
          {['all', 'critical', 'high', 'medium', 'low'].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-xl text-sm font-medium border transition-all capitalize ${
                filter === f
                  ? 'bg-indigo-600/20 border-indigo-500/50 text-indigo-300'
                  : 'bg-slate-800/50 border-slate-700/50 text-slate-400 hover:text-slate-200'
              }`}
            >
              {f === 'all' ? `All (${needs.length})` : f}
            </button>
          ))}
        </div>

        {/* Needs Grid */}
        {isLoading ? (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : filtered.length === 0 ? (
          <div className="glass-card rounded-2xl p-16 text-center border border-slate-800">
            <MapPin className="w-12 h-12 text-slate-600 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-slate-300">No needs found</h3>
            <p className="text-slate-500 mt-2">Try a different filter or report a new community need.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {filtered.map((need) => (
              <div
                key={need._id || need.id}
                className="glass-card rounded-2xl p-5 border border-slate-800 hover:border-slate-600 transition-all group card-hover cursor-pointer"
                onClick={() => setSelectedNeed(need)}
              >
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{CATEGORY_ICONS[need.category] || '📋'}</span>
                    <span className={`px-2.5 py-1 text-xs font-semibold rounded-lg border capitalize ${URGENCY_STYLES[need.urgency || need.urgencyLevel] || 'bg-slate-700 text-slate-300 border-slate-600'}`}>
                      {need.urgency || need.urgencyLevel}
                    </span>
                    {need.aiProcessed && (
                      <span className="px-2 py-1 text-xs rounded-lg bg-purple-500/10 text-purple-400 border border-purple-500/20">✨ AI</span>
                    )}
                  </div>
                  <span className="text-xs text-slate-500 capitalize">{need.category?.replace('_', ' ')}</span>
                </div>

                <h3 className="text-base font-semibold text-slate-200 mb-2 group-hover:text-white transition-colors line-clamp-2">
                  {need.title}
                </h3>
                <p className="text-sm text-slate-400 line-clamp-2 mb-4">{need.description}</p>

                <div className="flex flex-wrap gap-4 text-xs text-slate-400 mb-4">
                  <span className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5" />{need.location}</span>
                  {need.affectedPopulation > 0 && (
                    <span className="flex items-center gap-1.5"><Users className="w-3.5 h-3.5" />{need.affectedPopulation.toLocaleString()} affected</span>
                  )}
                  <span className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5" />
                    {new Date(need.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                  </span>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={(e) => { e.stopPropagation(); router.push('/dashboard/tasks'); }}
                    className="flex-1 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium transition-colors"
                  >
                    Create Task
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); setSelectedNeed(need); }}
                    className="px-3 py-2 rounded-lg bg-slate-700/50 hover:bg-slate-700 text-slate-300 text-xs font-medium transition-colors border border-slate-600/50"
                  >
                    View Details
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Need Detail Modal */}
      {selectedNeed && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setSelectedNeed(null)}>
          <div className="glass-card rounded-2xl border border-slate-700 p-6 w-full max-w-lg space-y-4 animate-fade-in" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2">
                <span className="text-2xl">{CATEGORY_ICONS[selectedNeed.category] || '📋'}</span>
                <span className={`px-2.5 py-1 text-xs font-semibold rounded-lg border capitalize ${URGENCY_STYLES[selectedNeed.urgency || selectedNeed.urgencyLevel] || 'bg-slate-700 text-slate-300 border-slate-600'}`}>
                  {selectedNeed.urgency || selectedNeed.urgencyLevel}
                </span>
                {selectedNeed.aiProcessed && (
                  <span className="px-2 py-1 text-xs rounded-lg bg-purple-500/10 text-purple-400 border border-purple-500/20">✨ AI</span>
                )}
              </div>
              <button onClick={() => setSelectedNeed(null)} className="p-1.5 rounded-lg hover:bg-slate-700 text-slate-400 transition-colors"><X className="w-4 h-4" /></button>
            </div>
            <h2 className="text-lg font-bold text-slate-100">{selectedNeed.title}</h2>
            <p className="text-sm text-slate-300 leading-relaxed">{selectedNeed.description}</p>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="bg-slate-800/60 rounded-xl p-3">
                <div className="text-xs text-slate-400 mb-1 flex items-center gap-1"><MapPin className="w-3 h-3" /> Location</div>
                <div className="text-slate-200 font-medium">{selectedNeed.location}</div>
              </div>
              {selectedNeed.affectedPopulation > 0 && (
                <div className="bg-slate-800/60 rounded-xl p-3">
                  <div className="text-xs text-slate-400 mb-1 flex items-center gap-1"><Users className="w-3 h-3" /> Affected</div>
                  <div className="text-slate-200 font-medium">{selectedNeed.affectedPopulation.toLocaleString()} people</div>
                </div>
              )}
            </div>
            <div className="flex gap-3 pt-2">
              <button onClick={() => { setSelectedNeed(null); router.push('/dashboard/report-need'); }} className="flex-1 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold transition-colors">Report Similar</button>
              <button onClick={() => setSelectedNeed(null)} className="px-4 py-2.5 rounded-xl bg-slate-700 hover:bg-slate-600 text-slate-300 text-sm transition-colors">Close</button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
