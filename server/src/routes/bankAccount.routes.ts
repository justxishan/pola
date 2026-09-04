import { Router } from 'express';
import { BankAccountController } from '../controllers/bankAccount.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';

const router = Router();

router.use(authenticate);

router.get('/', BankAccountController.getMyBankAccounts);
router.post('/', BankAccountController.addBankAccount);
router.patch('/:id', BankAccountController.updateBankAccount);
router.delete('/:id', BankAccountController.deleteBankAccount);
router.patch('/:id/set-default', BankAccountController.setDefaultBankAccount);

export default router;
