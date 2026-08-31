import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IContentFlag extends Document {
  _id: Types.ObjectId;
  targetType: 'product' | 'user' | 'review';
  targetId: Types.ObjectId;
  flaggedByUserId?: Types.ObjectId;
  reason: 'misleading_photo' | 'inaccurate_grade' | 'fake_organic_claim' | 'offensive' | 'spam' | 'price_gouging';
  details?: string;
  status: 'pending' | 'reviewed_delisted' | 'reviewed_dismissed';
  reviewedByAdminId?: Types.ObjectId;
  reviewedAt?: Date;
  adminActionTaken?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ContentFlagSchema = new Schema<IContentFlag>(
  {
    targetType: { type: String, enum: ['product', 'user', 'review'], required: true, index: true },
    targetId: { type: Schema.Types.ObjectId, required: true, index: true },
    flaggedByUserId: { type: Schema.Types.ObjectId, ref: 'User' },
    reason: {
      type: String,
      enum: ['misleading_photo', 'inaccurate_grade', 'fake_organic_claim', 'offensive', 'spam', 'price_gouging'],
      required: true,
    },
    details: { type: String },
    status: {
      type: String,
      enum: ['pending', 'reviewed_delisted', 'reviewed_dismissed'],
      default: 'pending',
      index: true,
    },
    reviewedByAdminId: { type: Schema.Types.ObjectId, ref: 'User' },
    reviewedAt: { type: Date },
    adminActionTaken: { type: String },
  },
  { timestamps: true }
);

export const ContentFlag = mongoose.model<IContentFlag>('ContentFlag', ContentFlagSchema);
