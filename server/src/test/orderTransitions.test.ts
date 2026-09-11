import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { OrderStatus } from '@pola/shared';
import {
  validateOrderStatusTransition,
  ORDER_TRANSITION_MAP,
} from '../config/orderTransitions.config.js';
import { OrderStakeholderInfo } from '../utils/orderAuth.util.js';

describe('Order Lifecycle State Machine & Transitions', () => {
  const customerStakeholder: OrderStakeholderInfo = {
    isStakeholder: true,
    isCustomer: true,
    isFarmer: false,
    isDriver: false,
    isAdmin: false,
  };

  const farmerStakeholder: OrderStakeholderInfo = {
    isStakeholder: true,
    isCustomer: false,
    isFarmer: true,
    isDriver: false,
    isAdmin: false,
  };

  const driverStakeholder: OrderStakeholderInfo = {
    isStakeholder: true,
    isCustomer: false,
    isFarmer: false,
    isDriver: true,
    isAdmin: false,
  };

  const adminStakeholder: OrderStakeholderInfo = {
    isStakeholder: true,
    isCustomer: false,
    isFarmer: false,
    isDriver: false,
    isAdmin: true,
  };

  const strangerStakeholder: OrderStakeholderInfo = {
    isStakeholder: false,
    isCustomer: false,
    isFarmer: false,
    isDriver: false,
    isAdmin: false,
  };

  test('Customer can cancel an order in PLACED stage', () => {
    assert.doesNotThrow(() => {
      validateOrderStatusTransition(
        OrderStatus.PLACED,
        OrderStatus.CANCELLED,
        customerStakeholder
      );
    });
  });

  test('Customer cannot transition IN_TRANSIT_TO_DC to RECEIVED_AT_DC', () => {
    assert.throws(
      () => {
        validateOrderStatusTransition(
          OrderStatus.IN_TRANSIT_TO_DC,
          OrderStatus.RECEIVED_AT_DC,
          customerStakeholder
        );
      },
      (err: any) => err.statusCode === 403 || (err.message && err.message.includes('not authorized'))
    );
  });

  test('Driver can transition COLLECTED_AT_HUB to IN_TRANSIT_TO_DC', () => {
    assert.doesNotThrow(() => {
      validateOrderStatusTransition(
        OrderStatus.COLLECTED_AT_HUB,
        OrderStatus.IN_TRANSIT_TO_DC,
        driverStakeholder
      );
    });
  });

  test('Farmer cannot transition OUT_FOR_DELIVERY to DELIVERED', () => {
    assert.throws(
      () => {
        validateOrderStatusTransition(
          OrderStatus.OUT_FOR_DELIVERY,
          OrderStatus.DELIVERED,
          farmerStakeholder
        );
      },
      (err: any) => err.statusCode === 403 || (err.message && err.message.includes('not authorized'))
    );
  });

  test('Illegal transition throws 400 (PLACED directly to DELIVERED)', () => {
    assert.throws(
      () => {
        validateOrderStatusTransition(
          OrderStatus.PLACED,
          OrderStatus.DELIVERED,
          customerStakeholder
        );
      },
      (err: any) => err.statusCode === 400 && err.message.includes('Illegal status transition')
    );
  });

  test('Terminal state CANCELLED cannot transition anywhere', () => {
    assert.throws(
      () => {
        validateOrderStatusTransition(
          OrderStatus.CANCELLED,
          OrderStatus.PLACED,
          customerStakeholder
        );
      },
      (err: any) => err.statusCode === 400
    );
  });

  test('Terminal state REFUNDED cannot transition anywhere', () => {
    assert.throws(
      () => {
        validateOrderStatusTransition(
          OrderStatus.REFUNDED,
          OrderStatus.COMPLETED,
          customerStakeholder
        );
      },
      (err: any) => err.statusCode === 400
    );
  });

  test('Admin has master override and can perform any valid state transition', () => {
    assert.doesNotThrow(() => {
      validateOrderStatusTransition(
        OrderStatus.PLACED,
        OrderStatus.CANCELLED,
        adminStakeholder
      );
    });
  });

  test('Unauthorized stranger cannot transition order status', () => {
    assert.throws(
      () => {
        validateOrderStatusTransition(
          OrderStatus.PLACED,
          OrderStatus.CANCELLED,
          strangerStakeholder
        );
      },
      (err: any) => err.statusCode === 403
    );
  });
});
