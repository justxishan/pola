import { Router } from 'express';
import { VehicleController } from '../controllers/vehicle.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { requireRole } from '../middleware/role.middleware.js';
import { validateRequest } from '../middleware/validate.middleware.js';
import { upload } from '../middleware/upload.middleware.js';
import { RegisterVehicleSchema } from '../validators/vehicle.validator.js';
import { Role } from '@pola/shared';

const router = Router();

router.use(authenticate);
router.use(requireRole(Role.DELIVERY_INDIVIDUAL, Role.DELIVERY_COMPANY, Role.ADMIN_SUPER));

router.post('/', validateRequest(RegisterVehicleSchema), VehicleController.registerVehicle);
router.get('/my-vehicles', VehicleController.getMyVehicles);
router.post(
  '/:id/documents',
  upload.fields([
    { name: 'crBook', maxCount: 1 },
    { name: 'revenueLicense', maxCount: 1 },
  ]),
  VehicleController.uploadDocuments
);

export default router;
