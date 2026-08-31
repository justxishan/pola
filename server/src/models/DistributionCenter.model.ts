import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IDistributionCenter extends Document {
  _id: Types.ObjectId;
  code: string; // e.g. "DC-DAMBULLA", "DC-MEEGODA"
  name: string;
  roleDescription: string;
  isMainHub: boolean;
  province: string;
  district: string;
  addressLine: string;
  city: string;
  gps: {
    latitude: number;
    longitude: number;
  };
  contactPhone: string;
  contactEmail?: string;
  hasColdStorage: boolean;
  capacityMetricTons: number;
  coverageRadiusKm: number;
  operatingHours: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const DistributionCenterSchema = new Schema<IDistributionCenter>(
  {
    code: { type: String, required: true, unique: true, uppercase: true, trim: true },
    name: { type: String, required: true, trim: true },
    roleDescription: { type: String, required: true },
    isMainHub: { type: Boolean, default: false },
    province: { type: String, required: true },
    district: { type: String, required: true, index: true },
    addressLine: { type: String, required: true },
    city: { type: String, required: true },
    gps: {
      latitude: { type: Number, required: true },
      longitude: { type: Number, required: true },
    },
    contactPhone: { type: String, required: true },
    contactEmail: { type: String },
    hasColdStorage: { type: Boolean, default: true },
    capacityMetricTons: { type: Number, default: 50 },
    coverageRadiusKm: { type: Number, default: 50 },
    operatingHours: { type: String, default: '05:00 AM - 10:00 PM' },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const DistributionCenter = mongoose.model<IDistributionCenter>(
  'DistributionCenter',
  DistributionCenterSchema
);
