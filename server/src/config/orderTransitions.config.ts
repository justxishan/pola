import { OrderStatus } from '@pola/shared';
import { AppError } from '../middleware/error.middleware.js';
import { OrderStakeholderInfo } from '../utils/orderAuth.util.js';

export interface StatusTransitionRule {
  allowedNextStatuses: OrderStatus[];
  allowedRoles: Array<'customer' | 'farmer' | 'driver' | 'admin'>;
}

export const ORDER_TRANSITION_MAP: Record<OrderStatus, StatusTransitionRule> = {
  [OrderStatus.PLACED]: {
    allowedNextStatuses: [OrderStatus.PAYMENT_CONFIRMED, OrderStatus.CANCELLED],
    allowedRoles: ['customer', 'admin'],
  },
  [OrderStatus.PAYMENT_CONFIRMED]: {
    allowedNextStatuses: [OrderStatus.AWAITING_HUB_COLLECTION, OrderStatus.CANCELLED],
    allowedRoles: ['customer', 'farmer', 'admin'],
  },
  [OrderStatus.AWAITING_HUB_COLLECTION]: {
    allowedNextStatuses: [OrderStatus.COLLECTED_AT_HUB, OrderStatus.CANCELLED],
    allowedRoles: ['farmer', 'driver', 'customer', 'admin'],
  },
  [OrderStatus.COLLECTED_AT_HUB]: {
    allowedNextStatuses: [OrderStatus.IN_TRANSIT_TO_DC, OrderStatus.REJECTED_AT_QUALITY_CHECK, OrderStatus.RECEIVED_AT_DC],
    allowedRoles: ['driver', 'farmer', 'admin'],
  },
  [OrderStatus.IN_TRANSIT_TO_DC]: {
    allowedNextStatuses: [OrderStatus.RECEIVED_AT_DC, OrderStatus.REJECTED_AT_QUALITY_CHECK],
    allowedRoles: ['driver', 'admin'],
  },
  [OrderStatus.RECEIVED_AT_DC]: {
    allowedNextStatuses: [OrderStatus.ASSIGNED_FOR_DELIVERY, OrderStatus.OUT_FOR_DELIVERY],
    allowedRoles: ['driver', 'admin'],
  },
  [OrderStatus.ASSIGNED_FOR_DELIVERY]: {
    allowedNextStatuses: [OrderStatus.OUT_FOR_DELIVERY, OrderStatus.CANCELLED],
    allowedRoles: ['driver', 'admin'],
  },
  [OrderStatus.OUT_FOR_DELIVERY]: {
    allowedNextStatuses: [OrderStatus.DELIVERED, OrderStatus.RETURNED, OrderStatus.COMPLETED],
    allowedRoles: ['driver', 'admin'],
  },
  [OrderStatus.DELIVERED]: {
    allowedNextStatuses: [OrderStatus.COMPLETED, OrderStatus.DISPUTED],
    allowedRoles: ['customer', 'driver', 'admin'],
  },
  [OrderStatus.COMPLETED]: {
    allowedNextStatuses: [OrderStatus.DISPUTED],
    allowedRoles: ['customer', 'admin'],
  },
  [OrderStatus.CANCELLED]: {
    allowedNextStatuses: [],
    allowedRoles: [],
  },
  [OrderStatus.REJECTED_AT_QUALITY_CHECK]: {
    allowedNextStatuses: [OrderStatus.REFUNDED, OrderStatus.CANCELLED],
    allowedRoles: ['admin'],
  },
  [OrderStatus.DISPUTED]: {
    allowedNextStatuses: [OrderStatus.COMPLETED, OrderStatus.REFUNDED],
    allowedRoles: ['admin'],
  },
  [OrderStatus.REFUNDED]: {
    allowedNextStatuses: [],
    allowedRoles: [],
  },
  [OrderStatus.RETURNED]: {
    allowedNextStatuses: [OrderStatus.REFUNDED, OrderStatus.CANCELLED],
    allowedRoles: ['admin'],
  },
};

/**
 * Validates if transitioning from currentStatus to nextStatus is allowed for the given stakeholder.
 */
export function validateOrderStatusTransition(
  currentStatus: OrderStatus,
  nextStatus: OrderStatus,
  stakeholder: OrderStakeholderInfo
): void {
  if (stakeholder.isAdmin) {
    return; // Admins have master override permissions
  }

  const rule = ORDER_TRANSITION_MAP[currentStatus];
  if (!rule) {
    throw new AppError(`Unknown current order status: ${currentStatus}`, 400);
  }

  if (!rule.allowedNextStatuses.includes(nextStatus)) {
    throw new AppError(
      `Illegal status transition from "${currentStatus}" to "${nextStatus}". Allowed next states: [${rule.allowedNextStatuses.join(', ')}]`,
      400
    );
  }

  const isRoleAllowed =
    (stakeholder.isCustomer && rule.allowedRoles.includes('customer')) ||
    (stakeholder.isFarmer && rule.allowedRoles.includes('farmer')) ||
    (stakeholder.isDriver && rule.allowedRoles.includes('driver')) ||
    (stakeholder.isAdmin && rule.allowedRoles.includes('admin'));

  if (!isRoleAllowed) {
    throw new AppError(
      `Your role is not authorized to transition order status from "${currentStatus}" to "${nextStatus}"`,
      403
    );
  }
}
