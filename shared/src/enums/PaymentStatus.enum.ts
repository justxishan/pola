export enum PaymentStatus {
  PENDING = 'pending',
  HELD_IN_ESCROW = 'held_in_escrow',
  RELEASED = 'released',
  REFUNDED = 'refunded',
  PARTIALLY_REFUNDED = 'partially_refunded',
}

export enum PaymentMethod {
  PAYPAL = 'paypal',
  POLA_WALLET = 'pola_wallet',
  CASH_ON_DELIVERY = 'cash_on_delivery',
}
