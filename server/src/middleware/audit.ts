import prisma from '../config/db';
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

    await prisma.auditLog.create({
      data: {
        action,
        entity,
        entityId: entityId || undefined,
        actorId: req.user!.id,
        actorName: req.user?.name || 'Unknown',
        organizationId: req.user?.organizationId || undefined,
        description,
        before: before || undefined,
        after: after || undefined,
        ip: (req.ip || req.headers['x-forwarded-for'] || 'unknown') as string,
        userAgent: req.headers['user-agent'] || 'unknown',
      },
    });
  } catch (error) {
    // Audit logging should never crash the request
    console.error('⚠️ Audit log creation failed:', error);
  }
}
