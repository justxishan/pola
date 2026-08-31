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

      const rating = await Rating.create({
        orderId: new Types.ObjectId(orderId),
        raterUserId: new Types.ObjectId(raterUserId),
        targetType,
        targetUserId: new Types.ObjectId(targetUserId),
        productId: productId ? new Types.ObjectId(productId) : undefined,
        ratingScore,
        reviewText,
        tags: tags || [],
        photos: photos || [],
      });

      // Update product rating aggregate if product rated
      if (productId) {
        const stats = await Rating.aggregate([
          { $match: { productId: new Types.ObjectId(productId) } },
          {
            $group: {
              _id: '$productId',
              avgRating: { $avg: '$ratingScore' },
              count: { $sum: 1 },
            },
          },
        ]);

        if (stats.length > 0) {
          await Product.findByIdAndUpdate(productId, {
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
}
