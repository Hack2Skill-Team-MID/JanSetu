import { Request } from 'express';
import AuditLog from '../models/AuditLog';
import { AuthRequest } from './auth';

/**
 * Create an audit log entry.
 * Call this utility from any route handler after a significant action.
 */
export async function createAuditEntry(options: {
  action: string;
  entity: string;
  entityId?: string;
  description: string;
  before?: Record<string, any>;
  after?: Record<string, any>;
  req: AuthRequest;
}) {
  try {
    const { action, entity, entityId, description, before, after, req } = options;

    await AuditLog.create({
      action,
      entity,
      entityId: entityId || undefined,
      actorId: req.user?._id,
      actorName: req.user?.name || 'Unknown',
      organizationId: req.user?.organizationId || undefined,
      description,
      before: before || undefined,
      after: after || undefined,
      ip: req.ip || req.headers['x-forwarded-for'] || 'unknown',
      userAgent: req.headers['user-agent'] || 'unknown',
    });
  } catch (error) {
    // Audit logging should never crash the request
    console.error('⚠️ Audit log creation failed:', error);
  }
}
