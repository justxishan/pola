import { Request, Response, NextFunction } from 'express';
import { Types } from 'mongoose';
import { Product } from '../models/Product.model.js';
import { Cart } from '../models/Cart.model.js';
import { DistributionCenter } from '../models/DistributionCenter.model.js';
import { AppError } from '../middleware/error.middleware.js';
import {
  LEG1_FLAT_FEE_LKR,
  LEG1_PER_KG_LKR,
  LEG2_BASE_FEE_LKR,
  LEG2_PER_KG_LKR,
  DEFAULT_PLATFORM_COMMISSION_PERCENT,
  DEFAULT_COLLECTOR_COMMISSION_PERCENT,
} from '../utils/constants.js';

export class CartController {
  /**
   * Get saved cart for authenticated user
   */
  static async getSavedCart(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const cart = await Cart.findOne({ userId });

      res.status(200).json({
        success: true,
        data: {
          items: cart ? cart.items : [],
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Save / sync user cart items in DB
   */
  static async saveCart(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const { items } = req.body;

      if (!Array.isArray(items)) {
        throw new AppError('Items must be an array', 400);
      }

      const formattedItems = items.map((item: any) => ({
        productId: new Types.ObjectId(item.productId),
        farmerId: item.farmerId && Types.ObjectId.isValid(item.farmerId) ? new Types.ObjectId(item.farmerId) : undefined,
        title: item.title || item.productName || 'Fresh Produce',
        pricePerUnit: item.pricePerUnit || item.basePricePerUnit || 0,
        unit: item.unit || 'kg',
        quantity: item.quantity || 1,
        image: item.image || (item.images && item.images[0]) || '',
        farmerName: item.farmerName || '',
        minOrderQuantity: item.minOrderQuantity || 1,
        maxOrderQuantity: item.maxOrderQuantity,
        tierPricing: item.tierPricing || [],
      }));

      const cart = await Cart.findOneAndUpdate(
        { userId },
        { userId, items: formattedItems, updatedAt: new Date() },
        { upsert: true, new: true }
      );

      res.status(200).json({
        success: true,
        message: 'Cart synchronized with database',
        data: { items: cart.items },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Clear saved cart in DB
   */
  static async clearSavedCart(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      await Cart.findOneAndDelete({ userId });

      res.status(200).json({
        success: true,
        message: 'Saved cart cleared',
        data: { items: [] },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Validate Cart Items, check available stock & price changes, calculate subtotal with B2B tiers & delivery breakdown
   */
  static async validateCart(req: Request, res: Response, next: NextFunction) {
    try {
      const { items, deliveryDistrict } = req.body;

      if (!items || items.length === 0) {
        return res.status(200).json({
          success: true,
          data: {
            hasIssues: false,
            stockIssues: [],
            items: [],
            calculation: {
              itemsTotal: 0,
              leg1DeliveryFee: 0,
              leg2DeliveryFee: 0,
              totalDeliveryFee: 0,
              grandTotal: 0,
              totalWeightKg: 0,
            },
          },
        });
      }

      let itemsTotal = 0;
      let totalWeightKg = 0;
      const validatedItems = [];
      const stockIssues: Array<{
        productId: string;
        issueType: 'out_of_stock' | 'insufficient_stock' | 'price_changed' | 'delisted';
        message: string;
        availableQuantity: number;
        currentPrice: number;
        previousPrice?: number;
      }> = [];

      for (const item of items) {
        const product = await Product.findById(item.productId).populate('farmerId farmId');
        if (!product || product.status !== 'active') {
          stockIssues.push({
            productId: item.productId,
            issueType: 'delisted',
            message: 'Produce lot is no longer active or has been delisted',
            availableQuantity: 0,
            currentPrice: 0,
          });
          continue;
        }

        let effectiveQuantity = item.quantity;
        if (product.availableQuantity <= 0) {
          stockIssues.push({
            productId: item.productId,
            issueType: 'out_of_stock',
            message: `"${product.productName}" is currently out of stock`,
            availableQuantity: 0,
            currentPrice: product.basePricePerUnit,
          });
          effectiveQuantity = 0;
        } else if (item.quantity > product.availableQuantity) {
          stockIssues.push({
            productId: item.productId,
            issueType: 'insufficient_stock',
            message: `Only ${product.availableQuantity} ${product.unit} left — quantity adjusted`,
            availableQuantity: product.availableQuantity,
            currentPrice: product.basePricePerUnit,
          });
          effectiveQuantity = product.availableQuantity;
        }

        // Determine unit price based on B2B tier
        let unitPrice = product.basePricePerUnit;
        if (product.b2bPricingTiers && product.b2bPricingTiers.length > 0) {
          for (const tier of product.b2bPricingTiers) {
            if (
              effectiveQuantity >= tier.minQuantity &&
              (!tier.maxQuantity || effectiveQuantity <= tier.maxQuantity)
            ) {
              unitPrice = tier.unitPrice;
              break;
            }
          }
        }

        if (item.pricePerUnit !== undefined && Math.abs(item.pricePerUnit - unitPrice) > 0.01) {
          stockIssues.push({
            productId: item.productId,
            issueType: 'price_changed',
            message: `Price updated to LKR ${unitPrice}/${product.unit}`,
            availableQuantity: product.availableQuantity,
            currentPrice: unitPrice,
            previousPrice: item.pricePerUnit,
          });
        }

        if (effectiveQuantity <= 0) continue;

        const subtotal = Math.round(unitPrice * effectiveQuantity * 100) / 100;
        itemsTotal += subtotal;
        totalWeightKg += effectiveQuantity; // approximate kg

        // Commissions
        const platformCommission =
          Math.round((subtotal * DEFAULT_PLATFORM_COMMISSION_PERCENT) / 100 * 100) / 100;
        const farmer = product.farmerId as any;
        const hasCollector = farmer?.linkedCollectorId;
        const collectorCommission = hasCollector
          ? Math.round((subtotal * DEFAULT_COLLECTOR_COMMISSION_PERCENT) / 100 * 100) / 100
          : 0;

        const farmerPayout = subtotal - platformCommission - collectorCommission;

        validatedItems.push({
          productId: product._id,
          farmerId: farmer?._id,
          farmerName: farmer?.fullName || 'Verified Farmer',
          farmId: product.farmId?._id,
          productName: product.productName,
          category: product.category,
          unit: product.unit,
          quantityOrdered: effectiveQuantity,
          unitPrice,
          subtotal,
          selfDeclaredGrade: product.selfDeclaredGrade,
          collectorId: hasCollector ? farmer.linkedCollectorId : undefined,
          collectorCommissionLkr: collectorCommission,
          platformCommissionLkr: platformCommission,
          farmerPayoutLkr: farmerPayout,
          images: product.images,
        });
      }

      // Determine appropriate DC
      let assignedDc = await DistributionCenter.findOne({ isMainHub: true });
      if (deliveryDistrict) {
        const regionalDc = await DistributionCenter.findOne({ district: deliveryDistrict });
        if (regionalDc) assignedDc = regionalDc;
      }

      // Delivery Fees
      const leg1Fee = totalWeightKg > 0 ? LEG1_FLAT_FEE_LKR + totalWeightKg * LEG1_PER_KG_LKR : 0;
      const leg2Fee = totalWeightKg > 0 ? LEG2_BASE_FEE_LKR + totalWeightKg * LEG2_PER_KG_LKR : 0;
      const totalDeliveryFee = leg1Fee + leg2Fee;
      const grandTotal = itemsTotal + totalDeliveryFee;

      res.status(200).json({
        success: true,
        data: {
          hasIssues: stockIssues.length > 0,
          stockIssues,
          items: validatedItems,
          assignedDc: assignedDc ? { id: assignedDc._id, name: assignedDc.name, code: assignedDc.code } : null,
          calculation: {
            itemsTotal,
            leg1DeliveryFee: leg1Fee,
            leg2DeliveryFee: leg2Fee,
            totalDeliveryFee,
            grandTotal,
            totalWeightKg,
          },
        },
      });
    } catch (error) {
      next(error);
    }
  }
}
