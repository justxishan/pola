import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { User } from '../models/User.model.js';
import { Wallet } from '../models/Wallet.model.js';
import { env } from '../config/env.config.js';
import { verifyGoogleIdToken } from '../config/oauth.config.js';
import { MailerService } from '../services/mailer.service';
import { EscrowService } from '../services/escrow.service.js';
import { CloudinaryService } from '../services/cloudinary.service.js';
import { AppError } from '../middleware/error.middleware.js';
import { Role, VerificationStatus, ADMIN_ROLES } from '@pola/shared';
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

      if (role && ADMIN_ROLES.includes(role as Role)) {
        throw new AppError('Admin accounts cannot be created through email sign-in.', 403);
      }

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

      const isNewUser = !user.lastLoginAt;

      if (user.isActive === false) {
        throw new AppError('This account has been deactivated. Contact Pola support to reactivate it.', 403);
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
        if (ADMIN_ROLES.includes(role as Role)) {
          throw new AppError('Admin accounts cannot be accessed through email sign-in.', 403);
        }
        if (isNewUser) {
          user.role = role as Role;
        } else if (user.role !== role) {
          throw new AppError(
            `This email is already registered as a ${user.role.replace(/_/g, ' ')}. Please sign in from that portal instead.`,
            409
          );
        }
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
          isNewUser,
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

      if (role && ADMIN_ROLES.includes(role as Role)) {
        throw new AppError('Admin accounts cannot be accessed through Google sign-in.', 403);
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
        if (user.isActive === false) {
          throw new AppError('This account has been deactivated. Contact Pola support to reactivate it.', 403);
        }
        user.googleId = payload.sub;
        user.isEmailVerified = true;
        user.lastLoginAt = new Date();
        if (payload.picture && !user.profileImage) {
          user.profileImage = payload.picture;
        }
        if (role && user.role !== role) {
          throw new AppError(
            `This email is already registered as a ${user.role.replace(/_/g, ' ')}. Please sign in from that portal instead.`,
            409
          );
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
   * Admin Password Login
   */
  static async adminLogin(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, password } = req.body;
      const lowerEmail = email.toLowerCase().trim();
      const user = await User.findOne({ email: lowerEmail }).select('+password');

      if (!user || !user.password || !ADMIN_ROLES.includes(user.role)) {
        throw new AppError('Invalid email or password', 401);
      }
      if (user.isActive === false) {
        throw new AppError('This account has been deactivated.', 403);
      }
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        throw new AppError('Invalid email or password', 401);
      }

      user.lastLoginAt = new Date();
      await user.save();
      await EscrowService.getOrCreateWallet(user._id, user.role);

      const token = AuthController.generateToken(user);
      res.status(200).json({
        success: true,
        message: 'Admin authentication successful',
        data: {
          token,
          user: {
            id: user._id,
            fullName: user.fullName,
            email: user.email,
            role: user.role,
            kycStatus: user.kycStatus,
            avatarUrl: user.profileImage,
          },
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
      const userId = (req as any).user.userId;
      const user = await User.findById(userId);
      if (!user) throw new AppError('User not found', 404);

      if (ADMIN_ROLES.includes(role as Role)) {
        throw new AppError('Admin roles cannot be self-assigned.', 403);
      }
      if (user.onboardingCompleted) {
        throw new AppError('Your role is already set and cannot be changed here.', 409);
      }

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
      const userId = (req as any).user.userId;
      const user = await User.findById(userId);
      if (!user) throw new AppError('User not found', 404);

      const files = req.files as { [fieldname: string]: Express.Multer.File[] };
      const { nicNumber } = req.body;

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
      const user = await User.findById((req as any).user.userId);
      if (!user) throw new AppError('User not found', 404);
      res.status(200).json({
        success: true,
        data: {
          user: {
            id: user._id,
            fullName: user.fullName,
            username: user.username,
            email: user.email,
            phone: user.phone,
            role: user.role,
            kycStatus: user.kycStatus,
            avatarUrl: user.profileImage,
            onboardingCompleted: user.onboardingCompleted ?? false,
            addresses: user.addresses || [],
            bankDetails: user.bankDetails,
            preferredLanguage: user.preferredLanguage,
            themePreference: user.themePreference || 'system',
            assignedHubId: user.assignedHubId,
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

      if (updates.username) {
        const cleanUsername = updates.username.toLowerCase().trim();
        if (!/^[a-z_.]+$/.test(cleanUsername)) {
          throw new AppError('Username can only contain simple letters, underscore (_), and full stop (.)', 400);
        }
        const existingWithUsername = await User.findOne({
          _id: { $ne: userId },
          username: cleanUsername,
        });
        if (existingWithUsername) {
          throw new AppError('Username is already taken. Please choose another username.', 400);
        }
        updates.username = cleanUsername;
      }

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

  /**
   * Upload Profile Picture / Avatar
   */
  static async uploadAvatar(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user?.userId || (req as any).user?._id;
      const file = req.file;
      if (!file) {
        throw new AppError('No image file provided', 400);
      }

      const uploaded = await CloudinaryService.uploadBuffer(file.buffer, 'pola/avatars');
      const user = await User.findByIdAndUpdate(
        userId,
        { $set: { profileImage: uploaded.secure_url } },
        { new: true, runValidators: false }
      );

      if (!user) throw new AppError('User not found', 404);

      res.status(200).json({
        success: true,
        message: 'Profile picture updated successfully',
        data: {
          avatarUrl: user.profileImage,
          user,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Delete / Deactivate Account
   */
  static async deleteAccount(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user.userId;
      const { reason, details } = req.body;

      const user = await User.findById(userId);
      if (!user) throw new AppError('User not found', 404);

      user.isActive = false;
      user.deactivationReason = details ? `${reason}: ${details}` : reason;
      user.deactivatedAt = new Date();
      user.deletedEmail = user.email;
      user.email = `deleted+${user._id}@pola.lk`;
      await user.save();

      res.status(200).json({
        success: true,
        message: 'Your account has been deactivated.',
      });
    } catch (error) {
      next(error);
    }
  }
}
