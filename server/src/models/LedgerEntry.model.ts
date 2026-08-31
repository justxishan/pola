import mongoose, { Document, Schema, Types } from 'mongoose';
import { TransactionType, WithdrawalStatus } from '@pola/shared';

export interface ILedgerEntry extends Document {
  _id: Types.ObjectId;
  walletId: Types.ObjectId;
  userId: Types.ObjectId;
  transactionType: TransactionType;
  amountLkr: number; // Positive for credits, negative for debits
  previousBalanceLkr: number;
  newBalanceLkr: number;
  referenceOrderId?: Types.ObjectId;
  referenceOrderItemId?: Types.ObjectId;
  description: string;

  // Withdrawal processing fields
  withdrawalStatus?: WithdrawalStatus;
  bankReferenceNumber?: string;
  processedByAdminId?: Types.ObjectId;
  processedAt?: Date;
  rejectionReason?: string;

  // Admin adjustments
  adminId?: Types.ObjectId;
  adminReason?: string;

  createdAt: Date;
}

const LedgerEntrySchema = new Schema<ILedgerEntry>(
  {
    walletId: { type: Schema.Types.ObjectId, ref: 'Wallet', required: true, index: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    transactionType: {
      type: String,
      enum: Object.values(TransactionType),
      required: true,
      index: true,
    },
    amountLkr: { type: Number, required: true },
    previousBalanceLkr: { type: Number, required: true },
    newBalanceLkr: { type: Number, required: true },
    referenceOrderId: { type: Schema.Types.ObjectId, ref: 'Order' },
    description: { type: String, required: true },

    withdrawalStatus: {
      type: String,
      enum: Object.values(WithdrawalStatus),
      sparse: true,
      index: true,
    },
    bankReferenceNumber: { type: String },
    processedByAdminId: { type: Schema.Types.ObjectId, ref: 'User' },
    processedAt: { type: Date },
    rejectionReason: { type: String },

    adminId: { type: Schema.Types.ObjectId, ref: 'User' },
    adminReason: { type: String },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

LedgerEntrySchema.index({ userId: 1, createdAt: -1 });

export const LedgerEntry = mongoose.model<ILedgerEntry>('LedgerEntry', LedgerEntrySchema);
