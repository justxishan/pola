import { Router } from 'express';
import { CartController } from '../controllers/cart.controller.js';
import { authenticate, optionalAuthenticate } from '../middleware/auth.middleware.js';

const router = Router();

// Cart Validation & Fee Calculation (Guest & Logged In)
router.post('/validate', optionalAuthenticate, CartController.validateCart);

// User Persistent Cart (Logged-in)
router.get('/', authenticate, CartController.getSavedCart);
router.put('/', authenticate, CartController.saveCart);
router.delete('/', authenticate, CartController.clearSavedCart);

export default router;
