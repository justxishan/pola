import { Request, Response, NextFunction } from 'express';
import { Role } from '@pola/shared';
import { AppError } from './error.middleware.js';

export const requireRole = (...allowedRoles: Role[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new AppError('Unauthorized: User not authenticated', 401));
    }

    // Super Admin has access to everything
    if (req.user.role === Role.ADMIN_SUPER) {
      return next();
    }

    if (!allowedRoles.includes(req.user.role)) {
      return next(
        new AppError(
          `Forbidden: Role '${req.user.role}' does not have permission to access this resource`,
          403
        )
      );
    }

    next();
  };
};
