import { Request, Response, NextFunction } from 'express';
import { Notification } from '../models/Notification.model.js';

export class NotificationController {
  /**
   * Get authenticated user's in-app notifications
   */
  static async getMyNotifications(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const notifications = await Notification.find({ userId })
        .sort({ createdAt: -1 })
        .limit(30);

      const unreadCount = await Notification.countDocuments({ userId, isRead: false });

      res.status(200).json({
        success: true,
        data: {
          notifications,
          unreadCount,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Mark notification as read
   */
  static async markAsRead(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const { id } = req.params;

      if (id === 'all') {
        await Notification.updateMany({ userId, isRead: false }, { isRead: true, readAt: new Date() });
      } else {
        await Notification.findOneAndUpdate(
          { _id: id, userId },
          { isRead: true, readAt: new Date() }
        );
      }

      res.status(200).json({
        success: true,
        message: 'Notifications updated',
      });
    } catch (error) {
      next(error);
    }
  }
}
