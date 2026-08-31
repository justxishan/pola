import { createApp } from './app.js';
import { connectDB } from './config/db.config.js';
import { env } from './config/env.config.js';
import { verifyMailerConnection } from './config/mailer.config.js';
import { logger } from './utils/logger.util.js';
import http from 'http';
import mongoose from 'mongoose';

const startServer = async () => {
  try {
    logger.info('🌾 Bootstrapping Pola Agricultural Marketplace Backend...');

    // 1. Connect Database
    await connectDB();

    // 2. Verify Mailer
    await verifyMailerConnection();

    // 3. Create Express App & HTTP Server
    const app = createApp();
    const server = http.createServer(app);

    server.listen(env.PORT, () => {
      logger.info(`🚀 Pola Server listening on port ${env.PORT} in ${env.NODE_ENV} mode`);
      logger.info(`🔗 Base API URL: http://localhost:${env.PORT}/api/v1`);
      logger.info(`🩺 Health Check: http://localhost:${env.PORT}/api/v1/health`);
    });

    // Graceful Shutdown
    const shutdown = async (signal: string) => {
      logger.info(`Received ${signal}. Gracefully shutting down Pola Server...`);
      server.close(async () => {
        logger.info('HTTP server closed.');
        await mongoose.disconnect();
        logger.info('MongoDB Atlas disconnected.');
        process.exit(0);
      });
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));
  } catch (error: any) {
    logger.error(`❌ Failed to start Pola server: ${error.message}`);
    process.exit(1);
  }
};

startServer();
