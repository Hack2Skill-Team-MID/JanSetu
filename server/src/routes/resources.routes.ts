// @ts-nocheck
import { Router, Request, Response } from 'express';
import prisma from '../config/db';
import { protect as authMiddleware } from '../middleware/auth';

const router = Router();

// POST /api/resources
router.post('/', authMiddleware, async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    if (!user.organizationId) {
      return res.status(400).json({ success: false, error: 'You must belong to an organization.' });
    }

    const resource = await prisma.resource.create({
      data: {
        ...req.body,
        organizationId: user.organizationId,
        available: req.body.quantity,
        coordinates: req.body.coordinates || [0, 0],
      },
    });

    res.status(201).json({ success: true, data: { ...resource, _id: resource.id } });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/resources
router.get('/', authMiddleware, async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const { category, status } = req.query;
    const where: any = { organizationId: user.organizationId };

    if (category) where.category = category;
    if (status) where.status = status;

    const resources = await prisma.resource.findMany({
      where,
      orderBy: [{ status: 'asc' }, { expiryDate: 'asc' }],
    });
    res.json({ success: true, data: resources.map((r: any) => ({ ...r, _id: r.id })) });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/resources/alerts
router.get('/alerts', authMiddleware, async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;

    // Users without an org have no resource alerts
    if (!user.organizationId) {
      return res.json({ success: true, data: { expiringSoon: [], lowStock: [], expired: [], totalAlerts: 0 } });
    }

    const sevenDays = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    const [expiring, lowStock, expired] = await Promise.all([
      prisma.resource.findMany({
        where: {
          organizationId: user.organizationId,
          expiryDate: { lte: sevenDays, gt: new Date() },
        },
      }),
      prisma.resource.findMany({ where: { organizationId: user.organizationId, status: 'low_stock' } }),
      prisma.resource.findMany({ where: { organizationId: user.organizationId, status: 'expired' } }),
    ]);

    res.json({
      success: true,
      data: {
        expiringSoon: expiring.map((r: any) => ({ ...r, _id: r.id })),
        lowStock: lowStock.map((r: any) => ({ ...r, _id: r.id })),
        expired: expired.map((r: any) => ({ ...r, _id: r.id })),
        totalAlerts: expiring.length + lowStock.length + expired.length,
      },
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/resources/:id/allocate
router.post('/:id/allocate', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { quantity, campaignId, taskId } = req.body;
    const resource = await prisma.resource.findUnique({ where: { id: req.params.id } });
    if (!resource) return res.status(404).json({ success: false, error: 'Resource not found' });

    if (quantity > resource.available) {
      return res.status(400).json({ success: false, error: `Only ${resource.available} ${resource.unit} available.` });
    }

    // Create allocation record
    await prisma.resourceAllocation.create({
      data: { resourceId: resource.id, campaignId, taskId, quantity },
    });

    // Update resource counts & status
    const newAllocated = resource.allocated + quantity;
    const newAvailable = resource.quantity - newAllocated;
    let newStatus = 'available';
    if (newAvailable <= 0) newStatus = 'depleted';
    else if (newAvailable < resource.quantity * 0.2) newStatus = 'low_stock';
    else if (resource.expiryDate && resource.expiryDate < new Date()) newStatus = 'expired';

    const updated = await prisma.resource.update({
      where: { id: resource.id },
      data: { allocated: newAllocated, available: newAvailable, status: newStatus },
      include: { allocations: true },
    });

    res.json({ success: true, data: { ...updated, _id: updated.id } });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// PATCH /api/resources/:id
router.patch('/:id', authMiddleware, async (req: Request, res: Response) => {
  try {
    const resource = await prisma.resource.update({ where: { id: req.params.id }, data: req.body });
    res.json({ success: true, data: { ...resource, _id: resource.id } });
  } catch (err: any) {
    if (err.code === 'P2025') return res.status(404).json({ success: false, error: 'Resource not found' });
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/resources/dashboard
router.get('/dashboard', authMiddleware, async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const resources = await prisma.resource.findMany({ where: { organizationId: user.organizationId } });

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

// GET /api/resources/shared
router.get('/shared', authMiddleware, async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const shared = await prisma.resource.findMany({
      where: {
        availableForSharing: true,
        organizationId: { not: user.organizationId },
        status: 'available',
      },
      include: { organization: { select: { id: true, name: true, slug: true, region: true } } },
      take: 20,
    });

    const mapped = shared.map((r: any) => ({
      ...r, _id: r.id,
      organizationId: r.organization ? { ...r.organization, _id: r.organization.id } : r.organizationId,
    }));

    res.json({ success: true, data: mapped });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;

