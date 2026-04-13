'use client';

import { useEffect, useState } from 'react';
import { api } from '../../../lib/api';
import DashboardLayout from '../../../components/layout/dashboard-layout';
import { 
  Target, Users, IndianRupee, TrendingUp, MapPin, 
  Calendar, ChevronRight, Sparkles, Heart 
} from 'lucide-react';

export default function CampaignsPage() {
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await api.get('/campaigns');
        if (res.data.success) setCampaigns(res.data.data.campaigns);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetch();
  }, []);

  const progress = (raised: number, goal: number) => 
    goal > 0 ? Math.min(Math.round((raised / goal) * 100), 100) : 0;

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-3">
              <Target className="w-6 h-6 text-indigo-400" />
              Active Campaigns
            </h1>
            <p className="text-slate-400 mt-1">Public campaigns across the NGO network</p>
          </div>
          <button className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-semibold transition-colors flex items-center gap-2">
            <Sparkles className="w-4 h-4" /> Create Campaign
          </button>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {campaigns.map((c: any) => (
              <div key={c._id} className="glass-card rounded-2xl border border-slate-800 overflow-hidden hover:border-indigo-500/40 transition-all group">
                {/* Header */}
                <div className="p-6 pb-4">
                  <div className="flex items-start justify-between mb-3">
                    <span className={`px-2.5 py-1 text-xs font-bold rounded-lg ${
                      c.category === 'water' ? 'bg-blue-500/15 text-blue-400' :
                      c.category === 'healthcare' ? 'bg-emerald-500/15 text-emerald-400' :
                      c.category === 'education' ? 'bg-purple-500/15 text-purple-400' :
                      'bg-slate-700 text-slate-300'
                    }`}>
                      {c.category?.toUpperCase()}
                    </span>
                    {c.featured && (
                      <span className="px-2 py-1 text-xs bg-amber-500/15 text-amber-400 rounded-lg font-semibold flex items-center gap-1">
                        <Sparkles className="w-3 h-3" /> Featured
                      </span>
                    )}
                  </div>

                  <h3 className="text-lg font-semibold text-slate-100 mb-2 group-hover:text-indigo-300 transition-colors">
                    {c.title}
                  </h3>
                  <p className="text-sm text-slate-400 line-clamp-2 mb-4">{c.description}</p>

                  {/* Organization badge */}
                  {c.organizationId && (
                    <div className="flex items-center gap-2 mb-4">
                      <div className="w-6 h-6 rounded-full bg-indigo-500/20 flex items-center justify-center text-xs font-bold text-indigo-400">
                        {c.organizationId.name?.[0]}
                      </div>
                      <span className="text-xs text-slate-300 font-medium">{c.organizationId.name}</span>
                      {c.organizationId.trustTier === 'verified' && (
                        <span className="text-xs text-emerald-400">✓ Verified</span>
                      )}
                    </div>
                  )}
                </div>

                {/* Funding Progress */}
                <div className="px-6 pb-4">
                  <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
                    <span className="flex items-center gap-1">
                      <IndianRupee className="w-3 h-3" />
                      ₹{(c.goals?.fundingRaised || 0).toLocaleString()} raised
                    </span>
                    <span>₹{(c.goals?.fundingGoal || 0).toLocaleString()} goal</span>
                  </div>
                  <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-indigo-600 to-purple-500 rounded-full transition-all duration-500"
                      style={{ width: `${progress(c.goals?.fundingRaised, c.goals?.fundingGoal)}%` }}
                    />
                  </div>
                  <div className="text-right text-xs text-indigo-400 mt-1 font-semibold">
                    {progress(c.goals?.fundingRaised, c.goals?.fundingGoal)}%
                  </div>
                </div>

                {/* Stats */}
                <div className="px-6 pb-4 grid grid-cols-3 gap-3">
                  <div className="text-center p-2 rounded-lg bg-slate-800/50">
                    <div className="text-sm font-bold text-slate-100">{c.goals?.volunteersJoined || 0}</div>
                    <div className="text-xs text-slate-500">Volunteers</div>
                  </div>
                  <div className="text-center p-2 rounded-lg bg-slate-800/50">
                    <div className="text-sm font-bold text-slate-100">{c.goals?.peopleHelped || 0}</div>
                    <div className="text-xs text-slate-500">Helped</div>
                  </div>
                  <div className="text-center p-2 rounded-lg bg-slate-800/50">
                    <div className="text-sm font-bold text-slate-100">{c.milestones?.filter((m: any) => m.completed).length || 0}</div>
                    <div className="text-xs text-slate-500">Milestones</div>
                  </div>
                </div>

                {/* Footer */}
                <div className="px-6 py-4 border-t border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-3 text-xs text-slate-400">
                    <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {c.location}</span>
                  </div>
                  <button className="flex items-center gap-1 text-sm font-semibold text-indigo-400 hover:text-indigo-300 transition-colors">
                    <Heart className="w-4 h-4" /> Donate
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
