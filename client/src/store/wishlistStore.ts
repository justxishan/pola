import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface WishlistState {
  itemIds: string[];
  addItem: (productId: string) => void;
  removeItem: (productId: string) => void;
  toggleItem: (productId: string) => void;
  isInWishlist: (productId: string) => boolean;
  getItemCount: () => number;
  clearWishlist: () => void;
}

export const useWishlistStore = create<WishlistState>()(
  persist(
    (set, get) => ({
      itemIds: [],
      addItem: (productId: string) => {
        set((state) => ({
          itemIds: state.itemIds.includes(productId) ? state.itemIds : [...state.itemIds, productId],
        }));
      },
      removeItem: (productId: string) => {
        set((state) => ({
          itemIds: state.itemIds.filter((id) => id !== productId),
        }));
      },
      toggleItem: (productId: string) => {
        const { itemIds } = get();
        if (itemIds.includes(productId)) {
          set({ itemIds: itemIds.filter((id) => id !== productId) });
        } else {
          set({ itemIds: [...itemIds, productId] });
        }
      },
      isInWishlist: (productId: string) => get().itemIds.includes(productId),
      getItemCount: () => get().itemIds.length,
      clearWishlist: () => set({ itemIds: [] }),
    }),
    {
      name: 'pola-customer-wishlist',
    }
  )
);
