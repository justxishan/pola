import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IDispute extends Document {
  _id: Types.ObjectId;
  disputeNumber: string;
  orderId: Types.ObjectId;
  raisedByUserId: Types.ObjectId;
  raisedByUserRole: string;
  respondentUserId?: Types.ObjectId;
  category: 'damaged_goods' | 'wrong_grade' | 'weight_mismatch' | 'non_delivery' | 'late_delivery' | 'other';
  description: string;

  // Comparative Evidence (Hub inspection photo vs Customer photo)
  inspectionEvidencePhotos: string[];
  claimantEvidencePhotos: string[];

  status: 'opened' | 'under_review' | 'resolved_refund' | 'resolved_rejected' | 'resolved_compromise';
  resolutionNotes?: string;
  refundAmountLkr?: number;
  adjudicatedByAdminId?: Types.ObjectId;
  adjudicatedAt?: Date;

  createdAt: Date;
  updatedAt: Date;
}

const DisputeSchema = new Schema<IDispute>(
  {
    disputeNumber: { type: String, required: true, unique: true, uppercase: true, index: true },
    orderId: { type: Schema.Types.ObjectId, ref: 'Order', required: true, index: true },
    raisedByUserId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    raisedByUserRole: { type: String, required: true },
    respondentUserId: { type: Schema.Types.ObjectId, ref: 'User' },
    category: {
      type: String,
      enum: ['damaged_goods', 'wrong_grade', 'weight_mismatch', 'non_delivery', 'late_delivery', 'other'],
      required: true,
    },
    description: { type: String, required: true },
    inspectionEvidencePhotos: [{ type: String }],
    claimantEvidencePhotos: [{ type: String }],

    status: {
      type: String,
      enum: ['opened', 'under_review', 'resolved_refund', 'resolved_rejected', 'resolved_compromise'],
      default: 'opened',
      index: true,
    },
    resolutionNotes: { type: String },
    refundAmountLkr: { type: Number, default: 0 },
    adjudicatedByAdminId: { type: Schema.Types.ObjectId, ref: 'User' },
    adjudicatedAt: { type: Date },
  },
  { timestamps: true }
);

export const Dispute = mongoose.model<IDispute>('Dispute', DisputeSchema);
