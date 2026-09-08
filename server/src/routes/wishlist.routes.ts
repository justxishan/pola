import { Router } from 'express';
import { WishlistController } from '../controllers/wishlist.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';

const router = Router();

router.get('/', authenticate, WishlistController.getWishlist);
router.post('/:productId', authenticate, WishlistController.addToWishlist);
router.delete('/:productId', authenticate, WishlistController.removeFromWishlist);

export default router;
