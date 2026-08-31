import mongoose, { Document, Schema, Types } from 'mongoose';
import { QualityGrade, RejectionReason, RejectionDisposition } from '@pola/shared';

export interface IQualityInspection extends Document {
  _id: Types.ObjectId;
  orderId: Types.ObjectId;
  productId: Types.ObjectId;
  farmerId: Types.ObjectId;
  inspectorId: Types.ObjectId; // Village Collector, Hub Staff, or DC Staff
  stage: 'hub_intake' | 'dc_intake';
  hubId?: Types.ObjectId;
  dcId?: Types.ObjectId;

  selfDeclaredGrade: QualityGrade;
  assignedGrade: QualityGrade;
  priceMultiplier: number;

  listedQuantity: number;
  confirmedQuantity: number;
  weightVariancePercent: number;
  temperatureCelsius?: number; // For milk/dairy

  criteriaNotes?: string;
  photos: string[]; // Mandatory for Grade C and Rejected

  rejectionReason?: RejectionReason;
  rejectionDisposition?: RejectionDisposition;
  farmerContested: boolean;
  disputeId?: Types.ObjectId;

  createdAt: Date;
  updatedAt: Date;
}

const QualityInspectionSchema = new Schema<IQualityInspection>(
  {
    orderId: { type: Schema.Types.ObjectId, ref: 'Order', required: true, index: true },
    productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
    farmerId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    inspectorId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    stage: {
      type: String,
      enum: ['hub_intake', 'dc_intake'],
      required: true,
      index: true,
    },
    hubId: { type: Schema.Types.ObjectId, ref: 'VillageHub' },
    dcId: { type: Schema.Types.ObjectId, ref: 'DistributionCenter' },

    selfDeclaredGrade: {
      type: String,
      enum: Object.values(QualityGrade),
      required: true,
    },
    assignedGrade: {
      type: String,
      enum: Object.values(QualityGrade),
      required: true,
      index: true,
    },
    priceMultiplier: { type: Number, required: true, default: 1.0 },

    listedQuantity: { type: Number, required: true },
    confirmedQuantity: { type: Number, required: true },
    weightVariancePercent: { type: Number, required: true, default: 0 },
    temperatureCelsius: { type: Number },

    criteriaNotes: { type: String },
    photos: [{ type: String }],

    rejectionReason: { type: String, enum: Object.values(RejectionReason) },
    rejectionDisposition: { type: String, enum: Object.values(RejectionDisposition) },
    farmerContested: { type: Boolean, default: false },
    disputeId: { type: Schema.Types.ObjectId, ref: 'Dispute' },
  },
  { timestamps: true }
);

export const QualityInspection = mongoose.model<IQualityInspection>(
  'QualityInspection',
  QualityInspectionSchema
);
