import React from 'react';
import { cn } from '@/lib/cn';

export interface AvatarProps {
  src?: string | null;
  alt?: string;
  name?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  isOnline?: boolean;
  className?: string;
}

export const Avatar: React.FC<AvatarProps> = ({
  src,
  alt,
  name,
  size = 'md',
  isOnline,
  className,
}) => {
  const [hasError, setHasError] = React.useState(false);

  const getInitials = (n?: string) => {
    if (!n) return 'P';
    const parts = n.trim().split(' ');
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return n.substring(0, 2).toUpperCase();
  };

  const sizeStyles = {
    xs: 'w-6 h-6 text-[10px]',
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm font-semibold',
    lg: 'w-14 h-14 text-base font-bold',
    xl: 'w-20 h-20 text-xl font-bold',
  };

  const dotSizes = {
    xs: 'w-1.5 h-1.5',
    sm: 'w-2 h-2',
    md: 'w-2.5 h-2.5',
    lg: 'w-3.5 h-3.5',
    xl: 'w-4.5 h-4.5',
  };

  return (
    <div className={cn('relative inline-flex shrink-0', className)}>
      <div
        className={cn(
          'rounded-full overflow-hidden flex items-center justify-center bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-200 border-1.5 border-white dark:border-slate-800 shadow-xs select-none',
          sizeStyles[size]
        )}
      >
        {src && !hasError ? (
          <img
            src={src}
            alt={alt || name || 'Avatar'}
            onError={() => setHasError(true)}
            className="w-full h-full object-cover"
          />
        ) : (
          <span>{getInitials(name)}</span>
        )}
      </div>
      {typeof isOnline === 'boolean' && (
        <span
          className={cn(
            'absolute bottom-0 right-0 rounded-full border-2 border-white dark:border-slate-900',
            dotSizes[size],
            isOnline ? 'bg-emerald-500' : 'bg-slate-400'
          )}
        />
      )}
    </div>
  );
};
