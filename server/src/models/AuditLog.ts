import mongoose, { Schema, Document } from 'mongoose';

export interface IAuditLog extends Document {
  action: 'create' | 'update' | 'delete' | 'login' | 'escalate' | 'emergency_activate' | 'emergency_resolve' | 'fraud_flag' | 'donation';
  entity: 'user' | 'campaign' | 'donation' | 'resource' | 'need' | 'task' | 'organization' | 'emergency' | 'fraud_case' | 'message';
  entityId?: mongoose.Types.ObjectId;
  actorId: mongoose.Types.ObjectId;
  actorName: string;
  organizationId?: mongoose.Types.ObjectId;
  description: string;
  before?: Record<string, any>;
  after?: Record<string, any>;
  ip?: string;
  userAgent?: string;
  timestamp: Date;
}

const AuditLogSchema = new Schema<IAuditLog>(
  {
    action: {
      type: String,
      enum: ['create', 'update', 'delete', 'login', 'escalate', 'emergency_activate', 'emergency_resolve', 'fraud_flag', 'donation'],
      required: true,
    },
    entity: {
      type: String,
      enum: ['user', 'campaign', 'donation', 'resource', 'need', 'task', 'organization', 'emergency', 'fraud_case', 'message'],
      required: true,
    },
    entityId: { type: Schema.Types.ObjectId },
    actorId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    actorName: { type: String, required: true },
    organizationId: { type: Schema.Types.ObjectId, ref: 'Organization' },
    description: { type: String, required: true },
    before: { type: Schema.Types.Mixed },
    after: { type: Schema.Types.Mixed },
    ip: { type: String },
    userAgent: { type: String },
    timestamp: { type: Date, default: Date.now },
  },
  { timestamps: false }
);

AuditLogSchema.index({ timestamp: -1 });
AuditLogSchema.index({ actorId: 1, timestamp: -1 });
AuditLogSchema.index({ entity: 1, entityId: 1 });
AuditLogSchema.index({ organizationId: 1, timestamp: -1 });
AuditLogSchema.index({ action: 1 });

export default mongoose.model<IAuditLog>('AuditLog', AuditLogSchema);
