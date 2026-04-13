import { Router, Request, Response } from 'express';
import Resource from '../models/Resource';
import { protect as authMiddleware } from '../middleware/auth';

const router = Router();

// ─────────────────────────────────────────
// POST /api/resources — Add resource to org inventory
// ─────────────────────────────────────────
router.post('/', authMiddleware, async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    if (!user.organizationId) {
      return res.status(400).json({ success: false, error: 'You must belong to an organization.' });
    }

    const resource = await Resource.create({
      ...req.body,
      organizationId: user.organizationId,
      available: req.body.quantity,
    });

    res.status(201).json({ success: true, data: resource });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ─────────────────────────────────────────
// GET /api/resources — List org's resources
// ─────────────────────────────────────────
router.get('/', authMiddleware, async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const { category, status } = req.query;
    const filter: any = { organizationId: user.organizationId };

    if (category) filter.category = category;
    if (status) filter.status = status;

    const resources = await Resource.find(filter).sort({ status: 1, expiryDate: 1 });
    res.json({ success: true, data: resources });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ─────────────────────────────────────────
// GET /api/resources/alerts — Expiry & low stock alerts
// ─────────────────────────────────────────
router.get('/alerts', authMiddleware, async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const sevenDays = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    const [expiring, lowStock, expired] = await Promise.all([
      Resource.find({
        organizationId: user.organizationId,
        expiryDate: { $lte: sevenDays, $gt: new Date() },
      }),
      Resource.find({ organizationId: user.organizationId, status: 'low_stock' }),
      Resource.find({ organizationId: user.organizationId, status: 'expired' }),
    ]);

    res.json({
      success: true,
      data: {
        expiringSoon: expiring,
        lowStock,
        expired,
        totalAlerts: expiring.length + lowStock.length + expired.length,
      },
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ─────────────────────────────────────────
// POST /api/resources/:id/allocate — Allocate to campaign/task
// ─────────────────────────────────────────
router.post('/:id/allocate', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { quantity, campaignId, taskId } = req.body;
    const resource = await Resource.findById(req.params.id);
    if (!resource) return res.status(404).json({ success: false, error: 'Resource not found' });

    if (quantity > resource.available) {
      return res.status(400).json({ success: false, error: `Only ${resource.available} ${resource.unit} available.` });
    }

    resource.allocated += quantity;
    resource.allocations.push({ campaignId, taskId, quantity, allocatedAt: new Date() });
    await resource.save();

    res.json({ success: true, data: resource });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ─────────────────────────────────────────
// PATCH /api/resources/:id — Update resource
// ─────────────────────────────────────────
router.patch('/:id', authMiddleware, async (req: Request, res: Response) => {
  try {
    const resource = await Resource.findByIdAndUpdate(req.params.id, { $set: req.body }, { new: true });
    if (!resource) return res.status(404).json({ success: false, error: 'Resource not found' });
    res.json({ success: true, data: resource });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ─────────────────────────────────────────
// GET /api/resources/dashboard — Resource summary stats
// ─────────────────────────────────────────
router.get('/dashboard', authMiddleware, async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const resources = await Resource.find({ organizationId: user.organizationId });

    const byCategory = resources.reduce((acc: any, r) => {
      acc[r.category] = (acc[r.category] || 0) + r.available;
      return acc;
    }, {});

    res.json({
      success: true,
      data: {
        totalResources: resources.length,
        totalValue: resources.reduce((s, r) => s + r.quantity, 0),
        allocated: resources.reduce((s, r) => s + r.allocated, 0),
        available: resources.reduce((s, r) => s + r.available, 0),
        byCategory,
        alerts: resources.filter(r => r.status !== 'available').length,
      },
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ─────────────────────────────────────────
// GET /api/resources/shared — Resources available from other NGOs
// ─────────────────────────────────────────
router.get('/shared', authMiddleware, async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const shared = await Resource.find({
      availableForSharing: true,
      organizationId: { $ne: user.organizationId },
      status: 'available',
    })
      .populate('organizationId', 'name slug region')
      .limit(20);

    res.json({ success: true, data: shared });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
