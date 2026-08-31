import React from 'react';
import { cn } from '@/lib/cn';
import { Badge } from '@/components/atoms/Badge';

export interface PricingTier {
  minQuantity: number;
  maxQuantity?: number;
  pricePerUnit: number;
  discountPercentage?: number;
}

export interface PricingTierTableProps {
  unit: string;
  basePrice: number;
  tiers: PricingTier[];
  selectedQuantity?: number;
  className?: string;
}

export const PricingTierTable: React.FC<PricingTierTableProps> = ({
  unit,
  basePrice,
  tiers,
  selectedQuantity,
  className,
}) => {
  return (
    <div
      className={cn(
        'rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden text-xs shadow-2xs',
        className
      )}
    >
      <div className="bg-slate-50 dark:bg-slate-800/80 px-4 py-2.5 font-semibold text-slate-700 dark:text-slate-200 flex justify-between items-center border-b border-slate-100 dark:border-slate-800">
        <span>Wholesale B2B Quantity Tiers</span>
        <Badge variant="sky" size="sm">
          Volume Discounts
        </Badge>
      </div>

      <div className="divide-y divide-slate-100 dark:divide-slate-800">
        {tiers.map((tier, idx) => {
          const isSelected =
            selectedQuantity !== undefined &&
            selectedQuantity >= tier.minQuantity &&
            (!tier.maxQuantity || selectedQuantity <= tier.maxQuantity);

          const discount =
            tier.discountPercentage ||
            Math.round(((basePrice - tier.pricePerUnit) / basePrice) * 100);

          return (
            <div
              key={idx}
              className={cn(
                'px-4 py-2.5 flex items-center justify-between transition-colors',
                isSelected
                  ? 'bg-emerald-50/60 dark:bg-emerald-950/30 font-semibold'
                  : 'hover:bg-slate-50/50 dark:hover:bg-slate-800/40'
              )}
            >
              <span className="text-slate-700 dark:text-slate-300">
                {tier.minQuantity} {tier.maxQuantity ? `- ${tier.maxQuantity}` : '+'} {unit}
              </span>

              <div className="flex items-center gap-3">
                {discount > 0 && (
                  <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold">
                    Save {discount}%
                  </span>
                )}
                <span className="font-bold text-slate-900 dark:text-slate-100">
                  LKR {tier.pricePerUnit.toLocaleString()}
                  <span className="text-slate-400 font-normal">/{unit}</span>
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
