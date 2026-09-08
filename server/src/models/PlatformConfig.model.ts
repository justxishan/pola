import mongoose, { Document, Schema } from 'mongoose';

export interface IPlatformConfig extends Document {
  platformCommissionPercent: number; // default: 5
  collectorCommissionPercent: number; // default: 3
  deliveryBaseFeeLkr: number; // default: 300
  deliveryPerKmLkr: number; // default: 50
  deliveryPerKgLkr: number; // default: 10
  createdAt: Date;
  updatedAt: Date;
}

const PlatformConfigSchema = new Schema<IPlatformConfig>(
  {
    platformCommissionPercent: { type: Number, default: 5, required: true },
    collectorCommissionPercent: { type: Number, default: 3, required: true },
    deliveryBaseFeeLkr: { type: Number, default: 300, required: true },
    deliveryPerKmLkr: { type: Number, default: 50, required: true },
    deliveryPerKgLkr: { type: Number, default: 10, required: true },
  },
  { timestamps: true }
);

export const PlatformConfig = mongoose.model<IPlatformConfig>(
  'PlatformConfig',
  PlatformConfigSchema
);

// Helper to get cached or default configuration
let cachedConfig: Partial<IPlatformConfig> | null = null;

export async function getOrInitPlatformConfig(): Promise<IPlatformConfig> {
  if (cachedConfig) {
    return cachedConfig as IPlatformConfig;
  }
  let config = await PlatformConfig.findOne();
  if (!config) {
    config = await PlatformConfig.create({
      platformCommissionPercent: 5,
      collectorCommissionPercent: 3,
      deliveryBaseFeeLkr: 300,
      deliveryPerKmLkr: 50,
      deliveryPerKgLkr: 10,
    });
  }
  cachedConfig = config.toObject();
  return config;
}

export function invalidatePlatformConfigCache() {
  cachedConfig = null;
}
