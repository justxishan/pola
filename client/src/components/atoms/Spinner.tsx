import React from 'react';
import { cn } from '@/lib/cn';

export interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'emerald' | 'sky' | 'white' | 'slate';
  className?: string;
}

export const Spinner: React.FC<SpinnerProps> = ({
  size = 'md',
  variant = 'emerald',
  className,
}) => {
  const sizeStyles = {
    sm: 'w-4 h-4 border-2',
    md: 'w-6 h-6 border-2.5',
    lg: 'w-8 h-8 border-3',
    xl: 'w-12 h-12 border-4',
  };

  const variantStyles = {
    emerald: 'border-emerald-600 border-t-transparent',
    sky: 'border-sky-600 border-t-transparent',
    white: 'border-white border-t-transparent',
    slate: 'border-slate-400 border-t-transparent',
  };

  return (
    <div
      className={cn(
        'rounded-full animate-spin',
        sizeStyles[size],
        variantStyles[variant],
        className
      )}
      role="status"
      aria-label="Loading"
    />
  );
};
