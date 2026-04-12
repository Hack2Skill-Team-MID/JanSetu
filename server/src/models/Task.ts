import mongoose, { Schema, Document } from 'mongoose';

export interface ITaskApplicationSubDoc {
  volunteerId: mongoose.Types.ObjectId;
  volunteerName: string;
  matchScore: number;
  matchReasons: string[];
  status: 'pending' | 'accepted' | 'rejected' | 'withdrawn';
  appliedAt: Date;
}

export interface ITaskDocument extends Document {
  needId: mongoose.Types.ObjectId;
  createdBy: mongoose.Types.ObjectId;
  title: string;
  description: string;
  requiredSkills: string[];
  location: string;
  coordinates: [number, number];
  deadline: Date;
  volunteersNeeded: number;
  volunteersAssigned: number;
  status: 'open' | 'in_progress' | 'completed' | 'cancelled';
  applications: ITaskApplicationSubDoc[];
  createdAt: Date;
  updatedAt: Date;
}

const taskApplicationSchema = new Schema<ITaskApplicationSubDoc>(
  {
    volunteerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    volunteerName: { type: String, required: true },
    matchScore: { type: Number, default: 0 },
    matchReasons: { type: [String], default: [] },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'rejected', 'withdrawn'],
      default: 'pending',
    },
    appliedAt: { type: Date, default: Date.now },
  },
  { _id: true }
);

const taskSchema = new Schema<ITaskDocument>(
  {
    needId: {
      type: Schema.Types.ObjectId,
      ref: 'CommunityNeed',
      required: true,
    },
    createdBy: {
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
    requiredSkills: { type: [String], default: [] },
    location: { type: String, required: true },
    coordinates: { type: [Number], required: true },
    deadline: { type: Date, required: true },
    volunteersNeeded: { type: Number, default: 1, min: 1 },
    volunteersAssigned: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ['open', 'in_progress', 'completed', 'cancelled'],
      default: 'open',
    },
    applications: { type: [taskApplicationSchema], default: [] },
  },
  { timestamps: true }
);

taskSchema.index({ status: 1, deadline: 1 });
taskSchema.index({ coordinates: '2dsphere' });

export const Task = mongoose.model<ITaskDocument>('Task', taskSchema);
