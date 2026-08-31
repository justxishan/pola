import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger.util.js';

export const auditLogger = (actionName: string) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const originalSend = res.send;

    res.send = function (body: any) {
      if (res.statusCode >= 200 && res.statusCode < 300) {
        const userId = req.user?.userId || 'anonymous';
        const userRole = req.user?.role || 'guest';
        const ip = req.ip || req.socket.remoteAddress;

        logger.info(
          `[AUDIT] Action: ${actionName} | User: ${userId} (${userRole}) | IP: ${ip} | Path: ${req.originalUrl}`
        );
      }
      return originalSend.call(this, body);
    };

    next();
  };
};
