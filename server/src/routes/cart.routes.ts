import { Router } from 'express';
import { CartController } from '../controllers/cart.controller.js';
import { optionalAuthenticate } from '../middleware/auth.middleware.js';

const router = Router();

router.post('/validate', optionalAuthenticate, CartController.validateCart);

export default router;
