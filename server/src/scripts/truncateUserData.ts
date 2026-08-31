import { connectDB } from '../config/db.config.js';
import { User } from '../models/User.model.js';
import { Wallet } from '../models/Wallet.model.js';
import { Farm } from '../models/Farm.model.js';
import { Product } from '../models/Product.model.js';
import { Order } from '../models/Order.model.js';
import { LedgerEntry } from '../models/LedgerEntry.model.js';
import { Vehicle } from '../models/Vehicle.model.js';
import { QualityInspection } from '../models/QualityInspection.model.js';
import { Rating } from '../models/Rating.model.js';
import { Notification } from '../models/Notification.model.js';
import { Dispute } from '../models/Dispute.model.js';
import { SupportTicket } from '../models/SupportTicket.model.js';
import { WastageLog } from '../models/WastageLog.model.js';
import { DistributionCenter } from '../models/DistributionCenter.model.js';
import { VillageHub } from '../models/VillageHub.model.js';
import { logger } from '../utils/logger.util.js';
import mongoose from 'mongoose';

export const truncateUserData = async () => {
  try {
    logger.info('🧹 Starting Safe User Data Truncation...');
    await connectDB();

    // 1. Identify Super Admin to preserve
    const adminEmail = 'admin@pola.lk';
    const adminUser = await User.findOne({ email: adminEmail });
    const adminId = adminUser ? adminUser._id : null;

    // 2. Truncate User-Generated Collections
    const deletedFarms = await Farm.deleteMany({});
    const deletedProducts = await Product.deleteMany({});
    const deletedOrders = await Order.deleteMany({});
    const deletedVehicles = await Vehicle.deleteMany({});
    const deletedInspections = await QualityInspection.deleteMany({});
    const deletedRatings = await Rating.deleteMany({});
    const deletedNotifications = await Notification.deleteMany({});
    const deletedDisputes = await Dispute.deleteMany({});
    const deletedTickets = await SupportTicket.deleteMany({});
    const deletedWastage = await WastageLog.deleteMany({});
    const deletedLedger = await LedgerEntry.deleteMany({});

    // 3. Delete Non-Admin Users
    const deletedUsers = await User.deleteMany(
      adminId ? { _id: { $ne: adminId } } : { email: { $ne: adminEmail } }
    );

    // 4. Delete Non-Admin Wallets
    const deletedWallets = await Wallet.deleteMany(
      adminId ? { userId: { $ne: adminId } } : {}
    );

    // 5. Verify Preserved Seed Infrastructure
    const dcCount = await DistributionCenter.countDocuments();
    const hubCount = await VillageHub.countDocuments();
    const preservedUsers = await User.countDocuments();

    logger.info('----------------------------------------------------');
    logger.info('✨ SAFE USER DATA TRUNCATION COMPLETED');
    logger.info('----------------------------------------------------');
    logger.info(`🗑  Deleted Users (Farmers/Customers/Couriers): ${deletedUsers.deletedCount}`);
    logger.info(`🗑  Deleted Farm Parcels:                      ${deletedFarms.deletedCount}`);
    logger.info(`🗑  Deleted Produce Listings:                  ${deletedProducts.deletedCount}`);
    logger.info(`🗑  Deleted Orders & Escrows:                  ${deletedOrders.deletedCount}`);
    logger.info(`🗑  Deleted Driver Vehicles:                   ${deletedVehicles.deletedCount}`);
    logger.info(`🗑  Deleted Quality Inspections:               ${deletedInspections.deletedCount}`);
    logger.info(`🗑  Deleted Customer Ratings & Reviews:        ${deletedRatings.deletedCount}`);
    logger.info(`🗑  Deleted Notifications:                     ${deletedNotifications.deletedCount}`);
    logger.info(`🗑  Deleted Customer Disputes:                 ${deletedDisputes.deletedCount}`);
    logger.info(`🗑  Deleted Wallets & Ledger Entries:          ${deletedWallets.deletedCount} wallets, ${deletedLedger.deletedCount} ledger lines`);
    logger.info('----------------------------------------------------');
    logger.info(`🛡  PRESERVED SEED DATA:`);
    logger.info(`✅  Distribution Centers:                     ${dcCount} centers`);
    logger.info(`✅  Village Agrarian Hubs:                    ${hubCount} hubs`);
    logger.info(`✅  Super Admin Account (admin@pola.lk):      ${preservedUsers} admin`);
    logger.info('----------------------------------------------------');

    await mongoose.disconnect();
    process.exit(0);
  } catch (error: any) {
    logger.error(`❌ Truncation failed: ${error.message}`);
    process.exit(1);
  }
};

truncateUserData();
