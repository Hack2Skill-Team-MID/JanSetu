// @ts-nocheck
import { Router, Request, Response } from 'express';
import prisma from '../config/db';
import { protect as authMiddleware, AuthRequest } from '../middleware/auth';
import { aiBridgeService } from '../services/ai-bridge.service';
import { createAuditEntry } from '../middleware/audit';

const router = Router();

// POST /api/campaigns
router.post('/', authMiddleware, async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    if (!user.organizationId) {
      return res.status(400).json({ success: false, error: 'You must belong to an organization to create campaigns.' });
    }

    const { title, description, category, tags, coverImage, visibility, featured, startDate, endDate, status,
      location, region, coordinates, goals, milestones, impactSummary } = req.body;

    const campaign = await prisma.campaign.create({
      data: {
        organizationId: user.organizationId,
        createdById: user.id,
        title, description, category,
        tags: tags || [],
        coverImage,
        visibility: visibility || 'private',
        featured: featured || false,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        status: status || 'draft',
        location,
        region,
        coordinates: coordinates || [0, 0],
        goalsVolunteersNeeded: goals?.volunteersNeeded || 0,
        goalsVolunteersJoined: goals?.volunteersJoined || 0,
        goalsFundingGoal: goals?.fundingGoal || 0,
        goalsFundingRaised: goals?.fundingRaised || 0,
        goalsPeopleToHelp: goals?.peopleToHelp || 0,
        goalsPeopleHelped: goals?.peopleHelped || 0,
        milestones: milestones || [],
        impactSummary,
      },
    });

    await createAuditEntry({
      action: 'create',
      entity: 'campaign',
      entityId: campaign.id,
      description: `Campaign created: ${campaign.title}`,
      after: { title: campaign.title, category: campaign.category },
      req: req as AuthRequest,
    });

    // Return with nested goals for frontend compat
    const response = {
      ...campaign,
      _id: campaign.id,
      goals: {
        volunteersNeeded: campaign.goalsVolunteersNeeded,
        volunteersJoined: campaign.goalsVolunteersJoined,
        fundingGoal: campaign.goalsFundingGoal,
        fundingRaised: campaign.goalsFundingRaised,
        peopleToHelp: campaign.goalsPeopleToHelp,
        peopleHelped: campaign.goalsPeopleHelped,
      },
    };

    res.status(201).json({ success: true, data: response });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Helper to format campaign for frontend
function formatCampaign(c: any) {
  return {
    ...c,
    _id: c.id,
    goals: {
      volunteersNeeded: c.goalsVolunteersNeeded,
      volunteersJoined: c.goalsVolunteersJoined,
      fundingGoal: c.goalsFundingGoal,
      fundingRaised: c.goalsFundingRaised,
      peopleToHelp: c.goalsPeopleToHelp,
      peopleHelped: c.goalsPeopleHelped,
    },
    organizationId: c.organization ? { ...c.organization, _id: c.organization.id } : c.organizationId,
  };
}

// GET /api/campaigns
router.get('/', async (req: Request, res: Response) => {
  try {
    const { category, region, status, visibility = 'public', orgId, page = '1', limit = '12' } = req.query as Record<string, string | undefined>;
    const where: any = {};

    if (visibility === 'public') {
      where.visibility = 'public';
    } else if (orgId) {
      where.organizationId = orgId;
    }

    if (category) where.category = category;
    if (region) where.region = region;
    if (status) where.status = status;
    else where.status = { in: ['active', 'paused'] };

    const skip = (Number(page) - 1) * Number(limit);
    const [campaigns, total] = await Promise.all([
      prisma.campaign.findMany({
        where,
        orderBy: [{ featured: 'desc' }, { createdAt: 'desc' }],
        skip,
        take: Number(limit),
        include: {
          organization: { select: { id: true, name: true, slug: true, trustScore: true, trustTier: true, logo: true } },
        },
      }),
      prisma.campaign.count({ where }),
    ]);

    res.json({ success: true, data: { campaigns: campaigns.map(formatCampaign), total, page: Number(page) } });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/campaigns/:id
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const campaign = await prisma.campaign.findUnique({
      where: { id: req.params.id },
      include: {
        organization: { select: { id: true, name: true, slug: true, trustScore: true, trustTier: true, logo: true, region: true } },
        createdBy: { select: { id: true, name: true, avatar: true } },
      },
    });
    if (!campaign) return res.status(404).json({ success: false, error: 'Campaign not found' });
    res.json({ success: true, data: formatCampaign(campaign) });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// PATCH /api/campaigns/:id
router.patch('/:id', authMiddleware, async (req: Request, res: Response) => {
  try {
    // Separate goals from flat fields
    const { goals, ...rest } = req.body;
    const data: any = { ...rest };
    if (goals) {
      if (goals.volunteersNeeded !== undefined) data.goalsVolunteersNeeded = goals.volunteersNeeded;
      if (goals.volunteersJoined !== undefined) data.goalsVolunteersJoined = goals.volunteersJoined;
      if (goals.fundingGoal !== undefined) data.goalsFundingGoal = goals.fundingGoal;
      if (goals.fundingRaised !== undefined) data.goalsFundingRaised = goals.fundingRaised;
      if (goals.peopleToHelp !== undefined) data.goalsPeopleToHelp = goals.peopleToHelp;
      if (goals.peopleHelped !== undefined) data.goalsPeopleHelped = goals.peopleHelped;
    }

    const campaign = await prisma.campaign.update({ where: { id: req.params.id }, data });
    if (!campaign) return res.status(404).json({ success: false, error: 'Campaign not found' });

    await createAuditEntry({
      action: 'update', entity: 'campaign', entityId: req.params.id,
      description: `Campaign updated: ${campaign.title}`, after: req.body, req: req as AuthRequest,
    });

    res.json({ success: true, data: formatCampaign(campaign) });
  } catch (err: any) {
    if (err.code === 'P2025') return res.status(404).json({ success: false, error: 'Campaign not found' });
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/campaigns/:id/publish
router.post('/:id/publish', authMiddleware, async (req: Request, res: Response) => {
  try {
    const campaign = await prisma.campaign.findUnique({ where: { id: req.params.id } });
    if (!campaign) return res.status(404).json({ success: false, error: 'Campaign not found' });

    const newVisibility = campaign.visibility === 'private' ? 'public' : 'private';
    const newStatus = campaign.status === 'draft' ? 'active' : campaign.status;

    const updated = await prisma.campaign.update({
      where: { id: req.params.id },
      data: { visibility: newVisibility, status: newStatus },
    });

    res.json({ success: true, data: { visibility: updated.visibility, status: updated.status } });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/campaigns/:id/milestones
router.post('/:id/milestones', authMiddleware, async (req: Request, res: Response) => {
  try {
    const campaign = await prisma.campaign.findUnique({ where: { id: req.params.id } });
    if (!campaign) return res.status(404).json({ success: false, error: 'Campaign not found' });

    const milestones = (campaign.milestones as any[]) || [];
    milestones.push(req.body);

    const updated = await prisma.campaign.update({
      where: { id: req.params.id },
      data: { milestones },
    });

    res.status(201).json({ success: true, data: updated.milestones });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// PATCH /api/campaigns/:id/milestones/:mIdx/complete
router.patch('/:id/milestones/:mIdx/complete', authMiddleware, async (req: Request, res: Response) => {
  try {
    const campaign = await prisma.campaign.findUnique({ where: { id: req.params.id } });
    if (!campaign) return res.status(404).json({ success: false, error: 'Campaign not found' });

    const milestones = (campaign.milestones as any[]) || [];
    const idx = parseInt(req.params.mIdx);
    if (!milestones[idx]) return res.status(404).json({ success: false, error: 'Milestone not found' });

    milestones[idx].completed = true;
    milestones[idx].completedAt = new Date().toISOString();

    const updated = await prisma.campaign.update({
      where: { id: req.params.id },
      data: { milestones },
    });

    res.json({ success: true, data: (updated.milestones as any[])[idx] });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/campaigns/:id/impact
router.get('/:id/impact', authMiddleware, async (req: Request, res: Response) => {
  try {
    const campaign = await prisma.campaign.findUnique({
      where: { id: req.params.id },
      include: { organization: { select: { name: true } } },
    });
    if (!campaign) return res.status(404).json({ success: false, error: 'Campaign not found' });

    const milestones = (campaign.milestones as any[]) || [];
    const impactData = {
      text: `Generate an impact report for this campaign:
        Title: ${campaign.title}
        Description: ${campaign.description}
        Category: ${campaign.category}
        Location: ${campaign.location}
        Volunteers joined: ${campaign.goalsVolunteersJoined}/${campaign.goalsVolunteersNeeded}
        Funding raised: ₹${campaign.goalsFundingRaised}/${campaign.goalsFundingGoal}
        People helped: ${campaign.goalsPeopleHelped}/${campaign.goalsPeopleToHelp}
        Milestones completed: ${milestones.filter((m: any) => m.completed).length}/${milestones.length}`,
    };

    const insights = await aiBridgeService.extractInsights(impactData);
    const updated = await prisma.campaign.update({
      where: { id: req.params.id },
      data: { impactSummary: insights?.summary || 'Impact data is being processed.' },
    });

    res.json({
      success: true,
      data: {
        impactSummary: updated.impactSummary,
        goals: {
          volunteersNeeded: updated.goalsVolunteersNeeded,
          volunteersJoined: updated.goalsVolunteersJoined,
          fundingGoal: updated.goalsFundingGoal,
          fundingRaised: updated.goalsFundingRaised,
          peopleToHelp: updated.goalsPeopleToHelp,
          peopleHelped: updated.goalsPeopleHelped,
        },
        milestones: updated.milestones,
      },
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;

