import mongoose, { Schema, Document } from 'mongoose';

export interface IFraudCaseNote {
  author: mongoose.Types.ObjectId;
  authorName: string;
  content: string;
  timestamp: Date;
}

export interface IFraudCase extends Document {
  caseNumber: string;
  source: 'ai_detection' | 'community_flag' | 'admin_manual';
  entityType: 'campaign' | 'donation' | 'user' | 'organization';
  entityId: mongoose.Types.ObjectId;
  entityTitle: string;

  reportedBy?: mongoose.Types.ObjectId;
  assignedTo?: mongoose.Types.ObjectId;
  organizationId?: mongoose.Types.ObjectId;

  status: 'open' | 'investigating' | 'confirmed_fraud' | 'dismissed' | 'resolved';
  severity: 'low' | 'medium' | 'high' | 'critical';

  aiAnalysis?: {
    riskScore: number;
    flags: string[];
    recommendation: string;
  };

  notes: IFraudCaseNote[];

  resolution?: {
    action: 'suspend_user' | 'remove_campaign' | 'freeze_funds' | 'warn' | 'dismiss' | 'other';
    details: string;
    resolvedBy: mongoose.Types.ObjectId;
    timestamp: Date;
  };

  createdAt: Date;
  updatedAt: Date;
}

const FraudCaseNoteSchema = new Schema<IFraudCaseNote>(
  {
    author: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    authorName: { type: String, required: true },
    content: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
  },
  { _id: true }
);

const FraudCaseSchema = new Schema<IFraudCase>(
  {
    caseNumber: { type: String, required: true, unique: true },
    source: {
      type: String,
      enum: ['ai_detection', 'community_flag', 'admin_manual'],
      required: true,
    },
    entityType: {
      type: String,
      enum: ['campaign', 'donation', 'user', 'organization'],
      required: true,
    },
    entityId: { type: Schema.Types.ObjectId, required: true },
    entityTitle: { type: String, required: true },

    reportedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    assignedTo: { type: Schema.Types.ObjectId, ref: 'User' },
    organizationId: { type: Schema.Types.ObjectId, ref: 'Organization' },

    status: {
      type: String,
      enum: ['open', 'investigating', 'confirmed_fraud', 'dismissed', 'resolved'],
      default: 'open',
    },
    severity: {
      type: String,
      enum: ['low', 'medium', 'high', 'critical'],
      default: 'medium',
    },

    aiAnalysis: {
      riskScore: { type: Number },
      flags: [{ type: String }],
      recommendation: { type: String },
    },

    notes: [FraudCaseNoteSchema],

    resolution: {
      action: {
        type: String,
        enum: ['suspend_user', 'remove_campaign', 'freeze_funds', 'warn', 'dismiss', 'other'],
      },
      details: { type: String },
      resolvedBy: { type: Schema.Types.ObjectId, ref: 'User' },
      timestamp: { type: Date },
    },
  },
  { timestamps: true }
);

FraudCaseSchema.index({ status: 1, severity: -1 });
FraudCaseSchema.index({ caseNumber: 1 });
FraudCaseSchema.index({ entityType: 1, entityId: 1 });

export default mongoose.model<IFraudCase>('FraudCase', FraudCaseSchema);
