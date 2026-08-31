export const DEFAULT_PLATFORM_COMMISSION_PERCENT = 5; // 5% platform fee
export const DEFAULT_COLLECTOR_COMMISSION_PERCENT = 3; // 3% collector fee
export const MIN_WITHDRAWAL_AMOUNT_LKR = 500; // Minimum LKR 500 for withdrawal
export const LKR_TO_USD_RATE = 0.0033; // ~ 1 USD = 300 LKR for PayPal payments

export const LEG1_FLAT_FEE_LKR = 150; // Leg 1 pickup base fee
export const LEG1_PER_KG_LKR = 5; // Leg 1 per-kg rate

export const LEG2_BASE_FEE_LKR = 250; // Leg 2 delivery base fee
export const LEG2_PER_KM_LKR = 40; // Leg 2 per-km rate
export const LEG2_PER_KG_LKR = 10; // Leg 2 weight fee

export const QUALITY_GRADE_MULTIPLIERS = {
  grade_a: 1.0,
  grade_b: 0.9,
  grade_c: 0.75,
  rejected: 0.0,
};

export const OTP_EXPIRY_MINUTES = 10;
