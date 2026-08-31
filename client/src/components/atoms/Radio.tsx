import React from 'react';
import { cn } from '@/lib/cn';

export interface RadioProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: React.ReactNode;
  description?: string;
}

export const Radio = React.forwardRef<HTMLInputElement, RadioProps>(
  ({ className, label, description, checked, id, disabled, ...props }, ref) => {
    const radioId = id || (typeof label === 'string' ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    return (
      <label
        htmlFor={radioId}
        className={cn(
          'flex items-start gap-3 cursor-pointer select-none group',
          disabled && 'cursor-not-allowed opacity-50'
        )}
      >
        <div className="relative flex items-center justify-center mt-0.5">
          <input
            id={radioId}
            ref={ref}
            type="radio"
            checked={checked}
            disabled={disabled}
            className="peer sr-only"
            {...props}
          />
          <div
            className={cn(
              'w-5 h-5 rounded-full border-1.5 transition-all duration-200 flex items-center justify-center',
              checked
                ? 'border-emerald-600 bg-white dark:bg-slate-900'
                : 'border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 group-hover:border-emerald-500'
            )}
          >
            {checked && <div className="w-2.5 h-2.5 rounded-full bg-emerald-600 animate-in zoom-in-50 duration-150" />}
          </div>
        </div>
        {(label || description) && (
          <div className="text-sm">
            {label && (
              <span className="font-medium text-slate-800 dark:text-slate-200 group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors">
                {label}
              </span>
            )}
            {description && (
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">{description}</p>
            )}
          </div>
        )}
      </label>
    );
  }
);

Radio.displayName = 'Radio';
