import { Router, Request, Response } from 'express';
import Message from '../models/Message';
import { User } from '../models/User';
import { protect as authMiddleware } from '../middleware/auth';

const router = Router();

// ─────────────────────────────────────────
// POST /api/messages/send — Send message
// ─────────────────────────────────────────
router.post('/send', authMiddleware, async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const { recipientId, content, type, priority } = req.body;

    // Create conversation ID (sorted pair for direct messages)
    let conversationId: string;
    if (type === 'broadcast') {
      conversationId = `broadcast_${user.organizationId}_${Date.now()}`;
    } else {
      const ids = [user._id.toString(), recipientId].sort();
      conversationId = `dm_${ids[0]}_${ids[1]}`;
    }

    const message = await Message.create({
      conversationId,
      senderId: user._id,
      recipientId,
      organizationId: user.organizationId,
      type: type || 'direct',
      content,
      priority: priority || 'normal',
      readBy: [user._id],
    });

    res.status(201).json({ success: true, data: message });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ─────────────────────────────────────────
// GET /api/messages/conversations — List all conversations
// ─────────────────────────────────────────
router.get('/conversations', authMiddleware, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user._id;

    // Get unique conversations this user is part of
    const messages = await Message.aggregate([
      {
        $match: {
          $or: [{ senderId: userId }, { recipientId: userId }],
        },
      },
      { $sort: { createdAt: -1 } },
      {
        $group: {
          _id: '$conversationId',
          lastMessage: { $first: '$content' },
          lastAt: { $first: '$createdAt' },
          type: { $first: '$type' },
          senderId: { $first: '$senderId' },
          recipientId: { $first: '$recipientId' },
          unread: {
            $sum: {
              $cond: [{ $not: { $in: [userId, '$readBy'] } }, 1, 0],
            },
          },
        },
      },
      { $sort: { lastAt: -1 } },
      { $limit: 30 },
    ]);

    res.json({ success: true, data: messages });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ─────────────────────────────────────────
// GET /api/messages/:conversationId — Get messages in conversation
// ─────────────────────────────────────────
router.get('/:conversationId', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { page = '1', limit = '50' } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const messages = await Message.find({ conversationId: req.params.conversationId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit))
      .populate('senderId', 'name avatar');

    // Mark as read
    const userId = (req as any).user._id;
    await Message.updateMany(
      { conversationId: req.params.conversationId, readBy: { $ne: userId } },
      { $addToSet: { readBy: userId } }
    );

    res.json({ success: true, data: messages.reverse() });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ─────────────────────────────────────────
// POST /api/messages/broadcast — Org-wide broadcast
// ─────────────────────────────────────────
router.post('/broadcast', authMiddleware, async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    if (!['ngo_admin', 'ngo_coordinator', 'platform_admin', 'admin'].includes(user.role)) {
      return res.status(403).json({ success: false, error: 'Only admins can broadcast' });
    }

    const { content, priority } = req.body;
    const message = await Message.create({
      conversationId: `broadcast_${user.organizationId}_${Date.now()}`,
      senderId: user._id,
      organizationId: user.organizationId,
      type: 'broadcast',
      content,
      priority: priority || 'normal',
      readBy: [user._id],
    });

    res.status(201).json({ success: true, data: message });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
