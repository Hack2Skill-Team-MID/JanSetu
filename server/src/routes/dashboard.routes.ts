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
      fundStats,
      tasksCompletedByUser,
    ] = await Promise.all([
      prisma.communityNeed.count(),
      prisma.communityNeed.count({ where: { urgencyLevel: 'critical' } }),
      prisma.volunteerProfile.count(),
      prisma.volunteerProfile.count({ where: { isActive: true } }),
      prisma.task.count(),
      prisma.task.count({ where: { status: 'completed' } }),
      prisma.user.count({ where: { role: { in: ['ngo_coordinator', 'ngo_admin'] } } }),
      prisma.donation.aggregate({
        where: { paymentStatus: 'completed' },
        _sum: { amount: true },
        _count: { id: true },
      }),
      // People impacted — sum from organizations
      prisma.organization.aggregate({ _sum: { statsPeopleHelped: true } }),
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
        fundsRaised: fundStats._sum.amount || 0,
        totalDonations: fundStats._count.id || 0,
        peopleImpacted: tasksCompletedByUser._sum.statsPeopleHelped || 0,
        // For donor dashboard
        activeCampaigns: await prisma.campaign.count({ where: { status: 'active' } }),
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// @route   GET /api/dashboard/activity
// Returns recent activity feed: donations, task completions, volunteer joins
router.get('/activity', protect, async (_req: AuthRequest, res: Response): Promise<void> => {
  try {
    const [recentDonations, recentTaskCompletions, recentVolunteers] = await Promise.all([
      prisma.donation.findMany({
        where: { paymentStatus: 'completed' },
        orderBy: { createdAt: 'desc' },
        take: 5,
        include: { donor: { select: { name: true } }, campaign: { select: { title: true } } },
      }),
      prisma.task.findMany({
        where: { status: 'completed' },
        orderBy: { updatedAt: 'desc' },
        take: 5,
        include: { createdBy: { select: { name: true } } },
      }),
      prisma.volunteerProfile.findMany({
        orderBy: { createdAt: 'desc' },
        take: 5,
        include: { user: { select: { name: true, createdAt: true } } },
      }),
    ]);

    const activities: any[] = [
      ...recentDonations.map((d) => ({
        id: `don-${d.id}`,
        type: 'donation',
        user: { name: d.donor.name, initials: d.donor.name.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase() },
        description: `Donated ₹${d.amount.toLocaleString('en-IN')}${d.campaign ? ` to ${d.campaign.title}` : ''}`,
        timestamp: d.createdAt,
      })),
      ...recentTaskCompletions.map((t) => ({
        id: `task-${t.id}`,
        type: 'task_completed',
        user: { name: t.createdBy.name, initials: t.createdBy.name.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase() },
        description: `Completed task: ${t.title}`,
        timestamp: t.updatedAt,
      })),
      ...recentVolunteers.map((v) => ({
        id: `vol-${v.id}`,
        type: 'volunteer_join',
        user: { name: v.user.name, initials: v.user.name.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase() },
        description: `Joined as volunteer`,
        timestamp: v.createdAt,
      })),
    ]
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 10)
      .map((a) => ({
        ...a,
        timestamp: getRelativeTime(a.timestamp),
      }));

    res.json({ success: true, data: activities });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

function getRelativeTime(date: Date | string): string {
  const diff = Date.now() - new Date(date).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins} min ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} hour${hrs > 1 ? 's' : ''} ago`;
  const days = Math.floor(hrs / 24);
  return `${days} day${days > 1 ? 's' : ''} ago`;
}


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
