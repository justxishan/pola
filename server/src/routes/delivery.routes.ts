import { Router } from 'express';
import { DeliveryController } from '../controllers/delivery.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { requireRole } from '../middleware/role.middleware.js';
import { upload } from '../middleware/upload.middleware.js';
import { Role } from '@pola/shared';

const router = Router();

router.use(authenticate);
router.use(requireRole(Role.DELIVERY_INDIVIDUAL, Role.DELIVERY_COMPANY));

router.get('/radar', DeliveryController.getAvailableOrdersRadar);
router.post('/trips/:orderId/accept', DeliveryController.acceptTrip);
router.patch('/trips/:orderId/status', DeliveryController.updateTransitStatus);
router.post('/location', DeliveryController.updateLocation);
router.post('/trips/:orderId/pod', upload.single('podPhoto'), DeliveryController.verifyProofOfDelivery);
router.get('/earnings', DeliveryController.getEarnings);
// Must come before /:orderId routes
router.get('/trips/active', DeliveryController.getActiveTrip);
router.get('/trips/history', DeliveryController.getTripHistory);

export default router;
