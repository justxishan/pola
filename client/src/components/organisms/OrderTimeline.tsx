import React from 'react';
import { cn } from '@/lib/cn';
import { OrderStatus } from '@pola/shared';
import { Check, Clock, AlertCircle } from 'lucide-react';

export interface OrderTimelineProps {
  currentStatus: OrderStatus | string;
  timelineEvents?: {
    status: string;
    timestamp: string;
    note?: string;
  }[];
  className?: string;
}

export const OrderTimeline: React.FC<OrderTimelineProps> = ({
  currentStatus,
  timelineEvents = [],
  className,
}) => {
  const stages = [
    {
      id: 'placed',
      label: 'Order Placed',
      desc: 'Escrow payment secured',
      statuses: [OrderStatus.PLACED, OrderStatus.PAYMENT_CONFIRMED, 'placed', 'payment_confirmed'],
    },
    {
      id: 'preparing',
      label: 'Farmer & Hub Prep',
      desc: 'Harvested & quality graded',
      statuses: [
        OrderStatus.AWAITING_HUB_COLLECTION,
        OrderStatus.COLLECTED_AT_HUB,
        OrderStatus.IN_TRANSIT_TO_DC,
        OrderStatus.RECEIVED_AT_DC,
        'awaiting_hub_collection',
        'collected_at_hub',
        'in_transit_to_dc',
        'received_at_dc',
      ],
    },
    {
      id: 'out_for_delivery',
      label: 'Out for Delivery',
      desc: 'Courier en route with OTP',
      statuses: [
        OrderStatus.ASSIGNED_FOR_DELIVERY,
        OrderStatus.OUT_FOR_DELIVERY,
        'assigned_for_delivery',
        'out_for_delivery',
      ],
    },
    {
      id: 'delivered',
      label: 'Delivered',
      desc: 'Handover verified & completed',
      statuses: [OrderStatus.DELIVERED, OrderStatus.COMPLETED, 'delivered', 'completed'],
    },
  ];

  const getStageIndex = (status: string) => {
    for (let i = stages.length - 1; i >= 0; i--) {
      if (stages[i].statuses.includes(status as any)) {
        return i;
      }
    }
    return 0;
  };

  const isCancelled =
    currentStatus === OrderStatus.CANCELLED ||
    currentStatus === OrderStatus.REJECTED_AT_QUALITY_CHECK ||
    currentStatus === OrderStatus.DISPUTED ||
    currentStatus === 'cancelled' ||
    currentStatus === 'refunded' ||
    currentStatus === 'returned';

  const currentStageIndex = isCancelled ? -1 : getStageIndex(currentStatus);

  return (
    <div className={cn('w-full space-y-6', className)}>
      {isCancelled && (
        <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-200 flex items-center gap-3 text-sm">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
          <div>
            <p className="font-bold capitalize">Order Status: {String(currentStatus).replace(/_/g, ' ')}</p>
            <p className="text-xs opacity-90">This purchase order was cancelled or returned. Escrow funds have been refunded.</p>
          </div>
        </div>
      )}

      {/* Desktop Stepper */}
      <div className="hidden sm:flex items-center justify-between relative px-4">
        <div className="absolute top-5 left-12 right-12 h-1 bg-slate-200 dark:bg-slate-700 -z-0" />

        {stages.map((stage, idx) => {
          const isDone = !isCancelled && currentStageIndex > idx;
          const isCurrent = !isCancelled && currentStageIndex === idx;

          return (
            <div key={stage.id} className="flex flex-col items-center text-center relative z-10 w-36">
              <div
                className={cn(
                  'w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 border-2',
                  isDone
                    ? 'bg-emerald-600 border-emerald-600 text-white shadow-md'
                    : isCurrent
                    ? 'bg-white dark:bg-slate-900 border-emerald-600 text-emerald-600 ring-4 ring-emerald-500/20 shadow-md'
                    : 'bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700 text-slate-400'
                )}
              >
                {isDone ? (
                  <Check className="w-5 h-5 stroke-[3]" />
                ) : isCurrent ? (
                  <Clock className="w-5 h-5 animate-spin text-emerald-600" />
                ) : (
                  <span>{idx + 1}</span>
                )}
              </div>

              <div className="mt-2.5 space-y-0.5">
                <p
                  className={cn(
                    'text-xs font-bold',
                    isCurrent
                      ? 'text-emerald-600 dark:text-emerald-400'
                      : isDone
                      ? 'text-slate-800 dark:text-slate-200'
                      : 'text-slate-400'
                  )}
                >
                  {stage.label}
                </p>
                <p className="text-[11px] text-slate-400 leading-tight">{stage.desc}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Mobile Vertical Stepper */}
      <div className="sm:hidden space-y-5 relative pl-7 border-l-2 border-slate-200 dark:border-slate-700 ml-3">
        {stages.map((stage, idx) => {
          const isDone = !isCancelled && currentStageIndex > idx;
          const isCurrent = !isCancelled && currentStageIndex === idx;

          return (
            <div key={stage.id} className="relative">
              <div
                className={cn(
                  'absolute -left-10.5 top-0 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border-2 bg-white dark:bg-slate-900',
                  isDone
                    ? 'border-emerald-600 bg-emerald-600 text-white'
                    : isCurrent
                    ? 'border-emerald-600 text-emerald-600 ring-2 ring-emerald-500/20'
                    : 'border-slate-300 dark:border-slate-700 text-slate-400'
                )}
              >
                {isDone ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : idx + 1}
              </div>

              <div className="space-y-0.5">
                <p
                  className={cn(
                    'text-xs font-bold',
                    isCurrent ? 'text-emerald-600' : isDone ? 'text-slate-800 dark:text-slate-200' : 'text-slate-400'
                  )}
                >
                  {stage.label}
                </p>
                <p className="text-[11px] text-slate-400">{stage.desc}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
