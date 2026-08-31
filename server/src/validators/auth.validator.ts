import { z } from 'zod';
import { Role } from '@pola/shared';

export const RequestOtpSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email address'),
    role: z.string().optional(),
  }),
});

export const VerifyOtpSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email address'),
    otpCode: z.string().optional(),
    otp: z.string().optional(),
    fullName: z.string().optional(),
    role: z.string().optional(),
  }),
});

export const GoogleAuthSchema = z.object({
  body: z.object({
    idToken: z.string().min(1, 'Google ID Token is required'),
    role: z.string().optional(),
  }),
});

export const SelectRoleSchema = z.object({
  body: z.object({
    role: z.nativeEnum(Role),
  }),
});

export const UpdateProfileSchema = z.object({
  body: z.object({
    fullName: z.string().min(2).optional(),
    phone: z.string().optional(),
    role: z.string().optional(),
    onboardingCompleted: z.boolean().optional(),
    nicNumber: z.string().optional(),
    preferredLanguage: z.enum(['en', 'si', 'ta']).optional(),
    dateOfBirth: z.string().optional(),
    gender: z.enum(['male', 'female', 'other']).optional(),
    businessName: z.string().optional(),
    businessRegNumber: z.string().optional(),
    businessType: z.enum(['supermarket', 'hotel', 'restaurant', 'retailer', 'exporter']).optional(),
    deliveryRadiusKm: z.number().optional(),
    isOnline: z.boolean().optional(),
    addresses: z.array(z.any()).optional(),
    kycStatus: z.string().optional(),
    bankDetails: z
      .object({
        bankName: z.string().optional(),
        branchName: z.string().optional(),
        accountNumber: z.string().optional(),
        accountHolderName: z.string().optional(),
      })
      .optional(),
  }),
});
