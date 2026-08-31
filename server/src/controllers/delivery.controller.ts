import { Request, Response, NextFunction } from 'express';
import { Types } from 'mongoose';
import { Order } from '../models/Order.model.js';
import { User } from '../models/User.model.js';
import { Wallet } from '../models/Wallet.model.js';
import { RadiusService } from '../services/radius.service.js';
import { CloudinaryService } from '../services/cloudinary.service.js';
import { EscrowService } from '../services/escrow.service.js';
import { AppError } from '../middleware/error.middleware.js';
import { OrderStatus, Role } from '@pola/shared';

export class DeliveryController {
  /**
   * Get available Leg-2 orders within the driver's radar radius
   */
  static async getAvailableOrdersRadar(req: Request, res: Response, next: NextFunction) {
    try {
      const driverId = req.user!.userId;
      const driver = await User.findById(driverId);
      if (!driver) throw new AppError('Driver not found', 404);

      const radiusKm = Number(req.query.radiusKm) || driver.deliveryRadiusKm || 15;
      const lat = Number(req.query.lat) || driver.currentLocation?.latitude;
      const lng = Number(req.query.lng) || driver.currentLocation?.longitude;

      // Find orders received & sorted at DC awaiting Leg-2 assignment
      const orders = await Order.find({
        status: {
          $in: [OrderStatus.RECEIVED_AT_DC, OrderStatus.ASSIGNED_FOR_DELIVERY],
        },
        leg2DriverId: { $exists: false },
      })
        .populate('assignedDcId', 'name code district gps')
        .sort({ createdAt: -1 });

      let filteredOrders = orders;
      if (lat && lng) {
        filteredOrders = orders.filter((order) => {
          if (!order.deliveryAddress.gps?.latitude || !order.deliveryAddress.gps?.longitude) {
            return true; // Include if GPS not pinned
          }
          return RadiusService.isWithinRadius(
            { latitude: lat, longitude: lng },
            {
              latitude: order.deliveryAddress.gps.latitude,
              longitude: order.deliveryAddress.gps.longitude,
            },
            radiusKm
          );
        });
      }

      res.status(200).json({
        success: true,
        data: {
          orders: filteredOrders,
          driverRadiusKm: radiusKm,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Accept an available delivery trip
   */
  static async acceptTrip(req: Request, res: Response, next: NextFunction) {
    try {
      const driverId = req.user!.userId;
      const { vehicleId } = req.body;

      const order = await Order.findById(req.params.orderId);
      if (!order) throw new AppError('Order not found', 404);

      if (order.leg2DriverId) {
        throw new AppError('This order has already been assigned to another delivery partner', 400);
      }

      order.leg2DriverId = new Types.ObjectId(driverId);
      if (vehicleId) order.leg2VehicleId = new Types.ObjectId(vehicleId);
      order.status = OrderStatus.OUT_FOR_DELIVERY;

      order.timeline.push({
        status: OrderStatus.OUT_FOR_DELIVERY,
        timestamp: new Date(),
        updatedBy: new Types.ObjectId(driverId),
        note: 'Leg-2 Delivery partner accepted trip and is out for delivery',
      });

      await order.save();

      res.status(200).json({
        success: true,
        message: 'Trip accepted successfully',
        data: { order },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update live driver GPS location
   */
  static async updateLocation(req: Request, res: Response, next: NextFunction) {
    try {
      const driverId = req.user!.userId;
      const { latitude, longitude, isOnline } = req.body;

      const user = await User.findById(driverId);
      if (!user) throw new AppError('Driver not found', 404);

      if (latitude !== undefined && longitude !== undefined) {
        user.currentLocation = {
          latitude,
          longitude,
          updatedAt: new Date(),
        };
      }
      if (isOnline !== undefined) {
        user.isOnline = isOnline;
      }

      await user.save();

      res.status(200).json({
        success: true,
        message: 'Location updated',
        data: { currentLocation: user.currentLocation, isOnline: user.isOnline },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Submit Proof of Delivery (OTP verification and photo)
   */
  static async verifyProofOfDelivery(req: Request, res: Response, next: NextFunction) {
    try {
      const driverId = req.user!.userId;
      const { orderId } = req.params;
      const { handoverOtp } = req.body;

      const order = await Order.findOne({ _id: orderId, leg2DriverId: driverId });
      if (!order) throw new AppError('Order not found or unauthorized', 404);

      if (order.handoverOtp && handoverOtp !== order.handoverOtp) {
        throw new AppError('Incorrect 6-digit handover OTP. Please request customer for code.', 400);
      }

      if (req.file) {
        const upload = await CloudinaryService.uploadBuffer(req.file.buffer, 'pola/pod');
        order.proofOfDeliveryPhoto = upload.secure_url;
      }

      order.status = OrderStatus.DELIVERED;
      order.deliveredAt = new Date();
      order.timeline.push({
        status: OrderStatus.DELIVERED,
        timestamp: new Date(),
        updatedBy: new Types.ObjectId(driverId),
        note: 'Handover verified with customer OTP',
      });

      await order.save();

      // Automatically complete order and release escrow
      await EscrowService.releaseAndSplitEscrow(order._id);

      res.status(200).json({
        success: true,
        message: 'Order delivery confirmed and payout released',
        data: { order },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get Delivery Earnings and Wallet Stats
   */
  static async getEarnings(req: Request, res: Response, next: NextFunction) {
    try {
      const driverId = req.user!.userId;
      const wallet = await Wallet.findOne({ userId: driverId });

      const completedTrips = await Order.find({
        leg2DriverId: driverId,
        status: { $in: [OrderStatus.DELIVERED, OrderStatus.COMPLETED] },
      }).sort({ createdAt: -1 });

      res.status(200).json({
        success: true,
        data: {
          wallet: {
            availableBalance: wallet?.availableBalanceLkr || 0,
            pendingBalance: wallet?.pendingEscrowBalanceLkr || 0,
            totalEarned: wallet?.totalEarnedLkr || 0,
          },
          completedTripsCount: completedTrips.length,
          completedTrips,
        },
      });
    } catch (error) {
      next(error);
    }
  }
}
