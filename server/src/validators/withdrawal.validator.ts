import { z } from 'zod';

export const RequestWithdrawalSchema = z.object({
  body: z.object({
    amountLkr: z.number().min(500, 'Minimum withdrawal amount is LKR 500'),
  }),
});

export const ProcessWithdrawalSchema = z.object({
  body: z.object({
    bankReferenceNumber: z.string().min(3, 'Bank transaction reference number is required'),
  }),
});

export const RejectWithdrawalSchema = z.object({
  body: z.object({
    rejectionReason: z.string().min(5, 'Rejection reason is required'),
  }),
});
