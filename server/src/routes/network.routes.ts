// @ts-nocheck
import { Router, Request, Response } from 'express';
import prisma from '../config/db';
import { protect as authMiddleware } from '../middleware/auth';

const router = Router();

// GET /api/network — list all public NGOs (alias used by discover-ngos page)
router.get('/', async (req: Request, res: Response) => {
  try {
    const { search } = req.query;
    const where: any = { isActive: true };
    if (search) where.name = { contains: search as string, mode: 'insensitive' };
    const orgs = await prisma.organization.findMany({
      where,
      select: {
        id: true, name: true, description: true, location: true, region: true,
        focusAreas: true, trustScore: true, trustTier: true, isVerified: true,
        website: true, statsVolunteersCount: true, statsCampaignsCount: true,
      },
      orderBy: { trustScore: 'desc' },
      take: 50,
    });
    res.json({ success: true, data: { organizations: orgs.map(o => ({ ...o, _id: o.id })) } });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});


// GET /api/network/ngos
router.get('/ngos', async (req: Request, res: Response) => {
  try {
    const { region, search, page = '1', limit = '12' } = req.query;
    const where: any = { mode: 'public', isActive: true };

    if (region) where.region = region;
    if (search) where.name = { contains: search as string, mode: 'insensitive' };

    const skip = (Number(page) - 1) * Number(limit);
    const [orgs, total] = await Promise.all([
      prisma.organization.findMany({
        where,
        orderBy: { trustScore: 'desc' },
        skip,
        take: Number(limit),
        select: {
          id: true, name: true, slug: true, description: true, type: true, region: true,
          trustScore: true, trustTier: true, logo: true,
          statsTotalCampaigns: true, statsActiveCampaigns: true, statsTotalVolunteers: true,
          statsTotalDonationsReceived: true, statsPeopleHelped: true,
        },
      }),
      prisma.organization.count({ where }),
    ]);

    const mapped = orgs.map((o: any) => ({
      ...o, _id: o.id,
      stats: {
        totalCampaigns: o.statsTotalCampaigns,
        activeCampaigns: o.statsActiveCampaigns,
        totalVolunteers: o.statsTotalVolunteers,
        totalDonationsReceived: o.statsTotalDonationsReceived,
        peopleHelped: o.statsPeopleHelped,
      },
    }));

    res.json({ success: true, data: { organizations: mapped, total } });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/network/feed
router.get('/feed', async (req: Request, res: Response) => {
  try {
    const { category, region, page = '1', limit = '20' } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const campaignWhere: any = { visibility: 'public', status: 'active' };
    const needWhere: any = { status: { not: 'resolved' } };
    if (category) { campaignWhere.category = category; needWhere.category = category; }
    if (region) { campaignWhere.region = region; needWhere.location = { contains: region as string, mode: 'insensitive' }; }

    const [campaigns, needs] = await Promise.all([
      prisma.campaign.findMany({
        where: campaignWhere,
        orderBy: [{ featured: 'desc' }, { createdAt: 'desc' }],
        take: Number(limit),
        include: { organization: { select: { id: true, name: true, slug: true, trustScore: true, logo: true } } },
      }),
      prisma.communityNeed.findMany({
        where: needWhere,
        orderBy: { createdAt: 'desc' },
        take: Number(limit),
      }),
    ]);

    const feed = [
      ...campaigns.map((c: any) => ({
        type: 'campaign' as const, id: c.id, title: c.title, description: c.description,
        category: c.category, location: c.location,
        organization: c.organization ? { ...c.organization, _id: c.organization.id } : null,
        goals: { volunteersNeeded: c.goalsVolunteersNeeded, volunteersJoined: c.goalsVolunteersJoined,
          fundingGoal: c.goalsFundingGoal, fundingRaised: c.goalsFundingRaised,
          peopleToHelp: c.goalsPeopleToHelp, peopleHelped: c.goalsPeopleHelped },
        createdAt: c.createdAt,
      })),
      ...needs.map((n: any) => ({
        type: 'need' as const, id: n.id, title: n.title, description: n.description,
        category: n.category, urgency: n.urgencyLevel, location: n.location,
        affectedPopulation: n.affectedPopulation, createdAt: n.createdAt,
      })),
    ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
     .slice(skip, skip + Number(limit));

    res.json({ success: true, data: { feed, total: feed.length } });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/network/collaborate/:orgId
router.post('/collaborate/:orgId', authMiddleware, async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const { campaignId } = req.body;

    const targetOrg = await prisma.organization.findUnique({
      where: { id: req.params.orgId },
      select: { name: true, email: true },
    });
    if (!targetOrg) return res.status(404).json({ success: false, error: 'Organization not found' });

    res.json({
      success: true,
      data: { message: `Collaboration request sent to ${targetOrg.name}`, from: user.organizationId, to: req.params.orgId, campaignId, status: 'pending' },
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/network/map-data
router.get('/map-data', async (_req: Request, res: Response) => {
  try {
    const [needs, orgs] = await Promise.all([
      prisma.communityNeed.findMany({
        where: { status: { not: 'resolved' } },
        select: { id: true, title: true, category: true, urgencyLevel: true, location: true, coordinates: true, affectedPopulation: true },
      }),
      prisma.organization.findMany({
        where: { mode: 'public', isActive: true },
        select: { id: true, name: true, type: true, region: true, coordinates: true, trustScore: true },
      }),
    ]);

    res.json({
      success: true,
      data: {
        needs: needs.map((n) => ({ type: 'need', id: n.id, title: n.title, category: n.category, urgency: n.urgencyLevel, location: n.location, coordinates: n.coordinates, affectedPopulation: n.affectedPopulation })),
        organizations: orgs.map((o) => ({ type: 'organization', id: o.id, name: o.name, orgType: o.type, region: o.region, coordinates: o.coordinates, trustScore: o.trustScore })),
      },
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/network/join-request — community member applies to join an NGO
router.post('/join-request', authMiddleware, async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const { organizationId } = req.body;
    if (!organizationId) {
      return res.status(400).json({ success: false, error: 'organizationId required' });
    }
    const org = await prisma.organization.findUnique({ where: { id: organizationId }, select: { id: true, name: true } });
    if (!org) return res.status(404).json({ success: false, error: 'Organization not found' });

    // Create a message to the org admins as a join request
    const admins = await prisma.user.findMany({
      where: { organizationId, role: { in: ['ngo_admin', 'ngo_coordinator', 'platform_admin'] } },
      select: { id: true },
    });

    // Send message to each admin
    for (const admin of admins) {
      await prisma.message.create({
        data: {
          senderId: user.id,
          receiverId: admin.id,
          content: `🙋 Join Request from ${user.name}: I'd like to join ${org.name} as a community member/volunteer. Please review my profile and let me know!`,
          messageType: 'direct',
        },
      });
    }

    // Also notify with a notification
    try {
      const { createNotification } = await import('./notifications.routes');
      for (const admin of admins) {
        await createNotification(
          admin.id, 'message_received',
          `🙋 New Join Request`,
          `${user.name} wants to join ${org.name}. Check your messages to respond.`,
          { userId: user.id, organizationId }
        );
      }
    } catch { /* non-critical */ }

    res.json({ success: true, data: { message: 'Join request sent to NGO admins!' } });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;

