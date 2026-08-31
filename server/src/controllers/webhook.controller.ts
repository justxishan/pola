import { Request, Response, NextFunction } from 'express';
import { Order } from '../models/Order.model.js';
import { EscrowService } from '../services/escrow.service.js';
import { logger } from '../utils/logger.util.js';

export class WebhookController {
  /**
   * PayPal IPN / Webhook Event Listener
   */
  static async handlePayPalWebhook(req: Request, res: Response, next: NextFunction) {
    try {
      const event = req.body;
      logger.info(`🔔 PayPal Webhook Received: ${event.event_type}`);

      if (event.event_type === 'PAYMENT.CAPTURE.COMPLETED') {
        const customId = event.resource?.custom_id;
        if (customId) {
          await EscrowService.holdOrderInEscrow(customId);
        }
      }

      if (event.event_type === 'PAYMENT.CAPTURE.REFUNDED') {
        const customId = event.resource?.custom_id;
        if (customId) {
          await EscrowService.refundOrderToCustomerWallet(customId, undefined, 'PayPal refund webhook');
        }
      }

      res.status(200).json({ received: true });
    } catch (error: any) {
      logger.error(`Webhook processing error: ${error.message}`);
      res.status(200).json({ received: true, error: error.message });
    }
  }
}
