import mongoose, { Schema, Document } from 'mongoose';

export interface ICampaign extends Document {
  organizationId: mongoose.Types.ObjectId;
  createdBy: mongoose.Types.ObjectId;
  
  // Core
  title: string;
  description: string;
  category: string;
  tags: string[];
  coverImage?: string;
  
  // Visibility
  visibility: 'private' | 'public';
  featured: boolean;
  
  // Timeline
  startDate: Date;
  endDate: Date;
  status: 'draft' | 'active' | 'paused' | 'completed' | 'cancelled';
  
  // Location
  location: string;
  region: string;
  coordinates: [number, number];
  
  // Goals
  goals: {
    volunteersNeeded: number;
    volunteersJoined: number;
    fundingGoal: number;
    fundingRaised: number;
    peopleToHelp: number;
    peopleHelped: number;
  };
  
  // Milestones
  milestones: {
    title: string;
    description: string;
    targetDate: Date;
    completed: boolean;
    completedAt?: Date;
  }[];
  
  // Impact
  impactSummary?: string; // AI-generated
  
  // Related
  taskIds: mongoose.Types.ObjectId[];
  needIds: mongoose.Types.ObjectId[];
}

const CampaignSchema = new Schema<ICampaign>(
  {
    organizationId: { type: Schema.Types.ObjectId, ref: 'Organization', required: true },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },

    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    category: { type: String, required: true },
    tags: [{ type: String }],
    coverImage: String,

    visibility: { type: String, enum: ['private', 'public'], default: 'private' },
    featured: { type: Boolean, default: false },

    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    status: {
      type: String,
      enum: ['draft', 'active', 'paused', 'completed', 'cancelled'],
      default: 'draft',
    },

    location: { type: String, required: true },
    region: String,
    coordinates: { type: [Number], default: [0, 0] },

    goals: {
      volunteersNeeded: { type: Number, default: 0 },
      volunteersJoined: { type: Number, default: 0 },
      fundingGoal: { type: Number, default: 0 },
      fundingRaised: { type: Number, default: 0 },
      peopleToHelp: { type: Number, default: 0 },
      peopleHelped: { type: Number, default: 0 },
    },

    milestones: [
      {
        title: { type: String, required: true },
        description: String,
        targetDate: Date,
        completed: { type: Boolean, default: false },
        completedAt: Date,
      },
    ],

    impactSummary: String,

    taskIds: [{ type: Schema.Types.ObjectId, ref: 'Task' }],
    needIds: [{ type: Schema.Types.ObjectId, ref: 'CommunityNeed' }],
  },
  { timestamps: true }
);

CampaignSchema.index({ organizationId: 1, status: 1 });
CampaignSchema.index({ visibility: 1, status: 1 });
CampaignSchema.index({ category: 1 });
CampaignSchema.index({ region: 1 });
CampaignSchema.index({ coordinates: '2dsphere' });

export default mongoose.model<ICampaign>('Campaign', CampaignSchema);
