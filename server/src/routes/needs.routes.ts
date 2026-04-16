// @ts-nocheck
import { Router, Response } from 'express';
import prisma from '../config/db';
import { protect, authorize, AuthRequest } from '../middleware/auth';

const router = Router();

// @route   GET /api/needs
// @desc    Get all community needs (with filters & pagination)
// @access  Private
router.get('/', protect, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const {
      region,
      category,
      urgency,
      status,
      page = '1',
      limit = '20',
      sort = '-priorityScore',
    } = req.query as Record<string, string | undefined>;

    const where: any = {};
    if (region) where.region = region;
    if (category) where.category = category;
    if (urgency) where.urgencyLevel = urgency;
    if (status) where.status = status;

    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);
    const skip = (pageNum - 1) * limitNum;

    // Parse sort string like '-priorityScore'
    const sortField = (sort as string).replace(/^-/, '');
    const sortOrder = (sort as string).startsWith('-') ? 'desc' : 'asc';

    const [needs, total] = await Promise.all([
      prisma.communityNeed.findMany({
        where,
        orderBy: { [sortField]: sortOrder },
        skip,
        take: limitNum,
        include: {
          ngo: { select: { id: true, name: true, email: true } },
        },
      }),
      prisma.communityNeed.count({ where }),
    ]);

    // Map for frontend compat
    const mapped = needs.map((n: any) => ({
      ...n,
      _id: n.id,
      ngoId: n.ngo ? { ...n.ngo, _id: n.ngo.id } : n.ngoId,
    }));

    res.json({
      success: true,
      data: mapped,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// @route   GET /api/needs/:id
// @desc    Get single community need
// @access  Private
router.get('/:id', protect, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const need = await prisma.communityNeed.findUnique({
      where: { id: req.params.id },
      include: {
        ngo: { select: { id: true, name: true, email: true } },
      },
    });
    if (!need) {
      res.status(404).json({ success: false, error: 'Need not found' });
      return;
    }
    res.json({ success: true, data: { ...need, _id: need.id } });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// @route   POST /api/needs
// @desc    Create a community need
// @access  Private (NGO Coordinator only)
router.post(
  '/',
  protect,
  authorize('ngo_coordinator', 'admin'),
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const need = await prisma.communityNeed.create({
        data: {
          ...req.body,
          ngoId: req.user!.id,
          coordinates: req.body.coordinates || [0, 0],
          images: req.body.images || [],
        },
      });
      res.status(201).json({ success: true, data: { ...need, _id: need.id } });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  }
);

// @route   PATCH /api/needs/:id
// @desc    Update a community need
// @access  Private (NGO Coordinator only)
router.patch(
  '/:id',
  protect,
  authorize('ngo_coordinator', 'admin'),
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const need = await prisma.communityNeed.update({
        where: { id: req.params.id },
        data: req.body,
      });
      res.json({ success: true, data: { ...need, _id: need.id } });
    } catch (error: any) {
      if (error.code === 'P2025') {
        res.status(404).json({ success: false, error: 'Need not found' });
        return;
      }
      res.status(500).json({ success: false, error: error.message });
    }
  }
);

// @route   DELETE /api/needs/:id
// @desc    Delete a community need
// @access  Private (Admin only)
router.delete(
  '/:id',
  protect,
  authorize('admin'),
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      await prisma.communityNeed.delete({ where: { id: req.params.id } });
      res.json({ success: true, data: {} });
    } catch (error: any) {
      if (error.code === 'P2025') {
        res.status(404).json({ success: false, error: 'Need not found' });
        return;
      }
      res.status(500).json({ success: false, error: error.message });
    }
  }
);

export default router;

