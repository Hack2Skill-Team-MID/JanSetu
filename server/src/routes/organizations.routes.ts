// @ts-nocheck
import { Router, Request, Response } from 'express';
import prisma from '../config/db';
import { protect as authMiddleware } from '../middleware/auth';

const router = Router();

// POST /api/organizations
router.post('/', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { name, description, type, email, phone, website, address, region, coordinates } = req.body;
    const user = (req as any).user;

    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

    const exists = await prisma.organization.findUnique({ where: { slug } });
    if (exists) {
      return res.status(409).json({ success: false, error: 'An organization with a similar name already exists.' });
    }

    const org = await prisma.organization.create({
      data: {
        name, slug, description,
        type: type || 'ngo',
        email, phone, website, address, region,
        coordinates: coordinates || [0, 0],
        createdById: user.id,
      },
    });

    await prisma.user.update({
      where: { id: user.id },
      data: { organizationId: org.id, role: 'ngo_admin' },
    });

    res.status(201).json({ success: true, data: { ...org, _id: org.id } });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/organizations
router.get('/', async (req: Request, res: Response) => {
  try {
    const { region, type, search, page = '1', limit = '12' } = req.query as Record<string, string | undefined>;
    const where: any = { mode: 'public', isActive: true };

    if (region) where.region = region;
    if (type) where.type = type;
    if (search) where.name = { contains: search as string, mode: 'insensitive' };

    const skip = (Number(page) - 1) * Number(limit);
    const [orgs, total] = await Promise.all([
      prisma.organization.findMany({
        where,
        orderBy: { trustScore: 'desc' },
        skip,
        take: Number(limit),
      }),
      prisma.organization.count({ where }),
    ]);

    res.json({
      success: true,
      data: {
        organizations: orgs.map((o: any) => ({ ...o, _id: o.id })),
        total,
        page: Number(page),
        totalPages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/organizations/:id
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const org = await prisma.organization.findUnique({
      where: { id: req.params.id },
      include: { createdBy: { select: { id: true, name: true, email: true } } },
    });
    if (!org) return res.status(404).json({ success: false, error: 'Organization not found' });
    res.json({ success: true, data: { ...org, _id: org.id } });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// PATCH /api/organizations/:id
router.patch('/:id', authMiddleware, async (req: Request, res: Response) => {
  try {
    const org = await prisma.organization.findUnique({ where: { id: req.params.id } });
    if (!org) return res.status(404).json({ success: false, error: 'Organization not found' });

    const user = (req as any).user;
    if (org.createdById !== user.id && user.role !== 'platform_admin') {
      return res.status(403).json({ success: false, error: 'Not authorized' });
    }

    const allowed = ['name', 'description', 'mode', 'email', 'phone', 'website', 'address', 'region'];
    const data: any = {};
    allowed.forEach((key) => { if (req.body[key] !== undefined) data[key] = req.body[key]; });

    const updated = await prisma.organization.update({ where: { id: req.params.id }, data });
    res.json({ success: true, data: { ...updated, _id: updated.id } });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/organizations/:id/publish
router.post('/:id/publish', authMiddleware, async (req: Request, res: Response) => {
  try {
    const org = await prisma.organization.findUnique({ where: { id: req.params.id } });
    if (!org) return res.status(404).json({ success: false, error: 'Organization not found' });

    const updated = await prisma.organization.update({
      where: { id: req.params.id },
      data: { mode: org.mode === 'private' ? 'public' : 'private' },
    });
    res.json({ success: true, data: { mode: updated.mode } });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/organizations/:id/members
router.get('/:id/members', authMiddleware, async (req: Request, res: Response) => {
  try {
    const members = await prisma.user.findMany({
      where: { organizationId: req.params.id },
      select: { id: true, name: true, email: true, role: true, avatar: true, reputationScore: true, badges: true, points: true },
    });
    res.json({ success: true, data: members.map((m) => ({ ...m, _id: m.id })) });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/organizations/:id/invite
router.post('/:id/invite', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { email, role } = req.body;
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(404).json({ success: false, error: 'User not found. They must register first.' });

    const updated = await prisma.user.update({
      where: { id: user.id },
      data: { organizationId: req.params.id, role: role || 'ngo_staff' },
    });

    res.json({ success: true, data: { message: `${updated.name} added to organization as ${updated.role}` } });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;

