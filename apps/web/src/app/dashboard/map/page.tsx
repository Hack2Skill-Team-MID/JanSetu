'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import DashboardLayout from '../../../components/layout/dashboard-layout';
import MapControls from '../../../components/map/map-controls';
import FilterPanel from '../../../components/map/filter-panel';
import RightPanel from '../../../components/map/right-panel';
import AssignVolunteerModal from '../../../components/map/assign-volunteer-modal';
import { api } from '../../../lib/api';
import {
  MapPin, Globe, ChevronDown, AlertTriangle, LayoutGrid,
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

/* ── Seeded demo crises for when DB is empty ─────────────────── */
const DEMO_CRISES: Crisis[] = [
  { _id: 'c1', title: 'Dengue Outbreak — Dharavi Camp', description: 'Over 300 confirmed dengue cases in Dharavi slum cluster. Medical aid and mosquito control urgently needed.', category: 'health', urgencyLevel: 'critical', priorityScore: 98, status: 'reported', location: 'Dharavi, Mumbai', region: 'Mumbai', coordinates: [72.854, 19.044], affectedPopulation: 2800, ngoId: { _id: 'n1', name: 'Aarogya Sewa Trust' } },
  { _id: 'c2', title: 'Flash Flood — Noida Sector 62', description: 'Severe waterlogging displacing families in low-lying sectors. Immediate rescue and sheltering required.', category: 'disaster', urgencyLevel: 'critical', priorityScore: 96, status: 'reported', location: 'Sector 62, Noida', region: 'Delhi NCR', coordinates: [77.391, 28.535], affectedPopulation: 1500, ngoId: { _id: 'n2', name: 'Delhi Relief Foundation' } },
  { _id: 'c3', title: 'Food Scarcity — Old Delhi Winter Camp', description: '500+ homeless families without adequate food supply during winter months.', category: 'food', urgencyLevel: 'high', priorityScore: 84, status: 'reported', location: 'Old Delhi', region: 'Delhi NCR', coordinates: [77.231, 28.656], affectedPopulation: 500, ngoId: { _id: 'n2', name: 'Delhi Relief Foundation' } },
  { _id: 'c4', title: 'School Dropout Crisis — Faridabad', description: 'High school dropout rates due to child labor in industrial zones. Education intervention needed.', category: 'education', urgencyLevel: 'medium', priorityScore: 65, status: 'reported', location: 'Faridabad', region: 'Delhi NCR', coordinates: [77.317, 28.408], affectedPopulation: 800, ngoId: { _id: 'n2', name: 'Delhi Relief Foundation' } },
  { _id: 'c5', title: 'Water Contamination — Bandra Slums', description: 'Lead and coliform contamination detected in municipal water supply in coastal slum clusters.', category: 'water', urgencyLevel: 'high', priorityScore: 88, status: 'reported', location: 'Bandra, Mumbai', region: 'Mumbai', coordinates: [72.829, 19.059], affectedPopulation: 3200, ngoId: { _id: 'n1', name: 'Aarogya Sewa Trust' } },
  { _id: 'c6', title: 'Child Malnutrition — Andheri East', description: 'Severe acute malnutrition detected in children under 5 in resettlement colony.', category: 'food', urgencyLevel: 'high', priorityScore: 87, status: 'reported', location: 'Andheri East, Mumbai', region: 'Mumbai', coordinates: [72.869, 19.113], affectedPopulation: 620, ngoId: { _id: 'n1', name: 'Aarogya Sewa Trust' } },
  { _id: 'c7', title: 'Urban Heat Crisis — Whitefield', description: 'Extreme heat affecting construction workers with no shade or water infrastructure in new zones.', category: 'safety', urgencyLevel: 'medium', priorityScore: 71, status: 'reported', location: 'Whitefield, Bangalore', region: 'Bangalore', coordinates: [77.749, 12.969], affectedPopulation: 1100, ngoId: { _id: 'n3', name: 'Karnataka Seva Samiti' } },
  { _id: 'c8', title: 'Cyclone Refugees — Chennai Coast', description: 'Fishermen communities displaced by recent cyclone, temporary shelters collapsing.', category: 'disaster', urgencyLevel: 'critical', priorityScore: 95, status: 'reported', location: 'Marina Beach, Chennai', region: 'Chennai', coordinates: [80.270, 13.082], affectedPopulation: 4500, ngoId: { _id: 'n4', name: 'Tamil Nadu Aid Corps' } },
];

const DEMO_NGOS: CrisisNGO[] = [
  { _id: 'n1', name: 'Aarogya Sewa Trust' },
  { _id: 'n2', name: 'Delhi Relief Foundation' },
  { _id: 'n3', name: 'Karnataka Seva Samiti' },
  { _id: 'n4', name: 'Tamil Nadu Aid Corps' },
];

/* ── Coordinate lookup: maps any location/region string → [lng, lat] ──
   Used to geocode DB entries that were stored with default [0, 0] coords. ─────── */
const LOCATION_COORDS: Record<string, [number, number]> = {
  // Cities / metro areas
  'delhi ncr':   [77.1025, 28.7041],
  'delhi':       [77.2090, 28.6139],
  'new delhi':   [77.2090, 28.6139],
  'mumbai':      [72.8777, 19.0760],
  'bangalore':   [77.5946, 12.9716],
  'bengaluru':   [77.5946, 12.9716],
  'chennai':     [80.2707, 13.0827],
  'kolkata':     [88.3639, 22.5726],
  'hyderabad':   [78.4867, 17.3850],
  'pune':        [73.8567, 18.5204],
  'ahmedabad':   [72.5714, 23.0225],
  'jaipur':      [75.7873, 26.9124],
  'lucknow':     [80.9462, 26.8467],
  'surat':       [72.8311, 21.1702],
  'patna':       [85.1376, 25.5941],
  'chandigarh':  [76.7794, 30.7333],
  'bhopal':      [77.4126, 23.2599],
  'indore':      [75.8577, 22.7196],
  'nagpur':      [79.0882, 21.1458],
  'kochi':       [76.2673, 9.9312],
  'guwahati':    [91.7362, 26.1445],
  // Sub-areas / neighborhoods
  'dharavi':     [72.8540, 19.0444],
  'noida':       [77.3910, 28.5355],
  'gurgaon':     [77.0266, 28.4595],
  'gurugram':    [77.0266, 28.4595],
  'faridabad':   [77.3178, 28.4089],
  'bandra':      [72.8295, 19.0596],
  'andheri':     [72.8697, 19.1136],
  'kurla':       [72.8826, 19.0728],
  'whitefield':  [77.7499, 12.9698],
  'koramangala': [77.6271, 12.9279],
  'salt lake':   [88.4136, 22.5829],
  'howrah':      [88.2636, 22.5958],
  'old delhi':   [77.2310, 28.6562],
  'marina':      [80.2707, 13.0500],
  // States / broad regions
  'maharashtra':  [75.7139, 19.7515],
  'rajasthan':    [74.2179, 27.0238],
  'uttar pradesh':[80.9462, 26.8467],
  'bihar':        [85.3131, 25.0961],
  'kerala':       [76.2711, 10.8505],
  'karnataka':    [75.7139, 15.3173],
  'tamil nadu':   [78.6569, 11.1271],
  'west bengal':  [87.8550, 22.9868],
  'gujarat':      [71.1924, 22.2587],
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
    const matchSearch =
      !search ||
      c.title.toLowerCase().includes(search.toLowerCase()) ||
      c.category.toLowerCase().includes(search.toLowerCase()) ||
      c.region.toLowerCase().includes(search.toLowerCase()) ||
      c.location.toLowerCase().includes(search.toLowerCase());

    const matchUrgency  = filters.urgency === 'all'   || c.urgencyLevel === filters.urgency;
    const matchCategory = filters.category === 'all'  || c.category === filters.category;
    const matchNgo      = filters.ngoId === 'all'     ||
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
  const [allCrises, setAllCrises]         = useState<Crisis[]>([]);
  const [ngos, setNgos]                   = useState<CrisisNGO[]>([]);
  const [selectedCity, setSelectedCity]   = useState<City | null>(null);
  const [selectedCrisis, setSelectedCrisis] = useState<Crisis | null>(null);
  const [isLive, setIsLive]               = useState(true);
  const [searchQuery, setSearchQuery]     = useState('');
  const [filters, setFilters]             = useState<CrisisFilters>({
    urgency: 'all', category: 'all', ngoId: 'all',
  });
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showCityMenu, setShowCityMenu]   = useState(false);
  const [isLoading, setIsLoading]         = useState(true);
  const [usingDemo, setUsingDemo]         = useState(false);

  /* ── Fetch ── */
  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [needsRes, ngosRes] = await Promise.all([
        api.get('/needs?limit=100').catch(() => ({ data: { success: false } })),
        api.get('/network/ngos').catch(() => ({ data: { success: false } })),
      ]);

      const rawNeeds: any[] = needsRes.data?.data || [];
      const rawNgos: any[]  = ngosRes.data?.data?.organizations || ngosRes.data?.data || [];

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
            _id:                n._id || n.id,
            title:             n.title,
            description:       n.description,
            category:          n.category,
            urgencyLevel:      n.urgencyLevel || n.urgency || 'medium',
            priorityScore:     n.priorityScore || 50,
            status:            n.status,
            location:          n.location,
            region:            n.region || n.location,
            coordinates:       coords,
            affectedPopulation: n.affectedPopulation,
            ngoId:             n.ngoId,
            aiInsights:        n.aiInsights,
            createdAt:         n.createdAt,
          } as Crisis;
        })
        // Drop any that are still [0,0] after geocoding (truly unknown location)
        .filter((c) => !(c.coordinates[0] === 0 && c.coordinates[1] === 0));

      const mappedNgos: CrisisNGO[] = rawNgos.map((o: any) => ({
        _id:  o._id || o.id,
        name: o.name,
      }));

      if (mappedCrises.length > 0) {
        setAllCrises(mappedCrises);
        setUsingDemo(false);
      } else {
        setAllCrises(DEMO_CRISES);
        setUsingDemo(true);
      }

      setNgos(mappedNgos.length > 0 ? mappedNgos : DEMO_NGOS);
    } catch {
      setAllCrises(DEMO_CRISES);
      setNgos(DEMO_NGOS);
      setUsingDemo(true);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  /* ── Filtered crises (city + filters + search) ── */
  const cityFilteredCrises = useMemo(() => {
    if (!selectedCity) return allCrises;
    return allCrises.filter((c) =>
      c.region.toLowerCase().includes(selectedCity.name.toLowerCase()) ||
      selectedCity.regions.some((r) => c.region.toLowerCase().includes(r.name.toLowerCase()))
    );
  }, [allCrises, selectedCity]);

  const filteredCrises = useMemo(
    () => applyFilters(cityFilteredCrises, filters, searchQuery),
    [cityFilteredCrises, filters, searchQuery]
  );

  /* ── Handlers ── */
  const handleAssignVolunteer = useCallback(
    async (crisisId: string, data: { volunteerName: string; volunteerId: string }) => {
      try {
        await api.post(`/volunteers/assign`, { crisisId, ...data }).catch(() => null);
        console.log('Volunteer assigned (demo):', data);
      } catch { /* non-critical */ }
    },
    []
  );

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
    high:     filteredCrises.filter((c) => c.urgencyLevel === 'high').length,
    medium:   filteredCrises.filter((c) => c.urgencyLevel === 'medium').length,
    low:      filteredCrises.filter((c) => c.urgencyLevel === 'low').length,
  }), [filteredCrises]);

  return (
    <DashboardLayout>
      <div className="space-y-5 h-full">

        {/* ── Header ── */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-3">
              <Globe className="w-6 h-6 text-indigo-400" />
              Crisis Intelligence Map
            </h1>
            <p className="text-slate-400 text-sm mt-1">
              Live crisis visualization across India · {filteredCrises.length} active crises
              {usingDemo && <span className="ml-2 text-xs text-amber-400">(demo data)</span>}
            </p>
          </div>

          {/* City selector */}
          <div className="relative">
            <button
              onClick={() => setShowCityMenu(!showCityMenu)}
              className="flex items-center gap-2 px-4 py-2.5 bg-slate-800/80 border border-slate-700 hover:border-indigo-500/50 rounded-xl text-sm font-medium text-slate-200 transition-all"
            >
              <MapPin className="w-4 h-4 text-indigo-400" />
              {selectedCity ? selectedCity.name : 'All India'}
              <ChevronDown className={`w-4 h-4 text-slate-500 transition-transform ${showCityMenu ? 'rotate-180' : ''}`} />
            </button>
            {showCityMenu && (
              <div className="absolute right-0 top-full mt-2 w-48 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl z-50 overflow-hidden">
                <button
                  onClick={() => { setSelectedCity(null); setShowCityMenu(false); }}
                  className={`w-full text-left px-4 py-2.5 text-sm hover:bg-slate-800 transition-colors ${!selectedCity ? 'text-indigo-400 font-semibold' : 'text-slate-300'}`}
                >
                  <LayoutGrid className="w-3.5 h-3.5 inline mr-2" />All India
                </button>
                {CITIES.map((city) => (
                  <button
                    key={city.name}
                    onClick={() => { setSelectedCity(city); setShowCityMenu(false); }}
                    className={`w-full text-left px-4 py-2.5 text-sm hover:bg-slate-800 transition-colors ${selectedCity?.name === city.name ? 'text-indigo-400 font-semibold' : 'text-slate-300'}`}
                  >
                    <MapPin className="w-3.5 h-3.5 inline mr-2" />{city.name}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ── Urgency summary pills ── */}
        <div className="flex items-center gap-2 flex-wrap">
          {(
            [
              { label: 'Critical', key: 'critical', color: 'bg-red-500/20 text-red-400 border-red-500/40' },
              { label: 'High',     key: 'high',     color: 'bg-orange-500/20 text-orange-400 border-orange-500/40' },
              { label: 'Medium',   key: 'medium',   color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/40' },
              { label: 'Low',      key: 'low',      color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40' },
            ] as const
          ).map(({ label, key, color }) => (
            <span key={key} className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold border ${color}`}>
              <span className="w-1.5 h-1.5 rounded-full bg-current" />
              {urgencyCounts[key]} {label}
            </span>
          ))}
        </div>

        {/* ── Controls ── */}
        <MapControls
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          isLive={isLive}
          onToggleLive={() => setIsLive(!isLive)}
          onRefresh={fetchData}
          totalCrises={allCrises.length}
          filteredCount={filteredCrises.length}
        />

        {/* ── Main grid (map + side panels) ── */}
        <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr_320px] gap-4" style={{ minHeight: '560px' }}>

          {/* Left — Filter panel */}
          <div className="lg:block">
            <FilterPanel filters={filters} onChange={setFilters} ngos={ngos} />

            {/* City regions */}
            {selectedCity && selectedCity.regions.length > 0 && (
              <div className="mt-4 bg-slate-900/80 border border-slate-800 rounded-2xl p-4">
                <h3 className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-3">
                  Regions in {selectedCity.name}
                </h3>
                <ul className="space-y-1">
                  {selectedCity.regions.map((r) => {
                    const count = filteredCrises.filter((c) =>
                      c.region.toLowerCase().includes(r.name.toLowerCase()) ||
                      c.location.toLowerCase().includes(r.name.toLowerCase())
                    ).length;
                    return (
                      <li
                        key={r.name}
                        className="flex items-center justify-between text-xs py-1 px-2 rounded-lg hover:bg-slate-800/40 transition-colors cursor-default"
                      >
                        <span className="text-slate-400">{r.name}</span>
                        {count > 0 && (
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-red-500/20 text-red-400">
                            {count}
                          </span>
                        )}
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}

            {/* Legend */}
            <div className="mt-4 bg-slate-900/80 border border-slate-800 rounded-2xl p-4">
              <h3 className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-3">Legend</h3>
              <div className="space-y-1.5">
                {Object.entries(CATEGORY_COLORS).map(([cat, color]) => (
                  <div key={cat} className="flex items-center gap-2 text-xs text-slate-400">
                    <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: color }} />
                    <span className="capitalize">{cat}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Center — Map */}
          <div className="glass-card rounded-2xl border border-slate-800 overflow-hidden" style={{ minHeight: '480px' }}>
            {isLoading ? (
              <div className="w-full h-full flex items-center justify-center min-h-[480px]">
                <div className="text-center space-y-3">
                  <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto" />
                  <p className="text-sm text-slate-400">Fetching crisis data...</p>
                </div>
              </div>
            ) : !isLive ? (
              <div className="w-full h-full flex items-center justify-center min-h-[480px]">
                <div className="text-center space-y-3">
                  <AlertTriangle className="w-12 h-12 text-slate-600 mx-auto" />
                  <p className="text-slate-400 font-medium">Live mode is paused</p>
                  <p className="text-sm text-slate-500">Enable LIVE to show crisis markers</p>
                  <button
                    onClick={() => setIsLive(true)}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-semibold transition-all"
                  >
                    Enable Live
                  </button>
                </div>
              </div>
            ) : filteredCrises.length === 0 ? (
              <div className="w-full h-full flex items-center justify-center min-h-[480px]">
                <div className="text-center space-y-3">
                  <MapPin className="w-12 h-12 text-slate-600 mx-auto" />
                  <p className="text-slate-400 font-medium">Not registered yet</p>
                  <p className="text-sm text-slate-500">No crises match your current filters</p>
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
          </div>

          {/* Right — Crisis detail panel */}
          <div className="glass-card rounded-2xl border border-slate-800 overflow-hidden flex flex-col" style={{ minHeight: '480px' }}>
            <RightPanel
              crisis={selectedCrisis}
              onClose={() => setSelectedCrisis(null)}
              onAssignVolunteer={() => setShowAssignModal(true)}
              onDonate={handleDonate}
              onFetchInsights={handleFetchInsights}
            />
          </div>
        </div>
      </div>

      {/* ── Assign volunteer modal ── */}
      {showAssignModal && selectedCrisis && (
        <AssignVolunteerModal
          crisisId={selectedCrisis._id}
          crisisTitle={selectedCrisis.title}
          onAssign={handleAssignVolunteer}
          onClose={() => setShowAssignModal(false)}
        />
      )}
    </DashboardLayout>
  );
}
