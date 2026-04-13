import mongoose, { Schema, Document } from 'mongoose';

export interface IOrganization extends Document {
  name: string;
  slug: string;
  description: string;
  logo?: string;
  type: 'ngo' | 'foundation' | 'government' | 'community_group';
  
  // Verification
  verified: boolean;
  verificationDocs: {
    registrationCert?: string;
    taxExemptionCert?: string;
    governmentId?: string;
  };
  
  // Trust
  trustScore: number; // 0-100, AI-calculated
  trustTier: 'verified' | 'partially_verified' | 'unverified' | 'suspended';
  
  // Config
  mode: 'private' | 'public'; // workspace visibility
  subscription: 'free' | 'pro' | 'enterprise';
  
  // Contact
  email: string;
  phone?: string;
  website?: string;
  address: string;
  region: string;
  coordinates: [number, number];
  
  // Stats (denormalized for dashboard speed)
  stats: {
    totalCampaigns: number;
    activeCampaigns: number;
    totalVolunteers: number;
    totalDonationsReceived: number;
    peopleHelped: number;
  };
  
  // Admin
  createdBy: mongoose.Types.ObjectId;
  isActive: boolean;
}

const OrganizationSchema = new Schema<IOrganization>(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true },
    description: { type: String, required: true },
    logo: String,
    type: {
      type: String,
      enum: ['ngo', 'foundation', 'government', 'community_group'],
      default: 'ngo',
    },

    // Verification
    verified: { type: Boolean, default: false },
    verificationDocs: {
      registrationCert: String,
      taxExemptionCert: String,
      governmentId: String,
    },

    // Trust
    trustScore: { type: Number, default: 30, min: 0, max: 100 },
    trustTier: {
      type: String,
      enum: ['verified', 'partially_verified', 'unverified', 'suspended'],
      default: 'unverified',
    },

    // Config
    mode: { type: String, enum: ['private', 'public'], default: 'private' },
    subscription: { type: String, enum: ['free', 'pro', 'enterprise'], default: 'free' },

    // Contact
    email: { type: String, required: true },
    phone: String,
    website: String,
    address: { type: String, required: true },
    region: { type: String, required: true },
    coordinates: { type: [Number], default: [0, 0] },

    // Stats
    stats: {
      totalCampaigns: { type: Number, default: 0 },
      activeCampaigns: { type: Number, default: 0 },
      totalVolunteers: { type: Number, default: 0 },
      totalDonationsReceived: { type: Number, default: 0 },
      peopleHelped: { type: Number, default: 0 },
    },

    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

OrganizationSchema.index({ slug: 1 });
OrganizationSchema.index({ region: 1 });
OrganizationSchema.index({ mode: 1, isActive: 1 });
OrganizationSchema.index({ trustScore: -1 });
OrganizationSchema.index({ coordinates: '2dsphere' });

export default mongoose.model<IOrganization>('Organization', OrganizationSchema);
