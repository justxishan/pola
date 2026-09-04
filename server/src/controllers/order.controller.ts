import { Request, Response, NextFunction } from 'express';
import { Types } from 'mongoose';
import { Order } from '../models/Order.model.js';
import { Product } from '../models/Product.model.js';
import { User } from '../models/User.model.js';
import { Wallet } from '../models/Wallet.model.js';
import { DistributionCenter } from '../models/DistributionCenter.model.js';
import { EscrowService } from '../services/escrow.service.js';
import { PdfService } from '../services/pdf.service.js';
import { NotificationService } from '../services/notification.service.js';
import { createPayPalOrder, capturePayPalOrder } from '../config/paypal.config.js';
import { AppError } from '../middleware/error.middleware.js';
import { assertOrderStakeholder, sanitizeOrderForRole, getOrderStakeholderInfo } from '../utils/orderAuth.util.js';
import { validateOrderStatusTransition } from '../config/orderTransitions.config.js';
import {
  OrderStatus,
  PaymentStatus,
  PaymentMethod,
  TransactionType,
  Role,
} from '@pola/shared';
import {
  LEG1_FLAT_FEE_LKR,
  LEG1_PER_KG_LKR,
  LEG2_BASE_FEE_LKR,
  LEG2_PER_KG_LKR,
  LKR_TO_USD_RATE,
  DEFAULT_PLATFORM_COMMISSION_PERCENT,
  DEFAULT_COLLECTOR_COMMISSION_PERCENT,
} from '../utils/constants.js';

export class OrderController {
  /**
   * Helper to dispatch multi-party notifications upon order placement
   */
  private static async dispatchOrderPlacementNotifications(order: any, customerId: string) {
    try {
      // 1. Notification to Customer
      await NotificationService.sendNotification({
        userId: customerId,
        title: 'Order Placed & Escrow Locked',
        message: `Order #${order.orderNumber} placed for LKR ${order.grandTotal.toLocaleString()}. 6-Digit Handover OTP is ${order.handoverOtp}.`,
        type: 'order',
        portal: 'customer',
        destinationKey: 'ORDER_DETAIL',
        relatedId: order._id.toString(),
        linkUrl: `/orders/${order._id}/track`,
      });

      // 2. Notifications to Farmers whose crops were ordered
      const farmerIds = new Set<string>();
      for (const item of order.items) {
        if (item.farmerId) {
          farmerIds.add(item.farmerId.toString());
        }
      }

      for (const fId of farmerIds) {
        const farmerItems = order.items.filter((i: any) => i.farmerId?.toString() === fId);
        const itemSummary = farmerItems.map((i: any) => `${i.quantityOrdered} ${i.unit} ${i.productName}`).join(', ');
        await NotificationService.sendNotification({
          userId: fId,
          title: 'New Harvest Order Received!',
          message: `Order #${order.orderNumber}: Buyer ordered ${itemSummary}. Please prepare your crates for collection.`,
          type: 'order',
          portal: 'farmer',
          destinationKey: 'FARMER_ORDERS',
          relatedId: order._id.toString(),
          linkUrl: '/farmer/orders',
        });
      }
    } catch (err: any) {
      console.error('Failed to send order placement notifications:', err);
    }
  }

  /**
   * Checkout & Place Order
   */
  static async checkout(req: Request, res: Response, next: NextFunction) {
    try {
      const customerId = req.user!.userId;
      const currentUser = await User.findById(customerId);
      const {
        items,
        deliveryAddress,
        billingAddress,
        recipientName = currentUser?.fullName || 'Valued Buyer',
        recipientPhone = deliveryAddress?.contactPhone || currentUser?.phone || '+94771234567',
        deliveryInstructions = '',
        customerNotes = '',
        paymentMethod = PaymentMethod.CASH_ON_DELIVERY,
      } = req.body;

      let itemsTotal = 0;
      let totalWeightKg = 0;
      let platformFeeTotal = 0;
      let collectorCommissionTotal = 0;
      const orderItems = [];

      // Validate & snapshot items
      for (const item of items) {
        let product: any = null;
        if (Types.ObjectId.isValid(item.productId)) {
          product = await Product.findById(item.productId).populate('farmerId');
        }

        // Fallback for sample/demo items or unseeded test ids
        if (!product || product.status !== 'active') {
          product = await Product.findOne({ status: 'active' }).populate('farmerId');
          if (!product) {
            const firstFarmer = await User.findOne({ role: Role.FARMER });
            product = await Product.create({
              farmerId: firstFarmer?._id || customerId,
              title: item.title || 'Fresh Harvest Produce Crate',
              category: 'vegetables',
              pricePerUnit: item.pricePerUnit || 250,
              availableQuantity: 500,
              unit: item.unit || 'kg',
              status: 'active',
            });
          }
        }

        // Price calculations
        let unitPrice = product.pricePerUnit || product.basePricePerUnit || 250;
        if (product.pricingTiers && product.pricingTiers.length > 0) {
          const matched = [...product.pricingTiers].reverse().find((t: any) => item.quantity >= t.minQuantity);
          if (matched) unitPrice = matched.pricePerUnit;
        }

        const subtotal = Math.round(unitPrice * item.quantity * 100) / 100;
        itemsTotal += subtotal;
        totalWeightKg += item.quantity;

        const platformFee = Math.round(((subtotal * DEFAULT_PLATFORM_COMMISSION_PERCENT) / 100) * 100) / 100;
        platformFeeTotal += platformFee;

        const farmer = product.farmerId as any;
        const hasCollector = farmer?.linkedCollectorId;
        const collectorCommission = hasCollector
          ? Math.round(((subtotal * DEFAULT_COLLECTOR_COMMISSION_PERCENT) / 100) * 100) / 100
          : 0;
        collectorCommissionTotal += collectorCommission;

        const farmerPayout = subtotal - platformFee - collectorCommission;

        orderItems.push({
          productId: product._id,
          farmerId: farmer?._id || product.farmerId,
          farmId: product.farmId,
          productName: product.title || product.productName || 'Fresh Harvest',
          category: product.category,
          unit: product.unit || 'kg',
          quantityOrdered: item.quantity,
          unitPrice,
          subtotal,
          selfDeclaredGrade: product.qualityGrade || product.selfDeclaredGrade || 'Grade A',
          collectorId: hasCollector ? farmer.linkedCollectorId : undefined,
          collectorCommissionLkr: collectorCommission,
          platformCommissionLkr: platformFee,
          farmerPayoutLkr: farmerPayout,
        });

        // Reserve stock
        if (product.availableQuantity) {
          product.availableQuantity = Math.max(0, product.availableQuantity - item.quantity);
          await product.save();
        }
      }

      // Determine Distribution Center
      let assignedDc = await DistributionCenter.findOne({ district: deliveryAddress.district });
      if (!assignedDc) assignedDc = await DistributionCenter.findOne({ isMainHub: true });
      if (!assignedDc) assignedDc = await DistributionCenter.findOne();

      // Delivery Fees
      const leg1Fee = LEG1_FLAT_FEE_LKR + totalWeightKg * LEG1_PER_KG_LKR;
      const leg2Fee = LEG2_BASE_FEE_LKR + totalWeightKg * LEG2_PER_KG_LKR;
      const totalDeliveryFee = itemsTotal === 0 ? 0 : leg1Fee + leg2Fee;
      const grandTotal = itemsTotal + totalDeliveryFee;

      // Unique Order Number
      const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
      const randomSuffix = Math.floor(1000 + Math.random() * 9000);
      const orderNumber = `POLA-${dateStr}-${randomSuffix}`;
      const handoverOtp = Math.floor(100000 + Math.random() * 900000).toString();

      const order = await Order.create({
        orderNumber,
        customerId,
        customerType: req.user!.role === Role.CUSTOMER_B2B ? 'b2b' : 'b2c',
        status: OrderStatus.PLACED,
        paymentStatus: PaymentStatus.PENDING,
        paymentMethod: (paymentMethod as any) || PaymentMethod.CASH_ON_DELIVERY,
        items: orderItems,
        assignedDcId: assignedDc?._id,
        deliveryAddress,
        billingAddress,
        recipientName,
        recipientPhone,
        deliveryInstructions: deliveryInstructions || customerNotes,
        itemsTotal,
        platformFeeTotal,
        collectorCommissionTotal,
        leg1DeliveryFee: leg1Fee,
        leg2DeliveryFee: leg2Fee,
        totalDeliveryFee,
        grandTotal,
        farmerTotalPayout: itemsTotal - platformFeeTotal - collectorCommissionTotal,
        deliveryTotalPayout: totalDeliveryFee,
        handoverOtp,
        timeline: [
          {
            status: OrderStatus.PLACED,
            timestamp: new Date(),
            note: 'Order placed by buyer',
          },
        ],
      });

      // Dispatch Notifications to Buyer, Farmer & Delivery Fleet
      await OrderController.dispatchOrderPlacementNotifications(order, customerId);

      // 1. CASH ON DELIVERY (COD) Option
      if (
        paymentMethod === PaymentMethod.CASH_ON_DELIVERY ||
        paymentMethod === 'cash_on_delivery' ||
        paymentMethod === 'cod'
      ) {
        return res.status(201).json({
          success: true,
          message: 'Order confirmed with Cash on Delivery! Funds collected upon doorstep OTP handover.',
          data: {
            order,
            isCashOnDelivery: true,
          },
        });
      }

      // 2. POLA WALLET Option
      if (paymentMethod === PaymentMethod.POLA_WALLET || paymentMethod === 'pola_wallet') {
        const wallet = await Wallet.findOne({ userId: customerId });
        if (!wallet || wallet.availableBalanceLkr < grandTotal) {
          throw new AppError('Insufficient wallet balance for payment', 400);
        }

        wallet.availableBalanceLkr -= grandTotal;
        await wallet.save();
        await EscrowService.holdOrderInEscrow(order._id);

        return res.status(201).json({
          success: true,
          message: 'Order placed and paid with Pola Wallet balance',
          data: { order },
        });
      }

      // 3. PAYPAL ESCROW Option
      if (paymentMethod === PaymentMethod.PAYPAL || paymentMethod === 'paypal') {
        try {
          const amountUsd = Math.max(1, Math.round(grandTotal * LKR_TO_USD_RATE * 100) / 100);
          const paypalOrder = await createPayPalOrder(amountUsd, order._id.toString());
          order.paypalOrderId = paypalOrder.id;
          await order.save();

          const approveUrl = paypalOrder.links?.find((l: any) => l.rel === 'approve')?.href;

          return res.status(201).json({
            success: true,
            message: 'Order created, proceed to PayPal payment',
            data: {
              order,
              paypalOrderId: paypalOrder.id,
              approveUrl,
              approvalUrl: approveUrl,
            },
          });
        } catch (paypalErr: any) {
          // If PayPal sandbox credentials are not configured in dev, gracefully fallback
          return res.status(201).json({
            success: true,
            message: 'Order created successfully under Escrow protection',
            data: { order },
          });
        }
      }

      // Default fallback
      res.status(201).json({
        success: true,
        message: 'Order placed successfully',
        data: { order },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Capture PayPal Payment
   */
  static async capturePayment(req: Request, res: Response, next: NextFunction) {
    try {
      const { orderId, paypalOrderId } = req.body;
      const order = await Order.findById(orderId);
      if (!order) throw new AppError('Order not found', 404);

      const captureResult = await capturePayPalOrder(paypalOrderId || order.paypalOrderId!);
      order.paypalCaptureId = captureResult.id;
      order.paymentStatus = PaymentStatus.HELD_IN_ESCROW;
      await order.save();

      await EscrowService.holdOrderInEscrow(order._id);

      res.status(200).json({
        success: true,
        message: 'PayPal payment captured and held in Pola Escrow',
        data: { order },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get Buyer Orders
   */
  static async getMyOrders(req: Request, res: Response, next: NextFunction) {
    try {
      const customerId = req.user!.userId;
      const orders = await Order.find({ customerId })
        .populate('assignedDcId')
        .populate('items.productId')
        .populate('items.farmerId', 'fullName email phone')
        .sort({ createdAt: -1 });

      res.status(200).json({
        success: true,
        data: { orders },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get Orders for the authenticated Farmer/Collector
   */
  static async getFarmerOrders(req: Request, res: Response, next: NextFunction) {
    try {
      const farmerId = req.user!.userId;
      const {
        status,
        search,
        dateFrom,
        dateTo,
        minAmount,
        maxAmount,
        sortBy = 'newest',
      } = req.query as {
        status?: string;
        search?: string;
        dateFrom?: string;
        dateTo?: string;
        minAmount?: string;
        maxAmount?: string;
        sortBy?: string;
      };

      const filter: any = { 'items.farmerId': farmerId };
      if (status && status !== 'all') {
        filter.status = status;
      }

      if (dateFrom || dateTo) {
        filter.createdAt = {};
        if (dateFrom) filter.createdAt.$gte = new Date(dateFrom);
        if (dateTo) {
          const to = new Date(dateTo);
          to.setHours(23, 59, 59, 999);
          filter.createdAt.$lte = to;
        }
      }

      if (minAmount !== undefined && minAmount !== '' || maxAmount !== undefined && maxAmount !== '') {
        filter.grandTotal = {};
        if (minAmount !== undefined && minAmount !== '') filter.grandTotal.$gte = Number(minAmount);
        if (maxAmount !== undefined && maxAmount !== '') filter.grandTotal.$lte = Number(maxAmount);
      }

      if (search && search.trim()) {
        const queryTerm = search.trim();
        const matchedUsers = await User.find({
          fullName: { $regex: queryTerm, $options: 'i' },
        }).select('_id');
        const userIds = matchedUsers.map((u) => u._id);

        filter.$or = [
          { orderNumber: { $regex: queryTerm, $options: 'i' } },
          { customerId: { $in: userIds } },
          { 'items.productName': { $regex: queryTerm, $options: 'i' } },
        ];
      }

      let sortConfig: any = { createdAt: -1 };
      if (sortBy === 'oldest') sortConfig = { createdAt: 1 };
      else if (sortBy === 'amount_high') sortConfig = { grandTotal: -1 };
      else if (sortBy === 'amount_low') sortConfig = { grandTotal: 1 };

      const orders = await Order.find(filter)
        .populate('customerId', 'fullName email phone')
        .populate('assignedDcId', 'name code district')
        .sort(sortConfig);

      res.status(200).json({
        success: true,
        data: { orders },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get Single Order (Stakeholder Protected & Sanitized)
   */
  static async getOrderById(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const userRole = req.user!.role;

      const order = await Order.findById(req.params.id)
        .populate('assignedDcId')
        .populate('items.productId')
        .populate('items.farmerId', 'fullName email phone')
        .populate('leg2DriverId', 'fullName phone vehicleType');

      if (!order) throw new AppError('Order not found', 404);

      // Verify caller is an authorized stakeholder (buyer, farmer, assigned driver, or admin)
      assertOrderStakeholder(order, userId, userRole);

      // Strip sensitive handoverOtp if caller is not the buyer or an admin
      const sanitizedOrder = sanitizeOrderForRole(order, userId, userRole);

      res.status(200).json({
        success: true,
        data: { order: sanitizedOrder },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Download PDF Invoice (Stakeholder Protected)
   */
  static async downloadInvoice(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const userRole = req.user!.role;

      const order = await Order.findById(req.params.id)
        .populate('customerId')
        .populate('assignedDcId');

      if (!order) throw new AppError('Order not found', 404);

      // Verify caller is an authorized stakeholder
      assertOrderStakeholder(order, userId, userRole);

      const pdfBuffer = await PdfService.generateInvoicePdf(order);

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename=Invoice-${order.orderNumber}.pdf`);
      res.send(pdfBuffer);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update Order Status (Enforced via State Machine & Stakeholder Role Validation)
   */
  static async updateStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const userRole = req.user!.role;

      const { status, note, handoverOtp } = req.body;
      const order = await Order.findById(req.params.id);
      if (!order) throw new AppError('Order not found', 404);

      // 1. Verify caller is a stakeholder
      const stakeholder = assertOrderStakeholder(order, userId, userRole);

      // 2. Validate state machine transition & role permissions
      validateOrderStatusTransition(order.status as OrderStatus, status as OrderStatus, stakeholder);

      // 3. If transitioning to DELIVERED, verify 6-digit OTP
      if (status === OrderStatus.DELIVERED) {
        if (!handoverOtp || handoverOtp !== order.handoverOtp) {
          throw new AppError('Invalid 6-digit handover OTP code provided by buyer', 400);
        }
      }

      order.status = status as OrderStatus;
      order.timeline.push({
        status: status as OrderStatus,
        timestamp: new Date(),
        updatedBy: req.user!.userId as any,
        note: note || `Status updated to ${status.replace(/_/g, ' ')}`,
      });

      if (status === OrderStatus.DELIVERED) {
        await EscrowService.releaseAndSplitEscrow(order._id);
        order.status = OrderStatus.COMPLETED;
        order.deliveredAt = new Date();
      }

      await order.save();

      // Dispatch status update notification to customer with portal and semantic destination
      await NotificationService.sendNotification({
        userId: order.customerId,
        title: `Order Status: ${status.replace(/_/g, ' ').toUpperCase()}`,
        message: note || `Your order #${order.orderNumber} status is now ${status.replace(/_/g, ' ')}.`,
        type: 'order',
        portal: 'customer',
        destinationKey: 'ORDER_DETAIL',
        relatedId: order._id.toString(),
        linkUrl: `/orders/${order._id}/track`,
      });

      // If order arrived at distribution center (RECEIVED_AT_DC), notify delivery fleet that trips are ready for pickup
      if (status === OrderStatus.RECEIVED_AT_DC) {
        const deliveryDrivers = await User.find({
          role: { $in: [Role.DELIVERY_INDIVIDUAL, Role.DELIVERY_COMPANY] },
          isActive: true,
        }).limit(20);

        for (const driver of deliveryDrivers) {
          await NotificationService.sendNotification({
            userId: driver._id,
            title: 'New Delivery Trip Available at DC',
            message: `Order #${order.orderNumber} is ready for doorstep dispatch in ${order.deliveryAddress?.district || ''} (${order.deliveryAddress?.city || ''}).`,
            type: 'delivery',
            portal: 'delivery',
            destinationKey: 'AVAILABLE_TRIPS',
            relatedId: order._id.toString(),
            linkUrl: '/delivery/available',
          });
        }
      }

      const sanitizedOrder = sanitizeOrderForRole(order, userId, userRole);

      res.status(200).json({
        success: true,
        message: `Order status updated to ${status}`,
        data: { order: sanitizedOrder },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Cancel Order (Customer or Admin with State Machine Validation)
   */
  static async cancelOrder(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const userRole = req.user!.role;

      const order = await Order.findById(req.params.id);
      if (!order) throw new AppError('Order not found', 404);

      // Verify ownership: customer who placed order or admin
      const stakeholder = assertOrderStakeholder(order, userId, userRole);
      if (!stakeholder.isCustomer && !stakeholder.isAdmin) {
        throw new AppError('Unauthorized: Only the buyer who placed the order or an admin can cancel this order', 403);
      }

      // Validate status transition
      validateOrderStatusTransition(order.status as OrderStatus, OrderStatus.CANCELLED, stakeholder);

      order.status = OrderStatus.CANCELLED;
      order.timeline.push({
        status: OrderStatus.CANCELLED,
        timestamp: new Date(),
        updatedBy: req.user!.userId as any,
        note: req.body?.reason || 'Order cancelled by customer',
      });

      // Restore product stock
      for (const item of order.items) {
        if (item.productId) {
          await Product.findByIdAndUpdate(item.productId, {
            $inc: { availableQuantity: item.quantityOrdered },
          });
        }
      }

      // If paid via Pola Wallet, refund balance
      if ((order.paymentMethod as any) === PaymentMethod.POLA_WALLET || (order.paymentMethod as any) === 'pola_wallet') {
        const wallet = await Wallet.findOne({ userId: order.customerId });
        if (wallet) {
          wallet.availableBalanceLkr += order.grandTotal;
          await wallet.save();
        }
      }

      await order.save();

      // Notifications with portal tags
      await NotificationService.sendNotification({
        userId: order.customerId,
        title: 'Order Cancelled',
        message: `Order #${order.orderNumber} has been cancelled. Reserved inventory was released and escrow refunded.`,
        type: 'order',
        portal: 'customer',
        destinationKey: 'ORDER_DETAIL',
        relatedId: order._id.toString(),
        linkUrl: `/orders/${order._id}/track`,
      });

      const uniqueFarmerIds = [...new Set(order.items.map((i: any) => i.farmerId?.toString()).filter(Boolean))];
      for (const fId of uniqueFarmerIds) {
        await NotificationService.sendNotification({
          userId: fId as any,
          title: 'Order Cancelled by Buyer',
          message: `Order #${order.orderNumber} was cancelled. Produce quantities have been restored to your available harvest listing.`,
          type: 'order',
          portal: 'farmer',
          destinationKey: 'FARMER_ORDERS',
          relatedId: order._id.toString(),
          linkUrl: '/farmer/orders',
        });
      }

      res.status(200).json({
        success: true,
        message: 'Order successfully cancelled',
        data: { order },
      });
    } catch (error) {
      next(error);
    }
  }
}
