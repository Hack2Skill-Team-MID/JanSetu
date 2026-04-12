'use client';

import { useEffect, useState } from 'react';
import DashboardLayout from '../../../components/layout/dashboard-layout';
import { api } from '../../../lib/api';
import { MapPin, AlertTriangle, Clock, Users, Plus, Filter } from 'lucide-react';

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

export default function NeedsPage() {
  const [needs, setNeeds] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await api.get('/needs?limit=20&sort=urgency');
        if (res.data.success) setNeeds(res.data.data.needs || res.data.data);
      } catch (e) { console.error(e); }
      finally { setIsLoading(false); }
    };
    fetch();
  }, []);

  const filtered = filter === 'all' ? needs : needs.filter(n => n.urgency === filter);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-100">Community Needs</h1>
            <p className="text-slate-400 mt-1">AI-prioritized needs from field surveys across India</p>
          </div>
          <button className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium transition-all text-sm shadow-[0_0_15px_rgba(79,70,229,0.3)]">
            <Plus className="w-4 h-4" /> Report New Need
          </button>
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
              <div key={need._id} className="glass-card rounded-2xl p-5 border border-slate-800 hover:border-slate-700 transition-all group">
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{CATEGORY_ICONS[need.category] || '📋'}</span>
                    <span className={`px-2.5 py-1 text-xs font-semibold rounded-lg border capitalize ${URGENCY_STYLES[need.urgency] || 'bg-slate-700 text-slate-300 border-slate-600'}`}>
                      {need.urgency}
                    </span>
                    {need.aiProcessed && (
                      <span className="px-2 py-1 text-xs rounded-lg bg-purple-500/10 text-purple-400 border border-purple-500/20">AI</span>
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
                  {need.affectedPopulation && (
                    <span className="flex items-center gap-1.5"><Users className="w-3.5 h-3.5" />{need.affectedPopulation.toLocaleString()} affected</span>
                  )}
                  <span className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5" />
                    {new Date(need.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                  </span>
                </div>

                <div className="flex gap-2">
                  <button className="flex-1 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium transition-colors">
                    Create Task
                  </button>
                  <button className="px-3 py-2 rounded-lg bg-slate-700/50 hover:bg-slate-700 text-slate-300 text-xs font-medium transition-colors border border-slate-600/50">
                    View Details
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
