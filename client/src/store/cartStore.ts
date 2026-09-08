import { create } from 'zustand';
import { CartService } from '@/services/cart.service';
import { useAuthStore } from './authStore';
import { useWishlistStore } from './wishlistStore';

export interface CartItem {
  productId: string;
  farmerId?: string;
  title: string;
  pricePerUnit: number;
  unit: string;
  quantity: number;
  image?: string;
  farmerName?: string;
  minOrderQuantity?: number;
  maxOrderQuantity?: number;
  tierPricing?: Array<{
    minQuantity: number;
    maxQuantity?: number;
    unitPrice?: number;
    pricePerUnit?: number;
  }>;
}

export interface StockIssue {
  productId: string;
  issueType: 'out_of_stock' | 'insufficient_stock' | 'price_changed' | 'delisted';
  message: string;
  availableQuantity: number;
  currentPrice: number;
  previousPrice?: number;
}

interface CartState {
  items: CartItem[];
  isOpen: boolean;
  stockIssues: StockIssue[];
  isValidating: boolean;
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;
  addItem: (item: Omit<CartItem, 'quantity'> & { quantity?: number }) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  removeItem: (productId: string) => void;
  clearCart: () => void;
  getSubtotal: () => number;
  getItemCount: () => number;
  validateCartStock: (deliveryDistrict?: string) => Promise<{ hasIssues: boolean; stockIssues: StockIssue[]; calculation?: any }>;
  dismissStockIssue: (productId: string) => void;
  moveToWishlist: (productId: string) => Promise<void>;
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
  stockIssues: [],
  isValidating: false,

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
      const updatedIssues = state.stockIssues.filter((issue) => issue.productId !== productId);
      triggerDbSync(updatedItems);
      return { items: updatedItems, stockIssues: updatedIssues };
    });
  },

  clearCart: () => {
    const { isAuthenticated } = useAuthStore.getState();
    if (isAuthenticated) {
      CartService.clearSavedCart().catch(() => {});
    }
    set({ items: [], stockIssues: [] });
  },

  getSubtotal: () => {
    return get().items.reduce((sum, item) => sum + item.pricePerUnit * item.quantity, 0);
  },

  getItemCount: () => {
    return get().items.reduce((sum, item) => sum + item.quantity, 0);
  },

  validateCartStock: async (deliveryDistrict?: string) => {
    set({ isValidating: true });
    try {
      const items = get().items;
      if (!items.length) {
        set({ stockIssues: [], isValidating: false });
        return { hasIssues: false, stockIssues: [] };
      }
      const res: any = await CartService.validateCart(items, deliveryDistrict);
      const stockIssues: StockIssue[] = res.stockIssues || [];
      set({ stockIssues, isValidating: false });
      return {
        hasIssues: res.hasIssues ?? stockIssues.length > 0,
        stockIssues,
        calculation: res.calculation,
      };
    } catch (err: any) {
      console.warn('Cart stock validation error:', err);
      set({ isValidating: false });
      return { hasIssues: false, stockIssues: [] };
    }
  },

  dismissStockIssue: (productId: string) => {
    set((state) => ({
      stockIssues: state.stockIssues.filter((issue) => issue.productId !== productId),
    }));
  },

  moveToWishlist: async (productId: string) => {
    const wishlistStore = useWishlistStore.getState();
    if (!wishlistStore.isInWishlist(productId)) {
      await wishlistStore.toggleItem(productId);
    }
    get().removeItem(productId);
  },

  hydrateCartFromDb: async () => {
    const { isAuthenticated } = useAuthStore.getState();
    if (!isAuthenticated) return;

    try {
      const res: any = await CartService.getSavedCart();
      if (res.success && res.data?.items) {
        const dbItems: CartItem[] = res.data.items.map((i: any) => ({
          productId: i.productId?._id || i.productId,
          farmerId: i.farmerId?._id || i.farmerId,
          title: i.title || i.productName,
          pricePerUnit: i.pricePerUnit,
          unit: i.unit || 'kg',
          quantity: i.quantity,
          image: i.image,
          farmerName: i.farmerName,
          minOrderQuantity: i.minOrderQuantity,
          maxOrderQuantity: i.maxOrderQuantity,
          tierPricing: i.tierPricing,
        }));

        set((state) => {
          const localMap = new Map(state.items.map((item) => [item.productId, item]));

          const merged: CartItem[] = dbItems.map((dbItem) => {
            const localItem = localMap.get(dbItem.productId);
            if (localItem) {
              return { ...dbItem, quantity: localItem.quantity };
            }
            return dbItem;
          });

          for (const localItem of state.items) {
            if (!merged.find((m) => m.productId === localItem.productId)) {
              merged.push(localItem);
            }
          }

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
