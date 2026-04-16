// @ts-nocheck
import { Router, Response } from 'express';
import prisma from '../config/db';
import { protect, authorize, AuthRequest } from '../middleware/auth';
import { aiBridgeService } from '../services/ai-bridge.service';

const router = Router();

// @route   GET /api/volunteers/me
router.get('/me', protect, authorize('volunteer'), async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const profile = await prisma.volunteerProfile.findUnique({
      where: { userId: req.user!.id },
      include: { user: { select: { id: true, name: true, email: true, avatar: true } } },
    });

    if (!profile) {
      res.status(404).json({ success: false, error: 'Profile not found' });
      return;
    }

    res.json({ success: true, data: { ...profile, _id: profile.id, userId: { ...profile.user, _id: profile.user.id } } });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// @route   PUT /api/volunteers/me
router.put('/me', protect, authorize('volunteer'), async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { skills, location, coordinates, availability, bio } = req.body;

    const profile = await prisma.volunteerProfile.update({
      where: { userId: req.user!.id },
      data: { skills, location, coordinates, availability, bio },
    });

    if (!profile) {
      res.status(404).json({ success: false, error: 'Profile not found' });
      return;
    }

    res.json({ success: true, data: { ...profile, _id: profile.id } });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// @route   GET /api/volunteers/matches
router.get('/matches', protect, authorize('volunteer'), async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const profile = await prisma.volunteerProfile.findUnique({ where: { userId: req.user!.id } });
    if (!profile) {
      res.status(404).json({ success: false, error: 'Volunteer profile not found' });
      return;
    }

    const openTasks = await prisma.task.findMany({
      where: { status: 'open' },
      include: { need: { select: { id: true, title: true, category: true, urgencyLevel: true } } },
      take: 20,
    });

    if (openTasks.length === 0) {
      res.json({ success: true, data: [], message: 'No open tasks available' });
      return;
    }

    const aiHealthy = await aiBridgeService.isHealthy();

    if (aiHealthy) {
      const matchedTasks = [];
      for (const task of openTasks) {
        const result = await aiBridgeService.matchVolunteers(
          {
            title: task.title,
            description: task.description,
            required_skills: task.requiredSkills,
            location: task.location,
            coordinates: task.coordinates as [number, number],
          },
          [{
            id: profile.id,
            name: req.user!.name,
            skills: profile.skills,
            location: profile.location,
            coordinates: profile.coordinates as [number, number],
            availability: profile.availability,
          }]
        );

        if (result.matches.length > 0) {
          matchedTasks.push({
            task: { ...task, _id: task.id },
            matchScore: result.matches[0].score,
            matchReasons: result.matches[0].reasons,
          });
        }
      }
      matchedTasks.sort((a, b) => b.matchScore - a.matchScore);
      res.json({ success: true, data: matchedTasks });
    } else {
      const matchedTasks = openTasks
        .map((task) => {
          const skillOverlap = task.requiredSkills.filter((s) => profile.skills.includes(s)).length;
          const score = task.requiredSkills.length > 0
            ? Math.round((skillOverlap / task.requiredSkills.length) * 100)
            : 50;
          return {
            task: { ...task, _id: task.id },
            matchScore: score,
            matchReasons: skillOverlap > 0 ? [`${skillOverlap} matching skill(s)`] : ['General availability match'],
          };
        })
        .sort((a, b) => b.matchScore - a.matchScore);

      res.json({ success: true, data: matchedTasks });
    }
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// @route   GET /api/volunteers
router.get(
  '/',
  protect,
  authorize('ngo_coordinator', 'admin'),
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { skills, location, availability } = req.query;

      const where: any = { isActive: true };
      if (skills) {
        where.skills = { hasSome: (skills as string).split(',') };
      }
      if (location) where.location = { contains: location as string, mode: 'insensitive' };
      if (availability) where.availability = availability;

      const volunteers = await prisma.volunteerProfile.findMany({
        where,
        include: { user: { select: { id: true, name: true, email: true, avatar: true } } },
        orderBy: { impactScore: 'desc' },
      });

      const mapped = volunteers.map((v: any) => ({
        ...v,
        _id: v.id,
        userId: { ...v.user, _id: v.user.id },
      }));

      res.json({ success: true, data: mapped });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  }
);

// POST /api/volunteers/ai-match — find tasks matching volunteer's skills
router.post('/ai-match', protect, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { skills = [], location = '', availability = 'flexible' } = req.body;

    // Fetch open tasks
    const tasks = await prisma.task.findMany({
      where: { status: 'open' },
      take: 50,
      orderBy: { createdAt: 'desc' },
    });

    // Score each task by skill match
    const scored = tasks
      .map((task: any) => {
        const taskSkills: string[] = task.requiredSkills || [];
        const matchedSkills = skills.filter((s: string) =>
          taskSkills.some((ts: string) => ts.toLowerCase().includes(s.toLowerCase()) || s.toLowerCase().includes(ts.toLowerCase()))
        );
        const skillScore = taskSkills.length > 0
          ? Math.round((matchedSkills.length / Math.max(taskSkills.length, skills.length)) * 60)
          : 30;
        const locationScore = location && task.location?.toLowerCase().includes(location.split(',')[0].toLowerCase()) ? 30 : 10;
        const availScore = 10;
        const matchScore = Math.min(skillScore + locationScore + availScore, 99);
        return { ...task, _id: task.id, matchScore, matchedSkills };
      })
      .filter((t: any) => t.matchScore >= 30)
      .sort((a: any, b: any) => b.matchScore - a.matchScore)
      .slice(0, 10);

    res.json({ success: true, data: { matches: scored, total: scored.length } });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;

