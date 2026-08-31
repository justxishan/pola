import { connectDB } from '../config/db.config.js';
import { seedProvincesAndDistricts } from '../seeds/provincesDistricts.seed.js';
import { seedDistributionCenters } from '../seeds/distributionCenters.seed.js';
import { seedVillageHubs } from '../seeds/villageHubs.seed.js';
import { seedSuperAdmin } from '../seeds/superAdmin.seed.js';
import { logger } from '../utils/logger.util.js';
import mongoose from 'mongoose';

export const freshDb = async () => {
  try {
    logger.info('⚠️  Dropping entire database and re-running seeders from scratch...');
    await connectDB();

    if (mongoose.connection.db) {
      await mongoose.connection.db.dropDatabase();
      logger.info('💥 Database dropped successfully.');
    }

    logger.info('🌱 Re-seeding master data...');
    await seedProvincesAndDistricts();
    await seedDistributionCenters();
    await seedVillageHubs();
    await seedSuperAdmin();

    logger.info('✨ Fresh database rebuild completed with all seeds populated!');
    await mongoose.disconnect();
    process.exit(0);
  } catch (error: any) {
    logger.error(`❌ Fresh database setup failed: ${error.message}`);
    process.exit(1);
  }
};

freshDb();
