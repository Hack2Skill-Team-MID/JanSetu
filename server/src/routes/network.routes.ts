import { Router, Request, Response } from 'express';
import Organization from '../models/Organization';
import Campaign from '../models/Campaign';
import { CommunityNeed } from '../models/CommunityNeed';
import { protect as authMiddleware } from '../middleware/auth';

const router = Router();

// ─────────────────────────────────────────
// GET /api/network/ngos — Discover public NGOs
// ─────────────────────────────────────────
router.get('/ngos', async (req: Request, res: Response) => {
  try {
    const { region, search, page = '1', limit = '12' } = req.query;
    const filter: any = { mode: 'public', isActive: true };

    if (region) filter.region = region;
    if (search) filter.name = { $regex: search, $options: 'i' };

    const skip = (Number(page) - 1) * Number(limit);
    const [orgs, total] = await Promise.all([
      Organization.find(filter)
        .sort({ trustScore: -1 })
        .skip(skip)
        .limit(Number(limit))
        .select('name slug description type region trustScore trustTier logo stats'),
      Organization.countDocuments(filter),
    ]);

    res.json({ success: true, data: { organizations: orgs, total } });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ─────────────────────────────────────────
// GET /api/network/feed — Global opportunity feed
// ─────────────────────────────────────────
router.get('/feed', async (req: Request, res: Response) => {
  try {
    const { category, region, page = '1', limit = '20' } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    // Fetch campaigns, needs, and weave into a single feed
    const campaignFilter: any = { visibility: 'public', status: 'active' };
    const needFilter: any = { status: 'active' };
    if (category) {
      campaignFilter.category = category;
      needFilter.category = category;
    }
    if (region) {
      campaignFilter.region = region;
      needFilter.location = { $regex: region, $options: 'i' };
    }

    const [campaigns, needs] = await Promise.all([
      Campaign.find(campaignFilter)
        .sort({ featured: -1, createdAt: -1 })
        .limit(Number(limit))
        .populate('organizationId', 'name slug trustScore logo'),
      CommunityNeed.find(needFilter)
        .sort({ urgency: -1, createdAt: -1 })
        .limit(Number(limit)),
    ]);

    // Merge into unified feed sorted by recency
    const feed = [
      ...campaigns.map((c: any) => ({
        type: 'campaign' as const,
        id: c._id,
        title: c.title,
        description: c.description,
        category: c.category,
        location: c.location,
        organization: c.organizationId,
        goals: c.goals,
        createdAt: c.createdAt,
      })),
      ...needs.map((n: any) => ({
        type: 'need' as const,
        id: n._id,
        title: n.title,
        description: n.description,
        category: n.category,
        urgency: n.urgency,
        location: n.location,
        affectedPopulation: n.affectedPopulation,
        createdAt: n.createdAt,
      })),
    ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
     .slice(skip, skip + Number(limit));

    res.json({ success: true, data: { feed, total: feed.length } });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ─────────────────────────────────────────
// POST /api/network/collaborate/:orgId — Request collaboration
// ─────────────────────────────────────────
router.post('/collaborate/:orgId', authMiddleware, async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const { message, campaignId } = req.body;

    // In production: create a CollaborationRequest model
    // For MVP: return success with metadata
    const targetOrg = await Organization.findById(req.params.orgId).select('name email');
    if (!targetOrg) return res.status(404).json({ success: false, error: 'Organization not found' });

    res.json({
      success: true,
      data: {
        message: `Collaboration request sent to ${targetOrg.name}`,
        from: user.organizationId,
        to: req.params.orgId,
        campaignId,
        status: 'pending',
      },
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ─────────────────────────────────────────
// GET /api/network/map-data — Geo data for map visualization
// ─────────────────────────────────────────
router.get('/map-data', async (_req: Request, res: Response) => {
  try {
    const [needs, orgs] = await Promise.all([
      CommunityNeed.find({ status: 'active' })
        .select('title category urgency location coordinates affectedPopulation'),
      Organization.find({ mode: 'public', isActive: true })
        .select('name type region coordinates trustScore'),
    ]);

    res.json({
      success: true,
      data: {
        needs: needs.map((n: any) => ({
          type: 'need', id: n._id, title: n.title, category: n.category,
          urgency: n.urgency, location: n.location, coordinates: n.coordinates,
          affectedPopulation: n.affectedPopulation,
        })),
        organizations: orgs.map((o: any) => ({
          type: 'organization', id: o._id, name: o.name, orgType: o.type,
          region: o.region, coordinates: o.coordinates, trustScore: o.trustScore,
        })),
      },
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
