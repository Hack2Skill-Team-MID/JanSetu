import { Router, Response } from 'express';
import { SurveyUpload } from '../models/SurveyUpload';
import { CommunityNeed } from '../models/CommunityNeed';
import { protect, authorize, AuthRequest } from '../middleware/auth';
import { aiBridgeService } from '../services/ai-bridge.service';

const router = Router();

// @route   POST /api/surveys/upload
// @desc    Upload a survey file for AI processing
// @access  Private (NGO Coordinator)
router.post(
  '/upload',
  protect,
  authorize('ngo_coordinator', 'admin'),
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { fileUrl, fileType, originalFileName } = req.body;

      if (!fileUrl || !fileType) {
        res.status(400).json({
          success: false,
          error: 'Please provide fileUrl and fileType',
        });
        return;
      }

      // Create survey record
      const survey = await SurveyUpload.create({
        ngoId: req.user!._id,
        fileUrl,
        fileType,
        originalFileName: originalFileName || 'unnamed-survey',
        status: 'processing',
      });

      // Process with AI (async — don't await)
      aiBridgeService
        .processSurvey(fileUrl, fileType)
        .then(async (result) => {
          survey.processedData = result;
          survey.status = 'completed';
          await survey.save();

          // Auto-create community needs from processed data
          if (result.extractedNeeds && result.extractedNeeds.length > 0) {
            const needsToCreate = result.extractedNeeds.map((need: any) => ({
              ngoId: req.user!._id,
              title: need.title,
              description: need.description,
              category: need.category || 'other',
              urgencyLevel: need.urgency || 'medium',
              location: need.location || 'Unknown',
              coordinates: [0, 0],
              region: need.location || 'Unknown',
              sourceType: 'survey_upload',
              rawSource: `Processed from survey: ${survey._id}`,
            }));

            await CommunityNeed.insertMany(needsToCreate);
          }
        })
        .catch(async (error) => {
          survey.status = 'failed';
          survey.errorMessage = error.message;
          await survey.save();
        });

      res.status(202).json({
        success: true,
        message: 'Survey uploaded and processing started',
        data: survey,
      });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  }
);

// @route   GET /api/surveys/:id/status
// @desc    Check survey processing status
// @access  Private
router.get('/:id/status', protect, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const survey = await SurveyUpload.findById(req.params.id).select(
      'status errorMessage uploadedAt'
    );
    if (!survey) {
      res.status(404).json({ success: false, error: 'Survey not found' });
      return;
    }
    res.json({ success: true, data: survey });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// @route   GET /api/surveys/:id/result
// @desc    Get processed survey results
// @access  Private
router.get('/:id/result', protect, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const survey = await SurveyUpload.findById(req.params.id);
    if (!survey) {
      res.status(404).json({ success: false, error: 'Survey not found' });
      return;
    }
    if (survey.status !== 'completed') {
      res.status(400).json({
        success: false,
        error: `Survey is still ${survey.status}`,
      });
      return;
    }
    res.json({ success: true, data: survey.processedData });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
