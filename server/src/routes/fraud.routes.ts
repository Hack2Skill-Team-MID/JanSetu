// @ts-nocheck
import { Router, Response } from 'express';
import { AuthRequest, protect, authorize } from '../middleware/auth';
import prisma from '../config/db';
import { createAuditEntry } from '../middleware/audit';

const router = Router();

// Helper: Generate case number
async function generateCaseNumber(): Promise<string> {
  const year = new Date().getFullYear();
  const count = await prisma.fraudCase.count();
  return `FRAUD-${year}-${String(count + 1).padStart(4, '0')}`;
}

// GET /api/fraud/cases
router.get(
  '/cases',
  protect,
  authorize('platform_admin', 'admin', 'ngo_admin'),
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const { status, severity, entityType } = req.query;

      const where: any = {};
      if (status) where.status = status;
      if (severity) where.severity = severity;
      if (entityType) where.entityType = entityType;

      const [cases, total] = await Promise.all([
        prisma.fraudCase.findMany({
          where,
          include: {
            reportedBy: { select: { id: true, name: true, email: true } },
            assignedTo: { select: { id: true, name: true, email: true } },
            notes: true,
          },
          orderBy: { createdAt: 'desc' },
          skip: (page - 1) * limit,
          take: limit,
        }),
        prisma.fraudCase.count({ where }),
      ]);

      res.json({
        success: true,
        data: { cases: cases.map((c: any) => ({ ...c, _id: c.id })), total, page, pages: Math.ceil(total / limit) },
      });
    } catch (error: any) {
      res.status(500).json({ success: false, error: 'Failed to fetch fraud cases' });
    }
  }
);

// POST /api/fraud/cases
router.post(
  '/cases',
  protect,
  authorize('platform_admin', 'admin', 'ngo_admin'),
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { source, entityType, entityId, entityTitle, severity, aiAnalysis, initialNote } = req.body;

      if (!entityType || !entityId || !entityTitle) {
        res.status(400).json({ success: false, error: 'entityType, entityId, and entityTitle are required' });
        return;
      }

      const caseNumber = await generateCaseNumber();

      const fraudCase = await prisma.fraudCase.create({
        data: {
          caseNumber,
          source: source || 'admin_manual',
          entityType,
          entityId,
          entityTitle,
          reportedById: req.user!.id,
          organizationId: req.user!.organizationId,
          severity: severity || 'medium',
          aiAnalysis: aiAnalysis || undefined,
          notes: initialNote ? {
            create: {
              authorId: req.user!.id,
              authorName: req.user!.name,
              content: initialNote,
            },
          } : undefined,
        },
        include: { notes: true },
      });

      await createAuditEntry({
        action: 'fraud_flag',
        entity: 'fraud_case',
        entityId: fraudCase.id,
        description: `Fraud case ${caseNumber} created for ${entityType}: ${entityTitle}`,
        req,
      });

      res.status(201).json({ success: true, data: { ...fraudCase, _id: fraudCase.id } });
    } catch (error: any) {
      res.status(500).json({ success: false, error: 'Failed to create fraud case' });
    }
  }
);

// GET /api/fraud/cases/:id
router.get(
  '/cases/:id',
  protect,
  authorize('platform_admin', 'admin', 'ngo_admin'),
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const fraudCase = await prisma.fraudCase.findUnique({
        where: { id: req.params.id },
        include: {
          reportedBy: { select: { id: true, name: true, email: true, role: true } },
          assignedTo: { select: { id: true, name: true, email: true, role: true } },
          notes: true,
        },
      });
      if (!fraudCase) { res.status(404).json({ success: false, error: 'Fraud case not found' }); return; }
      res.json({ success: true, data: { ...fraudCase, _id: fraudCase.id } });
    } catch (error: any) {
      res.status(500).json({ success: false, error: 'Failed to fetch fraud case' });
    }
  }
);

// PATCH /api/fraud/cases/:id/assign
router.patch(
  '/cases/:id/assign',
  protect,
  authorize('platform_admin', 'admin'),
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const fraudCase = await prisma.fraudCase.update({
        where: { id: req.params.id },
        data: { assignedToId: req.body.assignedTo, status: 'investigating' },
      });
      res.json({ success: true, data: { ...fraudCase, _id: fraudCase.id } });
    } catch (error: any) {
      if ((error as any).code === 'P2025') { res.status(404).json({ success: false, error: 'Case not found' }); return; }
      res.status(500).json({ success: false, error: 'Failed to assign case' });
    }
  }
);

// PATCH /api/fraud/cases/:id/status
router.patch(
  '/cases/:id/status',
  protect,
  authorize('platform_admin', 'admin', 'ngo_admin'),
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { status, severity } = req.body;
      const data: any = {};
      if (status) data.status = status;
      if (severity) data.severity = severity;

      const fraudCase = await prisma.fraudCase.update({ where: { id: req.params.id }, data });
      res.json({ success: true, data: { ...fraudCase, _id: fraudCase.id } });
    } catch (error: any) {
      if ((error as any).code === 'P2025') { res.status(404).json({ success: false, error: 'Case not found' }); return; }
      res.status(500).json({ success: false, error: 'Failed to update case' });
    }
  }
);

// POST /api/fraud/cases/:id/note
router.post(
  '/cases/:id/note',
  protect,
  authorize('platform_admin', 'admin', 'ngo_admin'),
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { content } = req.body;
      if (!content) { res.status(400).json({ success: false, error: 'Note content is required' }); return; }

      await prisma.fraudCaseNote.create({
        data: {
          fraudCaseId: req.params.id,
          authorId: req.user!.id,
          authorName: req.user!.name,
          content,
        },
      });

      const fraudCase = await prisma.fraudCase.findUnique({
        where: { id: req.params.id },
        include: { notes: true },
      });

      if (!fraudCase) { res.status(404).json({ success: false, error: 'Case not found' }); return; }
      res.json({ success: true, data: { ...fraudCase, _id: fraudCase.id } });
    } catch (error: any) {
      res.status(500).json({ success: false, error: 'Failed to add note' });
    }
  }
);

// PATCH /api/fraud/cases/:id/resolve
router.patch(
  '/cases/:id/resolve',
  protect,
  authorize('platform_admin', 'admin'),
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { action, details } = req.body;
      if (!action) { res.status(400).json({ success: false, error: 'Resolution action is required' }); return; }

      const fraudCase = await prisma.fraudCase.update({
        where: { id: req.params.id },
        data: {
          status: 'resolved',
          resolutionAction: action,
          resolutionDetails: details || '',
          resolutionById: req.user!.id,
          resolutionAt: new Date(),
        },
      });

      await createAuditEntry({
        action: 'escalate', entity: 'fraud_case', entityId: fraudCase.id,
        description: `Fraud case ${fraudCase.caseNumber} resolved: ${action}`, req,
      });

      res.json({ success: true, data: { ...fraudCase, _id: fraudCase.id }, message: 'Fraud case resolved' });
    } catch (error: any) {
      if ((error as any).code === 'P2025') { res.status(404).json({ success: false, error: 'Case not found' }); return; }
      res.status(500).json({ success: false, error: 'Failed to resolve case' });
    }
  }
);

// GET /api/fraud/stats
router.get(
  '/stats',
  protect,
  authorize('platform_admin', 'admin', 'ngo_admin'),
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const [total, open, investigating, confirmed, resolved, dismissed, critical] = await Promise.all([
        prisma.fraudCase.count(),
        prisma.fraudCase.count({ where: { status: 'open' } }),
        prisma.fraudCase.count({ where: { status: 'investigating' } }),
        prisma.fraudCase.count({ where: { status: 'confirmed_fraud' } }),
        prisma.fraudCase.count({ where: { status: 'resolved' } }),
        prisma.fraudCase.count({ where: { status: 'dismissed' } }),
        prisma.fraudCase.count({ where: { severity: 'critical', status: { notIn: ['resolved', 'dismissed'] } } }),
      ]);
      res.json({ success: true, data: { total, open, investigating, confirmed, resolved, dismissed, critical } });
    } catch (error: any) {
      res.status(500).json({ success: false, error: 'Failed to fetch fraud stats' });
    }
  }
);

export default router;

