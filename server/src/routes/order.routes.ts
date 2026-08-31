import { Router } from 'express';
import { OrderController } from '../controllers/order.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { validateRequest } from '../middleware/validate.middleware.js';
import { CheckoutOrderSchema, UpdateOrderStatusSchema } from '../validators/order.validator.js';

const router = Router();

router.use(authenticate);

router.post('/checkout', validateRequest(CheckoutOrderSchema), OrderController.checkout);
router.post('/capture-paypal', OrderController.capturePayment);
router.get('/my-orders', OrderController.getMyOrders);
router.get('/:id', OrderController.getOrderById);
router.get('/:id/invoice', OrderController.downloadInvoice);
router.patch('/:id/status', validateRequest(UpdateOrderStatusSchema), OrderController.updateStatus);
router.post('/:id/cancel', OrderController.cancelOrder);

export default router;
