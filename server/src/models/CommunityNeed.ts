import mongoose, { Schema, Document } from 'mongoose';

export interface ICommunityNeedDocument extends Document {
  ngoId: mongoose.Types.ObjectId;
  title: string;
  description: string;
  category: string;
  urgencyLevel: 'critical' | 'high' | 'medium' | 'low';
  priorityScore: number;
  status: 'reported' | 'verified' | 'in_progress' | 'resolved';
  location: string;
  coordinates: [number, number];
  region: string;
  affectedPopulation?: number;
  rawSource?: string;
  sourceType: 'manual' | 'survey_upload' | 'field_report';
  images: string[];
  reportedAt: Date;
  resolvedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const communityNeedSchema = new Schema<ICommunityNeedDocument>(
  {
    ngoId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      maxlength: 200,
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      maxlength: 2000,
    },
    category: {
      type: String,
      enum: [
        'education', 'healthcare', 'sanitation', 'infrastructure',
        'food_security', 'water', 'employment', 'safety',
        'environment', 'other',
      ],
      required: true,
    },
    urgencyLevel: {
      type: String,
      enum: ['critical', 'high', 'medium', 'low'],
      default: 'medium',
    },
    priorityScore: {
      type: Number,
      min: 0,
      max: 100,
      default: 50,
    },
    status: {
      type: String,
      enum: ['reported', 'verified', 'in_progress', 'resolved'],
      default: 'reported',
    },
    location: {
      type: String,
      required: [true, 'Location is required'],
    },
    coordinates: {
      type: [Number],
      required: true,
    },
    region: {
      type: String,
      required: true,
    },
    affectedPopulation: { type: Number },
    rawSource: { type: String },
    sourceType: {
      type: String,
      enum: ['manual', 'survey_upload', 'field_report'],
      default: 'manual',
    },
    images: { type: [String], default: [] },
    reportedAt: { type: Date, default: Date.now },
    resolvedAt: { type: Date },
  },
  { timestamps: true }
);

// Indexes for efficient querying
communityNeedSchema.index({ coordinates: '2dsphere' });
communityNeedSchema.index({ category: 1, urgencyLevel: 1 });
communityNeedSchema.index({ region: 1, status: 1 });
communityNeedSchema.index({ priorityScore: -1 });

export const CommunityNeed = mongoose.model<ICommunityNeedDocument>(
  'CommunityNeed',
  communityNeedSchema
);
