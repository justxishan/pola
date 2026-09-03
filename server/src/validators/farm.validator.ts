import { z } from 'zod';
import { OwnershipType } from '@pola/shared';

export const CreateFarmSchema = z.object({
  body: z.object({
    farmName: z.string().min(2, 'Farm name is required'),
    province: z.string().min(1, 'Province is required'),
    district: z.string().min(1, 'District is required'),
    addressLine: z.string().min(1, 'Address is required'),
    city: z.string().min(1, 'City / nearest village is required'),
    // z.coerce handles both numeric JSON and stringified FormData values
    latitude: z.coerce.number().min(5.0, 'Latitude out of Sri Lanka range').max(10.0).optional(),
    longitude: z.coerce.number().min(79.0, 'Longitude out of Sri Lanka range').max(82.5).optional(),
    extentValue: z.coerce.number().min(0.1, 'Land extent must be positive'),
    extentUnit: z.enum(['acres', 'perches', 'hectares']).default('acres'),
    ownershipType: z.nativeEnum(OwnershipType).default(OwnershipType.OWNED),
    irrigationType: z.enum(['rain_fed', 'irrigated', 'drip', 'well', 'canal']).default('rain_fed'),
    primaryCrops: z.preprocess(
      (val) => (typeof val === 'string' ? JSON.parse(val) : val),
      z.array(z.string()).default([])
    ),
    isOrganicCertified: z.preprocess(
      (val) => val === 'true' || val === true,
      z.boolean().default(false)
    ),
    notes: z.string().optional(),
  }),
});
