// ============================================
// Need Categories — Used across all services
// ============================================

export const NEED_CATEGORIES = [
  { value: 'education', label: 'Education', icon: '📚', color: '#3B82F6' },
  { value: 'healthcare', label: 'Healthcare', icon: '🏥', color: '#EF4444' },
  { value: 'sanitation', label: 'Sanitation', icon: '🚿', color: '#8B5CF6' },
  { value: 'infrastructure', label: 'Infrastructure', icon: '🏗️', color: '#F59E0B' },
  { value: 'food_security', label: 'Food Security', icon: '🍚', color: '#10B981' },
  { value: 'water', label: 'Water', icon: '💧', color: '#06B6D4' },
  { value: 'employment', label: 'Employment', icon: '💼', color: '#EC4899' },
  { value: 'safety', label: 'Safety', icon: '🛡️', color: '#F97316' },
  { value: 'environment', label: 'Environment', icon: '🌿', color: '#22C55E' },
  { value: 'other', label: 'Other', icon: '📋', color: '#6B7280' },
] as const;

export const URGENCY_LEVELS = [
  { value: 'critical', label: 'Critical', color: '#DC2626', weight: 4 },
  { value: 'high', label: 'High', color: '#F59E0B', weight: 3 },
  { value: 'medium', label: 'Medium', color: '#3B82F6', weight: 2 },
  { value: 'low', label: 'Low', color: '#10B981', weight: 1 },
] as const;

export const VOLUNTEER_SKILLS = [
  'Teaching', 'Medical', 'Engineering', 'Construction',
  'Cooking', 'Driving', 'Translation', 'Counseling',
  'IT Support', 'Legal Aid', 'Childcare', 'Elder Care',
  'First Aid', 'Agriculture', 'Plumbing', 'Electrical',
  'Photography', 'Social Media', 'Fundraising', 'Event Management',
] as const;
