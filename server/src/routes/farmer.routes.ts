import { Router } from 'express';
import { FarmerController } from '../controllers/farmer.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { requireRole } from '../middleware/role.middleware.js';
import { validateRequest } from '../middleware/validate.middleware.js';
import { QuickOnboardFarmerSchema } from '../validators/farmer.validator.js';
import { Role } from '@pola/shared';

const router = Router();

router.use(authenticate);

router.get(
  '/dashboard',
  requireRole(Role.FARMER, Role.COLLECTOR),
  FarmerController.getDashboardStats
);

router.post(
  '/managed-farmers/onboard',
  requireRole(Role.COLLECTOR),
  validateRequest(QuickOnboardFarmerSchema),
  FarmerController.quickOnboardFarmer
);

router.get(
  '/managed-farmers',
  requireRole(Role.COLLECTOR),
  FarmerController.getManagedFarmers
);

export default router;
