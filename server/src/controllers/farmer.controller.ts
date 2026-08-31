import { Request, Response, NextFunction } from 'express';
import { User } from '../models/User.model.js';
import { Product } from '../models/Product.model.js';
import { Order } from '../models/Order.model.js';
import { Wallet } from '../models/Wallet.model.js';
import { Farm } from '../models/Farm.model.js';
import { Role, OrderStatus, VerificationStatus } from '@pola/shared';
import { AppError } from '../middleware/error.middleware.js';
import { EscrowService } from '../services/escrow.service.js';

export class FarmerController {
  /**
   * Get Farmer Dashboard KPIs
   */
  static async getDashboardStats(req: Request, res: Response, next: NextFunction) {
    try {
      const farmerId = req.user!.userId;

      const [productsCount, farmsCount, wallet, recentOrders] = await Promise.all([
        Product.countDocuments({ farmerId, status: 'active' }),
        Farm.countDocuments({ farmerId, isActive: true }),
        Wallet.findOne({ userId: farmerId }),
        Order.find({ 'items.farmerId': farmerId })
          .sort({ createdAt: -1 })
          .limit(5)
          .select('orderNumber status items grandTotal createdAt'),
      ]);

      const pendingCollectionsCount = await Order.countDocuments({
        'items.farmerId': farmerId,
        status: {
          $in: [
            OrderStatus.PAYMENT_CONFIRMED,
            OrderStatus.AWAITING_HUB_COLLECTION,
          ],
        },
      });

      res.status(200).json({
        success: true,
        data: {
          activeProducts: productsCount,
          registeredFarms: farmsCount,
          pendingHubCollections: pendingCollectionsCount,
          wallet: {
            availableBalance: wallet?.availableBalanceLkr || 0,
            pendingEscrowBalance: wallet?.pendingEscrowBalanceLkr || 0,
            totalEarned: wallet?.totalEarnedLkr || 0,
          },
          recentOrders,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Village Collector onboards a smallholder farmer
   */
  static async quickOnboardFarmer(req: Request, res: Response, next: NextFunction) {
    try {
      const collectorId = req.user!.userId;
      const { fullName, phone, nicNumber, villageName, district, primaryCrops, bankDetails } =
        req.body;

      // Create managed farmer account
      const managedFarmer = await User.create({
        fullName,
        email: `farmer.${Date.now()}@pola.internal`,
        phone,
        nicNumber,
        role: Role.FARMER,
        kycStatus: VerificationStatus.VERIFIED, // Collector-verified
        linkedCollectorId: collectorId,
        bankDetails,
        addresses: [
          {
            label: 'Farm / Residence',
            province: 'Central', // Default or derived
            district,
            addressLine1: villageName,
            city: villageName,
            isDefault: true,
          },
        ],
      });

      // Create a default farm record
      await Farm.create({
        farmerId: managedFarmer._id,
        farmName: `${fullName}'s Smallholder Farm`,
        province: 'Central',
        district,
        addressLine: villageName,
        city: villageName,
        gps: { latitude: 7.8731, longitude: 80.7718 }, // Reference center
        extentValue: 1,
        extentUnit: 'acres',
        primaryCrops: primaryCrops || [],
      });

      // Link to collector's managed list
      await User.findByIdAndUpdate(collectorId, {
        $addToSet: { managedFarmers: managedFarmer._id },
      });

      await EscrowService.getOrCreateWallet(managedFarmer._id, Role.FARMER);

      res.status(201).json({
        success: true,
        message: 'Smallholder farmer onboarded successfully under Collector account',
        data: { farmer: managedFarmer },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get all managed farmers for the logged-in Village Collector
   */
  static async getManagedFarmers(req: Request, res: Response, next: NextFunction) {
    try {
      const collectorId = req.user!.userId;
      const collector = await User.findById(collectorId).populate('managedFarmers');
      if (!collector) throw new AppError('Collector not found', 404);

      res.status(200).json({
        success: true,
        data: { managedFarmers: collector.managedFarmers || [] },
      });
    } catch (error) {
      next(error);
    }
  }
}
