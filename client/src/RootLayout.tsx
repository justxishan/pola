import React, { useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { CartDrawer } from './components/organisms/CartDrawer';
import { useCartStore } from './store/cartStore';
import { useThemeStore } from './store/themeStore';
import { Toaster } from 'react-hot-toast';

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
  const { items, isOpen, closeCart, updateQuantity, removeItem, getSubtotal, hydrateCartFromDb } = useCartStore();
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

  const handleCheckout = () => {
    closeCart();
    navigate('/checkout');
  };

  return (
    <>
      <Outlet />

      {/* Global Slide-over Cart Drawer — uses navigate(), not window.location.href */}
      <CartDrawer
        isOpen={isOpen}
        onClose={closeCart}
        items={items}
        onUpdateQuantity={updateQuantity}
        onRemoveItem={removeItem}
        onCheckout={handleCheckout}
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
