import { Request, Response, NextFunction } from 'express';
import { Types } from 'mongoose';
import { Wishlist } from '../models/Wishlist.model.js';
import { Product } from '../models/Product.model.js';
import { AppError } from '../middleware/error.middleware.js';

export class WishlistController {
  /**
   * Get authenticated user's wishlist with populated product details
   */
  static async getWishlist(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;

      const wishlist = await Wishlist.findOne({ userId }).populate({
        path: 'items.productId',
        populate: [
          { path: 'farmerId', select: 'fullName profileImage' },
          { path: 'farmId', select: 'farmName district province' },
        ],
      });

      const rawItems = wishlist ? wishlist.items : [];
      // Filter out any entries where the referenced product was deleted
      const validItems = rawItems.filter((item) => item.productId !== null && item.productId !== undefined);

      res.status(200).json({
        success: true,
        data: {
          items: validItems,
          total: validItems.length,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Add a product to the user's wishlist
   */
  static async addToWishlist(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const { productId } = req.params;

      if (!Types.ObjectId.isValid(productId)) {
        throw new AppError('Invalid product ID', 400);
      }

      const product = await Product.findById(productId);
      if (!product) {
        throw new AppError('Product not found', 404);
      }

      let wishlist = await Wishlist.findOne({ userId });
      if (!wishlist) {
        wishlist = new Wishlist({ userId, items: [] });
      }

      const alreadyExists = wishlist.items.some(
        (item) => item.productId.toString() === productId
      );

      if (!alreadyExists) {
        wishlist.items.unshift({
          productId: new Types.ObjectId(productId),
          addedAt: new Date(),
        });
        await wishlist.save();
      }

      res.status(200).json({
        success: true,
        message: 'Product added to wishlist',
        data: {
          items: wishlist.items,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Remove a product from the user's wishlist
   */
  static async removeFromWishlist(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const { productId } = req.params;

      if (!Types.ObjectId.isValid(productId)) {
        throw new AppError('Invalid product ID', 400);
      }

      const wishlist = await Wishlist.findOneAndUpdate(
        { userId },
        { $pull: { items: { productId: new Types.ObjectId(productId) } } },
        { new: true }
      );

      res.status(200).json({
        success: true,
        message: 'Product removed from wishlist',
        data: {
          items: wishlist ? wishlist.items : [],
        },
      });
    } catch (error) {
      next(error);
    }
  }
}
