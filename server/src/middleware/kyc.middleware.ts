import { Request, Response, NextFunction } from 'express';
import { AppError } from './error.middleware.js';

export const requireVerifiedKyc = (req: Request, res: Response, next: NextFunction) => {
  if (!req.user) {
    return next(new AppError('Unauthorized: User not authenticated', 401));
  }

  if (!req.user.isKycVerified) {
    return next(
      new AppError(
        'Action restricted: Verified KYC identity required to perform this transaction/action',
        403
      )
    );
  }

  next();
};
