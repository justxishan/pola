import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { validateRequest } from '../middleware/validate.middleware.js';
import { upload } from '../middleware/upload.middleware.js';
import { authRateLimiter, otpRateLimiter } from '../middleware/rateLimiter.middleware.js';
import {
  RequestOtpSchema,
  VerifyOtpSchema,
  GoogleAuthSchema,
  SelectRoleSchema,
  UpdateProfileSchema,
} from '../validators/auth.validator.js';

const router = Router();

// Public Auth Endpoints
router.post('/otp/request', otpRateLimiter, validateRequest(RequestOtpSchema), AuthController.requestOtp);
router.post('/request-otp', otpRateLimiter, validateRequest(RequestOtpSchema), AuthController.requestOtp);

router.post('/otp/verify', authRateLimiter, validateRequest(VerifyOtpSchema), AuthController.verifyOtp);
router.post('/verify-otp', authRateLimiter, validateRequest(VerifyOtpSchema), AuthController.verifyOtp);

router.post('/google', authRateLimiter, validateRequest(GoogleAuthSchema), AuthController.googleAuth);

// Protected Auth Endpoints
router.get('/profile', authenticate, AuthController.getProfile);
router.get('/me', authenticate, AuthController.getProfile);

router.patch('/profile', authenticate, validateRequest(UpdateProfileSchema), AuthController.updateProfile);
router.post('/select-role', authenticate, validateRequest(SelectRoleSchema), AuthController.selectRole);

router.post(
  '/kyc/submit',
  authenticate,
  upload.fields([
    { name: 'nicFront', maxCount: 1 },
    { name: 'nicBack', maxCount: 1 },
    { name: 'selfie', maxCount: 1 },
    { name: 'businessRegDoc', maxCount: 1 },
    { name: 'businessReg', maxCount: 1 },
  ]),
  AuthController.submitKyc
);
router.post(
  '/kyc',
  authenticate,
  upload.fields([
    { name: 'nicFront', maxCount: 1 },
    { name: 'nicBack', maxCount: 1 },
    { name: 'selfie', maxCount: 1 },
    { name: 'businessRegDoc', maxCount: 1 },
    { name: 'businessReg', maxCount: 1 },
  ]),
  AuthController.submitKyc
);

export default router;
