import { Role, ADMIN_ROLES, DELIVERY_ROLES, FARMER_ROLES, CUSTOMER_ROLES } from '@pola/shared';

export interface NotificationLike {
  type?: string;
  portal?: 'customer' | 'farmer' | 'delivery' | 'admin';
  destinationKey?: string;
  relatedId?: string;
  linkUrl?: string;
}

/**
 * Returns the default home dashboard path for a given user role.
 */
export function getDashboardPathForRole(role?: string): string {
  if (!role) return '/';
  if (FARMER_ROLES.includes(role as Role) || role.startsWith('farmer') || role.startsWith('collector')) {
    return '/farmer/dashboard';
  }
  if (DELIVERY_ROLES.includes(role as Role) || role.startsWith('delivery')) {
    return '/delivery/dashboard';
  }
  if (ADMIN_ROLES.includes(role as Role) || role.startsWith('admin')) {
    return '/admin/dashboard';
  }
  return '/customer/orders';
}

/**
 * Resolves a notification to its appropriate client route based on its semantic destination key,
 * type, linkUrl, and the user's currently active portal role.
 */
export function resolveNotificationPath(notification: NotificationLike, userRole?: string): string {
  const currentRole = userRole || '';
  const isFarmer = FARMER_ROLES.includes(currentRole as Role) || currentRole.startsWith('farmer') || currentRole.startsWith('collector');
  const isDelivery = DELIVERY_ROLES.includes(currentRole as Role) || currentRole.startsWith('delivery');
  const isAdmin = ADMIN_ROLES.includes(currentRole as Role) || currentRole.startsWith('admin');
  const isCustomer = !isFarmer && !isDelivery && !isAdmin;

  // 1. Direct Chat Thread / Message Notifications
  if (notification.type === 'message' || notification.destinationKey === 'CHAT_THREAD') {
    if (isFarmer) {
      return notification.relatedId ? `/farmer/messages?orderId=${notification.relatedId}` : '/farmer/messages';
    }
    if (isDelivery) {
      return '/delivery/active-trip';
    }
    if (isAdmin) {
      return '/admin/orders';
    }
    // Customer route specified in 08/09 specs
    return notification.relatedId ? `/messages?orderId=${notification.relatedId}` : '/messages';
  }

  // 2. Semantic Destination Keys
  if (notification.destinationKey) {
    switch (notification.destinationKey) {
      case 'ORDER_DETAIL':
        if (isFarmer) return '/farmer/orders';
        if (isDelivery) return '/delivery/active-trip';
        if (isAdmin) return '/admin/orders';
        return notification.relatedId ? `/orders/${notification.relatedId}/track` : '/customer/orders';

      case 'FARMER_ORDERS':
        return '/farmer/orders';

      case 'AVAILABLE_TRIPS':
        return '/delivery/available';

      case 'ACTIVE_TRIP':
        return '/delivery/active-trip';

      case 'WALLET':
        if (isDelivery) return '/delivery/earnings';
        return '/wallet';

      case 'KYC':
        if (isAdmin) return '/admin/kyc';
        return '/auth/kyc';

      case 'DISPUTES':
        if (isAdmin) return '/admin/disputes';
        return '/customer/orders';

      case 'PORTAL_HOME':
        return getDashboardPathForRole(currentRole);

      case 'CHAT_THREAD':
        if (isFarmer) return notification.relatedId ? `/farmer/messages?orderId=${notification.relatedId}` : '/farmer/messages';
        if (isDelivery) return '/delivery/active-trip';
        if (isAdmin) return '/admin/orders';
        return notification.relatedId ? `/messages?orderId=${notification.relatedId}` : '/messages';

      default:
        break;
    }
  }

  // 3. Fallback: If linkUrl matches the user's role/portal, use it
  if (notification.linkUrl) {
    const url = notification.linkUrl;
    if (url.startsWith('/farmer') && !isFarmer) {
      return getDashboardPathForRole(currentRole);
    }
    if (url.startsWith('/delivery') && !isDelivery) {
      return getDashboardPathForRole(currentRole);
    }
    if (url.startsWith('/admin') && !isAdmin) {
      return getDashboardPathForRole(currentRole);
    }
    if (url.startsWith('/orders') && !isCustomer) {
      if (isFarmer) return '/farmer/orders';
      if (isDelivery) return '/delivery/active-trip';
      if (isAdmin) return '/admin/orders';
    }
    return url;
  }

  return getDashboardPathForRole(currentRole);
}
