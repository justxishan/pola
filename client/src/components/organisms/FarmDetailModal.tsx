import React from 'react';
import { MapPin, Ruler, Droplets, Leaf, FileText, Edit, Power, RotateCcw, Trash2, X, Sprout } from 'lucide-react';
import { cn } from '@/lib/cn';

export interface FarmDetailModalProps {
  farm: any | null;
  isOpen: boolean;
  isProcessing?: boolean;
  onClose: () => void;
  onEdit: (farm: any) => void;
  onDeactivate: (farm: any) => void;
  onReactivate: (farm: any) => void;
  onDelete: (farm: any) => void;
}

const irrigationLabels: Record<string, string> = {
  rain_fed: 'Rain-fed',
  irrigated: 'Irrigated',
  drip: 'Drip Irrigation',
  well: 'Well',
  canal: 'Canal',
};

export const FarmDetailModal: React.FC<FarmDetailModalProps> = ({
  farm,
  isOpen,
  isProcessing,
  onClose,
  onEdit,
  onDeactivate,
  onReactivate,
  onDelete,
}) => {
  if (!isOpen || !farm) return null;
  const isActive = farm.isActive !== false;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs" onClick={onClose} />
      <div className="relative w-full max-w-lg rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl p-6 sm:p-8 space-y-6">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-300 flex items-center justify-center">
              <Sprout className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 dark:text-slate-100 text-lg">{farm.farmName}</h3>
              <p className="text-xs text-slate-400 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5" />{farm.city}, {farm.district}, {farm.province}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex items-center gap-2">
          <span className={cn('px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider',
            farm.verificationStatus === 'verified' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300'
            : farm.verificationStatus === 'rejected' ? 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300'
            : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300')}>
            {farm.verificationStatus || 'pending'}
          </span>
          <span className={cn('px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider',
            isActive ? 'bg-lime-100 text-lime-700 dark:bg-lime-900/30 dark:text-lime-300' : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400')}>
            {isActive ? 'Active' : 'Deactivated'}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-4 text-xs">
          <div className="space-y-1">
            <span className="text-slate-400 block text-[10px] uppercase font-mono">Land Extent</span>
            <span className="font-bold text-slate-800 dark:text-slate-100 flex items-center gap-1.5"><Ruler className="w-3.5 h-3.5 text-blue-500" />{farm.extentValue} {farm.extentUnit}</span>
          </div>
          <div className="space-y-1">
            <span className="text-slate-400 block text-[10px] uppercase font-mono">Ownership</span>
            <span className="font-bold text-slate-800 dark:text-slate-100 capitalize">{farm.ownershipType?.replace(/_/g, ' ')}</span>
          </div>
          <div className="space-y-1">
            <span className="text-slate-400 block text-[10px] uppercase font-mono">Irrigation</span>
            <span className="font-bold text-slate-800 dark:text-slate-100 flex items-center gap-1.5"><Droplets className="w-3.5 h-3.5 text-sky-500" />{irrigationLabels[farm.irrigationType] || farm.irrigationType}</span>
          </div>
          {farm.isOrganicCertified && (
            <div className="space-y-1">
              <span className="text-slate-400 block text-[10px] uppercase font-mono">Certification</span>
              <span className="font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5"><Leaf className="w-3.5 h-3.5" />Organic Certified</span>
            </div>
          )}
        </div>

        {farm.verificationDoc && (
          <a href={farm.verificationDoc} target="_blank" rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-teal-600 dark:text-teal-400 hover:underline">
            <FileText className="w-3.5 h-3.5" />View Verification Document
          </a>
        )}

        {!isActive && (
          <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 text-xs text-slate-500 dark:text-slate-400">
            This farm is deactivated. Its crop listings are hidden from the marketplace but kept on record. Reactivate to resume selling, or delete permanently if it has no crop history.
          </div>
        )}

        <div className="flex flex-wrap items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
          {isActive ? (
            <>
              <button type="button" onClick={() => onEdit(farm)}
                className="px-4 py-2 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200 flex items-center gap-1.5 transition-all cursor-pointer">
                <Edit className="w-3.5 h-3.5" />Edit Farm
              </button>
              <button type="button" disabled={isProcessing} onClick={() => onDeactivate(farm)}
                className="px-4 py-2 rounded-full bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/40 text-xs font-bold text-rose-600 dark:text-rose-300 flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-50">
                <Power className="w-3.5 h-3.5" />Deactivate Farm
              </button>
            </>
          ) : (
            <>
              <button type="button" disabled={isProcessing} onClick={() => onReactivate(farm)}
                className="px-4 py-2 rounded-full bg-lime-100 dark:bg-lime-900/30 hover:bg-lime-200 dark:hover:bg-lime-900/50 text-xs font-bold text-lime-700 dark:text-lime-300 flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-50">
                <RotateCcw className="w-3.5 h-3.5" />Reactivate Farm
              </button>
              <button type="button" disabled={isProcessing} onClick={() => onDelete(farm)}
                className="px-4 py-2 rounded-full bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/40 text-xs font-bold text-rose-600 dark:text-rose-300 flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-50">
                <Trash2 className="w-3.5 h-3.5" />Delete Farm
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
