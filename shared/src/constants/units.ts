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
