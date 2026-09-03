import { Request, Response, NextFunction } from 'express';
import { Types } from 'mongoose';
import { VillageHub } from '../models/VillageHub.model.js';
import { QualityInspection } from '../models/QualityInspection.model.js';
import { Order } from '../models/Order.model.js';
import { User } from '../models/User.model.js';
import { WastageLog } from '../models/WastageLog.model.js';
import { GradingService } from '../services/grading.service.js';
import { CloudinaryService } from '../services/cloudinary.service.js';
import { AppError } from '../middleware/error.middleware.js';
import { OrderStatus, QualityGrade } from '@pola/shared';

export class HubController {
  /**
   * Get all Village Hubs with optional district filter
   */
  static async getHubs(req: Request, res: Response, next: NextFunction) {
    try {
      const { district, province } = req.query;
      const filter: any = { isActive: true };
      if (district) filter.district = district;
      if (province) filter.province = province;

      const hubs = await VillageHub.find(filter).populate('linkedDcId', 'name code district');
      res.status(200).json({
        success: true,
        data: { hubs },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get Hub details by ID
   */
  static async getHubById(req: Request, res: Response, next: NextFunction) {
    try {
      const hub = await VillageHub.findById(req.params.id)
        .populate('linkedDcId')
        .populate('assignedCollectors', 'fullName phone')
        .populate('assignedLeg1Drivers', 'fullName phone');

      if (!hub) throw new AppError('Village Hub not found', 404);

      res.status(200).json({
        success: true,
        data: { hub },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Submit Hub Intake Grading & Weight Verification Sheet
   */
  static async submitIntakeGrading(req: Request, res: Response, next: NextFunction) {
    try {
      const inspectorId = req.user!.userId;
      const {
        orderId,
        productId,
        confirmedQuantity,
        assignedGrade,
        temperatureCelsius,
        criteriaNotes,
        photos,
        rejectionReason,
        rejectionDisposition,
      } = req.body;

      const order = await Order.findById(orderId);
      if (!order) throw new AppError('Order not found', 404);

      const item = order.items.find((i) => i.productId.toString() === productId);
      if (!item) throw new AppError('Produce item not found in order', 404);

      const listedQuantity = item.quantityOrdered;
      const varianceResult = GradingService.calculateWeightVariance(
        listedQuantity,
        confirmedQuantity
      );
      const { finalPrice, multiplier } = GradingService.calculateAdjustedPrice(
        item.unitPrice,
        assignedGrade as QualityGrade
      );

      // Update Order Item Snapshot
      item.quantityCollected = confirmedQuantity;
      item.inspectedGrade = assignedGrade as QualityGrade;
      item.gradeMultiplierApplied = multiplier;
      item.finalPrice = finalPrice;
      item.subtotal = finalPrice * confirmedQuantity;

      // Re-calculate payouts
      const platformFee = Math.round((item.subtotal * 0.05) * 100) / 100;
      const collectorFee = item.collectorId ? Math.round((item.subtotal * 0.03) * 100) / 100 : 0;
      item.platformCommissionLkr = platformFee;
      item.collectorCommissionLkr = collectorFee;
      item.farmerPayoutLkr = item.subtotal - platformFee - collectorFee;

      // Advance Order State if in collection phase
      if (order.status === OrderStatus.PAYMENT_CONFIRMED || order.status === OrderStatus.AWAITING_HUB_COLLECTION) {
        order.status = OrderStatus.COLLECTED_AT_HUB;
        order.timeline.push({
          status: OrderStatus.COLLECTED_AT_HUB,
          timestamp: new Date(),
          updatedBy: new Types.ObjectId(inspectorId),
          note: `Inspected at Hub: Grade ${assignedGrade.toUpperCase()}, Weight: ${confirmedQuantity} ${item.unit}`,
        });
      }

      await order.save();

      // Log Inspection Record
      const inspection = await QualityInspection.create({
        orderId: order._id,
        productId: new Types.ObjectId(productId),
        farmerId: item.farmerId,
        inspectorId: new Types.ObjectId(inspectorId),
        stage: 'hub_intake',
        hubId: order.linkedVillageHubId,
        dcId: order.assignedDcId,
        selfDeclaredGrade: item.selfDeclaredGrade,
        assignedGrade,
        priceMultiplier: multiplier,
        listedQuantity,
        confirmedQuantity,
        weightVariancePercent: varianceResult.variancePercent,
        temperatureCelsius,
        criteriaNotes,
        photos: photos || [],
        rejectionReason,
        rejectionDisposition,
      });

      // If Rejected, create a Wastage Log entry
      if (assignedGrade === QualityGrade.REJECTED && rejectionReason && rejectionDisposition) {
        await WastageLog.create({
          orderId: order._id,
          productId: new Types.ObjectId(productId),
          productName: item.productName,
          category: item.category,
          farmerId: item.farmerId,
          hubId: order.linkedVillageHubId,
          recordedByUserId: new Types.ObjectId(inspectorId),
          quantityKg: confirmedQuantity || listedQuantity,
          estimatedLossLkr: item.unitPrice * (confirmedQuantity || listedQuantity),
          stageCaught: 'hub_intake',
          reason: rejectionReason,
          disposition: rejectionDisposition,
          photoEvidence: photos?.[0],
          notes: criteriaNotes,
        });
      }

      res.status(201).json({
        success: true,
        message: 'Hub intake grading sheet submitted successfully',
        data: { inspection, order },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get authenticated farmer's assigned hub, upcoming drop-off batch, and inspection receipts
   */
  static async getMyHubDropoffs(req: Request, res: Response, next: NextFunction) {
    try {
      const farmerId = req.user!.userId;
      const user = await User.findById(farmerId);

      // 1. Find assigned hub or fallback to nearest/first hub in district/province
      let assignedHub = null;
      if (user?.assignedHubId) {
        assignedHub = await VillageHub.findById(user.assignedHubId).populate('linkedDcId', 'name code district');
      }
      if (!assignedHub) {
        const userDistrict = user?.addresses?.[0]?.district;
        const query: any = { isActive: true };
        if (userDistrict) query.district = userDistrict;
        assignedHub = await VillageHub.findOne(query).populate('linkedDcId', 'name code district');
        if (!assignedHub) {
          assignedHub = await VillageHub.findOne({ isActive: true }).populate('linkedDcId', 'name code district');
        }
      }

      // 2. Aggregate upcoming drop-off batch from active orders
      const pendingOrders = await Order.find({
        'items.farmerId': farmerId,
        status: {
          $in: [OrderStatus.PAYMENT_CONFIRMED, OrderStatus.AWAITING_HUB_COLLECTION],
        },
      }).select('orderNumber items status createdAt');

      const cropAggregates: { [key: string]: { cropName: string; totalQuantity: number; unit: string; totalValue: number } } = {};
      let totalBatchKg = 0;
      let totalBatchValue = 0;

      for (const order of pendingOrders) {
        for (const item of order.items) {
          if (String(item.farmerId) === String(farmerId)) {
            const name = item.productName || 'Produce Lot';
            const qty = item.quantityOrdered || 0;
            const price = item.unitPrice || 0;
            const val = item.subtotal || (qty * price);

            if (!cropAggregates[name]) {
              cropAggregates[name] = {
                cropName: name,
                totalQuantity: 0,
                unit: item.unit || 'kg',
                totalValue: 0,
              };
            }
            cropAggregates[name].totalQuantity += qty;
            cropAggregates[name].totalValue += val;
            totalBatchKg += qty;
            totalBatchValue += val;
          }
        }
      }

      const upcomingCrops = Object.values(cropAggregates);
      const cratesRequired = Math.ceil(totalBatchKg / 20) || 0; // 20kg per crate

      // 3. Past Quality Inspections / Receipts
      const inspections = await QualityInspection.find({ farmerId })
        .populate('hubId', 'hubName addressLine city')
        .populate('productId', 'productName title unit')
        .populate('orderId', 'orderNumber')
        .sort({ createdAt: -1 })
        .limit(20);

      res.status(200).json({
        success: true,
        data: {
          assignedHub,
          upcomingBatch: {
            ordersCount: pendingOrders.length,
            crops: upcomingCrops,
            totalBatchKg,
            totalBatchValue,
            cratesRequired,
          },
          inspections,
        },
      });
    } catch (error) {
      next(error);
    }
  }
}
