export enum UnitOfSale {
  KG = 'kg',
  G = 'g',
  LITRE = 'l',
  ML = 'ml',
  DOZEN = 'dozen',
  BUNDLE = 'bundle',
  PIECE = 'piece',
  BAG_25KG = 'bag_25kg',
  BAG_50KG = 'bag_50kg',
}

export const UNIT_LABELS: Record<UnitOfSale, string> = {
  [UnitOfSale.KG]: 'Kilogram (kg)',
  [UnitOfSale.G]: 'Gram (g)',
  [UnitOfSale.LITRE]: 'Litre (L)',
  [UnitOfSale.ML]: 'Millilitre (mL)',
  [UnitOfSale.DOZEN]: 'Dozen (12 pcs)',
  [UnitOfSale.BUNDLE]: 'Bundle (කැටිය / கட்டு)',
  [UnitOfSale.PIECE]: 'Piece / Unit',
  [UnitOfSale.BAG_25KG]: '25kg Sack',
  [UnitOfSale.BAG_50KG]: '50kg Sack',
};

export const STANDARD_UNITS = Object.values(UnitOfSale);

/**
 * Calculates item subtotal accounting for realistic unit bases:
 * - Grams (g): Price is per 100g -> subtotal = (quantity / 100) * unitPrice
 * - Millilitres (ml): Price is per 100ml -> subtotal = (quantity / 100) * unitPrice
 * - Others (kg, l, piece, dozen, bundle, bag_25kg, bag_50kg): subtotal = quantity * unitPrice
 */
export function calculateItemSubtotal(unitPrice: number, quantity: number, unit?: string): number {
  if (!unitPrice || unitPrice <= 0 || !quantity || quantity <= 0) return 0;
  const normalizedUnit = (unit || 'kg').toLowerCase();
  if (normalizedUnit === 'g' || normalizedUnit === 'ml') {
    return Math.round(((quantity / 100) * unitPrice) * 100) / 100;
  }
  return Math.round((quantity * unitPrice) * 100) / 100;
}

/**
 * Returns the human-readable unit pricing label (e.g. "/ 100g", "/ kg", "/ dozen")
 */
export function getPricingUnitLabel(unit?: string): string {
  const normalizedUnit = (unit || 'kg').toLowerCase();
  switch (normalizedUnit) {
    case 'g':
      return '/ 100g';
    case 'ml':
      return '/ 100ml';
    case 'kg':
      return '/ kg';
    case 'l':
    case 'litre':
      return '/ L';
    case 'dozen':
      return '/ dozen';
    case 'bundle':
      return '/ bundle';
    case 'piece':
      return '/ piece';
    case 'bag_25kg':
      return '/ 25kg bag';
    case 'bag_50kg':
      return '/ 50kg bag';
    default:
      return `/ ${unit || 'unit'}`;
  }
}

/**
 * Returns the input label for farmer crop listing price field
 */
export function getPricingUnitInputLabel(unit?: string): string {
  const normalizedUnit = (unit || 'kg').toLowerCase();
  switch (normalizedUnit) {
    case 'g':
      return 'Base Price (LKR per 100g)';
    case 'ml':
      return 'Base Price (LKR per 100ml)';
    case 'kg':
      return 'Base Price (LKR per kg)';
    case 'l':
    case 'litre':
      return 'Base Price (LKR per L)';
    case 'dozen':
      return 'Base Price (LKR per dozen)';
    case 'bundle':
      return 'Base Price (LKR per bundle)';
    case 'piece':
      return 'Base Price (LKR per piece)';
    case 'bag_25kg':
      return 'Base Price (LKR per 25kg sack)';
    case 'bag_50kg':
      return 'Base Price (LKR per 50kg sack)';
    default:
      return `Base Price (LKR / ${unit || 'unit'})`;
  }
}

