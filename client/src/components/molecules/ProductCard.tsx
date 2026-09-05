import React from 'react';
import { cn } from '@/lib/cn';
import { Sprout, MapPin, Star, Heart, ShieldCheck, Zap, Image as ImageIcon } from 'lucide-react';
import { useWishlistStore } from '@/store/wishlistStore';

export interface ProductCardProps {
  id: string;
  title: string;
  titleSi?: string;
  pricePerUnit: number;
  unit: string;
  category: string;
  images: string[];
  district: string;
  isOrganic?: boolean;
  qualityGrade?: string;
  minOrderQuantity?: number;
  ratingAverage?: number;
  farmerName?: string;
  onClick?: () => void;
  className?: string;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  id,
  title,
  titleSi,
  pricePerUnit,
  unit,
  category,
  images,
  district,
  isOrganic = false,
  qualityGrade = 'Grade A',
  minOrderQuantity = 1,
  ratingAverage = 0,
  farmerName,
  onClick,
  className,
}) => {
  const isWishlisted = useWishlistStore((state) => state.itemIds.includes(id));
  const toggleWishlist = useWishlistStore((state) => state.toggleItem);

  const hasImage = images && images.length > 0;
  const imageUrl = hasImage ? images[0] : null;

  return (
    <div
      onClick={onClick}
      className={cn(
        'group bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-white/10 hover:border-emerald-400/50 transition-all duration-300 overflow-hidden flex flex-col justify-between cursor-pointer shadow-lg relative',
        className
      )}
    >
      {/* 1. Image Frame with Vignette & Floating Pill Badges */}
      <div className="relative aspect-4/3 w-full overflow-hidden bg-slate-100 dark:bg-black/40 flex items-center justify-center">
        {hasImage ? (
          <img
            src={imageUrl as string}
            alt={title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 brightness-95"
          />
        ) : (
          <div className="flex flex-col items-center justify-center text-slate-400 dark:text-slate-600">
            <ImageIcon className="w-10 h-10 mb-2 opacity-50" />
            <span className="text-xs font-bold uppercase tracking-wider">No Image</span>
          </div>
        )}

        {/* Top Badges */}
        <div className="absolute top-2.5 left-2.5 flex flex-col gap-1.5 items-start">
          {isOrganic && (
            <span className="px-2 py-0.5 rounded-full bg-emerald-500/90 backdrop-blur-md text-white font-black text-[10px] tracking-wide flex items-center gap-1 shadow-md">
              <Sprout className="w-3 h-3" />
              100% Organic
            </span>
          )}
          {qualityGrade === 'Export' && (
            <span className="px-2 py-0.5 rounded-full bg-indigo-500/90 backdrop-blur-md text-white font-black text-[10px] tracking-wide flex items-center gap-1 shadow-md">
              <ShieldCheck className="w-3 h-3" />
              Export Grade
            </span>
          )}
        </div>

        {/* Top Right District Badge */}
        <div className="absolute top-2.5 right-2.5">
          <span className="px-2 py-0.5 rounded-full bg-slate-900/70 backdrop-blur-md text-white font-bold text-[10px] flex items-center gap-1 border border-white/10">
            <MapPin className="w-3 h-3 text-slate-300" />
            {district}
          </span>
        </div>

        {/* Bottom Rating Pill */}
        <div className="absolute bottom-2.5 left-3">
          <span className="px-2 py-0.5 rounded-full bg-slate-900/70 backdrop-blur-md text-amber-400 font-bold text-[10px] flex items-center gap-1 border border-white/10">
            <Star className="w-3 h-3 fill-amber-400" />
            {ratingAverage > 0 ? ratingAverage.toFixed(1) : 'New'}
          </span>
        </div>
      </div>

      {/* 2. Content & Pricing Details */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-3">
        <div className="space-y-1">
          <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider font-mono block">
            {category} {farmerName ? `• ${farmerName}` : ''}
          </span>
          <h3 className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-300 transition-colors line-clamp-1">
            {title}
          </h3>
          {titleSi && (
            <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 line-clamp-1">
              {titleSi}
            </p>
          )}
        </div>

        {/* Price & Wishlist Heart Action */}
        <div className="pt-2 border-t border-slate-100 dark:border-white/10 flex items-center justify-between gap-2">
          <div className="leading-tight">
            <span className="text-base sm:text-lg font-black text-emerald-600 dark:text-emerald-400 tracking-tight block">
              LKR {pricePerUnit?.toLocaleString()}
            </span>
            <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">per {unit || 'kg'}</span>
          </div>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              toggleWishlist(id);
            }}
            className={cn(
              'p-2.5 rounded-full transition-all cursor-pointer flex items-center justify-center border',
              isWishlisted
                ? 'bg-rose-50 dark:bg-rose-950/40 text-rose-500 border-rose-200 dark:border-rose-900/50 hover:bg-rose-100 dark:hover:bg-rose-900/60'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 border-slate-200/60 dark:border-white/10'
            )}
            title={isWishlisted ? 'Remove from wishlist' : 'Save to wishlist'}
            aria-label={isWishlisted ? 'Remove from wishlist' : 'Save to wishlist'}
          >
            <Heart
              className={cn(
                'w-4 h-4 transition-transform duration-200',
                isWishlisted ? 'fill-rose-500 text-rose-500 scale-110' : 'hover:scale-110'
              )}
            />
          </button>
        </div>
      </div>
    </div>
  );
};
