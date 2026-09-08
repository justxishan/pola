import { Router } from 'express';
import { FarmController } from '../controllers/farm.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { requireRole } from '../middleware/role.middleware.js';
import { validateRequest } from '../middleware/validate.middleware.js';
import { upload } from '../middleware/upload.middleware.js';
import { CreateFarmSchema } from '../validators/farm.validator.js';
import { Role } from '@pola/shared';

const router = Router();

router.use(authenticate);

router.post(
  '/',
  requireRole(Role.FARMER, Role.COLLECTOR),
  upload.fields([
    { name: 'verificationDoc', maxCount: 1 },
    { name: 'organicCertificate', maxCount: 1 },
  ]),
  validateRequest(CreateFarmSchema),
  FarmController.createFarm
);

router.get('/my-farms', requireRole(Role.FARMER, Role.COLLECTOR), FarmController.getMyFarms);
router.get('/:id', FarmController.getFarmById);
router.patch('/:id', requireRole(Role.FARMER, Role.COLLECTOR), FarmController.updateFarm);
router.patch('/:id/deactivate', requireRole(Role.FARMER, Role.COLLECTOR), FarmController.deactivateFarm);
router.patch('/:id/reactivate', requireRole(Role.FARMER, Role.COLLECTOR), FarmController.reactivateFarm);
router.delete('/:id', requireRole(Role.FARMER, Role.COLLECTOR), FarmController.deleteFarm);
router.post(
  '/:id/organic-cert',
  requireRole(Role.FARMER, Role.COLLECTOR),
  upload.single('certificateDoc'),
  FarmController.uploadOrganicCert
);

export default router;

