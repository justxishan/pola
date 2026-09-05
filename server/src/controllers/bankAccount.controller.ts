import { Request, Response, NextFunction } from 'express';
import { Types } from 'mongoose';
import { User } from '../models/User.model.js';
import { AppError } from '../middleware/error.middleware.js';

export class BankAccountController {
  /**
   * Get all bank accounts for authenticated user
   */
  static async getMyBankAccounts(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const user = await User.findById(userId).select('bankAccounts bankDetails');
      if (!user) throw new AppError('User not found', 404);

      // Auto-migrate legacy bankDetails if bankAccounts is empty
      let accounts = user.bankAccounts || [];
      if (accounts.length === 0 && user.bankDetails?.accountNumber) {
        accounts = [
          {
            _id: new Types.ObjectId(),
            bankName: user.bankDetails.bankName || '',
            bankCode: user.bankDetails.bankCode,
            branchName: user.bankDetails.branchName || '',
            branchCode: user.bankDetails.branchCode,
            accountNumber: user.bankDetails.accountNumber,
            accountHolderName: user.bankDetails.accountHolderName || '',
            isDefault: true,
            createdAt: new Date(),
          },
        ];
        user.bankAccounts = accounts as any;
        await user.save();
      }

      const formatted = accounts.map((acc: any) => {
        const raw = acc.accountNumber || '';
        const masked = raw.length > 4 ? `•••• •••• ${raw.slice(-4)}` : raw;
        return {
          _id: acc._id,
          bankName: acc.bankName,
          bankCode: acc.bankCode,
          branchName: acc.branchName,
          branchCode: acc.branchCode,
          accountNumber: raw,
          accountNumberMasked: masked,
          accountHolderName: acc.accountHolderName,
          isDefault: acc.isDefault || false,
          createdAt: acc.createdAt,
        };
      });

      res.status(200).json({
        success: true,
        data: { bankAccounts: formatted },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Add a new Bank Account
   */
  static async addBankAccount(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const { bankName, bankCode, branchName, branchCode, accountNumber, accountHolderName, isDefault } = req.body;

      if (!bankName || !branchName || !accountNumber || !accountHolderName) {
        throw new AppError('Bank name, branch, account number, and account holder name are required', 400);
      }

      const user = await User.findById(userId);
      if (!user) throw new AppError('User not found', 404);

      if (!user.bankAccounts) user.bankAccounts = [];

      const makeDefault = user.bankAccounts.length === 0 ? true : Boolean(isDefault);

      if (makeDefault) {
        user.bankAccounts.forEach((acc: any) => { acc.isDefault = false; });
      }

      const newAccount = {
        _id: new Types.ObjectId(),
        bankName: bankName.trim(),
        bankCode,
        branchName: branchName.trim(),
        branchCode,
        accountNumber: accountNumber.trim(),
        accountHolderName: accountHolderName.trim(),
        isDefault: makeDefault,
        createdAt: new Date(),
      };

      user.bankAccounts.push(newAccount as any);

      if (makeDefault) {
        user.bankDetails = {
          bankName: newAccount.bankName,
          bankCode: newAccount.bankCode,
          branchName: newAccount.branchName,
          branchCode: newAccount.branchCode,
          accountNumber: newAccount.accountNumber,
          accountHolderName: newAccount.accountHolderName,
        };
      }

      await user.save();

      res.status(201).json({
        success: true,
        message: 'Bank account added successfully',
        data: { bankAccount: newAccount },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update an existing Bank Account
   */
  static async updateBankAccount(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const { id } = req.params;
      const { bankName, bankCode, branchName, branchCode, accountNumber, accountHolderName, isDefault } = req.body;

      const user = await User.findById(userId);
      if (!user) throw new AppError('User not found', 404);

      const account = (user.bankAccounts as any)?.id(id);
      if (!account) throw new AppError('Bank account not found', 404);

      if (bankName) account.bankName = bankName.trim();
      if (bankCode !== undefined) account.bankCode = bankCode;
      if (branchName) account.branchName = branchName.trim();
      if (branchCode !== undefined) account.branchCode = branchCode;
      if (accountNumber) account.accountNumber = accountNumber.trim();
      if (accountHolderName) account.accountHolderName = accountHolderName.trim();

      if (isDefault) {
        user.bankAccounts?.forEach((acc: any) => { acc.isDefault = false; });
        account.isDefault = true;
      }

      if (account.isDefault) {
        user.bankDetails = {
          bankName: account.bankName,
          bankCode: account.bankCode,
          branchName: account.branchName,
          branchCode: account.branchCode,
          accountNumber: account.accountNumber,
          accountHolderName: account.accountHolderName,
        };
      }

      await user.save();

      res.status(200).json({
        success: true,
        message: 'Bank account updated successfully',
        data: { bankAccount: account },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Delete a Bank Account
   */
  static async deleteBankAccount(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const { id } = req.params;

      const user = await User.findById(userId);
      if (!user) throw new AppError('User not found', 404);

      const accounts = user.bankAccounts || [];
      const accountIndex = accounts.findIndex((acc: any) => acc._id.toString() === id);
      if (accountIndex === -1) throw new AppError('Bank account not found', 404);

      const wasDefault = accounts[accountIndex].isDefault;
      accounts.splice(accountIndex, 1);

      if (wasDefault && accounts.length > 0) {
        accounts[0].isDefault = true;
        user.bankDetails = {
          bankName: accounts[0].bankName,
          bankCode: accounts[0].bankCode,
          branchName: accounts[0].branchName,
          branchCode: accounts[0].branchCode,
          accountNumber: accounts[0].accountNumber,
          accountHolderName: accounts[0].accountHolderName,
        };
      } else if (accounts.length === 0) {
        user.bankDetails = undefined;
      }

      user.bankAccounts = accounts;
      await user.save();

      res.status(200).json({
        success: true,
        message: 'Bank account deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Set designated Bank Account as Default
   */
  static async setDefaultBankAccount(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const { id } = req.params;

      const user = await User.findById(userId);
      if (!user) throw new AppError('User not found', 404);

      const account = (user.bankAccounts as any)?.id(id);
      if (!account) throw new AppError('Bank account not found', 404);

      user.bankAccounts?.forEach((acc: any) => { acc.isDefault = false; });
      account.isDefault = true;

      user.bankDetails = {
        bankName: account.bankName,
        bankCode: account.bankCode,
        branchName: account.branchName,
        branchCode: account.branchCode,
        accountNumber: account.accountNumber,
        accountHolderName: account.accountHolderName,
      };

      await user.save();

      res.status(200).json({
        success: true,
        message: `Account at ${account.bankName} set as primary payout destination`,
        data: { bankAccount: account },
      });
    } catch (error) {
      next(error);
    }
  }
}
