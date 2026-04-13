import { Router, Request, Response } from 'express';
import { User } from '../models/User';
import Organization from '../models/Organization';
import { protect as authMiddleware } from '../middleware/auth';

const router = Router();

// ─────────────────────────────────────────
// GET /api/gamification/leaderboard — Top volunteers
// ─────────────────────────────────────────
router.get('/leaderboard', async (req: Request, res: Response) => {
  try {
    const { scope = 'global', orgId, period = 'all' } = req.query;

    const filter: any = { role: { $in: ['volunteer'] } };
    if (scope === 'org' && orgId) filter.organizationId = orgId;

    const leaders = await User.find(filter)
      .sort({ points: -1, reputationScore: -1 })
      .limit(50)
      .select('name avatar points reputationScore badges organizationId');

    const ranked = leaders.map((u, idx) => ({
      rank: idx + 1,
      _id: u._id,
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

// ─────────────────────────────────────────
// GET /api/gamification/badges/:userId — User's badges
// ─────────────────────────────────────────
router.get('/badges/:userId', async (req: Request, res: Response) => {
  try {
    const user = await User.findById(req.params.userId).select('name badges points reputationScore');
    if (!user) return res.status(404).json({ success: false, error: 'User not found' });

    // Badge catalog with descriptions
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

// ─────────────────────────────────────────
// POST /api/gamification/award — Award points/badge (internal use)
// ─────────────────────────────────────────
router.post('/award', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { userId, points, badge } = req.body;
    const user = (req as any).user;

    // Only admins or the system can award
    if (!['platform_admin', 'admin', 'ngo_admin', 'ngo_coordinator'].includes(user.role)) {
      return res.status(403).json({ success: false, error: 'Not authorized to award' });
    }

    const update: any = {};
    if (points) update.$inc = { points };
    if (badge) update.$addToSet = { badges: badge };

    const updated = await User.findByIdAndUpdate(userId, update, { new: true })
      .select('name points badges reputationScore');

    if (!updated) return res.status(404).json({ success: false, error: 'User not found' });

    res.json({ success: true, data: updated });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ─────────────────────────────────────────
// GET /api/gamification/ngo-trust/:orgId — NGO trust breakdown
// ─────────────────────────────────────────
router.get('/ngo-trust/:orgId', async (req: Request, res: Response) => {
  try {
    const org = await Organization.findById(req.params.orgId)
      .select('name trustScore trustTier verified stats mode');
    if (!org) return res.status(404).json({ success: false, error: 'Organization not found' });

    // Trust breakdown (simplified — AI service would compute this in production)
    const breakdown = {
      verificationStatus: org.verified ? 30 : 0,
      campaignActivity: Math.min(org.stats.activeCampaigns * 5, 20),
      volunteerBase: Math.min(org.stats.totalVolunteers * 2, 20),
      impactDelivered: Math.min(org.stats.peopleHelped / 100, 15),
      transparency: org.mode === 'public' ? 15 : 5,
    };

    res.json({
      success: true,
      data: {
        organization: org.name,
        trustScore: org.trustScore,
        trustTier: org.trustTier,
        breakdown,
      },
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
