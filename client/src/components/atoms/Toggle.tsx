import React from 'react';
import { cn } from '@/lib/cn';

export interface ToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  description?: string;
  disabled?: boolean;
  size?: 'sm' | 'md';
  className?: string;
}

export const Toggle: React.FC<ToggleProps> = ({
  checked,
  onChange,
  label,
  description,
  disabled = false,
  size = 'md',
  className,
}) => {
  const sizeStyles = {
    sm: {
      track: 'w-8 h-4.5',
      thumb: 'w-3.5 h-3.5',
      translate: 'translate-x-3.5',
    },
    md: {
      track: 'w-11 h-6',
      thumb: 'w-5 h-5',
      translate: 'translate-x-5',
    },
  };

  return (
    <label
      className={cn(
        'flex items-center justify-between gap-4 select-none cursor-pointer',
        disabled && 'opacity-50 cursor-not-allowed',
        className
      )}
      onClick={() => !disabled && onChange(!checked)}
    >
      {(label || description) && (
        <div>
          {label && <p className="text-sm font-medium text-slate-800 dark:text-slate-200">{label}</p>}
          {description && <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">{description}</p>}
        </div>
      )}
      <div
        className={cn(
          'relative rounded-full transition-colors duration-200 p-0.5 shrink-0',
          sizeStyles[size].track,
          checked ? 'bg-emerald-600' : 'bg-slate-300 dark:bg-slate-700'
        )}
      >
        <div
          className={cn(
            'bg-white rounded-full shadow-xs transition-transform duration-200',
            sizeStyles[size].thumb,
            checked ? sizeStyles[size].translate : 'translate-x-0'
          )}
        />
      </div>
    </label>
  );
};
