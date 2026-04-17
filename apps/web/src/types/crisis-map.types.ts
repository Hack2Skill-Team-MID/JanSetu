export type CrisisCategory = 'health' | 'food' | 'disaster' | 'education' | 'water' | 'safety' | 'other';
export type UrgencyLevel = 'critical' | 'high' | 'medium' | 'low';

export interface CrisisNGO {
  _id: string;
  name: string;
  email?: string;
}

export interface Crisis {
  _id: string;
  title: string;
  description: string;
  category: CrisisCategory | string;
  urgencyLevel: UrgencyLevel;
  priorityScore: number;
  status: string;
  location: string;
  region: string;
  coordinates: [number, number]; // [lng, lat]
  affectedPopulation?: number;
  ngoId?: CrisisNGO | string;
  aiInsights?: string;
  reportedAt?: string;
  createdAt?: string;
}

export interface CityRegion {
  name: string;
  coordinates: [number, number]; // [lat, lng] for map centering
}

export interface City {
  name: string;
  coordinates: [number, number]; // [lat, lng]
  zoom: number;
  regions: CityRegion[];
}

export interface CrisisFilters {
  urgency: string;
  category: string;
  ngoId: string;
}

export const CITIES: City[] = [
  {
    name: 'Delhi NCR',
    coordinates: [28.7041, 77.1025],
    zoom: 11,
    regions: [
      { name: 'Old Delhi', coordinates: [28.6562, 77.2310] },
      { name: 'Noida', coordinates: [28.5355, 77.3910] },
      { name: 'Gurgaon', coordinates: [28.4595, 77.0266] },
      { name: 'Faridabad', coordinates: [28.4089, 77.3178] },
    ],
  },
  {
    name: 'Mumbai',
    coordinates: [19.0760, 72.8777],
    zoom: 12,
    regions: [
      { name: 'Dharavi', coordinates: [19.0444, 72.8540] },
      { name: 'Andheri', coordinates: [19.1136, 72.8697] },
      { name: 'Bandra', coordinates: [19.0596, 72.8295] },
      { name: 'Kurla', coordinates: [19.0728, 72.8826] },
    ],
  },
  {
    name: 'Bangalore',
    coordinates: [12.9716, 77.5946],
    zoom: 11,
    regions: [
      { name: 'Whitefield', coordinates: [12.9698, 77.7499] },
      { name: 'Koramangala', coordinates: [12.9279, 77.6271] },
      { name: 'Indiranagar', coordinates: [12.9784, 77.6408] },
    ],
  },
  {
    name: 'Chennai',
    coordinates: [13.0827, 80.2707],
    zoom: 11,
    regions: [
      { name: 'Tambaram', coordinates: [12.9249, 80.1000] },
      { name: 'Velachery', coordinates: [12.9815, 80.2180] },
      { name: 'Anna Nagar', coordinates: [13.0850, 80.2101] },
    ],
  },
  {
    name: 'Kolkata',
    coordinates: [22.5726, 88.3639],
    zoom: 11,
    regions: [
      { name: 'Salt Lake', coordinates: [22.5829, 88.4136] },
      { name: 'Howrah', coordinates: [22.5958, 88.2636] },
    ],
  },
  {
    name: 'Hyderabad',
    coordinates: [17.3850, 78.4867],
    zoom: 11,
    regions: [
      { name: 'Secunderabad', coordinates: [17.4399, 78.4983] },
      { name: 'Hitech City', coordinates: [17.4435, 78.3772] },
    ],
  },
];

export const CATEGORY_COLORS: Record<string, string> = {
  health:    '#ef4444', // red
  food:      '#f97316', // orange
  disaster:  '#eab308', // yellow
  education: '#3b82f6', // blue
  water:     '#06b6d4', // cyan
  safety:    '#a855f7', // purple
  other:     '#6b7280', // gray
};

export const URGENCY_COLORS: Record<string, string> = {
  critical: '#ef4444',
  high:     '#f97316',
  medium:   '#eab308',
  low:      '#22c55e',
};
