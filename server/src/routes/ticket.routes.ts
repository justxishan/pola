import { Router } from 'express';
import { TicketController } from '../controllers/ticket.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';

const router = Router();

router.use(authenticate);

router.post('/', TicketController.createTicket);
router.get('/my-tickets', TicketController.getMyTickets);
router.get('/:id', TicketController.getTicketById);
router.post('/:id/reply', TicketController.replyTicket);

export default router;
