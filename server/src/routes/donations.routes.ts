// @ts-nocheck
import { Router, Request, Response } from 'express';
import prisma from '../config/db';
import { protect as authMiddleware, AuthRequest } from '../middleware/auth';
import { createAuditEntry } from '../middleware/audit';
import crypto from 'crypto';

const router = Router();

// POST /api/donations/initiate
router.post('/initiate', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { amount, campaignId, organizationId, needId, type, message, isAnonymous } = req.body;
    const user = (req as any).user;

    if (!amount || amount < 1) {
      return res.status(400).json({ success: false, error: 'Amount must be at least ₹1' });
    }

    const mockOrderId = `order_${crypto.randomBytes(12).toString('hex')}`;

    const donation = await prisma.donation.create({
      data: {
        donorId: user.id,
        organizationId,
        campaignId,
        needId,
        amount,
        type: type || 'one_time',
        razorpayOrderId: mockOrderId,
        paymentStatus: 'pending',
        isAnonymous: isAnonymous || false,
        message,
      },
    });

    res.status(201).json({
      success: true,
      data: {
        donationId: donation.id,
        razorpayOrderId: mockOrderId,
        amount,
        currency: 'INR',
        razorpayKeyId: process.env.RAZORPAY_KEY_ID || 'rzp_test_demo',
      },
    });

    await createAuditEntry({
      action: 'donation', entity: 'donation', entityId: donation.id,
      description: `Donation initiated: ₹${amount}${campaignId ? ' for campaign' : ''}`,
      after: { amount, type: type || 'one_time', isAnonymous },
      req: req as AuthRequest,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/donations/verify
router.post('/verify', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { razorpayPaymentId, razorpaySignature, donationId } = req.body;

    const donation = await prisma.donation.findUnique({ where: { id: donationId } });
    if (!donation) return res.status(404).json({ success: false, error: 'Donation not found' });

    const updated = await prisma.donation.update({
      where: { id: donationId },
      data: {
        paymentStatus: 'completed',
        razorpayPaymentId: razorpayPaymentId || `pay_${crypto.randomBytes(12).toString('hex')}`,
        razorpaySignature: razorpaySignature || 'simulated',
      },
    });

    // Update campaign funding
    if (donation.campaignId) {
      await prisma.campaign.update({
        where: { id: donation.campaignId },
        data: { goalsFundingRaised: { increment: donation.amount } },
      });
    }

    // Update organization stats
    if (donation.organizationId) {
      await prisma.organization.update({
        where: { id: donation.organizationId },
        data: { statsTotalDonationsReceived: { increment: donation.amount } },
      });
    }

    res.json({ success: true, data: { message: 'Payment verified successfully', donation: { ...updated, _id: updated.id } } });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/donations/my
router.get('/my', authMiddleware, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const donations = await prisma.donation.findMany({
      where: { donorId: userId, paymentStatus: 'completed' },
      orderBy: { createdAt: 'desc' },
      include: {
        campaign: { select: { id: true, title: true, category: true } },
        organization: { select: { id: true, name: true, slug: true } },
      },
    });

    const total = donations.reduce((sum, d) => sum + d.amount, 0);
    const mapped = donations.map((d: any) => ({
      ...d, _id: d.id,
      campaignId: d.campaign ? { ...d.campaign, _id: d.campaign.id } : d.campaignId,
      organizationId: d.organization ? { ...d.organization, _id: d.organization.id } : d.organizationId,
    }));

    res.json({ success: true, data: { donations: mapped, totalDonated: total, count: donations.length } });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/donations/campaign/:id
router.get('/campaign/:id', async (req: Request, res: Response) => {
  try {
    const donations = await prisma.donation.findMany({
      where: { campaignId: req.params.id, paymentStatus: 'completed' },
      orderBy: { createdAt: 'desc' },
      include: { donor: { select: { id: true, name: true, avatar: true } } },
    });

    const sanitized = donations.map((d: any) => ({
      amount: d.amount,
      message: d.message,
      createdAt: d.createdAt,
      donor: d.isAnonymous ? { name: 'Anonymous Supporter' } : d.donor,
    }));

    const total = donations.reduce((sum, d) => sum + d.amount, 0);
    res.json({ success: true, data: { donations: sanitized, totalRaised: total } });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/donations/impact/:userId
router.get('/impact/:userId', async (req: Request, res: Response) => {
  try {
    const donations = await prisma.donation.findMany({
      where: { donorId: req.params.userId, paymentStatus: 'completed' },
      include: {
        campaign: { select: { id: true, title: true, category: true } },
        organization: { select: { id: true, name: true } },
      },
    });

    const totalDonated = donations.reduce((sum, d) => sum + d.amount, 0);
    const uniqueOrgs = new Set(donations.filter(d => d.organizationId).map(d => d.organizationId!)).size;
    const uniqueCampaigns = new Set(donations.filter(d => d.campaignId).map(d => d.campaignId!)).size;

    res.json({
      success: true,
      data: {
        totalDonated,
        donationCount: donations.length,
        organizationsSupported: uniqueOrgs,
        campaignsSupported: uniqueCampaigns,
        donations: donations.map((d: any) => ({ ...d, _id: d.id })),
      },
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;

