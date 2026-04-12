// ============================================
// User Types — Shared across all services
// ============================================

export type UserRole = 'volunteer' | 'ngo_coordinator' | 'admin';

export interface IUser {
  _id: string;
  email: string;
  name: string;
  role: UserRole;
  avatar?: string;
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface IVolunteerProfile {
  _id: string;
  userId: string;
  skills: string[];
  location: string;
  coordinates: [number, number]; // [lng, lat]
  availability: 'full-time' | 'part-time' | 'weekends' | 'evenings';
  bio?: string;
  impactScore: number;
  tasksCompleted: number;
  isActive: boolean;
}

export interface INgoProfile {
  _id: string;
  userId: string;
  orgName: string;
  region: string;
  description: string;
  website?: string;
  contactPhone?: string;
  verificationStatus: 'pending' | 'verified' | 'rejected';
}
