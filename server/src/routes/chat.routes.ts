import { Router } from 'express';
import { ChatController } from '../controllers/chat.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';

const router = Router();

router.use(authenticate);

router.get('/conversations', ChatController.getMyConversations);
router.get('/conversations/order/:orderId', ChatController.getConversationByOrderId);
router.post('/conversations/order/:orderId/messages', ChatController.sendMessage);
router.delete('/conversations/order/:orderId/messages/:messageId', ChatController.deleteMessage);
router.patch('/conversations/order/:orderId/read', ChatController.markAsRead);

export default router;
