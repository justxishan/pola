import { Request, Response, NextFunction } from 'express';
import { Types } from 'mongoose';
import { User } from '../models/User.model.js';
import { Order } from '../models/Order.model.js';
import { LedgerEntry } from '../models/LedgerEntry.model.js';
import { AuditLog } from '../models/AuditLog.model.js';
import { PayoutService } from '../services/payout.service.js';
import { AppError } from '../middleware/error.middleware.js';
import { VerificationStatus, WithdrawalStatus, OrderStatus, Role } from '@pola/shared';

export class AdminController {
  /**
   * Executive Command Center Dashboard KPIs
   */
  static async getDashboardMetrics(req: Request, res: Response, next: NextFunction) {
    try {
      const [
        totalUsers,
        pendingKycCount,
        pendingWithdrawalsCount,
        activeOrdersCount,
        totalGmvResult,
      ] = await Promise.all([
        User.countDocuments({ isActive: true }),
        User.countDocuments({ kycStatus: VerificationStatus.PENDING }),
        LedgerEntry.countDocuments({ withdrawalStatus: WithdrawalStatus.REQUESTED }),
        Order.countDocuments({
          status: {
            $nin: [
              OrderStatus.COMPLETED,
              OrderStatus.CANCELLED,
              OrderStatus.REFUNDED,
            ],
          },
        }),
        Order.aggregate([
          { $match: { status: OrderStatus.COMPLETED } },
          {
            $group: {
              _id: null,
              gmv: { $sum: '$grandTotal' },
              platformRevenue: { $sum: '$platformFeeTotal' },
            },
          },
        ]),
      ]);

      const gmv = totalGmvResult[0]?.gmv || 0;
      const platformRevenue = totalGmvResult[0]?.platformRevenue || 0;

      res.status(200).json({
        success: true,
        data: {
          totalUsers,
          pendingKycCount,
          pendingWithdrawalsCount,
          activeOrdersCount,
          gmv,
          platformRevenue,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get KYC Approval Queue
   */
  static async getKycQueue(req: Request, res: Response, next: NextFunction) {
    try {
      const { role } = req.query;
      const filter: any = { kycStatus: VerificationStatus.PENDING };
      if (role) filter.role = role;

      const users = await User.find(filter).sort({ updatedAt: -1 });

      res.status(200).json({
        success: true,
        data: { users },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Review & Approve / Reject KYC Submission
   */
  static async reviewKyc(req: Request, res: Response, next: NextFunction) {
    try {
      const adminId = req.user!.userId;
      const { id } = req.params;
      const { status, rejectionReason } = req.body;

      const user = await User.findById(id);
      if (!user) throw new AppError('User not found', 404);

      user.kycStatus = status as VerificationStatus;
      user.kycReviewedBy = new Types.ObjectId(adminId);
      user.kycReviewedAt = new Date();
      if (status === VerificationStatus.REJECTED) {
        user.kycRejectionReason = rejectionReason || 'Documents rejected';
      }

      await user.save();

      // Log Audit Trail
      await AuditLog.create({
        adminId: new Types.ObjectId(adminId),
        adminEmail: req.user!.email,
        adminRole: req.user!.role,
        action: `KYC_${status.toUpperCase()}`,
        targetEntity: 'User',
        targetId: user._id.toString(),
        details: { status, rejectionReason },
      });

      res.status(200).json({
        success: true,
        message: `KYC status updated to ${status}`,
        data: { user },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get LankaPay Withdrawal Queue
   */
  static async getWithdrawalQueue(req: Request, res: Response, next: NextFunction) {
    try {
      const entries = await LedgerEntry.find({
        withdrawalStatus: WithdrawalStatus.REQUESTED,
      })
        .populate('userId', 'fullName email phone bankDetails role')
        .sort({ createdAt: 1 });

      res.status(200).json({
        success: true,
        data: { queue: entries },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Process LankaPay Withdrawal
   */
  static async processWithdrawal(req: Request, res: Response, next: NextFunction) {
    try {
      const adminId = req.user!.userId;
      const { id } = req.params;
      const { bankReferenceNumber } = req.body;

      const entry = await PayoutService.processWithdrawal(id, adminId, bankReferenceNumber);

      await AuditLog.create({
        adminId: new Types.ObjectId(adminId),
        adminEmail: req.user!.email,
        adminRole: req.user!.role,
        action: 'WITHDRAWAL_PROCESSED',
        targetEntity: 'LedgerEntry',
        targetId: id,
        details: { bankReferenceNumber, amount: entry.amountLkr },
      });

      res.status(200).json({
        success: true,
        message: 'Withdrawal marked as processed',
        data: { entry },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Reject LankaPay Withdrawal
   */
  static async rejectWithdrawal(req: Request, res: Response, next: NextFunction) {
    try {
      const adminId = req.user!.userId;
      const { id } = req.params;
      const { rejectionReason } = req.body;

      const entry = await PayoutService.rejectWithdrawal(id, adminId, rejectionReason);

      await AuditLog.create({
        adminId: new Types.ObjectId(adminId),
        adminEmail: req.user!.email,
        adminRole: req.user!.role,
        action: 'WITHDRAWAL_REJECTED',
        targetEntity: 'LedgerEntry',
        targetId: id,
        details: { rejectionReason, amount: entry.amountLkr },
      });

      res.status(200).json({
        success: true,
        message: 'Withdrawal rejected and amount reversed to wallet',
        data: { entry },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Force reassign stuck Leg-2 delivery order
   */
  static async forceReassignOrder(req: Request, res: Response, next: NextFunction) {
    try {
      const adminId = req.user!.userId;
      const { id } = req.params;
      const { driverId, reason } = req.body;

      const order = await Order.findById(id);
      if (!order) throw new AppError('Order not found', 404);

      order.leg2DriverId = new Types.ObjectId(driverId);
      order.timeline.push({
        status: order.status,
        timestamp: new Date(),
        updatedBy: new Types.ObjectId(adminId),
        note: `Admin force reassigned order to driver ${driverId}. Reason: ${reason || 'Stuck dispatch'}`,
      });

      await order.save();

      await AuditLog.create({
        adminId: new Types.ObjectId(adminId),
        adminEmail: req.user!.email,
        adminRole: req.user!.role,
        action: 'ORDER_FORCE_REASSIGNED',
        targetEntity: 'Order',
        targetId: id,
        details: { driverId, reason },
      });

      res.status(200).json({
        success: true,
        message: 'Order reassigned successfully',
        data: { order },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get Immutable Audit Logs
   */
  static async getAuditLogs(req: Request, res: Response, next: NextFunction) {
    try {
      const { page = 1, limit = 50, action } = req.query as any;
      const filter: any = {};
      if (action) filter.action = action;

      const skip = (page - 1) * limit;
      const [logs, total] = await Promise.all([
        AuditLog.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
        AuditLog.countDocuments(filter),
      ]);

      res.status(200).json({
        success: true,
        data: {
          logs,
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
}
