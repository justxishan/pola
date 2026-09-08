import { Router } from 'express';
import { HubController } from '../controllers/hub.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { requireRole } from '../middleware/role.middleware.js';
import { validateRequest } from '../middleware/validate.middleware.js';
import { HubIntakeSheetSchema } from '../validators/hubGrading.validator.js';
import { Role } from '@pola/shared';

const router = Router();

router.get('/', HubController.getHubs);
router.get('/my-dropoffs', authenticate, HubController.getMyHubDropoffs);
router.get('/my-schedule', authenticate, HubController.getMyHubSchedule);
router.get('/:id', HubController.getHubById);

router.post(
  '/intake-grading',
  authenticate,
  requireRole(Role.COLLECTOR, Role.ADMIN_SUPER, Role.ADMIN_LOGISTICS, Role.DELIVERY_INDIVIDUAL, Role.DELIVERY_COMPANY),
  validateRequest(HubIntakeSheetSchema),
  HubController.submitIntakeGrading
);

router.post(
  '/runs/accept',
  authenticate,
  requireRole(Role.DELIVERY_INDIVIDUAL, Role.DELIVERY_COMPANY),
  HubController.acceptHubRun
);

router.post(
  '/runs/depart',
  authenticate,
  requireRole(Role.DELIVERY_INDIVIDUAL, Role.DELIVERY_COMPANY),
  HubController.departForDc
);

router.post(
  '/runs/confirm-arrival',
  authenticate,
  requireRole(Role.DELIVERY_INDIVIDUAL, Role.DELIVERY_COMPANY, Role.ADMIN_LOGISTICS, Role.ADMIN_SUPER),
  HubController.confirmDcArrival
);

router.patch(
  '/orders/:orderId/override-status',
  authenticate,
  requireRole(Role.ADMIN_SUPER, Role.ADMIN_LOGISTICS),
  HubController.adminOverrideStatus
);

router.post(
  '/:id/assign-driver',
  authenticate,
  requireRole(Role.ADMIN_SUPER, Role.ADMIN_LOGISTICS),
  HubController.assignLeg1Driver
);

export default router;
