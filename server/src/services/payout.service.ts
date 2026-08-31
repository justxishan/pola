import { Types } from 'mongoose';
import { Wallet } from '../models/Wallet.model.js';
import { LedgerEntry } from '../models/LedgerEntry.model.js';
import { User } from '../models/User.model.js';
import { TransactionType, WithdrawalStatus } from '@pola/shared';
import { MIN_WITHDRAWAL_AMOUNT_LKR } from '../utils/constants.js';
import { AppError } from '../middleware/error.middleware.js';
import { logger } from '../utils/logger.util.js';

export class PayoutService {
  /**
   * Submit a new withdrawal request to the LankaPay bank queue
   */
  static async requestWithdrawal(userId: Types.ObjectId | string, amountLkr: number) {
    if (amountLkr < MIN_WITHDRAWAL_AMOUNT_LKR) {
      throw new AppError(
        `Minimum withdrawal amount is LKR ${MIN_WITHDRAWAL_AMOUNT_LKR}`,
        400
      );
    }

    const user = await User.findById(userId);
    if (!user) throw new AppError('User not found', 404);

    if (!user.bankDetails || !user.bankDetails.accountNumber) {
      throw new AppError(
        'No verified payout bank account found on profile. Please add bank details first.',
        400
      );
    }

    const wallet = await Wallet.findOne({ userId });
    if (!wallet || wallet.availableBalanceLkr < amountLkr) {
      throw new AppError('Insufficient available wallet balance for withdrawal', 400);
    }

    if (wallet.isFrozen) {
      throw new AppError('Wallet is currently frozen. Please contact Pola support.', 403);
    }

    // Temporarily deduct available balance and log requested entry
    const prevBal = wallet.availableBalanceLkr;
    wallet.availableBalanceLkr -= amountLkr;
    await wallet.save();

    const ledgerEntry = await LedgerEntry.create({
      walletId: wallet._id,
      userId,
      transactionType: TransactionType.WITHDRAWAL,
      amountLkr: -amountLkr,
      previousBalanceLkr: prevBal,
      newBalanceLkr: wallet.availableBalanceLkr,
      withdrawalStatus: WithdrawalStatus.REQUESTED,
      description: `LankaPay withdrawal request of LKR ${amountLkr.toFixed(2)} to ${user.bankDetails.bankName} (Acc: ${user.bankDetails.accountNumber})`,
    });

    logger.info(`💸 Withdrawal requested: LKR ${amountLkr} by user ${userId}`);
    return ledgerEntry;
  }

  /**
   * Finance Admin marks withdrawal as processed with bank transaction reference
   */
  static async processWithdrawal(
    ledgerEntryId: Types.ObjectId | string,
    adminId: Types.ObjectId | string,
    bankReferenceNumber: string
  ) {
    const entry = await LedgerEntry.findById(ledgerEntryId);
    if (!entry) throw new AppError('Withdrawal entry not found', 404);

    if (entry.withdrawalStatus === WithdrawalStatus.PROCESSED) {
      throw new AppError('Withdrawal already marked as processed', 400);
    }

    entry.withdrawalStatus = WithdrawalStatus.PROCESSED;
    entry.bankReferenceNumber = bankReferenceNumber;
    entry.processedByAdminId = new Types.ObjectId(adminId);
    entry.processedAt = new Date();
    await entry.save();

    // Update wallet total withdrawn
    const wallet = await Wallet.findById(entry.walletId);
    if (wallet) {
      wallet.totalWithdrawnLkr += Math.abs(entry.amountLkr);
      await wallet.save();
    }

    logger.info(`✅ Withdrawal ${ledgerEntryId} processed with Ref: ${bankReferenceNumber}`);
    return entry;
  }

  /**
   * Finance Admin rejects a withdrawal (reverses deducted amount back to available balance)
   */
  static async rejectWithdrawal(
    ledgerEntryId: Types.ObjectId | string,
    adminId: Types.ObjectId | string,
    rejectionReason: string
  ) {
    const entry = await LedgerEntry.findById(ledgerEntryId);
    if (!entry) throw new AppError('Withdrawal entry not found', 404);

    if (entry.withdrawalStatus !== WithdrawalStatus.REQUESTED) {
      throw new AppError('Only requested withdrawals can be rejected', 400);
    }

    entry.withdrawalStatus = WithdrawalStatus.REJECTED;
    entry.rejectionReason = rejectionReason;
    entry.processedByAdminId = new Types.ObjectId(adminId);
    entry.processedAt = new Date();
    await entry.save();

    // Re-credit the wallet balance
    const wallet = await Wallet.findById(entry.walletId);
    if (wallet) {
      const prevBal = wallet.availableBalanceLkr;
      const refundAmount = Math.abs(entry.amountLkr);
      wallet.availableBalanceLkr += refundAmount;
      await wallet.save();

      await LedgerEntry.create({
        walletId: wallet._id,
        userId: entry.userId,
        transactionType: TransactionType.ADMIN_ADJUSTMENT,
        amountLkr: refundAmount,
        previousBalanceLkr: prevBal,
        newBalanceLkr: wallet.availableBalanceLkr,
        description: `Reversal of rejected withdrawal: ${rejectionReason}`,
        adminId: new Types.ObjectId(adminId),
        adminReason: rejectionReason,
      });
    }

    logger.info(`❌ Withdrawal ${ledgerEntryId} rejected: ${rejectionReason}`);
    return entry;
  }
}
