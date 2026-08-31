import React from 'react';
import { cn } from '@/lib/cn';
import { Button } from '@/components/atoms/Button';
import { QuantityStepper } from '@/components/molecules/QuantityStepper';
import { X, Trash2, ShoppingBag, ArrowRight, ShieldCheck } from 'lucide-react';

export interface CartItem {
  productId: string;
  title: string;
  pricePerUnit: number;
  unit: string;
  quantity: number;
  image?: string;
  farmerName?: string;
  minOrderQuantity?: number;
}

export interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  onUpdateQuantity: (productId: string, qty: number) => void;
  onRemoveItem: (productId: string) => void;
  onCheckout: () => void;
  subtotalLkr: number;
  deliveryFeeLkr?: number;
  className?: string;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  items,
  onUpdateQuantity,
  onRemoveItem,
  onCheckout,
  subtotalLkr,
  deliveryFeeLkr = 350,
  className,
}) => {
  if (!isOpen) return null;

  const total = subtotalLkr + (items.length > 0 ? deliveryFeeLkr : 0);

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
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-300 flex items-center justify-center">
                <ShoppingBag className="w-4 h-4" />
              </div>
              <h3 className="font-bold text-base text-slate-900 dark:text-slate-100">
                Your Produce Basket ({items.length})
              </h3>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {items.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center space-y-3 text-slate-400">
                <ShoppingBag className="w-12 h-12 text-slate-300" />
                <p className="text-sm font-medium">Your basket is empty</p>
                <p className="text-xs max-w-xs">
                  Browse the marketplace catalog to discover fresh harvest from local farms.
                </p>
              </div>
            ) : (
              items.map((item) => (
                <div
                  key={item.productId}
                  className="p-3.5 rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 flex items-center gap-3.5"
                >
                  {item.image && (
                    <img
                      src={item.image}
                      alt={item.title}
                      className="w-14 h-14 rounded-xl object-cover shrink-0"
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
                      min={item.minOrderQuantity || 1}
                      unit={item.unit}
                      onChange={(qty) => onUpdateQuantity(item.productId, qty)}
                    />
                  </div>

                  <div className="text-right space-y-2 flex flex-col items-end justify-between self-stretch">
                    <button
                      onClick={() => onRemoveItem(item.productId)}
                      className="text-slate-400 hover:text-rose-500 p-1 transition-colors"
                      aria-label="Remove item"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <span className="text-xs font-bold text-slate-900 dark:text-slate-100">
                      LKR {(item.pricePerUnit * item.quantity).toLocaleString()}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          {items.length > 0 && (
            <div className="p-5 border-t border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/80 space-y-4">
              <div className="space-y-1.5 text-xs text-slate-500 dark:text-slate-400">
                <div className="flex justify-between">
                  <span>Produce Subtotal</span>
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

              <div className="flex items-center gap-1.5 text-[11px] text-slate-500 justify-center">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>Protected by Pola Escrow until delivery</span>
              </div>

              <Button
                variant="primary"
                size="lg"
                onClick={onCheckout}
                className="w-full"
                rightIcon={<ArrowRight className="w-4 h-4" />}
              >
                Proceed to Checkout
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
