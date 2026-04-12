import mongoose, { Schema, Document } from 'mongoose';

export interface ISurveyUploadDocument extends Document {
  ngoId: mongoose.Types.ObjectId;
  fileUrl: string;
  fileType: 'image' | 'pdf' | 'text' | 'csv';
  originalFileName: string;
  processedData?: {
    extractedNeeds: Array<{
      title: string;
      description: string;
      category: string;
      urgency: string;
      location: string;
    }>;
    summary: string;
    confidence: number;
  };
  status: 'pending' | 'processing' | 'completed' | 'failed';
  errorMessage?: string;
  uploadedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const surveyUploadSchema = new Schema<ISurveyUploadDocument>(
  {
    ngoId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    fileUrl: {
      type: String,
      required: [true, 'File URL is required'],
    },
    fileType: {
      type: String,
      enum: ['image', 'pdf', 'text', 'csv'],
      required: true,
    },
    originalFileName: {
      type: String,
      required: true,
    },
    processedData: {
      type: Schema.Types.Mixed,
      default: null,
    },
    status: {
      type: String,
      enum: ['pending', 'processing', 'completed', 'failed'],
      default: 'pending',
    },
    errorMessage: { type: String },
    uploadedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export const SurveyUpload = mongoose.model<ISurveyUploadDocument>(
  'SurveyUpload',
  surveyUploadSchema
);
