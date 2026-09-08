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
      const portal = req.query.portal as string | undefined;

      if (id === 'all') {
        const filter: Record<string, any> = { userId, isRead: false };
        if (portal && ['customer', 'farmer', 'delivery', 'admin'].includes(portal)) {
          filter.portal = portal;
        }
        await Notification.updateMany(filter, { isRead: true, readAt: new Date() });
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

  /**
   * Delete a single notification owned by current user
   */
  static async deleteOne(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const { id } = req.params;

      const deleted = await Notification.findOneAndDelete({ _id: id, userId });
      if (!deleted) {
        res.status(404).json({
          success: false,
          message: 'Notification not found or access denied',
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'Notification deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Bulk delete notifications owned by current user
   */
  static async deleteMany(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const { ids, all } = req.body || {};

      let result;
      if (all === true) {
        result = await Notification.deleteMany({ userId });
      } else if (Array.isArray(ids) && ids.length > 0) {
        result = await Notification.deleteMany({ _id: { $in: ids }, userId });
      } else {
        res.status(400).json({
          success: false,
          message: 'Please provide notification ids array or set all: true',
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'Notifications deleted successfully',
        data: { deletedCount: result.deletedCount },
      });
    } catch (error) {
      next(error);
    }
  }
}
