import React from 'react';
import { cn } from '@/lib/cn';
import { Button, ButtonProps } from '@/components/atoms/Button';
import { PackageOpen } from 'lucide-react';

export interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  actionText?: string;
  onAction?: () => void;
  actionVariant?: ButtonProps['variant'];
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  actionText,
  onAction,
  actionVariant = 'primary',
  className,
}) => {
  return (
    <div
      className={cn(
        'p-10 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/40 flex flex-col items-center justify-center text-center space-y-4 max-w-lg mx-auto',
        className
      )}
    >
      <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-300 flex items-center justify-center">
        {icon || <PackageOpen className="w-8 h-8" />}
      </div>

      <div className="space-y-1">
        <h4 className="text-lg font-bold text-slate-900 dark:text-slate-100">{title}</h4>
        <p className="text-xs text-slate-400 dark:text-slate-500 max-w-sm">{description}</p>
      </div>

      {actionText && onAction && (
        <Button variant={actionVariant} size="sm" onClick={onAction}>
          {actionText}
        </Button>
      )}
    </div>
  );
};
