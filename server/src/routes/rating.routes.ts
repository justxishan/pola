import { Router } from 'express';
import { RatingController } from '../controllers/rating.controller.js';
import { authenticate, optionalAuthenticate } from '../middleware/auth.middleware.js';

const router = Router();

router.get('/check', authenticate, RatingController.checkOrderRating);
router.get('/', optionalAuthenticate, RatingController.getTargetRatings);
router.post('/', authenticate, RatingController.submitRating);

export default router;
