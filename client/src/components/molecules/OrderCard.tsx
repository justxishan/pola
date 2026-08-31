import React from 'react';
import { cn } from '@/lib/cn';
import { StatusPill } from './StatusPill';
import { Button } from '@/components/atoms/Button';
import { Package, Calendar, ChevronRight } from 'lucide-react';

export interface OrderItemPreview {
  productTitle: string;
  quantity: number;
  unit: string;
}

export interface OrderCardProps {
  orderId: string;
  orderNumber: string;
  status: string;
  createdAt: string;
  totalAmountLkr: number;
  items: OrderItemPreview[];
  onViewDetails?: () => void;
  className?: string;
}

export const OrderCard: React.FC<OrderCardProps> = ({
  orderNumber,
  status,
  createdAt,
  totalAmountLkr,
  items,
  onViewDetails,
  className,
}) => {
  const formattedDate = new Date(createdAt).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <div
      className={cn(
        'p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs hover:shadow-md transition-all duration-200 space-y-4',
        className
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-900 dark:text-slate-100 text-sm">
              #{orderNumber}
            </span>
            <StatusPill status={status} size="sm" />
          </div>
          <p className="text-xs text-slate-400 flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5" />
            {formattedDate}
          </p>
        </div>

        <div className="text-right">
          <span className="text-xs text-slate-400 block">Total Amount</span>
          <span className="text-base font-bold text-emerald-600 dark:text-emerald-400">
            LKR {totalAmountLkr.toLocaleString()}
          </span>
        </div>
      </div>

      <div className="bg-slate-50 dark:bg-slate-800/60 p-3 rounded-xl space-y-1.5 text-xs text-slate-600 dark:text-slate-300">
        {items.slice(0, 3).map((item, idx) => (
          <div key={idx} className="flex items-center justify-between">
            <span className="flex items-center gap-1.5 truncate">
              <Package className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span className="truncate">{item.productTitle}</span>
            </span>
            <span className="font-medium shrink-0 ml-2">
              {item.quantity} {item.unit}
            </span>
          </div>
        ))}
        {items.length > 3 && (
          <p className="text-[11px] text-slate-400 text-right">
            +{items.length - 3} more items
          </p>
        )}
      </div>

      {onViewDetails && (
        <div className="flex justify-end pt-1">
          <Button
            variant="outline"
            size="sm"
            onClick={onViewDetails}
            rightIcon={<ChevronRight className="w-4 h-4" />}
          >
            Track & View Details
          </Button>
        </div>
      )}
    </div>
  );
};
