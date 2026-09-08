import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MarketplaceLayout } from '@/components/templates/MarketplaceLayout';
import { EmptyState } from '@/components/molecules/EmptyState';
import { QuantityStepper } from '@/components/molecules/QuantityStepper';
import { ConfirmDialog } from '@/components/molecules/ConfirmDialog';
import { useCartStore, CartItem } from '@/store/cartStore';
import { useThemeStore } from '@/store/themeStore';
import { useAuthStore } from '@/store/authStore';
import {
  ShoppingCart,
  ArrowRight,
  ArrowLeft,
  Trash2,
  Heart,
  ShieldCheck,
  Store,
  Sparkles,
  AlertTriangle,
  ShoppingBag,
  RefreshCw,
} from 'lucide-react';
import toast from 'react-hot-toast';

interface SellerGroup {
  sellerId: string;
  sellerName: string;
  items: CartItem[];
  subtotal: number;
}

function groupItemsBySeller(items: CartItem[]): SellerGroup[] {
  const map = new Map<string, SellerGroup>();
  for (const item of items) {
    const key = item.farmerId || item.farmerName || 'Verified Pola Farmer';
    const name = item.farmerName || 'Verified Pola Farmer';
    if (!map.has(key)) {
      map.set(key, {
        sellerId: key,
        sellerName: name,
        items: [],
        subtotal: 0,
      });
    }
    const group = map.get(key)!;
    group.items.push(item);
    group.subtotal += item.pricePerUnit * item.quantity;
  }
  return Array.from(map.values());
}

function getBulkNudge(item: CartItem): string | null {
  if (!item.tierPricing || !item.tierPricing.length) return null;
  const higherTiers = item.tierPricing
    .filter((t) => t.minQuantity > item.quantity)
    .sort((a, b) => a.minQuantity - b.minQuantity);
  if (!higherTiers.length) return null;
  const nextTier = higherTiers[0];
  const diff = Math.round((nextTier.minQuantity - item.quantity) * 100) / 100;
  const price = nextTier.unitPrice ?? nextTier.pricePerUnit;
  if (!price) return null;
  return `Add ${diff} more ${item.unit} to unlock LKR ${price.toLocaleString()}/${item.unit}`;
}

export const CartPage: React.FC = () => {
  const navigate = useNavigate();
  const {
    items,
    stockIssues,
    isValidating,
    updateQuantity,
    removeItem,
    clearCart,
    getSubtotal,
    validateCartStock,
    moveToWishlist,
    openCart,
  } = useCartStore();

  const { isDark, toggleTheme, language, setLanguage } = useThemeStore();
  const { user } = useAuthStore();

  const [itemToDelete, setItemToDelete] = useState<CartItem | null>(null);
  const [isClearingCart, setIsClearingCart] = useState(false);
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  const subtotal = getSubtotal();
  const estimatedDelivery = items.length > 0 ? 350 : 0;
  const grandTotal = subtotal + estimatedDelivery;
  const sellerGroups = groupItemsBySeller(items);

  const issuesMap = new Map(stockIssues.map((i) => [i.productId, i]));

  const handleProceedToCheckout = async () => {
    try {
      setIsCheckingOut(true);
      const res = await validateCartStock();
      if (res.hasIssues) {
        const blockingIssue = res.stockIssues.find(
          (i) => i.issueType === 'out_of_stock' || i.issueType === 'delisted'
        );
        if (blockingIssue) {
          toast.error('Some items in your basket are unavailable. Please remove them to proceed.');
          return;
        }
        toast((t) => (
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />
            <span className="text-xs">Cart stock or prices adjusted. Please review before proceeding.</span>
          </div>
        ));
      }
      navigate('/checkout');
    } catch (err) {
      navigate('/checkout');
    } finally {
      setIsCheckingOut(false);
    }
  };

  const handleMoveToWishlist = async (productId: string, title: string) => {
    try {
      await moveToWishlist(productId);
      toast.success(`Saved "${title}" to your Wishlist!`);
    } catch (err) {
      toast.error('Failed to move item to Wishlist.');
    }
  };

  return (
    <MarketplaceLayout
      searchQuery=""
      onSearchChange={() => {}}
      cartItemCount={items.length}
      onOpenCart={openCart}
      currentLanguage={language}
      onLanguageChange={setLanguage}
      isDark={isDark}
      onToggleTheme={toggleTheme}
      user={user}
    >
      <div className="space-y-8 pb-16 max-w-7xl mx-auto">
        {/* Breadcrumb & Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 dark:border-white/10 pb-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400">
              <button
                type="button"
                onClick={() => navigate('/')}
                className="hover:text-emerald-500 transition-colors flex items-center gap-1 cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Marketplace</span>
              </button>
              <span>/</span>
              <span className="text-slate-900 dark:text-white">Shopping Cart</span>
            </div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                Produce Basket
              </h1>
              <span className="px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 font-black text-xs border border-emerald-200 dark:border-emerald-900/50 flex items-center gap-1.5 shadow-2xs">
                <ShoppingBag className="w-3.5 h-3.5" />
                <span>{items.length} {items.length === 1 ? 'item' : 'items'}</span>
              </span>
            </div>
          </div>

          {items.length > 0 && (
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => validateCartStock()}
                disabled={isValidating}
                className="px-4 py-2 rounded-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold text-xs flex items-center gap-1.5 hover:bg-slate-50 dark:hover:bg-slate-700/60 transition-all cursor-pointer disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isValidating ? 'animate-spin' : ''}`} />
                <span>Verify Live Stock</span>
              </button>
              <button
                type="button"
                onClick={() => setIsClearingCart(true)}
                className="px-4 py-2 rounded-full border border-rose-200 dark:border-rose-900/50 bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400 font-bold text-xs flex items-center gap-1.5 hover:bg-rose-100 dark:hover:bg-rose-900/50 transition-all cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Clear Basket</span>
              </button>
            </div>
          )}
        </div>

        {/* Empty State */}
        {items.length === 0 ? (
          <EmptyState
            icon={ShoppingCart}
            title="Your produce basket is empty"
            description="Explore authentic farm-fresh harvests directly from local Sri Lankan producers. Add vegetables, fruits, grains, and spices to get started."
            actionLabel="Explore Marketplace"
            onAction={() => navigate('/')}
            className="py-16"
          />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left: Items grouped by seller */}
            <div className="lg:col-span-8 space-y-6">
              {sellerGroups.map((group) => (
                <div
                  key={group.sellerId}
                  className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-xs"
                >
                  {/* Seller Header */}
                  <div className="px-6 py-4 bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                        <Store className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="font-bold text-sm text-slate-900 dark:text-white leading-tight">
                          {group.sellerName}
                        </h4>
                        <span className="text-[11px] text-slate-400 font-medium">
                          Verified Local Producer • Direct Farm Hub Dispatch
                        </span>
                      </div>
                    </div>
                    <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-slate-200/70 dark:bg-slate-700/60 text-slate-700 dark:text-slate-300">
                      {group.items.length} item{group.items.length > 1 ? 's' : ''}
                    </span>
                  </div>

                  {/* Items List */}
                  <div className="divide-y divide-slate-100 dark:divide-slate-800 p-6 space-y-6">
                    {group.items.map((item, idx) => {
                      const stockIssue = issuesMap.get(item.productId);
                      const bulkNudge = getBulkNudge(item);

                      return (
                        <div key={item.productId} className={`space-y-3 ${idx > 0 ? 'pt-6' : ''}`}>
                          {/* Stock Warning Banner */}
                          {stockIssue && (
                            <div className="p-3 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-200 text-xs flex items-center gap-2">
                              <AlertTriangle className="w-4 h-4 shrink-0 text-amber-600 dark:text-amber-400" />
                              <div className="flex-1">
                                <span className="font-semibold">{stockIssue.message}</span>
                              </div>
                            </div>
                          )}

                          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                            {/* Product Info */}
                            <div className="flex items-center gap-4 min-w-0">
                              {item.image ? (
                                <img
                                  src={item.image}
                                  alt={item.title}
                                  className="w-18 h-18 rounded-2xl object-cover shrink-0 border border-slate-200 dark:border-slate-800 cursor-pointer hover:opacity-90 transition-opacity"
                                  onClick={() => navigate(`/product/${item.productId}`)}
                                />
                              ) : (
                                <div className="w-18 h-18 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0">
                                  <ShoppingBag className="w-6 h-6 text-slate-400" />
                                </div>
                              )}

                              <div className="space-y-1 min-w-0">
                                <h3
                                  onClick={() => navigate(`/product/${item.productId}`)}
                                  className="font-bold text-sm sm:text-base text-slate-900 dark:text-white hover:text-emerald-500 transition-colors cursor-pointer truncate"
                                >
                                  {item.title}
                                </h3>
                                <div className="flex items-center gap-2">
                                  <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                                    LKR {item.pricePerUnit.toLocaleString()}/{item.unit}
                                  </span>
                                  {item.minOrderQuantity && item.minOrderQuantity > 1 && (
                                    <span className="text-[10px] text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full">
                                      Min: {item.minOrderQuantity} {item.unit}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>

                            {/* Stepper, Line Total, Actions */}
                            <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto">
                              <QuantityStepper
                                value={item.quantity}
                                min={
                                  item.minOrderQuantity ||
                                  (['kg', 'g', 'l', 'ml'].includes((item.unit || '').toLowerCase()) ? 0.5 : 1)
                                }
                                max={item.maxOrderQuantity && item.maxOrderQuantity > 0 ? item.maxOrderQuantity : 99999}
                                step={['kg', 'g', 'l', 'ml'].includes((item.unit || '').toLowerCase()) ? 0.5 : 1}
                                unit={item.unit}
                                onChange={(qty) => updateQuantity(item.productId, qty)}
                              />

                              <div className="text-right min-w-[100px]">
                                <span className="block text-sm sm:text-base font-black text-slate-900 dark:text-white font-mono">
                                  LKR {(item.pricePerUnit * item.quantity).toLocaleString()}
                                </span>
                              </div>

                              <div className="flex items-center gap-1">
                                <button
                                  type="button"
                                  onClick={() => handleMoveToWishlist(item.productId, item.title)}
                                  className="p-2 rounded-xl text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                                  title="Save to Wishlist"
                                  aria-label="Move to Wishlist"
                                >
                                  <Heart className="w-4 h-4" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setItemToDelete(item)}
                                  className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                                  title="Remove item"
                                  aria-label="Remove item"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          </div>

                          {/* Bulk Pricing Nudge */}
                          {bulkNudge && (
                            <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300 text-xs font-medium flex items-center gap-1.5 border border-emerald-100 dark:border-emerald-900/40">
                              <Sparkles className="w-3.5 h-3.5 shrink-0 text-emerald-600 dark:text-emerald-400" />
                              <span>{bulkNudge}</span>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* Seller Subtotal Bar */}
                  <div className="px-6 py-3.5 bg-slate-50/80 dark:bg-slate-800/40 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-500 dark:text-slate-400">
                      Subtotal for {group.sellerName}
                    </span>
                    <span className="font-black text-sm text-slate-900 dark:text-white font-mono">
                      LKR {group.subtotal.toLocaleString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Right: Order Summary Sidebar */}
            <div className="lg:col-span-4 sticky top-24 space-y-6">
              <div className="p-6 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-6">
                <h3 className="font-black text-slate-900 dark:text-white text-lg pb-3 border-b border-slate-100 dark:border-slate-800">
                  Order Summary
                </h3>

                <div className="space-y-3 text-xs">
                  <div className="flex justify-between text-slate-600 dark:text-slate-300">
                    <span>Produce Subtotal ({items.length} items)</span>
                    <span className="font-bold font-mono text-slate-900 dark:text-white">
                      LKR {subtotal.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between text-slate-600 dark:text-slate-300">
                    <span>Est. Courier Delivery</span>
                    <span className="font-bold font-mono text-slate-900 dark:text-white">
                      LKR {estimatedDelivery.toLocaleString()}
                    </span>
                  </div>

                  {sellerGroups.length > 1 && (
                    <div className="p-3 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 text-[11px] text-amber-800 dark:text-amber-300 leading-relaxed font-medium">
                      Multi-Farmer Order: Items will be consolidated from {sellerGroups.length} independent farm hubs.
                    </div>
                  )}

                  <div className="flex justify-between text-base font-black text-slate-900 dark:text-white pt-3 border-t border-slate-200 dark:border-slate-700">
                    <span>Grand Total</span>
                    <span className="text-emerald-600 dark:text-emerald-400 text-lg font-mono">
                      LKR {grandTotal.toLocaleString()}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 text-xs">
                  <ShieldCheck className="w-5 h-5 text-emerald-500 shrink-0" />
                  <span className="text-[11px] text-slate-600 dark:text-slate-300 leading-snug">
                    Protected by <strong>Pola Escrow</strong>. Funds are released only after you physically inspect the harvest.
                  </span>
                </div>

                <div className="space-y-2.5">
                  <button
                    type="button"
                    onClick={handleProceedToCheckout}
                    disabled={isCheckingOut || items.length === 0}
                    className="w-full py-4 px-6 rounded-full bg-emerald-500 hover:bg-emerald-400 text-white font-black text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/25 transition-all cursor-pointer disabled:opacity-50"
                  >
                    {isCheckingOut ? (
                      <span className="inline-block animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                    ) : (
                      <>
                        <span>Proceed to Checkout</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => navigate('/')}
                    className="w-full py-3 px-6 rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Continue Shopping</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Delete Single Item Confirmation Dialog */}
      <ConfirmDialog
        isOpen={!!itemToDelete}
        title="Remove Item from Basket?"
        description={
          itemToDelete
            ? `Are you sure you want to remove "${itemToDelete.title}" from your produce basket?`
            : ''
        }
        confirmText="Remove Item"
        cancelText="Keep in Basket"
        isDestructive={true}
        onConfirm={() => {
          if (itemToDelete) {
            removeItem(itemToDelete.productId);
            setItemToDelete(null);
          }
        }}
        onCancel={() => setItemToDelete(null)}
      />

      {/* Clear Whole Cart Confirmation Dialog */}
      <ConfirmDialog
        isOpen={isClearingCart}
        title="Clear Entire Basket?"
        description="Are you sure you want to remove all items from your produce basket? This cannot be undone."
        confirmText="Clear All"
        cancelText="Keep Items"
        isDestructive={true}
        onConfirm={() => {
          clearCart();
          setIsClearingCart(false);
          toast.success('Your basket has been cleared.');
        }}
        onCancel={() => setIsClearingCart(false)}
      />
    </MarketplaceLayout>
  );
};
export default CartPage;
