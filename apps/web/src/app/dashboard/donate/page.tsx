'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { api } from '../../../lib/api';
import DashboardLayout from '../../../components/layout/dashboard-layout';
import { useAuthStore } from '../../../store/auth-store';
import {
  Heart, IndianRupee, TrendingUp, Gift, Target,
  Building2, Calendar, Eye, EyeOff, Send
} from 'lucide-react';

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
  const [myDonations, setMyDonations] = useState<any>(null);
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
        if (campRes.data.success) setCampaigns(campRes.data.data.campaigns);
        if (donRes.data.success) setMyDonations(donRes.data.data);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

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
      if (res.data.success) {
        // In production: open Razorpay checkout here
        await api.post('/donations/verify', {
          donationId: res.data.data.donationId,
          razorpayOrderId: res.data.data.razorpayOrderId,
        });
        setSuccess(true);
        setAmount('');
        setMessage('');
        setTimeout(() => setSuccess(false), 5000);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setDonating(false);
    }
  };

  const progress = (r: number, g: number) => g > 0 ? Math.min(Math.round((r / g) * 100), 100) : 0;

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-3">
            <Heart className="w-6 h-6 text-pink-400" />
            Donor Portal
          </h1>
          <p className="text-slate-400 mt-1">Fund campaigns and track your impact</p>
        </div>

        {/* Impact summary */}
        {myDonations && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="glass-card rounded-2xl border border-slate-800 p-5">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 rounded-lg bg-pink-500/10"><IndianRupee className="w-5 h-5 text-pink-400" /></div>
                <span className="text-sm text-slate-400">Total Donated</span>
              </div>
              <div className="text-2xl font-bold text-slate-100">₹{(myDonations.totalDonated || 0).toLocaleString()}</div>
            </div>
            <div className="glass-card rounded-2xl border border-slate-800 p-5">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 rounded-lg bg-indigo-500/10"><Gift className="w-5 h-5 text-indigo-400" /></div>
                <span className="text-sm text-slate-400">Donations Made</span>
              </div>
              <div className="text-2xl font-bold text-slate-100">{myDonations.count || 0}</div>
            </div>
            <div className="glass-card rounded-2xl border border-slate-800 p-5">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 rounded-lg bg-emerald-500/10"><TrendingUp className="w-5 h-5 text-emerald-400" /></div>
                <span className="text-sm text-slate-400">Impact Score</span>
              </div>
              <div className="text-2xl font-bold text-slate-100">{Math.min(Math.round((myDonations.totalDonated || 0) / 100), 999)}</div>
            </div>
          </div>
        )}

        {success && (
          <div className="glass-card rounded-2xl border border-emerald-500/30 p-5 bg-emerald-500/5 flex items-center gap-3">
            <span className="text-2xl">🎉</span>
            <div>
              <h3 className="text-sm font-semibold text-emerald-400">Donation Successful!</h3>
              <p className="text-xs text-slate-400">Thank you for your generous contribution.</p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Donate form */}
          <div className="lg:col-span-1">
            <div className="glass-card rounded-2xl border border-slate-800 p-6 sticky top-24">
              <h2 className="text-lg font-semibold text-slate-100 mb-4 flex items-center gap-2">
                <Heart className="w-5 h-5 text-pink-400" /> Make a Donation
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Select Campaign</label>
                  <select
                    value={selectedCampaign || ''}
                    onChange={(e) => setSelectedCampaign(e.target.value)}
                    className="w-full px-3 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-slate-200 focus:border-indigo-500 focus:outline-none"
                  >
                    <option value="">Choose a campaign...</option>
                    {campaigns.map((c) => (
                      <option key={c._id} value={c._id}>{c.title}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs text-slate-400 block mb-1">Amount (₹)</label>
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="Enter amount"
                    min="1"
                    className="w-full px-3 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-slate-200 focus:border-indigo-500 focus:outline-none"
                  />
                  <div className="flex gap-2 mt-2">
                    {[100, 500, 1000, 5000].map((a) => (
                      <button key={a} onClick={() => setAmount(String(a))}
                        className="px-3 py-1 text-xs rounded-lg bg-slate-800 border border-slate-700 text-slate-300 hover:border-indigo-500 hover:text-indigo-400 transition-colors">
                        ₹{a}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-xs text-slate-400 block mb-1">Message (optional)</label>
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Leave a note..."
                    rows={2}
                    className="w-full px-3 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-slate-200 focus:border-indigo-500 focus:outline-none resize-none"
                  />
                </div>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={isAnonymous} onChange={(e) => setIsAnonymous(e.target.checked)}
                    className="rounded border-slate-700" />
                  <span className="text-xs text-slate-400 flex items-center gap-1">
                    {isAnonymous ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                    Donate anonymously
                  </span>
                </label>

                <button
                  onClick={handleDonate}
                  disabled={!amount || !selectedCampaign || donating}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-pink-600 to-indigo-600 text-white font-semibold text-sm hover:opacity-90 transition-opacity disabled:opacity-40 flex items-center justify-center gap-2"
                >
                  {donating ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <><Send className="w-4 h-4" /> Donate ₹{amount || '0'}</>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Campaign cards */}
          <div className="lg:col-span-2 space-y-4">
            <h2 className="text-lg font-semibold text-slate-200">Active Campaigns</h2>
            {isLoading ? (
              <div className="flex items-center justify-center h-40">
                <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : (
              campaigns.map((c) => (
                <div key={c._id}
                  onClick={() => setSelectedCampaign(c._id)}
                  className={`glass-card rounded-2xl border p-5 cursor-pointer transition-all ${
                    selectedCampaign === c._id ? 'border-pink-500/40 bg-pink-500/5' : 'border-slate-800 hover:border-slate-700'
                  }`}>
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="text-sm font-semibold text-slate-100">{c.title}</h3>
                      <p className="text-xs text-slate-400 mt-1">{c.description}</p>
                    </div>
                    <span className={`px-2 py-1 text-xs rounded-lg font-semibold ${
                      c.category === 'water' ? 'bg-blue-500/15 text-blue-400' :
                      c.category === 'healthcare' ? 'bg-emerald-500/15 text-emerald-400' :
                      'bg-purple-500/15 text-purple-400'
                    }`}>{c.category}</span>
                  </div>

                  <div className="mb-2">
                    <div className="flex justify-between text-xs text-slate-400 mb-1">
                      <span>₹{(c.goals?.fundingRaised || 0).toLocaleString()} raised</span>
                      <span>₹{(c.goals?.fundingGoal || 0).toLocaleString()}</span>
                    </div>
                    <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-pink-600 to-indigo-500 rounded-full"
                        style={{ width: `${progress(c.goals?.fundingRaised, c.goals?.fundingGoal)}%` }} />
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-xs text-slate-400">
                    {c.organizationId && (
                      <span className="flex items-center gap-1">
                        <Building2 className="w-3 h-3" /> {c.organizationId.name}
                      </span>
                    )}
                    <span className="flex items-center gap-1"><Target className="w-3 h-3" /> {c.goals?.peopleToHelp} to help</span>
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
