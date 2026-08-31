import { z } from 'zod';
import { VehicleType } from '@pola/shared';

export const RegisterVehicleSchema = z.object({
  body: z.object({
    registrationPlate: z.string().min(4, 'Valid vehicle registration plate is required'),
    vehicleType: z.nativeEnum(VehicleType),
    makeModel: z.string().min(2, 'Make and model is required'),
    yearOfManufacture: z.number().min(1980).max(2030).optional(),
    maxPayloadKg: z.number().min(10, 'Maximum payload in kg is required'),
    hasColdChain: z.boolean().default(false),
    minTemperatureCelsius: z.number().optional(),
    revenueLicenseExpiry: z.string().optional(),
    insuranceExpiry: z.string().optional(),
  }),
});
