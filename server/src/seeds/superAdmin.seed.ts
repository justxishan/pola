import { User } from '../models/User.model.js';
import { Wallet } from '../models/Wallet.model.js';
import { Role, VerificationStatus } from '@pola/shared';
import { logger } from '../utils/logger.util.js';

export const seedSuperAdmin = async () => {
  const adminEmail = 'admin@pola.lk';

  let admin = await User.findOne({ email: adminEmail });
  if (!admin) {
    admin = await User.create({
      fullName: 'Pola Super Administrator',
      email: adminEmail,
      phone: '+94771234567',
      role: Role.ADMIN_SUPER,
      isEmailVerified: true,
      kycStatus: VerificationStatus.VERIFIED,
      addresses: [
        {
          label: 'Headquarters',
          province: 'Central',
          district: 'Matale',
          addressLine1: 'Pola AgriTech HQ, Dambulla Dedicated Economic Centre',
          city: 'Dambulla',
          isDefault: true,
        },
      ],
    });
    logger.info(`👑 Super Admin account created: ${adminEmail}`);
  } else {
    admin.role = Role.ADMIN_SUPER;
    admin.kycStatus = VerificationStatus.VERIFIED;
    await admin.save();
    logger.info(`👑 Super Admin account verified: ${adminEmail}`);
  }

  let wallet = await Wallet.findOne({ userId: admin._id });
  if (!wallet) {
    await Wallet.create({
      userId: admin._id,
      userRole: Role.ADMIN_SUPER,
      availableBalanceLkr: 0,
      pendingEscrowBalanceLkr: 0,
    });
  }
};
