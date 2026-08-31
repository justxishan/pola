import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IVillageHub extends Document {
  _id: Types.ObjectId;
  hubCode: string; // e.g. "HUB-KANDY-01", "HUB-DAMB-02"
  hubName: string;
  linkedDcId: Types.ObjectId;
  province: string;
  district: string;
  addressLine: string;
  city: string;
  servingVillages: string[];
  gps: {
    latitude: number;
    longitude: number;
  };
  assignedCollectors: Types.ObjectId[];
  assignedLeg1Drivers: Types.ObjectId[];
  collectionSchedules: Array<{
    dayOfWeek: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday';
    startTime: string; // e.g. "06:00 AM"
    endTime: string; // e.g. "09:00 AM"
    isActive: boolean;
  }>;
  contactPhone: string;
  capacityKg: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const VillageHubSchema = new Schema<IVillageHub>(
  {
    hubCode: { type: String, required: true, unique: true, uppercase: true, trim: true },
    hubName: { type: String, required: true, trim: true },
    linkedDcId: {
      type: Schema.Types.ObjectId,
      ref: 'DistributionCenter',
      required: true,
      index: true,
    },
    province: { type: String, required: true },
    district: { type: String, required: true, index: true },
    addressLine: { type: String, required: true },
    city: { type: String, required: true },
    servingVillages: [{ type: String, required: true }],
    gps: {
      latitude: { type: Number, required: true },
      longitude: { type: Number, required: true },
    },
    assignedCollectors: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    assignedLeg1Drivers: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    collectionSchedules: [
      {
        dayOfWeek: {
          type: String,
          enum: [
            'Monday',
            'Tuesday',
            'Wednesday',
            'Thursday',
            'Friday',
            'Saturday',
            'Sunday',
          ],
          required: true,
        },
        startTime: { type: String, required: true },
        endTime: { type: String, required: true },
        isActive: { type: Boolean, default: true },
      },
    ],
    contactPhone: { type: String, required: true },
    capacityKg: { type: Number, default: 5000 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const VillageHub = mongoose.model<IVillageHub>('VillageHub', VillageHubSchema);
