import { Router } from 'express';
import { AdminController } from '../controllers/admin.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { requireRole } from '../middleware/role.middleware.js';
import { validateRequest } from '../middleware/validate.middleware.js';
import { ProcessWithdrawalSchema, RejectWithdrawalSchema } from '../validators/withdrawal.validator.js';
import { CreateAdminSchema } from '../validators/auth.validator.js';
import { Role } from '@pola/shared';

const router = Router();

router.use(authenticate);
router.use(requireRole(Role.ADMIN_SUPER, Role.ADMIN_FINANCE, Role.ADMIN_LOGISTICS, Role.ADMIN_SUPPORT));

router.post('/create-admin', requireRole(Role.ADMIN_SUPER), validateRequest(CreateAdminSchema), AdminController.createAdmin);

router.get('/dashboard', AdminController.getDashboardMetrics);
router.get('/kyc/queue', AdminController.getKycQueue);
router.patch('/kyc/:id/review', AdminController.reviewKyc);

router.get('/withdrawals/queue', AdminController.getWithdrawalQueue);
router.post(
  '/withdrawals/:id/process',
  validateRequest(ProcessWithdrawalSchema),
  AdminController.processWithdrawal
);
router.post(
  '/withdrawals/:id/reject',
  validateRequest(RejectWithdrawalSchema),
  AdminController.rejectWithdrawal
);

router.post('/orders/:id/reassign', AdminController.forceReassignOrder);
router.get('/orders', AdminController.getAllOrders);
router.get('/audit-logs', AdminController.getAuditLogs);

// Farm Verification Queue
router.get('/farms/queue', AdminController.getFarmVerificationQueue);
router.patch('/farms/:id/verify', AdminController.verifyFarm);
router.patch('/farms/:id/reject', AdminController.rejectFarm);

// Platform Configuration (Super Admin only)
router.get('/platform-config', requireRole(Role.ADMIN_SUPER), AdminController.getPlatformConfig);
router.put('/platform-config', requireRole(Role.ADMIN_SUPER), AdminController.updatePlatformConfig);

export default router;
