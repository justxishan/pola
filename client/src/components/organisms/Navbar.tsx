import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { cn } from '@/lib/cn';
import { useTranslation, LanguageCode } from '@/lib/i18n';
import { useThemeStore } from '@/store/themeStore';
import { useAuthStore } from '@/store/authStore';
import { ProfileDropdown } from '@/components/organisms/ProfileDropdown';
import { AddressDrawer } from '@/components/organisms/AddressDrawer';
import { NotificationDrawer } from '@/components/organisms/NotificationDrawer';
import { NotificationService } from '@/services/notification.service';
import { ConfirmDialog } from '@/components/molecules/ConfirmDialog';
import toast from 'react-hot-toast';
import {
  ShoppingCart,
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
  Bell,
  Package,
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
  const { user: storeUser, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();

  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isAddressDrawerOpen, setIsAddressDrawerOpen] = useState(false);
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [localSearch, setLocalSearch] = useState(searchQuery);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isSignOutConfirmOpen, setIsSignOutConfirmOpen] = useState(false);
  const pollIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const currentPath = location.pathname;

  // Derive the effective logged-in user — prefer store user for auth-aware checks
  const effectiveUser = storeUser || user;
  const isLoggedIn = !!effectiveUser;

  // Determine if user is a customer (not farmer/delivery/admin) — only customers see My Orders in navbar
  const isCustomer =
    isLoggedIn &&
    !effectiveUser?.role?.startsWith('farmer') &&
    effectiveUser?.role !== 'collector' &&
    !effectiveUser?.role?.startsWith('delivery') &&
    !effectiveUser?.role?.startsWith('admin');

  const fetchUnreadCount = async () => {
    try {
      const res: any = await NotificationService.getMyNotifications();
      if (res?.data?.notifications) {
        const count = res.data.notifications.filter((n: any) => !n.isRead).length;
        setUnreadCount(count);
      }
    } catch {
      // Silently fail — user may not be authenticated yet
    }
  };

  useEffect(() => {
    if (!isLoggedIn) {
      setUnreadCount(0);
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
      return;
    }

    fetchUnreadCount();
    pollIntervalRef.current = setInterval(fetchUnreadCount, 30_000);

    const handleInstantAlert = () => {
      fetchUnreadCount();
    };
    window.addEventListener('pola:notification:new', handleInstantAlert);

    return () => {
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
      window.removeEventListener('pola:notification:new', handleInstantAlert);
    };
  }, [isLoggedIn]);

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

        {/* Center: Clean Marketplace Brand Subtitle / Tagline on Desktop */}
        <div className="hidden lg:flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-400/20 text-emerald-600 dark:text-emerald-400 font-bold text-[11px]">
            <Sprout className="w-3.5 h-3.5" />
            <span>Farm-Direct Escrow Marketplace</span>
          </span>
        </div>

        {/* Right: Trilingual, Theme Toggle, Search, Cart & Profile Cluster */}
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
                  title="Close Search"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </form>
            ) : (
              <button
                onClick={() => setIsSearchExpanded(true)}
                className="p-2 rounded-full hover:bg-slate-200/60 dark:hover:bg-white/10 text-slate-600 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white transition-colors cursor-pointer"
                title="Search Produce"
                aria-label="Search Produce"
              >
                <Search className="w-4 h-4" />
              </button>
            )}
          </div>

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
              title="English"
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
              title="සිංහල"
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
              title="தமிழ்"
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
            aria-label="Toggle Theme"
          >
            {isDark ? <Sun className="w-3.5 h-3.5 text-amber-400" /> : <Moon className="w-3.5 h-3.5 text-indigo-600" />}
          </button>

          {/* My Orders Button — customers only */}
          {isCustomer && (
            <button
              onClick={() => navigate('/customer/orders')}
              className="relative p-2 rounded-full bg-slate-200/60 dark:bg-white/5 border border-slate-300/80 dark:border-white/10 text-slate-700 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-white/15 transition-all cursor-pointer"
              title="My Orders"
              aria-label="My Orders"
            >
              <Package className="w-3.5 h-3.5" />
            </button>
          )}

          {/* Notification Bell — logged-in users */}
          {isLoggedIn && (
            <button
              onClick={() => setIsNotificationsOpen(true)}
              className="relative p-2 rounded-full bg-slate-200/60 dark:bg-white/5 border border-slate-300/80 dark:border-white/10 text-slate-700 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-white/15 transition-all cursor-pointer"
              title="Notifications"
              aria-label="Notifications"
            >
              <Bell className="w-3.5 h-3.5" />
              {unreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-0.5 bg-red-500 text-white rounded-full text-[9px] font-black flex items-center justify-center leading-none ring-1 ring-white dark:ring-slate-900">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>
          )}

          {/* Cart Basket Capsule */}
          {onOpenCart && (
            <button
              onClick={onOpenCart}
              className="relative p-2 sm:px-3 sm:py-1.5 rounded-full bg-emerald-500/15 border border-emerald-400/30 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-500/25 transition-all flex items-center gap-1.5 cursor-pointer"
              title={`View Cart (${cartItemCount} items)`}
              aria-label="Shopping Cart"
            >
              <ShoppingCart className="w-4 h-4" />
              {cartItemCount > 0 && (
                <span className="px-1.5 py-0.2 rounded-full bg-emerald-400 text-slate-950 font-black text-[10px]">
                  {cartItemCount}
                </span>
              )}
            </button>
          )}

          {/* All Portals / User Capsule Button */}
          {user || storeUser ? (
            <div className="relative">
              <button
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="flex items-center gap-1.5 p-1 pr-2 rounded-full bg-slate-200/60 dark:bg-white/10 border border-slate-300/80 dark:border-white/15 hover:bg-slate-200 dark:hover:bg-white/20 text-slate-900 dark:text-white transition-all cursor-pointer"
                title={user?.name || storeUser?.fullName || user?.email || storeUser?.email || 'User Account'}
                aria-label="User Account"
              >
                <div className="w-7 h-7 rounded-full bg-emerald-400 text-slate-950 flex items-center justify-center font-black text-xs shadow-xs">
                  {(user?.name || storeUser?.fullName) ? (user?.name || storeUser?.fullName)!.charAt(0).toUpperCase() : 'U'}
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              <ProfileDropdown
                isOpen={isProfileOpen}
                onClose={() => setIsProfileOpen(false)}
                onRequestSignOut={() => {
                  setIsProfileOpen(false);
                  setIsSignOutConfirmOpen(true);
                }}
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

      {/* Notification Drawer */}
      <NotificationDrawer
        isOpen={isNotificationsOpen}
        onClose={() => {
          setIsNotificationsOpen(false);
          fetchUnreadCount(); // refresh badge after marking items read
        }}
      />

      {/* ── Centered Sign Out Confirmation Dialog ───────────────────── */}
      <ConfirmDialog
        isOpen={isSignOutConfirmOpen}
        title="Sign Out of Pola?"
        description="Are you sure you want to end your active session? You will need your login credentials to sign back in."
        confirmText="Sign Out"
        cancelText="Stay Logged In"
        isDestructive={true}
        onConfirm={() => {
          setIsSignOutConfirmOpen(false);
          logout();
          toast.success('Signed out successfully');
          navigate('/');
        }}
        onCancel={() => setIsSignOutConfirmOpen(false)}
      />
    </header>
  );
};
