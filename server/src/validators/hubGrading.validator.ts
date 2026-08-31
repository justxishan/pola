import { z } from 'zod';
import { QualityGrade, RejectionReason, RejectionDisposition } from '@pola/shared';

export const HubIntakeSheetSchema = z.object({
  body: z.object({
    orderId: z.string().min(1),
    productId: z.string().min(1),
    confirmedQuantity: z.number().min(0),
    assignedGrade: z.nativeEnum(QualityGrade),
    temperatureCelsius: z.number().optional(),
    criteriaNotes: z.string().optional(),
    photos: z.array(z.string()).default([]),
    rejectionReason: z.nativeEnum(RejectionReason).optional(),
    rejectionDisposition: z.nativeEnum(RejectionDisposition).optional(),
  }),
});
