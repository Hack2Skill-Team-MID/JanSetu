import mongoose, { Schema, Document } from 'mongoose';

export interface IVolunteerProfileDocument extends Document {
  userId: mongoose.Types.ObjectId;
  skills: string[];
  location: string;
  coordinates: [number, number];
  availability: 'full-time' | 'part-time' | 'weekends' | 'evenings';
  bio?: string;
  impactScore: number;
  tasksCompleted: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const volunteerProfileSchema = new Schema<IVolunteerProfileDocument>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    skills: {
      type: [String],
      default: [],
    },
    location: {
      type: String,
      default: '',
    },
    coordinates: {
      type: [Number],
      default: [0, 0],
    },
    availability: {
      type: String,
      enum: ['full-time', 'part-time', 'weekends', 'evenings'],
      default: 'weekends',
    },
    bio: { type: String, maxlength: 500 },
    impactScore: { type: Number, default: 0 },
    tasksCompleted: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// Geospatial index for location-based queries
volunteerProfileSchema.index({ coordinates: '2dsphere' });

export const VolunteerProfile = mongoose.model<IVolunteerProfileDocument>(
  'VolunteerProfile',
  volunteerProfileSchema
);
