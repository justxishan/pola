import { IOrder } from '../models/Order.model.js';
import { Role, ADMIN_ROLES } from '@pola/shared';
import { AppError } from '../middleware/error.middleware.js';

export interface OrderStakeholderInfo {
  isStakeholder: boolean;
  isCustomer: boolean;
  isFarmer: boolean;
  isDriver: boolean;
  isAdmin: boolean;
}

/**
 * Check if the given user is an authorized stakeholder on the order.
 */
export function getOrderStakeholderInfo(
  order: any,
  userId: string,
  userRole?: string
): OrderStakeholderInfo {
  const normalizedUserId = userId.toString();

  const customerId = order.customerId?._id
    ? order.customerId._id.toString()
    : order.customerId?.toString();
  const isCustomer = customerId === normalizedUserId;

  const isFarmer = Array.isArray(order.items)
    ? order.items.some((item: any) => {
        const farmerId = item.farmerId?._id
          ? item.farmerId._id.toString()
          : item.farmerId?.toString();
        return farmerId === normalizedUserId;
      })
    : false;

  const leg1DriverId = order.leg1DriverId?._id
    ? order.leg1DriverId._id.toString()
    : order.leg1DriverId?.toString();
  const leg2DriverId = order.leg2DriverId?._id
    ? order.leg2DriverId._id.toString()
    : order.leg2DriverId?.toString();
  const isDriver = leg1DriverId === normalizedUserId || leg2DriverId === normalizedUserId;

  const isAdmin = !!userRole && (
    ADMIN_ROLES.includes(userRole as Role) ||
    userRole.startsWith('admin')
  );

  const isStakeholder = isCustomer || isFarmer || isDriver || isAdmin;

  return {
    isStakeholder,
    isCustomer,
    isFarmer,
    isDriver,
    isAdmin,
  };
}

/**
 * Asserts that the caller is an authorized stakeholder on the order. Throws 403 otherwise.
 */
export function assertOrderStakeholder(
  order: any,
  userId: string,
  userRole?: string,
  customMessage?: string
): OrderStakeholderInfo {
  const info = getOrderStakeholderInfo(order, userId, userRole);
  if (!info.isStakeholder) {
    throw new AppError(customMessage || 'Unauthorized: You do not have permission to view or manage this order', 403);
  }
  return info;
}

/**
 * Sanitize sensitive fields (such as 6-digit delivery handover OTP)
 * so only the buying customer who placed the order and superadmins can see it.
 */
export function sanitizeOrderForRole(order: any, userId: string, userRole?: string): any {
  const plainOrder = order.toObject ? order.toObject() : { ...order };
  const { isCustomer, isAdmin } = getOrderStakeholderInfo(plainOrder, userId, userRole);

  // If not customer or admin, strip handoverOtp
  if (!isCustomer && !isAdmin) {
    delete plainOrder.handoverOtp;
  }

  return plainOrder;
}
