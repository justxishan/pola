import React from 'react';
import { cn } from '@/lib/cn';
import { Button } from '@/components/atoms/Button';
import { MapPin, ArrowRight, Clock, Truck } from 'lucide-react';

export interface DeliveryOpportunityCardProps {
  orderId: string;
  orderNumber: string;
  pickupLocation: string;
  deliveryLocation: string;
  distanceKm: number;
  payoutLkr: number;
  itemCount: number;
  totalWeightKg?: number;
  onAccept: () => void;
  isLoading?: boolean;
  className?: string;
}

export const DeliveryOpportunityCard: React.FC<DeliveryOpportunityCardProps> = ({
  orderNumber,
  pickupLocation,
  deliveryLocation,
  distanceKm,
  payoutLkr,
  itemCount,
  totalWeightKg,
  onAccept,
  isLoading,
  className,
}) => {
  return (
    <div
      className={cn(
        'p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs hover:shadow-lg transition-all duration-200 space-y-4 relative overflow-hidden',
        className
      )}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-sky-50 text-sky-600 dark:bg-sky-950/50 dark:text-sky-300 flex items-center justify-center">
            <Truck className="w-4 h-4" />
          </div>
          <span className="font-bold text-slate-900 dark:text-slate-100 text-sm">
            #{orderNumber}
          </span>
        </div>

        <div className="text-right">
          <span className="text-[11px] text-slate-400 block font-medium">Driver Payout</span>
          <span className="text-xl font-extrabold text-emerald-600 dark:text-emerald-400">
            LKR {payoutLkr.toLocaleString()}
          </span>
        </div>
      </div>

      <div className="space-y-3 py-1 text-xs">
        <div className="flex items-start gap-2.5">
          <div className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5 font-bold text-[10px]">
            A
          </div>
          <div className="space-y-0.5">
            <span className="text-slate-400 block text-[11px]">Pickup</span>
            <span className="font-semibold text-slate-800 dark:text-slate-200">{pickupLocation}</span>
          </div>
        </div>

        <div className="flex items-start gap-2.5">
          <div className="w-4 h-4 rounded-full bg-sky-100 text-sky-600 flex items-center justify-center shrink-0 mt-0.5 font-bold text-[10px]">
            B
          </div>
          <div className="space-y-0.5">
            <span className="text-slate-400 block text-[11px]">Delivery</span>
            <span className="font-semibold text-slate-800 dark:text-slate-200">{deliveryLocation}</span>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-500">
        <span className="flex items-center gap-1 font-medium">
          <MapPin className="w-3.5 h-3.5 text-slate-400" />
          {distanceKm} km
        </span>
        <span>
          {itemCount} items {totalWeightKg ? `(~${totalWeightKg} kg)` : ''}
        </span>
        <Button
          size="sm"
          variant="primary"
          onClick={onAccept}
          isLoading={isLoading}
          rightIcon={<ArrowRight className="w-4 h-4" />}
        >
          Accept Trip
        </Button>
      </div>
    </div>
  );
};
