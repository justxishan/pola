import { Request, Response, NextFunction } from 'express';
import { Product } from '../models/Product.model.js';
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
   * Validate Cart Items, calculate subtotal with B2B tiers & delivery breakdown
   */
  static async validateCart(req: Request, res: Response, next: NextFunction) {
    try {
      const { items, deliveryDistrict } = req.body;

      if (!items || items.length === 0) {
        throw new AppError('Cart items are required', 400);
      }

      let itemsTotal = 0;
      let totalWeightKg = 0;
      const validatedItems = [];

      for (const item of items) {
        const product = await Product.findById(item.productId).populate('farmerId farmId');
        if (!product || product.status !== 'active') {
          throw new AppError(`Product "${item.productId}" is no longer available`, 400);
        }

        if (item.quantity > product.availableQuantity) {
          throw new AppError(
            `Insufficient stock for "${product.productName}". Available: ${product.availableQuantity} ${product.unit}`,
            400
          );
        }

        // Determine unit price based on B2B tier
        let unitPrice = product.basePricePerUnit;
        if (product.b2bPricingTiers && product.b2bPricingTiers.length > 0) {
          for (const tier of product.b2bPricingTiers) {
            if (
              item.quantity >= tier.minQuantity &&
              (!tier.maxQuantity || item.quantity <= tier.maxQuantity)
            ) {
              unitPrice = tier.unitPrice;
              break;
            }
          }
        }

        const subtotal = Math.round(unitPrice * item.quantity * 100) / 100;
        itemsTotal += subtotal;
        totalWeightKg += item.quantity; // approximate kg

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
          farmId: product.farmId?._id,
          productName: product.productName,
          category: product.category,
          unit: product.unit,
          quantityOrdered: item.quantity,
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
      const leg1Fee = LEG1_FLAT_FEE_LKR + totalWeightKg * LEG1_PER_KG_LKR;
      const leg2Fee = LEG2_BASE_FEE_LKR + totalWeightKg * LEG2_PER_KG_LKR;
      const totalDeliveryFee = leg1Fee + leg2Fee;
      const grandTotal = itemsTotal + totalDeliveryFee;

      res.status(200).json({
        success: true,
        data: {
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
