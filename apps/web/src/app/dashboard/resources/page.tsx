'use client';

import { useEffect, useState } from 'react';
import { api } from '../../../lib/api';
import DashboardLayout from '../../../components/layout/dashboard-layout';
import { useAuthStore } from '../../../store/auth-store';
import { 
  Package, AlertTriangle, Plus, Truck, Clock, 
  Share2, X
} from 'lucide-react';

const CATEGORY_ICONS: Record<string, string> = {
  food: '🍚', medicine: '💊', clothing: '👕', shelter: '🏠',
  equipment: '🔧', vehicle: '🚗', funds: '💰', other: '📦',
};

const STATUS_STYLES: Record<string, string> = {
  available: 'bg-emerald-500/15 text-emerald-400',
  low_stock: 'bg-amber-500/15 text-amber-400',
  depleted: 'bg-red-500/15 text-red-400',
  expired: 'bg-slate-700 text-slate-400',
};

export default function ResourcesPage() {
  const [resources, setResources] = useState<any[]>([]);
  const [alerts, setAlerts] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [adding, setAdding] = useState(false);
  const [addForm, setAddForm] = useState({ name: '', category: 'food', quantity: '', unit: 'kg', description: '' });
  const user = useAuthStore((s) => s.user);

  const fetchData = async () => {
    try {
      const [resData, alertData] = await Promise.all([
        api.get('/resources'),
        api.get('/resources/alerts').catch(() => ({ data: { success: false } })),
      ]);
      if (resData.data.success) setResources(resData.data.data);
      if (alertData.data.success) setAlerts(alertData.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleAdd = async () => {
    if (!addForm.name || !addForm.quantity) return;
    setAdding(true);
    try {
      await api.post('/resources', {
        name: addForm.name,
        category: addForm.category,
        quantity: parseInt(addForm.quantity),
        unit: addForm.unit,
        description: addForm.description,
        availableForSharing: false,
      });
      setShowAdd(false);
      setAddForm({ name: '', category: 'food', quantity: '', unit: 'kg', description: '' });
      fetchData();
    } catch (err: any) {
      alert(err?.response?.data?.error || 'Failed to add resource');
    } finally {
      setAdding(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-3">
              <Package className="w-6 h-6 text-indigo-400" />
              Resource Inventory
            </h1>
            <p className="text-slate-400 mt-1">Track, allocate, and share resources across campaigns</p>
          </div>
          <button onClick={() => setShowAdd(true)} className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-semibold transition-colors flex items-center gap-2">
            <Plus className="w-4 h-4" /> Add Resource
          </button>
        </div>

        {/* Alert banner */}
        {alerts && alerts.totalAlerts > 0 && (
          <div className="glass-card rounded-2xl border border-amber-500/20 p-4 flex items-center gap-4">
            <div className="p-2 rounded-lg bg-amber-500/10">
              <AlertTriangle className="w-5 h-5 text-amber-400" />
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-amber-400">{alerts.totalAlerts} Alerts</h3>
              <p className="text-xs text-slate-400">
                {alerts.expiringSoon.length} expiring soon • {alerts.lowStock.length} low stock • {alerts.expired.length} expired
              </p>
            </div>
          </div>
        )}

        {/* Resource grid */}
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : resources.length === 0 ? (
          <div className="glass-card rounded-2xl border border-slate-800 p-12 text-center">
            <Package className="w-12 h-12 text-slate-600 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-slate-300">No resources yet</h3>
            <p className="text-slate-400 mt-2">Add resources to track inventory for your organization.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {resources.map((r: any) => (
              <div key={r._id} className="glass-card rounded-2xl border border-slate-800 p-5 hover:border-indigo-500/30 transition-colors">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{CATEGORY_ICONS[r.category] || '📦'}</span>
                    <div>
                      <h3 className="text-sm font-semibold text-slate-100">{r.name}</h3>
                      <span className="text-xs text-slate-400 capitalize">{r.category}</span>
                    </div>
                  </div>
                  <span className={`px-2 py-1 text-xs font-bold rounded-lg ${STATUS_STYLES[r.status] || 'bg-slate-700 text-slate-400'}`}>
                    {r.status?.replace('_', ' ')}
                  </span>
                </div>

                {/* Usage bar */}
                <div className="mb-3">
                  <div className="flex justify-between text-xs text-slate-400 mb-1">
                    <span>{r.available} {r.unit} available</span>
                    <span>{r.quantity} total</span>
                  </div>
                  <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        r.status === 'low_stock' ? 'bg-amber-500' :
                        r.status === 'depleted' ? 'bg-red-500' :
                        'bg-emerald-500'
                      }`}
                      style={{ width: `${(r.available / r.quantity) * 100}%` }}
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span className="flex items-center gap-1"><Truck className="w-3 h-3" /> {r.allocated} allocated</span>
                  {r.expiryDate && (
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" /> Exp: {new Date(r.expiryDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                    </span>
                  )}
                </div>

                {r.availableForSharing && (
                  <div className="mt-3 flex items-center gap-1 text-xs text-indigo-400">
                    <Share2 className="w-3 h-3" /> Available for cross-NGO sharing
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Resource Modal */}
      {showAdd && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4" onClick={() => setShowAdd(false)}>
          <div className="glass-card rounded-2xl border border-slate-700 p-6 w-full max-w-md space-y-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2"><Package className="w-5 h-5 text-indigo-400" /> Add Resource</h2>
              <button onClick={() => setShowAdd(false)} className="p-1.5 rounded-lg hover:bg-slate-700 text-slate-400"><X className="w-4 h-4" /></button>
            </div>
            <input value={addForm.name} onChange={e => setAddForm(p => ({...p, name: e.target.value}))} placeholder="Resource name (e.g. Rice bags)" className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-slate-200 focus:border-indigo-500 focus:outline-none" />
            <div className="grid grid-cols-2 gap-3">
              <select value={addForm.category} onChange={e => setAddForm(p => ({...p, category: e.target.value}))} className="px-3 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-slate-200 focus:border-indigo-500 focus:outline-none">
                {['food','medicine','clothing','shelter','equipment','vehicle','funds','other'].map(c => <option key={c} value={c}>{CATEGORY_ICONS[c]} {c}</option>)}
              </select>
              <div className="flex gap-2">
                <input value={addForm.quantity} onChange={e => setAddForm(p => ({...p, quantity: e.target.value}))} type="number" placeholder="Qty" className="w-full px-3 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-slate-200 focus:border-indigo-500 focus:outline-none" />
                <input value={addForm.unit} onChange={e => setAddForm(p => ({...p, unit: e.target.value}))} placeholder="Unit" className="w-20 px-3 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-slate-200 focus:border-indigo-500 focus:outline-none" />
              </div>
            </div>
            <textarea value={addForm.description} onChange={e => setAddForm(p => ({...p, description: e.target.value}))} placeholder="Description (optional)" rows={2} className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-slate-200 focus:border-indigo-500 focus:outline-none resize-none" />
            <div className="flex gap-3">
              <button onClick={() => setShowAdd(false)} className="flex-1 py-2.5 rounded-xl bg-slate-700 hover:bg-slate-600 text-slate-300 text-sm font-medium transition-colors">Cancel</button>
              <button onClick={handleAdd} disabled={adding || !addForm.name} className="flex-1 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold disabled:opacity-40 transition-colors">
                {adding ? 'Adding...' : 'Add Resource'}
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
