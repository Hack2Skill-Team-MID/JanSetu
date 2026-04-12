// ============================================
// API Request / Response Types
// ============================================
// These types define the CONTRACT between
// Frontend ↔ Backend ↔ AI Service
// ============================================

// === Auth ===
export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  role: 'volunteer' | 'ngo_coordinator';
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  user: {
    _id: string;
    name: string;
    email: string;
    role: string;
  };
}

// === API Response Wrapper ===
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// === Dashboard ===
export interface DashboardStats {
  totalNeeds: number;
  criticalNeeds: number;
  totalVolunteers: number;
  activeVolunteers: number;
  totalTasks: number;
  completedTasks: number;
  matchSuccessRate: number;
  avgResponseTime: number; // hours
}

export interface HeatmapDataPoint {
  coordinates: [number, number];
  intensity: number; // 0-1
  category: string;
  count: number;
}

// === AI Service Types ===
export interface AiProcessSurveyRequest {
  file_url: string;
  file_type: 'image' | 'pdf' | 'text';
}

export interface AiProcessSurveyResponse {
  needs: Array<{
    title: string;
    description: string;
    category: string;
    urgency: string;
    location: string;
  }>;
  summary: string;
  confidence: number;
}

export interface AiMatchVolunteersRequest {
  task: {
    title: string;
    description: string;
    required_skills: string[];
    location: string;
    coordinates: [number, number];
  };
  volunteers: Array<{
    id: string;
    name: string;
    skills: string[];
    location: string;
    coordinates: [number, number];
    availability: string;
  }>;
}

export interface AiMatchVolunteersResponse {
  matches: Array<{
    volunteer_id: string;
    score: number;
    reasons: string[];
  }>;
}

export interface AiPrioritizeNeedsRequest {
  needs: Array<{
    id: string;
    title: string;
    description: string;
    category: string;
    affected_population?: number;
    reported_at: string;
  }>;
}

export interface AiPrioritizeNeedsResponse {
  ranked_needs: Array<{
    need_id: string;
    priority_score: number;
    factors: string[];
  }>;
}
