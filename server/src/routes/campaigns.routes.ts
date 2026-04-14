import { Router, Request, Response } from 'express';
import Campaign from '../models/Campaign';
import { protect as authMiddleware, AuthRequest } from '../middleware/auth';
import { aiBridgeService } from '../services/ai-bridge.service';
import { createAuditEntry } from '../middleware/audit';

const router = Router();

// ─────────────────────────────────────────
// POST /api/campaigns — Create campaign
// ─────────────────────────────────────────
router.post('/', authMiddleware, async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    if (!user.organizationId) {
      return res.status(400).json({ success: false, error: 'You must belong to an organization to create campaigns.' });
    }

    const campaign = await Campaign.create({
      ...req.body,
      organizationId: user.organizationId,
      createdBy: user._id,
    });

    await createAuditEntry({
      action: 'create',
      entity: 'campaign',
      entityId: String(campaign._id),
      description: `Campaign created: ${campaign.title}`,
      after: { title: campaign.title, category: campaign.category },
      req: req as AuthRequest,
    });

    res.status(201).json({ success: true, data: campaign });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ─────────────────────────────────────────
// GET /api/campaigns — List campaigns
// ─────────────────────────────────────────
router.get('/', async (req: Request, res: Response) => {
  try {
    const { category, region, status, visibility = 'public', orgId, page = '1', limit = '12' } = req.query;
    const filter: any = {};

    if (visibility === 'public') {
      filter.visibility = 'public';
    } else if (orgId) {
      filter.organizationId = orgId;
    }

    if (category) filter.category = category;
    if (region) filter.region = region;
    if (status) filter.status = status;
    else filter.status = { $in: ['active', 'paused'] };

    const skip = (Number(page) - 1) * Number(limit);
    const [campaigns, total] = await Promise.all([
      Campaign.find(filter)
        .sort({ featured: -1, createdAt: -1 })
        .skip(skip)
        .limit(Number(limit))
        .populate('organizationId', 'name slug trustScore trustTier logo'),
      Campaign.countDocuments(filter),
    ]);

    res.json({ success: true, data: { campaigns, total, page: Number(page) } });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ─────────────────────────────────────────
// GET /api/campaigns/:id — Campaign detail
// ─────────────────────────────────────────
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const campaign = await Campaign.findById(req.params.id)
      .populate('organizationId', 'name slug trustScore trustTier logo region')
      .populate('createdBy', 'name avatar');
    if (!campaign) return res.status(404).json({ success: false, error: 'Campaign not found' });
    res.json({ success: true, data: campaign });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ─────────────────────────────────────────
// PATCH /api/campaigns/:id — Update campaign
// ─────────────────────────────────────────
router.patch('/:id', authMiddleware, async (req: Request, res: Response) => {
  try {
    const campaign = await Campaign.findByIdAndUpdate(req.params.id, { $set: req.body }, { new: true });
    if (!campaign) return res.status(404).json({ success: false, error: 'Campaign not found' });

    await createAuditEntry({
      action: 'update',
      entity: 'campaign',
      entityId: String(req.params.id),
      description: `Campaign updated: ${campaign.title}`,
      after: req.body,
      req: req as AuthRequest,
    });

    res.json({ success: true, data: campaign });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ─────────────────────────────────────────
// POST /api/campaigns/:id/publish — Toggle visibility
// ─────────────────────────────────────────
router.post('/:id/publish', authMiddleware, async (req: Request, res: Response) => {
  try {
    const campaign = await Campaign.findById(req.params.id);
    if (!campaign) return res.status(404).json({ success: false, error: 'Campaign not found' });

    campaign.visibility = campaign.visibility === 'private' ? 'public' : 'private';
    if (campaign.status === 'draft') campaign.status = 'active';
    await campaign.save();

    res.json({ success: true, data: { visibility: campaign.visibility, status: campaign.status } });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ─────────────────────────────────────────
// POST /api/campaigns/:id/milestones — Add milestone
// ─────────────────────────────────────────
router.post('/:id/milestones', authMiddleware, async (req: Request, res: Response) => {
  try {
    const campaign = await Campaign.findById(req.params.id);
    if (!campaign) return res.status(404).json({ success: false, error: 'Campaign not found' });

    campaign.milestones.push(req.body);
    await campaign.save();

    res.status(201).json({ success: true, data: campaign.milestones });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ─────────────────────────────────────────
// PATCH /api/campaigns/:id/milestones/:mIdx/complete — Complete milestone
// ─────────────────────────────────────────
router.patch('/:id/milestones/:mIdx/complete', authMiddleware, async (req: Request, res: Response) => {
  try {
    const campaign = await Campaign.findById(req.params.id);
    if (!campaign) return res.status(404).json({ success: false, error: 'Campaign not found' });

    const idx = parseInt(req.params.mIdx as string);
    if (!campaign.milestones[idx]) return res.status(404).json({ success: false, error: 'Milestone not found' });

    campaign.milestones[idx].completed = true;
    campaign.milestones[idx].completedAt = new Date();
    await campaign.save();

    res.json({ success: true, data: campaign.milestones[idx] });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ─────────────────────────────────────────
// GET /api/campaigns/:id/impact — AI-generated impact summary
// ─────────────────────────────────────────
router.get('/:id/impact', authMiddleware, async (req: Request, res: Response) => {
  try {
    const campaign = await Campaign.findById(req.params.id).populate('organizationId', 'name');
    if (!campaign) return res.status(404).json({ success: false, error: 'Campaign not found' });

    // Generate impact summary via AI
    const impactData = {
      text: `Generate an impact report for this campaign:
        Title: ${campaign.title}
        Description: ${campaign.description}
        Category: ${campaign.category}
        Location: ${campaign.location}
        Volunteers joined: ${campaign.goals.volunteersJoined}/${campaign.goals.volunteersNeeded}
        Funding raised: ₹${campaign.goals.fundingRaised}/${campaign.goals.fundingGoal}
        People helped: ${campaign.goals.peopleHelped}/${campaign.goals.peopleToHelp}
        Milestones completed: ${campaign.milestones.filter(m => m.completed).length}/${campaign.milestones.length}`
    };

    const insights = await aiBridgeService.extractInsights(impactData);
    campaign.impactSummary = insights?.summary || 'Impact data is being processed.';
    await campaign.save();

    res.json({ success: true, data: { impactSummary: campaign.impactSummary, goals: campaign.goals, milestones: campaign.milestones } });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
