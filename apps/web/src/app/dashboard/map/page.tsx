'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import DashboardLayout from '../../../components/layout/dashboard-layout';
import RightPanel from '../../../components/map/right-panel';
import { api } from '../../../lib/api';
import {
  MapPin, ChevronDown, AlertTriangle, LayoutGrid,
  Search, Filter,
} from 'lucide-react';
import type { Crisis, CrisisNGO, City, CrisisFilters } from '../../../types/crisis-map.types';
import { CITIES, CATEGORY_COLORS, URGENCY_COLORS } from '../../../types/crisis-map.types';

/* ── SSR-safe dynamic import ── */
const CrisisMapView = dynamic(
  () => import('../../../components/map/crisis-map-view'),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full flex items-center justify-center min-h-[480px] bg-slate-900/40 rounded-2xl">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm text-slate-400">Loading crisis intelligence map...</p>
        </div>
      </div>
    ),
  }
);

/* ── Coordinate lookup: maps any location/region string → [lng, lat] ──
   Used to geocode DB entries that were stored with default [0, 0] coords. ─────── */
const LOCATION_COORDS: Record<string, [number, number]> = {
  // Cities / metro areas
  'delhi ncr': [77.1025, 28.7041],
  'delhi': [77.2090, 28.6139],
  'new delhi': [77.2090, 28.6139],
  'mumbai': [72.8777, 19.0760],
  'bangalore': [77.5946, 12.9716],
  'bengaluru': [77.5946, 12.9716],
  'chennai': [80.2707, 13.0827],
  'kolkata': [88.3639, 22.5726],
  'hyderabad': [78.4867, 17.3850],
  'pune': [73.8567, 18.5204],
  'ahmedabad': [72.5714, 23.0225],
  'jaipur': [75.7873, 26.9124],
  'lucknow': [80.9462, 26.8467],
  'surat': [72.8311, 21.1702],
  'patna': [85.1376, 25.5941],
  'chandigarh': [76.7794, 30.7333],
  'bhopal': [77.4126, 23.2599],
  'indore': [75.8577, 22.7196],
  'nagpur': [79.0882, 21.1458],
  'kochi': [76.2673, 9.9312],
  'guwahati': [91.7362, 26.1445],
  // Sub-areas / neighborhoods
  'dharavi': [72.8540, 19.0444],
  'noida': [77.3910, 28.5355],
  'gurgaon': [77.0266, 28.4595],
  'gurugram': [77.0266, 28.4595],
  'faridabad': [77.3178, 28.4089],
  'bandra': [72.8295, 19.0596],
  'andheri': [72.8697, 19.1136],
  'kurla': [72.8826, 19.0728],
  'whitefield': [77.7499, 12.9698],
  'koramangala': [77.6271, 12.9279],
  'salt lake': [88.4136, 22.5829],
  'howrah': [88.2636, 22.5958],
  'old delhi': [77.2310, 28.6562],
  'marina': [80.2707, 13.0500],
  // States / broad regions
  'maharashtra': [75.7139, 19.7515],
  'rajasthan': [74.2179, 27.0238],
  'uttar pradesh': [80.9462, 26.8467],
  'bihar': [85.3131, 25.0961],
  'kerala': [76.2711, 10.8505],
  'karnataka': [75.7139, 15.3173],
  'tamil nadu': [78.6569, 11.1271],
  'west bengal': [87.8550, 22.9868],
  'gujarat': [71.1924, 22.2587],
};

/** Return best-match [lng, lat] for a location/region string, or null if unknown */
function geocodeLocation(location: string, region: string): [number, number] | null {
  const search = [location, region].join(' ').toLowerCase();
  // Try longest key match first (more specific)
  const sorted = Object.keys(LOCATION_COORDS).sort((a, b) => b.length - a.length);
  for (const key of sorted) {
    if (search.includes(key)) return LOCATION_COORDS[key];
  }
  return null;
}

/* ── Apply filters in-memory ── */
function applyFilters(crises: Crisis[], filters: CrisisFilters, search: string): Crisis[] {
  return crises.filter((c) => {
    const locationStr = typeof c.location === 'object' && c.location !== null && 'city' in c.location
      ? `${c.location.city} ${c.location.region}`
      : String(c.location || '');

    const q = search.toLowerCase();
    // If the search matches a region/city name, show all crises in that area (don't filter by title)
    const isCitySearch = CITIES.some(
      (city) => city.name.toLowerCase().includes(q) || q.includes(city.name.toLowerCase())
    );

    const matchSearch =
      !search ||
      isCitySearch || // city search → let cityFilteredCrises do the narrowing
      c.title.toLowerCase().includes(q) ||
      c.category.toLowerCase().includes(q) ||
      (c.region || '').toLowerCase().includes(q) ||
      locationStr.toLowerCase().includes(q);

    const matchUrgency = filters.urgency === 'all' || c.urgencyLevel === filters.urgency;
    const matchCategory = filters.category === 'all' || c.category === filters.category;
    const matchNgo = filters.ngoId === 'all' ||
      (typeof c.ngoId === 'object' ? c.ngoId?._id === filters.ngoId : c.ngoId === filters.ngoId);

    return matchSearch && matchUrgency && matchCategory && matchNgo;
  });
}

/* ════════════════════════════════════════════════════
   PAGE
   ════════════════════════════════════════════════════ */
export default function CrisisMapPage() {
  const router = useRouter();

  /* ── Global state ── */
  const [allCrises, setAllCrises] = useState<Crisis[]>([]);
  const [ngos, setNgos] = useState<CrisisNGO[]>([]);
  const [selectedCity, setSelectedCity] = useState<City | null>(null);
  const [selectedCrisis, setSelectedCrisis] = useState<Crisis | null>(null);
  const [isLive, setIsLive] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<CrisisFilters>({
    urgency: 'all', category: 'all', ngoId: 'all',
  });
  const [showCityMenu, setShowCityMenu] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showFilterPanel, setShowFilterPanel] = useState(false);

  /* ── Fetch ── */
  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [needsRes, ngosRes] = await Promise.all([
        api.get('/needs?limit=100').catch(() => ({ data: { success: false } })),
        api.get('/network/ngos').catch(() => ({ data: { success: false } })),
      ]);

      const rawNeeds: any[] = needsRes.data?.data || [];
      const rawNgos: any[] = ngosRes.data?.data?.organizations || ngosRes.data?.data || [];

      const mappedCrises: Crisis[] = rawNeeds
        .filter((n: any) => n.coordinates && n.coordinates.length === 2)
        .map((n: any) => {
          let coords: [number, number] = n.coordinates as [number, number];

          // If coordinates are [0,0] (default/unset), try to geocode from location/region string
          const isZero = coords[0] === 0 && coords[1] === 0;
          if (isZero) {
            const resolved = geocodeLocation(n.location || '', n.region || n.location || '');
            if (resolved) coords = resolved;
          }

          return {
            _id: n._id || n.id,
            title: n.title,
            description: n.description,
            category: (() => {
              const cat = n.category || 'other';
              const map: Record<string, string> = {
                healthcare: 'health', medical: 'health',
                disaster_relief: 'disaster', flood: 'disaster', cyclone: 'disaster',
                food_nutrition: 'food', hunger: 'food',
                water_sanitation: 'water',
                shelter: 'safety', safety_security: 'safety',
              };
              return map[cat] ?? cat;
            })(),
            urgencyLevel: n.urgencyLevel || n.urgency || 'medium',
            priorityScore: n.priorityScore || 50,
            status: n.status,
            location: n.location,
            region: n.region || n.location,
            coordinates: coords,
            affectedPopulation: n.affectedPopulation,
            ngoId: n.ngoId,
            aiInsights: n.aiInsights,
            createdAt: n.createdAt,
          } as Crisis;
        })
        // Drop any that are still [0,0] after geocoding (truly unknown location)
        .filter((c) => !c.coordinates || !(c.coordinates[0] === 0 && c.coordinates[1] === 0));

      const mappedNgos: CrisisNGO[] = rawNgos.map((o: any) => ({
        _id: o._id || o.id,
        name: o.name,
      }));

      if (mappedCrises.length > 0) {
        setAllCrises(mappedCrises);
      } else {
        setAllCrises([]);
      }

      setNgos(mappedNgos);
    } catch {
      setAllCrises([]);
      setNgos([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  /* ── Auto-pan map when search matches a registered city ── */
  useEffect(() => {
    if (!searchQuery.trim()) {
      // If the user clears the search, reset to All India only if city was auto-selected by search
      // We track this with a flag via the selectedCity name matching the query
      return;
    }
    const q = searchQuery.toLowerCase().trim();
    const matched = CITIES.find((city) =>
      city.name.toLowerCase().includes(q) ||
      q.includes(city.name.toLowerCase())
    );
    if (matched) {
      setSelectedCity(matched);
    }
  }, [searchQuery]);

  /* ── Clear city selection when search is cleared ── */
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSelectedCity(null);
    }
  }, [searchQuery]);

  /* ── Filtered crises (city + filters + search) ── */
  const cityFilteredCrises = useMemo(() => {
    if (!selectedCity) return allCrises;
    return allCrises.filter((c) => {
      const loc = typeof c.location === 'object' && c.location !== null && 'city' in c.location
        ? c.location.city
        : c.region || '';
      return (
        loc.toLowerCase().includes(selectedCity.name.toLowerCase()) ||
        (c.region || '').toLowerCase().includes(selectedCity.name.toLowerCase()) ||
        selectedCity.regions.some((r) =>
          (c.region || '').toLowerCase().includes(r.name.toLowerCase()) ||
          loc.toLowerCase().includes(r.name.toLowerCase())
        )
      );
    });
  }, [allCrises, selectedCity]);

  const filteredCrises = useMemo(
    () => applyFilters(cityFilteredCrises, filters, searchQuery),
    [cityFilteredCrises, filters, searchQuery]
  );

  /* ── Handlers ── */
  const handleDonate = useCallback(
    (crisisId: string) => {
      router.push(`/dashboard/donate?source=crisis&crisisId=${crisisId}`);
    },
    [router]
  );

  const handleFetchInsights = useCallback(async (crisisId: string): Promise<string> => {
    try {
      const res = await api.post('/ai-bridge/extract-insights', {
        text: filteredCrises.find((c) => c._id === crisisId)?.description || '',
      });
      return res.data?.summary || res.data?.data?.summary || 'AI analysis unavailable at this time.';
    } catch {
      const crisis = filteredCrises.find((c) => c._id === crisisId);
      if (crisis?.aiInsights) return crisis.aiInsights;
      return `Based on the ${crisis?.category || 'category'} crisis in ${crisis?.region || 'the region'} affecting approximately ${crisis?.affectedPopulation?.toLocaleString() || 'an unknown number of'} people, this is classified as ${crisis?.urgencyLevel} urgency. Immediate deployment of ${crisis?.category === 'health' ? 'medical teams' : crisis?.category === 'food' ? 'food distribution units' : 'relief resources'} is recommended.`;
    }
  }, [filteredCrises]);

  /* ── Urgency counts ── */
  const urgencyCounts = useMemo(() => ({
    critical: filteredCrises.filter((c) => c.urgencyLevel === 'critical').length,
    high: filteredCrises.filter((c) => c.urgencyLevel === 'high').length,
    medium: filteredCrises.filter((c) => c.urgencyLevel === 'medium').length,
    low: filteredCrises.filter((c) => c.urgencyLevel === 'low').length,
  }), [filteredCrises]);


  // close city menu helper
  const closeCityMenu = () => setShowCityMenu(false);

  return (
    <DashboardLayout>
      <div
        className="relative rounded-2xl overflow-hidden"
        style={{ height: 'calc(100vh - 112px)', minHeight: '500px' }}
        onClick={() => { if (showCityMenu) closeCityMenu(); if (showFilterPanel) setShowFilterPanel(false); }}
      >
        {/* MAP */}
        {isLoading ? (
          <div className="absolute inset-0 bg-[#0d1117] flex items-center justify-center">
            <div className="text-center space-y-3">
              <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-xs text-slate-500">Loading crisis data...</p>
            </div>
          </div>
        ) : (
          <CrisisMapView
            crises={filteredCrises}
            selectedCity={selectedCity}
            isLive={isLive}
            onMarkerClick={setSelectedCrisis}
            selectedCrisis={selectedCrisis}
          />
        )}

        {/* LIVE-OFF overlay */}
        {!isLive && !isLoading && (
          <div className="absolute inset-0 z-[950] flex items-center justify-center" style={{ background: 'rgba(5,8,15,0.72)', backdropFilter: 'blur(3px)' }}>
            <div className="text-center space-y-3">
              <AlertTriangle className="w-10 h-10 text-slate-600 mx-auto" />
              <p className="text-sm font-semibold text-slate-400">Map paused</p>
              <button onClick={(e) => { e.stopPropagation(); setIsLive(true); }} className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-xl text-xs font-bold transition-all">
                Resume Live
              </button>
            </div>
          </div>
        )}

        {/* NO-CRISES overlay */}
        {isLive && !isLoading && filteredCrises.length === 0 && (
          <div className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none" style={{ background: 'rgba(5,8,15,0.4)', backdropFilter: 'blur(2px)' }}>
            <div className="text-center space-y-2 bg-white/10 backdrop-blur-md border border-white/20 px-6 py-4 rounded-xl shadow-lg">
              <MapPin className="w-8 h-8 text-white/50 mx-auto" />
              <p className="text-sm font-semibold text-white/90">👉 Not registered yet</p>
              <p className="text-xs text-white/60">No crises match your filters</p>
            </div>
          </div>
        )}

        {/* -- FLOATING TOP TOOLBAR -- */}
        <div className="absolute top-3 left-3 right-3 z-[1000] flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
          {/* City picker */}
          <div className="relative flex-shrink-0">
            <button
              onClick={() => { setShowCityMenu(!showCityMenu); setShowFilterPanel(false); }}
              className="flex items-center gap-1.5 px-3 py-2 bg-white/10 backdrop-blur-md border border-white/20 text-white rounded-xl text-xs font-semibold shadow-lg transition-all hover:bg-white/20"
            >
              {selectedCity ? selectedCity.name : 'All India'}
              <ChevronDown className={`w-3 h-3 text-white/70 transition-transform ${showCityMenu ? 'rotate-180' : ''}`} />
            </button>
            {showCityMenu && (
              <div className="absolute left-0 top-full mt-1.5 w-44 rounded-xl overflow-hidden z-50 shadow-lg py-1 bg-white/10 backdrop-blur-md border border-white/20">
                <button onClick={() => { setSelectedCity(null); setShowCityMenu(false); }} className={`w-full text-left px-3 py-2 text-xs hover:bg-white/20 flex items-center gap-2 transition-colors ${!selectedCity ? 'text-blue-300 font-semibold bg-white/5' : 'text-white/80'}`}>
                  <LayoutGrid className="w-3 h-3" /> All India
                </button>
                <div className="border-t border-white/20 my-1" />
                {CITIES.map((city) => (
                  <button key={city.name} onClick={() => { setSelectedCity(city); setShowCityMenu(false); }} className={`w-full text-left px-3 py-2 text-xs hover:bg-white/20 flex items-center gap-2 transition-colors ${selectedCity?.name === city.name ? 'text-blue-300 font-semibold bg-white/5' : 'text-white/80'}`}>
                    <MapPin className="w-3 h-3" /> {city.name}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Search */}
          <div className="relative flex-1 max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500 pointer-events-none" />
            <input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search locations, issues..." className="w-full pl-8 pr-3 py-2 text-xs text-slate-200 placeholder:text-slate-500 rounded-xl focus:outline-none transition-all" style={{ background: 'rgba(13,20,35,0.92)', border: '1px solid rgba(51,65,85,0.6)', backdropFilter: 'blur(8px)' }} />
          </div>

          {/* Filter */}
          <div className="relative flex-shrink-0">
            <button onClick={() => { setShowFilterPanel(!showFilterPanel); setShowCityMenu(false); }} className={`p-2 rounded-xl transition-all shadow-lg bg-white/10 backdrop-blur-md border ${showFilterPanel ? 'border-blue-400/50 text-blue-300' : 'border-white/20 text-white/80 hover:bg-white/20'}`} title="Filters">
              <Filter className="w-4 h-4" />
            </button>
            {showFilterPanel && (
              <div className="absolute left-0 top-full mt-1.5 w-56 rounded-2xl z-50 shadow-lg p-4 space-y-4 bg-white/10 backdrop-blur-md border border-white/20">
                <div>
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Urgency</p>
                  <div className="flex flex-wrap gap-1.5">
                    {(['all', 'critical', 'high', 'medium', 'low'] as const).map((u) => (
                      <button key={u} onClick={() => setFilters({ ...filters, urgency: u })} className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all ${filters.urgency === u ? 'bg-indigo-600 text-white' : 'bg-slate-800/60 text-slate-400 hover:text-slate-200'}`}>
                        {u === 'all' ? 'All' : u.charAt(0).toUpperCase() + u.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="border-t border-slate-800/50" />
                <div>
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Category</p>
                  <div className="flex flex-wrap gap-1.5">
                    {(['all', 'health', 'food', 'disaster', 'education', 'water', 'safety'] as const).map((c) => (
                      <button key={c} onClick={() => setFilters({ ...filters, category: c })} className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all ${filters.category === c ? 'bg-indigo-600 text-white' : 'bg-slate-800/60 text-slate-400 hover:text-slate-200'}`}>
                        {c === 'all' ? 'All' : c.charAt(0).toUpperCase() + c.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>
                {ngos.length > 0 && (
                  <>
                    <div className="border-t border-slate-800/50" />
                    <div>
                      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">NGO</p>
                      <select value={filters.ngoId} onChange={(e) => setFilters({ ...filters, ngoId: e.target.value })} className="w-full px-3 py-2 rounded-xl text-xs text-slate-300 focus:outline-none" style={{ background: 'rgba(30,41,59,0.8)', border: '1px solid rgba(51,65,85,0.5)' }}>
                        <option value="all">All NGOs</option>
                        {ngos.map((n) => <option key={n._id} value={n._id}>{n.name}</option>)}
                      </select>
                    </div>
                  </>
                )}
                {(filters.urgency !== 'all' || filters.category !== 'all' || filters.ngoId !== 'all') && (
                  <button onClick={() => setFilters({ urgency: 'all', category: 'all', ngoId: 'all' })} className="w-full py-1.5 rounded-xl text-[11px] text-red-400 hover:text-red-300 border border-red-500/20 hover:border-red-500/40 transition-all">
                    Clear filters
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Refresh */}
          <button onClick={fetchData} className="p-2 rounded-xl text-white/80 hover:bg-white/20 transition-all flex-shrink-0 bg-white/10 backdrop-blur-md border border-white/20 shadow-lg" title="Refresh">
            <MapPin className="w-4 h-4" />
          </button>

          {/* LIVE */}
          <button onClick={() => setIsLive(!isLive)} className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold transition-all flex-shrink-0 shadow-lg ${isLive ? 'bg-red-600 hover:bg-red-500 text-white shadow-[0_0_12px_rgba(239,68,68,0.4)]' : 'bg-white/10 backdrop-blur-md border border-white/20 text-white/80 hover:bg-white/20'}`}>
            {isLive && <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />}
            <span>{isLive ? 'Live' : 'Paused'}</span>
          </button>


        </div>

        {/* -- FLOATING LEGEND (bottom-left) -- */}
        <div className="absolute bottom-6 left-3 z-[1000] rounded-xl p-3 pointer-events-none" style={{ background: 'rgba(10,16,28,0.88)', border: '1px solid rgba(51,65,85,0.5)', backdropFilter: 'blur(8px)' }}>
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Issue Types</p>
          {[
            { label: 'Health', color: '#ef4444' },
            { label: 'Food', color: '#f97316' },
            { label: 'Disaster', color: '#eab308' },
            { label: 'Education', color: '#3b82f6' },
            { label: 'Water', color: '#06b6d4' },
            { label: 'Safety', color: '#a855f7' },
          ].map(({ label, color }) => (
            <div key={label} className="flex items-center gap-2 mb-1 last:mb-0">
              <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: color, boxShadow: `0 0 5px ${color}99` }} />
              <span className="text-[11px] text-slate-400">{label}</span>
            </div>
          ))}
        </div>

        {/* -- SLIDE-IN RIGHT PANEL (on marker click) -- */}
        <div
          className={`absolute top-0 right-0 bottom-0 z-30 transition-all duration-300 ease-in-out ${selectedCrisis ? 'w-72 opacity-100' : 'w-0 opacity-0 pointer-events-none'}`}
          onClick={(e) => e.stopPropagation()}
        >
          {selectedCrisis && (
            <div className="h-full w-72" style={{ background: 'rgba(8,13,24,0.96)', borderLeft: '1px solid rgba(51,65,85,0.5)', backdropFilter: 'blur(16px)' }}>
              <RightPanel
                crisis={selectedCrisis}
                onClose={() => setSelectedCrisis(null)}
                onDonate={handleDonate}
                onFetchInsights={handleFetchInsights}
              />
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
