'use client';

import { useEffect, useState } from 'react';
import { api } from '../../../lib/api';
import DashboardLayout from '../../../components/layout/dashboard-layout';
import { useAuthStore } from '../../../store/auth-store';
import { Package, AlertTriangle, Plus, Truck, Clock, Share2, X, BarChart2, ArrowUpRight } from 'lucide-react';
import { useTranslation } from '../../../lib/i18n';


const CATEGORY_ICONS: Record<string, string> = {
  food: '🍚', medicine: '💊', clothing: '👕', shelter: '🏠',
  equipment: '🔧', vehicle: '🚗', funds: '💰', other: '📦',
};

const STATUS_STYLES: Record<string, string> = {
  available: 'bg-green-500/15 text-green-400 border border-green-500/20',
  low_stock: 'bg-amber-500/15 text-amber-400 border border-amber-500/20',
  depleted: 'bg-red-500/15 text-red-400 border border-red-500/20',
  expired: 'bg-zinc-700/50 text-zinc-400 border border-zinc-600/30',
};

const DEMO_RESOURCES = [
  { _id: 'r1', name: 'Rice Bags (50kg each)', category: 'food', quantity: 500, available: 320, allocated: 180, unit: 'bags', status: 'available', availableForSharing: true, description: 'Premium quality basmati rice for relief distribution', expiryDate: new Date(Date.now() + 90 * 24 * 3600000).toISOString() },
  { _id: 'r2', name: 'Oral Rehydration Salts', category: 'medicine', quantity: 2000, available: 380, allocated: 1620, unit: 'packets', status: 'low_stock', availableForSharing: false, description: 'WHO-grade ORS packets for diarrhoea prevention', expiryDate: new Date(Date.now() + 180 * 24 * 3600000).toISOString() },
  { _id: 'r3', name: 'Emergency Tarpaulins', category: 'shelter', quantity: 200, available: 200, allocated: 0, unit: 'sheets', status: 'available', availableForSharing: true, description: '8×10 ft heavy-duty tarpaulins for temporary shelters', expiryDate: null },
  { _id: 'r4', name: 'Paracetamol Strips', category: 'medicine', quantity: 5000, available: 0, allocated: 5000, unit: 'strips', status: 'depleted', availableForSharing: false, description: 'Standard 500mg paracetamol strips (10 tabs)', expiryDate: new Date(Date.now() + 60 * 24 * 3600000).toISOString() },
  { _id: 'r5', name: 'Winter Blankets', category: 'clothing', quantity: 800, available: 650, allocated: 150, unit: 'pieces', status: 'available', availableForSharing: true, description: 'Thick woollen blankets for cold-climate relief ops', expiryDate: null },
  { _id: 'r6', name: 'Water Purification Tablets', category: 'equipment', quantity: 10000, available: 2100, allocated: 7900, unit: 'tablets', status: 'low_stock', availableForSharing: false, description: 'Chlorine-based tablets, treats 1L per tablet', expiryDate: new Date(Date.now() + 6 * 24 * 3600000).toISOString() },
  { _id: 'r7', name: 'Relief Transport Van', category: 'vehicle', quantity: 3, available: 2, allocated: 1, unit: 'vehicles', status: 'available', availableForSharing: true, description: 'Tata Ace mini-trucks for last-mile distribution', expiryDate: null },
  { _id: 'r8', name: 'Emergency Relief Fund', category: 'funds', quantity: 500000, available: 187500, allocated: 312500, unit: '₹', status: 'available', availableForSharing: false, description: 'Discretionary fund for immediate crisis response', expiryDate: null },
];

const DEMO_ALERTS = {
  expiringSoon: [DEMO_RESOURCES[5]], // water purification tablets
  lowStock: [DEMO_RESOURCES[1], DEMO_RESOURCES[5]],
  expired: [],
  totalAlerts: 3,
};

export default function ResourcesPage() {
  const { t } = useTranslation();
  const [resources, setResources] = useState<any[]>([]);
  const [alerts, setAlerts] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [adding, setAdding] = useState(false);
  const [addForm, setAddForm] = useState({ name: '', category: 'food', quantity: '', unit: 'kg', description: '' });
  const [filterStatus, setFilterStatus] = useState('all');
  const user = useAuthStore((s) => s.user);

  const fetchData = async () => {
    try {
      const [resData, alertData] = await Promise.all([
        api.get('/resources'),
        api.get('/resources/alerts').catch(() => ({ data: { success: false } })),
      ]);
      const resList = resData.data?.data || [];
      setResources(Array.isArray(resList) && resList.length > 0 ? resList : DEMO_RESOURCES);
      if (alertData.data.success && alertData.data.data) {
        setAlerts(alertData.data.data);
      } else {
        setAlerts(DEMO_ALERTS);
      }
    } catch {
      setResources(DEMO_RESOURCES);
      setAlerts(DEMO_ALERTS);
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
        name: addForm.name, category: addForm.category,
        quantity: parseInt(addForm.quantity), unit: addForm.unit,
        description: addForm.description, availableForSharing: false,
      });
      setShowAdd(false);
      setAddForm({ name: '', category: 'food', quantity: '', unit: 'kg', description: '' });
      fetchData();
    } catch {
      // Optimistic local add
      const newRes = {
        _id: `local-${Date.now()}`, name: addForm.name, category: addForm.category,
        quantity: parseInt(addForm.quantity), available: parseInt(addForm.quantity),
        allocated: 0, unit: addForm.unit, status: 'available',
        description: addForm.description, availableForSharing: false, expiryDate: null,
      };
      setResources(prev => [newRes, ...prev]);
      setShowAdd(false);
      setAddForm({ name: '', category: 'food', quantity: '', unit: 'kg', description: '' });
    } finally {
      setAdding(false);
    }
  };

  const filtered = filterStatus === 'all' ? resources : resources.filter(r => r.status === filterStatus);

  const totalAvailable = resources.reduce((s, r) => s + (r.available || 0), 0);
  const totalAllocated = resources.reduce((s, r) => s + (r.allocated || 0), 0);

  return (
    <DashboardLayout>
      <div className="space-y-8 animate-fade-in">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-3">
              <Package className="w-6 h-6 text-green-400" />
              Resource Inventory
            </h1>
            <p className="text-slate-400 mt-1">{t('resources.subtitle')}</p>
          </div>
          <button onClick={() => setShowAdd(true)} className="px-5 py-2.5 bg-green-600 hover:bg-green-500 text-white rounded-xl text-sm font-semibold transition-all flex items-center gap-2 shadow-[0_0_15px_rgba(34,197,94,0.25)]">
            <Plus className="w-4 h-4" /> {t('resources.addResource')}
          </button>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: 'Total Items', value: resources.length, color: 'text-slate-100', bg: 'bg-slate-800/50', icon: Package },
            { label: 'Available', value: resources.filter(r => r.status === 'available').length, color: 'text-green-400', bg: 'bg-green-500/10', icon: BarChart2 },
            { label: 'Low Stock', value: resources.filter(r => r.status === 'low_stock').length, color: 'text-amber-400', bg: 'bg-amber-500/10', icon: AlertTriangle },
            { label: 'Shared', value: resources.filter(r => r.availableForSharing).length, color: 'text-blue-400', bg: 'bg-blue-500/10', icon: Share2 },
          ].map(stat => (
            <div key={stat.label} className={`glass-card rounded-xl border border-slate-800 p-4 flex items-center gap-3 ${stat.bg}`}>
              <stat.icon className={`w-5 h-5 ${stat.color} flex-shrink-0`} />
              <div>
                <div className={`text-xl font-bold ${stat.color}`}>{stat.value}</div>
                <div className="text-xs text-slate-400">{stat.label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Alert Banner */}
        {alerts && alerts.totalAlerts > 0 && (
          <div className="glass-card rounded-2xl border border-amber-500/20 p-4 flex items-center gap-4 bg-amber-500/5">
            <div className="p-2 rounded-lg bg-amber-500/10"><AlertTriangle className="w-5 h-5 text-amber-400" /></div>
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-amber-400">{alerts.totalAlerts} Active Alerts</h3>
              <p className="text-xs text-slate-400 mt-0.5">
                {alerts.expiringSoon.length} expiring within 7 days &nbsp;·&nbsp; {alerts.lowStock.length} low stock &nbsp;·&nbsp; {alerts.expired.length} expired
              </p>
            </div>
          </div>
        )}

        {/* Filter Tabs */}
        <div className="flex gap-2 flex-wrap">
          {[
            { key: 'all', label: `${t('resources.all')} (${resources.length})` },
            { key: 'available', label: t('resources.available') },
            { key: 'low_stock', label: t('resources.low') },
            { key: 'depleted', label: t('resources.critical') },
          ].map(f => (
            <button key={f.key} onClick={() => setFilterStatus(f.key)}
              className={`px-4 py-2 rounded-xl text-sm font-medium border transition-all ${
                filterStatus === f.key
                  ? 'bg-green-600/20 border-green-500/50 text-green-300'
                  : 'bg-slate-800/50 border-slate-700/50 text-slate-400 hover:text-slate-200'
              }`}
            >{f.label}</button>
          ))}
        </div>

        {/* Resource Grid */}
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="glass-card rounded-2xl border border-slate-800 p-16 text-center">
            <Package className="w-12 h-12 text-slate-600 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-slate-300">No resources found</h3>
            <p className="text-slate-400 mt-2">Add resources to track inventory for your organization.</p>
            <button onClick={() => setShowAdd(true)} className="mt-4 px-4 py-2 bg-green-600 hover:bg-green-500 text-white rounded-xl text-sm font-medium transition-colors">Add Your First Resource</button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {filtered.map((r: any) => {
              const pct = r.quantity > 0 ? Math.round((r.available / r.quantity) * 100) : 0;
              const barColor = r.status === 'low_stock' ? 'bg-amber-500' : r.status === 'depleted' ? 'bg-red-500' : 'bg-green-500';
              return (
                <div key={r._id || r.id} className="glass-card rounded-2xl border border-slate-800 hover:border-green-500/30 transition-all p-5 card-hover">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{CATEGORY_ICONS[r.category] || '📦'}</span>
                      <div>
                        <h3 className="text-sm font-semibold text-slate-100 leading-snug">{r.name}</h3>
                        <span className="text-xs text-slate-500 capitalize">{r.category}</span>
                      </div>
                    </div>
                    <span className={`px-2 py-1 text-[10px] font-bold rounded-lg capitalize ${STATUS_STYLES[r.status] || 'bg-slate-700 text-slate-400'}`}>
                      {r.status?.replace('_', ' ')}
                    </span>
                  </div>

                  {r.description && (
                    <p className="text-xs text-slate-500 mb-3 line-clamp-2">{r.description}</p>
                  )}

                  {/* Usage bar */}
                  <div className="mb-3">
                    <div className="flex justify-between text-xs text-slate-400 mb-1.5">
                      <span className="font-medium text-slate-300">{r.available.toLocaleString()} {r.unit} available</span>
                      <span className={`font-bold ${pct > 50 ? 'text-green-400' : pct > 20 ? 'text-amber-400' : 'text-red-400'}`}>{pct}%</span>
                    </div>
                    <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full transition-all duration-700 ${barColor}`} style={{ width: `${pct}%` }} />
                    </div>
                    <div className="flex justify-between text-xs text-slate-600 mt-1">
                      <span>{r.allocated.toLocaleString()} allocated</span>
                      <span>{r.quantity.toLocaleString()} total</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs text-slate-400 pt-3 border-t border-slate-800">
                    <span className="flex items-center gap-1">
                      <Truck className="w-3 h-3" /> {r.allocated.toLocaleString()} deployed
                    </span>
                    {r.expiryDate ? (
                      <span className={`flex items-center gap-1 ${new Date(r.expiryDate) < new Date(Date.now() + 7 * 24 * 3600000) ? 'text-amber-400' : ''}`}>
                        <Clock className="w-3 h-3" /> Exp: {new Date(r.expiryDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                      </span>
                    ) : (
                      <span className="text-slate-600">No expiry</span>
                    )}
                  </div>

                  {r.availableForSharing && (
                    <div className="mt-3 flex items-center gap-1.5 text-xs text-green-400 font-medium">
                      <Share2 className="w-3 h-3" /> Available for cross-NGO sharing
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Add Resource Modal */}
      {showAdd && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setShowAdd(false)}>
          <div className="glass-card rounded-2xl border border-slate-700 p-6 w-full max-w-md space-y-4 animate-fade-in" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                <Package className="w-5 h-5 text-green-400" /> Add Resource
              </h2>
              <button onClick={() => setShowAdd(false)} className="p-1.5 rounded-lg hover:bg-slate-700 text-slate-400 transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>
            <input value={addForm.name} onChange={e => setAddForm(p => ({ ...p, name: e.target.value }))}
              placeholder="Resource name (e.g. Rice bags)" className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-slate-200 focus:border-green-500 focus:outline-none" />
            <div className="grid grid-cols-2 gap-3">
              <select value={addForm.category} onChange={e => setAddForm(p => ({ ...p, category: e.target.value }))}
                className="px-3 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-slate-200 focus:border-green-500 focus:outline-none">
                {['food', 'medicine', 'clothing', 'shelter', 'equipment', 'vehicle', 'funds', 'other'].map(c => (
                  <option key={c} value={c}>{CATEGORY_ICONS[c]} {c}</option>
                ))}
              </select>
              <div className="flex gap-2">
                <input value={addForm.quantity} onChange={e => setAddForm(p => ({ ...p, quantity: e.target.value }))} type="number"
                  placeholder="Qty" className="w-full px-3 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-slate-200 focus:border-green-500 focus:outline-none" />
                <input value={addForm.unit} onChange={e => setAddForm(p => ({ ...p, unit: e.target.value }))}
                  placeholder="Unit" className="w-20 px-3 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-slate-200 focus:border-green-500 focus:outline-none" />
              </div>
            </div>
            <textarea value={addForm.description} onChange={e => setAddForm(p => ({ ...p, description: e.target.value }))}
              placeholder="Description (optional)" rows={2} className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-slate-200 focus:border-green-500 focus:outline-none resize-none" />
            <div className="flex gap-3">
              <button onClick={() => setShowAdd(false)} className="flex-1 py-2.5 rounded-xl bg-slate-700 hover:bg-slate-600 text-slate-300 text-sm font-medium transition-colors">Cancel</button>
              <button onClick={handleAdd} disabled={adding || !addForm.name || !addForm.quantity}
                className="flex-1 py-2.5 rounded-xl bg-green-600 hover:bg-green-500 text-white text-sm font-semibold disabled:opacity-40 transition-colors">
                {adding ? 'Adding...' : 'Add Resource'}
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
