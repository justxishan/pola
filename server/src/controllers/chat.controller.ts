import { Request, Response, NextFunction } from 'express';
import { Types } from 'mongoose';
import { Conversation } from '../models/Conversation.model.js';
import { Message } from '../models/Message.model.js';
import { Order } from '../models/Order.model.js';
import { User } from '../models/User.model.js';
import { NotificationService } from '../services/notification.service.js';
import { SocketService } from '../services/socket.service.js';
import { AppError } from '../middleware/error.middleware.js';

export class ChatController {
  /**
   * List all conversations for the current logged-in user
   */
  static async getMyConversations(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const conversations = await Conversation.find({
        'participants.userId': new Types.ObjectId(userId),
      })
        .populate('orderId', 'orderNumber status grandTotal deliveryAddress')
        .populate('participants.userId', 'fullName email avatarUrl role phone')
        .sort({ lastMessageAt: -1 })
        .lean();

      res.status(200).json({
        success: true,
        data: { conversations },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get or create conversation for a specific order and fetch recent message history
   */
  static async getConversationByOrderId(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const userRole = req.user!.role;
      const { orderId } = req.params;

      if (!orderId || !Types.ObjectId.isValid(orderId)) {
        throw new AppError('Valid Order ID is required', 400);
      }

      const order = await Order.findById(orderId)
        .populate('customerId', 'fullName email phone avatarUrl')
        .populate('items.farmerId', 'fullName email phone avatarUrl')
        .populate('leg2DriverId', 'fullName email phone avatarUrl');

      if (!order) throw new AppError('Order not found', 404);

      const isAdmin = userRole?.startsWith('admin');
      const isCustomer = order.customerId?._id?.toString() === userId || order.customerId?.toString() === userId;
      const isFarmer = order.items.some((i) => i.farmerId?._id?.toString() === userId || i.farmerId?.toString() === userId);
      const isDriver = order.leg2DriverId?._id?.toString() === userId || order.leg2DriverId?.toString() === userId;

      if (!isAdmin && !isCustomer && !isFarmer && !isDriver) {
        throw new AppError('Unauthorized: You are not a stakeholder on this order', 403);
      }

      let conversation = await Conversation.findOne({ orderId: new Types.ObjectId(orderId) })
        .populate('participants.userId', 'fullName email avatarUrl role phone');

      if (!conversation) {
        const participants: any[] = [
          { userId: order.customerId._id || order.customerId, role: 'customer' },
        ];

        order.items.forEach((item) => {
          const fid = item.farmerId?._id || item.farmerId;
          if (fid && !participants.some((p) => p.userId.toString() === fid.toString())) {
            participants.push({ userId: fid, role: 'farmer' });
          }
        });

        if (order.leg2DriverId) {
          const did = order.leg2DriverId._id || order.leg2DriverId;
          participants.push({ userId: did, role: 'driver' });
        }

        conversation = await Conversation.create({
          orderId: new Types.ObjectId(orderId),
          participants,
          unreadCounts: {},
        });

        conversation = await Conversation.findById(conversation._id)
          .populate('participants.userId', 'fullName email avatarUrl role phone');
      }

      const messages = await Message.find({ orderId: new Types.ObjectId(orderId) })
        .sort({ createdAt: 1 })
        .populate('senderId', 'fullName email avatarUrl role')
        .lean();

      res.status(200).json({
        success: true,
        data: {
          conversation,
          messages,
          order: {
            _id: order._id,
            orderNumber: order.orderNumber,
            status: order.status,
            customer: order.customerId,
            driver: order.leg2DriverId,
          },
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Send a message in an order conversation (REST fallback)
   */
  static async sendMessage(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const { orderId } = req.params;
      const { text, attachmentUrl } = req.body;

      if (!text?.trim()) {
        throw new AppError('Message text is required', 400);
      }

      const order = await Order.findById(orderId);
      if (!order) throw new AppError('Order not found', 404);

      const sanitizedText = text.replace(/<[^>]*>?/gm, '').trim();

      let conversation = await Conversation.findOne({ orderId: new Types.ObjectId(orderId) });
      if (!conversation) {
        conversation = await Conversation.create({
          orderId: new Types.ObjectId(orderId),
          participants: [{ userId: new Types.ObjectId(userId), role: (req.user!.role as any) || 'customer' }],
          buyerInitiated: false,
        });
      }

      const senderRole = req.user!.role || '';
      const isCustomer = order.customerId.toString() === userId;

      // Policy check: Farmers can only send messages if the buyer has initiated the conversation
      if (senderRole.startsWith('farmer') && !conversation.buyerInitiated) {
        throw new AppError('Farmers can only reply after the buyer sends the first message on this order', 403);
      }

      if (isCustomer) {
        conversation.buyerInitiated = true;
      }

      const message = await Message.create({
        conversationId: conversation._id,
        orderId: new Types.ObjectId(orderId),
        senderId: new Types.ObjectId(userId),
        text: sanitizedText,
        attachmentUrl,
        readBy: [new Types.ObjectId(userId)],
      });

      conversation.lastMessageAt = new Date();
      conversation.lastMessagePreview = sanitizedText.substring(0, 80);

      conversation.participants.forEach((p) => {
        const pid = p.userId.toString();
        if (pid !== userId) {
          const currentUnread = conversation!.unreadCounts.get(pid) || 0;
          conversation!.unreadCounts.set(pid, currentUnread + 1);
        }
      });

      await conversation.save();

      const populatedMessage = await Message.findById(message._id)
        .populate('senderId', 'fullName email avatarUrl role')
        .lean();

      // Emit through Socket.IO
      SocketService.getIO()?.to(`order:${orderId}`).emit('message:new', {
        orderId,
        message: populatedMessage,
      });

      // Dispatch role-specific notification per participant
      const senderUser = await User.findById(userId);
      const senderName = senderUser?.fullName || 'A participant';

      conversation.participants.forEach(async (p) => {
        if (p.userId.toString() !== userId) {
          let targetPortal: 'customer' | 'farmer' | 'delivery' | 'admin' = 'customer';
          let targetDestKey: any = 'ORDER_DETAIL';
          let targetUrl = `/orders/${order._id}/track`;

          if (p.role === 'farmer') {
            targetPortal = 'farmer';
            targetDestKey = 'FARMER_ORDERS';
            targetUrl = '/farmer/orders';
          } else if (p.role === 'driver') {
            targetPortal = 'delivery';
            targetDestKey = 'ACTIVE_TRIP';
            targetUrl = '/delivery/active-trip';
          } else if (p.role === 'admin') {
            targetPortal = 'admin';
            targetDestKey = 'ORDER_DETAIL';
            targetUrl = '/admin/orders';
          }

          await NotificationService.sendNotification({
            userId: p.userId,
            title: `New message on Order #${order.orderNumber}`,
            message: `${senderName}: "${sanitizedText.substring(0, 60)}"`,
            type: 'message',
            portal: targetPortal,
            destinationKey: targetDestKey,
            relatedId: order._id.toString(),
            linkUrl: targetUrl,
          });
        }
      });

      res.status(201).json({
        success: true,
        message: 'Message sent successfully',
        data: { message: populatedMessage },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Mark all messages in an order conversation as read by current user
   */
  static async markAsRead(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const { orderId } = req.params;

      await Message.updateMany(
        { orderId: new Types.ObjectId(orderId), readBy: { $ne: new Types.ObjectId(userId) } },
        { $addToSet: { readBy: new Types.ObjectId(userId) } }
      );

      const conversation = await Conversation.findOne({ orderId: new Types.ObjectId(orderId) });
      if (conversation) {
        conversation.unreadCounts.set(userId, 0);
        await conversation.save();
      }

      SocketService.getIO()?.to(`order:${orderId}`).emit('conversation:read', {
        orderId,
        userId,
      });

      res.status(200).json({
        success: true,
        message: 'Conversation marked as read',
      });
    } catch (error) {
      next(error);
    }
  }
}
