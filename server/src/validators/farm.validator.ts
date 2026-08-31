import { z } from 'zod';
import { OwnershipType } from '@pola/shared';

export const CreateFarmSchema = z.object({
  body: z.object({
    farmName: z.string().min(2, 'Farm name is required'),
    province: z.string().min(1, 'Province is required'),
    district: z.string().min(1, 'District is required'),
    addressLine: z.string().min(1, 'Address is required'),
    city: z.string().min(1, 'City is required'),
    latitude: z.number().min(5.0).max(10.0), // Sri Lanka lat bounding
    longitude: z.number().min(79.0).max(82.5), // Sri Lanka lng bounding
    extentValue: z.number().min(0.1, 'Land extent must be positive'),
    extentUnit: z.enum(['acres', 'perches', 'hectares']).default('acres'),
    ownershipType: z.nativeEnum(OwnershipType).default(OwnershipType.OWNED),
    irrigationType: z.enum(['rain_fed', 'irrigated', 'drip', 'well', 'canal']).default('rain_fed'),
    primaryCrops: z.array(z.string()).default([]),
    isOrganicCertified: z.boolean().default(false),
    notes: z.string().optional(),
  }),
});
