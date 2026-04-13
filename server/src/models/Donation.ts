import mongoose, { Schema, Document } from 'mongoose';

export interface IDonation extends Document {
  donorId: mongoose.Types.ObjectId;
  organizationId?: mongoose.Types.ObjectId;
  campaignId?: mongoose.Types.ObjectId;
  needId?: mongoose.Types.ObjectId;
  
  // Payment
  amount: number;
  currency: string;
  paymentMethod: 'razorpay' | 'upi' | 'bank_transfer' | 'cash';
  paymentStatus: 'pending' | 'completed' | 'failed' | 'refunded';
  
  // Razorpay
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  razorpaySignature?: string;
  
  // Type
  type: 'one_time' | 'recurring';
  recurring?: {
    frequency: 'monthly' | 'quarterly' | 'yearly';
    nextDate: Date;
    active: boolean;
  };
  
  // Impact
  impactDescription?: string;
  
  // Receipt
  receiptGenerated: boolean;
  receiptUrl?: string;
  
  // Metadata
  isAnonymous: boolean;
  message?: string;
}

const DonationSchema = new Schema<IDonation>(
  {
    donorId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    organizationId: { type: Schema.Types.ObjectId, ref: 'Organization' },
    campaignId: { type: Schema.Types.ObjectId, ref: 'Campaign' },
    needId: { type: Schema.Types.ObjectId, ref: 'CommunityNeed' },

    amount: { type: Number, required: true, min: 1 },
    currency: { type: String, default: 'INR' },
    paymentMethod: {
      type: String,
      enum: ['razorpay', 'upi', 'bank_transfer', 'cash'],
      default: 'razorpay',
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'completed', 'failed', 'refunded'],
      default: 'pending',
    },

    razorpayOrderId: String,
    razorpayPaymentId: String,
    razorpaySignature: String,

    type: { type: String, enum: ['one_time', 'recurring'], default: 'one_time' },
    recurring: {
      frequency: { type: String, enum: ['monthly', 'quarterly', 'yearly'] },
      nextDate: Date,
      active: Boolean,
    },

    impactDescription: String,
    receiptGenerated: { type: Boolean, default: false },
    receiptUrl: String,

    isAnonymous: { type: Boolean, default: false },
    message: String,
  },
  { timestamps: true }
);

DonationSchema.index({ donorId: 1, createdAt: -1 });
DonationSchema.index({ organizationId: 1, paymentStatus: 1 });
DonationSchema.index({ campaignId: 1 });
DonationSchema.index({ paymentStatus: 1, createdAt: -1 });

export default mongoose.model<IDonation>('Donation', DonationSchema);
