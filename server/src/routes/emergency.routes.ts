// @ts-nocheck
import { Router, Response } from 'express';
import { AuthRequest, protect, authorize } from '../middleware/auth';
import prisma from '../config/db';

const router = Router();

// POST /api/emergency/activate
router.post(
  '/activate',
  protect,
  authorize('ngo_admin', 'platform_admin', 'admin'),
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { declarationType, customTypeName, title, description, severity, affectedArea, estimatedAffectedPeople } = req.body;

      if (!declarationType || !title || !description || !affectedArea?.name) {
        res.status(400).json({ success: false, error: 'Missing required fields: declarationType, title, description, affectedArea.name' });
        return;
      }

      const orgId = req.user!.organizationId || req.user!.id;

      const existing = await prisma.emergencyEvent.findFirst({
        where: { organizationId: orgId, status: 'active', declarationType },
      });

      if (existing) {
        res.status(409).json({ success: false, error: 'An active emergency of this type already exists. Resolve it first.' });
        return;
      }

      const emergency = await prisma.emergencyEvent.create({
        data: {
          organizationId: orgId,
          declarationType,
          customTypeName,
          title,
          description,
          severity: severity || 'level_1',
          affectedAreaName: affectedArea.name,
          affectedAreaCoordinates: affectedArea.coordinates || [0, 0],
          affectedAreaRadiusKm: affectedArea.radiusKm || 10,
          activatedById: req.user!.id,
          estimatedAffectedPeople,
        },
      });

      // Auto-action 1: Create critical community need
      const need = await prisma.communityNeed.create({
        data: {
          ngoId: req.user!.id,
          title: `🚨 EMERGENCY: ${title}`,
          description: `Emergency declared: ${description}`,
          category: 'safety',
          urgencyLevel: 'critical',
          priorityScore: 100,
          status: 'reported',
          location: affectedArea.name,
          coordinates: affectedArea.coordinates || [0, 0],
          region: affectedArea.name,
          affectedPopulation: estimatedAffectedPeople,
          sourceType: 'field_report',
        },
      });

      // Auto-action 2: Create broadcast message
      const broadcast = await prisma.message.create({
        data: {
          conversationId: `emergency-${emergency.id}`,
          senderId: req.user!.id,
          organizationId: orgId,
          content: `🚨 EMERGENCY ALERT: ${title}\n\nSeverity: ${(severity || 'level_1').replace('_', ' ').toUpperCase()}\nArea: ${affectedArea.name}\n\n${description}\n\nAll team members — please check the Emergency dashboard for instructions.`,
          type: 'emergency',
          priority: 'emergency',
        },
      });

      await prisma.emergencyEvent.update({
        where: { id: emergency.id },
        data: {
          autoActionBroadcastSent: !!broadcast,
          autoActionNeedsCreated: need ? 1 : 0,
        },
      });

      res.status(201).json({
        success: true,
        data: { ...emergency, _id: emergency.id },
        message: `🚨 Emergency declared: ${title}. Broadcast sent, critical need created.`,
      });
    } catch (error: any) {
      console.error('❌ Emergency activation error:', error.message);
      res.status(500).json({ success: false, error: 'Failed to activate emergency' });
    }
  }
);

// PATCH /api/emergency/:id/resolve
router.patch(
  '/:id/resolve',
  protect,
  authorize('ngo_admin', 'platform_admin', 'admin'),
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const emergency = await prisma.emergencyEvent.findUnique({ where: { id: req.params.id } });
      if (!emergency) { res.status(404).json({ success: false, error: 'Emergency not found' }); return; }
      if (emergency.status === 'resolved') { res.status(400).json({ success: false, error: 'Emergency already resolved' }); return; }

      const updated = await prisma.emergencyEvent.update({
        where: { id: req.params.id },
        data: {
          status: 'resolved',
          resolvedById: req.user!.id,
          resolvedAt: new Date(),
          resolutionNotes: req.body.resolutionNotes || '',
          impactSummary: req.body.impactSummary || '',
        },
      });

      await prisma.message.create({
        data: {
          conversationId: `emergency-${emergency.id}`,
          senderId: req.user!.id,
          organizationId: emergency.organizationId,
          content: `✅ EMERGENCY RESOLVED: ${emergency.title}\n\n${req.body.resolutionNotes || 'The emergency has been resolved. Operations returning to normal.'}`,
          type: 'broadcast',
          priority: 'normal',
        },
      });

      res.json({ success: true, data: { ...updated, _id: updated.id }, message: '✅ Emergency resolved. Resolution broadcast sent.' });
    } catch (error: any) {
      res.status(500).json({ success: false, error: 'Failed to resolve emergency' });
    }
  }
);

// GET /api/emergency/active
router.get('/active', protect, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const orgId = req.user!.organizationId || req.user!.id;

    const emergencies = await prisma.emergencyEvent.findMany({
      where: { OR: [{ organizationId: orgId, status: 'active' }, { status: 'active' }] },
      include: { activatedBy: { select: { id: true, name: true, email: true, role: true } } },
      orderBy: { activatedAt: 'desc' },
    });

    res.json({ success: true, data: emergencies.map((e: any) => ({ ...e, _id: e.id })) });
  } catch (error: any) {
    res.status(500).json({ success: false, error: 'Failed to fetch emergencies' });
  }
});

// GET /api/emergency/history
router.get('/history', protect, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const orgId = req.user!.organizationId || req.user!.id;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;

    const [emergencies, total] = await Promise.all([
      prisma.emergencyEvent.findMany({
        where: { organizationId: orgId },
        include: {
          activatedBy: { select: { id: true, name: true, email: true, role: true } },
          resolvedBy: { select: { id: true, name: true, email: true, role: true } },
        },
        orderBy: { activatedAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.emergencyEvent.count({ where: { organizationId: orgId } }),
    ]);

    res.json({ success: true, data: { emergencies: emergencies.map((e: any) => ({ ...e, _id: e.id })), total, page, pages: Math.ceil(total / limit) } });
  } catch (error: any) {
    res.status(500).json({ success: false, error: 'Failed to fetch emergency history' });
  }
});

// POST /api/emergency/:id/broadcast
router.post(
  '/:id/broadcast',
  protect,
  authorize('ngo_admin', 'platform_admin', 'admin'),
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const emergency = await prisma.emergencyEvent.findUnique({ where: { id: req.params.id } });
      if (!emergency || emergency.status !== 'active') { res.status(404).json({ success: false, error: 'No active emergency found' }); return; }

      const { message } = req.body;
      if (!message) { res.status(400).json({ success: false, error: 'Message is required' }); return; }

      await prisma.message.create({
        data: {
          conversationId: `emergency-${emergency.id}`,
          senderId: req.user!.id,
          organizationId: emergency.organizationId,
          content: `🚨 [${emergency.title}] UPDATE:\n\n${message}`,
          type: 'emergency',
          priority: 'emergency',
        },
      });

      res.json({ success: true, message: 'Emergency broadcast sent' });
    } catch (error: any) {
      res.status(500).json({ success: false, error: 'Failed to send broadcast' });
    }
  }
);

export default router;

