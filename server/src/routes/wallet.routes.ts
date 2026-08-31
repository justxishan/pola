import { Router } from 'express';
import { WalletController } from '../controllers/wallet.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { validateRequest } from '../middleware/validate.middleware.js';
import { RequestWithdrawalSchema } from '../validators/withdrawal.validator.js';

const router = Router();

router.use(authenticate);

router.get('/my-wallet', WalletController.getMyWallet);
router.get('/transactions', WalletController.getTransactions);
router.post('/withdraw', validateRequest(RequestWithdrawalSchema), WalletController.requestWithdrawal);
router.post('/top-up', WalletController.topUp);
router.post('/top-up/confirm', WalletController.confirmTopUp);

export default router;
