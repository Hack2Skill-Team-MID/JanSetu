import { Router, Response } from 'express';
import { VolunteerProfile } from '../models/VolunteerProfile';
import { Task } from '../models/Task';
import { protect, authorize, AuthRequest } from '../middleware/auth';
import { aiBridgeService } from '../services/ai-bridge.service';

const router = Router();

// @route   GET /api/volunteers/me
// @desc    Get my volunteer profile
// @access  Private (Volunteer)
router.get('/me', protect, authorize('volunteer'), async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const profile = await VolunteerProfile.findOne({
      userId: req.user!._id,
    }).populate('userId', 'name email avatar');

    if (!profile) {
      res.status(404).json({ success: false, error: 'Profile not found' });
      return;
    }

    res.json({ success: true, data: profile });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// @route   PUT /api/volunteers/me
// @desc    Update my volunteer profile
// @access  Private (Volunteer)
router.put('/me', protect, authorize('volunteer'), async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { skills, location, coordinates, availability, bio } = req.body;

    const profile = await VolunteerProfile.findOneAndUpdate(
      { userId: req.user!._id },
      { skills, location, coordinates, availability, bio },
      { new: true, runValidators: true }
    );

    if (!profile) {
      res.status(404).json({ success: false, error: 'Profile not found' });
      return;
    }

    res.json({ success: true, data: profile });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// @route   GET /api/volunteers/matches
// @desc    Get AI-matched tasks for the current volunteer
// @access  Private (Volunteer)
router.get('/matches', protect, authorize('volunteer'), async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    // Get volunteer profile
    const profile = await VolunteerProfile.findOne({ userId: req.user!._id });
    if (!profile) {
      res.status(404).json({ success: false, error: 'Volunteer profile not found' });
      return;
    }

    // Get open tasks
    const openTasks = await Task.find({ status: 'open' })
      .populate('needId', 'title category urgencyLevel')
      .limit(20);

    if (openTasks.length === 0) {
      res.json({ success: true, data: [], message: 'No open tasks available' });
      return;
    }

    // Try AI matching
    const aiHealthy = await aiBridgeService.isHealthy();

    if (aiHealthy) {
      // Use AI service for smart matching
      const taskData = openTasks.map((t) => ({
        title: t.title,
        description: t.description,
        required_skills: t.requiredSkills,
        location: t.location,
        coordinates: t.coordinates,
      }));

      // Match against each task
      const matchedTasks = [];
      for (const task of openTasks) {
        const result = await aiBridgeService.matchVolunteers(
          {
            title: task.title,
            description: task.description,
            required_skills: task.requiredSkills,
            location: task.location,
            coordinates: task.coordinates,
          },
          [
            {
              id: String(profile._id),
              name: req.user!.name,
              skills: profile.skills,
              location: profile.location,
              coordinates: profile.coordinates,
              availability: profile.availability,
            },
          ]
        );

        if (result.matches.length > 0) {
          matchedTasks.push({
            task,
            matchScore: result.matches[0].score,
            matchReasons: result.matches[0].reasons,
          });
        }
      }

      // Sort by match score (best matches first)
      matchedTasks.sort((a, b) => b.matchScore - a.matchScore);

      res.json({ success: true, data: matchedTasks });
    } else {
      // Fallback: basic skill-based matching
      const matchedTasks = openTasks
        .map((task) => {
          const skillOverlap = task.requiredSkills.filter((s) =>
            profile.skills.includes(s)
          ).length;
          const score = task.requiredSkills.length > 0
            ? Math.round((skillOverlap / task.requiredSkills.length) * 100)
            : 50;
          return {
            task,
            matchScore: score,
            matchReasons: skillOverlap > 0
              ? [`${skillOverlap} matching skill(s)`]
              : ['General availability match'],
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
// @desc    Get all volunteers (for matching)
// @access  Private (NGO Coordinator / Admin)
router.get(
  '/',
  protect,
  authorize('ngo_coordinator', 'admin'),
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { skills, location, availability } = req.query;

      const query: any = { isActive: true };
      if (skills) {
        query.skills = {
          $in: (skills as string).split(','),
        };
      }
      if (location) query.location = new RegExp(location as string, 'i');
      if (availability) query.availability = availability;

      const volunteers = await VolunteerProfile.find(query)
        .populate('userId', 'name email avatar')
        .sort('-impactScore');

      res.json({ success: true, data: volunteers });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  }
);

export default router;
