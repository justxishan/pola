import { Request, Response, NextFunction } from 'express';
import { User } from '../models/User.model.js';
import { Order } from '../models/Order.model.js';
import { CloudinaryService } from '../services/cloudinary.service.js';
import { AppError } from '../middleware/error.middleware.js';
import { VerificationStatus } from '@pola/shared';

export class CustomerController {
  /**
   * Get Customer Profile & Saved Addresses
   */
  static async getCustomerProfile(req: Request, res: Response, next: NextFunction) {
    try {
      const user = await User.findById(req.user!.userId);
      if (!user) throw new AppError('User not found', 404);

      const recentOrders = await Order.find({ customerId: user._id })
        .sort({ createdAt: -1 })
        .limit(5);

      res.status(200).json({
        success: true,
        data: {
          user,
          addresses: user.addresses || [],
          recentOrders,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Add a new delivery address
   */
  static async addAddress(req: Request, res: Response, next: NextFunction) {
    try {
      const user = await User.findById(req.user!.userId);
      if (!user) throw new AppError('User not found', 404);

      const { label, province, district, addressLine1, addressLine2, city, postalCode, isDefault, latitude, longitude } =
        req.body;

      if (isDefault) {
        user.addresses.forEach((addr) => (addr.isDefault = false));
      }

      user.addresses.push({
        label: label || 'Delivery Address',
        province,
        district,
        addressLine1,
        addressLine2,
        city,
        postalCode,
        isDefault: isDefault || user.addresses.length === 0,
        gps: latitude && longitude ? { latitude, longitude } : undefined,
      });

      await user.save();

      res.status(201).json({
        success: true,
        message: 'Address added successfully',
        data: { addresses: user.addresses },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update an address
   */
  static async updateAddress(req: Request, res: Response, next: NextFunction) {
    try {
      const user = await User.findById(req.user!.userId);
      if (!user) throw new AppError('User not found', 404);

      const addressIndex = user.addresses.findIndex(
        (a) => a._id?.toString() === req.params.addressId
      );
      if (addressIndex === -1) throw new AppError('Address not found', 404);

      if (req.body.isDefault) {
        user.addresses.forEach((addr) => (addr.isDefault = false));
      }

      Object.assign(user.addresses[addressIndex], req.body);
      await user.save();

      res.status(200).json({
        success: true,
        message: 'Address updated successfully',
        data: { addresses: user.addresses },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Delete an address
   */
  static async deleteAddress(req: Request, res: Response, next: NextFunction) {
    try {
      const user = await User.findById(req.user!.userId);
      if (!user) throw new AppError('User not found', 404);

      user.addresses = user.addresses.filter(
        (a) => a._id?.toString() !== req.params.addressId
      );
      await user.save();

      res.status(200).json({
        success: true,
        message: 'Address removed successfully',
        data: { addresses: user.addresses },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Submit B2B Business Verification Documents
   */
  static async submitB2BDocuments(req: Request, res: Response, next: NextFunction) {
    try {
      const user = await User.findById(req.user!.userId);
      if (!user) throw new AppError('User not found', 404);

      const { businessName, businessRegNumber, businessType } = req.body;

      if (businessName) user.businessName = businessName;
      if (businessRegNumber) user.businessRegNumber = businessRegNumber;
      if (businessType) user.businessType = businessType;

      if (req.file) {
        const upload = await CloudinaryService.uploadBuffer(
          req.file.buffer,
          'pola/b2b_docs',
          'raw'
        );
        user.businessRegDoc = upload.secure_url;
      }

      user.kycStatus = VerificationStatus.PENDING;
      await user.save();

      res.status(200).json({
        success: true,
        message: 'B2B documents submitted for verification',
        data: { user },
      });
    } catch (error) {
      next(error);
    }
  }
}
