import React, { useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { CartDrawer } from './components/organisms/CartDrawer';
import { useCartStore } from './store/cartStore';
import { useWishlistStore } from './store/wishlistStore';
import { useAuthStore } from './store/authStore';
import { useThemeStore } from './store/themeStore';
import { ChatService } from './services/chat.service';
import { resolveNotificationPath } from './lib/routeResolver';
import toast, { Toaster } from 'react-hot-toast';

/**
 * RootLayout wraps the entire app inside the RouterProvider, which means
 * useNavigate() is safe here. This fixes the critical bug where:
 *   window.location.href = '/checkout'   <-- triggers full page reload
 *   navigate('/checkout')                <-- SPA navigation, preserves Zustand memory
 *
 * The cart is in-memory only for guests (no localStorage), so a full reload
 * would wipe it. Client-side navigation keeps the Zustand store alive.
 */
export const RootLayout: React.FC = () => {
  const {
    items,
    isOpen,
    stockIssues,
    closeCart,
    updateQuantity,
    removeItem,
    moveToWishlist,
    getSubtotal,
    hydrateCartFromDb,
  } = useCartStore();
  const { isAuthenticated, token, user } = useAuthStore();
  const { isDark } = useThemeStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  useEffect(() => {
    hydrateCartFromDb();
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      useWishlistStore.getState().fetchWishlist();
    }
  }, [isAuthenticated]);

  // Global persistent WebSocket connection & real-time notification push
  useEffect(() => {
    if (isAuthenticated && token) {
      const socket = ChatService.connectSocket(token);

      const handleLiveNotification = (data: { notification: any }) => {
        const notif = data?.notification;
        if (!notif) return;

        toast(
          (t) => (
            <div
              className="cursor-pointer flex flex-col gap-0.5"
              onClick={() => {
                toast.dismiss(t.id);
                const path = resolveNotificationPath(notif, user?.role);
                if (path) navigate(path);
              }}
            >
              <div className="flex items-center gap-1.5 font-bold text-xs text-emerald-500 dark:text-emerald-400">
                <span>🔔</span>
                <span>{notif.title}</span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2">{notif.message}</p>
            </div>
          ),
          { duration: 5000 }
        );

        // Notify bells & dashboards to increment count immediately
        window.dispatchEvent(new CustomEvent('pola:notification:new', { detail: notif }));
      };

      ChatService.onNotificationReceived(handleLiveNotification);

      return () => {
        if (socket) {
          socket.off('notification:new', handleLiveNotification);
        }
      };
    } else {
      ChatService.disconnect();
    }
  }, [isAuthenticated, token, user?.role]);

  const handleCheckout = () => {
    closeCart();
    const sellerCount = new Set(items.map((i) => i.farmerId || i.farmerName || 'default')).size;
    if (sellerCount > 1 || stockIssues.length > 0) {
      navigate('/cart');
    } else {
      navigate('/checkout');
    }
  };

  const handleViewCart = () => {
    closeCart();
    navigate('/cart');
  };

  return (
    <>
      <Outlet />

      {/* Global Slide-over Cart Drawer — uses navigate(), not window.location.href */}
      <CartDrawer
        isOpen={isOpen}
        onClose={closeCart}
        items={items}
        stockIssues={stockIssues}
        onUpdateQuantity={updateQuantity}
        onRemoveItem={removeItem}
        onMoveToWishlist={moveToWishlist}
        onCheckout={handleCheckout}
        onViewCart={handleViewCart}
        subtotalLkr={getSubtotal()}
      />

      {/* Toast Notification Container */}
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3500,
          style: {
            borderRadius: '16px',
            background: isDark ? '#1E293B' : '#FFFFFF',
            color: isDark ? '#F8FAFC' : '#0F172A',
            fontSize: '13px',
            fontWeight: 500,
            border: isDark ? '1px solid #334155' : '1px solid #E2E8F0',
            boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)',
          },
        }}
      />
    </>
  );
};
