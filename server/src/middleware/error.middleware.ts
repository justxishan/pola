import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger.util.js';

export class AppError extends Error {
  statusCode: number;
  isOperational: boolean;
  errors?: Record<string, string[]>;

  constructor(message: string, statusCode: number = 500, errors?: Record<string, string[]>) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    this.errors = errors;
    Error.captureStackTrace(this, this.constructor);
  }
}

export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const statusCode = err.statusCode || (err.name === 'ValidationError' ? 400 : 500);
  const message = err.message || 'Internal Server Error';

  logger.error(`[${req.method}] ${req.originalUrl} - ${statusCode} - ${message}`);
  if (err.stack && statusCode === 500) {
    logger.error(err.stack);
  }

  res.status(statusCode).json({
    success: false,
    error: message,
    errors: err.errors,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
  });
};
