import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { cn } from '@/lib/cn';
import { Navbar, NavbarProps } from '@/components/organisms/Navbar';
import { MobileBottomNav } from '@/components/organisms/MobileBottomNav';
import { useAuthStore } from '@/store/authStore';
import { useCartStore } from '@/store/cartStore';
import { useWishlistStore } from '@/store/wishlistStore';
import { ChatService } from '@/services/chat.service';
import {
  Sprout,
  ShieldCheck,
  Home,
  Layers,
  ShoppingBag,
  Package,
  User,
  Heart,
  MessageSquare,
} from 'lucide-react';
import { usePortalThemeStore } from '@/store/portalThemeStore';

export interface MarketplaceLayoutProps extends Omit<NavbarProps, 'className'> {
  children: React.ReactNode;
  className?: string;
  onOpenCart?: () => void;
}

export const MarketplaceLayout: React.FC<MarketplaceLayoutProps> = ({
  children,
  className,
  onOpenCart,
  ...navbarProps
}) => {
  const { themes } = usePortalThemeStore();
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const bgImage = themes.customer?.bgImage || 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=2400&q=85';

  // Cart & Wishlist counts from store for the mobile badge
  const cartItemCount = useCartStore((s) => s.items.reduce((sum, i) => sum + i.quantity, 0));
  const wishlistCount = useWishlistStore((s) => s.itemIds.length);
  const [chatUnreadCount, setChatUnreadCount] = useState(0);

  useEffect(() => {
    if (!user) {
      setChatUnreadCount(0);
      return;
    }

    const fetchChatCount = async () => {
      try {
        const res: any = await ChatService.getMyConversations();
        if (res?.data?.conversations) {
          const myId = user._id || (user as any).id;
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

    fetchChatCount();
    const interval = setInterval(fetchChatCount, 30_000);
    return () => clearInterval(interval);
  }, [user]);

  const mobileNavItems = [
    {
      id: 'home',
      label: 'Home',
      icon: <Home className="w-5 h-5" />,
      path: '/',
    },
    {
      id: 'catalog',
      label: 'Browse',
      icon: <Layers className="w-5 h-5" />,
      path: '/catalog',
    },
    {
      id: 'wishlist',
      label: 'Wishlist',
      icon: <Heart className="w-5 h-5" />,
      path: user ? '/wishlist' : '/customer/login?redirect=/wishlist',
      badgeCount: wishlistCount,
    },
    {
      id: 'chat',
      label: 'Chats',
      icon: <MessageSquare className="w-5 h-5" />,
      path: user ? '/messages' : '/customer/login?redirect=/messages',
      badgeCount: chatUnreadCount,
    },
    {
      id: 'cart',
      label: 'Cart',
      icon: <ShoppingBag className="w-5 h-5" />,
      path: '__cart__',
      badgeCount: cartItemCount,
    },
    {
      id: 'orders',
      label: 'Orders',
      icon: <Package className="w-5 h-5" />,
      path: user ? '/customer/orders' : '/customer/login',
    },
    {
      id: 'account',
      label: 'Account',
      icon: <User className="w-5 h-5" />,
      path: user ? '/wallet' : '/customer/login',
    },
  ];

  const handleMobileNavigate = (path: string) => {
    if (path === '__cart__') {
      if (onOpenCart) onOpenCart();
      else if (navbarProps.onOpenCart) navbarProps.onOpenCart();
      return;
    }
    navigate(path);
  };

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-white flex flex-col justify-between selection:bg-emerald-400 selection:text-slate-950 relative overflow-x-clip transition-colors duration-300">
      {/* 1. Fullscreen Cinematic Bokeh Backdrop with Light/Dark adaptivity */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <img
          src={bgImage}
          alt="Marketplace Backdrop"
          className="w-full h-full object-cover dark:brightness-[0.25] dark:contrast-125 brightness-105 opacity-25 dark:opacity-100 scale-105 transition-all duration-300"
        />
        <div className="absolute inset-0 bg-radial from-transparent via-slate-100/60 dark:via-slate-950/70 to-slate-100 dark:to-slate-950" />
        <div className="absolute inset-0 bg-gradient-to-b from-slate-100/80 dark:from-slate-950/80 via-transparent to-slate-100 dark:to-slate-950" />
      </div>

      {/* 2. Floating Frosted Glass Navbar Pill */}
      <Navbar {...navbarProps} onOpenCart={onOpenCart || navbarProps.onOpenCart} />

      {/* 3. Main Page Content Container — pb-16 on mobile to clear fixed bottom nav */}
      <main className={cn('relative z-10 flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 pb-20 sm:pb-6', className)}>
        {children}
      </main>

      {/* 4. Luxury Frosted Glass Footer with Brand and Escrow Guarantee */}
      <footer className="relative z-10 border-t border-slate-200/80 dark:border-white/10 bg-white/70 dark:bg-black/60 backdrop-blur-2xl py-8 mt-16 mb-16 sm:mb-0 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-600 dark:text-slate-300">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-2xl bg-emerald-400 text-slate-950 flex items-center justify-center font-black shadow-lg shadow-emerald-500/20">
              <Sprout className="w-4 h-4 text-slate-950" />
            </div>
            <div>
              <p className="font-extrabold text-sm text-slate-900 dark:text-white tracking-tight">
                Pola <span className="font-serif-accent italic font-normal text-emerald-600 dark:text-emerald-400">AgriTech Network</span>
              </p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">Direct agricultural escrow marketplace connecting all 25 districts</p>
            </div>
          </div>

          <div className="flex items-center gap-3 font-semibold">
            <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-extrabold px-4 py-2 rounded-full bg-emerald-500/15 border border-emerald-400/30">
              <ShieldCheck className="w-4 h-4" /> 100% Escrow Protected
            </span>
          </div>
        </div>
      </footer>

      {/* 5. Mobile Bottom Navigation */}
      <MobileBottomNav
        items={mobileNavItems}
        activePath={location.pathname}
        onNavigate={handleMobileNavigate}
      />
    </div>
  );
};

