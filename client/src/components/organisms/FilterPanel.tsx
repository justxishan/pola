import React from 'react';
import { cn } from '@/lib/cn';
import { DISTRICTS, PRODUCT_CATEGORIES } from '@pola/shared';
import { Filter, RotateCcw, ShieldCheck, Sparkles, MapPin, Check } from 'lucide-react';

export interface FilterState {
  category: string | null;
  district: string | null;
  province?: string | null;
  minPrice: number;
  maxPrice: number;
  isOrganicOnly: boolean;
  qualityGrade?: string | null;
  requiresColdChain?: boolean;
}

export interface FilterPanelProps {
  filters: FilterState;
  onFilterChange: (filters: FilterState) => void;
  onReset: () => void;
  className?: string;
}

export const FilterPanel: React.FC<FilterPanelProps> = ({
  filters,
  onFilterChange,
  onReset,
  className,
}) => {
  const allDistricts = React.useMemo(() => {
    return DISTRICTS ? [...DISTRICTS].sort() : [];
  }, []);

  return (
    <div
      className={cn(
        'glass-terminal p-6 rounded-3xl border border-white/10 shadow-2xl space-y-6',
        className
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-white/10">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-xl bg-emerald-400/20 text-emerald-300">
            <Filter className="w-4 h-4" />
          </div>
          <h4 className="font-extrabold text-sm text-white">
            Harvest Filters
          </h4>
        </div>
        <button
          onClick={onReset}
          className="text-xs text-slate-400 hover:text-emerald-300 flex items-center gap-1 font-bold cursor-pointer transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          Reset All
        </button>
      </div>

      {/* Origin District Select */}
      <div className="space-y-2">
        <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
          <MapPin className="w-3.5 h-3.5 text-emerald-400" />
          Origin Farming District
        </label>
        <select
          value={filters.district || ''}
          onChange={(e) =>
            onFilterChange({ ...filters, district: e.target.value || null })
          }
          className="w-full px-4 py-3 rounded-2xl bg-white/5 border border-white/15 text-xs font-bold text-white focus:outline-none focus:border-emerald-400"
        >
          <option value="" className="bg-slate-900 text-white">All 25 Sri Lankan Districts</option>
          {allDistricts.map((d) => (
            <option key={d} value={d} className="bg-slate-900 text-white">
              {d} District
            </option>
          ))}
        </select>
      </div>

      {/* Price Filter Slider */}
      <div className="space-y-2 pt-2 border-t border-white/10">
        <div className="flex justify-between items-center text-xs">
          <span className="font-bold text-slate-300">Max Asking Price</span>
          <span className="font-black text-emerald-400 font-mono">
            LKR {filters.maxPrice.toLocaleString()} / unit
          </span>
        </div>
        <input
          type="range"
          min={50}
          max={5000}
          step={50}
          value={filters.maxPrice}
          onChange={(e) =>
            onFilterChange({ ...filters, maxPrice: parseInt(e.target.value) || 5000 })
          }
          className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-400"
        />
      </div>

      {/* Quality Grade Filter Chips */}
      <div className="space-y-2 pt-2 border-t border-white/10">
        <label className="text-xs font-bold text-slate-300 block">
          Quality Classification
        </label>
        <div className="grid grid-cols-3 gap-2">
          {['Grade A', 'Grade B', 'Wholesale Grade'].map((grade) => {
            const isSelected = filters.qualityGrade === grade;
            return (
              <button
                key={grade}
                type="button"
                onClick={() =>
                  onFilterChange({
                    ...filters,
                    qualityGrade: isSelected ? null : grade,
                  })
                }
                className={cn(
                  'px-2.5 py-2 rounded-xl text-[11px] font-bold transition-all text-center cursor-pointer border',
                  isSelected
                    ? 'bg-emerald-400 text-slate-950 border-emerald-400 font-black shadow-md'
                    : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10'
                )}
              >
                {grade}
              </button>
            );
          })}
        </div>
      </div>

      {/* Organic Checkbox */}
      <div className="pt-2 border-t border-white/10">
        <div
          onClick={() =>
            onFilterChange({ ...filters, isOrganicOnly: !filters.isOrganicOnly })
          }
          className={cn(
            'p-3.5 rounded-2xl border transition-all flex items-center justify-between cursor-pointer',
            filters.isOrganicOnly
              ? 'bg-emerald-500/20 border-emerald-400 text-white'
              : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10'
          )}
        >
          <div className="flex items-center gap-2.5">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span className="text-xs font-bold">100% Certified Organic Only</span>
          </div>
          {filters.isOrganicOnly && <Check className="w-4 h-4 text-emerald-400" />}
        </div>
      </div>
    </div>
  );
};
