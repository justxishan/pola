import { Request, Response, NextFunction } from 'express';
import { Types } from 'mongoose';
import { Rating } from '../models/Rating.model.js';
import { Product } from '../models/Product.model.js';
import { Order } from '../models/Order.model.js';
import { AppError } from '../middleware/error.middleware.js';

export class RatingController {
  /**
   * Submit two-way produce or delivery rating
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
        if (targetType === 'farmer') {
          if (resolvedProductId && Types.ObjectId.isValid(resolvedProductId)) {
            const matchingItem = order.items.find(
              (i) => (i.productId?._id || i.productId)?.toString() === resolvedProductId.toString()
            );
            resolvedTargetUserId = matchingItem?.farmerId?._id || matchingItem?.farmerId;
          }
          if (!resolvedTargetUserId && order.items.length > 0) {
            resolvedTargetUserId = order.items[0]?.farmerId?._id || order.items[0]?.farmerId;
          }
        } else if (targetType === 'driver') {
          resolvedTargetUserId =
            order.leg2DriverId?._id ||
            order.leg2DriverId ||
            order.leg1DriverId?._id ||
            order.leg1DriverId;
        }
      }

      if (!resolvedProductId && targetType === 'farmer' && order.items.length > 0) {
        resolvedProductId = order.items[0]?.productId?._id || order.items[0]?.productId;
      }

      if (!resolvedTargetUserId || !Types.ObjectId.isValid(resolvedTargetUserId)) {
        throw new AppError(
          `Unable to attribute ${targetType} rating: no matching partner assigned to this order`,
          400
        );
      }

      const rating = await Rating.create({
        orderId: new Types.ObjectId(orderId),
        raterUserId: new Types.ObjectId(raterUserId),
        targetType,
        targetUserId: new Types.ObjectId(resolvedTargetUserId),
        productId: resolvedProductId && Types.ObjectId.isValid(resolvedProductId) ? new Types.ObjectId(resolvedProductId) : undefined,
        ratingScore: Number(ratingScore) || 5,
        reviewText: reviewText || '',
        tags: tags || [],
        photos: photos || [],
      });

      // Update product rating aggregate if product rated
      if (resolvedProductId && Types.ObjectId.isValid(resolvedProductId)) {
        const stats = await Rating.aggregate([
          { $match: { productId: new Types.ObjectId(resolvedProductId), isPublic: true } },
          {
            $group: {
              _id: '$productId',
              avgRating: { $avg: '$ratingScore' },
              count: { $sum: 1 },
            },
          },
        ]);

        if (stats.length > 0) {
          await Product.findByIdAndUpdate(resolvedProductId, {
            averageRating: Math.round(stats[0].avgRating * 10) / 10,
            ratingCount: stats[0].count,
          });
        }
      }

      res.status(201).json({
        success: true,
        message: 'Rating and review submitted successfully',
        data: { rating },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get ratings and reviews for a target farmer / driver / product
   */
  static async getTargetRatings(req: Request, res: Response, next: NextFunction) {
    try {
      const { targetUserId, productId } = req.query;
      const filter: any = { isPublic: true };
      if (targetUserId) filter.targetUserId = targetUserId;
      if (productId) filter.productId = productId;

      const ratings = await Rating.find(filter)
        .populate('raterUserId', 'fullName profileImage')
        .sort({ createdAt: -1 })
        .limit(20);

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
}
