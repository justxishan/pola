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
    { key: OrderStatus.PLACED, label: 'Order Placed', desc: 'Received in system' },
    { key: OrderStatus.PAYMENT_CONFIRMED, label: 'Payment Held', desc: 'Funds in escrow' },
    { key: OrderStatus.AWAITING_HUB_COLLECTION, label: 'Farmer Packing', desc: 'Harvest & crate' },
    { key: OrderStatus.COLLECTED_AT_HUB, label: 'Hub Intake', desc: 'Grading inspection' },
    { key: OrderStatus.IN_TRANSIT_TO_DC, label: 'Leg 1 Transit', desc: 'Hub to DC transport' },
    { key: OrderStatus.RECEIVED_AT_DC, label: 'DC Sorted', desc: 'Consolidated at DC' },
    { key: OrderStatus.ASSIGNED_FOR_DELIVERY, label: 'Driver Assigned', desc: 'Leg 2 courier match' },
    { key: OrderStatus.OUT_FOR_DELIVERY, label: 'Out for Delivery', desc: 'On way to doorstep' },
    { key: OrderStatus.DELIVERED, label: 'Delivered', desc: 'OTP handover verified' },
    { key: OrderStatus.COMPLETED, label: 'Completed', desc: 'Escrow released' },
  ];

  const currentStageIndex = stages.findIndex((s) => s.key === currentStatus);
  const isCancelled =
    currentStatus === OrderStatus.CANCELLED ||
    currentStatus === OrderStatus.REJECTED_AT_QUALITY_CHECK ||
    currentStatus === OrderStatus.DISPUTED;

  return (
    <div className={cn('w-full space-y-6', className)}>
      {isCancelled && (
        <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-200 flex items-center gap-3 text-sm">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
          <div>
            <p className="font-bold capitalize">Order Status: {currentStatus.replace(/_/g, ' ')}</p>
            <p className="text-xs opacity-90">This order encountered an exception or cancellation.</p>
          </div>
        </div>
      )}

      {/* Desktop Stepper */}
      <div className="hidden lg:flex items-center justify-between relative">
        <div className="absolute top-4 left-4 right-4 h-0.5 bg-slate-200 dark:bg-slate-700 -z-0" />

        {stages.map((stage, idx) => {
          const isDone = currentStageIndex > idx;
          const isCurrent = currentStageIndex === idx;

          return (
            <div key={stage.key} className="flex flex-col items-center text-center relative z-10 w-24">
              <div
                className={cn(
                  'w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 border-2',
                  isDone
                    ? 'bg-emerald-600 border-emerald-600 text-white shadow-xs'
                    : isCurrent
                    ? 'bg-white dark:bg-slate-900 border-emerald-600 text-emerald-600 ring-4 ring-emerald-500/20'
                    : 'bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700 text-slate-400'
                )}
              >
                {isDone ? (
                  <Check className="w-4 h-4 stroke-[3]" />
                ) : isCurrent ? (
                  <Clock className="w-4 h-4 animate-spin text-emerald-600" />
                ) : (
                  <span>{idx + 1}</span>
                )}
              </div>

              <div className="mt-2 space-y-0.5">
                <p
                  className={cn(
                    'text-xs font-semibold',
                    isCurrent
                      ? 'text-emerald-600 dark:text-emerald-400'
                      : isDone
                      ? 'text-slate-800 dark:text-slate-200'
                      : 'text-slate-400'
                  )}
                >
                  {stage.label}
                </p>
                <p className="text-[10px] text-slate-400 leading-tight">{stage.desc}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Mobile Vertical Stepper */}
      <div className="lg:hidden space-y-4 relative pl-6 border-l-2 border-slate-200 dark:border-slate-700 ml-3">
        {stages.map((stage, idx) => {
          const isDone = currentStageIndex > idx;
          const isCurrent = currentStageIndex === idx;

          return (
            <div key={stage.key} className="relative">
              <div
                className={cn(
                  'absolute -left-9.25 top-0 w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold border-2 bg-white dark:bg-slate-900',
                  isDone
                    ? 'border-emerald-600 bg-emerald-600 text-white'
                    : isCurrent
                    ? 'border-emerald-600 text-emerald-600 ring-2 ring-emerald-500/20'
                    : 'border-slate-300 dark:border-slate-700 text-slate-400'
                )}
              >
                {isDone ? <Check className="w-3 h-3 stroke-[3]" /> : idx + 1}
              </div>

              <div className="space-y-0.5">
                <p
                  className={cn(
                    'text-xs font-semibold',
                    isCurrent ? 'text-emerald-600 font-bold' : isDone ? 'text-slate-800 dark:text-slate-200' : 'text-slate-400'
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
