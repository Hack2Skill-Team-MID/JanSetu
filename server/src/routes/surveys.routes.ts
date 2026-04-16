// @ts-nocheck
import { Router, Response } from 'express';
import prisma from '../config/db';
import { protect, authorize, AuthRequest } from '../middleware/auth';
import { aiBridgeService } from '../services/ai-bridge.service';

const router = Router();

// @route   POST /api/surveys/upload
router.post(
  '/upload',
  protect,
  authorize('ngo_coordinator', 'admin'),
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { fileUrl, fileType, originalFileName } = req.body;

      if (!fileUrl || !fileType) {
        res.status(400).json({ success: false, error: 'Please provide fileUrl and fileType' });
        return;
      }

      const survey = await prisma.surveyUpload.create({
        data: {
          ngoId: req.user!.id,
          fileUrl,
          fileType,
          originalFileName: originalFileName || 'unnamed-survey',
          status: 'processing',
        },
      });

      // Process with AI (async)
      aiBridgeService
        .processSurvey(fileUrl, fileType)
        .then(async (result) => {
          await prisma.surveyUpload.update({
            where: { id: survey.id },
            data: { processedData: result as any, status: 'completed' },
          });

          if (result.extractedNeeds && result.extractedNeeds.length > 0) {
            const needsToCreate = result.extractedNeeds.map((need: any) => ({
              ngoId: req.user!.id,
              title: need.title,
              description: need.description,
              category: need.category || 'other',
              urgencyLevel: need.urgency || 'medium',
              location: need.location || 'Unknown',
              coordinates: [0, 0],
              region: need.location || 'Unknown',
              sourceType: 'survey_upload',
              rawSource: `Processed from survey: ${survey.id}`,
            }));

            await prisma.communityNeed.createMany({ data: needsToCreate });
          }
        })
        .catch(async (error) => {
          await prisma.surveyUpload.update({
            where: { id: survey.id },
            data: { status: 'failed', errorMessage: error.message },
          });
        });

      res.status(202).json({ success: true, message: 'Survey uploaded and processing started', data: { ...survey, _id: survey.id } });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  }
);

// @route   GET /api/surveys/:id/status
router.get('/:id/status', protect, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const survey = await prisma.surveyUpload.findUnique({
      where: { id: req.params.id },
      select: { id: true, status: true, errorMessage: true, uploadedAt: true },
    });
    if (!survey) {
      res.status(404).json({ success: false, error: 'Survey not found' });
      return;
    }
    res.json({ success: true, data: { ...survey, _id: survey.id } });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// @route   GET /api/surveys/:id/result
router.get('/:id/result', protect, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const survey = await prisma.surveyUpload.findUnique({ where: { id: req.params.id } });
    if (!survey) {
      res.status(404).json({ success: false, error: 'Survey not found' });
      return;
    }
    if (survey.status !== 'completed') {
      res.status(400).json({ success: false, error: `Survey is still ${survey.status}` });
      return;
    }
    res.json({ success: true, data: survey.processedData });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;

