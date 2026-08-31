import { Router } from 'express';
import { CustomerController } from '../controllers/customer.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { upload } from '../middleware/upload.middleware.js';

const router = Router();

router.use(authenticate);

router.get('/profile', CustomerController.getCustomerProfile);
router.post('/addresses', CustomerController.addAddress);
router.patch('/addresses/:addressId', CustomerController.updateAddress);
router.delete('/addresses/:addressId', CustomerController.deleteAddress);
router.post(
  '/b2b-verify',
  upload.single('businessRegDoc'),
  CustomerController.submitB2BDocuments
);

export default router;
