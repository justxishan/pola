import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IRating extends Document {
  _id: Types.ObjectId;
  orderId: Types.ObjectId;
  raterUserId: Types.ObjectId; // The user giving the rating (e.g. Customer)
  targetType: 'produce_farmer' | 'delivery_driver' | 'collector';
  targetUserId: Types.ObjectId; // Farmer or Driver or Collector
  productId?: Types.ObjectId; // For produce rating

  ratingScore: number; // 1 to 5 stars
  reviewText?: string;
  tags?: string[]; // e.g. ["Fresh", "Well Packaged", "On Time", "Courteous"]
  photos?: string[];

  isPublic: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const RatingSchema = new Schema<IRating>(
  {
    orderId: { type: Schema.Types.ObjectId, ref: 'Order', required: true, index: true },
    raterUserId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    targetType: {
      type: String,
      enum: ['produce_farmer', 'delivery_driver', 'collector'],
      required: true,
      index: true,
    },
    targetUserId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    productId: { type: Schema.Types.ObjectId, ref: 'Product' },

    ratingScore: { type: Number, required: true, min: 1, max: 5 },
    reviewText: { type: String, trim: true },
    tags: [{ type: String }],
    photos: [{ type: String }],

    isPublic: { type: Boolean, default: true },
  },
  { timestamps: true }
);

RatingSchema.index({ targetUserId: 1, targetType: 1 });

export const Rating = mongoose.model<IRating>('Rating', RatingSchema);
