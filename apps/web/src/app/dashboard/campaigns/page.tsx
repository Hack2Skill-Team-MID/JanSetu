'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '../../../lib/api';
import DashboardLayout from '../../../components/layout/dashboard-layout';
import {
  Target, Users, IndianRupee, TrendingUp, MapPin,
  Calendar, ChevronRight, Sparkles, Heart, Plus, Share2, Copy, Check
} from 'lucide-react';

const DEMO_CAMPAIGNS = [
  {
    _id: 'c1', id: 'c1',
    title: 'Flood Relief — Assam 2025',
    description: 'Emergency flood relief providing clean water, dry rations, and temporary shelter to 5,000+ displaced families in lower Assam districts.',
    category: 'water', location: 'Dhubri, Assam', featured: true,
    status: 'active', visibility: 'public',
    organizationId: { _id: 'o1', name: 'Assam Relief Foundation', trustTier: 'verified' },
    goals: { fundingGoal: 2500000, fundingRaised: 1876000, volunteersNeeded: 50, volunteersJoined: 38, peopleToHelp: 5000, peopleHelped: 3200 },
    milestones: [
      { title: 'Water purification kits distributed', completed: true },
      { title: 'Temporary shelters erected', completed: true },
      { title: 'Medical camp operational', completed: false },
    ],
    createdAt: new Date(Date.now() - 5 * 24 * 3600000).toISOString(),
  },
  {
    _id: 'c2', id: 'c2',
    title: 'Digital Classrooms for Rural Schools',
    description: 'Setting up 100 digital classrooms equipped with tablets, projectors, and offline learning software in remote Jharkhand villages to bridge the education gap.',
    category: 'education', location: 'Dumka, Jharkhand', featured: true,
    status: 'active', visibility: 'public',
    organizationId: { _id: 'o2', name: 'EduReach India', trustTier: 'verified' },
    goals: { fundingGoal: 1800000, fundingRaised: 1260000, volunteersNeeded: 30, volunteersJoined: 24, peopleToHelp: 8000, peopleHelped: 4500 },
    milestones: [
      { title: 'First 25 classrooms active', completed: true },
      { title: 'Teacher training program', completed: true },
      { title: 'Next 75 classrooms', completed: false },
    ],
    createdAt: new Date(Date.now() - 12 * 24 * 3600000).toISOString(),
  },
  {
    _id: 'c3', id: 'c3',
    title: 'Mobile Healthcare for Tribal Communities',
    description: 'Deploying 10 mobile health vans to provide primary care, vaccinations, and maternal health services to 15,000 tribal community members in Chhattisgarh.',
    category: 'healthcare', location: 'Bastar, Chhattisgarh', featured: false,
    status: 'active', visibility: 'public',
    organizationId: { _id: 'o3', name: 'Aarogya Sewa Trust', trustTier: 'verified' },
    goals: { fundingGoal: 3200000, fundingRaised: 1984000, volunteersNeeded: 60, volunteersJoined: 42, peopleToHelp: 15000, peopleHelped: 8700 },
    milestones: [
      { title: '5 mobile vans deployed', completed: true },
      { title: 'Vaccination drive Phase 1', completed: true },
      { title: 'Additional 5 vans', completed: false },
    ],
    createdAt: new Date(Date.now() - 20 * 24 * 3600000).toISOString(),
  },
  {
    _id: 'c4', id: 'c4',
    title: 'Solar Energy for 500 Villages',
    description: 'Off-grid solar installations for villages in Rajasthan with zero electricity access. Each installation powers homes, schools, and community water pumps.',
    category: 'infrastructure', location: 'Barmer, Rajasthan', featured: false,
    status: 'active', visibility: 'public',
    organizationId: { _id: 'o4', name: 'Green Earth NGO', trustTier: 'standard' },
    goals: { fundingGoal: 5000000, fundingRaised: 2100000, volunteersNeeded: 80, volunteersJoined: 31, peopleToHelp: 25000, peopleHelped: 9500 },
    milestones: [
      { title: '100 villages powered', completed: true },
      { title: 'School solar installations', completed: false },
      { title: 'Water pump integrations', completed: false },
    ],
    createdAt: new Date(Date.now() - 30 * 24 * 3600000).toISOString(),
  },
  {
    _id: 'c5', id: 'c5',
    title: 'Women Entrepreneur Micro-Finance Drive',
    description: 'Micro-loans and business mentorship for 2,000 rural women to start or scale self-help group enterprises in UP, Bihar, and Madhya Pradesh.',
    category: 'employment', location: 'Lucknow, Uttar Pradesh', featured: true,
    status: 'active', visibility: 'public',
    organizationId: { _id: 'o5', name: 'Mahila Pragati Foundation', trustTier: 'verified' },
    goals: { fundingGoal: 1500000, fundingRaised: 1050000, volunteersNeeded: 25, volunteersJoined: 22, peopleToHelp: 2000, peopleHelped: 1400 },
    milestones: [
      { title: '500 women onboarded', completed: true },
      { title: 'First loan disbursement cycle', completed: true },
      { title: 'Mentorship cohort launch', completed: true },
    ],
    createdAt: new Date(Date.now() - 45 * 24 * 3600000).toISOString(),
  },
];

export default function CampaignsPage() {
  const router = useRouter();
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [creating, setCreating] = useState(false);
  const [createForm, setCreateForm] = useState({ title: '', description: '', category: 'education', fundingGoal: '', location: '' });
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleShare = (campaignId: string) => {
    const url = `${window.location.origin}/dashboard/donate?campaign=${campaignId}`;
    navigator.clipboard.writeText(url).then(() => {
      setCopiedId(campaignId);
      setTimeout(() => setCopiedId(null), 2000);
    });
  };

  useEffect(() => {
    const fetchCampaigns = async () => {
      try {
        const res = await api.get('/campaigns');
        if (res.data.success) {
          const data = res.data.data?.campaigns || res.data.data || [];
          if (Array.isArray(data) && data.length > 0) {
            setCampaigns(data);
            return;
          }
        }
        setCampaigns(DEMO_CAMPAIGNS);
      } catch {
        setCampaigns(DEMO_CAMPAIGNS);
      } finally {
        setIsLoading(false);
      }
    };
    fetchCampaigns();
  }, []);

  const handleCreate = async () => {
    if (!createForm.title || !createForm.description || !createForm.location) return;
    setCreating(true);
    try {
      const res = await api.post('/campaigns', {
        title: createForm.title,
        description: createForm.description,
        category: createForm.category,
        location: createForm.location,
        goals: { fundingGoal: parseInt(createForm.fundingGoal) || 0 },
        visibility: 'public',
      });
      if (res.data.success) {
        setShowCreate(false);
        setCreateForm({ title: '', description: '', category: 'education', fundingGoal: '', location: '' });
        const r = await api.get('/campaigns');
        if (r.data.success) setCampaigns(r.data.data?.campaigns || r.data.data || DEMO_CAMPAIGNS);
      }
    } catch {
      // Add to demo campaigns locally
      const newCampaign = {
        _id: `demo-${Date.now()}`, id: `demo-${Date.now()}`,
        title: createForm.title, description: createForm.description,
        category: createForm.category, location: createForm.location,
        featured: false, status: 'active', visibility: 'public',
        organizationId: null,
        goals: { fundingGoal: parseInt(createForm.fundingGoal) || 100000, fundingRaised: 0, volunteersNeeded: 10, volunteersJoined: 0, peopleToHelp: 100, peopleHelped: 0 },
        milestones: [],
        createdAt: new Date().toISOString(),
      };
      setCampaigns(prev => [newCampaign, ...prev]);
      setShowCreate(false);
      setCreateForm({ title: '', description: '', category: 'education', fundingGoal: '', location: '' });
    } finally {
      setCreating(false);
    }
  };

  const progress = (raised: number, goal: number) =>
    goal > 0 ? Math.min(Math.round((raised / goal) * 100), 100) : 0;

  const CATEGORY_COLORS: Record<string, string> = {
    water: 'bg-blue-500/15 text-blue-400',
    healthcare: 'bg-emerald-500/15 text-emerald-400',
    education: 'bg-purple-500/15 text-purple-400',
    infrastructure: 'bg-amber-500/15 text-amber-400',
    employment: 'bg-pink-500/15 text-pink-400',
    environment: 'bg-teal-500/15 text-teal-400',
    food_security: 'bg-orange-500/15 text-orange-400',
  };

  return (
    <DashboardLayout>
      <div className="space-y-8 animate-fade-in">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-3">
              <Target className="w-6 h-6 text-indigo-400" />
              Active Campaigns
            </h1>
            <p className="text-slate-400 mt-1">Public campaigns across the NGO network</p>
          </div>
          <button
            onClick={() => setShowCreate(true)}
            className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-semibold transition-all flex items-center gap-2 shadow-[0_0_15px_rgba(79,70,229,0.3)]"
          >
            <Plus className="w-4 h-4" /> Create Campaign
          </button>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: 'Active Campaigns', value: campaigns.length, icon: Target, color: 'text-indigo-400' },
            { label: 'Total Raised', value: `₹${(campaigns.reduce((s, c) => s + (c.goals?.fundingRaised || 0), 0) / 100000).toFixed(1)}L`, icon: IndianRupee, color: 'text-pink-400' },
            { label: 'Volunteers', value: campaigns.reduce((s, c) => s + (c.goals?.volunteersJoined || 0), 0), icon: Users, color: 'text-emerald-400' },
            { label: 'People Helped', value: campaigns.reduce((s, c) => s + (c.goals?.peopleHelped || 0), 0).toLocaleString(), icon: TrendingUp, color: 'text-amber-400' },
          ].map(stat => (
            <div key={stat.label} className="glass-card rounded-2xl border border-slate-800 p-4 flex items-center gap-3">
              <div className={`p-2 rounded-xl bg-slate-800/50 ${stat.color}`}>
                <stat.icon className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xl font-bold text-slate-100">{stat.value}</div>
                <div className="text-xs text-slate-400">{stat.label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Campaign Cards */}
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {campaigns.map((c: any) => (
              <div key={c._id || c.id} className="glass-card rounded-2xl border border-slate-800 overflow-hidden hover:border-indigo-500/40 transition-all group card-hover">
                {/* Header */}
                <div className="p-6 pb-4">
                  <div className="flex items-start justify-between mb-3">
                    <span className={`px-2.5 py-1 text-xs font-bold rounded-lg ${CATEGORY_COLORS[c.category] || 'bg-slate-700 text-slate-300'}`}>
                      {c.category?.replace('_', ' ').toUpperCase()}
                    </span>
                    {c.featured && (
                      <span className="px-2 py-1 text-xs bg-amber-500/15 text-amber-400 rounded-lg font-semibold flex items-center gap-1">
                        <Sparkles className="w-3 h-3" /> Featured
                      </span>
                    )}
                  </div>
                  <h3 className="text-lg font-semibold text-slate-100 mb-2 group-hover:text-indigo-300 transition-colors line-clamp-2">
                    {c.title}
                  </h3>
                  <p className="text-sm text-slate-400 line-clamp-2 mb-4">{c.description}</p>
                  {c.organizationId && (
                    <div className="flex items-center gap-2 mb-2">
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
                      className="h-full bg-gradient-to-r from-indigo-600 to-purple-500 rounded-full transition-all duration-700"
                      style={{ width: `${progress(c.goals?.fundingRaised, c.goals?.fundingGoal)}%` }}
                    />
                  </div>
                  <div className="text-right text-xs text-indigo-400 mt-1 font-semibold">
                    {progress(c.goals?.fundingRaised, c.goals?.fundingGoal)}% funded
                  </div>
                </div>

                {/* Stats */}
                <div className="px-6 pb-4 grid grid-cols-3 gap-3">
                  <div className="text-center p-2 rounded-lg bg-slate-800/50">
                    <div className="text-sm font-bold text-slate-100">{c.goals?.volunteersJoined || 0}/{c.goals?.volunteersNeeded || 0}</div>
                    <div className="text-xs text-slate-500">Volunteers</div>
                  </div>
                  <div className="text-center p-2 rounded-lg bg-slate-800/50">
                    <div className="text-sm font-bold text-slate-100">{(c.goals?.peopleHelped || 0).toLocaleString()}</div>
                    <div className="text-xs text-slate-500">Helped</div>
                  </div>
                  <div className="text-center p-2 rounded-lg bg-slate-800/50">
                    <div className="text-sm font-bold text-slate-100">{c.milestones?.filter((m: any) => m.completed).length || 0}/{c.milestones?.length || 0}</div>
                    <div className="text-xs text-slate-500">Milestones</div>
                  </div>
                </div>

                {/* Footer */}
                <div className="px-6 py-4 border-t border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-3 text-xs text-slate-400">
                    <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {c.location}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleShare(c._id || c.id)}
                      className="flex items-center gap-1 text-xs font-medium text-slate-400 hover:text-indigo-400 transition-colors px-2 py-1.5 rounded-lg hover:bg-indigo-500/10"
                    >
                      {copiedId === (c._id || c.id) ? <><Check className="w-3.5 h-3.5" /> Copied!</> : <><Copy className="w-3.5 h-3.5" /> Share</>}
                    </button>
                    <button
                      onClick={() => router.push(`/dashboard/donate?campaign=${c._id || c.id}`)}
                      className="flex items-center gap-1 text-sm font-semibold text-pink-400 hover:text-pink-300 transition-colors"
                    >
                      <Heart className="w-4 h-4" /> Donate
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Create Campaign Modal */}
        {showCreate && (
          <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setShowCreate(false)}>
            <div className="glass-card rounded-2xl border border-slate-700 p-6 w-full max-w-md space-y-4 animate-fade-in" onClick={(e) => e.stopPropagation()}>
              <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2"><Sparkles className="w-5 h-5 text-indigo-400" /> New Campaign</h2>
              <input
                value={createForm.title}
                onChange={e => setCreateForm(p => ({ ...p, title: e.target.value }))}
                placeholder="Campaign title *"
                className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-slate-200 focus:border-indigo-500 focus:outline-none"
              />
              <textarea
                value={createForm.description}
                onChange={e => setCreateForm(p => ({ ...p, description: e.target.value }))}
                placeholder="Describe your campaign..."
                rows={3}
                className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-slate-200 focus:border-indigo-500 focus:outline-none resize-none"
              />
              <div className="grid grid-cols-2 gap-3">
                <select
                  value={createForm.category}
                  onChange={e => setCreateForm(p => ({ ...p, category: e.target.value }))}
                  className="px-3 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-slate-200 focus:border-indigo-500 focus:outline-none"
                >
                  {['education','healthcare','water','food_security','infrastructure','environment','employment','other'].map(c => (
                    <option key={c} value={c}>{c.replace('_', ' ')}</option>
                  ))}
                </select>
                <input
                  value={createForm.fundingGoal}
                  onChange={e => setCreateForm(p => ({ ...p, fundingGoal: e.target.value }))}
                  placeholder="Funding goal (₹)"
                  type="number"
                  className="px-3 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-slate-200 focus:border-indigo-500 focus:outline-none"
                />
              </div>
              <input
                value={createForm.location}
                onChange={e => setCreateForm(p => ({ ...p, location: e.target.value }))}
                placeholder="Location (e.g. Mumbai, Maharashtra) *"
                className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-slate-200 focus:border-indigo-500 focus:outline-none"
              />
              <div className="flex gap-3">
                <button onClick={() => setShowCreate(false)} className="flex-1 py-2.5 rounded-xl bg-slate-700 hover:bg-slate-600 text-slate-300 text-sm font-medium transition-colors">Cancel</button>
                <button
                  onClick={handleCreate}
                  disabled={creating || !createForm.title || !createForm.location}
                  className="flex-1 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold disabled:opacity-40 transition-colors"
                >
                  {creating ? 'Creating...' : 'Create Campaign'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
