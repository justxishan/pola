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
router.get('/:id', HubController.getHubById);

router.post(
  '/intake-grading',
  authenticate,
  requireRole(Role.COLLECTOR, Role.ADMIN_SUPER, Role.ADMIN_LOGISTICS, Role.DELIVERY_INDIVIDUAL),
  validateRequest(HubIntakeSheetSchema),
  HubController.submitIntakeGrading
);

export default router;
