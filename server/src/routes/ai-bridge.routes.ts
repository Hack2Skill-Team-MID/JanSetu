import { Router, Request, Response } from 'express';
import { protect } from '../middleware/auth';
import { aiBridgeService } from '../services/ai-bridge.service';

const router = Router();

/**
 * POST /api/ai-bridge/chatbot
 * AI chatbot — proxy to Python AI service
 */
router.post('/chatbot', protect, async (req: Request, res: Response) => {
  try {
    const { message, context, role } = req.body;
    const result = await aiBridgeService.chatbot(message, context || '', role || 'volunteer');
    res.json({ success: true, data: result });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * POST /api/ai-bridge/impact-report
 * Generate AI impact report for a campaign
 */
router.post('/impact-report', protect, async (req: Request, res: Response) => {
  try {
    const result = await aiBridgeService.generateImpactReport(req.body);
    res.json({ success: true, data: result });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * POST /api/ai-bridge/detect-fraud
 * AI fraud detection for campaigns
 */
router.post('/detect-fraud', protect, async (req: Request, res: Response) => {
  try {
    const result = await aiBridgeService.detectFraud(req.body);
    res.json({ success: true, data: result });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
