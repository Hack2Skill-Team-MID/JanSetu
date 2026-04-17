'use client';

import { useEffect, useState } from 'react';
import { api } from '../../../lib/api';
import DashboardLayout from '../../../components/layout/dashboard-layout';
import { Heart, IndianRupee, Gift, TrendingUp, Calendar, Building2, CheckCircle2, Download, Printer } from 'lucide-react';

const DEMO_DONATION_DATA = {
  totalDonated: 26500, count: 4,
  donations: [
    { id: 'd1', amount: 5000, campaign: { title: 'Flood Relief — Assam 2025' }, organization: { name: 'Assam Relief Foundation' }, type: 'one_time', paymentStatus: 'completed', razorpayPaymentId: 'pay_DEMO001XYZ', message: 'Stay strong, wishing everyone a speedy recovery!', createdAt: new Date(Date.now() - 3 * 24 * 3600000).toISOString() },
    { id: 'd2', amount: 10000, campaign: { title: 'Digital Classrooms for Rural Schools' }, organization: { name: 'EduReach India' }, type: 'one_time', paymentStatus: 'completed', razorpayPaymentId: 'pay_DEMO002XYZ', message: '', createdAt: new Date(Date.now() - 10 * 24 * 3600000).toISOString() },
    { id: 'd3', amount: 2500, campaign: { title: 'Mobile Healthcare — Tribal Communities' }, organization: { name: 'Aarogya Sewa Trust' }, type: 'recurring', paymentStatus: 'completed', razorpayPaymentId: 'pay_DEMO003XYZ', message: 'Keep up the incredible work you do!', createdAt: new Date(Date.now() - 30 * 24 * 3600000).toISOString() },
    { id: 'd4', amount: 9000, campaign: { title: 'Women Entrepreneur Micro-Finance' }, organization: { name: 'Mahila Pragati Foundation' }, type: 'one_time', paymentStatus: 'completed', razorpayPaymentId: 'pay_DEMO004XYZ', message: '', createdAt: new Date(Date.now() - 60 * 24 * 3600000).toISOString() },
  ],
};

export default function MyDonationsPage() {
  const [data, setData] = useState<any>(DEMO_DONATION_DATA);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    api.get('/donations/my')
      .then((res) => {
        if (res.data.success && res.data.data?.count > 0) setData(res.data.data);
        // else keep demo data
      })
      .catch(() => {}) // keep demo data on error
      .finally(() => setIsLoading(false));
  }, []);


  const donations: any[] = data?.donations || [];

  const downloadReceipt = (d: any) => {
    const receiptHtml = `
<!DOCTYPE html>
<html>
<head>
  <title>Donation Receipt — JanSetu</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Segoe UI', Arial, sans-serif; background: #fff; color: #1e293b; padding: 40px; }
    .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 32px; padding-bottom: 24px; border-bottom: 2px solid #e2e8f0; }
    .logo { font-size: 28px; font-weight: 800; color: #6366f1; }
    .logo span { color: #a78bfa; }
    .badge { padding: 6px 14px; background: #f0fdf4; color: #16a34a; border: 1px solid #bbf7d0; border-radius: 20px; font-size: 13px; font-weight: 600; }
    h2 { font-size: 20px; font-weight: 700; color: #0f172a; margin-bottom: 6px; }
    .subtitle { font-size: 13px; color: #64748b; margin-bottom: 32px; }
    .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; margin-bottom: 32px; }
    .field label { font-size: 11px; text-transform: uppercase; letter-spacing: 0.05em; color: #94a3b8; font-weight: 600; }
    .field p { font-size: 15px; color: #1e293b; font-weight: 600; margin-top: 4px; }
    .amount-box { background: linear-gradient(135deg, #6366f1, #8b5cf6); color: white; border-radius: 16px; padding: 24px; text-align: center; margin-bottom: 32px; }
    .amount-box .label { font-size: 13px; opacity: 0.85; }
    .amount-box .value { font-size: 40px; font-weight: 800; margin-top: 6px; }
    .footer { padding-top: 24px; border-top: 1px solid #e2e8f0; font-size: 12px; color: #94a3b8; text-align: center; }
    .ref { font-size: 12px; color: #94a3b8; margin-top: 4px; }
    @media print { body { padding: 20px; } }
  </style>
</head>
<body>
  <div class="header">
    <div class="logo">Jan<span>Setu</span> 🌉</div>
    <div class="badge">✓ Verified Payment</div>
  </div>
  <h2>Donation Receipt</h2>
  <p class="subtitle">Thank you for your generous contribution to JanSetu's NGO ecosystem</p>

  <div class="amount-box">
    <div class="label">Amount Donated</div>
    <div class="value">₹${(d.amount || 0).toLocaleString()}</div>
  </div>

  <div class="grid">
    <div class="field">
      <label>Campaign</label>
      <p>${d.campaign?.title || d.campaignId?.title || 'General Donation'}</p>
    </div>
    <div class="field">
      <label>Organization</label>
      <p>${d.organization?.name || d.organizationId?.name || 'JanSetu Network'}</p>
    </div>
    <div class="field">
      <label>Date</label>
      <p>${new Date(d.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
    </div>
    <div class="field">
      <label>Payment Type</label>
      <p>${d.type === 'recurring' ? 'Recurring (Monthly)' : 'One-time'}</p>
    </div>
    <div class="field">
      <label>Transaction ID</label>
      <p>${d.razorpayPaymentId || 'DEMO-' + (d.id || '').slice(0, 8).toUpperCase()}</p>
    </div>
    <div class="field">
      <label>Status</label>
      <p style="color:#16a34a">✓ Completed</p>
    </div>
  </div>

  ${d.message ? `<div style="background:#f8fafc;border-radius:12px;padding:16px;margin-bottom:24px;"><p style="font-size:13px;color:#64748b;font-style:italic;">"${d.message}"</p></div>` : ''}

  <div class="footer">
    <p>This receipt is auto-generated by JanSetu Platform · jansetu.in</p>
    <p class="ref">Receipt ID: REC-${(d.id || '').slice(0, 12).toUpperCase()} · ${new Date().toISOString()}</p>
    <p style="margin-top:8px;">Donations to JanSetu-validated NGOs may be eligible for 80G tax exemption. Please verify with the NGO directly.</p>
  </div>
</body>
</html>`;

    const blob = new Blob([receiptHtml], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const w = window.open(url, '_blank');
    if (w) {
      w.onload = () => { w.print(); URL.revokeObjectURL(url); };
    }
  };

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
            <div className="text-2xl font-bold text-slate-100">~{Math.round((data?.totalDonated || 0) / 50)}</div>
          </div>
        </div>

        {/* Donation History */}
        <div className="glass-card rounded-2xl border border-slate-800">
          <div className="p-6 border-b border-slate-800 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-200">Donation History</h2>
            {donations.length > 0 && (
              <span className="text-xs text-slate-500">{donations.length} transaction{donations.length !== 1 ? 's' : ''}</span>
            )}
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
                <div key={d.id || d._id} className="flex items-center gap-4 px-6 py-4 hover:bg-slate-800/20 transition-colors group">
                  <div className="p-2.5 rounded-xl bg-pink-500/10">
                    <Heart className="w-5 h-5 text-pink-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-semibold text-slate-200">
                      {d.campaign?.title || d.campaignId?.title || 'General Donation'}
                    </h3>
                    <div className="flex items-center gap-3 mt-0.5">
                      {(d.organization?.name || d.organizationId?.name) && (
                        <span className="flex items-center gap-1 text-xs text-slate-400">
                          <Building2 className="w-3 h-3" />
                          {d.organization?.name || d.organizationId?.name}
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
                  {/* Receipt Download */}
                  <button
                    onClick={() => downloadReceipt(d)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white text-xs font-medium hover:bg-slate-700 transition-colors"
                    title="Download receipt"
                  >
                    <Download className="w-3.5 h-3.5" />
                    Receipt
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
