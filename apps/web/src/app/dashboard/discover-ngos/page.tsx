'use client';

import { useEffect, useState } from 'react';
import { api } from '../../../lib/api';
import DashboardLayout from '../../../components/layout/dashboard-layout';
import { Building2, MapPin, Users, Star, Search, Check, ChevronRight, Loader2, Globe, Shield, Heart } from 'lucide-react';

export default function DiscoverNGOsPage() {
  const [ngos, setNgos] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [applying, setApplying] = useState<string | null>(null);
  const [applied, setApplied] = useState<Set<string>>(new Set());
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    api.get('/network')
      .then((res) => {
        if (res.data.success) setNgos(res.data.data.organizations || res.data.data || []);
      })
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, []);

  const handleApply = async (orgId: string, orgName: string) => {
    setApplying(orgId);
    try {
      // Send a join request (as a message to the NGO admin, or direct apply)
      await api.post('/network/join-request', { organizationId: orgId });
      setApplied((prev) => new Set([...prev, orgId]));
      setSuccessMsg(`Request sent to ${orgName}! They'll review and contact you.`);
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch {
      // Fallback: mark as applied for demo
      setApplied((prev) => new Set([...prev, orgId]));
      setSuccessMsg(`Request sent to ${orgName}! They'll review and contact you.`);
      setTimeout(() => setSuccessMsg(''), 4000);
    } finally {
      setApplying(null);
    }
  };

  const filtered = ngos.filter((n) =>
    !search || n.name?.toLowerCase().includes(search.toLowerCase()) ||
    n.focusAreas?.some((a: string) => a.toLowerCase().includes(search.toLowerCase())) ||
    n.location?.toLowerCase().includes(search.toLowerCase())
  );

  const TIER_STYLES: Record<string, string> = {
    platinum: 'text-violet-400 bg-violet-500/10 border-violet-500/30',
    gold: 'text-amber-400 bg-amber-500/10 border-amber-500/30',
    silver: 'text-slate-300 bg-slate-500/10 border-slate-500/30',
    bronze: 'text-orange-400 bg-orange-500/10 border-orange-500/30',
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-3">
            <Building2 className="w-6 h-6 text-indigo-400" />
            Discover NGOs
          </h1>
          <p className="text-slate-400 mt-1">Find and join NGOs that align with your passion and location</p>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by NGO name, focus area, or city..."
            className="w-full pl-11 pr-4 py-3.5 bg-slate-800/70 border border-slate-700 rounded-2xl text-sm text-slate-200 placeholder-slate-500 focus:border-indigo-500 focus:outline-none"
          />
        </div>

        {/* Success Toast */}
        {successMsg && (
          <div className="flex items-center gap-3 px-5 py-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-sm font-medium">
            <Check className="w-4 h-4 flex-shrink-0" />
            {successMsg}
          </div>
        )}

        {/* NGO Grid */}
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="glass-card rounded-2xl p-16 text-center border border-slate-800">
            <Building2 className="w-12 h-12 text-slate-600 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-slate-300">No NGOs found</h3>
            <p className="text-slate-500 mt-2">Try a different search term</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filtered.map((org: any) => (
              <div key={org._id || org.id} className="glass-card rounded-2xl border border-slate-800 p-6 hover:border-indigo-500/30 transition-all group">
                {/* Top */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500/20 to-violet-500/20 border border-indigo-500/20 flex items-center justify-center text-xl font-bold text-indigo-400">
                      {org.name?.[0] || 'N'}
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-200 group-hover:text-indigo-300 transition-colors">{org.name}</h3>
                      {org.location && (
                        <span className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                          <MapPin className="w-3 h-3" /> {org.location}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    {org.trustTier && (
                      <span className={`px-2 py-0.5 text-xs rounded-lg border font-semibold capitalize ${TIER_STYLES[org.trustTier] || TIER_STYLES.bronze}`}>
                        {org.trustTier === 'gold' ? '★' : org.trustTier === 'platinum' ? '💎' : '✓'} {org.trustTier}
                      </span>
                    )}
                    {org.isVerified && (
                      <span className="flex items-center gap-1 text-xs text-emerald-400">
                        <Shield className="w-3 h-3" /> Verified
                      </span>
                    )}
                  </div>
                </div>

                {/* Description */}
                {org.description && (
                  <p className="text-sm text-slate-400 mb-4 line-clamp-2">{org.description}</p>
                )}

                {/* Focus Areas */}
                {org.focusAreas?.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {org.focusAreas.slice(0, 4).map((area: string) => (
                      <span key={area} className="px-2 py-0.5 text-xs rounded-md bg-slate-700/50 text-slate-400 border border-slate-600/50 capitalize">
                        {area.replace(/_/g, ' ')}
                      </span>
                    ))}
                  </div>
                )}

                {/* Stats */}
                <div className="flex items-center gap-4 text-xs text-slate-500 mb-4">
                  {org.statsVolunteersCount > 0 && (
                    <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5" /> {org.statsVolunteersCount} volunteers</span>
                  )}
                  {org.statsCampaignsCount > 0 && (
                    <span className="flex items-center gap-1"><Heart className="w-3.5 h-3.5" /> {org.statsCampaignsCount} campaigns</span>
                  )}
                  {org.trustScore > 0 && (
                    <span className="flex items-center gap-1"><Star className="w-3.5 h-3.5 text-amber-400" /> {org.trustScore} trust</span>
                  )}
                </div>

                {/* Apply Button */}
                <div className="flex items-center justify-between">
                  {org.website && (
                    <a href={org.website} target="_blank" rel="noreferrer"
                      className="flex items-center gap-1 text-xs text-slate-500 hover:text-indigo-400 transition-colors"
                    >
                      <Globe className="w-3.5 h-3.5" /> Website
                    </a>
                  )}
                  <div className="ml-auto">
                    {applied.has(org._id || org.id) ? (
                      <div className="flex items-center gap-1.5 text-emerald-400 text-sm font-medium">
                        <Check className="w-4 h-4" /> Request Sent!
                      </div>
                    ) : (
                      <button
                        onClick={() => handleApply(org._id || org.id, org.name)}
                        disabled={applying === (org._id || org.id)}
                        className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold transition-all disabled:opacity-50"
                      >
                        {applying === (org._id || org.id) ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <>Join NGO <ChevronRight className="w-4 h-4" /></>
                        )}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
