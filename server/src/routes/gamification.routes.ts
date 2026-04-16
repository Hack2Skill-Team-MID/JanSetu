// @ts-nocheck
import { Router, Request, Response } from 'express';
import prisma from '../config/db';
import { protect as authMiddleware } from '../middleware/auth';

const router = Router();

// GET /api/gamification/leaderboard
router.get('/leaderboard', async (req: Request, res: Response) => {
  try {
    const { scope = 'global', orgId } = req.query;

    const where: any = { role: { in: ['volunteer'] } };
    if (scope === 'org' && orgId) where.organizationId = orgId;

    const leaders = await prisma.user.findMany({
      where,
      orderBy: [{ points: 'desc' }, { reputationScore: 'desc' }],
      take: 50,
      select: { id: true, name: true, avatar: true, points: true, reputationScore: true, badges: true, organizationId: true },
    });

    const ranked = leaders.map((u, idx) => ({
      rank: idx + 1,
      _id: u.id,
      name: u.name,
      avatar: u.avatar,
      points: u.points,
      reputationScore: u.reputationScore,
      badges: u.badges,
    }));

    res.json({ success: true, data: ranked });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/gamification/badges/:userId
router.get('/badges/:userId', async (req: Request, res: Response) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.params.userId },
      select: { name: true, badges: true, points: true, reputationScore: true },
    });
    if (!user) return res.status(404).json({ success: false, error: 'User not found' });

    const BADGE_CATALOG: Record<string, { name: string; icon: string; description: string }> = {
      first_task: { name: 'Pioneer', icon: '🎯', description: 'Completed your first task' },
      five_tasks: { name: 'Reliable', icon: '⭐', description: 'Completed 5 tasks' },
      ten_tasks: { name: 'Veteran', icon: '🏆', description: 'Completed 10 tasks' },
      first_aid_hero: { name: 'First Aid Hero', icon: '🏥', description: 'Helped in a medical emergency' },
      crisis_responder: { name: 'Crisis Responder', icon: '🚨', description: 'Responded to an emergency alert' },
      team_player: { name: 'Team Player', icon: '🤝', description: 'Part of 3+ team tasks' },
      mentor: { name: 'Mentor', icon: '📚', description: 'Trained another volunteer' },
      top_donor: { name: 'Top Donor', icon: '💎', description: 'Donated to 5+ campaigns' },
      community_voice: { name: 'Community Voice', icon: '📢', description: 'Reported 10+ community needs' },
      weekly_star: { name: 'Weekly Star', icon: '🌟', description: 'Top performer this week' },
    };

    const enriched = user.badges.map((b) => ({
      id: b,
      ...(BADGE_CATALOG[b] || { name: b, icon: '🏅', description: 'Special achievement' }),
    }));

    res.json({
      success: true,
      data: { user: { name: user.name, points: user.points, reputationScore: user.reputationScore }, badges: enriched },
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/gamification/award
router.post('/award', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { userId, points, badge } = req.body;
    const user = (req as any).user;

    if (!['platform_admin', 'admin', 'ngo_admin', 'ngo_coordinator'].includes(user.role)) {
      return res.status(403).json({ success: false, error: 'Not authorized to award' });
    }

    const targetUser = await prisma.user.findUnique({ where: { id: userId } });
    if (!targetUser) return res.status(404).json({ success: false, error: 'User not found' });

    const data: any = {};
    if (points) data.points = { increment: points };
    if (badge && !targetUser.badges.includes(badge)) {
      data.badges = [...targetUser.badges, badge];
    }

    const updated = await prisma.user.update({
      where: { id: userId },
      data,
      select: { id: true, name: true, points: true, badges: true, reputationScore: true },
    });

    res.json({ success: true, data: { ...updated, _id: updated.id } });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/gamification/ngo-trust/:orgId
router.get('/ngo-trust/:orgId', async (req: Request, res: Response) => {
  try {
    const org = await prisma.organization.findUnique({
      where: { id: req.params.orgId },
      select: {
        name: true, trustScore: true, trustTier: true, verified: true, mode: true,
        statsActiveCampaigns: true, statsTotalVolunteers: true, statsPeopleHelped: true,
      },
    });
    if (!org) return res.status(404).json({ success: false, error: 'Organization not found' });

    const breakdown = {
      verificationStatus: org.verified ? 30 : 0,
      campaignActivity: Math.min(org.statsActiveCampaigns * 5, 20),
      volunteerBase: Math.min(org.statsTotalVolunteers * 2, 20),
      impactDelivered: Math.min(org.statsPeopleHelped / 100, 15),
      transparency: org.mode === 'public' ? 15 : 5,
    };

    res.json({
      success: true,
      data: { organization: org.name, trustScore: org.trustScore, trustTier: org.trustTier, breakdown },
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;

