import { Router, Response } from 'express';
import { AuthRequest, protect, authorize } from '../middleware/auth';
import EmergencyEvent from '../models/EmergencyEvent';
import Message from '../models/Message';
import { CommunityNeed } from '../models/CommunityNeed';

const router = Router();

// POST /api/emergency/activate — Declare an emergency
router.post(
  '/activate',
  protect,
  authorize('ngo_admin', 'platform_admin', 'admin'),
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const {
        declarationType,
        customTypeName,
        title,
        description,
        severity,
        affectedArea,
        estimatedAffectedPeople,
      } = req.body;

      if (!declarationType || !title || !description || !affectedArea?.name) {
        res.status(400).json({ success: false, error: 'Missing required fields: declarationType, title, description, affectedArea.name' });
        return;
      }

      const orgId = req.user!.organizationId || req.user!._id;

      // Check for already active emergency of same type
      const existing = await EmergencyEvent.findOne({
        organizationId: orgId,
        status: 'active',
        declarationType,
      });

      if (existing) {
        res.status(409).json({ success: false, error: 'An active emergency of this type already exists. Resolve it first.' });
        return;
      }

      // Create emergency event
      const emergency = await EmergencyEvent.create({
        organizationId: orgId,
        declarationType,
        customTypeName,
        title,
        description,
        severity: severity || 'level_1',
        affectedArea: {
          name: affectedArea.name,
          coordinates: affectedArea.coordinates || [0, 0],
          radiusKm: affectedArea.radiusKm || 10,
        },
        activatedBy: req.user!._id,
        activatedAt: new Date(),
        estimatedAffectedPeople,
        autoActions: {
          broadcastSent: false,
          tasksCreated: 0,
          resourcesLocked: 0,
          needsCreated: 0,
        },
      });

      // Auto-action 1: Create critical community need
      const need = await CommunityNeed.create({
        ngoId: req.user!._id,
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
        reportedAt: new Date(),
      });

      // Auto-action 2: Create broadcast message
      const broadcast = await Message.create({
        conversationId: `emergency-${emergency._id}`,
        senderId: req.user!._id,
        organizationId: orgId,
        content: `🚨 EMERGENCY ALERT: ${title}\n\nSeverity: ${(severity || 'level_1').replace('_', ' ').toUpperCase()}\nArea: ${affectedArea.name}\n\n${description}\n\nAll team members — please check the Emergency dashboard for instructions.`,
        type: 'emergency',
        priority: 'emergency',
      });

      // Update auto-actions
      emergency.autoActions.broadcastSent = !!broadcast;
      emergency.autoActions.needsCreated = need ? 1 : 0;
      await emergency.save();

      res.status(201).json({
        success: true,
        data: emergency,
        message: `🚨 Emergency declared: ${title}. Broadcast sent, critical need created.`,
      });
    } catch (error: any) {
      console.error('❌ Emergency activation error:', error.message);
      res.status(500).json({ success: false, error: 'Failed to activate emergency' });
    }
  }
);

// PATCH /api/emergency/:id/resolve — Resolve an emergency
router.patch(
  '/:id/resolve',
  protect,
  authorize('ngo_admin', 'platform_admin', 'admin'),
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const emergency = await EmergencyEvent.findById(req.params.id);

      if (!emergency) {
        res.status(404).json({ success: false, error: 'Emergency not found' });
        return;
      }

      if (emergency.status === 'resolved') {
        res.status(400).json({ success: false, error: 'Emergency already resolved' });
        return;
      }

      emergency.status = 'resolved';
      emergency.resolvedBy = req.user!._id;
      emergency.resolvedAt = new Date();
      emergency.resolutionNotes = req.body.resolutionNotes || '';
      emergency.impactSummary = req.body.impactSummary || '';
      await emergency.save();

      // Send resolution broadcast
      await Message.create({
        conversationId: `emergency-${emergency._id}`,
        senderId: req.user!._id,
        organizationId: emergency.organizationId,
        content: `✅ EMERGENCY RESOLVED: ${emergency.title}\n\n${emergency.resolutionNotes || 'The emergency has been resolved. Operations returning to normal.'}`,
        type: 'broadcast',
        priority: 'normal',
      });

      res.json({
        success: true,
        data: emergency,
        message: '✅ Emergency resolved. Resolution broadcast sent.',
      });
    } catch (error: any) {
      console.error('❌ Emergency resolve error:', error.message);
      res.status(500).json({ success: false, error: 'Failed to resolve emergency' });
    }
  }
);

// GET /api/emergency/active — Get active emergencies
router.get(
  '/active',
  protect,
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const orgId = req.user!.organizationId || req.user!._id;

      const emergencies = await EmergencyEvent.find({
        $or: [
          { organizationId: orgId, status: 'active' },
          { status: 'active' }, // Global emergencies visible to all
        ],
      })
        .populate('activatedBy', 'name email role')
        .sort({ activatedAt: -1 });

      res.json({ success: true, data: emergencies });
    } catch (error: any) {
      console.error('❌ Fetch active emergencies error:', error.message);
      res.status(500).json({ success: false, error: 'Failed to fetch emergencies' });
    }
  }
);

// GET /api/emergency/history — Past emergencies
router.get(
  '/history',
  protect,
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const orgId = req.user!.organizationId || req.user!._id;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;

      const emergencies = await EmergencyEvent.find({
        organizationId: orgId,
      })
        .populate('activatedBy', 'name email role')
        .populate('resolvedBy', 'name email role')
        .sort({ activatedAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit);

      const total = await EmergencyEvent.countDocuments({ organizationId: orgId });

      res.json({
        success: true,
        data: { emergencies, total, page, pages: Math.ceil(total / limit) },
      });
    } catch (error: any) {
      console.error('❌ Fetch emergency history error:', error.message);
      res.status(500).json({ success: false, error: 'Failed to fetch emergency history' });
    }
  }
);

// POST /api/emergency/:id/broadcast — Send additional emergency broadcast
router.post(
  '/:id/broadcast',
  protect,
  authorize('ngo_admin', 'platform_admin', 'admin'),
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const emergency = await EmergencyEvent.findById(req.params.id);

      if (!emergency || emergency.status !== 'active') {
        res.status(404).json({ success: false, error: 'No active emergency found' });
        return;
      }

      const { message } = req.body;
      if (!message) {
        res.status(400).json({ success: false, error: 'Message is required' });
        return;
      }

      await Message.create({
        conversationId: `emergency-${emergency._id}`,
        senderId: req.user!._id,
        organizationId: emergency.organizationId,
        content: `🚨 [${emergency.title}] UPDATE:\n\n${message}`,
        type: 'emergency',
        priority: 'emergency',
      });

      res.json({ success: true, message: 'Emergency broadcast sent' });
    } catch (error: any) {
      console.error('❌ Emergency broadcast error:', error.message);
      res.status(500).json({ success: false, error: 'Failed to send broadcast' });
    }
  }
);

export default router;
