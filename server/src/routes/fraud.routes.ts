import { Router, Response } from 'express';
import { AuthRequest, protect, authorize } from '../middleware/auth';
import FraudCase from '../models/FraudCase';
import { createAuditEntry } from '../middleware/audit';

const router = Router();

// Helper: Generate case number
async function generateCaseNumber(): Promise<string> {
  const year = new Date().getFullYear();
  const count = await FraudCase.countDocuments();
  return `FRAUD-${year}-${String(count + 1).padStart(4, '0')}`;
}

// GET /api/fraud/cases — List all fraud cases
router.get(
  '/cases',
  protect,
  authorize('platform_admin', 'admin', 'ngo_admin'),
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const { status, severity, entityType } = req.query;

      const filter: any = {};
      if (status) filter.status = status;
      if (severity) filter.severity = severity;
      if (entityType) filter.entityType = entityType;

      const cases = await FraudCase.find(filter)
        .populate('reportedBy', 'name email')
        .populate('assignedTo', 'name email')
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit);

      const total = await FraudCase.countDocuments(filter);

      res.json({
        success: true,
        data: { cases, total, page, pages: Math.ceil(total / limit) },
      });
    } catch (error: any) {
      res.status(500).json({ success: false, error: 'Failed to fetch fraud cases' });
    }
  }
);

// POST /api/fraud/cases — Create fraud case
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

      const fraudCase = await FraudCase.create({
        caseNumber,
        source: source || 'admin_manual',
        entityType,
        entityId,
        entityTitle,
        reportedBy: req.user!._id,
        organizationId: req.user!.organizationId,
        severity: severity || 'medium',
        aiAnalysis: aiAnalysis || undefined,
        notes: initialNote
          ? [{ author: req.user!._id, authorName: req.user!.name, content: initialNote, timestamp: new Date() }]
          : [],
      });

      await createAuditEntry({
        action: 'fraud_flag',
        entity: 'fraud_case',
        entityId: (fraudCase._id as unknown) as string,
        description: `Fraud case ${caseNumber} created for ${entityType}: ${entityTitle}`,
        req,
      });

      res.status(201).json({ success: true, data: fraudCase });
    } catch (error: any) {
      res.status(500).json({ success: false, error: 'Failed to create fraud case' });
    }
  }
);

// GET /api/fraud/cases/:id — Case details
router.get(
  '/cases/:id',
  protect,
  authorize('platform_admin', 'admin', 'ngo_admin'),
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const fraudCase = await FraudCase.findById(req.params.id)
        .populate('reportedBy', 'name email role')
        .populate('assignedTo', 'name email role');

      if (!fraudCase) {
        res.status(404).json({ success: false, error: 'Fraud case not found' });
        return;
      }

      res.json({ success: true, data: fraudCase });
    } catch (error: any) {
      res.status(500).json({ success: false, error: 'Failed to fetch fraud case' });
    }
  }
);

// PATCH /api/fraud/cases/:id/assign — Assign investigator
router.patch(
  '/cases/:id/assign',
  protect,
  authorize('platform_admin', 'admin'),
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const fraudCase = await FraudCase.findByIdAndUpdate(
        req.params.id,
        { assignedTo: req.body.assignedTo, status: 'investigating' },
        { new: true }
      );

      if (!fraudCase) {
        res.status(404).json({ success: false, error: 'Case not found' });
        return;
      }

      res.json({ success: true, data: fraudCase });
    } catch (error: any) {
      res.status(500).json({ success: false, error: 'Failed to assign case' });
    }
  }
);

// PATCH /api/fraud/cases/:id/status — Update case status
router.patch(
  '/cases/:id/status',
  protect,
  authorize('platform_admin', 'admin', 'ngo_admin'),
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { status, severity } = req.body;
      const update: any = {};
      if (status) update.status = status;
      if (severity) update.severity = severity;

      const fraudCase = await FraudCase.findByIdAndUpdate(req.params.id, update, { new: true });

      if (!fraudCase) {
        res.status(404).json({ success: false, error: 'Case not found' });
        return;
      }

      res.json({ success: true, data: fraudCase });
    } catch (error: any) {
      res.status(500).json({ success: false, error: 'Failed to update case' });
    }
  }
);

// POST /api/fraud/cases/:id/note — Add investigation note
router.post(
  '/cases/:id/note',
  protect,
  authorize('platform_admin', 'admin', 'ngo_admin'),
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { content } = req.body;
      if (!content) {
        res.status(400).json({ success: false, error: 'Note content is required' });
        return;
      }

      const fraudCase = await FraudCase.findByIdAndUpdate(
        req.params.id,
        {
          $push: {
            notes: {
              author: req.user!._id,
              authorName: req.user!.name,
              content,
              timestamp: new Date(),
            },
          },
        },
        { new: true }
      );

      if (!fraudCase) {
        res.status(404).json({ success: false, error: 'Case not found' });
        return;
      }

      res.json({ success: true, data: fraudCase });
    } catch (error: any) {
      res.status(500).json({ success: false, error: 'Failed to add note' });
    }
  }
);

// PATCH /api/fraud/cases/:id/resolve — Resolve case
router.patch(
  '/cases/:id/resolve',
  protect,
  authorize('platform_admin', 'admin'),
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { action, details } = req.body;
      if (!action) {
        res.status(400).json({ success: false, error: 'Resolution action is required' });
        return;
      }

      const fraudCase = await FraudCase.findByIdAndUpdate(
        req.params.id,
        {
          status: 'resolved',
          resolution: {
            action,
            details: details || '',
            resolvedBy: req.user!._id,
            timestamp: new Date(),
          },
        },
        { new: true }
      );

      if (!fraudCase) {
        res.status(404).json({ success: false, error: 'Case not found' });
        return;
      }

      await createAuditEntry({
        action: 'escalate',
        entity: 'fraud_case',
        entityId: (fraudCase._id as unknown) as string,
        description: `Fraud case ${fraudCase.caseNumber} resolved: ${action}`,
        req,
      });

      res.json({ success: true, data: fraudCase, message: 'Fraud case resolved' });
    } catch (error: any) {
      res.status(500).json({ success: false, error: 'Failed to resolve case' });
    }
  }
);

// GET /api/fraud/stats — Dashboard stats
router.get(
  '/stats',
  protect,
  authorize('platform_admin', 'admin', 'ngo_admin'),
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const total = await FraudCase.countDocuments();
      const open = await FraudCase.countDocuments({ status: 'open' });
      const investigating = await FraudCase.countDocuments({ status: 'investigating' });
      const confirmed = await FraudCase.countDocuments({ status: 'confirmed_fraud' });
      const resolved = await FraudCase.countDocuments({ status: 'resolved' });
      const dismissed = await FraudCase.countDocuments({ status: 'dismissed' });
      const critical = await FraudCase.countDocuments({ severity: 'critical', status: { $nin: ['resolved', 'dismissed'] } });

      res.json({
        success: true,
        data: { total, open, investigating, confirmed, resolved, dismissed, critical },
      });
    } catch (error: any) {
      res.status(500).json({ success: false, error: 'Failed to fetch fraud stats' });
    }
  }
);

export default router;
