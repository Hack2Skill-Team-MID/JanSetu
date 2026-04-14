import { Router, Request, Response } from 'express';
import Donation from '../models/Donation';
import Campaign from '../models/Campaign';
import Organization from '../models/Organization';
import { protect as authMiddleware, AuthRequest } from '../middleware/auth';
import { createAuditEntry } from '../middleware/audit';
import crypto from 'crypto';

const router = Router();

// ─────────────────────────────────────────
// POST /api/donations/initiate — Create Razorpay order
// ─────────────────────────────────────────
router.post('/initiate', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { amount, campaignId, organizationId, needId, type, message, isAnonymous } = req.body;
    const user = (req as any).user;

    if (!amount || amount < 1) {
      return res.status(400).json({ success: false, error: 'Amount must be at least ₹1' });
    }

    // In production: create order via Razorpay SDK
    // const Razorpay = require('razorpay');
    // const instance = new Razorpay({ key_id: process.env.RAZORPAY_KEY_ID, key_secret: process.env.RAZORPAY_KEY_SECRET });
    // const order = await instance.orders.create({ amount: amount * 100, currency: 'INR', receipt: `donation_${Date.now()}` });

    // For hackathon: simulate Razorpay order
    const mockOrderId = `order_${crypto.randomBytes(12).toString('hex')}`;

    const donation = await Donation.create({
      donorId: user._id,
      organizationId,
      campaignId,
      needId,
      amount,
      type: type || 'one_time',
      razorpayOrderId: mockOrderId,
      paymentStatus: 'pending',
      isAnonymous: isAnonymous || false,
      message,
    });

    res.status(201).json({
      success: true,
      data: {
        donationId: donation._id,
        razorpayOrderId: mockOrderId,
        amount,
        currency: 'INR',
        razorpayKeyId: process.env.RAZORPAY_KEY_ID || 'rzp_test_demo',
      },
    });

    await createAuditEntry({
      action: 'donation',
      entity: 'donation',
      entityId: String(donation._id),
      description: `Donation initiated: ₹${amount}${campaignId ? ' for campaign' : ''}`,
      after: { amount, type: type || 'one_time', isAnonymous },
      req: req as AuthRequest,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ─────────────────────────────────────────
// POST /api/donations/verify — Verify Razorpay payment
// ─────────────────────────────────────────
router.post('/verify', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { razorpayOrderId, razorpayPaymentId, razorpaySignature, donationId } = req.body;

    const donation = await Donation.findById(donationId);
    if (!donation) return res.status(404).json({ success: false, error: 'Donation not found' });

    // In production: verify signature
    // const body = razorpayOrderId + '|' + razorpayPaymentId;
    // const expectedSignature = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!).update(body).digest('hex');
    // if (expectedSignature !== razorpaySignature) return res.status(400).json(...)

    // For hackathon: auto-verify
    donation.paymentStatus = 'completed';
    donation.razorpayPaymentId = razorpayPaymentId || `pay_${crypto.randomBytes(12).toString('hex')}`;
    donation.razorpaySignature = razorpaySignature || 'simulated';
    await donation.save();

    // Update campaign funding
    if (donation.campaignId) {
      await Campaign.findByIdAndUpdate(donation.campaignId, {
        $inc: { 'goals.fundingRaised': donation.amount },
      });
    }

    // Update organization stats
    if (donation.organizationId) {
      await Organization.findByIdAndUpdate(donation.organizationId, {
        $inc: { 'stats.totalDonationsReceived': donation.amount },
      });
    }

    res.json({ success: true, data: { message: 'Payment verified successfully', donation } });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ─────────────────────────────────────────
// GET /api/donations/my — Donor's donation history
// ─────────────────────────────────────────
router.get('/my', authMiddleware, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user._id;
    const donations = await Donation.find({ donorId: userId, paymentStatus: 'completed' })
      .sort({ createdAt: -1 })
      .populate('campaignId', 'title category')
      .populate('organizationId', 'name slug');

    const total = donations.reduce((sum, d) => sum + d.amount, 0);
    res.json({ success: true, data: { donations, totalDonated: total, count: donations.length } });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ─────────────────────────────────────────
// GET /api/donations/campaign/:id — Campaign's donations
// ─────────────────────────────────────────
router.get('/campaign/:id', async (req: Request, res: Response) => {
  try {
    const donations = await Donation.find({ campaignId: req.params.id, paymentStatus: 'completed' })
      .sort({ createdAt: -1 })
      .populate('donorId', 'name avatar');

    // Respect anonymity
    const sanitized = donations.map((d: any) => ({
      amount: d.amount,
      message: d.message,
      createdAt: d.createdAt,
      donor: d.isAnonymous ? { name: 'Anonymous Supporter' } : d.donorId,
    }));

    const total = donations.reduce((sum, d) => sum + d.amount, 0);
    res.json({ success: true, data: { donations: sanitized, totalRaised: total } });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ─────────────────────────────────────────
// GET /api/donations/impact/:userId — Donor impact report
// ─────────────────────────────────────────
router.get('/impact/:userId', async (req: Request, res: Response) => {
  try {
    const donations = await Donation.find({ donorId: req.params.userId, paymentStatus: 'completed' })
      .populate('campaignId', 'title category goals')
      .populate('organizationId', 'name stats');

    const totalDonated = donations.reduce((sum, d) => sum + d.amount, 0);
    const uniqueOrgs = new Set(donations.filter(d => d.organizationId).map(d => d.organizationId!.toString())).size;
    const uniqueCampaigns = new Set(donations.filter(d => d.campaignId).map(d => d.campaignId!.toString())).size;

    res.json({
      success: true,
      data: {
        totalDonated,
        donationCount: donations.length,
        organizationsSupported: uniqueOrgs,
        campaignsSupported: uniqueCampaigns,
        donations,
      },
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
