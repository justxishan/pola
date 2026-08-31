import mongoose, { Document, Schema, Types } from 'mongoose';
import { RejectionReason, RejectionDisposition } from '@pola/shared';

export interface IWastageLog extends Document {
  _id: Types.ObjectId;
  orderId?: Types.ObjectId;
  productId: Types.ObjectId;
  productName: string;
  category: string;
  farmerId: Types.ObjectId;
  hubId?: Types.ObjectId;
  dcId?: Types.ObjectId;
  recordedByUserId: Types.ObjectId;

  quantityKg: number;
  estimatedLossLkr: number;
  stageCaught: 'hub_intake' | 'dc_intake' | 'customer_delivery' | 'storage_spoilage';
  reason: RejectionReason;
  disposition: RejectionDisposition;
  photoEvidence?: string;
  notes?: string;

  createdAt: Date;
}

const WastageLogSchema = new Schema<IWastageLog>(
  {
    orderId: { type: Schema.Types.ObjectId, ref: 'Order' },
    productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true, index: true },
    productName: { type: String, required: true },
    category: { type: String, required: true, index: true },
    farmerId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    hubId: { type: Schema.Types.ObjectId, ref: 'VillageHub' },
    dcId: { type: Schema.Types.ObjectId, ref: 'DistributionCenter' },
    recordedByUserId: { type: Schema.Types.ObjectId, ref: 'User', required: true },

    quantityKg: { type: Number, required: true, min: 0 },
    estimatedLossLkr: { type: Number, required: true, default: 0 },
    stageCaught: {
      type: String,
      enum: ['hub_intake', 'dc_intake', 'customer_delivery', 'storage_spoilage'],
      required: true,
    },
    reason: {
      type: String,
      enum: Object.values(RejectionReason),
      required: true,
    },
    disposition: {
      type: String,
      enum: Object.values(RejectionDisposition),
      required: true,
    },
    photoEvidence: { type: String },
    notes: { type: String },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

WastageLogSchema.index({ createdAt: -1, stageCaught: 1 });

export const WastageLog = mongoose.model<IWastageLog>('WastageLog', WastageLogSchema);
