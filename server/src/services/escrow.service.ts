import { Types } from 'mongoose';
import { Order, IOrder } from '../models/Order.model.js';
import { Wallet } from '../models/Wallet.model.js';
import { LedgerEntry } from '../models/LedgerEntry.model.js';
import { User } from '../models/User.model.js';
import {
  PaymentStatus,
  TransactionType,
  OrderStatus,
  Role,
} from '@pola/shared';
import { logger } from '../utils/logger.util.js';
import { AppError } from '../middleware/error.middleware.js';

export class EscrowService {
  /**
   * Ensure a user has an initialized wallet
   */
  static async getOrCreateWallet(userId: Types.ObjectId | string, role: Role) {
    let wallet = await Wallet.findOne({ userId });
    if (!wallet) {
      wallet = await Wallet.create({
        userId,
        userRole: role,
        availableBalanceLkr: 0,
        pendingEscrowBalanceLkr: 0,
        totalEarnedLkr: 0,
        totalWithdrawnLkr: 0,
      });
      logger.info(`Initialized new wallet for user ${userId} with role ${role}`);
    }
    return wallet;
  }

  /**
   * Hold funds in escrow when order payment is confirmed
   */
  static async holdOrderInEscrow(orderId: Types.ObjectId | string) {
    const order = await Order.findById(orderId);
    if (!order) throw new AppError('Order not found', 404);

    order.paymentStatus = PaymentStatus.HELD_IN_ESCROW;
    order.status = OrderStatus.PAYMENT_CONFIRMED;
    order.timeline.push({
      status: OrderStatus.PAYMENT_CONFIRMED,
      timestamp: new Date(),
      note: `Payment of LKR ${order.grandTotal.toFixed(2)} held in Pola Escrow`,
    });

    // Mark pending balances for farmers and delivery partners
    for (const item of order.items) {
      const farmer = await User.findById(item.farmerId);
      if (farmer) {
        const farmerWallet = await this.getOrCreateWallet(farmer._id, Role.FARMER);
        farmerWallet.pendingEscrowBalanceLkr += item.farmerPayoutLkr || item.subtotal;
        await farmerWallet.save();
      }
    }

    await order.save();
    logger.info(`🔒 Escrow held for Order ${order.orderNumber} (Total: LKR ${order.grandTotal})`);
    return order;
  }

  /**
   * Release and split escrow upon order completion
   */
  static async releaseAndSplitEscrow(orderId: Types.ObjectId | string) {
    const order = await Order.findById(orderId);
    if (!order) throw new AppError('Order not found', 404);

    if (order.paymentStatus === PaymentStatus.RELEASED) {
      logger.warn(`Escrow already released for Order ${order.orderNumber}`);
      return order;
    }

    // 1. Credit Farmers for their crop items
    for (const item of order.items) {
      const payoutAmount = item.farmerPayoutLkr || item.subtotal;
      const farmerWallet = await this.getOrCreateWallet(item.farmerId, Role.FARMER);

      const prevBal = farmerWallet.availableBalanceLkr;
      farmerWallet.availableBalanceLkr += payoutAmount;
      farmerWallet.pendingEscrowBalanceLkr = Math.max(
        0,
        farmerWallet.pendingEscrowBalanceLkr - payoutAmount
      );
      farmerWallet.totalEarnedLkr += payoutAmount;
      await farmerWallet.save();

      await LedgerEntry.create({
        walletId: farmerWallet._id,
        userId: item.farmerId,
        transactionType: TransactionType.SALE_PROCEEDS,
        amountLkr: payoutAmount,
        previousBalanceLkr: prevBal,
        newBalanceLkr: farmerWallet.availableBalanceLkr,
        referenceOrderId: order._id,
        description: `Sale proceeds for ${item.quantityOrdered} ${item.unit} of ${item.productName} (Order #${order.orderNumber})`,
      });

      // 2. Credit Village Collector if farmer is managed by one
      if (item.collectorId && item.collectorCommissionLkr && item.collectorCommissionLkr > 0) {
        const collectorWallet = await this.getOrCreateWallet(item.collectorId, Role.COLLECTOR);
        const colPrevBal = collectorWallet.availableBalanceLkr;
        collectorWallet.availableBalanceLkr += item.collectorCommissionLkr;
        collectorWallet.totalEarnedLkr += item.collectorCommissionLkr;
        await collectorWallet.save();

        await LedgerEntry.create({
          walletId: collectorWallet._id,
          userId: item.collectorId,
          transactionType: TransactionType.COLLECTOR_COMMISSION,
          amountLkr: item.collectorCommissionLkr,
          previousBalanceLkr: colPrevBal,
          newBalanceLkr: collectorWallet.availableBalanceLkr,
          referenceOrderId: order._id,
          description: `Collector commission for ${item.productName} from Farmer (Order #${order.orderNumber})`,
        });
      }
    }

    // 3. Credit Leg-1 Delivery Driver
    if (order.leg1DriverId && order.leg1DeliveryFee > 0) {
      const leg1Wallet = await this.getOrCreateWallet(order.leg1DriverId, Role.DELIVERY_INDIVIDUAL);
      const leg1PrevBal = leg1Wallet.availableBalanceLkr;
      leg1Wallet.availableBalanceLkr += order.leg1DeliveryFee;
      leg1Wallet.totalEarnedLkr += order.leg1DeliveryFee;
      await leg1Wallet.save();

      await LedgerEntry.create({
        walletId: leg1Wallet._id,
        userId: order.leg1DriverId,
        transactionType: TransactionType.TRIP_PAYOUT,
        amountLkr: order.leg1DeliveryFee,
        previousBalanceLkr: leg1PrevBal,
        newBalanceLkr: leg1Wallet.availableBalanceLkr,
        referenceOrderId: order._id,
        description: `Leg-1 Hub pickup payout for Order #${order.orderNumber}`,
      });
    }

    // 4. Credit Leg-2 Last-Mile Delivery Driver
    if (order.leg2DriverId && order.leg2DeliveryFee > 0) {
      const leg2Wallet = await this.getOrCreateWallet(order.leg2DriverId, Role.DELIVERY_INDIVIDUAL);
      const leg2PrevBal = leg2Wallet.availableBalanceLkr;
      leg2Wallet.availableBalanceLkr += order.leg2DeliveryFee;
      leg2Wallet.totalEarnedLkr += order.leg2DeliveryFee;
      await leg2Wallet.save();

      await LedgerEntry.create({
        walletId: leg2Wallet._id,
        userId: order.leg2DriverId,
        transactionType: TransactionType.TRIP_PAYOUT,
        amountLkr: order.leg2DeliveryFee,
        previousBalanceLkr: leg2PrevBal,
        newBalanceLkr: leg2Wallet.availableBalanceLkr,
        referenceOrderId: order._id,
        description: `Leg-2 Last-mile delivery payout for Order #${order.orderNumber}`,
      });
    }

    order.paymentStatus = PaymentStatus.RELEASED;
    order.status = OrderStatus.COMPLETED;
    order.timeline.push({
      status: OrderStatus.COMPLETED,
      timestamp: new Date(),
      note: 'Order completed. Escrow released and split to all parties successfully.',
    });

    await order.save();
    logger.info(`💸 Escrow released and successfully split for Order ${order.orderNumber}`);
    return order;
  }

  /**
   * Refund held escrow directly to customer wallet
   */
  static async refundOrderToCustomerWallet(
    orderId: Types.ObjectId | string,
    refundAmount?: number,
    reason: string = 'Order cancelled'
  ) {
    const order = await Order.findById(orderId);
    if (!order) throw new AppError('Order not found', 404);

    const amountToRefund = refundAmount || order.grandTotal;

    const customerWallet = await this.getOrCreateWallet(order.customerId, Role.CUSTOMER_B2C);
    const prevBal = customerWallet.availableBalanceLkr;
    customerWallet.availableBalanceLkr += amountToRefund;
    await customerWallet.save();

    await LedgerEntry.create({
      walletId: customerWallet._id,
      userId: order.customerId,
      transactionType: TransactionType.REFUND,
      amountLkr: amountToRefund,
      previousBalanceLkr: prevBal,
      newBalanceLkr: customerWallet.availableBalanceLkr,
      referenceOrderId: order._id,
      description: `Refund for Order #${order.orderNumber}: ${reason}`,
    });

    // Remove pending balances from farmers
    for (const item of order.items) {
      const farmerWallet = await Wallet.findOne({ userId: item.farmerId });
      if (farmerWallet) {
        farmerWallet.pendingEscrowBalanceLkr = Math.max(
          0,
          farmerWallet.pendingEscrowBalanceLkr - (item.farmerPayoutLkr || item.subtotal)
        );
        await farmerWallet.save();
      }
    }

    order.paymentStatus = PaymentStatus.REFUNDED;
    order.status = OrderStatus.REFUNDED;
    order.timeline.push({
      status: OrderStatus.REFUNDED,
      timestamp: new Date(),
      note: `Refunded LKR ${amountToRefund.toFixed(2)} to customer wallet: ${reason}`,
    });

    await order.save();
    logger.info(`🔄 Refunded LKR ${amountToRefund} for Order ${order.orderNumber}`);
    return order;
  }
}
