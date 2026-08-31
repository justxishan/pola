import { Request, Response, NextFunction } from 'express';
import { Wallet } from '../models/Wallet.model.js';
import { LedgerEntry } from '../models/LedgerEntry.model.js';
import { PayoutService } from '../services/payout.service.js';
import { EscrowService } from '../services/escrow.service.js';
import { createPayPalOrder, capturePayPalOrder } from '../config/paypal.config.js';
import { AppError } from '../middleware/error.middleware.js';
import { TransactionType } from '@pola/shared';
import { LKR_TO_USD_RATE } from '../utils/constants.js';

export class WalletController {
  /**
   * Get authenticated user's wallet
   */
  static async getMyWallet(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const wallet = await EscrowService.getOrCreateWallet(userId, req.user!.role);

      res.status(200).json({
        success: true,
        data: { wallet },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get append-only transaction ledger
   */
  static async getTransactions(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const { page = 1, limit = 20, type } = req.query as any;

      const filter: any = { userId };
      if (type) filter.transactionType = type;

      const skip = (page - 1) * limit;
      const [transactions, total] = await Promise.all([
        LedgerEntry.find(filter)
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit)
          .populate('referenceOrderId', 'orderNumber status grandTotal'),
        LedgerEntry.countDocuments(filter),
      ]);

      res.status(200).json({
        success: true,
        data: {
          transactions,
          meta: {
            total,
            page: parseInt(page, 10),
            limit: parseInt(limit, 10),
            totalPages: Math.ceil(total / limit),
          },
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Request LankaPay Bank Withdrawal
   */
  static async requestWithdrawal(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const { amountLkr } = req.body;

      const entry = await PayoutService.requestWithdrawal(userId, amountLkr);

      res.status(201).json({
        success: true,
        message: `Withdrawal request of LKR ${amountLkr} submitted to LankaPay queue`,
        data: { entry },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Customer Top-up Wallet via PayPal
   */
  static async topUp(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const { amountLkr } = req.body;

      if (!amountLkr || amountLkr < 100) {
        throw new AppError('Minimum top-up amount is LKR 100', 400);
      }

      const amountUsd = amountLkr * LKR_TO_USD_RATE;
      const paypalOrder = await createPayPalOrder(amountUsd, `TOPUP-${userId}`, 'Pola Wallet Top-Up');

      const approveUrl = paypalOrder.links?.find((l: any) => l.rel === 'approve')?.href;

      res.status(200).json({
        success: true,
        data: {
          paypalOrderId: paypalOrder.id,
          approveUrl,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Confirm and capture Wallet Top-up
   */
  static async confirmTopUp(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const { paypalOrderId, amountLkr } = req.body;

      await capturePayPalOrder(paypalOrderId);

      const wallet = await EscrowService.getOrCreateWallet(userId, req.user!.role);
      const prevBal = wallet.availableBalanceLkr;
      wallet.availableBalanceLkr += amountLkr;
      await wallet.save();

      const ledgerEntry = await LedgerEntry.create({
        walletId: wallet._id,
        userId,
        transactionType: TransactionType.TOP_UP,
        amountLkr,
        previousBalanceLkr: prevBal,
        newBalanceLkr: wallet.availableBalanceLkr,
        description: `Top-up of LKR ${amountLkr.toFixed(2)} via PayPal`,
      });

      res.status(200).json({
        success: true,
        message: 'Wallet topped up successfully',
        data: { wallet, ledgerEntry },
      });
    } catch (error) {
      next(error);
    }
  }
}
