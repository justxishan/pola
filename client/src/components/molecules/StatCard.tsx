import React from 'react';
import { cn } from '@/lib/cn';
import { TrendingUp, TrendingDown } from 'lucide-react';

export interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  trend?: {
    value: string;
    isPositive: boolean;
  };
  icon?: React.ReactNode;
  iconBgColor?: string;
  className?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  trend,
  icon,
  iconBgColor = 'bg-lime-400/20 text-lime-300 border border-lime-400/30',
  className,
}) => {
  return (
    <div
      className={cn(
        'glass-terminal p-6 rounded-3xl border border-white/15 shadow-xl hover:border-white/30 transition-all duration-300 relative overflow-hidden',
        className
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1.5">
          <p className="text-xs font-bold text-slate-300 uppercase tracking-wider">
            {title}
          </p>
          <h3 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            {value}
          </h3>
        </div>
        {icon && (
          <div className={cn('w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-md', iconBgColor)}>
            {icon}
          </div>
        )}
      </div>

      {(subtitle || trend) && (
        <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between gap-2 text-xs">
          {subtitle && <span className="text-slate-300 font-medium">{subtitle}</span>}
          {trend && (
            <span
              className={cn(
                'inline-flex items-center gap-1 font-extrabold px-2.5 py-0.5 rounded-full text-[11px]',
                trend.isPositive
                  ? 'text-lime-300 bg-lime-400/20 border border-lime-400/30'
                  : 'text-rose-300 bg-rose-500/20 border border-rose-400/30'
              )}
            >
              {trend.isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
              {trend.value}
            </span>
          )}
        </div>
      )}
    </div>
  );
};
