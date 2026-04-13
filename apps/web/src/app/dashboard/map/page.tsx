'use client';

import { useEffect, useState } from 'react';
import { api } from '../../../lib/api';
import DashboardLayout from '../../../components/layout/dashboard-layout';
import dynamic from 'next/dynamic';
import { MapPin, Filter, Target, AlertTriangle, Users, Building2 } from 'lucide-react';

// Dynamically import map to avoid SSR issues with Leaflet
const MapView = dynamic(() => import('../../../components/map/map-view'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[500px] bg-slate-900 rounded-2xl flex items-center justify-center">
      <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
    </div>
  ),
});

type MarkerData = {
  id: string;
  position: [number, number];
  title: string;
  type: 'need' | 'campaign' | 'ngo';
  category?: string;
  urgency?: string;
  description?: string;
};

export default function MapPage() {
  const [markers, setMarkers] = useState<MarkerData[]>([]);
  const [filter, setFilter] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchMapData = async () => {
      try {
        const [needsRes, campaignsRes, ngosRes] = await Promise.all([
          api.get('/community-needs'),
          api.get('/campaigns'),
          api.get('/network/ngos'),
        ]);

        const allMarkers: MarkerData[] = [];

        // Add needs
        if (needsRes.data.success) {
          (needsRes.data.data || []).forEach((n: any) => {
            if (n.coordinates?.length === 2) {
              allMarkers.push({
                id: n._id, position: [n.coordinates[1], n.coordinates[0]],
                title: n.title, type: 'need', category: n.category,
                urgency: n.urgency, description: n.description?.slice(0, 120),
              });
            }
          });
        }

        // Add campaigns
        if (campaignsRes.data.success) {
          (campaignsRes.data.data?.campaigns || []).forEach((c: any) => {
            if (c.coordinates?.length === 2) {
              allMarkers.push({
                id: c._id, position: [c.coordinates[1], c.coordinates[0]],
                title: c.title, type: 'campaign', category: c.category,
                description: c.description?.slice(0, 120),
              });
            }
          });
        }

        // Add NGOs
        if (ngosRes.data.success) {
          (ngosRes.data.data?.organizations || []).forEach((o: any) => {
            if (o.coordinates?.length === 2) {
              allMarkers.push({
                id: o._id, position: [o.coordinates[1], o.coordinates[0]],
                title: o.name, type: 'ngo', description: o.description?.slice(0, 120),
              });
            }
          });
        }

        setMarkers(allMarkers);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchMapData();
  }, []);

  const filtered = filter === 'all' ? markers : markers.filter((m) => m.type === filter);

  const counts = {
    all: markers.length,
    need: markers.filter((m) => m.type === 'need').length,
    campaign: markers.filter((m) => m.type === 'campaign').length,
    ngo: markers.filter((m) => m.type === 'ngo').length,
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-3">
              <MapPin className="w-6 h-6 text-indigo-400" />
              Impact Map
            </h1>
            <p className="text-slate-400 mt-1">Visualize needs, campaigns, and NGOs across India</p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex gap-2 flex-wrap">
          {([
            { key: 'all', label: 'All', icon: Filter, count: counts.all },
            { key: 'need', label: 'Needs', icon: AlertTriangle, count: counts.need },
            { key: 'campaign', label: 'Campaigns', icon: Target, count: counts.campaign },
            { key: 'ngo', label: 'NGOs', icon: Building2, count: counts.ngo },
          ] as const).map((f) => (
            <button key={f.key} onClick={() => setFilter(f.key)}
              className={`px-4 py-2 rounded-xl text-sm font-semibold flex items-center gap-2 transition-all ${
                filter === f.key
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-800/50 text-slate-400 hover:text-slate-200 border border-slate-700'
              }`}>
              <f.icon className="w-4 h-4" />
              {f.label}
              <span className={`text-xs px-1.5 py-0.5 rounded-md ${
                filter === f.key ? 'bg-white/20' : 'bg-slate-700'
              }`}>{f.count}</span>
            </button>
          ))}
        </div>

        {/* Map */}
        <div className="glass-card rounded-2xl border border-slate-800 overflow-hidden">
          {isLoading ? (
            <div className="w-full h-[500px] flex items-center justify-center">
              <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <MapView markers={filtered} />
          )}
        </div>

        {/* Legend */}
        <div className="flex items-center gap-6 text-xs text-slate-400">
          <span className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-red-500"></span> Community Needs
          </span>
          <span className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-indigo-500"></span> Active Campaigns
          </span>
          <span className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-emerald-500"></span> NGO Offices
          </span>
        </div>
      </div>
    </DashboardLayout>
  );
}
