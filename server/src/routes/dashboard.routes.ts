import { Router, Response } from 'express';
import { CommunityNeed } from '../models/CommunityNeed';
import { Task } from '../models/Task';
import { User } from '../models/User';
import { VolunteerProfile } from '../models/VolunteerProfile';
import { protect, AuthRequest } from '../middleware/auth';

const router = Router();

// @route   GET /api/dashboard/stats
// @desc    Get platform statistics
// @access  Private
router.get('/stats', protect, async (_req: AuthRequest, res: Response): Promise<void> => {
  try {
    const [
      totalNeeds,
      criticalNeeds,
      totalVolunteers,
      activeVolunteers,
      totalTasks,
      completedTasks,
      totalNGOs,
    ] = await Promise.all([
      CommunityNeed.countDocuments(),
      CommunityNeed.countDocuments({ urgencyLevel: 'critical' }),
      VolunteerProfile.countDocuments(),
      VolunteerProfile.countDocuments({ isActive: true }),
      Task.countDocuments(),
      Task.countDocuments({ status: 'completed' }),
      User.countDocuments({ role: 'ngo_coordinator' }),
    ]);

    const matchSuccessRate =
      totalTasks > 0
        ? Math.round((completedTasks / totalTasks) * 100)
        : 0;

    res.json({
      success: true,
      data: {
        totalNeeds,
        criticalNeeds,
        totalVolunteers,
        activeVolunteers,
        totalTasks,
        completedTasks,
        totalNGOs,
        matchSuccessRate,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// @route   GET /api/dashboard/heatmap
// @desc    Get geospatial need density data
// @access  Private
router.get('/heatmap', protect, async (_req: AuthRequest, res: Response): Promise<void> => {
  try {
    const needs = await CommunityNeed.aggregate([
      { $match: { status: { $ne: 'resolved' } } },
      {
        $group: {
          _id: {
            region: '$region',
            category: '$category',
          },
          coordinates: { $first: '$coordinates' },
          count: { $sum: 1 },
          avgPriority: { $avg: '$priorityScore' },
        },
      },
      {
        $project: {
          _id: 0,
          region: '$_id.region',
          category: '$_id.category',
          coordinates: 1,
          count: 1,
          intensity: {
            $min: [{ $divide: ['$avgPriority', 100] }, 1],
          },
        },
      },
    ]);

    res.json({ success: true, data: needs });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// @route   GET /api/dashboard/category-breakdown
// @desc    Get needs count by category
// @access  Private
router.get('/category-breakdown', protect, async (_req: AuthRequest, res: Response): Promise<void> => {
  try {
    const breakdown = await CommunityNeed.aggregate([
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
          critical: {
            $sum: { $cond: [{ $eq: ['$urgencyLevel', 'critical'] }, 1, 0] },
          },
        },
      },
      { $sort: { count: -1 } },
    ]);

    res.json({ success: true, data: breakdown });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
