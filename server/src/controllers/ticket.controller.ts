import { Request, Response, NextFunction } from 'express';
import { Types } from 'mongoose';
import { SupportTicket } from '../models/SupportTicket.model.js';
import { AppError } from '../middleware/error.middleware.js';

export class TicketController {
  /**
   * Create Support Ticket
   */
  static async createTicket(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const { subject, category, priority, messageText, relatedOrderId } = req.body;

      const ticketNumber = `TCK-${Date.now().toString().slice(-6)}`;

      const ticket = await SupportTicket.create({
        ticketNumber,
        userId: new Types.ObjectId(userId),
        userRole: req.user!.role,
        subject,
        category: category || 'general',
        priority: priority || 'medium',
        status: 'open',
        relatedOrderId: relatedOrderId ? new Types.ObjectId(relatedOrderId) : undefined,
        messages: [
          {
            senderId: new Types.ObjectId(userId),
            senderRole: req.user!.role,
            messageText,
            sentAt: new Date(),
          },
        ],
      });

      res.status(201).json({
        success: true,
        message: 'Support ticket created successfully',
        data: { ticket },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get User's Support Tickets
   */
  static async getMyTickets(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const tickets = await SupportTicket.find({ userId }).sort({ createdAt: -1 });

      res.status(200).json({
        success: true,
        data: { tickets },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get Ticket Details by ID
   */
  static async getTicketById(req: Request, res: Response, next: NextFunction) {
    try {
      const ticket = await SupportTicket.findById(req.params.id)
        .populate('userId', 'fullName email phone')
        .populate('assignedAdminId', 'fullName email');

      if (!ticket) throw new AppError('Support ticket not found', 404);

      res.status(200).json({
        success: true,
        data: { ticket },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Reply to a Ticket Thread
   */
  static async replyTicket(req: Request, res: Response, next: NextFunction) {
    try {
      const senderId = req.user!.userId;
      const { messageText, attachments } = req.body;

      const ticket = await SupportTicket.findById(req.params.id);
      if (!ticket) throw new AppError('Support ticket not found', 404);

      ticket.messages.push({
        senderId: new Types.ObjectId(senderId),
        senderRole: req.user!.role,
        messageText,
        attachments: attachments || [],
        sentAt: new Date(),
      });

      if (req.user!.role.startsWith('admin')) {
        ticket.status = 'waiting_for_user';
      } else {
        ticket.status = 'in_progress';
      }

      await ticket.save();

      res.status(200).json({
        success: true,
        message: 'Reply sent',
        data: { ticket },
      });
    } catch (error) {
      next(error);
    }
  }
}
