// ============================================
// Task Types
// ============================================

export type TaskStatus = 'open' | 'in_progress' | 'completed' | 'cancelled';

export interface ITask {
  _id: string;
  needId: string;
  createdBy: string; // NGO coordinator userId
  title: string;
  description: string;
  requiredSkills: string[];
  location: string;
  coordinates: [number, number];
  deadline: string;
  volunteersNeeded: number;
  volunteersAssigned: number;
  status: TaskStatus;
  applications: ITaskApplication[];
  createdAt: string;
  updatedAt: string;
}

export interface ITaskApplication {
  _id: string;
  taskId: string;
  volunteerId: string;
  volunteerName: string;
  matchScore: number; // 0-100, from AI
  matchReasons: string[];
  status: 'pending' | 'accepted' | 'rejected' | 'withdrawn';
  appliedAt: string;
}

export interface IVolunteerMatch {
  volunteerId: string;
  volunteerName: string;
  skills: string[];
  location: string;
  matchScore: number;
  matchReasons: string[];
  availability: string;
}
