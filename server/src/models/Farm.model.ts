import mongoose, { Document, Schema, Types } from 'mongoose';
import { OwnershipType } from '@pola/shared';

export interface IFarm extends Document {
  _id: Types.ObjectId;
  farmerId: Types.ObjectId;
  farmName: string;
  province: string;
  district: string;
  addressLine: string;
  city: string;
  gps: {
    latitude: number;
    longitude: number;
  };
  extentValue: number; // Numeric value
  extentUnit: 'acres' | 'perches' | 'hectares';
  ownershipType: OwnershipType;
  irrigationType: 'rain_fed' | 'irrigated' | 'drip' | 'well' | 'canal';
  primaryCrops: string[];
  isOrganicCertified: boolean;
  organicCertificateDoc?: string;
  organicCertIssuer?: string;
  organicCertExpiry?: Date;
  photos?: string[];
  notes?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const FarmSchema = new Schema<IFarm>(
  {
    farmerId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    farmName: { type: String, required: true, trim: true },
    province: { type: String, required: true },
    district: { type: String, required: true, index: true },
    addressLine: { type: String, required: true },
    city: { type: String, required: true },
    gps: {
      latitude: { type: Number, required: true },
      longitude: { type: Number, required: true },
    },
    extentValue: { type: Number, required: true },
    extentUnit: { type: String, enum: ['acres', 'perches', 'hectares'], default: 'acres' },
    ownershipType: {
      type: String,
      enum: Object.values(OwnershipType),
      default: OwnershipType.OWNED,
    },
    irrigationType: {
      type: String,
      enum: ['rain_fed', 'irrigated', 'drip', 'well', 'canal'],
      default: 'rain_fed',
    },
    primaryCrops: [{ type: String }],
    isOrganicCertified: { type: Boolean, default: false },
    organicCertificateDoc: { type: String },
    organicCertIssuer: { type: String },
    organicCertExpiry: { type: Date },
    photos: [{ type: String }],
    notes: { type: String },
    isActive: { type: Boolean, default: true },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual aliases for frontend compatibility
FarmSchema.virtual('name').get(function () {
  return this.farmName;
});
FarmSchema.virtual('totalAreaAcres').get(function () {
  return this.extentValue;
});
FarmSchema.virtual('landExtentAcres').get(function () {
  return this.extentValue;
});
FarmSchema.virtual('irrigationSource').get(function () {
  return this.irrigationType;
});

export const Farm = mongoose.model<IFarm>('Farm', FarmSchema);
