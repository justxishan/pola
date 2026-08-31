import { Router } from 'express';
import { OrderController } from '../controllers/order.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { requireRole } from '../middleware/role.middleware.js';
import { validateRequest } from '../middleware/validate.middleware.js';
import { CheckoutOrderSchema, UpdateOrderStatusSchema } from '../validators/order.validator.js';
import { Role } from '@pola/shared';

const router = Router();

router.use(authenticate);

router.post('/checkout', validateRequest(CheckoutOrderSchema), OrderController.checkout);
router.post('/capture-paypal', OrderController.capturePayment);

// Customer: own orders
router.get('/my-orders', OrderController.getMyOrders);

// Farmer/Collector: orders containing their produce
router.get(
  '/farmer-orders',
  requireRole(Role.FARMER, Role.COLLECTOR),
  OrderController.getFarmerOrders
);

// Must come after named routes to avoid swallowing them
router.get('/:id/invoice', OrderController.downloadInvoice);
router.get('/:id', OrderController.getOrderById);
router.patch('/:id/status', validateRequest(UpdateOrderStatusSchema), OrderController.updateStatus);
router.post('/:id/cancel', OrderController.cancelOrder);

export default router;

