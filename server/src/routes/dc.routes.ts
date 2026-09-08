import { Router } from 'express';
import { DcController } from '../controllers/dc.controller.js';

const router = Router();

router.get('/', DcController.getDistributionCenters);

export default router;
