export enum TransactionType {
  TOP_UP = 'top_up',
  ORDER_PAYMENT = 'order_payment',
  SALE_PROCEEDS = 'sale_proceeds',
  COLLECTOR_COMMISSION = 'collector_commission',
  TRIP_PAYOUT = 'trip_payout',
  REFUND = 'refund',
  WITHDRAWAL = 'withdrawal',
  ADMIN_ADJUSTMENT = 'admin_adjustment',
}

export enum WithdrawalStatus {
  REQUESTED = 'requested',
  PROCESSING = 'processing',
  PROCESSED = 'processed',
  REJECTED = 'rejected',
}
