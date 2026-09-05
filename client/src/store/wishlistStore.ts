import { create } from 'zustand';
import { WishlistService } from '@/services/wishlist.service';
import { useAuthStore } from './authStore';

export interface WishlistItem {
  productId: any;
  addedAt?: string | Date;
}

export interface WishlistState {
  items: WishlistItem[];
  itemIds: string[];
  isLoading: boolean;
  fetchWishlist: () => Promise<void>;
  toggleItem: (productId: string) => Promise<void>;
  isWishlisted: (productId: string) => boolean;
  isInWishlist: (productId: string) => boolean;
  getItemCount: () => number;
  clearWishlist: () => void;
}

export const useWishlistStore = create<WishlistState>((set, get) => ({
  items: [],
  itemIds: [],
  isLoading: false,

  fetchWishlist: async () => {
    const { isAuthenticated } = useAuthStore.getState();
    if (!isAuthenticated) {
      return;
    }

    try {
      set({ isLoading: true });
      const res: any = await WishlistService.getWishlist();
      if (res.success && res.data) {
        const rawItems: WishlistItem[] = res.data.items || [];
        const ids = rawItems
          .map((item) => {
            if (typeof item.productId === 'object' && item.productId?._id) {
              return item.productId._id;
            }
            return item.productId;
          })
          .filter(Boolean);

        set({ items: rawItems, itemIds: ids });
      }
    } catch (err) {
      console.error('Failed to fetch wishlist from DB:', err);
    } finally {
      set({ isLoading: false });
    }
  },

  toggleItem: async (productId: string) => {
    const { itemIds, items } = get();
    const alreadySaved = itemIds.includes(productId);

    // Save snapshot for rollback
    const prevItemIds = [...itemIds];
    const prevItems = [...items];

    // Optimistic state update
    if (alreadySaved) {
      set({
        itemIds: itemIds.filter((id) => id !== productId),
        items: items.filter((item) => {
          const id = item.productId?._id || item.productId;
          return id !== productId;
        }),
      });
    } else {
      set({
        itemIds: [productId, ...itemIds],
        items: [{ productId, addedAt: new Date() }, ...items],
      });
    }

    const { isAuthenticated } = useAuthStore.getState();
    if (!isAuthenticated) {
      return;
    }

    try {
      if (alreadySaved) {
        await WishlistService.removeFromWishlist(productId);
      } else {
        await WishlistService.addToWishlist(productId);
      }
    } catch (err) {
      // Rollback on failure
      set({ itemIds: prevItemIds, items: prevItems });
      throw err;
    }
  },

  isWishlisted: (productId: string) => get().itemIds.includes(productId),
  isInWishlist: (productId: string) => get().itemIds.includes(productId),
  getItemCount: () => get().itemIds.length,
  clearWishlist: () => set({ items: [], itemIds: [] }),
}));
