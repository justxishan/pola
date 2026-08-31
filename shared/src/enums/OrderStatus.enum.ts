export enum OrderStatus {
  // 10-Stage Core Lifecycle
  PLACED = 'placed',
  PAYMENT_CONFIRMED = 'payment_confirmed',
  AWAITING_HUB_COLLECTION = 'awaiting_hub_collection',
  COLLECTED_AT_HUB = 'collected_at_hub',
  IN_TRANSIT_TO_DC = 'in_transit_to_dc',
  RECEIVED_AT_DC = 'received_at_dc',
  ASSIGNED_FOR_DELIVERY = 'assigned_for_delivery',
  OUT_FOR_DELIVERY = 'out_for_delivery',
  DELIVERED = 'delivered',
  COMPLETED = 'completed',

  // Exception / Branch States
  CANCELLED = 'cancelled',
  REJECTED_AT_QUALITY_CHECK = 'rejected_at_quality_check',
  DISPUTED = 'disputed',
  REFUNDED = 'refunded',
  RETURNED = 'returned',
}

export const ACTIVE_ORDER_STATUSES = [
  OrderStatus.PLACED,
  OrderStatus.PAYMENT_CONFIRMED,
  OrderStatus.AWAITING_HUB_COLLECTION,
  OrderStatus.COLLECTED_AT_HUB,
  OrderStatus.IN_TRANSIT_TO_DC,
  OrderStatus.RECEIVED_AT_DC,
  OrderStatus.ASSIGNED_FOR_DELIVERY,
  OrderStatus.OUT_FOR_DELIVERY,
  OrderStatus.DELIVERED,
];

export const TERMINAL_ORDER_STATUSES = [
  OrderStatus.COMPLETED,
  OrderStatus.CANCELLED,
  OrderStatus.REFUNDED,
  OrderStatus.RETURNED,
];
