export enum QualityGrade {
  GRADE_A = 'grade_a', // Premium (100% price)
  GRADE_B = 'grade_b', // Standard (90% price)
  GRADE_C = 'grade_c', // Below Standard (75% price)
  REJECTED = 'rejected', // Rejected (0% price / returned/discarded)
}

export const GRADE_PRICE_MULTIPLIERS: Record<QualityGrade, number> = {
  [QualityGrade.GRADE_A]: 1.0,
  [QualityGrade.GRADE_B]: 0.9,
  [QualityGrade.GRADE_C]: 0.75,
  [QualityGrade.REJECTED]: 0.0,
};

export enum RejectionReason {
  SPOILED = 'spoiled',
  DAMAGED = 'damaged',
  WRONG_ITEM = 'wrong_item',
  CONTAMINATION = 'contamination',
  UNDER_WEIGHT = 'under_weight',
  BELOW_GRADE_C = 'below_grade_c',
  EXPIRED_IN_TRANSIT = 'expired_in_transit',
}

export enum RejectionDisposition {
  DISCARDED = 'discarded',
  RETURNED_TO_FARMER = 'returned_to_farmer',
  DONATED = 'donated',
}
