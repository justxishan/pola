import React from 'react';
import { cn } from '@/lib/cn';
import { Sprout, MapPin, Star, ShoppingBag, ShieldCheck, Zap } from 'lucide-react';

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
  onAddToCart?: (e: React.MouseEvent) => void;
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
  ratingAverage = 4.9,
  farmerName,
  onAddToCart,
  onClick,
  className,
}) => {
  const imageUrl =
    images && images.length > 0
      ? images[0]
      : 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=800&q=80';

  return (
    <div
      onClick={onClick}
      className={cn(
        'group glass-terminal rounded-3xl border border-white/10 hover:border-emerald-400/50 transition-all duration-300 overflow-hidden flex flex-col justify-between cursor-pointer shadow-2xl relative',
        className
      )}
    >
      {/* 1. Image Frame with Vignette & Floating Pill Badges */}
      <div className="relative aspect-4/3 w-full overflow-hidden bg-black/40">
        <img
          src={imageUrl}
          alt={title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 brightness-90 contrast-110"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a1214] via-transparent to-black/30" />

        {/* Top Badges */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-1.5 pointer-events-none">
          {isOrganic ? (
            <span className="px-2.5 py-1 rounded-full bg-emerald-500/80 backdrop-blur-md text-slate-950 font-black text-[10px] uppercase tracking-wider flex items-center gap-1 shadow-md">
              <Sprout className="w-3 h-3 text-slate-950" />
              Organic
            </span>
          ) : (
            <span className="px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md text-slate-200 border border-white/15 font-bold text-[10px]">
              {qualityGrade}
            </span>
          )}

          <span className="px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md text-emerald-300 border border-emerald-400/30 font-bold text-[10px] flex items-center gap-1">
            <MapPin className="w-3 h-3 text-emerald-400" />
            {district}
          </span>
        </div>

        {/* Bottom Rating Pill */}
        <div className="absolute bottom-2.5 left-3">
          <span className="px-2 py-0.5 rounded-full bg-black/70 backdrop-blur-md text-amber-400 font-bold text-[10px] flex items-center gap-1 border border-white/10">
            <Star className="w-3 h-3 fill-amber-400" />
            {(ratingAverage || 4.9).toFixed(1)}
          </span>
        </div>
      </div>

      {/* 2. Content & Pricing Details */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-3">
        <div className="space-y-1">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono block">
            {category} {farmerName ? `• ${farmerName}` : ''}
          </span>
          <h3 className="font-extrabold text-sm sm:text-base text-white group-hover:text-emerald-300 transition-colors line-clamp-1">
            {title}
          </h3>
          {titleSi && (
            <p className="text-[11px] font-semibold text-slate-400 line-clamp-1">
              {titleSi}
            </p>
          )}
        </div>

        {/* Price & Add to Cart Pill Action */}
        <div className="pt-2 border-t border-white/10 flex items-center justify-between gap-2">
          <div className="leading-tight">
            <span className="text-base sm:text-lg font-black text-emerald-400 tracking-tight block">
              LKR {pricePerUnit?.toLocaleString()}
            </span>
            <span className="text-[10px] text-slate-400 font-medium">per {unit || 'kg'}</span>
          </div>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              if (onAddToCart) onAddToCart(e);
            }}
            className="p-2.5 sm:px-4 sm:py-2 rounded-full bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-black text-xs flex items-center gap-1.5 shadow-md shadow-emerald-500/20 transition-all cursor-pointer"
            title="Add to Basket"
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Add</span>
          </button>
        </div>
      </div>
    </div>
  );
};
