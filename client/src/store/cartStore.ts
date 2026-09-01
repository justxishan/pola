import { create } from 'zustand';
import { CartService } from '@/services/cart.service';
import { useAuthStore } from './authStore';

export interface CartItem {
  productId: string;
  title: string;
  pricePerUnit: number;
  unit: string;
  quantity: number;
  image?: string;
  farmerName?: string;
  minOrderQuantity?: number;
  maxOrderQuantity?: number;
}

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
  hydrateCartFromDb: () => Promise<void>;
  syncCartToDb: () => Promise<void>;
}

let syncTimeout: any = null;

const triggerDbSync = (items: CartItem[]) => {
  const { isAuthenticated } = useAuthStore.getState();
  if (!isAuthenticated) return;

  if (syncTimeout) clearTimeout(syncTimeout);
  syncTimeout = setTimeout(async () => {
    try {
      await CartService.saveCart(items);
    } catch (err) {
      console.warn('Background cart sync warning:', err);
    }
  }, 400);
};

export const useCartStore = create<CartState>((set, get) => ({
  // Guest cart is strictly in-memory only (never written to localStorage)
  items: [],
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

      triggerDbSync(updatedItems);
      return { items: updatedItems, isOpen: true };
    });
  },

  updateQuantity: (productId, quantity) => {
    set((state) => {
      const updatedItems = state.items
        .map((item) => (item.productId === productId ? { ...item, quantity } : item))
        .filter((item) => item.quantity > 0);

      triggerDbSync(updatedItems);
      return { items: updatedItems };
    });
  },

  removeItem: (productId) => {
    set((state) => {
      const updatedItems = state.items.filter((item) => item.productId !== productId);
      triggerDbSync(updatedItems);
      return { items: updatedItems };
    });
  },

  clearCart: () => {
    const { isAuthenticated } = useAuthStore.getState();
    if (isAuthenticated) {
      CartService.clearSavedCart().catch(() => {});
    }
    set({ items: [] });
  },

  getSubtotal: () => {
    return get().items.reduce((sum, item) => sum + item.pricePerUnit * item.quantity, 0);
  },

  getItemCount: () => {
    return get().items.reduce((sum, item) => sum + item.quantity, 0);
  },

  hydrateCartFromDb: async () => {
    const { isAuthenticated } = useAuthStore.getState();
    if (!isAuthenticated) return;

    try {
      const res: any = await CartService.getSavedCart();
      if (res.success && res.data?.items) {
        const dbItems: CartItem[] = res.data.items.map((i: any) => ({
          productId: i.productId?._id || i.productId,
          title: i.title || i.productName,
          pricePerUnit: i.pricePerUnit,
          unit: i.unit || 'kg',
          quantity: i.quantity,
          image: i.image,
          farmerName: i.farmerName,
          minOrderQuantity: i.minOrderQuantity,
        }));

        set((state) => {
          // Merge strategy:
          // - If an item exists in BOTH local memory and the DB, prefer the LOCAL quantity.
          //   Local = the user actively changed it in this session (most recent intent).
          //   Math.max was wrong: if the user deliberately lowered qty, it would snap back up.
          // - Items only in the DB (from a previous/other session) are imported as-is.
          // - Items only in local memory (added as guest before login) are kept.
          const localMap = new Map(state.items.map((item) => [item.productId, item]));

          const merged: CartItem[] = dbItems.map((dbItem) => {
            const localItem = localMap.get(dbItem.productId);
            if (localItem) {
              // Local wins — user's current session intent takes priority
              return { ...dbItem, quantity: localItem.quantity };
            }
            return dbItem;
          });

          // Append any guest items that weren't in the DB at all
          for (const localItem of state.items) {
            if (!merged.find((m) => m.productId === localItem.productId)) {
              merged.push(localItem);
            }
          }

          // Push merged back to DB
          triggerDbSync(merged);
          return { items: merged };
        });
      }
    } catch (err) {
      console.warn('Failed to hydrate cart from database:', err);
    }
  },

  syncCartToDb: async () => {
    const { isAuthenticated } = useAuthStore.getState();
    if (!isAuthenticated) return;
    try {
      await CartService.saveCart(get().items);
    } catch (err) {}
  },
}));
