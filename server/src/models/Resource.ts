import mongoose, { Schema, Document } from 'mongoose';

export interface IResource extends Document {
  organizationId: mongoose.Types.ObjectId;
  
  // Core
  name: string;
  category: 'food' | 'medicine' | 'clothing' | 'shelter' | 'equipment' | 'vehicle' | 'funds' | 'other';
  description?: string;
  
  // Quantity
  quantity: number;
  unit: string;
  
  // Lifecycle
  expiryDate?: Date;
  condition: 'new' | 'good' | 'fair' | 'needs_repair';
  
  // Location
  location: string;
  coordinates: [number, number];
  
  // Allocation
  allocated: number;
  available: number;
  
  // Tracking
  allocations: {
    campaignId?: mongoose.Types.ObjectId;
    taskId?: mongoose.Types.ObjectId;
    quantity: number;
    allocatedAt: Date;
    returnedAt?: Date;
  }[];
  
  // Sharing
  sharedWithOrgs: mongoose.Types.ObjectId[];
  availableForSharing: boolean;
  
  status: 'available' | 'low_stock' | 'depleted' | 'expired';
}

const ResourceSchema = new Schema<IResource>(
  {
    organizationId: { type: Schema.Types.ObjectId, ref: 'Organization', required: true },

    name: { type: String, required: true },
    category: {
      type: String,
      enum: ['food', 'medicine', 'clothing', 'shelter', 'equipment', 'vehicle', 'funds', 'other'],
      required: true,
    },
    description: String,

    quantity: { type: Number, required: true, min: 0 },
    unit: { type: String, required: true },

    expiryDate: Date,
    condition: {
      type: String,
      enum: ['new', 'good', 'fair', 'needs_repair'],
      default: 'good',
    },

    location: { type: String, required: true },
    coordinates: { type: [Number], default: [0, 0] },

    allocated: { type: Number, default: 0 },
    available: { type: Number, default: 0 },

    allocations: [
      {
        campaignId: { type: Schema.Types.ObjectId, ref: 'Campaign' },
        taskId: { type: Schema.Types.ObjectId, ref: 'Task' },
        quantity: Number,
        allocatedAt: { type: Date, default: Date.now },
        returnedAt: Date,
      },
    ],

    sharedWithOrgs: [{ type: Schema.Types.ObjectId, ref: 'Organization' }],
    availableForSharing: { type: Boolean, default: false },

    status: {
      type: String,
      enum: ['available', 'low_stock', 'depleted', 'expired'],
      default: 'available',
    },
  },
  { timestamps: true }
);

ResourceSchema.index({ organizationId: 1, category: 1 });
ResourceSchema.index({ status: 1 });
ResourceSchema.index({ expiryDate: 1 });
ResourceSchema.index({ availableForSharing: 1 });

// Auto-compute available and status before save
ResourceSchema.pre('save', function () {
  this.available = this.quantity - this.allocated;
  if (this.available <= 0) this.status = 'depleted';
  else if (this.available < this.quantity * 0.2) this.status = 'low_stock';
  else if (this.expiryDate && this.expiryDate < new Date()) this.status = 'expired';
  else this.status = 'available';
});

export default mongoose.model<IResource>('Resource', ResourceSchema);
