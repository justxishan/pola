import { Router } from 'express';
import { DisputeController } from '../controllers/dispute.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { requireRole } from '../middleware/role.middleware.js';
import { upload } from '../middleware/upload.middleware.js';
import { Role } from '@pola/shared';

const router = Router();

router.use(authenticate);

router.post('/', upload.array('evidencePhotos', 4), DisputeController.createDispute);
router.get('/my-disputes', DisputeController.getMyDisputes);
router.get('/:id', DisputeController.getDisputeById);
router.patch(
  '/:id/adjudicate',
  requireRole(Role.ADMIN_SUPER, Role.ADMIN_SUPPORT),
  DisputeController.adjudicateDispute
);

export default router;
