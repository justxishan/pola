import { Request, Response, NextFunction } from 'express';
import { Types } from 'mongoose';
import { Rating } from '../models/Rating.model.js';
import { Product } from '../models/Product.model.js';
import { Order } from '../models/Order.model.js';
import { User } from '../models/User.model.js';
import { AppError } from '../middleware/error.middleware.js';

export class RatingController {
  /**
   * Submit two-way produce, farmer, or customer rating with upsert support
   */
  static async submitRating(req: Request, res: Response, next: NextFunction) {
    try {
      const raterUserId = req.user!.userId;
      const { orderId, targetType, targetUserId, productId, ratingScore, reviewText, tags, photos } =
        req.body;

      const order = await Order.findById(orderId);
      if (!order) throw new AppError('Order not found', 404);

      // Resolve targetUserId and productId if missing, null, or invalid
      let resolvedTargetUserId = targetUserId;
      let resolvedProductId = productId;

      if (!resolvedTargetUserId || !Types.ObjectId.isValid(resolvedTargetUserId)) {
        if (targetType === 'farmer' || targetType === 'produce_farmer') {
          if (resolvedProductId && Types.ObjectId.isValid(resolvedProductId)) {
            const matchingItem = order.items.find(
              (i) => (i.productId?._id || i.productId)?.toString() === resolvedProductId.toString()
            );
            resolvedTargetUserId = matchingItem?.farmerId?._id || matchingItem?.farmerId;
          }
          if (!resolvedTargetUserId && order.items.length > 0) {
            resolvedTargetUserId = order.items[0]?.farmerId?._id || order.items[0]?.farmerId;
          }
        } else if (targetType === 'driver' || targetType === 'delivery_driver') {
          resolvedTargetUserId =
            order.leg2DriverId?._id ||
            order.leg2DriverId ||
            order.leg1DriverId?._id ||
            order.leg1DriverId;
        } else if (targetType === 'customer') {
          resolvedTargetUserId = order.customerId?._id || order.customerId;
        }
      }

      if (!resolvedProductId && (targetType === 'farmer' || targetType === 'produce_farmer') && order.items.length > 0) {
        resolvedProductId = order.items[0]?.productId?._id || order.items[0]?.productId;
      }

      if (!resolvedTargetUserId || !Types.ObjectId.isValid(resolvedTargetUserId)) {
        throw new AppError(
          `Unable to attribute ${targetType} rating: no matching partner assigned to this order`,
          400
        );
      }

      // Normalized targetType
      const normalizedTargetType =
        targetType === 'farmer' ? 'produce_farmer' :
        targetType === 'driver' ? 'delivery_driver' :
        targetType;

      // Upsert: Find existing rating for this order + rater + target/product
      const lookupFilter: any = {
        orderId: new Types.ObjectId(orderId),
        raterUserId: new Types.ObjectId(raterUserId),
        targetType: normalizedTargetType,
      };

      if (resolvedProductId && Types.ObjectId.isValid(resolvedProductId)) {
        lookupFilter.productId = new Types.ObjectId(resolvedProductId);
      } else {
        lookupFilter.targetUserId = new Types.ObjectId(resolvedTargetUserId);
      }

      const updatePayload: any = {
        orderId: new Types.ObjectId(orderId),
        raterUserId: new Types.ObjectId(raterUserId),
        targetType: normalizedTargetType,
        targetUserId: new Types.ObjectId(resolvedTargetUserId),
        productId: resolvedProductId && Types.ObjectId.isValid(resolvedProductId) ? new Types.ObjectId(resolvedProductId) : undefined,
        ratingScore: Math.min(5, Math.max(1, Number(ratingScore) || 5)),
        reviewText: reviewText || '',
        tags: tags || [],
        photos: photos || [],
        isPublic: true,
      };

      const rating = await Rating.findOneAndUpdate(
        lookupFilter,
        { $set: updatePayload },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );

      // 1. Update product rating aggregate if product was rated
      if (resolvedProductId && Types.ObjectId.isValid(resolvedProductId)) {
        const prodStats = await Rating.aggregate([
          { $match: { productId: new Types.ObjectId(resolvedProductId), isPublic: true } },
          {
            $group: {
              _id: '$productId',
              avgRating: { $avg: '$ratingScore' },
              count: { $sum: 1 },
            },
          },
        ]);

        if (prodStats.length > 0) {
          await Product.findByIdAndUpdate(resolvedProductId, {
            averageRating: Math.round(prodStats[0].avgRating * 10) / 10,
            ratingCount: prodStats[0].count,
          });
        }
      }

      // 2. Update target user rating aggregate (farmer, customer, or driver)
      if (resolvedTargetUserId && Types.ObjectId.isValid(resolvedTargetUserId)) {
        const userStats = await Rating.aggregate([
          { $match: { targetUserId: new Types.ObjectId(resolvedTargetUserId), isPublic: true } },
          {
            $group: {
              _id: '$targetUserId',
              avgRating: { $avg: '$ratingScore' },
              count: { $sum: 1 },
            },
          },
        ]);

        if (userStats.length > 0) {
          await User.findByIdAndUpdate(resolvedTargetUserId, {
            ratingAverage: Math.round(userStats[0].avgRating * 10) / 10,
            ratingCount: userStats[0].count,
          });
        }
      }

      res.status(200).json({
        success: true,
        message: 'Rating and review submitted successfully',
        data: { rating },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get ratings and reviews for a target farmer / driver / customer / product
   */
  static async getTargetRatings(req: Request, res: Response, next: NextFunction) {
    try {
      const { targetUserId, productId, targetType, limit = 20 } = req.query as any;
      const filter: any = { isPublic: true };
      if (targetUserId && Types.ObjectId.isValid(targetUserId)) {
        filter.targetUserId = new Types.ObjectId(targetUserId);
      }
      if (productId && Types.ObjectId.isValid(productId)) {
        filter.productId = new Types.ObjectId(productId);
      }
      if (targetType) {
        filter.targetType = targetType;
      }

      const ratings = await Rating.find(filter)
        .populate('raterUserId', 'username profileImage')
        .sort({ createdAt: -1 })
        .limit(Number(limit) || 20);

      res.status(200).json({
        success: true,
        data: { ratings },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Check whether an order (or batch of orders) has already been rated by the authenticated user
   */
  static async checkOrderRating(req: Request, res: Response, next: NextFunction) {
    try {
      const raterUserId = req.user!.userId;
      const { orderId, orderIds } = req.query;

      if (orderId && typeof orderId === 'string' && Types.ObjectId.isValid(orderId)) {
        const ratings = await Rating.find({
          orderId: new Types.ObjectId(orderId),
          raterUserId: new Types.ObjectId(raterUserId),
        });
        const isRated = ratings.length > 0;
        const averageScore = isRated
          ? Math.round((ratings.reduce((acc, r) => acc + r.ratingScore, 0) / ratings.length) * 10) / 10
          : 0;

        return res.status(200).json({
          success: true,
          data: {
            isRated,
            averageScore,
            ratingsCount: ratings.length,
          },
        });
      }

      // Batch check for orders
      let queryOrderIds: Types.ObjectId[] = [];
      if (orderIds && typeof orderIds === 'string') {
        queryOrderIds = orderIds
          .split(',')
          .map((id) => id.trim())
          .filter((id) => Types.ObjectId.isValid(id))
          .map((id) => new Types.ObjectId(id));
      }

      const matchStage: any = { raterUserId: new Types.ObjectId(raterUserId) };
      if (queryOrderIds.length > 0) {
        matchStage.orderId = { $in: queryOrderIds };
      }

      const ratings = await Rating.find(matchStage);
      const ratedOrders: Record<string, { isRated: boolean; averageScore: number }> = {};

      const orderGroups: Record<string, number[]> = {};
      for (const r of ratings) {
        const oId = r.orderId.toString();
        if (!orderGroups[oId]) orderGroups[oId] = [];
        orderGroups[oId].push(r.ratingScore);
      }

      for (const [oId, scores] of Object.entries(orderGroups)) {
        const avg = Math.round((scores.reduce((a, b) => a + b, 0) / scores.length) * 10) / 10;
        ratedOrders[oId] = {
          isRated: true,
          averageScore: avg,
        };
      }

      res.status(200).json({
        success: true,
        data: { ratedOrders },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get rating statistics and star distribution for a target product or user
   */
  static async getRatingStats(req: Request, res: Response, next: NextFunction) {
    try {
      const { targetUserId, productId } = req.query as any;
      const match: any = { isPublic: true };
      if (productId && Types.ObjectId.isValid(productId)) {
        match.productId = new Types.ObjectId(productId);
      } else if (targetUserId && Types.ObjectId.isValid(targetUserId)) {
        match.targetUserId = new Types.ObjectId(targetUserId);
      } else {
        throw new AppError('Either productId or targetUserId is required', 400);
      }

      const ratings = await Rating.find(match).select('ratingScore');
      const totalCount = ratings.length;
      const distribution: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
      let sum = 0;

      for (const r of ratings) {
        const score = Math.round(r.ratingScore);
        if (score >= 1 && score <= 5) {
          distribution[score] = (distribution[score] || 0) + 1;
        }
        sum += r.ratingScore;
      }

      const averageRating = totalCount > 0 ? Math.round((sum / totalCount) * 10) / 10 : 0;

      res.status(200).json({
        success: true,
        data: {
          averageRating,
          ratingCount: totalCount,
          distribution,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Check if a customer has completed an order containing the product to write a review
   */
  static async checkProductReviewEligibility(req: Request, res: Response, next: NextFunction) {
    try {
      const customerId = req.user!.userId;
      const { productId } = req.query as any;

      if (!productId || !Types.ObjectId.isValid(productId)) {
        throw new AppError('Valid productId is required', 400);
      }

      // Find if customer has any completed or delivered orders with this product
      const eligibleOrder = await Order.findOne({
        customerId: new Types.ObjectId(customerId),
        status: { $in: ['completed', 'delivered'] },
        'items.productId': new Types.ObjectId(productId),
      }).sort({ createdAt: -1 });

      if (!eligibleOrder) {
        return res.status(200).json({
          success: true,
          data: {
            eligible: false,
            message: 'Only verified buyers who received this produce can write a review.',
          },
        });
      }

      // Check if user already submitted a review for this product
      const existingRating = await Rating.findOne({
        raterUserId: new Types.ObjectId(customerId),
        productId: new Types.ObjectId(productId),
      });

      res.status(200).json({
        success: true,
        data: {
          eligible: true,
          orderId: eligibleOrder._id,
          orderNumber: eligibleOrder.orderNumber,
          existingRating: existingRating || null,
        },
      });
    } catch (error) {
      next(error);
    }
  }
}
