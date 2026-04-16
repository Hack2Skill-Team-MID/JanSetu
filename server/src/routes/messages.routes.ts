// @ts-nocheck
import { Router, Request, Response } from 'express';
import prisma from '../config/db';
import { protect as authMiddleware } from '../middleware/auth';

const router = Router();

// POST /api/messages/send
router.post('/send', authMiddleware, async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const { recipientId, content, type, priority } = req.body;

    let conversationId: string;
    if (type === 'broadcast') {
      conversationId = `broadcast_${user.organizationId}_${Date.now()}`;
    } else {
      const ids = [user.id, recipientId].sort();
      conversationId = `dm_${ids[0]}_${ids[1]}`;
    }

    const message = await prisma.message.create({
      data: {
        conversationId,
        senderId: user.id,
        recipientId,
        organizationId: user.organizationId,
        type: type || 'direct',
        content,
        priority: priority || 'normal',
        readBy: [user.id],
      },
    });

    res.status(201).json({ success: true, data: { ...message, _id: message.id } });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/messages/conversations
router.get('/conversations', authMiddleware, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;

    // Get all messages involving this user, group by conversation
    const messages = await prisma.message.findMany({
      where: {
        OR: [{ senderId: userId }, { recipientId: userId }],
      },
      orderBy: { createdAt: 'desc' },
    });

    // Group by conversationId in JS
    const convMap: Record<string, any> = {};
    for (const m of messages) {
      if (!convMap[m.conversationId]) {
        convMap[m.conversationId] = {
          _id: m.conversationId,
          lastMessage: m.content,
          lastAt: m.createdAt,
          type: m.type,
          senderId: m.senderId,
          recipientId: m.recipientId,
          unread: 0,
        };
      }
      if (!m.readBy.includes(userId)) {
        convMap[m.conversationId].unread++;
      }
    }

    const result = Object.values(convMap)
      .sort((a: any, b: any) => new Date(b.lastAt).getTime() - new Date(a.lastAt).getTime())
      .slice(0, 30);

    res.json({ success: true, data: result });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/messages/:conversationId
router.get('/:conversationId', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { page = '1', limit = '50' } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const messages = await prisma.message.findMany({
      where: { conversationId: req.params.conversationId },
      orderBy: { createdAt: 'desc' },
      skip,
      take: Number(limit),
      include: { sender: { select: { id: true, name: true, avatar: true } } },
    });

    // Mark as read
    const userId = (req as any).user.id;
    const unreadIds = messages.filter(m => !m.readBy.includes(userId)).map(m => m.id);
    if (unreadIds.length > 0) {
      for (const msgId of unreadIds) {
        const msg = messages.find(m => m.id === msgId)!;
        await prisma.message.update({
          where: { id: msgId },
          data: { readBy: [...msg.readBy, userId] },
        });
      }
    }

    const mapped = messages.reverse().map((m: any) => ({
      ...m, _id: m.id,
      senderId: m.sender ? { ...m.sender, _id: m.sender.id } : m.senderId,
    }));

    res.json({ success: true, data: mapped });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/messages/broadcast
router.post('/broadcast', authMiddleware, async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    if (!['ngo_admin', 'ngo_coordinator', 'platform_admin', 'admin'].includes(user.role)) {
      return res.status(403).json({ success: false, error: 'Only admins can broadcast' });
    }

    const { content, priority } = req.body;
    const message = await prisma.message.create({
      data: {
        conversationId: `broadcast_${user.organizationId}_${Date.now()}`,
        senderId: user.id,
        organizationId: user.organizationId,
        type: 'broadcast',
        content,
        priority: priority || 'normal',
        readBy: [user.id],
      },
    });

    res.status(201).json({ success: true, data: { ...message, _id: message.id } });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;

