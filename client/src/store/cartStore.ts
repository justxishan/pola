import { create } from 'zustand';
import { CartItem } from '@/components/organisms/CartDrawer';

interface CartState {
  items: CartItem[];
  isOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;
  addItem: (item: Omit<CartItem, 'quantity'> & { quantity?: number }) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  removeItem: (productId: string) => void;
  clearCart: () => void;
  getSubtotal: () => number;
  getItemCount: () => number;
}

const savedCart = localStorage.getItem('pola_cart');

export const useCartStore = create<CartState>((set, get) => ({
  items: savedCart ? JSON.parse(savedCart) : [],
  isOpen: false,

  openCart: () => set({ isOpen: true }),
  closeCart: () => set({ isOpen: false }),
  toggleCart: () => set((state) => ({ isOpen: !state.isOpen })),

  addItem: (item) => {
    set((state) => {
      const existingIndex = state.items.findIndex((i) => i.productId === item.productId);
      let updatedItems: CartItem[];

      if (existingIndex > -1) {
        updatedItems = [...state.items];
        updatedItems[existingIndex].quantity += item.quantity || 1;
      } else {
        updatedItems = [
          ...state.items,
          {
            ...item,
            quantity: item.quantity || item.minOrderQuantity || 1,
          },
        ];
      }

      localStorage.setItem('pola_cart', JSON.stringify(updatedItems));
      return { items: updatedItems, isOpen: true };
    });
  },

  updateQuantity: (productId, quantity) => {
    set((state) => {
      const updatedItems = state.items
        .map((item) => (item.productId === productId ? { ...item, quantity } : item))
        .filter((item) => item.quantity > 0);

      localStorage.setItem('pola_cart', JSON.stringify(updatedItems));
      return { items: updatedItems };
    });
  },

  removeItem: (productId) => {
    set((state) => {
      const updatedItems = state.items.filter((item) => item.productId !== productId);
      localStorage.setItem('pola_cart', JSON.stringify(updatedItems));
      return { items: updatedItems };
    });
  },

  clearCart: () => {
    localStorage.removeItem('pola_cart');
    set({ items: [] });
  },

  getSubtotal: () => {
    return get().items.reduce((sum, item) => sum + item.pricePerUnit * item.quantity, 0);
  },

  getItemCount: () => {
    return get().items.reduce((sum, item) => sum + item.quantity, 0);
  },
}));
