import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { cn } from '@/lib/cn';
import { useTranslation, LanguageCode } from '@/lib/i18n';
import { useThemeStore } from '@/store/themeStore';
import { useAuthStore } from '@/store/authStore';
import { useWishlistStore } from '@/store/wishlistStore';
import { ProfileDropdown } from '@/components/organisms/ProfileDropdown';
import { AddressDrawer } from '@/components/organisms/AddressDrawer';
import { NotificationDrawer } from '@/components/organisms/NotificationDrawer';
import { NotificationService } from '@/services/notification.service';
import { ChatService } from '@/services/chat.service';
import { ConfirmDialog } from '@/components/molecules/ConfirmDialog';
import { Avatar } from '@/components/atoms/Avatar';
import toast from 'react-hot-toast';
import {
  Sprout,
  Search,
  SlidersHorizontal,
  MessageSquare,
  Bell,
  Heart,
  ShoppingCart,
  Layers,
  X,
} from 'lucide-react';

export interface NavbarProps {
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
  onSearchSubmit?: () => void;
  onOpenFilter?: () => void;
  activeFilterCount?: number;
  cartItemCount?: number;
  onOpenCart?: () => void;
  currentLanguage?: LanguageCode;
  onLanguageChange?: (lang: LanguageCode) => void;
  isDark?: boolean;
  onToggleTheme?: () => void;
  user?: {
    name?: string;
    email: string;
    avatar?: string;
    avatarUrl?: string;
    fullName?: string;
    role?: string;
  } | null;
  onLoginClick?: () => void;
  className?: string;
}

export const Navbar: React.FC<NavbarProps> = ({
  searchQuery = '',
  onSearchChange,
  onSearchSubmit,
  onOpenFilter,
  activeFilterCount = 0,
  cartItemCount = 0,
  onOpenCart,
  currentLanguage,
  onLanguageChange,
  isDark: propIsDark,
  onToggleTheme: propToggleTheme,
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
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [localSearch, setLocalSearch] = useState(searchQuery);
  const [unreadCount, setUnreadCount] = useState(0);
  const [chatUnreadCount, setChatUnreadCount] = useState(0);
  const wishlistCount = useWishlistStore((s) => s.itemIds.length);
  const [isSignOutConfirmOpen, setIsSignOutConfirmOpen] = useState(false);
  const pollIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Derive the effective logged-in user — prefer store user for auth-aware checks
  const effectiveUser = storeUser || user;
  const isLoggedIn = !!effectiveUser;

  useEffect(() => {
    setLocalSearch(searchQuery);
  }, [searchQuery]);

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

  const fetchChatUnreadCount = async () => {
    try {
      const res: any = await ChatService.getMyConversations();
      if (res?.data?.conversations) {
        const myId = (effectiveUser as any)?._id || (effectiveUser as any)?.id || storeUser?._id;
        let total = 0;
        for (const conv of res.data.conversations) {
          if (conv.unreadCounts && myId && conv.unreadCounts[myId]) {
            total += Number(conv.unreadCounts[myId]) || 0;
          }
        }
        setChatUnreadCount(total);
      }
    } catch {
      // Silently fail
    }
  };

  useEffect(() => {
    if (!isLoggedIn) {
      setUnreadCount(0);
      setChatUnreadCount(0);
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
      return;
    }

    fetchUnreadCount();
    fetchChatUnreadCount();
    pollIntervalRef.current = setInterval(() => {
      fetchUnreadCount();
      fetchChatUnreadCount();
    }, 30_000);

    const handleInstantAlert = () => {
      fetchUnreadCount();
      fetchChatUnreadCount();
    };
    window.addEventListener('pola:notification:new', handleInstantAlert);
    window.addEventListener('pola:chat:new', handleInstantAlert);

    return () => {
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
      window.removeEventListener('pola:notification:new', handleInstantAlert);
      window.removeEventListener('pola:chat:new', handleInstantAlert);
    };
  }, [isLoggedIn, effectiveUser]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSearchSubmit) {
      onSearchSubmit();
    } else {
      const q = localSearch.trim();
      const params = new URLSearchParams(location.search);
      if (q) {
        params.set('search', q);
      } else {
        params.delete('search');
      }
      if (location.pathname === '/' || location.pathname.startsWith('/catalog')) {
        navigate(`${location.pathname}?${params.toString()}`);
      } else {
        navigate(`/?${params.toString()}`);
      }
    }
  };

  return (
    <header className={cn('sticky top-3 sm:top-4 z-50 max-w-7xl mx-auto w-full px-3 sm:px-6 transition-all', className)}>
      {/* 1. Master Floating Frosted Glass Pill Navbar */}
      <div className="glass-nav-pill rounded-full px-3 py-2 sm:px-4 sm:py-2 flex items-center justify-between gap-2 sm:gap-4 shadow-2xl transition-colors">
        
        {/* Left: Brand Logo in a Pill */}
        <div className="flex items-center gap-2 shrink-0">
          <a
            href="/"
            className="flex items-center gap-2 px-2.5 py-1 rounded-full hover:bg-slate-200/50 dark:hover:bg-white/10 transition-all cursor-pointer group"
          >
            <div className="w-8 h-8 rounded-full bg-emerald-400 text-slate-950 flex items-center justify-center font-black shadow-md shadow-emerald-500/20 group-hover:scale-105 transition-transform">
              <Sprout className="w-4 h-4 text-slate-950" />
            </div>
            <div className="flex items-baseline gap-0.5">
              <span className="text-base sm:text-lg font-black text-slate-900 dark:text-white tracking-tight">
                Pola
              </span>
              <span className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400">.lk</span>
            </div>
          </a>
        </div>

        {/* Center: Persistent Search Input & Filter Button */}
        <div className="flex-1 max-w-lg mx-1 sm:mx-3 flex items-center gap-2">
          <form onSubmit={handleSearchSubmit} className="relative flex-1">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder={t.searchPlaceholder || 'Search fresh harvest, crops...'}
              value={localSearch}
              onChange={(e) => {
                setLocalSearch(e.target.value);
                if (onSearchChange) onSearchChange(e.target.value);
              }}
              className="w-full pl-9 pr-8 py-1.5 sm:py-2 rounded-full bg-slate-200/60 dark:bg-white/10 border border-slate-300/80 dark:border-white/15 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400 transition-all"
            />
            {localSearch && (
              <button
                type="button"
                onClick={() => {
                  setLocalSearch('');
                  if (onSearchChange) onSearchChange('');
                }}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors cursor-pointer"
                title="Clear"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </form>

          {/* Filter Modal Trigger Button with Active Count Badge */}
          <button
            type="button"
            onClick={() => {
              if (onOpenFilter) onOpenFilter();
              else window.dispatchEvent(new CustomEvent('pola:open-filter'));
            }}
            className="relative p-2 sm:p-2.5 rounded-full bg-slate-200/60 dark:bg-white/10 border border-slate-300/80 dark:border-white/15 text-slate-700 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-white/20 transition-all cursor-pointer shrink-0"
            title={t.filters || 'Filters'}
            aria-label="Produce Filters"
          >
            <SlidersHorizontal className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            {typeof activeFilterCount === 'number' && activeFilterCount > 0 && (
              <span className="absolute -top-1 -right-1 min-w-[16px] h-4 px-1 rounded-full bg-emerald-500 text-slate-950 text-[9px] font-black flex items-center justify-center leading-none ring-1 ring-white dark:ring-slate-900">
                {activeFilterCount}
              </span>
            )}
          </button>
        </div>

        {/* Right: Icon Cluster (Chat → Bell → Wishlist → Cart → Profile) */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* Chat / Messages Button — logged-in users only */}
          {isLoggedIn && (
            <button
              type="button"
              onClick={() => navigate('/messages')}
              className="relative p-2 rounded-full bg-slate-200/60 dark:bg-white/5 border border-slate-300/80 dark:border-white/10 text-slate-700 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-white/15 transition-all cursor-pointer"
              title={t.chats || 'Chats'}
              aria-label="Chats"
            >
              <MessageSquare className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              {chatUnreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-0.5 bg-red-500 text-white rounded-full text-[9px] font-black flex items-center justify-center leading-none ring-1 ring-white dark:ring-slate-900">
                  {chatUnreadCount > 9 ? '9+' : chatUnreadCount}
                </span>
              )}
            </button>
          )}

          {/* Notification Bell — logged-in users only */}
          {isLoggedIn && (
            <button
              type="button"
              onClick={() => setIsNotificationsOpen(true)}
              className="relative p-2 rounded-full bg-slate-200/60 dark:bg-white/5 border border-slate-300/80 dark:border-white/10 text-slate-700 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-white/15 transition-all cursor-pointer"
              title="Notifications"
              aria-label="Notifications"
            >
              <Bell className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              {unreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-0.5 bg-red-500 text-white rounded-full text-[9px] font-black flex items-center justify-center leading-none ring-1 ring-white dark:ring-slate-900">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>
          )}

          {/* Wishlist Button */}
          <button
            type="button"
            onClick={() => {
              if (isLoggedIn) {
                navigate('/wishlist');
              } else {
                navigate('/customer/login?redirect=/wishlist');
              }
            }}
            className="relative p-2 rounded-full bg-slate-200/60 dark:bg-white/5 border border-slate-300/80 dark:border-white/10 text-slate-700 dark:text-slate-300 hover:text-rose-500 dark:hover:text-rose-400 hover:bg-slate-200 dark:hover:bg-white/15 transition-all cursor-pointer"
            title={t.wishlist || 'Wishlist'}
            aria-label="Wishlist"
          >
            <Heart className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            {wishlistCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-0.5 bg-rose-500 text-white rounded-full text-[9px] font-black flex items-center justify-center leading-none ring-1 ring-white dark:ring-slate-900">
                {wishlistCount > 9 ? '9+' : wishlistCount}
              </span>
            )}
          </button>

          {/* Cart Basket Capsule */}
          {onOpenCart && (
            <button
              type="button"
              onClick={onOpenCart}
              className="relative p-2 sm:px-3 sm:py-1.5 rounded-full bg-emerald-500/15 border border-emerald-400/30 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-500/25 transition-all flex items-center gap-1.5 cursor-pointer"
              title="Shopping Cart"
              aria-label="Shopping Cart"
            >
              <ShoppingCart className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              {cartItemCount > 0 && (
                <span className="px-1.5 py-0.2 rounded-full bg-emerald-400 text-slate-950 font-black text-[10px]">
                  {cartItemCount}
                </span>
              )}
            </button>
          )}

          {/* Profile Avatar Capsule with Hover Preview / Guest Login Pill */}
          {effectiveUser ? (
            <div className="relative group">
              <button
                type="button"
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="flex items-center p-0.5 rounded-full bg-slate-200/60 dark:bg-white/10 border border-slate-300/80 dark:border-white/15 hover:ring-2 hover:ring-emerald-400/50 transition-all cursor-pointer"
                title={effectiveUser.fullName || effectiveUser.name || effectiveUser.email}
                aria-label="User Profile"
              >
                <Avatar
                  src={(effectiveUser as any).avatarUrl || effectiveUser.avatar}
                  name={effectiveUser.fullName || effectiveUser.name || effectiveUser.email}
                  size="xs"
                />
              </button>

              {/* Hover Preview Card (Full name + email) */}
              <div className="absolute right-0 top-full mt-2 hidden group-hover:flex flex-col p-2.5 rounded-2xl bg-slate-900 text-white text-left shadow-xl border border-slate-800 z-40 pointer-events-none whitespace-nowrap min-w-[140px] animate-in fade-in duration-150">
                <span className="text-xs font-bold text-slate-100 truncate">
                  {effectiveUser.fullName || effectiveUser.name || 'User Profile'}
                </span>
                <span className="text-[10px] text-slate-400 truncate">
                  {effectiveUser.email}
                </span>
              </div>

              <ProfileDropdown
                isOpen={isProfileOpen}
                onClose={() => setIsProfileOpen(false)}
                currentLanguage={currentLanguage || language}
                onLanguageChange={onLanguageChange || setLanguage}
                isDark={propIsDark !== undefined ? propIsDark : isDark}
                onToggleTheme={propToggleTheme || toggleTheme}
                onRequestSignOut={() => {
                  setIsProfileOpen(false);
                  setIsSignOutConfirmOpen(true);
                }}
              />
            </div>
          ) : (
            <button
              type="button"
              onClick={() => {
                if (onLoginClick) onLoginClick();
                else navigate('/customer/login');
              }}
              className="flex items-center gap-1.5 px-3 sm:px-4 py-1.5 rounded-full bg-slate-200/60 dark:bg-white/10 hover:bg-slate-200 dark:hover:bg-white/20 border border-slate-300/80 dark:border-white/15 text-xs font-extrabold text-slate-900 dark:text-white transition-all cursor-pointer"
            >
              <Layers className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span className="hidden sm:inline">{t.allPortals || 'All Portals'}</span>
              <span className="sm:hidden">{t.signIn || 'Sign In'}</span>
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
