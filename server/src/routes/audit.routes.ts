// @ts-nocheck
import { Router, Response } from 'express';
import { AuthRequest, protect, authorize } from '../middleware/auth';
import prisma from '../config/db';

const router = Router();

// GET /api/audit
router.get(
  '/',
  protect,
  authorize('platform_admin', 'admin', 'ngo_admin'),
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 50;
      const { action, entity, actorId, startDate, endDate } = req.query;

      const where: any = {};
      if (action) where.action = action;
      if (entity) where.entity = entity;
      if (actorId) where.actorId = actorId;
      if (startDate || endDate) {
        where.timestamp = {};
        if (startDate) where.timestamp.gte = new Date(startDate as string);
        if (endDate) where.timestamp.lte = new Date(endDate as string);
      }

      if (req.user!.role !== 'platform_admin' && req.user!.role !== 'admin') {
        where.organizationId = req.user!.organizationId;
      }

      const [logs, total] = await Promise.all([
        prisma.auditLog.findMany({
          where,
          orderBy: { timestamp: 'desc' },
          skip: (page - 1) * limit,
          take: limit,
        }),
        prisma.auditLog.count({ where }),
      ]);

      res.json({ success: true, data: { logs, total, page, pages: Math.ceil(total / limit) } });
    } catch (error: any) {
      res.status(500).json({ success: false, error: 'Failed to fetch audit logs' });
    }
  }
);

// GET /api/audit/entity/:type/:id
router.get(
  '/entity/:type/:id',
  protect,
  authorize('platform_admin', 'admin', 'ngo_admin'),
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const logs = await prisma.auditLog.findMany({
        where: { entity: req.params.type, entityId: req.params.id },
        orderBy: { timestamp: 'desc' },
        take: 100,
      });
      res.json({ success: true, data: logs });
    } catch (error: any) {
      res.status(500).json({ success: false, error: 'Failed to fetch entity audit logs' });
    }
  }
);

// GET /api/audit/user/:userId
router.get(
  '/user/:userId',
  protect,
  authorize('platform_admin', 'admin', 'ngo_admin'),
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const logs = await prisma.auditLog.findMany({
        where: { actorId: req.params.userId },
        orderBy: { timestamp: 'desc' },
        take: 100,
      });
      res.json({ success: true, data: logs });
    } catch (error: any) {
      res.status(500).json({ success: false, error: 'Failed to fetch user audit logs' });
    }
  }
);

// GET /api/audit/stats
router.get(
  '/stats',
  protect,
  authorize('platform_admin', 'admin', 'ngo_admin'),
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const totalLogs = await prisma.auditLog.count();
      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);
      const todayLogs = await prisma.auditLog.count({ where: { timestamp: { gte: todayStart } } });

      // Action breakdown
      const allLogs = await prisma.auditLog.findMany({ select: { action: true, entity: true, actorName: true, timestamp: true } });

      const actionMap: Record<string, number> = {};
      const entityMap: Record<string, number> = {};
      for (const l of allLogs) {
        actionMap[l.action] = (actionMap[l.action] || 0) + 1;
        entityMap[l.entity] = (entityMap[l.entity] || 0) + 1;
      }

      const actionBreakdown = Object.entries(actionMap).map(([_id, count]) => ({ _id, count })).sort((a, b) => b.count - a.count);
      const entityBreakdown = Object.entries(entityMap).map(([_id, count]) => ({ _id, count })).sort((a, b) => b.count - a.count);

      // Recent actors (from last 200 logs)
      const recentLogs = allLogs.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime()).slice(0, 200);
      const actorMap: Record<string, number> = {};
      for (const l of recentLogs) { actorMap[l.actorName] = (actorMap[l.actorName] || 0) + 1; }
      const recentActors = Object.entries(actorMap).map(([_id, count]) => ({ _id, count })).sort((a, b) => b.count - a.count).slice(0, 10);

      res.json({ success: true, data: { totalLogs, todayLogs, actionBreakdown, entityBreakdown, recentActors } });
    } catch (error: any) {
      res.status(500).json({ success: false, error: 'Failed to fetch audit stats' });
    }
  }
);

export default router;

