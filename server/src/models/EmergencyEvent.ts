import mongoose, { Schema, Document } from 'mongoose';

export interface IEmergencyEvent extends Document {
  organizationId: mongoose.Types.ObjectId;
  declarationType: 'flood' | 'earthquake' | 'pandemic' | 'fire' | 'cyclone' | 'drought' | 'custom';
  customTypeName?: string;
  title: string;
  description: string;
  severity: 'level_1' | 'level_2' | 'level_3'; // escalating severity

  // Affected area
  affectedArea: {
    name: string;
    coordinates: [number, number];
    radiusKm: number;
  };

  // Status
  status: 'active' | 'resolved' | 'expired';

  // Who activated
  activatedBy: mongoose.Types.ObjectId;
  activatedAt: Date;
  resolvedBy?: mongoose.Types.ObjectId;
  resolvedAt?: Date;
  resolutionNotes?: string;

  // Auto-actions taken on activation
  autoActions: {
    broadcastSent: boolean;
    tasksCreated: number;
    resourcesLocked: number;
    needsCreated: number;
  };

  // Impact summary (can be AI-generated later)
  impactSummary?: string;
  estimatedAffectedPeople?: number;

  createdAt: Date;
  updatedAt: Date;
}

const EmergencyEventSchema = new Schema<IEmergencyEvent>(
  {
    organizationId: { type: Schema.Types.ObjectId, ref: 'Organization', required: true },
    declarationType: {
      type: String,
      enum: ['flood', 'earthquake', 'pandemic', 'fire', 'cyclone', 'drought', 'custom'],
      required: true,
    },
    customTypeName: { type: String },
    title: { type: String, required: true, trim: true, maxlength: 200 },
    description: { type: String, required: true, maxlength: 3000 },
    severity: {
      type: String,
      enum: ['level_1', 'level_2', 'level_3'],
      default: 'level_1',
    },

    affectedArea: {
      name: { type: String, required: true },
      coordinates: { type: [Number], default: [0, 0] },
      radiusKm: { type: Number, default: 10 },
    },

    status: {
      type: String,
      enum: ['active', 'resolved', 'expired'],
      default: 'active',
    },

    activatedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    activatedAt: { type: Date, default: Date.now },
    resolvedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    resolvedAt: { type: Date },
    resolutionNotes: { type: String },

    autoActions: {
      broadcastSent: { type: Boolean, default: false },
      tasksCreated: { type: Number, default: 0 },
      resourcesLocked: { type: Number, default: 0 },
      needsCreated: { type: Number, default: 0 },
    },

    impactSummary: { type: String },
    estimatedAffectedPeople: { type: Number },
  },
  { timestamps: true }
);

EmergencyEventSchema.index({ organizationId: 1, status: 1 });
EmergencyEventSchema.index({ status: 1, activatedAt: -1 });
EmergencyEventSchema.index({ 'affectedArea.coordinates': '2dsphere' });

export default mongoose.model<IEmergencyEvent>('EmergencyEvent', EmergencyEventSchema);
