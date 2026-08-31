import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { cn } from '@/lib/cn';
import { useTranslation, LanguageCode } from '@/lib/i18n';
import { useThemeStore } from '@/store/themeStore';
import { ProfileDropdown } from '@/components/organisms/ProfileDropdown';
import { AddressDrawer } from '@/components/organisms/AddressDrawer';
import {
  ShoppingBag,
  Sprout,
  MapPin,
  Search,
  Truck,
  ChevronDown,
  X,
  Layers,
  ShieldCheck,
  Sun,
  Moon,
} from 'lucide-react';

export interface NavbarProps {
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
  onSearchSubmit?: () => void;
  cartItemCount?: number;
  onOpenCart?: () => void;
  currentLanguage?: LanguageCode;
  onLanguageChange?: (lang: LanguageCode) => void;
  isDark?: boolean;
  onToggleTheme?: () => void;
  selectedDistrict?: string;
  onOpenLocationPicker?: () => void;
  user?: {
    name?: string;
    email: string;
    avatar?: string;
    role?: string;
  } | null;
  onLoginClick?: () => void;
  className?: string;
}

export const Navbar: React.FC<NavbarProps> = ({
  searchQuery = '',
  onSearchChange,
  onSearchSubmit,
  cartItemCount = 0,
  onOpenCart,
  selectedDistrict = 'Western Province',
  onOpenLocationPicker,
  user,
  onLoginClick,
  className,
}) => {
  const { t, language, setLanguage } = useTranslation();
  const { isDark, toggleTheme } = useThemeStore();
  const navigate = useNavigate();
  const location = useLocation();

  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isAddressDrawerOpen, setIsAddressDrawerOpen] = useState(false);
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const [localSearch, setLocalSearch] = useState(searchQuery);

  const currentPath = location.pathname;

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSearchSubmit) {
      onSearchSubmit();
    } else {
      navigate(`/catalog?search=${encodeURIComponent(localSearch)}`);
    }
    setIsSearchExpanded(false);
  };

  return (
    <header className={cn('sticky top-3 sm:top-4 z-50 max-w-7xl mx-auto w-full px-3 sm:px-6 transition-all', className)}>
      {/* 1. Master Floating Frosted Glass Pill Navbar */}
      <div className="glass-nav-pill rounded-full p-2 sm:p-2.5 flex items-center justify-between gap-2 sm:gap-4 shadow-2xl transition-colors">
        
        {/* Left: Brand Logo in a Pill */}
        <div className="flex items-center gap-2 shrink-0">
          <a
            href="/"
            className="flex items-center gap-2.5 px-3 py-1.5 rounded-full hover:bg-slate-200/50 dark:hover:bg-white/10 transition-all cursor-pointer group"
          >
            <div className="w-8 h-8 rounded-full bg-emerald-400 text-slate-950 flex items-center justify-center font-black shadow-md shadow-emerald-500/20 group-hover:scale-105 transition-transform">
              <Sprout className="w-4 h-4 text-slate-950" />
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-base sm:text-lg font-black text-slate-900 dark:text-white tracking-tight">
                Pola
              </span>
              <span className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400">.lk</span>
            </div>
          </a>
        </div>

        {/* Center: Segmented Portal Switcher Pills */}
        <nav className="hidden lg:flex items-center gap-1 p-1 rounded-full bg-slate-200/60 dark:bg-white/5 border border-slate-300/80 dark:border-white/10 text-xs font-bold">
          <button
            onClick={() => navigate('/')}
            className={cn(
              'px-4 py-1.5 rounded-full transition-all cursor-pointer flex items-center gap-1.5',
              currentPath === '/' || currentPath.startsWith('/catalog') || currentPath.startsWith('/product')
                ? 'bg-white dark:bg-white/15 text-slate-950 dark:text-white shadow-sm font-extrabold border border-slate-200 dark:border-white/20'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white hover:bg-slate-200/50 dark:hover:bg-white/5'
            )}
          >
            <ShoppingBag className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>{t.marketplace || 'Marketplace'}</span>
          </button>

          <button
            onClick={() => navigate('/farmer/login')}
            className={cn(
              'px-4 py-1.5 rounded-full transition-all cursor-pointer flex items-center gap-1.5',
              currentPath.startsWith('/farmer')
                ? 'bg-lime-400 text-slate-950 shadow-md font-black'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white hover:bg-slate-200/50 dark:hover:bg-white/5'
            )}
          >
            <Sprout className="w-3.5 h-3.5 text-lime-600 dark:text-lime-400" />
            <span>{t.farmers || 'Farmers'}</span>
          </button>

          <button
            onClick={() => navigate('/delivery/login')}
            className={cn(
              'px-4 py-1.5 rounded-full transition-all cursor-pointer flex items-center gap-1.5',
              currentPath.startsWith('/delivery')
                ? 'bg-yellow-400 text-slate-950 shadow-md font-black'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white hover:bg-slate-200/50 dark:hover:bg-white/5'
            )}
          >
            <Truck className="w-3.5 h-3.5 text-yellow-600 dark:text-yellow-400" />
            <span>{t.deliveryFleet || 'Delivery Fleet'}</span>
          </button>

          <button
            onClick={() => navigate('/admin/login')}
            className={cn(
              'px-4 py-1.5 rounded-full transition-all cursor-pointer flex items-center gap-1.5',
              currentPath.startsWith('/admin')
                ? 'bg-teal-400 text-slate-950 shadow-md font-black'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white hover:bg-slate-200/50 dark:hover:bg-white/5'
            )}
          >
            <ShieldCheck className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
            <span>{t.adminHq || 'Admin HQ'}</span>
          </button>
        </nav>

        {/* Right: Trilingual, Theme Toggle, Search, Location, Cart & Profile Cluster */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Quick Search Toggle / Input */}
          <div className="relative">
            {isSearchExpanded ? (
              <form onSubmit={handleSearchSubmit} className="flex items-center">
                <input
                  type="text"
                  placeholder={t.searchPlaceholder || 'Search fresh harvest...'}
                  value={localSearch}
                  onChange={(e) => {
                    setLocalSearch(e.target.value);
                    if (onSearchChange) onSearchChange(e.target.value);
                  }}
                  className="w-36 sm:w-56 px-3.5 py-1.5 rounded-full bg-slate-100 dark:bg-white/10 border border-slate-300 dark:border-white/20 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-emerald-400"
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => setIsSearchExpanded(false)}
                  className="ml-1 p-1 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-white"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </form>
            ) : (
              <button
                onClick={() => setIsSearchExpanded(true)}
                className="p-2 rounded-full hover:bg-slate-200/60 dark:hover:bg-white/10 text-slate-600 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white transition-colors cursor-pointer"
                title="Search Produce"
              >
                <Search className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Delivery Location Pill */}
          <button
            type="button"
            onClick={() => {
              if (onOpenLocationPicker) onOpenLocationPicker();
              else setIsAddressDrawerOpen(true);
            }}
            className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-200/50 dark:bg-white/5 border border-slate-300/80 dark:border-white/10 hover:bg-slate-200 dark:hover:bg-white/10 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white transition-all cursor-pointer"
          >
            <MapPin className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span className="truncate max-w-[100px]">{selectedDistrict}</span>
          </button>

          {/* Trilingual Switcher Capsule */}
          <div className="flex items-center p-0.5 rounded-full bg-slate-200/60 dark:bg-white/5 border border-slate-300/80 dark:border-white/10 text-[11px] font-bold">
            <button
              onClick={() => setLanguage('en')}
              className={cn(
                'px-2 py-0.5 rounded-full transition-all cursor-pointer',
                language === 'en'
                  ? 'bg-white dark:bg-white/25 text-emerald-700 dark:text-white shadow-xs font-black'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              )}
            >
              EN
            </button>
            <button
              onClick={() => setLanguage('si')}
              className={cn(
                'px-2 py-0.5 rounded-full transition-all cursor-pointer',
                language === 'si'
                  ? 'bg-white dark:bg-white/25 text-emerald-700 dark:text-white shadow-xs font-black'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              )}
            >
              සිං
            </button>
            <button
              onClick={() => setLanguage('ta')}
              className={cn(
                'px-2 py-0.5 rounded-full transition-all cursor-pointer',
                language === 'ta'
                  ? 'bg-white dark:bg-white/25 text-emerald-700 dark:text-white shadow-xs font-black'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              )}
            >
              த
            </button>
          </div>

          {/* Theme Toggle Capsule Button */}
          <button
            type="button"
            onClick={toggleTheme}
            className="p-2 rounded-full bg-slate-200/60 dark:bg-white/5 border border-slate-300/80 dark:border-white/10 text-slate-700 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-white/15 transition-all cursor-pointer"
            title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {isDark ? <Sun className="w-3.5 h-3.5 text-amber-400" /> : <Moon className="w-3.5 h-3.5 text-indigo-600" />}
          </button>

          {/* Cart Basket Capsule */}
          {onOpenCart && (
            <button
              onClick={onOpenCart}
              className="relative p-2 sm:px-3 sm:py-1.5 rounded-full bg-emerald-500/15 border border-emerald-400/30 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-500/25 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <ShoppingBag className="w-4 h-4" />
              {cartItemCount > 0 && (
                <span className="px-1.5 py-0.2 rounded-full bg-emerald-400 text-slate-950 font-black text-[10px]">
                  {cartItemCount}
                </span>
              )}
            </button>
          )}

          {/* All Portals / User Capsule Button */}
          {user ? (
            <div className="relative">
              <button
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="flex items-center gap-2 pl-2 pr-3 py-1 rounded-full bg-slate-200/60 dark:bg-white/10 border border-slate-300/80 dark:border-white/15 hover:bg-slate-200 dark:hover:bg-white/20 text-slate-900 dark:text-white transition-all cursor-pointer"
              >
                <div className="w-6 h-6 rounded-full bg-emerald-400 text-slate-950 flex items-center justify-center font-black text-xs">
                  {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                </div>
                <span className="hidden sm:inline text-xs font-bold truncate max-w-[80px]">
                  {user.name || user.email.split('@')[0]}
                </span>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </button>

              <ProfileDropdown
                isOpen={isProfileOpen}
                onClose={() => setIsProfileOpen(false)}
              />
            </div>
          ) : (
            <button
              onClick={() => {
                if (onLoginClick) onLoginClick();
                else navigate('/customer/login');
              }}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-slate-200/60 dark:bg-white/10 hover:bg-slate-200 dark:hover:bg-white/20 border border-slate-300/80 dark:border-white/15 text-xs font-extrabold text-slate-900 dark:text-white transition-all cursor-pointer"
            >
              <Layers className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>{t.allPortals || 'All Portals'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Address Drawer */}
      <AddressDrawer
        isOpen={isAddressDrawerOpen}
        onClose={() => setIsAddressDrawerOpen(false)}
      />
    </header>
  );
};
