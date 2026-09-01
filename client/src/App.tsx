import React, { useEffect } from 'react';
import { RouterProvider } from 'react-router-dom';
import { router } from './router';
import { Toaster } from 'react-hot-toast';
import { CartDrawer } from './components/organisms/CartDrawer';
import { useCartStore } from './store/cartStore';
import { useThemeStore } from './store/themeStore';

export const App: React.FC = () => {
  const { items, isOpen, closeCart, updateQuantity, removeItem, getSubtotal, hydrateCartFromDb } = useCartStore();
  const { isDark } = useThemeStore();

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

  return (
    <>
      <RouterProvider router={router} />

      {/* Global Slide-over Cart Drawer */}
      <CartDrawer
        isOpen={isOpen}
        onClose={closeCart}
        items={items}
        onUpdateQuantity={updateQuantity}
        onRemoveItem={removeItem}
        onCheckout={() => {
          closeCart();
          window.location.href = '/checkout';
        }}
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

export default App;
