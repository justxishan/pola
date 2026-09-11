import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { Types } from 'mongoose';
import { Role } from '@pola/shared';
import { UpdateProfileSchema } from '../validators/auth.validator.js';
import {
  getOrderStakeholderInfo,
  assertOrderStakeholder,
  sanitizeOrderForRole,
} from '../utils/orderAuth.util.js';

describe('Security & Authorization Hardening', () => {
  describe('Mass-Assignment Defense (UpdateProfileSchema)', () => {
    test('Allows safe profile fields: fullName, phone, addresses, bankDetails', () => {
      const validPayload = {
        body: {
          fullName: 'Kamal Perera',
          phone: '+94771234567',
          preferredLanguage: 'si',
          themePreference: 'dark',
        },
      };

      const result = UpdateProfileSchema.safeParse(validPayload);
      assert.equal(result.success, true);
    });

    test('Strips or fails on unauthorized privilege escalation keys', () => {
      const maliciousPayload = {
        body: {
          fullName: 'Malicious Actor',
          role: Role.ADMIN_SUPER,
          kycStatus: 'verified',
          password: 'hackedPassword123',
          isAdmin: true,
        },
      };

      const parsed = UpdateProfileSchema.parse(maliciousPayload) as any;
      // In strict or typed schema, role, kycStatus, password, isAdmin must not be accepted
      assert.equal(parsed.body.role, undefined);
      assert.equal(parsed.body.kycStatus, undefined);
      assert.equal(parsed.body.password, undefined);
      assert.equal(parsed.body.isAdmin, undefined);
    });
  });

  describe('Order Stakeholder Access Control (IDOR Defense)', () => {
    const customerId = new Types.ObjectId().toString();
    const farmerId = new Types.ObjectId().toString();
    const driverId = new Types.ObjectId().toString();
    const attackerId = new Types.ObjectId().toString();

    const mockOrder = {
      _id: new Types.ObjectId(),
      customerId: customerId,
      items: [
        {
          productId: new Types.ObjectId(),
          farmerId: farmerId,
          quantityOrdered: 10,
          unitPrice: 150,
        },
      ],
      leg1DriverId: driverId,
      leg2DriverId: null,
      handoverOtp: '849201',
      status: 'placed',
    };

    test('Buyer customer is recognized as stakeholder', () => {
      const info = getOrderStakeholderInfo(mockOrder, customerId, Role.CUSTOMER_B2C);
      assert.equal(info.isStakeholder, true);
      assert.equal(info.isCustomer, true);
      assert.equal(info.isFarmer, false);
      assert.equal(info.isDriver, false);
      assert.equal(info.isAdmin, false);
      assert.doesNotThrow(() => assertOrderStakeholder(mockOrder, customerId, Role.CUSTOMER_B2C));
    });

    test('Participating farmer is recognized as stakeholder', () => {
      const info = getOrderStakeholderInfo(mockOrder, farmerId, Role.FARMER);
      assert.equal(info.isStakeholder, true);
      assert.equal(info.isCustomer, false);
      assert.equal(info.isFarmer, true);
      assert.doesNotThrow(() => assertOrderStakeholder(mockOrder, farmerId, Role.FARMER));
    });

    test('Assigned driver is recognized as stakeholder', () => {
      const info = getOrderStakeholderInfo(mockOrder, driverId, Role.DELIVERY_INDIVIDUAL);
      assert.equal(info.isStakeholder, true);
      assert.equal(info.isDriver, true);
      assert.doesNotThrow(() => assertOrderStakeholder(mockOrder, driverId, Role.DELIVERY_INDIVIDUAL));
    });

    test('Super admin is recognized as stakeholder', () => {
      const adminId = new Types.ObjectId().toString();
      const info = getOrderStakeholderInfo(mockOrder, adminId, Role.ADMIN_SUPER);
      assert.equal(info.isStakeholder, true);
      assert.equal(info.isAdmin, true);
      assert.doesNotThrow(() => assertOrderStakeholder(mockOrder, adminId, Role.ADMIN_SUPER));
    });

    test('Unrelated attacker is rejected with 403', () => {
      const info = getOrderStakeholderInfo(mockOrder, attackerId, Role.CUSTOMER_B2C);
      assert.equal(info.isStakeholder, false);
      assert.throws(
        () => assertOrderStakeholder(mockOrder, attackerId, Role.CUSTOMER_B2C),
        (err: any) => err.statusCode === 403
      );
    });
  });

  describe('Handover OTP Data Sanitization', () => {
    const customerId = new Types.ObjectId().toString();
    const farmerId = new Types.ObjectId().toString();
    const driverId = new Types.ObjectId().toString();
    const adminId = new Types.ObjectId().toString();

    const mockOrder = {
      _id: new Types.ObjectId(),
      customerId: customerId,
      items: [{ farmerId }],
      leg1DriverId: driverId,
      handoverOtp: '987654',
      status: 'out_for_delivery',
    };

    test('Customer can view handoverOtp', () => {
      const sanitized = sanitizeOrderForRole(mockOrder, customerId, Role.CUSTOMER_B2C);
      assert.equal(sanitized.handoverOtp, '987654');
    });

    test('Admin can view handoverOtp', () => {
      const sanitized = sanitizeOrderForRole(mockOrder, adminId, Role.ADMIN_SUPER);
      assert.equal(sanitized.handoverOtp, '987654');
    });

    test('Farmer CANNOT view handoverOtp', () => {
      const sanitized = sanitizeOrderForRole(mockOrder, farmerId, Role.FARMER);
      assert.equal(sanitized.handoverOtp, undefined);
    });

    test('Driver CANNOT view handoverOtp prior to recipient providing it', () => {
      const sanitized = sanitizeOrderForRole(mockOrder, driverId, Role.DELIVERY_INDIVIDUAL);
      assert.equal(sanitized.handoverOtp, undefined);
    });
  });
});
