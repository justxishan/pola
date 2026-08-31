import { Router } from 'express';
import { WebhookController } from '../controllers/webhook.controller.js';

const router = Router();

router.post('/paypal', WebhookController.handlePayPalWebhook);

export default router;
