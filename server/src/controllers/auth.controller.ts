import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { User } from '../models/User.model.js';
import { Wallet } from '../models/Wallet.model.js';
import { env } from '../config/env.config.js';
import { verifyGoogleIdToken } from '../config/oauth.config.js';
import { MailerService } from '../services/mailer.service';
import { EscrowService } from '../services/escrow.service.js';
import { CloudinaryService } from '../services/cloudinary.service.js';
import { AppError } from '../middleware/error.middleware.js';
import { Role, VerificationStatus } from '@pola/shared';
import { validateSriLankanNic } from '@pola/shared';
import { validateSriLankanPhone } from '@pola/shared';
import { OTP_EXPIRY_MINUTES } from '../utils/constants.js';
import { logger } from '../utils/logger.util.js';

export class AuthController {
  private static generateToken(user: any) {
    return jwt.sign(
      {
        userId: user._id.toString(),
        email: user.email,
        role: user.role,
        isKycVerified: user.kycStatus === VerificationStatus.VERIFIED,
      },
      env.JWT_SECRET,
      { expiresIn: env.JWT_EXPIRES_IN as any }
    );
  }

  /**
   * Request Email OTP
   */
  static async requestOtp(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, role } = req.body;
      const lowerEmail = email.toLowerCase().trim();

      // Generate 6-digit random code
      const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
      const otpExpiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);

      let user = await User.findOne({ email: lowerEmail });
      if (!user) {
        user = new User({
          email: lowerEmail,
          fullName: lowerEmail.split('@')[0],
          role: (role as Role) || Role.CUSTOMER_B2C,
        });
      } else if (role && user.role === Role.CUSTOMER_B2C && role !== Role.CUSTOMER_B2C) {
        user.role = role as Role;
      }

      user.otpCode = otpCode;
      user.otpExpiresAt = otpExpiresAt;
      await user.save();

      logger.info(`🔑 [OTP GENERATED] Email: ${lowerEmail} | Code: ${otpCode} | Target Role: ${user.role}`);

      // Attempt to send email via SMTP (non-blocking fallback in dev)
      try {
        await MailerService.sendOtpEmail(lowerEmail, otpCode, user.fullName);
      } catch (mailErr: any) {
        logger.warn(`Mailer notification issue: ${mailErr.message}. Development OTP available in console.`);
      }

      res.status(200).json({
        success: true,
        message: `A 6-digit verification code has been sent to ${lowerEmail}`,
        devOtp: env.NODE_ENV === 'development' ? otpCode : undefined,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Verify Email OTP
   */
  static async verifyOtp(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, fullName, role } = req.body;
      const otpCode = (req.body.otpCode || req.body.otp || '').trim();
      const lowerEmail = email.toLowerCase().trim();

      const user = await User.findOne({ email: lowerEmail }).select('+otpCode +otpExpiresAt');
      if (!user) {
        throw new AppError('User not found. Please request a new OTP.', 404);
      }

      if (!user.otpCode || !user.otpExpiresAt) {
        throw new AppError('No OTP request found. Please request a new OTP.', 400);
      }

      if (new Date() > user.otpExpiresAt) {
        throw new AppError('OTP code has expired. Please request a new code.', 400);
      }

      if (user.otpCode !== otpCode) {
        throw new AppError('Incorrect verification code. Please try again.', 400);
      }

      // Valid OTP
      user.otpCode = undefined;
      user.otpExpiresAt = undefined;
      user.isEmailVerified = true;
      user.lastLoginAt = new Date();

      if (fullName && (!user.fullName || user.fullName === lowerEmail.split('@')[0])) {
        user.fullName = fullName;
      }
      if (role) {
        user.role = role as Role;
      }

      await user.save();
      await EscrowService.getOrCreateWallet(user._id, user.role);

      const token = AuthController.generateToken(user);

      res.status(200).json({
        success: true,
        message: 'Authentication successful',
        data: {
          token,
          user: {
            id: user._id,
            fullName: user.fullName,
            email: user.email,
            role: user.role,
            kycStatus: user.kycStatus,
            isEmailVerified: user.isEmailVerified,
            avatarUrl: user.profileImage,
            onboardingCompleted: user.onboardingCompleted ?? false,
            addresses: user.addresses || [],
          },
          isNewUser: !user.lastLoginAt,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Google OAuth Login
   */
  static async googleAuth(req: Request, res: Response, next: NextFunction) {
    try {
      const { idToken, role } = req.body;

      const payload = await verifyGoogleIdToken(idToken);
      if (!payload || !payload.email) {
        throw new AppError('Invalid Google authentication token', 400);
      }

      const lowerEmail = payload.email.toLowerCase().trim();
      let user = await User.findOne({ email: lowerEmail });
      let isNewUser = false;

      if (!user) {
        isNewUser = true;
        user = new User({
          email: lowerEmail,
          googleId: payload.sub,
          fullName: payload.name || lowerEmail.split('@')[0],
          profileImage: payload.picture,
          isEmailVerified: true,
          role: (role as Role) || Role.CUSTOMER_B2C,
          kycStatus: VerificationStatus.UNVERIFIED,
        });
      } else {
        user.googleId = payload.sub;
        user.isEmailVerified = true;
        user.lastLoginAt = new Date();
        if (payload.picture && !user.profileImage) {
          user.profileImage = payload.picture;
        }
        if (role) {
          user.role = role as Role;
        }
      }

      await user.save();
      await EscrowService.getOrCreateWallet(user._id, user.role);

      const token = AuthController.generateToken(user);

      res.status(200).json({
        success: true,
        message: 'Google login successful',
        data: {
          token,
          user: {
            id: user._id,
            fullName: user.fullName,
            email: user.email,
            role: user.role,
            kycStatus: user.kycStatus,
            avatarUrl: user.profileImage,
            onboardingCompleted: user.onboardingCompleted ?? false,
            addresses: user.addresses || [],
          },
          isNewUser,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Select / Switch Role
   */
  static async selectRole(req: Request, res: Response, next: NextFunction) {
    try {
      const { role } = req.body;
      const user = (req as any).user;

      if (!Object.values(Role).includes(role)) {
        throw new AppError('Invalid user role specified', 400);
      }

      user.role = role;
      await user.save();
      await EscrowService.getOrCreateWallet(user._id, role);

      const token = AuthController.generateToken(user);

      res.status(200).json({
        success: true,
        message: `Role assigned as ${role}`,
        data: {
          token,
          user: {
            id: user._id,
            fullName: user.fullName,
            email: user.email,
            role: user.role,
            kycStatus: user.kycStatus,
          },
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Submit KYC Verification Documents
   */
  static async submitKyc(req: Request, res: Response, next: NextFunction) {
    try {
      const user = (req as any).user;
      const files = req.files as { [fieldname: string]: Express.Multer.File[] };
      const { nicNumber, bankName, branchName, accountNumber, accountHolderName } = req.body;

      if (nicNumber) {
        const nicValidation = validateSriLankanNic(nicNumber);
        if (!nicValidation.isValid) {
          throw new AppError('Invalid Sri Lankan NIC number format', 400);
        }
        user.nicNumber = nicNumber;
        if (nicValidation.gender) user.gender = nicValidation.gender;
        if (nicValidation.birthYear) {
          user.dateOfBirth = new Date(nicValidation.birthYear, 0, 1);
        }
      }

      if (bankName && accountNumber) {
        user.bankDetails = {
          bankName,
          branchName: branchName || '',
          accountNumber,
          accountHolderName: accountHolderName || user.fullName,
        };
      }

      if (files?.nicFront && files.nicFront[0]) {
        const uploaded = await CloudinaryService.uploadBuffer(
          files.nicFront[0].buffer,
          'pola/kyc/nic_front'
        );
        user.nicFrontImage = uploaded.secure_url;
      }

      if (files?.nicBack && files.nicBack[0]) {
        const uploaded = await CloudinaryService.uploadBuffer(
          files.nicBack[0].buffer,
          'pola/kyc/nic_back'
        );
        user.nicBackImage = uploaded.secure_url;
      }

      if (files?.selfie && files.selfie[0]) {
        const uploaded = await CloudinaryService.uploadBuffer(
          files.selfie[0].buffer,
          'pola/kyc/selfie'
        );
        user.selfieImage = uploaded.secure_url;
      }

      if ((files?.businessReg || files?.businessRegDoc) && (files.businessReg?.[0] || files.businessRegDoc?.[0])) {
        const file = files.businessReg?.[0] || files.businessRegDoc?.[0];
        const uploaded = await CloudinaryService.uploadBuffer(
          file.buffer,
          'pola/kyc/br'
        );
        user.businessRegDoc = uploaded.secure_url;
      }

      user.kycStatus = VerificationStatus.PENDING;
      await user.save();

      res.status(200).json({
        success: true,
        message: 'KYC documents submitted successfully. Verification pending approval.',
        data: {
          kycStatus: user.kycStatus,
          nicFrontImage: user.nicFrontImage,
          nicBackImage: user.nicBackImage,
          selfieImage: user.selfieImage,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get Current User Profile
   */
  static async getProfile(req: Request, res: Response, next: NextFunction) {
    try {
      const user = (req as any).user;
      res.status(200).json({
        success: true,
        data: {
          user: {
            id: user._id,
            fullName: user.fullName,
            email: user.email,
            phone: user.phone,
            role: user.role,
            kycStatus: user.kycStatus,
            avatarUrl: user.profileImage,
            onboardingCompleted: user.onboardingCompleted ?? false,
            addresses: user.addresses || [],
            bankDetails: user.bankDetails,
            preferredLanguage: user.preferredLanguage,
          },
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update Profile
   */
  static async updateProfile(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user?.userId || (req as any).user?._id;
      const updates = req.body;

      if (updates.phone) {
        const phoneValidation = validateSriLankanPhone(updates.phone);
        if (!phoneValidation.isValid) {
          throw new AppError('Invalid Sri Lankan mobile phone number', 400);
        }
        updates.phone = phoneValidation.formattedNumber;
      }

      // Use findByIdAndUpdate instead of Object.assign + save() to avoid
      // Mongoose re-running subdocument required-field validation on the
      // entire addresses array (which throws 500 on valid data).
      const updatedUser = await User.findByIdAndUpdate(
        userId,
        { $set: updates },
        { new: true, runValidators: false }
      );

      if (!updatedUser) throw new AppError('User not found', 404);

      res.status(200).json({
        success: true,
        message: 'Profile updated successfully',
        data: { user: updatedUser },
      });
    } catch (error) {
      next(error);
    }
  }
}
