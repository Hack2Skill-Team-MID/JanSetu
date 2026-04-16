import { Router, Response } from 'express';
import prisma from '../config/db';
import { protect, AuthRequest } from '../middleware/auth';

const router = Router();

// @route   GET /api/dashboard/stats
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
      prisma.communityNeed.count(),
      prisma.communityNeed.count({ where: { urgencyLevel: 'critical' } }),
      prisma.volunteerProfile.count(),
      prisma.volunteerProfile.count({ where: { isActive: true } }),
      prisma.task.count(),
      prisma.task.count({ where: { status: 'completed' } }),
      prisma.user.count({ where: { role: 'ngo_coordinator' } }),
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
router.get('/heatmap', protect, async (_req: AuthRequest, res: Response): Promise<void> => {
  try {
    // Use Prisma groupBy + raw query for aggregation
    const needs = await prisma.communityNeed.findMany({
      where: { status: { not: 'resolved' } },
      select: {
        region: true,
        category: true,
        coordinates: true,
        priorityScore: true,
      },
    });

    // Group in JS (simpler than raw SQL for this use case)
    const groups: Record<string, { region: string; category: string; coordinates: number[]; count: number; totalPriority: number }> = {};
    for (const n of needs) {
      const key = `${n.region}__${n.category}`;
      if (!groups[key]) {
        groups[key] = { region: n.region, category: n.category, coordinates: n.coordinates, count: 0, totalPriority: 0 };
      }
      groups[key].count++;
      groups[key].totalPriority += n.priorityScore;
    }

    const result = Object.values(groups).map((g) => ({
      region: g.region,
      category: g.category,
      coordinates: g.coordinates,
      count: g.count,
      intensity: Math.min(g.totalPriority / g.count / 100, 1),
    }));

    res.json({ success: true, data: result });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// @route   GET /api/dashboard/category-breakdown
router.get('/category-breakdown', protect, async (_req: AuthRequest, res: Response): Promise<void> => {
  try {
    const needs = await prisma.communityNeed.findMany({
      select: { category: true, urgencyLevel: true },
    });

    const breakdown: Record<string, { _id: string; count: number; critical: number }> = {};
    for (const n of needs) {
      if (!breakdown[n.category]) {
        breakdown[n.category] = { _id: n.category, count: 0, critical: 0 };
      }
      breakdown[n.category].count++;
      if (n.urgencyLevel === 'critical') breakdown[n.category].critical++;
    }

    const result = Object.values(breakdown).sort((a, b) => b.count - a.count);
    res.json({ success: true, data: result });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
