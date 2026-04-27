// @ts-nocheck
import { Router, Response } from 'express';
import prisma from '../config/db';
import { protect, authorize, AuthRequest } from '../middleware/auth';

const router = Router();

// ─────────────────────────────────────────────────────────────
// GET /api/surveys  — list all published surveys (any auth user)
// ─────────────────────────────────────────────────────────────
router.get('/', protect, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { status, category, page = '1', limit = '20' } = req.query as Record<string, string>;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const where: any = {};
    // Non-admins only see published surveys
    if (req.user!.role !== 'admin' && req.user!.role !== 'ngo_coordinator' && req.user!.role !== 'platform_admin') {
      where.status = 'published';
    } else if (status) {
      where.status = status;
    }
    if (category) where.category = category;

    const [surveys, total] = await Promise.all([
      prisma.survey.findMany({
        where,
        skip,
        take: parseInt(limit),
        orderBy: { createdAt: 'desc' },
        include: {
          createdBy: { select: { id: true, name: true, role: true } },
          _count: { select: { questions: true, responses: true } },
        },
      }),
      prisma.survey.count({ where }),
    ]);

    // Attach hasResponded flag for current user
    const respondedIds = new Set(
      (await prisma.surveyResponse.findMany({
        where: { respondentId: req.user!.id, surveyId: { in: surveys.map((s) => s.id) } },
        select: { surveyId: true },
      })).map((r) => r.surveyId)
    );

    const enriched = surveys.map((s) => ({ ...s, hasResponded: respondedIds.has(s.id) }));

    res.json({ success: true, data: enriched, total, page: parseInt(page), pages: Math.ceil(total / parseInt(limit)) });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ─────────────────────────────────────────────────────────────
// POST /api/surveys  — create survey (NGO / admin only)
// ─────────────────────────────────────────────────────────────
router.post(
  '/',
  protect,
  authorize('ngo_coordinator', 'admin', 'platform_admin'),
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { title, description, coverEmoji, category, status, targetAudience, isAnonymous, deadline, questions } = req.body;

      if (!title || !description) {
        res.status(400).json({ success: false, error: 'Title and description are required' });
        return;
      }
      if (!questions || !Array.isArray(questions) || questions.length === 0) {
        res.status(400).json({ success: false, error: 'At least one question is required' });
        return;
      }

      const survey = await prisma.survey.create({
        data: {
          createdById: req.user!.id,
          title,
          description,
          coverEmoji: coverEmoji || '📋',
          category: category || 'general',
          status: status || 'draft',
          targetAudience: targetAudience || 'all',
          isAnonymous: isAnonymous || false,
          deadline: deadline ? new Date(deadline) : null,
          questions: {
            create: questions.map((q: any, idx: number) => ({
              order: idx + 1,
              questionText: q.questionText,
              questionType: q.questionType || 'text',
              options: q.options || [],
              isRequired: q.isRequired !== undefined ? q.isRequired : true,
              helperText: q.helperText || null,
            })),
          },
        },
        include: {
          questions: { orderBy: { order: 'asc' } },
          _count: { select: { responses: true } },
        },
      });

      res.status(201).json({ success: true, data: survey });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  }
);

// ─────────────────────────────────────────────────────────────
// GET /api/surveys/my-responses  — surveys I've taken
// ─────────────────────────────────────────────────────────────
router.get('/my-responses', protect, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const responses = await prisma.surveyResponse.findMany({
      where: { respondentId: req.user!.id },
      orderBy: { submittedAt: 'desc' },
      include: {
        survey: {
          select: { id: true, title: true, coverEmoji: true, category: true, status: true },
        },
      },
    });
    res.json({ success: true, data: responses });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ─────────────────────────────────────────────────────────────
// GET /api/surveys/:id  — get single survey with questions
// ─────────────────────────────────────────────────────────────
router.get('/:id', protect, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const survey = await prisma.survey.findUnique({
      where: { id: req.params.id },
      include: {
        questions: { orderBy: { order: 'asc' } },
        createdBy: { select: { id: true, name: true, role: true } },
        _count: { select: { responses: true } },
      },
    });
    if (!survey) {
      res.status(404).json({ success: false, error: 'Survey not found' });
      return;
    }

    // Check if current user has already responded
    const existingResponse = await prisma.surveyResponse.findUnique({
      where: { surveyId_respondentId: { surveyId: survey.id, respondentId: req.user!.id } },
    });

    res.json({ success: true, data: { ...survey, hasResponded: !!existingResponse } });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ─────────────────────────────────────────────────────────────
// PUT /api/surveys/:id  — update survey (creator / admin)
// ─────────────────────────────────────────────────────────────
router.put('/:id', protect, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const survey = await prisma.survey.findUnique({ where: { id: req.params.id } });
    if (!survey) { res.status(404).json({ success: false, error: 'Survey not found' }); return; }
    if (survey.createdById !== req.user!.id && req.user!.role !== 'admin' && req.user!.role !== 'platform_admin') {
      res.status(403).json({ success: false, error: 'Not authorised' }); return;
    }

    const { title, description, coverEmoji, category, status, targetAudience, isAnonymous, deadline } = req.body;
    const updated = await prisma.survey.update({
      where: { id: req.params.id },
      data: {
        ...(title && { title }),
        ...(description && { description }),
        ...(coverEmoji && { coverEmoji }),
        ...(category && { category }),
        ...(status && { status }),
        ...(targetAudience && { targetAudience }),
        ...(isAnonymous !== undefined && { isAnonymous }),
        ...(deadline !== undefined && { deadline: deadline ? new Date(deadline) : null }),
      },
    });
    res.json({ success: true, data: updated });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ─────────────────────────────────────────────────────────────
// DELETE /api/surveys/:id
// ─────────────────────────────────────────────────────────────
router.delete('/:id', protect, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const survey = await prisma.survey.findUnique({ where: { id: req.params.id } });
    if (!survey) { res.status(404).json({ success: false, error: 'Survey not found' }); return; }
    if (survey.createdById !== req.user!.id && req.user!.role !== 'admin' && req.user!.role !== 'platform_admin') {
      res.status(403).json({ success: false, error: 'Not authorised' }); return;
    }
    await prisma.survey.delete({ where: { id: req.params.id } });
    res.json({ success: true, message: 'Survey deleted' });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ─────────────────────────────────────────────────────────────
// POST /api/surveys/:id/responses  — submit response
// ─────────────────────────────────────────────────────────────
router.post('/:id/responses', protect, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const survey = await prisma.survey.findUnique({
      where: { id: req.params.id },
      include: { questions: true },
    });
    if (!survey) { res.status(404).json({ success: false, error: 'Survey not found' }); return; }
    if (survey.status !== 'published') { res.status(400).json({ success: false, error: 'This survey is not accepting responses' }); return; }

    const { answers } = req.body; // { [questionId]: value }
    if (!answers || typeof answers !== 'object') {
      res.status(400).json({ success: false, error: 'Answers object is required' }); return;
    }

    // Validate required questions answered
    const requiredQuestions = survey.questions.filter((q) => q.isRequired);
    for (const q of requiredQuestions) {
      if (answers[q.id] === undefined || answers[q.id] === '' || answers[q.id] === null) {
        res.status(400).json({ success: false, error: `Question "${q.questionText}" is required` });
        return;
      }
    }

    const response = await prisma.surveyResponse.create({
      data: {
        surveyId: req.params.id,
        respondentId: req.user!.id,
        answers: answers as any,
      },
    });
    res.status(201).json({ success: true, data: response, message: 'Thank you for your response!' });
  } catch (error: any) {
    if (error.code === 'P2002') {
      res.status(400).json({ success: false, error: 'You have already submitted a response to this survey' });
      return;
    }
    res.status(500).json({ success: false, error: error.message });
  }
});

// ─────────────────────────────────────────────────────────────
// GET /api/surveys/:id/responses  — view responses (NGO/admin)
// ─────────────────────────────────────────────────────────────
router.get(
  '/:id/responses',
  protect,
  authorize('ngo_coordinator', 'admin', 'platform_admin'),
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const survey = await prisma.survey.findUnique({
        where: { id: req.params.id },
        include: { questions: { orderBy: { order: 'asc' } } },
      });
      if (!survey) { res.status(404).json({ success: false, error: 'Survey not found' }); return; }

      const responses = await prisma.surveyResponse.findMany({
        where: { surveyId: req.params.id },
        orderBy: { submittedAt: 'desc' },
        include: {
          respondent: { select: { id: true, name: true, email: true, role: true } },
        },
      });

      // Build aggregated stats per question
      const stats: Record<string, any> = {};
      for (const q of survey.questions) {
        stats[q.id] = { questionText: q.questionText, questionType: q.questionType, answers: [], tally: {} };
      }
      for (const r of responses) {
        const answers = r.answers as Record<string, any>;
        for (const [qId, ans] of Object.entries(answers)) {
          if (!stats[qId]) continue;
          if (Array.isArray(ans)) {
            for (const a of ans) {
              stats[qId].tally[a] = (stats[qId].tally[a] || 0) + 1;
              stats[qId].answers.push(a);
            }
          } else {
            stats[qId].tally[String(ans)] = (stats[qId].tally[String(ans)] || 0) + 1;
            stats[qId].answers.push(ans);
          }
        }
      }

      res.json({ success: true, data: { survey, responses, stats, totalResponses: responses.length } });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  }
);

export default router;
