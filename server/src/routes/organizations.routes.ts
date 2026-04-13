import { Router, Request, Response } from 'express';
import Organization from '../models/Organization';
import { User } from '../models/User';
import { protect as authMiddleware } from '../middleware/auth';

const router = Router();

// ─────────────────────────────────────────
// POST /api/organizations — Create new NGO workspace
// ─────────────────────────────────────────
router.post('/', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { name, description, type, email, phone, website, address, region, coordinates } = req.body;

    // Generate slug
    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

    // Check slug uniqueness
    const exists = await Organization.findOne({ slug });
    if (exists) {
      return res.status(409).json({ success: false, error: 'An organization with a similar name already exists.' });
    }

    const org = await Organization.create({
      name,
      slug,
      description,
      type: type || 'ngo',
      email,
      phone,
      website,
      address,
      region,
      coordinates: coordinates || [0, 0],
      createdBy: (req as any).user._id,
    });

    // Update user's role and organization
    await User.findByIdAndUpdate((req as any).user._id, {
      organizationId: org._id,
      role: 'ngo_admin',
    });

    res.status(201).json({ success: true, data: org });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ─────────────────────────────────────────
// GET /api/organizations — List all public NGOs
// ─────────────────────────────────────────
router.get('/', async (req: Request, res: Response) => {
  try {
    const { region, type, search, page = '1', limit = '12' } = req.query;
    const filter: any = { mode: 'public', isActive: true };

    if (region) filter.region = region;
    if (type) filter.type = type;
    if (search) filter.name = { $regex: search, $options: 'i' };

    const skip = (Number(page) - 1) * Number(limit);
    const [orgs, total] = await Promise.all([
      Organization.find(filter)
        .sort({ trustScore: -1 })
        .skip(skip)
        .limit(Number(limit))
        .select('-verificationDocs'),
      Organization.countDocuments(filter),
    ]);

    res.json({
      success: true,
      data: { organizations: orgs, total, page: Number(page), totalPages: Math.ceil(total / Number(limit)) },
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ─────────────────────────────────────────
// GET /api/organizations/:id — Get org details
// ─────────────────────────────────────────
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const org = await Organization.findById(req.params.id).populate('createdBy', 'name email');
    if (!org) return res.status(404).json({ success: false, error: 'Organization not found' });
    res.json({ success: true, data: org });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ─────────────────────────────────────────
// PATCH /api/organizations/:id — Update org settings
// ─────────────────────────────────────────
router.patch('/:id', authMiddleware, async (req: Request, res: Response) => {
  try {
    const org = await Organization.findById(req.params.id);
    if (!org) return res.status(404).json({ success: false, error: 'Organization not found' });

    // Only admin of that org or platform admin
    const user = (req as any).user;
    if (org.createdBy.toString() !== user._id.toString() && user.role !== 'platform_admin') {
      return res.status(403).json({ success: false, error: 'Not authorized' });
    }

    const allowed = ['name', 'description', 'mode', 'email', 'phone', 'website', 'address', 'region'];
    allowed.forEach((key) => {
      if (req.body[key] !== undefined) (org as any)[key] = req.body[key];
    });

    await org.save();
    res.json({ success: true, data: org });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ─────────────────────────────────────────
// POST /api/organizations/:id/publish — Toggle public mode
// ─────────────────────────────────────────
router.post('/:id/publish', authMiddleware, async (req: Request, res: Response) => {
  try {
    const org = await Organization.findById(req.params.id);
    if (!org) return res.status(404).json({ success: false, error: 'Organization not found' });

    org.mode = org.mode === 'private' ? 'public' : 'private';
    await org.save();
    res.json({ success: true, data: { mode: org.mode } });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ─────────────────────────────────────────
// GET /api/organizations/:id/members — List org members
// ─────────────────────────────────────────
router.get('/:id/members', authMiddleware, async (req: Request, res: Response) => {
  try {
    const members = await User.find({ organizationId: req.params.id })
      .select('name email role avatar reputationScore badges points');
    res.json({ success: true, data: members });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ─────────────────────────────────────────
// POST /api/organizations/:id/invite — Invite member
// ─────────────────────────────────────────
router.post('/:id/invite', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { email, role } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ success: false, error: 'User not found. They must register first.' });

    user.organizationId = req.params.id as any;
    user.role = role || 'ngo_staff';
    await user.save();

    res.json({ success: true, data: { message: `${user.name} added to organization as ${user.role}` } });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
