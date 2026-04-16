// @ts-nocheck
import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import { authMiddleware } from '../middleware/authMiddleware';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter } as any);
const router = Router();

// Helper — create a notification
export async function createNotification(
  userId: string,
  type: string,
  title: string,
  body: string,
  data?: Record<string, any>
) {
  try {
    return await prisma.notification.create({
      data: { userId, type, title, body, data: data || {} },
    });
  } catch (err) {
    console.error('Notification create error:', err);
  }
}

// GET /api/notifications — get my notifications
router.get('/', authMiddleware, async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const page = parseInt((req.query.page as string) || '1');
    const limit = parseInt((req.query.limit as string) || '20');

    const [notifications, total, unreadCount] = await Promise.all([
      prisma.notification.findMany({
        where: { userId: user.id },
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: (page - 1) * limit,
      }),
      prisma.notification.count({ where: { userId: user.id } }),
      prisma.notification.count({ where: { userId: user.id, isRead: false } }),
    ]);

    res.json({ success: true, data: { notifications, total, unreadCount, page, limit } });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// PATCH /api/notifications/:id/read — mark one as read
router.patch('/:id/read', authMiddleware, async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    await prisma.notification.updateMany({
      where: { id: req.params.id, userId: user.id },
      data: { isRead: true },
    });
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// PATCH /api/notifications/read-all — mark all as read
router.patch('/read-all', authMiddleware, async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    await prisma.notification.updateMany({
      where: { userId: user.id, isRead: false },
      data: { isRead: true },
    });
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// DELETE /api/notifications/:id — delete one
router.delete('/:id', authMiddleware, async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    await prisma.notification.deleteMany({ where: { id: req.params.id, userId: user.id } });
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
