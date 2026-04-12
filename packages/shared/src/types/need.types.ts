// ============================================
// Community Need Types
// ============================================

export type NeedCategory =
  | 'education'
  | 'healthcare'
  | 'sanitation'
  | 'infrastructure'
  | 'food_security'
  | 'water'
  | 'employment'
  | 'safety'
  | 'environment'
  | 'other';

export type NeedStatus = 'reported' | 'verified' | 'in_progress' | 'resolved';
export type UrgencyLevel = 'critical' | 'high' | 'medium' | 'low';

export interface ICommunityNeed {
  _id: string;
  ngoId: string;
  title: string;
  description: string;
  category: NeedCategory;
  urgencyLevel: UrgencyLevel;
  priorityScore: number; // 0-100, calculated by AI
  status: NeedStatus;
  location: string;
  coordinates: [number, number];
  region: string;
  affectedPopulation?: number;
  rawSource?: string; // original unprocessed text
  sourceType: 'manual' | 'survey_upload' | 'field_report';
  images?: string[];
  reportedAt: string;
  resolvedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ISurveyUpload {
  _id: string;
  ngoId: string;
  fileUrl: string;
  fileType: 'image' | 'pdf' | 'text' | 'csv';
  originalFileName: string;
  processedData?: {
    extractedNeeds: Partial<ICommunityNeed>[];
    summary: string;
    confidence: number;
  };
  status: 'pending' | 'processing' | 'completed' | 'failed';
  errorMessage?: string;
  uploadedAt: string;
}
