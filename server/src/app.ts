import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { env } from './config/env.config.js';
import masterRouter from './routes/index.js';
import { errorHandler, AppError } from './middleware/error.middleware.js';
import { apiRateLimiter } from './middleware/rateLimiter.middleware.js';

export const createApp = (): Application => {
  const app = express();

  // Security and HTTP headers
  app.use(helmet());

  // CORS Configuration
  app.use(
    cors({
      origin: [env.CLIENT_URL, 'http://localhost:5173', 'http://localhost:3000'],
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization'],
    })
  );

  // Request Body Parsers
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // HTTP Request Logger
  if (env.NODE_ENV !== 'test') {
    app.use(morgan('dev'));
  }

  // Global API Rate Limiter
  app.use('/api/', apiRateLimiter);

  // Mount API Master Router
  app.use('/api/v1', masterRouter);

  // Catch 404 Unhandled Routes
  app.all('*', (req: Request, res: Response, next: NextFunction) => {
    next(new AppError(`Cannot find endpoint [${req.method}] ${req.originalUrl} on this server`, 404));
  });

  // Global Centralized Error Handler
  app.use(errorHandler);

  return app;
};
