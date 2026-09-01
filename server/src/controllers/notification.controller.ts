import { Request, Response, NextFunction } from 'express';
import { Notification } from '../models/Notification.model.js';

export class NotificationController {
  /**
   * Get authenticated user's in-app notifications
   */
  static async getMyNotifications(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const portal = req.query.portal as string | undefined;

      const filter: Record<string, any> = { userId };
      if (portal && ['customer', 'farmer', 'delivery', 'admin'].includes(portal)) {
        filter.portal = portal;
      }

      const notifications = await Notification.find(filter)
        .sort({ createdAt: -1 })
        .limit(50);

      const unreadCount = await Notification.countDocuments({ ...filter, isRead: false });

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
