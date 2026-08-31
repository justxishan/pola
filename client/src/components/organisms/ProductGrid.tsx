import React from 'react';
import { cn } from '@/lib/cn';
import { ProductCard, ProductCardProps } from '@/components/molecules/ProductCard';
import { Skeleton } from '@/components/atoms/Skeleton';
import { EmptyState } from '@/components/molecules/EmptyState';

export interface ProductGridProps {
  products: ProductCardProps[];
  isLoading?: boolean;
  emptyTitle?: string;
  emptyDescription?: string;
  onClearFilters?: () => void;
  className?: string;
}

export const ProductGrid: React.FC<ProductGridProps> = ({
  products,
  isLoading = false,
  emptyTitle = 'No produce found',
  emptyDescription = 'Try clearing or modifying your filter criteria to discover more farm listings.',
  onClearFilters,
  className,
}) => {
  if (isLoading) {
    return (
      <div className={cn('grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6', className)}>
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-3 space-y-3"
          >
            <Skeleton variant="rectangular" className="aspect-4/3 w-full rounded-xl" />
            <Skeleton variant="text" className="w-2/3 h-4" />
            <Skeleton variant="text" className="w-1/2 h-3" />
            <div className="flex justify-between items-center pt-2">
              <Skeleton variant="text" className="w-1/3 h-5" />
              <Skeleton variant="circular" className="w-8 h-8" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!products || products.length === 0) {
    return (
      <EmptyState
        title={emptyTitle}
        description={emptyDescription}
        actionText={onClearFilters ? 'Reset Filters' : undefined}
        onAction={onClearFilters}
      />
    );
  }

  return (
    <div className={cn('grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6', className)}>
      {products.map((p) => (
        <ProductCard key={p.id} {...p} />
      ))}
    </div>
  );
};
