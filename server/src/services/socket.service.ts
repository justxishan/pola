import { Server as HttpServer } from 'http';
import { Server as SocketIOServer, Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import { env } from '../config/env.config.js';
import { logger } from '../utils/logger.util.js';
import { Order } from '../models/Order.model.js';
import { Conversation, IParticipant } from '../models/Conversation.model.js';
import { Message } from '../models/Message.model.js';
import { User } from '../models/User.model.js';
import { NotificationService } from './notification.service.js';
import { Types } from 'mongoose';

interface AuthenticatedSocket extends Socket {
  data: {
    userId: string;
    role: string;
    email?: string;
  };
}

export class SocketService {
  private static io: SocketIOServer | null = null;

  static init(server: HttpServer): SocketIOServer {
    this.io = new SocketIOServer(server, {
      cors: {
        origin: '*',
        methods: ['GET', 'POST', 'PATCH'],
        credentials: true,
      },
    });

    // Handshake Auth Middleware
    this.io.use((socket: Socket, next) => {
      try {
        const token =
          socket.handshake.auth?.token ||
          socket.handshake.headers?.authorization?.replace('Bearer ', '');

        if (!token) {
          return next(new Error('Authentication token required for WebSocket connection'));
        }

        const decoded = jwt.verify(token, env.JWT_SECRET) as any;
        socket.data = {
          userId: decoded.userId || decoded.id,
          role: decoded.role,
          email: decoded.email,
        };
        next();
      } catch (err: any) {
        logger.warn(`WebSocket handshake failed: ${err.message}`);
        next(new Error('Invalid or expired authentication token'));
      }
    });

    this.io.on('connection', (socket: Socket) => {
      const authSocket = socket as AuthenticatedSocket;
      const { userId, role } = authSocket.data;
      logger.info(`🔌 WebSocket Client Connected: user=${userId}, role=${role}, socketId=${socket.id}`);

      // Auto-join personal room for direct user notifications
      socket.join(`user:${userId}`);

      // ── Join Order Conversation Room ──────────────────────────────────
      socket.on('conversation:join', async ({ orderId }: { orderId: string }, callback?: Function) => {
        try {
          if (!orderId || !Types.ObjectId.isValid(orderId)) {
            if (callback) callback({ error: 'Invalid order ID' });
            return;
          }

          const order = await Order.findById(orderId);
          if (!order) {
            if (callback) callback({ error: 'Order not found' });
            return;
          }

          const isAdmin = role?.startsWith('admin');
          const isCustomer = order.customerId.toString() === userId;
          const isFarmer = order.items.some((item) => item.farmerId?.toString() === userId);
          const isDriver = order.leg2DriverId?.toString() === userId || order.leg1DriverId?.toString() === userId;

          if (!isAdmin && !isCustomer && !isFarmer && !isDriver) {
            if (callback) callback({ error: 'Access denied: You are not a stakeholder on this order' });
            return;
          }

          // Ensure conversation document exists
          let conversation = await Conversation.findOne({ orderId: new Types.ObjectId(orderId) });
          if (!conversation) {
            const participants: IParticipant[] = [
              { userId: order.customerId, role: 'customer' },
            ];

            order.items.forEach((item) => {
              if (item.farmerId && !participants.some((p) => p.userId.toString() === item.farmerId?.toString())) {
                participants.push({ userId: item.farmerId as any, role: 'farmer' });
              }
            });

            if (order.leg2DriverId) {
              participants.push({ userId: order.leg2DriverId as any, role: 'driver' });
            }

            conversation = await Conversation.create({
              orderId: new Types.ObjectId(orderId),
              participants,
              unreadCounts: {},
            });
          }

          const roomName = `order:${orderId}`;
          socket.join(roomName);

          // Fetch message history
          const messages = await Message.find({ orderId: new Types.ObjectId(orderId) })
            .sort({ createdAt: 1 })
            .populate('senderId', 'fullName email avatarUrl role')
            .lean();

          if (callback) {
            callback({
              success: true,
              data: {
                conversation,
                messages,
              },
            });
          }
        } catch (err: any) {
          logger.error(`conversation:join error: ${err.message}`);
          if (callback) callback({ error: err.message });
        }
      });

      // ── Leave Order Conversation Room ─────────────────────────────────
      socket.on('conversation:leave', ({ orderId }: { orderId: string }) => {
        if (orderId) {
          socket.leave(`order:${orderId}`);
        }
      });

      // ── Send Message ──────────────────────────────────────────────────
      socket.on('message:send', async ({
        orderId,
        text,
        attachmentUrl,
      }: {
        orderId: string;
        text: string;
        attachmentUrl?: string;
      }, callback?: Function) => {
        try {
          if (!orderId || !text?.trim()) {
            if (callback) callback({ error: 'Order ID and message text are required' });
            return;
          }

          const order = await Order.findById(orderId);
          if (!order) {
            if (callback) callback({ error: 'Order not found' });
            return;
          }

          const sanitizedText = text.replace(/<[^>]*>?/gm, '').trim();
          if (!sanitizedText) {
            if (callback) callback({ error: 'Message cannot be empty' });
            return;
          }

          let conversation = await Conversation.findOne({ orderId: new Types.ObjectId(orderId) });
          if (!conversation) {
            conversation = await Conversation.create({
              orderId: new Types.ObjectId(orderId),
              participants: [{ userId: new Types.ObjectId(userId), role: (role as any) || 'customer' }],
            });
          }

          // Create message record
          const message = await Message.create({
            conversationId: conversation._id,
            orderId: new Types.ObjectId(orderId),
            senderId: new Types.ObjectId(userId),
            text: sanitizedText,
            attachmentUrl,
            readBy: [new Types.ObjectId(userId)],
          });

          const populatedMessage = await Message.findById(message._id)
            .populate('senderId', 'fullName email avatarUrl role')
            .lean();

          // Update conversation last message preview & unread counts
          conversation.lastMessageAt = new Date();
          conversation.lastMessagePreview = sanitizedText.substring(0, 80);

          // Increment unread counts for participants other than sender
          conversation.participants.forEach((p) => {
            const pid = p.userId.toString();
            if (pid !== userId) {
              const currentUnread = conversation!.unreadCounts.get(pid) || 0;
              conversation!.unreadCounts.set(pid, currentUnread + 1);
            }
          });

          await conversation.save();

          const roomName = `order:${orderId}`;
          // Broadcast to everyone in the room
          SocketService.io?.to(roomName).emit('message:new', {
            orderId,
            message: populatedMessage,
          });

          // Offline notification check: notify counterpart if not currently connected
          const senderUser = await User.findById(userId);
          const senderName = senderUser?.fullName || 'A participant';

          // Determine recipient(s)
          conversation.participants.forEach(async (p) => {
            const pid = p.userId.toString();
            if (pid !== userId) {
              await NotificationService.sendNotification({
                userId: p.userId,
                title: `New message on Order #${order.orderNumber}`,
                message: `${senderName}: "${sanitizedText.substring(0, 60)}"`,
                type: 'message',
                linkUrl: `/orders/${order._id}/track`,
                relatedId: order._id.toString(),
              });
            }
          });

          if (callback) {
            callback({ success: true, data: { message: populatedMessage } });
          }
        } catch (err: any) {
          logger.error(`message:send error: ${err.message}`);
          if (callback) callback({ error: err.message });
        }
      });

      // ── Mark Messages as Read ─────────────────────────────────────────
      socket.on('message:read', async ({ orderId }: { orderId: string }) => {
        try {
          if (!orderId) return;

          await Message.updateMany(
            { orderId: new Types.ObjectId(orderId), readBy: { $ne: new Types.ObjectId(userId) } },
            { $addToSet: { readBy: new Types.ObjectId(userId) } }
          );

          const conversation = await Conversation.findOne({ orderId: new Types.ObjectId(orderId) });
          if (conversation) {
            conversation.unreadCounts.set(userId, 0);
            await conversation.save();
          }

          SocketService.io?.to(`order:${orderId}`).emit('conversation:read', {
            orderId,
            userId,
          });
        } catch (err: any) {
          logger.error(`message:read error: ${err.message}`);
        }
      });

      // ── Typing Indicators ─────────────────────────────────────────────
      socket.on('typing:start', ({ orderId }: { orderId: string }) => {
        socket.to(`order:${orderId}`).emit('typing:status', { orderId, userId, isTyping: true });
      });

      socket.on('typing:stop', ({ orderId }: { orderId: string }) => {
        socket.to(`order:${orderId}`).emit('typing:status', { orderId, userId, isTyping: false });
      });

      socket.on('disconnect', () => {
        logger.info(`🔌 WebSocket Client Disconnected: user=${userId}`);
      });
    });

    return this.io;
  }

  static getIO(): SocketIOServer | null {
    return this.io;
  }
}
