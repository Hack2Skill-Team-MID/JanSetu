'use client';

import { useEffect, useState } from 'react';
import { api } from '../../../lib/api';
import DashboardLayout from '../../../components/layout/dashboard-layout';
import { Heart, IndianRupee, Gift, TrendingUp, Calendar, Building2, Target, CheckCircle2 } from 'lucide-react';

export default function MyDonationsPage() {
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    api.get('/donations/my')
      .then((res) => { if (res.data.success) setData(res.data.data); })
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, []);

  const donations: any[] = data?.donations || [];

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-3">
            <Gift className="w-6 h-6 text-pink-400" />
            My Donations
          </h1>
          <p className="text-slate-400 mt-1">Your complete donation history and impact trail</p>
        </div>

        {/* Impact Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="glass-card rounded-2xl border border-slate-800 p-5">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-lg bg-pink-500/10"><IndianRupee className="w-5 h-5 text-pink-400" /></div>
              <span className="text-sm text-slate-400">Total Donated</span>
            </div>
            <div className="text-2xl font-bold text-slate-100">₹{(data?.totalDonated || 0).toLocaleString()}</div>
          </div>
          <div className="glass-card rounded-2xl border border-slate-800 p-5">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-lg bg-indigo-500/10"><Heart className="w-5 h-5 text-indigo-400" /></div>
              <span className="text-sm text-slate-400">Donations Made</span>
            </div>
            <div className="text-2xl font-bold text-slate-100">{data?.count || 0}</div>
          </div>
          <div className="glass-card rounded-2xl border border-slate-800 p-5">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-lg bg-emerald-500/10"><TrendingUp className="w-5 h-5 text-emerald-400" /></div>
              <span className="text-sm text-slate-400">Lives Impacted</span>
            </div>
            <div className="text-2xl font-bold text-slate-100">{Math.round((data?.totalDonated || 0) / 50)}</div>
          </div>
        </div>

        {/* Donation History */}
        <div className="glass-card rounded-2xl border border-slate-800">
          <div className="p-6 border-b border-slate-800">
            <h2 className="text-lg font-semibold text-slate-200">Donation History</h2>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center h-40">
              <div className="w-6 h-6 border-2 border-pink-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : donations.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <Heart className="w-12 h-12 text-slate-700 mb-4" />
              <h3 className="text-slate-300 font-semibold mb-2">No donations yet</h3>
              <p className="text-slate-500 text-sm mb-4">Make your first donation to a campaign</p>
              <a href="/dashboard/donate" className="px-4 py-2 bg-gradient-to-r from-pink-600 to-indigo-600 text-white text-sm font-semibold rounded-xl hover:opacity-90 transition-opacity">
                Donate Now
              </a>
            </div>
          ) : (
            <div className="divide-y divide-slate-800/50">
              {donations.map((d: any) => (
                <div key={d.id || d._id} className="flex items-center gap-4 px-6 py-4 hover:bg-slate-800/20 transition-colors">
                  <div className="p-2.5 rounded-xl bg-pink-500/10">
                    <Heart className="w-5 h-5 text-pink-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-semibold text-slate-200">
                      {d.campaignId?.title || d.campaign?.title || 'General Donation'}
                    </h3>
                    <div className="flex items-center gap-3 mt-0.5">
                      {(d.organizationId?.name || d.organization?.name) && (
                        <span className="flex items-center gap-1 text-xs text-slate-400">
                          <Building2 className="w-3 h-3" />
                          {d.organizationId?.name || d.organization?.name}
                        </span>
                      )}
                      <span className="flex items-center gap-1 text-xs text-slate-500">
                        <Calendar className="w-3 h-3" />
                        {new Date(d.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </span>
                    </div>
                    {d.message && <p className="text-xs text-slate-500 mt-1 italic">"{d.message}"</p>}
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-pink-400">₹{d.amount?.toLocaleString()}</div>
                    <div className="flex items-center gap-1 justify-end mt-0.5">
                      <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                      <span className="text-xs text-emerald-400">Verified</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
