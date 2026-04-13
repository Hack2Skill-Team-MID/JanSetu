import mongoose, { Schema, Document } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IUserDocument extends Document {
  name: string;
  email: string;
  password: string;
  role: 'platform_admin' | 'ngo_admin' | 'ngo_staff' | 'volunteer' | 'donor' | 'community_reporter';
  avatar?: string;
  isVerified: boolean;
  
  // Multi-tenant
  organizationId?: mongoose.Types.ObjectId;
  
  // Reputation & Gamification
  reputationScore: number;
  badges: string[];
  points: number;
  
  // Preferences
  language: string;
  
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const userSchema = new Schema<IUserDocument>(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      minlength: 2,
      maxlength: 100,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email'],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: 6,
      select: false, // Don't return password by default
    },
    role: {
      type: String,
      enum: ['platform_admin', 'ngo_admin', 'ngo_staff', 'volunteer', 'donor', 'community_reporter',
             // Legacy compat
             'ngo_coordinator', 'admin'],
      default: 'volunteer',
    },
    avatar: { type: String },
    isVerified: { type: Boolean, default: false },
    
    // Multi-tenant
    organizationId: { type: Schema.Types.ObjectId, ref: 'Organization' },
    
    // Reputation & Gamification
    reputationScore: { type: Number, default: 50, min: 0, max: 100 },
    badges: [{ type: String }],
    points: { type: Number, default: 0 },
    
    // Preferences
    language: { type: String, default: 'en' },
  },
  {
    timestamps: true,
  }
);

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare password method
userSchema.methods.comparePassword = async function (
  candidatePassword: string
): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

export const User = mongoose.model<IUserDocument>('User', userSchema);
