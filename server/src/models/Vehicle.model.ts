import mongoose, { Document, Schema, Types } from 'mongoose';
import { VehicleType, VerificationStatus } from '@pola/shared';

export interface IVehicle extends Document {
  _id: Types.ObjectId;
  ownerId: Types.ObjectId; // Delivery Partner (Individual or Fleet Company)
  assignedDriverId?: Types.ObjectId;
  registrationPlate: string; // e.g. "WP CAB-1234"
  vehicleType: VehicleType;
  makeModel: string; // e.g. "Tata Dimo Batta", "BAJAJ RE", "Isuzu Elf"
  yearOfManufacture?: number;
  maxPayloadKg: number;
  hasColdChain: boolean;
  minTemperatureCelsius?: number;

  // Documents
  crBookDoc?: string;
  revenueLicenseDoc?: string;
  revenueLicenseExpiry?: Date;
  insuranceDoc?: string;
  insuranceExpiry?: Date;
  vehiclePhotos?: string[];

  status: VerificationStatus;
  rejectionReason?: string;
  isAvailable: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const VehicleSchema = new Schema<IVehicle>(
  {
    ownerId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    assignedDriverId: { type: Schema.Types.ObjectId, ref: 'User' },
    registrationPlate: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
      index: true,
    },
    vehicleType: {
      type: String,
      enum: Object.values(VehicleType),
      required: true,
      default: VehicleType.MINI_TRUCK,
    },
    makeModel: { type: String, required: true },
    yearOfManufacture: { type: Number },
    maxPayloadKg: { type: Number, required: true, min: 10 },
    hasColdChain: { type: Boolean, default: false, index: true },
    minTemperatureCelsius: { type: Number },

    crBookDoc: { type: String },
    revenueLicenseDoc: { type: String },
    revenueLicenseExpiry: { type: Date },
    insuranceDoc: { type: String },
    insuranceExpiry: { type: Date },
    vehiclePhotos: [{ type: String }],

    status: {
      type: String,
      enum: Object.values(VerificationStatus),
      default: VerificationStatus.PENDING,
    },
    rejectionReason: { type: String },
    isAvailable: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const Vehicle = mongoose.model<IVehicle>('Vehicle', VehicleSchema);
