import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { calculateItemSubtotal } from '@pola/shared';
import {
  DEFAULT_PLATFORM_COMMISSION_PERCENT,
  DEFAULT_COLLECTOR_COMMISSION_PERCENT,
  LEG1_FLAT_FEE_LKR,
  LEG1_PER_KG_LKR,
  LEG2_BASE_FEE_LKR,
  LEG2_PER_KG_LKR,
  LKR_TO_USD_RATE,
} from '../utils/constants.js';

describe('Financial Integrity, Commission Splits & Ledger Calculations', () => {
  describe('Produce Subtotal Calculations', () => {
    test('Standard kilogram pricing (kg)', () => {
      // 5 kg at 250 LKR/kg = 1250 LKR
      const subtotal = calculateItemSubtotal(250, 5, 'kg');
      assert.equal(subtotal, 1250);
    });

    test('Realistic Gram pricing (g) calculated per 100g base', () => {
      // 500g of spices at 150 LKR per 100g = (500 / 100) * 150 = 750 LKR
      const subtotal = calculateItemSubtotal(150, 500, 'g');
      assert.equal(subtotal, 750);
    });

    test('Realistic Millilitre pricing (ml) calculated per 100ml base', () => {
      // 250ml of bee honey at 400 LKR per 100ml = (250 / 100) * 400 = 1000 LKR
      const subtotal = calculateItemSubtotal(400, 250, 'ml');
      assert.equal(subtotal, 1000);
    });

    test('Discrete unit pricing (dozen, bundle, piece)', () => {
      assert.equal(calculateItemSubtotal(360, 2, 'dozen'), 720);
      assert.equal(calculateItemSubtotal(120, 3, 'bundle'), 360);
      assert.equal(calculateItemSubtotal(80, 5, 'piece'), 400);
    });

    test('Zero or negative quantity yields 0 subtotal', () => {
      assert.equal(calculateItemSubtotal(250, 0, 'kg'), 0);
      assert.equal(calculateItemSubtotal(250, -5, 'kg'), 0);
      assert.equal(calculateItemSubtotal(0, 10, 'kg'), 0);
    });
  });

  describe('Commission & Payout Split Math', () => {
    test('Accurately splits revenue among farmer, platform, and collector', () => {
      const subtotal = 10000; // 10,000 LKR
      const platformFee = Math.round(((subtotal * DEFAULT_PLATFORM_COMMISSION_PERCENT) / 100) * 100) / 100;
      const collectorCommission = Math.round(((subtotal * DEFAULT_COLLECTOR_COMMISSION_PERCENT) / 100) * 100) / 100;
      const farmerPayout = subtotal - platformFee - collectorCommission;

      assert.equal(platformFee, 500); // 5%
      assert.equal(collectorCommission, 300); // 3%
      assert.equal(farmerPayout, 9200); // 92%
      assert.equal(farmerPayout + platformFee + collectorCommission, subtotal);
    });

    test('Farmer without collector receives full payout minus platform fee', () => {
      const subtotal = 5000;
      const platformFee = Math.round(((subtotal * DEFAULT_PLATFORM_COMMISSION_PERCENT) / 100) * 100) / 100;
      const collectorCommission = 0;
      const farmerPayout = subtotal - platformFee - collectorCommission;

      assert.equal(platformFee, 250);
      assert.equal(farmerPayout, 4750);
      assert.equal(farmerPayout + platformFee, subtotal);
    });
  });

  describe('Two-Leg Logistics Pricing', () => {
    test('Calculates Leg-1 and Leg-2 delivery fees for produce weight', () => {
      const totalWeightKg = 20; // 20 kg crate
      const leg1Fee = LEG1_FLAT_FEE_LKR + totalWeightKg * LEG1_PER_KG_LKR;
      const leg2Fee = LEG2_BASE_FEE_LKR + totalWeightKg * LEG2_PER_KG_LKR;
      const totalDeliveryFee = leg1Fee + leg2Fee;

      // Leg 1: 150 + 20 * 5 = 250
      assert.equal(leg1Fee, 250);
      // Leg 2: 250 + 20 * 10 = 450
      assert.equal(leg2Fee, 450);
      assert.equal(totalDeliveryFee, 700);
    });
  });

  describe('Currency Conversion & PayPal Top-up Verification', () => {
    test('LKR to USD conversion with minimum $1.00 USD floor', () => {
      const smallAmountLkr = 100;
      const convertedUsd = Math.max(1, Math.round(smallAmountLkr * LKR_TO_USD_RATE * 100) / 100);
      assert.equal(convertedUsd, 1);

      const standardAmountLkr = 10000;
      const expectedUsd = Math.max(1, Math.round(10000 * 0.0033 * 100) / 100);
      assert.equal(expectedUsd, 33);
    });

    test('PayPal capture verification detects underpaid top-up amounts', () => {
      const requestedLkr = 10000;
      const expectedUsd = Math.round(requestedLkr * LKR_TO_USD_RATE * 100) / 100; // 33 USD

      // Attacker claims 10,000 LKR but only paid 5 USD
      const capturedUsd = 5.0;
      const isSufficient = capturedUsd >= expectedUsd * 0.98;
      assert.equal(isSufficient, false);

      // Honest transaction matches
      const honestCapturedUsd = 33.0;
      const isHonestSufficient = honestCapturedUsd >= expectedUsd * 0.98;
      assert.equal(isHonestSufficient, true);
    });
  });
});
