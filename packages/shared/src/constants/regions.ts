// ============================================
// Supported Regions
// ============================================

export const SUPPORTED_REGIONS = [
  { value: 'delhi', label: 'Delhi NCR', coordinates: [77.1025, 28.7041] as [number, number] },
  { value: 'mumbai', label: 'Mumbai', coordinates: [72.8777, 19.0760] as [number, number] },
  { value: 'bangalore', label: 'Bangalore', coordinates: [77.5946, 12.9716] as [number, number] },
  { value: 'chennai', label: 'Chennai', coordinates: [80.2707, 13.0827] as [number, number] },
  { value: 'kolkata', label: 'Kolkata', coordinates: [88.3639, 22.5726] as [number, number] },
  { value: 'hyderabad', label: 'Hyderabad', coordinates: [78.4867, 17.3850] as [number, number] },
  { value: 'pune', label: 'Pune', coordinates: [73.8567, 18.5204] as [number, number] },
  { value: 'ahmedabad', label: 'Ahmedabad', coordinates: [72.5714, 23.0225] as [number, number] },
  { value: 'jaipur', label: 'Jaipur', coordinates: [75.7873, 26.9124] as [number, number] },
  { value: 'lucknow', label: 'Lucknow', coordinates: [80.9462, 26.8467] as [number, number] },
] as const;

export const DEFAULT_MAP_CENTER: [number, number] = [78.9629, 20.5937]; // India center
export const DEFAULT_MAP_ZOOM = 5;
