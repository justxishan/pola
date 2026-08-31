import React from 'react';
import { cn } from '@/lib/cn';
import { PRODUCT_CATEGORIES, ProductCategory } from '@pola/shared';
import { Apple, Carrot, Wheat, Flame, Milk, Sparkles, Sprout, LayoutGrid } from 'lucide-react';

export interface CategoryRibbonProps {
  selectedCategory: string | null;
  onSelectCategory: (category: string | null) => void;
  className?: string;
}

export const CategoryRibbon: React.FC<CategoryRibbonProps> = ({
  selectedCategory,
  onSelectCategory,
  className,
}) => {
  const getCategoryIcon = (id: ProductCategory) => {
    switch (id) {
      case ProductCategory.VEGETABLE:
        return <Carrot className="w-4 h-4 text-emerald-400" />;
      case ProductCategory.FRUIT:
        return <Apple className="w-4 h-4 text-rose-400" />;
      case ProductCategory.GRAIN_PULSE:
        return <Wheat className="w-4 h-4 text-amber-400" />;
      case ProductCategory.SPICE_HERB:
        return <Flame className="w-4 h-4 text-orange-400" />;
      case ProductCategory.DAIRY_EGG:
        return <Milk className="w-4 h-4 text-sky-400" />;
      case ProductCategory.TUBER_ROOT:
      case ProductCategory.COCONUT_PLANTATION:
        return <Sprout className="w-4 h-4 text-lime-400" />;
      default:
        return <Sparkles className="w-4 h-4 text-emerald-400" />;
    }
  };

  const categories = Object.values(PRODUCT_CATEGORIES);

  return (
    <div className={cn('w-full overflow-x-auto no-scrollbar py-2', className)}>
      <div className="flex items-center gap-2.5 min-w-max px-1">
        <button
          type="button"
          onClick={() => onSelectCategory(null)}
          className={cn(
            'inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-black transition-all duration-300 cursor-pointer shadow-lg',
            selectedCategory === null
              ? 'bg-emerald-400 text-slate-950 shadow-emerald-500/25 scale-105'
              : 'bg-white/5 hover:bg-white/15 border border-white/10 text-slate-300 hover:text-white'
          )}
        >
          <LayoutGrid className="w-4 h-4" />
          <span>All Harvest</span>
        </button>

        {categories.map((cat) => {
          const isSelected = selectedCategory === cat.id;
          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => onSelectCategory(cat.id)}
              className={cn(
                'inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-bold transition-all duration-300 cursor-pointer shadow-md',
                isSelected
                  ? 'bg-emerald-400 text-slate-950 shadow-emerald-500/25 font-black scale-105'
                  : 'bg-white/5 hover:bg-white/15 border border-white/10 text-slate-300 hover:text-white'
              )}
            >
              {getCategoryIcon(cat.id)}
              <span>{cat.displayNameEn}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
