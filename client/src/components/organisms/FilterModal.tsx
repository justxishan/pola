import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { cn } from '@/lib/cn';
import { DISTRICTS, PRODUCT_CATEGORIES } from '@pola/shared';
import { useTranslation } from '@/lib/i18n';
import {
  X,
  SlidersHorizontal,
  RotateCcw,
  Check,
  Star,
  ShieldCheck,
  Snowflake,
  Sparkles,
  ArrowUpDown,
} from 'lucide-react';

export interface FilterState {
  category: string | null;
  district: string | null;
  minPrice?: number;
  maxPrice?: number;
  priceRangePreset?: 'under_500' | '500_1000' | '1000_2500' | 'above_2500' | 'custom' | null;
  minRating?: number | null;
  sortBy?: string;
  isOrganicOnly?: boolean;
  qualityGrade?: string | null;
  requiresColdChain?: boolean;
}

export interface FilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  filters: FilterState;
  onApply: (filters: FilterState) => void;
  onReset?: () => void;
  resultCount?: number;
}

export const FilterModal: React.FC<FilterModalProps> = ({
  isOpen,
  onClose,
  filters,
  onApply,
  onReset,
  resultCount,
}) => {
  const { t } = useTranslation();
  const [draft, setDraft] = useState<FilterState>(filters);

  const allDistricts = React.useMemo(() => {
    return DISTRICTS ? [...DISTRICTS].sort() : [];
  }, []);

  const categories = React.useMemo(() => {
    return PRODUCT_CATEGORIES || [
      'Vegetables',
      'Fruits',
      'Grains & Pulses',
      'Spices & Herbs',
      'Dairy & Eggs',
      'Tubers & Roots',
      'Coconut & Plantation',
      'Other Agro Products',
    ];
  }, []);

  useEffect(() => {
    if (isOpen) {
      setDraft(filters);
    }
  }, [isOpen, filters]);

  // Handle escape key
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || typeof document === 'undefined') return null;

  const handlePricePreset = (preset: 'under_500' | '500_1000' | '1000_2500' | 'above_2500' | 'custom') => {
    if (preset === 'under_500') {
      setDraft((prev) => ({ ...prev, minPrice: 0, maxPrice: 500, priceRangePreset: 'under_500' }));
    } else if (preset === '500_1000') {
      setDraft((prev) => ({ ...prev, minPrice: 500, maxPrice: 1000, priceRangePreset: '500_1000' }));
    } else if (preset === '1000_2500') {
      setDraft((prev) => ({ ...prev, minPrice: 1000, maxPrice: 2500, priceRangePreset: '1000_2500' }));
    } else if (preset === 'above_2500') {
      setDraft((prev) => ({ ...prev, minPrice: 2500, maxPrice: 15000, priceRangePreset: 'above_2500' }));
    } else if (preset === 'custom') {
      setDraft((prev) => ({
        ...prev,
        priceRangePreset: 'custom',
        minPrice: prev.minPrice ?? 50,
        maxPrice: prev.maxPrice ?? 5000,
      }));
    }
  };

  const handleClearAll = () => {
    const emptyFilters: FilterState = {
      category: null,
      district: null,
      minPrice: undefined,
      maxPrice: undefined,
      priceRangePreset: null,
      minRating: null,
      sortBy: 'featured',
      isOrganicOnly: false,
      qualityGrade: null,
      requiresColdChain: false,
    };
    setDraft(emptyFilters);
    if (onReset) onReset();
  };

  const handleApply = () => {
    onApply(draft);
    onClose();
  };

  const content = (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="filter-modal-title"
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/70 dark:bg-black/80 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal Dialog Card */}
      <div
        className="relative w-full max-w-5xl max-h-[90vh] flex flex-col rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
              <SlidersHorizontal className="w-4 h-4" />
            </div>
            <div>
              <h3 id="filter-modal-title" className="text-base font-black tracking-tight">
                Produce & Harvest Filters
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Narrow down farm-fresh lots across categories, districts, grades, and prices
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors cursor-pointer"
            aria-label="Close filters"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Columns Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* 5-Column Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6 text-xs">
            {/* Column 1: Category */}
            <div className="space-y-3">
              <span className="font-mono text-[11px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500">
                Category
              </span>
              <div className="space-y-1 max-h-60 overflow-y-auto pr-1">
                <button
                  type="button"
                  onClick={() => setDraft((prev) => ({ ...prev, category: null }))}
                  className={cn(
                    'w-full text-left px-3 py-2 rounded-xl transition-all font-medium flex items-center justify-between cursor-pointer',
                    !draft.category
                      ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 font-bold'
                      : 'hover:bg-slate-100 dark:hover:bg-slate-800/60 text-slate-700 dark:text-slate-300'
                  )}
                >
                  <span>All Categories</span>
                  {!draft.category && <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />}
                </button>
                {categories.map((cat) => {
                  const isSelected = draft.category === cat;
                  return (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setDraft((prev) => ({ ...prev, category: isSelected ? null : cat }))}
                      className={cn(
                        'w-full text-left px-3 py-2 rounded-xl transition-all font-medium flex items-center justify-between cursor-pointer',
                        isSelected
                          ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 font-bold'
                          : 'hover:bg-slate-100 dark:hover:bg-slate-800/60 text-slate-700 dark:text-slate-300'
                      )}
                    >
                      <span className="truncate">{cat}</span>
                      {isSelected && <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Column 2: District */}
            <div className="space-y-3">
              <span className="font-mono text-[11px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500">
                District
              </span>
              <div className="space-y-1 max-h-60 overflow-y-auto pr-1">
                <button
                  type="button"
                  onClick={() => setDraft((prev) => ({ ...prev, district: null }))}
                  className={cn(
                    'w-full text-left px-3 py-2 rounded-xl transition-all font-medium flex items-center justify-between cursor-pointer',
                    !draft.district
                      ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 font-bold'
                      : 'hover:bg-slate-100 dark:hover:bg-slate-800/60 text-slate-700 dark:text-slate-300'
                  )}
                >
                  <span>All 25 Districts</span>
                  {!draft.district && <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />}
                </button>
                {allDistricts.map((d) => {
                  const isSelected = draft.district === d;
                  return (
                    <button
                      key={d}
                      type="button"
                      onClick={() => setDraft((prev) => ({ ...prev, district: isSelected ? null : d }))}
                      className={cn(
                        'w-full text-left px-3 py-2 rounded-xl transition-all font-medium flex items-center justify-between cursor-pointer',
                        isSelected
                          ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 font-bold'
                          : 'hover:bg-slate-100 dark:hover:bg-slate-800/60 text-slate-700 dark:text-slate-300'
                      )}
                    >
                      <span className="truncate">{d}</span>
                      {isSelected && <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Column 3: Rating */}
            <div className="space-y-3">
              <span className="font-mono text-[11px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500">
                Farmer Rating
              </span>
              <div className="space-y-1">
                <button
                  type="button"
                  onClick={() => setDraft((prev) => ({ ...prev, minRating: null }))}
                  className={cn(
                    'w-full text-left px-3 py-2 rounded-xl transition-all font-medium flex items-center justify-between cursor-pointer',
                    !draft.minRating
                      ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 font-bold'
                      : 'hover:bg-slate-100 dark:hover:bg-slate-800/60 text-slate-700 dark:text-slate-300'
                  )}
                >
                  <span>Any Rating</span>
                  {!draft.minRating && <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />}
                </button>
                <button
                  type="button"
                  onClick={() => setDraft((prev) => ({ ...prev, minRating: 4.0 }))}
                  className={cn(
                    'w-full text-left px-3 py-2 rounded-xl transition-all font-medium flex items-center justify-between cursor-pointer',
                    draft.minRating === 4.0
                      ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 font-bold'
                      : 'hover:bg-slate-100 dark:hover:bg-slate-800/60 text-slate-700 dark:text-slate-300'
                  )}
                >
                  <span className="flex items-center gap-1.5">
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    4.0★ & up
                  </span>
                  {draft.minRating === 4.0 && <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />}
                </button>
                <button
                  type="button"
                  onClick={() => setDraft((prev) => ({ ...prev, minRating: 4.5 }))}
                  className={cn(
                    'w-full text-left px-3 py-2 rounded-xl transition-all font-medium flex items-center justify-between cursor-pointer',
                    draft.minRating === 4.5
                      ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 font-bold'
                      : 'hover:bg-slate-100 dark:hover:bg-slate-800/60 text-slate-700 dark:text-slate-300'
                  )}
                >
                  <span className="flex items-center gap-1.5">
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    4.5★ & up
                  </span>
                  {draft.minRating === 4.5 && <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />}
                </button>
              </div>
            </div>

            {/* Column 4: Price */}
            <div className="space-y-3">
              <span className="font-mono text-[11px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500">
                Price (LKR)
              </span>
              <div className="space-y-1">
                {[
                  { id: 'all', label: 'Any Price', min: undefined, max: undefined },
                  { id: 'under_500', label: 'Under LKR 500', min: 0, max: 500 },
                  { id: '500_1000', label: 'LKR 500–1,000', min: 500, max: 1000 },
                  { id: '1000_2500', label: 'LKR 1,000–2,500', min: 1000, max: 2500 },
                  { id: 'above_2500', label: 'LKR 2,500+', min: 2500, max: 15000 },
                ].map((preset) => {
                  const isSelected =
                    preset.id === 'all'
                      ? draft.minPrice === undefined && draft.maxPrice === undefined && draft.priceRangePreset !== 'custom'
                      : draft.priceRangePreset === preset.id ||
                        (draft.minPrice === preset.min && draft.maxPrice === preset.max);

                  return (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => {
                        if (preset.id === 'all') {
                          setDraft((prev) => ({ ...prev, minPrice: undefined, maxPrice: undefined, priceRangePreset: null }));
                        } else {
                          handlePricePreset(preset.id as any);
                        }
                      }}
                      className={cn(
                        'w-full text-left px-3 py-2 rounded-xl transition-all font-medium flex items-center justify-between cursor-pointer',
                        isSelected
                          ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 font-bold'
                          : 'hover:bg-slate-100 dark:hover:bg-slate-800/60 text-slate-700 dark:text-slate-300'
                      )}
                    >
                      <span>{preset.label}</span>
                      {isSelected && <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />}
                    </button>
                  );
                })}

                <button
                  type="button"
                  onClick={() => handlePricePreset('custom')}
                  className={cn(
                    'w-full text-left px-3 py-2 rounded-xl transition-all font-medium flex items-center justify-between cursor-pointer',
                    draft.priceRangePreset === 'custom'
                      ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 font-bold'
                      : 'hover:bg-slate-100 dark:hover:bg-slate-800/60 text-slate-700 dark:text-slate-300'
                  )}
                >
                  <span>Custom Range</span>
                  {draft.priceRangePreset === 'custom' && <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />}
                </button>
              </div>

              {/* Custom Range Slider if Selected */}
              {draft.priceRangePreset === 'custom' && (
                <div className="pt-2 space-y-2 border-t border-slate-100 dark:border-slate-800 animate-in fade-in">
                  <div className="flex justify-between items-center text-[11px] font-mono font-bold">
                    <span>Up to:</span>
                    <span className="text-emerald-600 dark:text-emerald-400">
                      LKR {(draft.maxPrice || 5000).toLocaleString()}
                    </span>
                  </div>
                  <input
                    type="range"
                    min={50}
                    max={10000}
                    step={50}
                    value={draft.maxPrice || 5000}
                    onChange={(e) =>
                      setDraft((prev) => ({ ...prev, maxPrice: parseInt(e.target.value) || 5000 }))
                    }
                    className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                  />
                </div>
              )}
            </div>

            {/* Column 5: Sort By */}
            <div className="space-y-3">
              <span className="font-mono text-[11px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500">
                Sort By
              </span>
              <div className="space-y-1">
                {[
                  { id: 'featured', label: 'Featured / Relevance' },
                  { id: 'newest', label: 'Newest Arrivals' },
                  { id: 'price_asc', label: 'Price: Low → High' },
                  { id: 'price_desc', label: 'Price: High → Low' },
                  { id: 'rating', label: 'Highest Rated' },
                ].map((sortOption) => {
                  const isSelected = (draft.sortBy || 'featured') === sortOption.id;
                  return (
                    <button
                      key={sortOption.id}
                      type="button"
                      onClick={() => setDraft((prev) => ({ ...prev, sortBy: sortOption.id }))}
                      className={cn(
                        'w-full text-left px-3 py-2 rounded-xl transition-all font-medium flex items-center justify-between cursor-pointer',
                        isSelected
                          ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 font-bold'
                          : 'hover:bg-slate-100 dark:hover:bg-slate-800/60 text-slate-700 dark:text-slate-300'
                      )}
                    >
                      <span>{sortOption.label}</span>
                      {isSelected && <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Additional Facets Row (Quality Grade, Organic Only, Cold Chain) */}
          <div className="pt-6 border-t border-slate-100 dark:border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            {/* Quality Grade Chip Group */}
            <div className="space-y-1.5">
              <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Quality Grade
              </span>
              <div className="flex flex-wrap items-center gap-2">
                {[
                  { id: null, label: 'All Grades' },
                  { id: 'Grade A', label: 'Grade A' },
                  { id: 'Grade B', label: 'Grade B' },
                  { id: 'Wholesale Grade', label: 'Wholesale Grade' },
                ].map((g) => {
                  const isSelected = (draft.qualityGrade || null) === g.id;
                  return (
                    <button
                      key={g.label}
                      type="button"
                      onClick={() => setDraft((prev) => ({ ...prev, qualityGrade: g.id }))}
                      className={cn(
                        'px-3 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer border',
                        isSelected
                          ? 'bg-emerald-500 text-slate-950 border-emerald-500 font-black shadow-xs'
                          : 'bg-slate-100 dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-600'
                      )}
                    >
                      {g.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Organic & Cold Chain Toggles */}
            <div className="flex flex-wrap items-center gap-3">
              {/* Organic Only Toggle */}
              <button
                type="button"
                onClick={() => setDraft((prev) => ({ ...prev, isOrganicOnly: !prev.isOrganicOnly }))}
                className={cn(
                  'px-3.5 py-2 rounded-2xl border text-xs font-bold flex items-center gap-2 transition-all cursor-pointer',
                  draft.isOrganicOnly
                    ? 'bg-emerald-500/20 border-emerald-500 text-emerald-700 dark:text-emerald-300 shadow-xs'
                    : 'bg-slate-100 dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-slate-300'
                )}
              >
                <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>Certified Organic Only</span>
                {draft.isOrganicOnly && <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 ml-1" />}
              </button>

              {/* Cold Chain Toggle */}
              <button
                type="button"
                onClick={() => setDraft((prev) => ({ ...prev, requiresColdChain: !prev.requiresColdChain }))}
                className={cn(
                  'px-3.5 py-2 rounded-2xl border text-xs font-bold flex items-center gap-2 transition-all cursor-pointer',
                  draft.requiresColdChain
                    ? 'bg-cyan-500/20 border-cyan-500 text-cyan-700 dark:text-cyan-300 shadow-xs'
                    : 'bg-slate-100 dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-slate-300'
                )}
              >
                <Snowflake className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
                <span>Cold Chain Required</span>
                {draft.requiresColdChain && <Check className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400 ml-1" />}
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
          <button
            type="button"
            onClick={handleClearAll}
            className="flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Clear all</span>
          </button>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-full border border-slate-300 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleApply}
              className="px-6 py-2 rounded-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs shadow-md shadow-emerald-500/20 transition-all cursor-pointer"
            >
              {typeof resultCount === 'number'
                ? `Apply Filters (${resultCount} results)`
                : 'Apply filters'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return createPortal(content, document.body);
};
