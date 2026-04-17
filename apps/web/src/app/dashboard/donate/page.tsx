'use client';

import { useEffect, useState, Suspense, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { api } from '../../../lib/api';
import DashboardLayout from '../../../components/layout/dashboard-layout';
import { useAuthStore } from '../../../store/auth-store';
import { useTranslation } from '../../../lib/i18n';
import {
  Heart, Search, Filter, Eye, EyeOff, Send, CheckCircle2,
  X, IndianRupee, TrendingUp, Gift, SlidersHorizontal,
} from 'lucide-react';

import DonationCard from '../../../components/donations/donation-card';
import FundFlowTracker from '../../../components/donations/fund-flow-tracker';
import FundDistributionChart from '../../../components/donations/fund-distribution-chart';
import ImpactStats from '../../../components/donations/impact-stats';

/* ─── Demo Data ─────────────────────────────────────────────── */
const DEMO_CAMPAIGNS = [
  { _id: 'c1', title: 'Flood Relief — Assam 2025', description: 'Emergency relief for 5,000+ displaced families in flood-hit Assam.', category: 'water', urgencyLevel: 'critical', organizationId: { name: 'Assam Relief Foundation' }, goals: { fundingGoal: 2500000, fundingRaised: 1876000, peopleToHelp: 5000 }, endDate: new Date(Date.now() + 8 * 86400000).toISOString(), donors: 342 },
  { _id: 'c2', title: 'Digital Classrooms for Rural Schools', description: 'Setting up 100 digital classrooms in Jharkhand rural areas.', category: 'education', urgencyLevel: 'high', organizationId: { name: 'EduReach India' }, goals: { fundingGoal: 1800000, fundingRaised: 1260000, peopleToHelp: 8000 }, endDate: new Date(Date.now() + 22 * 86400000).toISOString(), donors: 214 },
  { _id: 'c3', title: 'Mobile Healthcare — Tribal Communities', description: 'Mobile health vans providing care to 15,000 tribal members.', category: 'healthcare', urgencyLevel: 'high', organizationId: { name: 'Aarogya Sewa Trust' }, goals: { fundingGoal: 3200000, fundingRaised: 1984000, peopleToHelp: 15000 }, endDate: new Date(Date.now() + 35 * 86400000).toISOString(), donors: 498 },
  { _id: 'c4', title: 'Solar Energy for 500 Villages', description: 'Off-grid solar power for zero-electricity villages in Rajasthan.', category: 'infrastructure', urgencyLevel: 'medium', organizationId: { name: 'Green Earth NGO' }, goals: { fundingGoal: 5000000, fundingRaised: 2100000, peopleToHelp: 25000 }, endDate: new Date(Date.now() + 60 * 86400000).toISOString(), donors: 671 },
  { _id: 'c5', title: 'Women Entrepreneur Micro-Finance', description: 'Micro-loans for 2,000 rural women entrepreneurs across Bihar.', category: 'employment', urgencyLevel: 'medium', organizationId: { name: 'Mahila Pragati Foundation' }, goals: { fundingGoal: 1500000, fundingRaised: 1050000, peopleToHelp: 2000 }, endDate: new Date(Date.now() + 45 * 86400000).toISOString(), donors: 187 },
  { _id: 'c6', title: 'Food Security — UP Drought Relief', description: 'Emergency food kits for drought-affected families in Uttar Pradesh.', category: 'food', urgencyLevel: 'critical', organizationId: { name: 'Annadaan Trust' }, goals: { fundingGoal: 1200000, fundingRaised: 420000, peopleToHelp: 3500 }, endDate: new Date(Date.now() + 5 * 86400000).toISOString(), donors: 128 },
];

const DEMO_MY_DONATIONS = {
  totalDonated: 26500,
  count: 4,
  donations: [
    { id: 'd1', amount: 10000, campaign: { title: 'Flood Relief — Assam 2025' }, organization: { name: 'Assam Relief Foundation' }, type: 'one_time', paymentStatus: 'completed', createdAt: new Date(Date.now() - 2 * 86400000).toISOString() },
    { id: 'd2', amount: 8500,  campaign: { title: 'Digital Classrooms'       }, organization: { name: 'EduReach India'           }, type: 'recurring', paymentStatus: 'completed', createdAt: new Date(Date.now() - 10 * 86400000).toISOString() },
    { id: 'd3', amount: 5000,  campaign: { title: 'Mobile Healthcare'        }, organization: { name: 'Aarogya Sewa Trust'        }, type: 'one_time',  paymentStatus: 'completed', createdAt: new Date(Date.now() - 18 * 86400000).toISOString() },
    { id: 'd4', amount: 3000,  campaign: { title: 'Solar Energy Villages'    }, organization: { name: 'Green Earth NGO'           }, type: 'one_time',  paymentStatus: 'completed', createdAt: new Date(Date.now() - 30 * 86400000).toISOString() },
  ],
};

const QUICK_AMOUNTS = [500, 1000, 2000, 5000, 10000];
const CATEGORIES = ['all', 'water', 'healthcare', 'education', 'infrastructure', 'employment', 'food'];

/* ─── Default page wrapper ──────────────────────────────────── */
export default function DonatePage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <DonatePortalInner />
    </Suspense>
  );
}

/* ─── Main inner component ──────────────────────────────────── */
function DonatePortalInner() {
  const searchParams = useSearchParams();
  const { t } = useTranslation();
  const preselectedCampaign = searchParams.get('campaign');
  const user = useAuthStore((s) => s.user);

  /* State */
  const [campaigns, setCampaigns]           = useState<any[]>([]);
  const [myDonations, setMyDonations]       = useState<any>(DEMO_MY_DONATIONS);
  const [selectedCampaign, setSelectedCampaign] = useState<string | null>(preselectedCampaign);
  const [amount, setAmount]                 = useState('');
  const [message, setMessage]               = useState('');
  const [isAnonymous, setIsAnonymous]       = useState(false);
  const [donating, setDonating]             = useState(false);
  const [success, setSuccess]               = useState(false);
  const [isLoading, setIsLoading]           = useState(true);
  const [showPayPanel, setShowPayPanel]     = useState(false);
  const [search, setSearch]                 = useState('');
  const [catFilter, setCatFilter]           = useState('all');
  const [showHistory, setShowHistory]       = useState(false);

  /* Fetch */
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [campRes, donRes] = await Promise.all([
          api.get('/campaigns'),
          api.get('/donations/my').catch(() => ({ data: { success: false } })),
        ]);
        const campData = campRes.data?.data?.campaigns || campRes.data?.data || [];
        setCampaigns(Array.isArray(campData) && campData.length > 0 ? campData : DEMO_CAMPAIGNS);
        if (donRes.data.success && donRes.data.data) setMyDonations(donRes.data.data);
      } catch {
        setCampaigns(DEMO_CAMPAIGNS);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  /* Auto-open pay panel when campaign is preselected */
  useEffect(() => { if (preselectedCampaign) setShowPayPanel(true); }, [preselectedCampaign]);

  /* Razorpay loader */
  const loadRazorpayScript = (): Promise<boolean> => new Promise((resolve) => {
    if ((window as any).Razorpay) return resolve(true);
    const s = document.createElement('script');
    s.src = 'https://checkout.razorpay.com/v1/checkout.js';
    s.onload = () => resolve(true);
    s.onerror = () => resolve(false);
    document.body.appendChild(s);
  });

  /* Donate handler */
  const handleDonate = async () => {
    if (!amount || !selectedCampaign) return;
    setDonating(true);
    try {
      const res = await api.post('/donations/initiate', {
        amount: parseInt(amount),
        campaignId: selectedCampaign,
        message,
        isAnonymous,
        type: 'one_time',
      });
      if (!res.data.success) throw new Error('Failed');
      const { donationId, razorpayOrderId, razorpayKeyId, demoMode } = res.data.data;
      if (demoMode || razorpayKeyId === 'rzp_test_demo') {
        await api.post('/donations/verify', { donationId, razorpayOrderId });
        setSuccess(true);
        setShowPayPanel(false);
        setAmount('');
        setMessage('');
        setMyDonations((prev: any) => ({
          ...prev,
          totalDonated: (prev?.totalDonated || 0) + parseInt(amount),
          count: (prev?.count || 0) + 1,
          donations: [
            {
              id: `d-${Date.now()}`,
              amount: parseInt(amount),
              campaign: { title: campaigns.find(c => c._id === selectedCampaign)?.title || 'Campaign' },
              organization: { name: 'JanSetu Network' },
              type: 'one_time',
              paymentStatus: 'completed',
              message,
              createdAt: new Date().toISOString(),
            },
            ...(prev?.donations || []),
          ],
        }));
        setTimeout(() => setSuccess(false), 6000);
      } else {
        const loaded = await loadRazorpayScript();
        if (!loaded) throw new Error('SDK load failed');
        new (window as any).Razorpay({
          key: razorpayKeyId,
          amount: parseInt(amount) * 100,
          currency: 'INR',
          name: 'JanSetu',
          description: 'Donation',
          order_id: razorpayOrderId,
          handler: async (resp: any) => {
            await api.post('/donations/verify', { donationId, ...resp });
            setSuccess(true);
            setShowPayPanel(false);
            setAmount('');
            setTimeout(() => setSuccess(false), 6000);
          },
          prefill: { name: user?.name || '', email: user?.email || '' },
          theme: { color: '#6366f1' },
        }).open();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setDonating(false);
    }
  };

  /* Filtered campaigns */
  const filtered = campaigns.filter((c) => {
    const matchSearch = !search || c.title.toLowerCase().includes(search.toLowerCase()) || (c.description || '').toLowerCase().includes(search.toLowerCase());
    const matchCat = catFilter === 'all' || c.category === catFilter;
    return matchSearch && matchCat;
  });

  return (
    <DashboardLayout>
      <div className="space-y-8 animate-fade-in">

        {/* ── Header ── */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-3">
              <Heart className="w-6 h-6 text-pink-400" /> {t('donate.title')}
            </h1>
            <p className="text-slate-400 mt-1">{t('donate.subtitle')}</p>
          </div>
          <button
            onClick={() => setShowHistory(!showHistory)}
            className="px-4 py-2.5 rounded-xl border border-slate-700 hover:border-indigo-500/50 text-slate-400 hover:text-indigo-400 text-sm font-medium transition-all flex items-center gap-2"
          >
            <Gift className="w-4 h-4" /> My Donations ({myDonations?.count || 0})
          </button>
        </div>

        {/* ── Success Banner ── */}
        {success && (
          <div className="glass-card rounded-2xl border border-emerald-500/30 p-5 bg-emerald-500/5 flex items-center gap-3 animate-fade-in">
            <span className="text-2xl">🎉</span>
            <div>
              <h3 className="text-sm font-semibold text-emerald-400">Donation Successful!</h3>
              <p className="text-xs text-slate-400">Thank you for your generous contribution. You're making a real difference.</p>
            </div>
            <button onClick={() => setSuccess(false)} className="ml-auto text-slate-500 hover:text-slate-300">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* ── Impact Summary ── */}
        {myDonations && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { label: t('donate.totalRaised'), value: `₹${(myDonations.totalDonated || 0).toLocaleString()}`, icon: IndianRupee, color: 'text-pink-400', bg: 'bg-pink-500/10', border: 'border-pink-500/20' },
              { label: t('donate.donors'), value: myDonations.count || 0, icon: Gift, color: 'text-indigo-400', bg: 'bg-indigo-500/10', border: 'border-indigo-500/20' },
              { label: t('dashboard.impactScore'), value: Math.min(Math.round((myDonations.totalDonated || 0) / 100), 999), icon: TrendingUp, color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' },
            ].map((item) => (
              <div key={item.label} className={`glass-card rounded-2xl border ${item.border} p-5`}>
                <div className="flex items-center gap-3 mb-2">
                  <div className={`p-2 rounded-lg ${item.bg}`}><item.icon className={`w-5 h-5 ${item.color}`} /></div>
                  <span className="text-sm text-slate-400">{item.label}</span>
                </div>
                <div className={`text-2xl font-bold ${item.color}`}>{item.value}</div>
              </div>
            ))}
          </div>
        )}

        {/* ── Fund Flow Tracker ── */}
        <FundFlowTracker totalDonated={myDonations?.totalDonated || 0} />

        {/* ── Impact Stats ── */}
        <ImpactStats
          peopleHelped={Math.round((myDonations?.totalDonated || 26500) / 3)}
          resourcesDelivered={Math.round((myDonations?.totalDonated || 26500) / 22)}
          tasksCompleted={Math.round((myDonations?.totalDonated || 26500) / 76)}
          growthRate={38}
        />

        {/* ── My Donation History (collapsible) ── */}
        {showHistory && (
          <div className="glass-card rounded-2xl border border-slate-800 p-5 animate-fade-in">
            <h3 className="text-sm font-bold text-slate-200 mb-4">Donation History</h3>
            <div className="space-y-3">
              {(myDonations?.donations || []).slice(0, 6).map((d: any) => (
                <div key={d.id} className="flex items-center gap-4 p-3 rounded-xl bg-slate-800/40 border border-slate-800">
                  <div className="w-9 h-9 rounded-lg bg-indigo-500/10 flex items-center justify-center flex-shrink-0">
                    <Heart className="w-4 h-4 text-indigo-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-200 truncate">{d.campaign?.title || 'Campaign'}</p>
                    <p className="text-xs text-slate-500">{d.organization?.name} · {new Date(d.createdAt).toLocaleDateString('en-IN')}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-sm font-bold text-indigo-400">₹{d.amount?.toLocaleString()}</p>
                    <p className="text-[10px] text-emerald-500 capitalize">{d.paymentStatus}</p>
                  </div>
                </div>
              ))}
              {(myDonations?.donations || []).length === 0 && (
                <p className="text-center py-6 text-slate-500 text-sm">No donations yet</p>
              )}
            </div>
          </div>
        )}

        {/* ── Campaign Browsing ── */}
        <div>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
            <div>
              <h2 className="text-lg font-bold text-slate-100">Active Campaigns</h2>
              <p className="text-xs text-slate-500 mt-0.5">{filtered.length} campaigns found</p>
            </div>
            <button
              onClick={() => { if (selectedCampaign) setShowPayPanel(true); }}
              disabled={!selectedCampaign}
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-xl text-sm font-semibold transition-all flex items-center gap-2 shadow-[0_0_15px_rgba(99,102,241,0.3)]"
            >
              <Send className="w-4 h-4" /> Donate Now
            </button>
          </div>

          {/* Search + Filter */}
          <div className="flex flex-col sm:flex-row gap-3 mb-5">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                placeholder="Search campaigns..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-slate-200 text-sm focus:border-indigo-500 focus:outline-none placeholder:text-slate-500"
              />
            </div>
            <div className="flex items-center gap-2 overflow-x-auto pb-1">
              <SlidersHorizontal className="w-4 h-4 text-slate-500 flex-shrink-0" />
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setCatFilter(cat)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium border flex-shrink-0 transition-all ${
                    catFilter === cat
                      ? 'bg-indigo-600/20 border-indigo-500/50 text-indigo-300'
                      : 'bg-slate-800/50 border-slate-700 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {cat === 'all' ? 'All' : cat.charAt(0).toUpperCase() + cat.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Campaign Grid */}
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-64 bg-slate-800/30 rounded-2xl animate-pulse" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-16 text-slate-500">
              <Heart className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p className="text-sm">No campaigns found matching your criteria</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filtered.map((c) => (
                <DonationCard
                  key={c._id}
                  campaign={c}
                  selected={selectedCampaign === c._id}
                  onSelect={(id) => { setSelectedCampaign(id); setShowPayPanel(true); }}
                />
              ))}
            </div>
          )}
        </div>

        {/* ── Fund Distribution Chart ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <FundDistributionChart campaigns={campaigns} />
          <div className="glass-card rounded-2xl border border-slate-800 p-5">
            <h3 className="text-sm font-bold text-slate-200 mb-4">Top Campaigns by Funding</h3>
            <div className="space-y-3">
              {campaigns.slice(0, 5).map((c: any, i: number) => {
                const pct = c.goals?.fundingGoal ? Math.min(Math.round((c.goals.fundingRaised / c.goals.fundingGoal) * 100), 100) : 0;
                return (
                  <div key={c._id} className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-lg bg-indigo-600/20 flex items-center justify-center text-xs font-bold text-indigo-400 flex-shrink-0">{i + 1}</span>
                    <div className="flex-1">
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-slate-200 font-medium truncate">{c.title}</span>
                        <span className="text-slate-500 ml-2">₹{(c.goals?.fundingRaised || 0).toLocaleString()}</span>
                      </div>
                      <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-indigo-600 to-purple-500 rounded-full" style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                    <span className="text-xs text-slate-500 w-8 text-right">{pct}%</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* ── Payment Panel Modal ── */}
      {showPayPanel && selectedCampaign && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-md glass-card rounded-2xl border border-slate-700 p-6 shadow-2xl animate-fade-in space-y-5">
            {/* Header */}
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-100">
                Make a Donation
              </h3>
              <button onClick={() => setShowPayPanel(false)} className="text-slate-500 hover:text-slate-300">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Campaign selected */}
            <div className="p-3 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-sm">
              <p className="text-indigo-300 font-medium">
                {campaigns.find(c => c._id === selectedCampaign)?.title || 'Campaign'}
              </p>
            </div>

            {/* Quick amounts */}
            <div>
              <p className="text-xs text-slate-500 mb-2">Select Amount</p>
              <div className="flex flex-wrap gap-2">
                {QUICK_AMOUNTS.map((q) => (
                  <button
                    key={q}
                    onClick={() => setAmount(q.toString())}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-all ${
                      amount === q.toString()
                        ? 'bg-indigo-600 border-indigo-500 text-white'
                        : 'bg-slate-800 border-slate-700 text-slate-400 hover:border-indigo-500/50 hover:text-indigo-400'
                    }`}
                  >
                    ₹{q.toLocaleString()}
                  </button>
                ))}
              </div>
            </div>

            {/* Custom amount */}
            <div>
              <p className="text-xs text-slate-500 mb-2">Or enter custom amount</p>
              <div className="relative">
                <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="number"
                  placeholder="Enter amount..."
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-slate-200 text-sm focus:border-indigo-500 focus:outline-none placeholder:text-slate-500"
                />
              </div>
            </div>

            {/* Message */}
            <div>
              <p className="text-xs text-slate-500 mb-2">Message (optional)</p>
              <textarea
                placeholder="Add a note with your donation..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={2}
                className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-200 text-sm focus:border-indigo-500 focus:outline-none placeholder:text-slate-500 resize-none"
              />
            </div>

            {/* Anonymous toggle */}
            <button
              onClick={() => setIsAnonymous(!isAnonymous)}
              className="flex items-center gap-3 w-full p-3 rounded-xl border border-slate-700 hover:border-slate-600 bg-slate-800/40 text-sm text-slate-300 transition-all"
            >
              {isAnonymous ? <EyeOff className="w-4 h-4 text-indigo-400" /> : <Eye className="w-4 h-4 text-slate-500" />}
              <span>{isAnonymous ? 'Donating anonymously' : 'Donate anonymously'}</span>
              <span className={`ml-auto w-8 h-4 rounded-full transition-all ${isAnonymous ? 'bg-indigo-600' : 'bg-slate-700'} relative`}>
                <span className={`absolute top-0.5 w-3 h-3 rounded-full bg-white shadow transition-all ${isAnonymous ? 'right-0.5' : 'left-0.5'}`} />
              </span>
            </button>

            {/* Submit */}
            <button
              onClick={handleDonate}
              disabled={donating || !amount || parseInt(amount) < 1}
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl font-semibold text-sm transition-all flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(99,102,241,0.3)]"
            >
              {donating ? (
                <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Processing...</>
              ) : (
                <><Send className="w-4 h-4" /> Donate ₹{parseInt(amount || '0').toLocaleString()}</>
              )}
            </button>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
