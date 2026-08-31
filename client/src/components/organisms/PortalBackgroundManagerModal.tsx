import React, { useState } from 'react';
import { usePortalThemeStore, PortalThemeConfig } from '@/store/portalThemeStore';
import {
  Image,
  Sparkles,
  Check,
  RotateCcw,
  X,
  ExternalLink,
  ShoppingBag,
  Sprout,
  Truck,
  ShieldCheck,
} from 'lucide-react';
import toast from 'react-hot-toast';

interface PortalBackgroundManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const CURATED_PRESETS = [
  {
    name: 'Sunlit Wheat Bokeh (Agrovia Reference)',
    url: 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&w=2400&q=85',
    category: 'farmer',
  },
  {
    name: 'Misty Sri Lankan Tea Terraces',
    url: 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=2400&q=85',
    category: 'farmer',
  },
  {
    name: 'Dew-Covered Organic Harvest',
    url: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=2400&q=85',
    category: 'customer',
  },
  {
    name: 'Fresh Farmers Market Stalls',
    url: 'https://images.unsplash.com/photo-1488459716781-31db52582fe9?auto=format&fit=crop&w=2400&q=85',
    category: 'customer',
  },
  {
    name: 'Scenic Highland Logistics Route',
    url: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=2400&q=85',
    category: 'delivery',
  },
  {
    name: 'Sunrise Agricultural Transport Corridor',
    url: 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=2400&q=85',
    category: 'delivery',
  },
  {
    name: 'Aerial Geometric Farmlands (Executive)',
    url: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=2400&q=85',
    category: 'admin',
  },
  {
    name: 'Emerald Agritech Valley at Dawn',
    url: 'https://images.unsplash.com/photo-1511497584788-87676104235f?auto=format&fit=crop&w=2400&q=85',
    category: 'admin',
  },
];

export const PortalBackgroundManagerModal: React.FC<PortalBackgroundManagerModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { themes, updatePortalBgImage, resetToDefaults } = usePortalThemeStore();
  const [selectedPortal, setSelectedPortal] = useState<'customer' | 'farmer' | 'delivery' | 'admin'>('farmer');
  const [customUrl, setCustomUrl] = useState('');

  if (!isOpen) return null;

  const currentTheme = themes[selectedPortal];

  const handleApplyCustomUrl = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customUrl.trim().startsWith('http')) {
      toast.error('Please enter a valid https image URL');
      return;
    }
    updatePortalBgImage(selectedPortal, customUrl.trim());
    toast.success(`Updated background for ${currentTheme.name}`);
    setCustomUrl('');
  };

  const handleSelectPreset = (url: string) => {
    updatePortalBgImage(selectedPortal, url);
    toast.success(`Applied preset to ${currentTheme.name}`);
  };

  const handleReset = () => {
    resetToDefaults();
    toast.success('Reset all 4 portals to default Agrovia backgrounds');
  };

  const portalTabs = [
    { id: 'customer', name: 'Customer Marketplace', icon: <ShoppingBag className="w-4 h-4 text-emerald-400" /> },
    { id: 'farmer', name: 'Farmer Portal', icon: <Sprout className="w-4 h-4 text-lime-400" /> },
    { id: 'delivery', name: 'Delivery Fleet', icon: <Truck className="w-4 h-4 text-yellow-400" /> },
    { id: 'admin', name: 'Admin HQ', icon: <ShieldCheck className="w-4 h-4 text-teal-400" /> },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
      <div className="bg-slate-900 border border-slate-700 rounded-3xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden shadow-2xl text-white">
        {/* Modal Header */}
        <div className="p-6 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-lime-400/20 text-lime-400 border border-lime-400/30">
              <Image className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-black text-white tracking-tight flex items-center gap-2">
                Portal Backgrounds & Visual Themes
              </h2>
              <p className="text-xs text-slate-400">
                Customize high-contrast Agrovia photography backgrounds for each of the 4 portals
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Portal Switcher Tabs */}
        <div className="px-6 pt-4 border-b border-slate-800 flex gap-2 overflow-x-auto no-scrollbar">
          {portalTabs.map((tab) => {
            const isSelected = selectedPortal === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setSelectedPortal(tab.id as any)}
                className={`px-4 py-2.5 rounded-2xl text-xs font-extrabold flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
                  isSelected
                    ? 'bg-slate-800 text-white border border-slate-600 shadow-md'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                }`}
              >
                {tab.icon}
                <span>{tab.name}</span>
              </button>
            );
          })}
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6 overflow-y-auto flex-1">
          {/* Active Preview Box */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-slate-300">
              <span>Current Active Background ({currentTheme.name})</span>
              <a
                href={currentTheme.loginPath}
                target="_blank"
                rel="noreferrer"
                className="text-lime-400 hover:underline flex items-center gap-1"
              >
                <span>View Live Login Screen</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            <div className="relative h-56 rounded-2xl overflow-hidden border border-slate-700 shadow-inner group">
              <img
                src={currentTheme.bgImage}
                alt={currentTheme.name}
                className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/60 p-6 flex flex-col justify-between">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-[11px] font-extrabold text-white w-max border border-white/25">
                  <Sparkles className="w-3 h-3 text-lime-300" />
                  {currentTheme.tag}
                </div>

                <div className="space-y-1">
                  <h3 className="text-2xl font-black text-white">
                    {currentTheme.headingPrefix}{' '}
                    <span className="font-serif-accent italic font-normal text-lime-300">
                      {currentTheme.headingAccent}
                    </span>
                  </h3>
                  <p className="text-xs text-slate-300 max-w-md truncate">
                    {currentTheme.subtitle}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Custom URL Input Form */}
          <form onSubmit={handleApplyCustomUrl} className="space-y-2">
            <label className="block text-xs font-bold text-slate-300">
              Set Custom Image URL (High Definition Unsplash / CDN)
            </label>
            <div className="flex gap-2">
              <input
                type="url"
                placeholder="https://images.unsplash.com/photo-..."
                value={customUrl}
                onChange={(e) => setCustomUrl(e.target.value)}
                className="flex-1 px-4 py-2.5 rounded-xl bg-slate-800/90 border border-slate-700 text-white text-xs placeholder-slate-500 focus:outline-none focus:border-lime-400"
              />
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-lime-400 hover:bg-lime-300 text-slate-950 font-extrabold text-xs transition-all shadow-md shadow-lime-500/20 cursor-pointer"
              >
                Apply URL
              </button>
            </div>
          </form>

          {/* Curated High-Contrast Presets Grid */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Curated High-Contrast Presets
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
              {CURATED_PRESETS.map((preset, idx) => {
                const isCurrent = currentTheme.bgImage === preset.url;
                return (
                  <div
                    key={idx}
                    onClick={() => handleSelectPreset(preset.url)}
                    className={`group relative h-28 rounded-2xl overflow-hidden border-2 cursor-pointer transition-all ${
                      isCurrent
                        ? 'border-lime-400 shadow-md shadow-lime-500/20 scale-[1.02]'
                        : 'border-slate-700 hover:border-slate-500'
                    }`}
                  >
                    <img
                      src={preset.url}
                      alt={preset.name}
                      className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent p-2.5 flex flex-col justify-between">
                      {isCurrent && (
                        <span className="self-end p-1 rounded-full bg-lime-400 text-slate-950 font-bold">
                          <Check className="w-3 h-3" />
                        </span>
                      )}
                      <p className="text-[11px] font-extrabold text-white leading-tight mt-auto">
                        {preset.name}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 px-6 border-t border-slate-800 flex items-center justify-between bg-slate-950/60">
          <button
            type="button"
            onClick={handleReset}
            className="text-xs text-slate-400 hover:text-white flex items-center gap-1.5 font-bold transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset All to Defaults
          </button>

          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs transition-colors cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
