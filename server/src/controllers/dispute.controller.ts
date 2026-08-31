import { Request, Response, NextFunction } from 'express';
import { Types } from 'mongoose';
import { Dispute } from '../models/Dispute.model.js';
import { Order } from '../models/Order.model.js';
import { QualityInspection } from '../models/QualityInspection.model.js';
import { EscrowService } from '../services/escrow.service.js';
import { CloudinaryService } from '../services/cloudinary.service.js';
import { AppError } from '../middleware/error.middleware.js';
import { OrderStatus } from '@pola/shared';

export class DisputeController {
  /**
   * File a new dispute with photo evidence
   */
  static async createDispute(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const { orderId, category, description } = req.body;

      const order = await Order.findById(orderId);
      if (!order) throw new AppError('Order not found', 404);

      // Find any hub inspection evidence for side-by-side comparison
      const inspections = await QualityInspection.find({ orderId: order._id });
      const hubPhotos = inspections.flatMap((i) => i.photos);

      const files = req.files as Express.Multer.File[];
      let claimantPhotos: string[] = [];

      if (files && files.length > 0) {
        const uploadPromises = files.map((file) =>
          CloudinaryService.uploadBuffer(file.buffer, 'pola/disputes')
        );
        const results = await Promise.all(uploadPromises);
        claimantPhotos = results.map((r) => r.secure_url);
      }

      const disputeNumber = `DSP-${Date.now().toString().slice(-6)}`;

      const dispute = await Dispute.create({
        disputeNumber,
        orderId: order._id,
        raisedByUserId: userId,
        raisedByUserRole: req.user!.role,
        category,
        description,
        inspectionEvidencePhotos: hubPhotos,
        claimantEvidencePhotos: claimantPhotos,
        status: 'opened',
      });

      order.status = OrderStatus.DISPUTED;
      order.timeline.push({
        status: OrderStatus.DISPUTED,
        timestamp: new Date(),
        updatedBy: new Types.ObjectId(userId),
        note: `Dispute opened: ${category} - ${description}`,
      });
      await order.save();

      res.status(201).json({
        success: true,
        message: 'Dispute submitted for administrative review',
        data: { dispute },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get disputes belonging to user
   */
  static async getMyDisputes(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const disputes = await Dispute.find({ raisedByUserId: userId })
        .populate('orderId', 'orderNumber grandTotal status items')
        .sort({ createdAt: -1 });

      res.status(200).json({
        success: true,
        data: { disputes },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get dispute by ID
   */
  static async getDisputeById(req: Request, res: Response, next: NextFunction) {
    try {
      const dispute = await Dispute.findById(req.params.id)
        .populate('orderId')
        .populate('raisedByUserId', 'fullName email phone');

      if (!dispute) throw new AppError('Dispute not found', 404);

      res.status(200).json({
        success: true,
        data: { dispute },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Admin Adjudicates Dispute
   */
  static async adjudicateDispute(req: Request, res: Response, next: NextFunction) {
    try {
      const adminId = req.user!.userId;
      const { id } = req.params;
      const { resolutionStatus, resolutionNotes, refundAmountLkr } = req.body;

      const dispute = await Dispute.findById(id);
      if (!dispute) throw new AppError('Dispute not found', 404);

      dispute.status = resolutionStatus;
      dispute.resolutionNotes = resolutionNotes;
      dispute.refundAmountLkr = refundAmountLkr || 0;
      dispute.adjudicatedByAdminId = new Types.ObjectId(adminId);
      dispute.adjudicatedAt = new Date();
      await dispute.save();

      // If resolved in customer favor with refund
      if (resolutionStatus === 'resolved_refund' && refundAmountLkr > 0) {
        await EscrowService.refundOrderToCustomerWallet(
          dispute.orderId,
          refundAmountLkr,
          `Dispute Resolution #${dispute.disputeNumber}: ${resolutionNotes}`
        );
      }

      res.status(200).json({
        success: true,
        message: 'Dispute adjudicated successfully',
        data: { dispute },
      });
    } catch (error) {
      next(error);
    }
  }
}
