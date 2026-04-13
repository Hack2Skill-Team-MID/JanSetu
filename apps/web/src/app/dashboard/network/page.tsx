'use client';

import { useEffect, useState } from 'react';
import { api } from '../../../lib/api';
import DashboardLayout from '../../../components/layout/dashboard-layout';
import { 
  Globe, Search, Shield, Users, MapPin, TrendingUp, ExternalLink 
} from 'lucide-react';

export default function NetworkPage() {
  const [feed, setFeed] = useState<any[]>([]);
  const [orgs, setOrgs] = useState<any[]>([]);
  const [tab, setTab] = useState<'feed' | 'ngos'>('feed');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [feedRes, orgsRes] = await Promise.all([
          api.get('/network/feed'),
          api.get('/network/ngos'),
        ]);
        if (feedRes.data.success) setFeed(feedRes.data.data.feed);
        if (orgsRes.data.success) setOrgs(orgsRes.data.data.organizations);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-3">
            <Globe className="w-6 h-6 text-indigo-400" />
            NGO Network
          </h1>
          <p className="text-slate-400 mt-1">Discover organizations and opportunities across India</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-2">
          {(['feed', 'ngos'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                tab === t
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-800/50 text-slate-400 hover:text-slate-200 border border-slate-700'
              }`}
            >
              {t === 'feed' ? '📡 Live Feed' : '🏢 NGO Directory'}
            </button>
          ))}
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : tab === 'feed' ? (
          /* ─── Live Feed ─── */
          <div className="space-y-4">
            {feed.map((item: any, idx: number) => (
              <div key={idx} className="glass-card rounded-2xl border border-slate-800 p-5 hover:border-indigo-500/30 transition-colors">
                <div className="flex items-start gap-4">
                  <div className={`p-3 rounded-xl shrink-0 ${
                    item.type === 'campaign' ? 'bg-indigo-500/10 text-indigo-400' : 'bg-red-500/10 text-red-400'
                  }`}>
                    {item.type === 'campaign' ? <TrendingUp className="w-5 h-5" /> : <MapPin className="w-5 h-5" />}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`px-2 py-0.5 text-xs font-bold rounded ${
                        item.type === 'campaign' ? 'bg-indigo-500/15 text-indigo-400' : 'bg-red-500/15 text-red-400'
                      }`}>
                        {item.type === 'campaign' ? 'CAMPAIGN' : 'NEED'}
                      </span>
                      <span className="text-xs text-slate-500">
                        {new Date(item.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                      </span>
                    </div>

                    <h3 className="text-base font-semibold text-slate-100">{item.title}</h3>
                    <p className="text-sm text-slate-400 mt-1 line-clamp-2">{item.description}</p>

                    <div className="flex items-center gap-4 mt-3 text-xs text-slate-400">
                      {item.location && (
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" /> {item.location}
                        </span>
                      )}
                      {item.category && (
                        <span className="px-2 py-0.5 rounded-md bg-slate-800 text-slate-300">
                          {item.category}
                        </span>
                      )}
                      {item.urgency && (
                        <span className={`px-2 py-0.5 rounded-md font-semibold ${
                          item.urgency === 'critical' ? 'bg-red-500/15 text-red-400' :
                          item.urgency === 'high' ? 'bg-orange-500/15 text-orange-400' :
                          'bg-yellow-500/15 text-yellow-400'
                        }`}>
                          {item.urgency}
                        </span>
                      )}
                      {item.affectedPopulation && (
                        <span className="flex items-center gap-1">
                          <Users className="w-3 h-3" /> {item.affectedPopulation.toLocaleString()} affected
                        </span>
                      )}
                    </div>

                    {item.organization && (
                      <div className="flex items-center gap-2 mt-3">
                        <div className="w-5 h-5 rounded-full bg-indigo-500/20 flex items-center justify-center text-xs font-bold text-indigo-400">
                          {item.organization.name?.[0]}
                        </div>
                        <span className="text-xs text-slate-300">{item.organization.name}</span>
                        <Shield className="w-3 h-3 text-emerald-400" />
                        <span className="text-xs text-emerald-400">{item.organization.trustScore}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* ─── NGO Directory ─── */
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {orgs.map((org: any) => (
              <div key={org._id} className="glass-card rounded-2xl border border-slate-800 p-6 hover:border-indigo-500/30 transition-colors">
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center text-lg font-bold text-white">
                    {org.name?.[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-base font-semibold text-slate-100">{org.name}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`px-2 py-0.5 text-xs rounded-md font-semibold ${
                        org.trustTier === 'verified' ? 'bg-emerald-500/15 text-emerald-400' :
                        'bg-slate-700 text-slate-300'
                      }`}>
                        {org.trustTier === 'verified' ? '✓ Verified' : org.trustTier}
                      </span>
                      <span className="text-xs text-slate-400">{org.region}</span>
                    </div>
                  </div>
                </div>

                <p className="text-sm text-slate-400 line-clamp-2 mb-4">{org.description}</p>

                {/* Trust Score */}
                <div className="mb-4">
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-slate-400 flex items-center gap-1"><Shield className="w-3 h-3" /> Trust Score</span>
                    <span className="text-indigo-400 font-bold">{org.trustScore}/100</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-800 rounded-full">
                    <div className="h-full bg-gradient-to-r from-indigo-600 to-emerald-500 rounded-full" style={{ width: `${org.trustScore}%` }} />
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-2 mb-4">
                  <div className="text-center p-2 rounded-lg bg-slate-800/50">
                    <div className="text-sm font-bold text-slate-100">{org.stats?.activeCampaigns || 0}</div>
                    <div className="text-xs text-slate-500">Campaigns</div>
                  </div>
                  <div className="text-center p-2 rounded-lg bg-slate-800/50">
                    <div className="text-sm font-bold text-slate-100">{org.stats?.totalVolunteers || 0}</div>
                    <div className="text-xs text-slate-500">Volunteers</div>
                  </div>
                  <div className="text-center p-2 rounded-lg bg-slate-800/50">
                    <div className="text-sm font-bold text-slate-100">{(org.stats?.peopleHelped || 0).toLocaleString()}</div>
                    <div className="text-xs text-slate-500">Helped</div>
                  </div>
                </div>

                <button className="w-full py-2.5 rounded-xl bg-indigo-600/10 border border-indigo-500/20 text-indigo-400 text-sm font-semibold hover:bg-indigo-600 hover:text-white transition-all flex items-center justify-center gap-2">
                  View Profile <ExternalLink className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
