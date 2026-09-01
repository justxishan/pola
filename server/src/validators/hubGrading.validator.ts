import { z } from 'zod';
import { QualityGrade, RejectionReason, RejectionDisposition } from '@pola/shared';

export const HubIntakeSheetSchema = z.object({
  body: z.object({
    hubId: z.string().optional(),
    intakeDate: z.string().optional(),
    orderId: z.string().min(1).optional(),
    productId: z.string().min(1).optional(),
    confirmedQuantity: z.coerce.number().min(0).optional(),
    assignedGrade: z.nativeEnum(QualityGrade).optional(),
    temperatureCelsius: z.coerce.number().optional(),
    criteriaNotes: z.string().optional(),
    photos: z.array(z.string()).default([]),
    rejectionReason: z.nativeEnum(RejectionReason).optional(),
    rejectionDisposition: z.nativeEnum(RejectionDisposition).optional(),
    // Batch intake from HubIntakePage
    entries: z.array(z.object({
      orderId: z.string(),
      farmerId: z.string().optional(),
      productName: z.string().optional(),
      listedWeightKg: z.coerce.number().optional(),
      actualWeightKg: z.coerce.number(),
      grade: z.string(),
      notes: z.string().optional(),
    })).optional(),
  }),
});
