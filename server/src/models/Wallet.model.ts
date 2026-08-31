import mongoose, { Document, Schema, Types } from 'mongoose';
import { Role } from '@pola/shared';

export interface IWallet extends Document {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  userRole: Role;
  availableBalanceLkr: number;
  pendingEscrowBalanceLkr: number;
  totalEarnedLkr: number;
  totalWithdrawnLkr: number;
  payoutBankAccount?: {
    bankName: string;
    branchName: string;
    accountNumber: string;
    accountHolderName: string;
  };
  isActive: boolean;
  isFrozen: boolean;
  freezeReason?: string;
  createdAt: Date;
  updatedAt: Date;
}

const WalletSchema = new Schema<IWallet>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true, index: true },
    userRole: { type: String, enum: Object.values(Role), required: true },
    availableBalanceLkr: { type: Number, default: 0, min: 0 },
    pendingEscrowBalanceLkr: { type: Number, default: 0, min: 0 },
    totalEarnedLkr: { type: Number, default: 0 },
    totalWithdrawnLkr: { type: Number, default: 0 },
    payoutBankAccount: {
      bankName: { type: String },
      branchName: { type: String },
      accountNumber: { type: String },
      accountHolderName: { type: String },
    },
    isActive: { type: Boolean, default: true },
    isFrozen: { type: Boolean, default: false },
    freezeReason: { type: String },
  },
  { timestamps: true }
);

export const Wallet = mongoose.model<IWallet>('Wallet', WalletSchema);
