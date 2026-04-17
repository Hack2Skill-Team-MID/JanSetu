import { api } from './api';

export interface SearchResult {
  id: string;
  type: 'campaign' | 'need' | 'ngo' | 'volunteer';
  title: string;
  description: string;
  location?: string;
  href: string;
}

// Parallel search across all entities
export async function globalSearch(query: string): Promise<SearchResult[]> {
  if (!query || query.trim().length < 2) return [];

  const q = query.trim();

  try {
    const [campaigns, needs, ngos] = await Promise.allSettled([
      api.get(`/campaigns?search=${encodeURIComponent(q)}&limit=5`),
      api.get(`/needs?search=${encodeURIComponent(q)}&limit=5`),
      api.get(`/network?search=${encodeURIComponent(q)}`),
    ]);

    const results: SearchResult[] = [];

    if (campaigns.status === 'fulfilled' && campaigns.value.data.success) {
      const data = campaigns.value.data.data?.campaigns || campaigns.value.data.data || [];
      data.slice(0, 5).forEach((c: any) =>
        results.push({
          id: c.id || c._id,
          type: 'campaign',
          title: c.title,
          description: c.description?.slice(0, 100) || '',
          location: c.location,
          href: '/dashboard/campaigns',
        })
      );
    }

    if (needs.status === 'fulfilled' && needs.value.data.success) {
      const data = needs.value.data.data?.needs || needs.value.data.data || [];
      data.slice(0, 5).forEach((n: any) =>
        results.push({
          id: n.id || n._id,
          type: 'need',
          title: n.title,
          description: n.description?.slice(0, 100) || '',
          location: n.location,
          href: '/dashboard/needs',
        })
      );
    }

    if (ngos.status === 'fulfilled' && ngos.value.data.success) {
      const data = ngos.value.data.data?.organizations || [];
      data.slice(0, 5).forEach((n: any) =>
        results.push({
          id: n.id || n._id,
          type: 'ngo',
          title: n.name,
          description: n.description?.slice(0, 100) || '',
          location: n.location || n.region,
          href: '/dashboard/network',
        })
      );
    }

    return results;
  } catch {
    return [];
  }
}
