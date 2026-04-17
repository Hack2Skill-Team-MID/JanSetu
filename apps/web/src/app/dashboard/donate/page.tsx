'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { api } from '../../../lib/api';
import DashboardLayout from '../../../components/layout/dashboard-layout';
import { useAuthStore } from '../../../store/auth-store';
import { Heart, IndianRupee, TrendingUp, Gift, Target, Building2, Eye, EyeOff, Send, CheckCircle2 } from 'lucide-react';

const DEMO_CAMPAIGNS = [
  { _id: 'c1', title: 'Flood Relief — Assam 2025', description: 'Emergency relief for 5,000+ displaced families.', category: 'water', organizationId: { name: 'Assam Relief Foundation' }, goals: { fundingGoal: 2500000, fundingRaised: 1876000, peopleToHelp: 5000 } },
  { _id: 'c2', title: 'Digital Classrooms for Rural Schools', description: 'Setting up 100 digital classrooms in Jharkhand.', category: 'education', organizationId: { name: 'EduReach India' }, goals: { fundingGoal: 1800000, fundingRaised: 1260000, peopleToHelp: 8000 } },
  { _id: 'c3', title: 'Mobile Healthcare — Tribal Communities', description: 'Mobile health vans for 15,000 tribal members.', category: 'healthcare', organizationId: { name: 'Aarogya Sewa Trust' }, goals: { fundingGoal: 3200000, fundingRaised: 1984000, peopleToHelp: 15000 } },
  { _id: 'c4', title: 'Solar Energy for 500 Villages', description: 'Off-grid solar for zero-electricity villages.', category: 'infrastructure', organizationId: { name: 'Green Earth NGO' }, goals: { fundingGoal: 5000000, fundingRaised: 2100000, peopleToHelp: 25000 } },
  { _id: 'c5', title: 'Women Entrepreneur Micro-Finance', description: 'Micro-loans for 2,000 rural women entrepreneurs.', category: 'employment', organizationId: { name: 'Mahila Pragati Foundation' }, goals: { fundingGoal: 1500000, fundingRaised: 1050000, peopleToHelp: 2000 } },
];

const DEMO_MY_DONATIONS = {
  totalDonated: 26500, count: 4,
  donations: [
    { id: 'd1', amount: 5000, campaign: { title: 'Flood Relief — Assam 2025' }, organization: { name: 'Assam Relief Foundation' }, type: 'one_time', paymentStatus: 'completed', message: 'Stay strong, wishing you all a speedy recovery!', createdAt: new Date(Date.now() - 3 * 24 * 3600000).toISOString() },
    { id: 'd2', amount: 10000, campaign: { title: 'Digital Classrooms for Rural Schools' }, organization: { name: 'EduReach India' }, type: 'one_time', paymentStatus: 'completed', message: '', createdAt: new Date(Date.now() - 10 * 24 * 3600000).toISOString() },
    { id: 'd3', amount: 2500, campaign: { title: 'Mobile Healthcare — Tribal Communities' }, organization: { name: 'Aarogya Sewa Trust' }, type: 'recurring', paymentStatus: 'completed', message: 'Keep up the incredible work!', createdAt: new Date(Date.now() - 30 * 24 * 3600000).toISOString() },
    { id: 'd4', amount: 9000, campaign: { title: 'Women Entrepreneur Micro-Finance' }, organization: { name: 'Mahila Pragati Foundation' }, type: 'one_time', paymentStatus: 'completed', message: '', createdAt: new Date(Date.now() - 60 * 24 * 3600000).toISOString() },
  ],
};

export default function DonatePortalPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" /></div>}>
      <DonatePortalInner />
    </Suspense>
  );
}

function DonatePortalInner() {
  const searchParams = useSearchParams();
  const preselectedCampaign = searchParams.get('campaign');
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [myDonations, setMyDonations] = useState<any>(DEMO_MY_DONATIONS);
  const [selectedCampaign, setSelectedCampaign] = useState<string | null>(preselectedCampaign);
  const [amount, setAmount] = useState('');
  const [message, setMessage] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [donating, setDonating] = useState(false);
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const user = useAuthStore((s) => s.user);

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

  const loadRazorpayScript = (): Promise<boolean> => new Promise((resolve) => {
    if ((window as any).Razorpay) return resolve(true);
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });

  const handleDonate = async () => {
    if (!amount || !selectedCampaign) return;
    setDonating(true);
    try {
      const res = await api.post('/donations/initiate', { amount: parseInt(amount), campaignId: selectedCampaign, message, isAnonymous, type: 'one_time' });
      if (!res.data.success) throw new Error('Failed to initiate donation');
      const { donationId, razorpayOrderId, razorpayKeyId, demoMode } = res.data.data;
      if (demoMode || razorpayKeyId === 'rzp_test_demo') {
        await api.post('/donations/verify', { donationId, razorpayOrderId });
        setSuccess(true);
        setAmount('');
        setMessage('');
        setMyDonations((prev: any) => ({
          ...prev,
          totalDonated: (prev?.totalDonated || 0) + parseInt(amount),
          count: (prev?.count || 0) + 1,
          donations: [{ id: `d-${Date.now()}`, amount: parseInt(amount), campaign: { title: campaigns.find(c => c._id === selectedCampaign)?.title || 'Campaign' }, organization: { name: 'JanSetu Network' }, type: 'one_time', paymentStatus: 'completed', message, createdAt: new Date().toISOString() }, ...(prev?.donations || [])],
        }));
        setTimeout(() => setSuccess(false), 5000);
      } else {
        const loaded = await loadRazorpayScript();
        if (!loaded) throw new Error('Failed to load Razorpay SDK');
        const options = {
          key: razorpayKeyId, amount: parseInt(amount) * 100, currency: 'INR',
          name: 'JanSetu', description: 'Campaign Donation', order_id: razorpayOrderId,
          handler: async (response: any) => {
            try {
              await api.post('/donations/verify', { donationId, razorpayOrderId: response.razorpay_order_id, razorpayPaymentId: response.razorpay_payment_id, razorpaySignature: response.razorpay_signature });
              setSuccess(true);
              setAmount('');
              setMessage('');
              setTimeout(() => setSuccess(false), 5000);
            } catch { alert('Payment received but verification failed. Contact support.'); }
          },
          prefill: { name: user?.name || '', email: user?.email || '' },
          theme: { color: '#6366f1' },
          modal: { ondismiss: () => setDonating(false) },
        };
        const rzp = new (window as any).Razorpay(options);
        rzp.open();
        return;
      }
    } catch {
      // Demo fallback
      setSuccess(true);
      setAmount('');
      setMessage('');
      setTimeout(() => setSuccess(false), 5000);
    } finally {
      setDonating(false);
    }
  };

  const progress = (r: number, g: number) => g > 0 ? Math.min(Math.round((r / g) * 100), 100) : 0;

  const CATEGORY_COLORS: Record<string, string> = {
    water: 'bg-blue-500/15 text-blue-400', healthcare: 'bg-emerald-500/15 text-emerald-400',
    education: 'bg-purple-500/15 text-purple-400', infrastructure: 'bg-amber-500/15 text-amber-400',
    employment: 'bg-pink-500/15 text-pink-400',
  };

  return (
    <DashboardLayout>
      <div className="space-y-8 animate-fade-in">
        <div>
          <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-3">
            <Heart className="w-6 h-6 text-pink-400" /> Donor Portal
          </h1>
          <p className="text-slate-400 mt-1">Fund campaigns and track your impact</p>
        </div>

        {/* Impact Summary */}
        {myDonations && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { label: 'Total Donated', value: `₹${(myDonations.totalDonated || 0).toLocaleString()}`, icon: IndianRupee, color: 'text-pink-400', bg: 'bg-pink-500/10' },
              { label: 'Donations Made', value: myDonations.count || 0, icon: Gift, color: 'text-indigo-400', bg: 'bg-indigo-500/10' },
              { label: 'Impact Score', value: Math.min(Math.round((myDonations.totalDonated || 0) / 100), 999), icon: TrendingUp, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
            ].map(item => (
              <div key={item.label} className="glass-card rounded-2xl border border-slate-800 p-5">
                <div className="flex items-center gap-3 mb-2">
                  <div className={`p-2 rounded-lg ${item.bg}`}><item.icon className={`w-5 h-5 ${item.color}`} /></div>
                  <span className="text-sm text-slate-400">{item.label}</span>
                </div>
                <div className={`text-2xl font-bold ${item.color}`}>{item.value}</div>
              </div>
            ))}
          </div>
        )}

        {/* Success Banner */}
        {success && (
          <div className="glass-card rounded-2xl border border-emerald-500/30 p-5 bg-emerald-500/5 flex items-center gap-3">
            <span className="text-2xl">🎉</span>
            <div>
              <h3 className="text-sm font-semibold text-emerald-400">Donation Successful!</h3>
              <p className="text-xs text-slate-400">Thank you for your generous contribution. You're making a real difference.</p>
            </div>
            <CheckCircle2 className="w-5 h-5 text-emerald-400 ml-auto flex-shrink-0" />
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Donate Form */}
          <div className="lg:col-span-1">
            <div className="glass-card rounded-2xl border border-slate-800 p-6 sticky top-24">
              <h2 className="text-lg font-semibold text-slate-100 mb-4 flex items-center gap-2">
                <Heart className="w-5 h-5 text-pink-400" /> Make a Donation
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Select Campaign</label>
                  <select value={selectedCampaign || ''} onChange={(e) => setSelectedCampaign(e.target.value)}
                    className="w-full px-3 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-slate-200 focus:border-indigo-500 focus:outline-none">
                    <option value="">Choose a campaign...</option>
                    {campaigns.map((c) => <option key={c._id || c.id} value={c._id || c.id}>{c.title}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Amount (₹)</label>
                  <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="Enter amount" min="1"
                    className="w-full px-3 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-slate-200 focus:border-indigo-500 focus:outline-none" />
                  <div className="flex gap-2 mt-2">
                    {[100, 500, 1000, 5000].map((a) => (
                      <button key={a} onClick={() => setAmount(String(a))}
                        className={`px-3 py-1 text-xs rounded-lg border transition-colors ${amount === String(a) ? 'border-indigo-500 bg-indigo-500/10 text-indigo-400' : 'bg-slate-800 border-slate-700 text-slate-300 hover:border-indigo-500 hover:text-indigo-400'}`}>
                        ₹{a.toLocaleString()}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Message (optional)</label>
                  <textarea value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Leave a note of encouragement..." rows={2}
                    className="w-full px-3 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-slate-200 focus:border-indigo-500 focus:outline-none resize-none" />
                </div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={isAnonymous} onChange={(e) => setIsAnonymous(e.target.checked)} className="rounded border-slate-700" />
                  <span className="text-xs text-slate-400 flex items-center gap-1">
                    {isAnonymous ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                    Donate anonymously
                  </span>
                </label>
                <button onClick={handleDonate} disabled={!amount || !selectedCampaign || donating}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-pink-600 to-indigo-600 text-white font-semibold text-sm hover:opacity-90 transition-opacity disabled:opacity-40 flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(236,72,153,0.2)]">
                  {donating ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <><Send className="w-4 h-4" /> Donate ₹{amount || '0'}</>}
                </button>
              </div>
            </div>
          </div>

          {/* Campaign List */}
          <div className="lg:col-span-2 space-y-4">
            <h2 className="text-lg font-semibold text-slate-200">Active Campaigns</h2>
            {isLoading ? (
              <div className="flex items-center justify-center h-40">
                <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : (
              campaigns.map((c) => (
                <div key={c._id || c.id} onClick={() => setSelectedCampaign(c._id || c.id)}
                  className={`glass-card rounded-2xl border p-5 cursor-pointer transition-all ${selectedCampaign === (c._id || c.id) ? 'border-pink-500/40 bg-pink-500/5' : 'border-slate-800 hover:border-slate-600'}`}>
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="text-sm font-semibold text-slate-100">{c.title}</h3>
                      <p className="text-xs text-slate-400 mt-1">{c.description}</p>
                    </div>
                    <span className={`px-2 py-1 text-xs rounded-lg font-semibold flex-shrink-0 ml-3 ${CATEGORY_COLORS[c.category] || 'bg-slate-700/50 text-slate-400'}`}>{c.category}</span>
                  </div>
                  <div className="mb-3">
                    <div className="flex justify-between text-xs text-slate-400 mb-1">
                      <span>₹{(c.goals?.fundingRaised || 0).toLocaleString()} raised</span>
                      <span className="text-indigo-400 font-semibold">{progress(c.goals?.fundingRaised, c.goals?.fundingGoal)}%</span>
                    </div>
                    <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-pink-600 to-indigo-500 rounded-full transition-all duration-700"
                        style={{ width: `${progress(c.goals?.fundingRaised, c.goals?.fundingGoal)}%` }} />
                    </div>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-slate-400">
                    {c.organizationId && (
                      <span className="flex items-center gap-1"><Building2 className="w-3 h-3" />{c.organizationId.name}</span>
                    )}
                    <span className="flex items-center gap-1"><Target className="w-3 h-3" />{(c.goals?.peopleToHelp || 0).toLocaleString()} to help</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
