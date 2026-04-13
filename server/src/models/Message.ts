import mongoose, { Schema, Document } from 'mongoose';

export interface IMessage extends Document {
  conversationId: string;
  senderId: mongoose.Types.ObjectId;
  recipientId?: mongoose.Types.ObjectId;
  organizationId?: mongoose.Types.ObjectId;
  
  type: 'direct' | 'broadcast' | 'emergency';
  
  content: string;
  attachments?: string[];
  
  readBy: mongoose.Types.ObjectId[];
  
  // Emergency
  priority?: 'normal' | 'urgent' | 'emergency';
}

const MessageSchema = new Schema<IMessage>(
  {
    conversationId: { type: String, required: true, index: true },
    senderId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    recipientId: { type: Schema.Types.ObjectId, ref: 'User' },
    organizationId: { type: Schema.Types.ObjectId, ref: 'Organization' },

    type: { type: String, enum: ['direct', 'broadcast', 'emergency'], default: 'direct' },

    content: { type: String, required: true },
    attachments: [String],

    readBy: [{ type: Schema.Types.ObjectId, ref: 'User' }],

    priority: {
      type: String,
      enum: ['normal', 'urgent', 'emergency'],
      default: 'normal',
    },
  },
  { timestamps: true }
);

MessageSchema.index({ conversationId: 1, createdAt: -1 });
MessageSchema.index({ recipientId: 1, createdAt: -1 });
MessageSchema.index({ organizationId: 1, type: 1 });

export default mongoose.model<IMessage>('Message', MessageSchema);
