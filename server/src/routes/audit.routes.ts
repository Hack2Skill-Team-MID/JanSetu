import { Router, Response } from 'express';
import { AuthRequest, protect, authorize } from '../middleware/auth';
import AuditLog from '../models/AuditLog';

const router = Router();

// GET /api/audit — Paginated audit log (platform_admin only)
router.get(
  '/',
  protect,
  authorize('platform_admin', 'admin', 'ngo_admin'),
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 50;
      const { action, entity, actorId, startDate, endDate } = req.query;

      const filter: any = {};
      if (action) filter.action = action;
      if (entity) filter.entity = entity;
      if (actorId) filter.actorId = actorId;
      if (startDate || endDate) {
        filter.timestamp = {};
        if (startDate) filter.timestamp.$gte = new Date(startDate as string);
        if (endDate) filter.timestamp.$lte = new Date(endDate as string);
      }

      // Scope to org for non-platform admins
      if (String(req.user!.role) !== 'platform_admin' && String(req.user!.role) !== 'admin') {
        filter.organizationId = req.user!.organizationId;
      }

      const logs = await AuditLog.find(filter)
        .sort({ timestamp: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean();

      const total = await AuditLog.countDocuments(filter);

      res.json({
        success: true,
        data: {
          logs,
          total,
          page,
          pages: Math.ceil(total / limit),
        },
      });
    } catch (error: any) {
      console.error('❌ Audit log fetch error:', error.message);
      res.status(500).json({ success: false, error: 'Failed to fetch audit logs' });
    }
  }
);

// GET /api/audit/entity/:type/:id — Logs for a specific entity
router.get(
  '/entity/:type/:id',
  protect,
  authorize('platform_admin', 'admin', 'ngo_admin'),
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const logs = await AuditLog.find({
        entity: req.params.type,
        entityId: req.params.id,
      })
        .sort({ timestamp: -1 })
        .limit(100)
        .lean();

      res.json({ success: true, data: logs });
    } catch (error: any) {
      console.error('❌ Audit entity fetch error:', error.message);
      res.status(500).json({ success: false, error: 'Failed to fetch entity audit logs' });
    }
  }
);

// GET /api/audit/user/:userId — All actions by a user
router.get(
  '/user/:userId',
  protect,
  authorize('platform_admin', 'admin', 'ngo_admin'),
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const logs = await AuditLog.find({ actorId: req.params.userId })
        .sort({ timestamp: -1 })
        .limit(100)
        .lean();

      res.json({ success: true, data: logs });
    } catch (error: any) {
      console.error('❌ Audit user fetch error:', error.message);
      res.status(500).json({ success: false, error: 'Failed to fetch user audit logs' });
    }
  }
);

// GET /api/audit/stats — Audit statistics
router.get(
  '/stats',
  protect,
  authorize('platform_admin', 'admin', 'ngo_admin'),
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const totalLogs = await AuditLog.countDocuments();
      const todayLogs = await AuditLog.countDocuments({
        timestamp: { $gte: new Date(new Date().setHours(0, 0, 0, 0)) },
      });

      const actionBreakdown = await AuditLog.aggregate([
        { $group: { _id: '$action', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ]);

      const entityBreakdown = await AuditLog.aggregate([
        { $group: { _id: '$entity', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ]);

      const recentActors = await AuditLog.aggregate([
        { $sort: { timestamp: -1 } },
        { $limit: 200 },
        { $group: { _id: '$actorName', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 10 },
      ]);

      res.json({
        success: true,
        data: { totalLogs, todayLogs, actionBreakdown, entityBreakdown, recentActors },
      });
    } catch (error: any) {
      console.error('❌ Audit stats error:', error.message);
      res.status(500).json({ success: false, error: 'Failed to fetch audit stats' });
    }
  }
);

export default router;
