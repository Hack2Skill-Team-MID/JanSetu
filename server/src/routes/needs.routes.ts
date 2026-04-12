import { Router, Response } from 'express';
import { CommunityNeed } from '../models/CommunityNeed';
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
    } = req.query;

    const query: any = {};
    if (region) query.region = region;
    if (category) query.category = category;
    if (urgency) query.urgencyLevel = urgency;
    if (status) query.status = status;

    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);
    const skip = (pageNum - 1) * limitNum;

    const [needs, total] = await Promise.all([
      CommunityNeed.find(query)
        .sort(sort as string)
        .skip(skip)
        .limit(limitNum)
        .populate('ngoId', 'name email'),
      CommunityNeed.countDocuments(query),
    ]);

    res.json({
      success: true,
      data: needs,
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
    const need = await CommunityNeed.findById(req.params.id).populate(
      'ngoId',
      'name email'
    );
    if (!need) {
      res.status(404).json({ success: false, error: 'Need not found' });
      return;
    }
    res.json({ success: true, data: need });
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
      const need = await CommunityNeed.create({
        ...req.body,
        ngoId: req.user!._id,
      });
      res.status(201).json({ success: true, data: need });
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
      const need = await CommunityNeed.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true, runValidators: true }
      );
      if (!need) {
        res.status(404).json({ success: false, error: 'Need not found' });
        return;
      }
      res.json({ success: true, data: need });
    } catch (error: any) {
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
      const need = await CommunityNeed.findByIdAndDelete(req.params.id);
      if (!need) {
        res.status(404).json({ success: false, error: 'Need not found' });
        return;
      }
      res.json({ success: true, data: {} });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  }
);

export default router;
