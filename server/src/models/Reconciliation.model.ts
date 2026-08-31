import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IReconciliation extends Document {
  _id: Types.ObjectId;
  orderId: Types.ObjectId;
  productId: Types.ObjectId;
  farmerId: Types.ObjectId;
  customerId: Types.ObjectId;
  shortfallQuantity: number;
  variancePercent: number;
  customerAction: 'accept_partial' | 'cancel_shortfall' | 'accept_substitute' | 'pending';
  substituteProductId?: Types.ObjectId;
  refundAmountLkr: number;
  isResolved: boolean;
  resolvedAt?: Date;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ReconciliationSchema = new Schema<IReconciliation>(
  {
    orderId: { type: Schema.Types.ObjectId, ref: 'Order', required: true, index: true },
    productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
    farmerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    customerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    shortfallQuantity: { type: Number, required: true },
    variancePercent: { type: Number, required: true },
    customerAction: {
      type: String,
      enum: ['accept_partial', 'cancel_shortfall', 'accept_substitute', 'pending'],
      default: 'pending',
    },
    substituteProductId: { type: Schema.Types.ObjectId, ref: 'Product' },
    refundAmountLkr: { type: Number, default: 0 },
    isResolved: { type: Boolean, default: false, index: true },
    resolvedAt: { type: Date },
    notes: { type: String },
  },
  { timestamps: true }
);

export const Reconciliation = mongoose.model<IReconciliation>(
  'Reconciliation',
  ReconciliationSchema
);
