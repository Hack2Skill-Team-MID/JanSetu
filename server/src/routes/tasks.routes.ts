// @ts-nocheck
import { Router, Response } from 'express';
import prisma from '../config/db';
import { protect, authorize, AuthRequest } from '../middleware/auth';

const router = Router();

// @route   GET /api/tasks
router.get('/', protect, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { status, page = '1', limit = '20', sort = '-createdAt' } = req.query as Record<string, string | undefined>;

    const where: any = {};
    if (status) where.status = status as string;

    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);
    const skip = (pageNum - 1) * limitNum;

    const sortField = (sort as string).replace(/^-/, '');
    const sortOrder = (sort as string).startsWith('-') ? 'desc' : 'asc';

    const [tasks, total] = await Promise.all([
      prisma.task.findMany({
        where,
        orderBy: { [sortField]: sortOrder },
        skip,
        take: limitNum,
        include: {
          need: { select: { id: true, title: true, category: true, urgencyLevel: true } },
          createdBy: { select: { id: true, name: true, email: true } },
          applications: true,
        },
      }),
      prisma.task.count({ where }),
    ]);

    const mapped = tasks.map((t: any) => ({
      ...t,
      _id: t.id,
      needId: t.need ? { ...t.need, _id: t.need.id } : t.needId,
      createdBy: t.createdBy ? { ...t.createdBy, _id: t.createdBy.id } : t.createdById,
    }));

    res.json({
      success: true,
      data: mapped,
      pagination: { page: pageNum, limit: limitNum, total, totalPages: Math.ceil(total / limitNum) },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// @route   GET /api/tasks/:id
router.get('/:id', protect, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const task = await prisma.task.findUnique({
      where: { id: req.params.id },
      include: {
        need: { select: { id: true, title: true, category: true, urgencyLevel: true } },
        createdBy: { select: { id: true, name: true, email: true } },
        applications: true,
      },
    });

    if (!task) {
      res.status(404).json({ success: false, error: 'Task not found' });
      return;
    }
    res.json({ success: true, data: { ...task, _id: task.id } });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// @route   POST /api/tasks
router.post(
  '/',
  protect,
  authorize('ngo_coordinator', 'admin'),
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const task = await prisma.task.create({
        data: {
          ...req.body,
          createdById: req.user!.id,
          coordinates: req.body.coordinates || [0, 0],
          requiredSkills: req.body.requiredSkills || [],
        },
      });
      res.status(201).json({ success: true, data: { ...task, _id: task.id } });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  }
);

// @route   POST /api/tasks/:id/apply
router.post(
  '/:id/apply',
  protect,
  authorize('volunteer'),
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const task = await prisma.task.findUnique({
        where: { id: req.params.id },
        include: { applications: true },
      }) as any;
      if (!task) {
        res.status(404).json({ success: false, error: 'Task not found' });
        return;
      }

      if (task.status !== 'open') {
        res.status(400).json({ success: false, error: 'This task is no longer accepting applications' });
        return;
      }

      // Check if already applied
      const alreadyApplied = task.applications.some(
        (app) => app.volunteerId === req.user!.id
      );
      if (alreadyApplied) {
        res.status(400).json({ success: false, error: 'You have already applied to this task' });
        return;
      }

      // Add application
      await prisma.taskApplication.create({
        data: {
          taskId: task.id,
          volunteerId: req.user!.id,
          volunteerName: req.user!.name,
          matchScore: req.body.matchScore || 0,
          matchReasons: req.body.matchReasons || [],
          status: 'pending',
        },
      });

      const updated = await prisma.task.findUnique({
        where: { id: task.id },
        include: { applications: true },
      }) as any;

      res.status(201).json({ success: true, data: { ...updated, _id: updated!.id } });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  }
);

// @route   PATCH /api/tasks/:id/applications/:appId
router.patch(
  '/:id/applications/:appId',
  protect,
  authorize('ngo_coordinator', 'admin'),
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { status } = req.body;

      const application = await prisma.taskApplication.findUnique({
        where: { id: req.params.appId },
      });

      if (!application || application.taskId !== req.params.id) {
        res.status(404).json({ success: false, error: 'Application not found' });
        return;
      }

      await prisma.taskApplication.update({
        where: { id: req.params.appId },
        data: { status },
      });

      if (status === 'accepted') {
        const task = await prisma.task.update({
          where: { id: req.params.id },
          data: { volunteersAssigned: { increment: 1 } },
        });

        if (task.volunteersAssigned >= task.volunteersNeeded) {
          await prisma.task.update({
            where: { id: req.params.id },
            data: { status: 'in_progress' },
          });
        }
      }

      const updated = await prisma.task.findUnique({
        where: { id: req.params.id },
        include: { applications: true },
      }) as any;

      res.json({ success: true, data: { ...updated, _id: updated!.id } });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  }
);

export default router;

