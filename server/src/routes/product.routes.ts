import { Router } from 'express';
import { ProductController } from '../controllers/product.controller.js';
import { authenticate, optionalAuthenticate } from '../middleware/auth.middleware.js';
import { requireRole } from '../middleware/role.middleware.js';
import { validateRequest } from '../middleware/validate.middleware.js';
import { upload } from '../middleware/upload.middleware.js';
import { CreateProductSchema, ProductQuerySchema } from '../validators/product.validator.js';
import { Role } from '@pola/shared';

const router = Router();

// Public Catalog Endpoints
router.get('/catalog', validateRequest(ProductQuerySchema), ProductController.getPublicCatalog);
router.get('/:id', ProductController.getProductById);

// Farmer Product Endpoints
router.post(
  '/',
  authenticate,
  requireRole(Role.FARMER, Role.COLLECTOR),
  validateRequest(CreateProductSchema),
  ProductController.createProduct
);

router.get(
  '/farmer/my-products',
  authenticate,
  requireRole(Role.FARMER, Role.COLLECTOR),
  ProductController.getMyProducts
);

router.patch(
  '/:id',
  authenticate,
  requireRole(Role.FARMER, Role.COLLECTOR),
  ProductController.updateProduct
);

router.post(
  '/upload-images',
  authenticate,
  requireRole(Role.FARMER, Role.COLLECTOR),
  upload.array('images', 5),
  ProductController.uploadImages
);

export default router;
