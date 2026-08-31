import { QualityGrade } from '@pola/shared';
import { QUALITY_GRADE_MULTIPLIERS } from '../utils/constants.js';

export class GradingService {
  /**
   * Get price multiplier for assigned quality grade
   */
  static getGradeMultiplier(grade: QualityGrade): number {
    return QUALITY_GRADE_MULTIPLIERS[grade] !== undefined
      ? QUALITY_GRADE_MULTIPLIERS[grade]
      : 1.0;
  }

  /**
   * Calculate adjusted price based on inspected grade
   */
  static calculateAdjustedPrice(
    basePrice: number,
    assignedGrade: QualityGrade
  ): { finalPrice: number; multiplier: number } {
    const multiplier = this.getGradeMultiplier(assignedGrade);
    const finalPrice = Math.round(basePrice * multiplier * 100) / 100;
    return { finalPrice, multiplier };
  }

  /**
   * Calculate weight variance percentage: ((listed - actual) / listed) * 100
   */
  static calculateWeightVariance(
    listedQuantity: number,
    actualQuantity: number
  ): { variancePercent: number; isShortfall: boolean; isSignificant: boolean } {
    if (listedQuantity <= 0) {
      return { variancePercent: 0, isShortfall: false, isSignificant: false };
    }

    const difference = listedQuantity - actualQuantity;
    const variancePercent = Math.round((difference / listedQuantity) * 100 * 10) / 10;
    const isShortfall = difference > 0;
    const isSignificant = Math.abs(variancePercent) > 5; // Greater than 5% tolerance

    return {
      variancePercent,
      isShortfall,
      isSignificant,
    };
  }
}
