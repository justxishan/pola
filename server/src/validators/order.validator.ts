import { z } from 'zod';
import { PaymentMethod } from '@pola/shared';

export const CheckoutOrderSchema = z.object({
  body: z.object({
    items: z
      .array(
        z.object({
          productId: z.string().min(1),
          quantity: z.number().min(0.1),
        })
      )
      .min(1, 'Cart cannot be empty'),
    deliveryAddress: z.object({
      label: z.string().optional(),
      province: z.string().min(1, 'Province is required'),
      district: z.string().min(1, 'District is required'),
      addressLine1: z.string().min(1, 'Street address is required'),
      addressLine2: z.string().optional(),
      city: z.string().min(1, 'City is required'),
      postalCode: z.string().optional(),
      contactPhone: z.string().optional(),
      latitude: z.number().optional(),
      longitude: z.number().optional(),
    }),
    billingAddress: z
      .object({
        province: z.string().optional(),
        district: z.string().optional(),
        addressLine1: z.string().optional(),
        city: z.string().optional(),
      })
      .optional(),
    recipientName: z.string().optional(),
    recipientPhone: z.string().optional(),
    deliveryInstructions: z.string().optional(),
    customerNotes: z.string().optional(),
    paymentMethod: z
      .nativeEnum(PaymentMethod)
      .or(z.enum(['paypal', 'pola_wallet', 'cash_on_delivery']))
      .default(PaymentMethod.PAYPAL),
  }),
});

export const UpdateOrderStatusSchema = z.object({
  body: z.object({
    status: z.string().min(1),
    note: z.string().optional(),
    handoverOtp: z.string().optional(),
  }),
});
