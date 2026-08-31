import mongoose from 'mongoose';
import dns from 'dns';
import { env } from './env.config.js';
import { logger } from '../utils/logger.util.js';

// Resolve SRV DNS issues on Windows with Google Public DNS
try {
  dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1']);
} catch {
  // Fallback if environment restricts custom DNS
}

export const connectDB = async (): Promise<typeof mongoose> => {
  try {
    const conn = await mongoose.connect(env.MONGO_URI, {
      dbName: 'pola_marketplace',
      maxPoolSize: 20,
      serverSelectionTimeoutMS: 15000,
      socketTimeoutMS: 45000,
    });

    logger.info(`📦 MongoDB Atlas Connected: ${conn.connection.host} / DB: ${conn.connection.name}`);

    mongoose.connection.on('error', (err) => {
      logger.error(`MongoDB Connection Error: ${err.message}`);
    });

    mongoose.connection.on('disconnected', () => {
      logger.warn('MongoDB Disconnected. Attempting reconnection...');
    });

    return conn;
  } catch (error: any) {
    logger.error(`❌ MongoDB Connection Failure: ${error.message}`);
    process.exit(1);
  }
};
