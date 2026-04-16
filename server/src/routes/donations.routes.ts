// @ts-nocheck
import { Router, Request, Response } from 'express';
import prisma from '../config/db';
import { protect as authMiddleware, AuthRequest } from '../middleware/auth';
import { createAuditEntry } from '../middleware/audit';
import crypto from 'crypto';
import Razorpay from 'razorpay';

const router = Router();

// Initialize Razorpay instance
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || '',
  key_secret: process.env.RAZORPAY_KEY_SECRET || '',
});

const isRazorpayConfigured = (): boolean => {
  return !!(process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET);
};

// POST /api/donations/initiate
router.post('/initiate', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { amount, campaignId, organizationId, needId, type, message, isAnonymous } = req.body;
    const user = (req as any).user;

    if (!amount || amount < 1) {
      return res.status(400).json({ success: false, error: 'Amount must be at least ₹1' });
    }

    let razorpayOrderId: string;

    if (isRazorpayConfigured()) {
      // --- Real Razorpay Order ---
      const order = await razorpay.orders.create({
        amount: Math.round(amount * 100), // Razorpay expects paise
        currency: 'INR',
        receipt: `rcpt_${crypto.randomBytes(8).toString('hex')}`,
        notes: {
          campaignId: campaignId || '',
          donorId: user.id,
          donorEmail: user.email,
        },
      });
      razorpayOrderId = order.id;
    } else {
      // --- Demo Mode (no Razorpay keys) ---
      razorpayOrderId = `order_demo_${crypto.randomBytes(12).toString('hex')}`;
    }

    const donation = await prisma.donation.create({
      data: {
        donorId: user.id,
        organizationId,
        campaignId,
        needId,
        amount,
        type: type || 'one_time',
        razorpayOrderId,
        paymentStatus: 'pending',
        isAnonymous: isAnonymous || false,
        message,
      },
    });

    res.status(201).json({
      success: true,
      data: {
        donationId: donation.id,
        razorpayOrderId,
        amount,
        currency: 'INR',
        razorpayKeyId: process.env.RAZORPAY_KEY_ID || 'rzp_test_demo',
        demoMode: !isRazorpayConfigured(),
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
    const { razorpayPaymentId, razorpaySignature, razorpayOrderId, donationId } = req.body;

    const donation = await prisma.donation.findUnique({ where: { id: donationId } });
    if (!donation) return res.status(404).json({ success: false, error: 'Donation not found' });

    let verified = false;

    if (isRazorpayConfigured() && razorpaySignature) {
      // --- Real Razorpay Signature Verification ---
      const body = (razorpayOrderId || donation.razorpayOrderId) + '|' + razorpayPaymentId;
      const expectedSignature = crypto
        .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!)
        .update(body)
        .digest('hex');

      if (expectedSignature !== razorpaySignature) {
        return res.status(400).json({ success: false, error: 'Payment verification failed — invalid signature' });
      }
      verified = true;
    } else {
      // --- Demo Mode: auto-verify ---
      verified = true;
    }

    if (!verified) {
      return res.status(400).json({ success: false, error: 'Payment verification failed' });
    }

    const updated = await prisma.donation.update({
      where: { id: donationId },
      data: {
        paymentStatus: 'completed',
        razorpayPaymentId: razorpayPaymentId || `pay_demo_${crypto.randomBytes(12).toString('hex')}`,
        razorpaySignature: razorpaySignature || 'demo_verified',
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
