import React from 'react';
import { cn } from '@/lib/cn';
import { Check } from 'lucide-react';

export interface RoleSelectionCardProps {
  id: string;
  title: string;
  titleSi: string;
  description: string;
  icon: React.ReactNode;
  isSelected: boolean;
  onSelect: () => void;
  badgeText?: string;
  className?: string;
}

export const RoleSelectionCard: React.FC<RoleSelectionCardProps> = ({
  title,
  titleSi,
  description,
  icon,
  isSelected,
  onSelect,
  badgeText,
  className,
}) => {
  return (
    <div
      onClick={onSelect}
      className={cn(
        'relative p-6 rounded-2xl border-2 transition-all duration-200 cursor-pointer select-none flex flex-col justify-between gap-4',
        isSelected
          ? 'border-emerald-600 bg-emerald-50/50 dark:bg-emerald-950/20 shadow-md ring-2 ring-emerald-500/10'
          : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-emerald-300 dark:hover:border-emerald-800 shadow-2xs hover:shadow-sm',
        className
      )}
    >
      <div className="flex items-start justify-between">
        <div
          className={cn(
            'w-13 h-13 rounded-2xl flex items-center justify-center transition-colors',
            isSelected
              ? 'bg-emerald-600 text-white shadow-emerald-500/30 shadow-sm'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200'
          )}
        >
          {icon}
        </div>

        <div className="flex items-center gap-2">
          {badgeText && (
            <span className="text-[11px] font-semibold bg-emerald-100 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-200 px-2 py-0.5 rounded-md">
              {badgeText}
            </span>
          )}
          <div
            className={cn(
              'w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors',
              isSelected
                ? 'border-emerald-600 bg-emerald-600 text-white'
                : 'border-slate-300 dark:border-slate-700'
            )}
          >
            {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
          </div>
        </div>
      </div>

      <div className="space-y-1">
        <h3 className="font-bold text-slate-900 dark:text-slate-100 text-lg">
          {title} <span className="text-sm font-normal text-slate-400">({titleSi})</span>
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
          {description}
        </p>
      </div>
    </div>
  );
};
