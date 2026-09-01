import { Types } from 'mongoose';
import { Notification } from '../models/Notification.model.js';
import { logger } from '../utils/logger.util.js';

export class NotificationService {
  /**
   * Create an in-app notification for a user
   */
  static async sendNotification(options: {
    userId: Types.ObjectId | string;
    title: string;
    message: string;
    type?: 'order' | 'kyc' | 'wallet' | 'grading' | 'delivery' | 'dispute' | 'system' | 'message';
    linkUrl?: string;
    relatedId?: string;
  }) {
    try {
      const notification = await Notification.create({
        userId: options.userId,
        title: options.title,
        message: options.message,
        type: options.type || 'system',
        linkUrl: options.linkUrl,
        relatedId: options.relatedId,
        isRead: false,
      });

      logger.info(`🔔 Notification sent to user ${options.userId}: ${options.title}`);
      return notification;
    } catch (error: any) {
      logger.error(`Failed to create notification: ${error.message}`);
    }
  }
}
