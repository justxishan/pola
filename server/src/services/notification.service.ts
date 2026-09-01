import { Types } from 'mongoose';
import { Notification, NotificationPortal, NotificationDestinationKey } from '../models/Notification.model.js';
import { SocketService } from './socket.service.js';
import { logger } from '../utils/logger.util.js';

export interface SendNotificationOptions {
  userId: Types.ObjectId | string;
  title: string;
  message: string;
  type?: 'order' | 'kyc' | 'wallet' | 'grading' | 'delivery' | 'dispute' | 'system' | 'message';
  portal?: NotificationPortal;
  destinationKey?: NotificationDestinationKey;
  relatedId?: string;
  linkUrl?: string;
}

export class NotificationService {
  /**
   * Create an in-app notification for a user and push real-time event
   */
  static async sendNotification(options: SendNotificationOptions) {
    try {
      const notification = await Notification.create({
        userId: options.userId,
        title: options.title,
        message: options.message,
        type: options.type || 'system',
        portal: options.portal || 'customer',
        destinationKey: options.destinationKey,
        relatedId: options.relatedId,
        linkUrl: options.linkUrl,
        isRead: false,
      });

      logger.info(`🔔 [${options.portal || 'customer'}] Notification sent to user ${options.userId}: ${options.title}`);

      // Push real-time event over Socket.IO user room
      try {
        const io = SocketService.getIO();
        if (io) {
          io.to(`user:${options.userId.toString()}`).emit('notification:new', {
            notification,
          });
        }
      } catch (socketErr: any) {
        logger.warn(`Could not emit socket notification: ${socketErr.message}`);
      }

      return notification;
    } catch (error: any) {
      logger.error(`Failed to create notification: ${error.message}`);
    }
  }
}
