import { z } from 'zod';
import { OwnershipType } from '@pola/shared';

export const CreateFarmerProfileSchema = z.object({
  body: z.object({
    fullName: z.string().min(2, 'Full name must be at least 2 characters'),
    phone: z.string().min(9, 'Valid phone number is required'),
    nicNumber: z.string().min(10, 'Valid Sri Lankan NIC is required'),
    preferredLanguage: z.enum(['en', 'si', 'ta']).default('en'),
    bankDetails: z.object({
      bankName: z.string().min(1),
      branchName: z.string().min(1),
      accountNumber: z.string().min(1),
      accountHolderName: z.string().min(1),
    }),
  }),
});

export const QuickOnboardFarmerSchema = z.object({
  body: z.object({
    fullName: z.string().min(2),
    phone: z.string().min(9),
    nicNumber: z.string().min(10),
    villageName: z.string().min(1),
    district: z.string().min(1),
    primaryCrops: z.array(z.string()).default([]),
    bankDetails: z
      .object({
        bankName: z.string(),
        branchName: z.string(),
        accountNumber: z.string(),
        accountHolderName: z.string(),
      })
      .optional(),
  }),
});
