import React, { useState } from 'react';
import { cn } from '@/lib/cn';
import { Button } from '@/components/atoms/Button';
import { QuantityStepper } from '@/components/molecules/QuantityStepper';
import { ConfirmDialog } from '@/components/molecules/ConfirmDialog';
import {
  X,
  Trash2,
  ShoppingCart,
  ArrowRight,
  ShieldCheck,
  Heart,
  AlertTriangle,
  Store,
  Sparkles,
  ExternalLink,
} from 'lucide-react';
import { CartItem, StockIssue } from '@/store/cartStore';

export interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  stockIssues?: StockIssue[];
  onUpdateQuantity: (productId: string, qty: number) => void;
  onRemoveItem: (productId: string) => void;
  onMoveToWishlist?: (productId: string) => void;
  onCheckout: () => void;
  onViewCart?: () => void;
  subtotalLkr: number;
  deliveryFeeLkr?: number;
  className?: string;
}

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

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  items,
  stockIssues = [],
  onUpdateQuantity,
  onRemoveItem,
  onMoveToWishlist,
  onCheckout,
  onViewCart,
  subtotalLkr,
  deliveryFeeLkr = 350,
  className,
}) => {
  const [itemToDelete, setItemToDelete] = useState<CartItem | null>(null);

  if (!isOpen) return null;

  const total = subtotalLkr + (items.length > 0 ? deliveryFeeLkr : 0);
  const sellerGroups = groupItemsBySeller(items);
  const issuesMap = new Map<string, StockIssue>(
    stockIssues.map((issue) => [issue.productId, issue])
  );

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-xs transition-opacity animate-in fade-in"
        onClick={onClose}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div
          className={cn(
            'w-screen max-w-md bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col justify-between animate-in slide-in-from-right duration-300',
            className
          )}
        >
          {/* Header */}
          <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-300 flex items-center justify-center">
                <ShoppingCart className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-bold text-base text-slate-900 dark:text-slate-100 leading-tight">
                  Produce Basket
                </h3>
                <span className="text-[11px] text-slate-400 font-medium">
                  {items.length} item{items.length !== 1 ? 's' : ''} across {sellerGroups.length} farm{sellerGroups.length !== 1 ? 's' : ''}
                </span>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto p-5 space-y-6">
            {items.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center space-y-3 text-slate-400 py-16">
                <ShoppingCart className="w-12 h-12 text-slate-300 dark:text-slate-600" />
                <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">Your basket is empty</p>
                <p className="text-xs max-w-xs text-slate-400">
                  Browse fresh harvests from local farmers across Sri Lanka and add produce directly to your basket.
                </p>
              </div>
            ) : (
              sellerGroups.map((group) => (
                <div
                  key={group.sellerId}
                  className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 overflow-hidden"
                >
                  {/* Seller Header */}
                  <div className="px-3.5 py-2.5 bg-slate-100/70 dark:bg-slate-800/80 border-b border-slate-200/70 dark:border-slate-700/60 flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <Store className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                      <span className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate max-w-[200px]">
                        {group.sellerName}
                      </span>
                    </div>
                    <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400">
                      {group.items.length} item{group.items.length > 1 ? 's' : ''}
                    </span>
                  </div>

                  {/* Items in this Seller Group */}
                  <div className="p-3 space-y-3 divide-y divide-slate-100 dark:divide-slate-800/50">
                    {group.items.map((item, idx) => {
                      const stockIssue = issuesMap.get(item.productId);
                      const bulkNudge = getBulkNudge(item);

                      return (
                        <div key={item.productId} className={cn('space-y-2', idx > 0 && 'pt-3')}>
                          {/* Stock Warning Alert if any */}
                          {stockIssue && (
                            <div className="px-2.5 py-1.5 rounded-lg bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300 text-[11px] flex items-center gap-1.5">
                              <AlertTriangle className="w-3.5 h-3.5 shrink-0 text-amber-600 dark:text-amber-400" />
                              <span className="font-medium flex-1">{stockIssue.message}</span>
                            </div>
                          )}

                          <div className="flex items-center gap-3">
                            {item.image && (
                              <img
                                src={item.image}
                                alt={item.title}
                                className="w-13 h-13 rounded-xl object-cover shrink-0 border border-slate-150 dark:border-slate-700"
                              />
                            )}

                            <div className="flex-1 min-w-0 space-y-1">
                              <h5 className="font-semibold text-xs text-slate-900 dark:text-slate-100 truncate">
                                {item.title}
                              </h5>
                              <p className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                                LKR {item.pricePerUnit.toLocaleString()}/{item.unit}
                              </p>

                              <QuantityStepper
                                value={item.quantity}
                                min={item.minOrderQuantity || (['kg', 'g', 'l', 'ml'].includes((item.unit || '').toLowerCase()) ? 0.5 : 1)}
                                max={item.maxOrderQuantity && item.maxOrderQuantity > 0 ? item.maxOrderQuantity : 99999}
                                step={['kg', 'g', 'l', 'ml'].includes((item.unit || '').toLowerCase()) ? 0.5 : 1}
                                unit={item.unit}
                                onChange={(qty) => onUpdateQuantity(item.productId, qty)}
                              />
                            </div>

                            <div className="text-right space-y-2 flex flex-col items-end justify-between self-stretch">
                              <div className="flex items-center gap-1">
                                {onMoveToWishlist && (
                                  <button
                                    onClick={() => onMoveToWishlist(item.productId)}
                                    className="text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 p-1 transition-colors"
                                    aria-label="Save to Wishlist"
                                    title="Move to Wishlist"
                                  >
                                    <Heart className="w-3.5 h-3.5" />
                                  </button>
                                )}
                                <button
                                  onClick={() => setItemToDelete(item)}
                                  className="text-slate-400 hover:text-rose-500 p-1 transition-colors"
                                  aria-label="Remove item"
                                  title="Remove item"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                              <span className="text-xs font-bold text-slate-900 dark:text-slate-100">
                                LKR {(item.pricePerUnit * item.quantity).toLocaleString()}
                              </span>
                            </div>
                          </div>

                          {/* Bulk Pricing Nudge */}
                          {bulkNudge && (
                            <div className="text-[11px] px-2 py-1 rounded-md bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 font-medium flex items-center gap-1">
                              <Sparkles className="w-3 h-3 shrink-0 text-emerald-600 dark:text-emerald-400" />
                              <span>{bulkNudge}</span>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* Seller Subtotal */}
                  <div className="px-3.5 py-2 bg-slate-100/40 dark:bg-slate-800/40 border-t border-slate-100 dark:border-slate-800 flex justify-between text-[11px]">
                    <span className="text-slate-500 dark:text-slate-400">Seller Subtotal</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">
                      LKR {group.subtotal.toLocaleString()}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          {items.length > 0 && (
            <div className="p-5 border-t border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/80 space-y-3.5">
              <div className="space-y-1.5 text-xs text-slate-500 dark:text-slate-400">
                <div className="flex justify-between">
                  <span>Produce Subtotal ({items.length} items)</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">
                    LKR {subtotalLkr.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Est. Hub & Courier Delivery</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">
                    LKR {deliveryFeeLkr.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between text-sm font-bold text-slate-900 dark:text-slate-100 pt-2 border-t border-slate-200 dark:border-slate-700">
                  <span>Total Amount</span>
                  <span className="text-emerald-600 dark:text-emerald-400">
                    LKR {total.toLocaleString()}
                  </span>
                </div>
              </div>

              {sellerGroups.length > 1 && (
                <p className="text-[11px] text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/30 p-2 rounded-lg text-center font-medium">
                  Produce will be consolidated from {sellerGroups.length} independent farm hubs.
                </p>
              )}

              <div className="flex items-center gap-1.5 text-[11px] text-slate-500 justify-center">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>Protected by Pola Escrow until delivery</span>
              </div>

              <div className="space-y-2">
                <Button
                  variant="primary"
                  size="lg"
                  onClick={onCheckout}
                  className="w-full"
                  rightIcon={<ArrowRight className="w-4 h-4" />}
                >
                  Proceed to Checkout
                </Button>

                {onViewCart && (
                  <Button
                    variant="outline"
                    size="md"
                    onClick={onViewCart}
                    className="w-full text-xs font-semibold"
                    rightIcon={<ExternalLink className="w-3.5 h-3.5" />}
                  >
                    View Full Basket Details
                  </Button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Item Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={!!itemToDelete}
        title="Remove Item from Basket?"
        description={
          itemToDelete
            ? `Are you sure you want to remove ${itemToDelete.title} from your produce basket?`
            : ''
        }
        confirmText="Remove Item"
        cancelText="Keep in Basket"
        isDestructive={true}
        onConfirm={() => {
          if (itemToDelete) {
            onRemoveItem(itemToDelete.productId);
            setItemToDelete(null);
          }
        }}
        onCancel={() => setItemToDelete(null)}
      />
    </div>
  );
};
