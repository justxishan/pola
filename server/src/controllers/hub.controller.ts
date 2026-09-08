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
import { Vehicle } from '../models/Vehicle.model.js';
import { getOrInitPlatformConfig } from '../models/PlatformConfig.model.js';
import { OrderStatus, QualityGrade, VerificationStatus } from '@pola/shared';

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

      // Re-calculate payouts based on PlatformConfig
      const config = await getOrInitPlatformConfig();
      const pCommRate = (config.platformCommissionPercent || 5) / 100;
      const cCommRate = (config.collectorCommissionPercent || 3) / 100;

      const platformFee = Math.round((item.subtotal * pCommRate) * 100) / 100;
      const collectorFee = item.collectorId ? Math.round((item.subtotal * cCommRate) * 100) / 100 : 0;
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

  /**
   * Get the driver's assigned hub(s) and today's collection schedule.
   * Backs HubIntakePage.tsx
   */
  static async getMyHubSchedule(req: Request, res: Response, next: NextFunction) {
    try {
      const driverId = req.user!.userId;
      let hubs = await VillageHub.find({ assignedLeg1Drivers: driverId, isActive: true })
        .populate('linkedDcId', 'name code district');

      if (!hubs || hubs.length === 0) {
        return res.status(200).json({
          success: true,
          data: {
            hubs: [],
            schedules: [],
            pendingOrders: [],
            needsAssignment: true,
          },
        });
      }

      const today = new Date().toLocaleDateString('en-US', { weekday: 'long' });
      const schedules = hubs.flatMap((hub) =>
        (hub.collectionSchedules || [])
          .filter((s) => s.isActive && (s.dayOfWeek === today || true))
          .map((s) => ({
            hubId: hub._id,
            hubName: hub.hubName,
            dcName: (hub.linkedDcId as any)?.name || 'Central Distribution Center',
            pickupWindow: `${s.startTime} - ${s.endTime}`,
            vehiclePlate: null,
          }))
      );

      const hubIds = hubs.map((h) => h._id);
      const pendingOrders = await Order.find({
        linkedVillageHubId: { $in: hubIds },
        status: {
          $in: [
            OrderStatus.PAYMENT_CONFIRMED,
            OrderStatus.AWAITING_HUB_COLLECTION,
            OrderStatus.COLLECTED_AT_HUB,
          ],
        },
      }).populate('items.farmerId', 'fullName');

      res.status(200).json({
        success: true,
        data: {
          hubs,
          schedules:
            schedules.length > 0
              ? schedules
              : hubs.map((h) => ({
                  hubId: h._id,
                  hubName: h.hubName,
                  dcName: (h.linkedDcId as any)?.name || 'Distribution Center',
                  pickupWindow: '08:00 AM - 02:00 PM',
                  vehiclePlate: null,
                })),
          pendingOrders,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Driver accepts today's scheduled Leg-1 run for a hub
   */
  static async acceptHubRun(req: Request, res: Response, next: NextFunction) {
    try {
      const driverId = req.user!.userId;
      const { hubId, vehicleId } = req.body;

      const hub = await VillageHub.findById(hubId);
      if (!hub) throw new AppError('Hub not found', 404);

      if (!hub.assignedLeg1Drivers.some((id: any) => id.toString() === driverId)) {
        throw new AppError('You are not assigned to this hub', 403);
      }

      if (vehicleId) {
        const vehicle = await Vehicle.findOne({
          _id: vehicleId,
          $or: [{ ownerId: driverId }, { assignedDriverId: driverId }],
          status: VerificationStatus.VERIFIED,
          operationalStatus: 'active',
          isAvailable: true,
        });
        if (!vehicle) throw new AppError('Vehicle not found, unverified, maintenance/suspended, or not owned by you', 400);
      }

      const result = await Order.updateMany(
        {
          linkedVillageHubId: hubId,
          status: { $in: [OrderStatus.PAYMENT_CONFIRMED, OrderStatus.AWAITING_HUB_COLLECTION] },
          leg1DriverId: { $exists: false },
        },
        {
          $set: {
            leg1DriverId: new Types.ObjectId(driverId),
            ...(vehicleId ? { leg1VehicleId: new Types.ObjectId(vehicleId) } : {}),
            status: OrderStatus.AWAITING_HUB_COLLECTION,
          },
          $push: {
            timeline: {
              status: OrderStatus.AWAITING_HUB_COLLECTION,
              timestamp: new Date(),
              updatedBy: new Types.ObjectId(driverId),
              note: "Leg-1 driver accepted today's collection run",
            },
          },
        }
      );

      res.status(200).json({
        success: true,
        message: `Assigned to ${result.modifiedCount} order(s)`,
        data: { modifiedCount: result.modifiedCount },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Depart from hub to Distribution Center
   */
  static async departForDc(req: Request, res: Response, next: NextFunction) {
    try {
      const driverId = req.user!.userId;
      const { hubId } = req.body;

      const result = await Order.updateMany(
        {
          linkedVillageHubId: hubId,
          leg1DriverId: driverId,
          status: OrderStatus.COLLECTED_AT_HUB,
        },
        {
          $set: { status: OrderStatus.IN_TRANSIT_TO_DC },
          $push: {
            timeline: {
              status: OrderStatus.IN_TRANSIT_TO_DC,
              timestamp: new Date(),
              updatedBy: new Types.ObjectId(driverId),
              note: 'Departed hub for Distribution Center',
            },
          },
        }
      );

      res.status(200).json({
        success: true,
        message: `Updated ${result.modifiedCount} order(s) to IN_TRANSIT_TO_DC`,
        data: { modifiedCount: result.modifiedCount },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * DC arrival confirmation
   */
  static async confirmDcArrival(req: Request, res: Response, next: NextFunction) {
    try {
      const driverId = req.user!.userId;
      const { hubId } = req.body;

      const result = await Order.updateMany(
        {
          linkedVillageHubId: hubId,
          leg1DriverId: driverId,
          status: OrderStatus.IN_TRANSIT_TO_DC,
        },
        {
          $set: { status: OrderStatus.RECEIVED_AT_DC },
          $push: {
            timeline: {
              status: OrderStatus.RECEIVED_AT_DC,
              timestamp: new Date(),
              updatedBy: new Types.ObjectId(driverId),
              note: 'Arrived and confirmed at Distribution Center',
            },
          },
        }
      );

      res.status(200).json({
        success: true,
        message: `Updated ${result.modifiedCount} order(s) to RECEIVED_AT_DC`,
        data: { modifiedCount: result.modifiedCount },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Manual admin override for stuck orders
   */
  static async adminOverrideStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const adminId = req.user!.userId;
      const { orderId } = req.params;
      const { newStatus, reason } = req.body;

      if (!newStatus || !Object.values(OrderStatus).includes(newStatus)) {
        throw new AppError('Invalid target order status', 400);
      }

      const order = await Order.findById(orderId);
      if (!order) throw new AppError('Order not found', 404);

      order.status = newStatus;
      order.timeline.push({
        status: newStatus,
        timestamp: new Date(),
        updatedBy: new Types.ObjectId(adminId),
        note: `Admin override: ${reason || 'Manual logistics status correction'}`,
      });
      await order.save();

      res.status(200).json({
        success: true,
        message: `Order status manually overridden to ${newStatus}`,
        data: { order },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Admin: Assign a leg-1 driver to a village hub
   */
  static async assignLeg1Driver(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { driverId } = req.body;

      if (!driverId) throw new AppError('driverId is required', 400);

      const hub = await VillageHub.findById(id);
      if (!hub) throw new AppError('Village Hub not found', 404);

      const driverObjId = new Types.ObjectId(driverId);
      if (!hub.assignedLeg1Drivers.some((d: any) => d.toString() === driverId)) {
        hub.assignedLeg1Drivers.push(driverObjId as any);
        await hub.save();
      }

      res.status(200).json({
        success: true,
        message: 'Driver assigned to hub successfully',
        data: { hub },
      });
    } catch (error) {
      next(error);
    }
  }
}
