import React from 'react';
import { cn } from '@/lib/cn';
import { Check } from 'lucide-react';

export interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: React.ReactNode;
  description?: string;
}

export const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, label, description, checked, id, disabled, ...props }, ref) => {
    const checkId = id || (typeof label === 'string' ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    return (
      <label
        htmlFor={checkId}
        className={cn(
          'flex items-start gap-3 cursor-pointer select-none group',
          disabled && 'cursor-not-allowed opacity-50'
        )}
      >
        <div className="relative flex items-center justify-center mt-0.5">
          <input
            id={checkId}
            ref={ref}
            type="checkbox"
            checked={checked}
            disabled={disabled}
            className="peer sr-only"
            {...props}
          />
          <div
            className={cn(
              'w-5 h-5 rounded-lg border-1.5 transition-all duration-200 flex items-center justify-center',
              checked
                ? 'bg-emerald-600 border-emerald-600 text-white shadow-xs'
                : 'border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 group-hover:border-emerald-500'
            )}
          >
            {checked && <Check className="w-3.5 h-3.5 stroke-[2.5]" />}
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

Checkbox.displayName = 'Checkbox';
