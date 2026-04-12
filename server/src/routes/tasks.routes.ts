import { Router, Response } from 'express';
import { Task } from '../models/Task';
import { VolunteerProfile } from '../models/VolunteerProfile';
import { protect, authorize, AuthRequest } from '../middleware/auth';

const router = Router();

// @route   GET /api/tasks
// @desc    Get all tasks (with filters)
// @access  Private
router.get('/', protect, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { status, page = '1', limit = '20', sort = '-createdAt' } = req.query;

    const query: any = {};
    if (status) query.status = status;

    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);
    const skip = (pageNum - 1) * limitNum;

    const [tasks, total] = await Promise.all([
      Task.find(query)
        .sort(sort as string)
        .skip(skip)
        .limit(limitNum)
        .populate('needId', 'title category urgencyLevel')
        .populate('createdBy', 'name email'),
      Task.countDocuments(query),
    ]);

    res.json({
      success: true,
      data: tasks,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// @route   GET /api/tasks/:id
// @desc    Get single task with applicants
// @access  Private
router.get('/:id', protect, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const task = await Task.findById(req.params.id)
      .populate('needId', 'title category urgencyLevel')
      .populate('createdBy', 'name email');

    if (!task) {
      res.status(404).json({ success: false, error: 'Task not found' });
      return;
    }
    res.json({ success: true, data: task });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// @route   POST /api/tasks
// @desc    Create a task from a community need
// @access  Private (NGO Coordinator only)
router.post(
  '/',
  protect,
  authorize('ngo_coordinator', 'admin'),
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const task = await Task.create({
        ...req.body,
        createdBy: req.user!._id,
      });
      res.status(201).json({ success: true, data: task });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  }
);

// @route   POST /api/tasks/:id/apply
// @desc    Volunteer applies to a task
// @access  Private (Volunteer only)
router.post(
  '/:id/apply',
  protect,
  authorize('volunteer'),
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const task = await Task.findById(req.params.id);
      if (!task) {
        res.status(404).json({ success: false, error: 'Task not found' });
        return;
      }

      if (task.status !== 'open') {
        res.status(400).json({
          success: false,
          error: 'This task is no longer accepting applications',
        });
        return;
      }

      // Check if already applied
      const alreadyApplied = task.applications.some(
        (app) => app.volunteerId.toString() === req.user!._id.toString()
      );
      if (alreadyApplied) {
        res.status(400).json({
          success: false,
          error: 'You have already applied to this task',
        });
        return;
      }

      // Add application
      task.applications.push({
        volunteerId: req.user!._id,
        volunteerName: req.user!.name,
        matchScore: req.body.matchScore || 0,
        matchReasons: req.body.matchReasons || [],
        status: 'pending',
        appliedAt: new Date(),
      });

      await task.save();

      res.status(201).json({ success: true, data: task });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  }
);

// @route   PATCH /api/tasks/:id/applications/:appId
// @desc    Accept/reject a volunteer application
// @access  Private (NGO Coordinator only)
router.patch(
  '/:id/applications/:appId',
  protect,
  authorize('ngo_coordinator', 'admin'),
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { status } = req.body; // 'accepted' or 'rejected'
      const task = await Task.findById(req.params.id);

      if (!task) {
        res.status(404).json({ success: false, error: 'Task not found' });
        return;
      }

      const application = (task.applications as any).id(req.params.appId);
      if (!application) {
        res.status(404).json({
          success: false,
          error: 'Application not found',
        });
        return;
      }

      application.status = status;

      if (status === 'accepted') {
        task.volunteersAssigned += 1;
        if (task.volunteersAssigned >= task.volunteersNeeded) {
          task.status = 'in_progress';
        }

        // Update volunteer impact
        await VolunteerProfile.findOneAndUpdate(
          { userId: application.volunteerId },
          { $inc: { tasksCompleted: 0 } } // Will increment on completion
        );
      }

      await task.save();
      res.json({ success: true, data: task });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  }
);

export default router;
