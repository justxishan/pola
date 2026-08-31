import React from 'react';
import { cn } from '@/lib/cn';
import { useTranslation } from '@/lib/i18n';
import { MapPin, CheckCircle2, Sprout, Edit, Power, Package, ArrowUpRight } from 'lucide-react';

export interface FarmCardProps {
  id: string;
  farmName: string;
  province: string;
  district: string;
  nearestVillage?: string;
  landExtentAcres: number;
  ownershipType: string;
  irrigationSource: string;
  isOrganicCertified?: boolean;
  isActive?: boolean;
  onEdit?: () => void;
  onViewListings?: () => void;
  onToggleActive?: () => void;
  className?: string;
}

export const FarmCard: React.FC<FarmCardProps> = ({
  farmName,
  province,
  district,
  nearestVillage,
  landExtentAcres,
  ownershipType,
  irrigationSource,
  isOrganicCertified,
  isActive = true,
  onEdit,
  onViewListings,
  onToggleActive,
  className,
}) => {
  const { t } = useTranslation();

  return (
    <div
      className={cn(
        'glass-terminal p-6 rounded-3xl border border-white/10 hover:border-lime-400/40 shadow-2xl transition-all duration-300 space-y-4 flex flex-col justify-between text-left',
        className
      )}
    >
      <div className="space-y-4">
        {/* Top Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-lime-400/20 text-lime-300 border border-lime-400/30 flex items-center justify-center shrink-0">
              <Sprout className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-extrabold text-white text-base sm:text-lg">{farmName}</h4>
              <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                <MapPin className="w-3.5 h-3.5 text-lime-400" />
                {nearestVillage ? `${nearestVillage}, ` : ''}
                {district}, {province}
              </p>
            </div>
          </div>

          <span
            className={cn(
              'px-3 py-1 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider',
              isActive
                ? 'bg-lime-400/20 text-lime-300 border border-lime-400/30'
                : 'bg-white/10 text-slate-400 border border-white/10'
            )}
          >
            {isActive ? t.active : t.inactive}
          </span>
        </div>

        {/* Specs Grid */}
        <div className="grid grid-cols-3 gap-2 pt-3 border-t border-white/10 text-xs">
          <div>
            <span className="text-slate-400 block text-[10px] uppercase font-mono">{t.landExtent}</span>
            <span className="font-bold text-white font-mono">
              {landExtentAcres} {t.acres}
            </span>
          </div>
          <div>
            <span className="text-slate-400 block text-[10px] uppercase font-mono">{t.ownership}</span>
            <span className="font-bold text-white capitalize">
              {ownershipType?.replace(/_/g, ' ') || 'Freehold'}
            </span>
          </div>
          <div>
            <span className="text-slate-400 block text-[10px] uppercase font-mono">{t.irrigation}</span>
            <span className="font-bold text-white capitalize">
              {irrigationSource?.replace(/_/g, ' ') || 'Rainfed'}
            </span>
          </div>
        </div>

        {/* Organic Tag */}
        {isOrganicCertified && (
          <div className="flex items-center gap-1.5 text-xs font-bold text-lime-300 bg-lime-500/20 p-2.5 rounded-2xl border border-lime-400/30">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-lime-400" />
            <span>PGS Certified 100% Organic Land</span>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="pt-3 border-t border-white/10 flex items-center justify-between gap-2">
        <button
          type="button"
          onClick={onToggleActive}
          className="px-3.5 py-1.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-[11px] font-bold text-slate-300 flex items-center gap-1.5 transition-all cursor-pointer"
        >
          <Power className="w-3.5 h-3.5" />
          <span>{isActive ? 'Deactivate' : 'Activate'}</span>
        </button>

        <button
          type="button"
          onClick={onViewListings}
          className="px-4 py-1.5 rounded-full bg-lime-400 hover:bg-lime-300 text-slate-950 font-black text-xs flex items-center gap-1 shadow-md shadow-lime-500/20 transition-all cursor-pointer"
        >
          <Package className="w-3.5 h-3.5" />
          <span>Crops</span>
        </button>
      </div>
    </div>
  );
};
