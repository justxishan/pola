import { z } from 'zod';
import { Role, ADMIN_ROLES } from '@pola/shared';

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
    role: z.nativeEnum(Role).refine((r) => !ADMIN_ROLES.includes(r), { message: 'Invalid role selection' }),
  }),
});

export const UpdateProfileSchema = z.object({
  body: z.object({
    fullName: z.string().min(2).optional(),
    username: z
      .string()
      .regex(/^[a-z_.]+$/, 'Username can only contain simple letters, underscore (_), and full stop (.)')
      .min(3, 'Username must be at least 3 characters')
      .max(30, 'Username cannot exceed 30 characters')
      .optional(),
    phone: z.string().optional(),
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
    drivingLicenseNumber: z.string().optional(),
    preferredShift: z.enum(['morning', 'afternoon', 'both']).optional(),
    addresses: z.array(z.any()).optional(),
    kycStatus: z.string().optional(),
    themePreference: z.enum(['light', 'dark', 'system']).optional(),
    assignedHubId: z.string().optional(),
    profileImage: z.string().optional(),
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

export const DeleteAccountSchema = z.object({
  body: z.object({
    reason: z.string().min(1, 'Please select a reason'),
    details: z.string().optional(),
  }),
});

export const AdminLoginSchema = z.object({
  body: z.object({
    email: z.string().email(),
    password: z.string().min(1),
  }),
});

export const CreateAdminSchema = z.object({
  body: z.object({
    fullName: z.string().min(2),
    email: z.string().email(),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    role: z.enum([Role.ADMIN_SUPER, Role.ADMIN_FINANCE, Role.ADMIN_LOGISTICS, Role.ADMIN_SUPPORT]),
  }),
});
