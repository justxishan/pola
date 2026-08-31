import { connectDB } from '../config/db.config.js';
import { seedProvincesAndDistricts } from './provincesDistricts.seed.js';
import { seedDistributionCenters } from './distributionCenters.seed.js';
import { seedVillageHubs } from './villageHubs.seed.js';
import { seedSuperAdmin } from './superAdmin.seed.js';
import { logger } from '../utils/logger.util.js';
import mongoose from 'mongoose';

const runSeeders = async () => {
  try {
    logger.info('🌱 Starting Pola Database Seeding...');
    await connectDB();

    await seedProvincesAndDistricts();
    await seedDistributionCenters();
    await seedVillageHubs();
    await seedSuperAdmin();

    logger.info('✨ All database seeders completed successfully!');
    await mongoose.disconnect();
    process.exit(0);
  } catch (error: any) {
    logger.error(`❌ Seeding failed: ${error.message}`);
    process.exit(1);
  }
};

runSeeders();
