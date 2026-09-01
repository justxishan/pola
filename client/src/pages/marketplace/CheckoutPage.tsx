import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { MarketplaceLayout } from '@/components/templates/MarketplaceLayout';
import { OrderService } from '@/services/order.service';
import { CartService } from '@/services/cart.service';
import { useCartStore } from '@/store/cartStore';
import { useThemeStore } from '@/store/themeStore';
import { useAuthStore } from '@/store/authStore';
import { AddressDrawer } from '@/components/organisms/AddressDrawer';
import {
  ShieldCheck,
  MapPin,
  CreditCard,
  ArrowRight,
  Package,
  Banknote,
  Wallet,
  CheckCircle2,
  Clock,
  Lock,
  ShoppingBag,
} from 'lucide-react';
import toast from 'react-hot-toast';

export const CheckoutPage: React.FC = () => {
  const navigate = useNavigate();
  const { items, getSubtotal, clearCart, openCart } = useCartStore();
  const { isDark, toggleTheme, language, setLanguage } = useThemeStore();
  const { user, isAuthenticated } = useAuthStore();

  const [isLoading, setIsLoading] = useState(false);
  const [isValidating, setIsValidating] = useState(false);

  // Address State
  const [isAddressDrawerOpen, setIsAddressDrawerOpen] = useState(false);
  const savedAddresses: any[] = user?.addresses || [];
  const defaultAddress = savedAddresses.find((a: any) => a.isDefault) || savedAddresses[0] || null;
  const [activeAddress, setActiveAddress] = useState<any>(defaultAddress);

  // Delivery Slot State
  const [deliveryInstructions, setDeliveryInstructions] = useState('morning_8_12');

  // Payment State
  const [paymentMethod, setPaymentMethod] = useState<'cash_on_delivery' | 'paypal' | 'pola_wallet'>('cash_on_delivery');

  // Validation / pricing from backend
  const [validatedData, setValidatedData] = useState<any>(null);

  // -----------------------------------------------------------------
  // Empty-cart guard — use a ref-tracked "settled" flag so we only
  // redirect after at least one render cycle with confirmed empty state.
  // This prevents the guard from firing on the very first render when
  // the Zustand store is initialising.
  // -----------------------------------------------------------------
  const hasSettled = useRef(false);
  useEffect(() => {
    // Give the store one tick to settle after navigation
    const timer = setTimeout(() => {
      hasSettled.current = true;
      if (items.length === 0) {
        toast.error('Your produce basket is empty. Add items first.');
        navigate('/catalog');
      }
    }, 300);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run on initial mount

  // If cart is cleared AFTER checkout page is already settled (e.g. on submit), also guard
  useEffect(() => {
    if (hasSettled.current && items.length === 0) {
      navigate('/catalog');
    }
  }, [items.length, navigate]);

  // -----------------------------------------------------------------
  // Backend price validation — only call for authenticated users and
  // only when we have real items to validate.
  // -----------------------------------------------------------------
  const validateCartWithBackend = async () => {
    if (items.length === 0) return;
    try {
      setIsValidating(true);
      const payload = items.map((i) => ({ productId: i.productId, quantity: i.quantity }));
      const res: any = await CartService.validateCart(payload, activeAddress?.district);
      if (res?.success && res?.data?.calculation) {
        setValidatedData(res.data.calculation);
      }
    } catch (err: any) {
      // Validation failure (e.g. out-of-stock product) — show message but don't clear cart
      const msg = err?.message;
      if (msg && !msg.toLowerCase().includes('401') && !msg.toLowerCase().includes('unauthorized')) {
        toast.error(msg);
      }
    } finally {
      setIsValidating(false);
    }
  };

  // Run validation once items are confirmed present
  useEffect(() => {
    if (items.length > 0) {
      validateCartWithBackend();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeAddress]); // Re-validate when address changes (affects delivery fee)

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isAuthenticated) {
      navigate('/customer/login?redirect=/checkout');
      return;
    }

    if (items.length === 0) {
      toast.error('Your basket is empty');
      return;
    }

    if (!activeAddress) {
      toast.error('Please add a delivery address');
      setIsAddressDrawerOpen(true);
      return;
    }

    try {
      setIsLoading(true);

      const orderPayload = {
        items: items.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
          unitPrice: item.pricePerUnit,
        })),
        deliveryAddress: {
          label: activeAddress.label || 'Home',
          province: activeAddress.province,
          district: activeAddress.district,
          city: activeAddress.city,
          addressLine1: activeAddress.addressLine1 || activeAddress.streetAddress || '',
          postalCode: activeAddress.postalCode || '00300',
          contactPhone: activeAddress.contactPhone || user?.phone || '+94771234567',
        },
        recipientName: user?.fullName || 'Valued Buyer',
        recipientPhone: activeAddress.contactPhone || user?.phone || '+94771234567',
        deliveryInstructions,
        paymentMethod,
      };

      const res: any = await OrderService.checkout(orderPayload);

      if (res.success && res.data?.order) {
        clearCart();
        const orderId = res.data.order._id || res.data.order.id;
        toast.success('Order placed! Funds held securely in Escrow.');
        navigate(`/orders/${orderId}/track`);
      } else {
        throw new Error(res.message || 'Failed to place order');
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || err.message || 'Checkout failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const subtotal = validatedData?.itemsTotal ?? getSubtotal();
  const deliveryFee = validatedData?.totalDeliveryFee ?? (items.length > 0 ? 450 : 0);
  const totalAmount = validatedData?.grandTotal ?? (subtotal + deliveryFee);

  const renderSlotCard = (id: string, title: string, time: string) => {
    const isSelected = deliveryInstructions === id;
    return (
      <div
        onClick={() => setDeliveryInstructions(id)}
        className={`p-3 rounded-xl border transition-all cursor-pointer flex flex-col items-center justify-center text-center gap-1 ${
          isSelected
            ? 'border-emerald-400 bg-emerald-50 dark:bg-emerald-500/20 text-slate-900 dark:text-white shadow-xs'
            : 'border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-white/10'
        }`}
      >
        <Clock className={`w-4 h-4 ${isSelected ? 'text-emerald-500' : ''}`} />
        <span className="font-bold text-xs block">{title}</span>
        <span className="text-[10px]">{time}</span>
      </div>
    );
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
      <div className="max-w-6xl mx-auto space-y-8 pb-16">
        {/* Header */}
        <div className="space-y-1.5 pb-4 border-b border-slate-200 dark:border-white/10">
          <span className="px-3 py-1 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-400/30 inline-flex items-center gap-1.5">
            <Lock className="w-3 h-3" />
            256-Bit SSL Escrow Checkout
          </span>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
            Order Review &{' '}
            <span className="font-serif-accent italic font-normal text-emerald-600 dark:text-emerald-400">
              Escrow Protection
            </span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-300">
            Payment is held securely in escrow and released to the farmer only upon physical verification.
          </p>
        </div>

        {/* If cart is empty on initial render, show inline placeholder (fallback) */}
        {items.length === 0 ? (
          <div className="py-24 flex flex-col items-center justify-center text-center space-y-4">
            <ShoppingBag className="w-12 h-12 text-slate-300 dark:text-slate-700" />
            <p className="text-base font-bold text-slate-500 dark:text-slate-400">Your produce basket is empty</p>
            <button
              onClick={() => navigate('/catalog')}
              className="px-6 py-3 rounded-full bg-emerald-500 hover:bg-emerald-400 text-white font-bold text-sm transition-all cursor-pointer"
            >
              Browse Marketplace
            </button>
          </div>
        ) : (
          <form onSubmit={handlePlaceOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left Column */}
            <div className="lg:col-span-7 space-y-6">
              {/* 1. Address */}
              <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-white/10 shadow-sm space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-white/10">
                  <div className="flex items-center gap-2 font-black text-slate-900 dark:text-white text-base">
                    <div className="p-1.5 rounded-xl bg-emerald-100 dark:bg-emerald-400/20 text-emerald-600 dark:text-emerald-300">
                      <MapPin className="w-4 h-4" />
                    </div>
                    <span>1. Doorstep Delivery Address</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsAddressDrawerOpen(true)}
                    className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer"
                  >
                    {activeAddress ? 'Change' : 'Add Address'}
                  </button>
                </div>

                {activeAddress ? (
                  <div className="p-4 rounded-2xl border border-emerald-300 dark:border-emerald-500 bg-emerald-50 dark:bg-emerald-500/10 flex flex-col space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-sm text-emerald-900 dark:text-white">
                        {activeAddress.label || 'Home'}
                      </span>
                      <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    </div>
                    <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                      {activeAddress.addressLine1 || activeAddress.streetAddress}, {activeAddress.city}
                    </p>
                    <p className="text-[11px] font-mono text-slate-500 dark:text-slate-400">
                      {activeAddress.district} District, {activeAddress.province} Province
                    </p>
                  </div>
                ) : (
                  <div
                    onClick={() => setIsAddressDrawerOpen(true)}
                    className="p-6 rounded-2xl border-2 border-dashed border-slate-300 dark:border-white/20 text-center cursor-pointer hover:bg-slate-50 dark:hover:bg-white/5 transition-colors"
                  >
                    <MapPin className="w-6 h-6 mx-auto mb-2 text-slate-400" />
                    <span className="text-xs font-bold text-slate-600 dark:text-slate-300">
                      Tap to add delivery address
                    </span>
                  </div>
                )}
              </div>

              {/* 2. Delivery Slot */}
              <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-white/10 shadow-sm space-y-4">
                <div className="flex items-center gap-2 font-black text-slate-900 dark:text-white text-base pb-3 border-b border-slate-100 dark:border-white/10">
                  <div className="p-1.5 rounded-xl bg-emerald-100 dark:bg-emerald-400/20 text-emerald-600 dark:text-emerald-300">
                    <Package className="w-4 h-4" />
                  </div>
                  <span>2. Delivery Preferences</span>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  {renderSlotCard('morning_8_12', 'Morning', '8 AM – 12 PM')}
                  {renderSlotCard('afternoon_12_4', 'Afternoon', '12 PM – 4 PM')}
                  {renderSlotCard('evening_4_8', 'Evening', '4 PM – 8 PM')}
                </div>
              </div>

              {/* 3. Payment */}
              <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-white/10 shadow-sm space-y-4">
                <div className="flex items-center gap-2 font-black text-slate-900 dark:text-white text-base pb-3 border-b border-slate-100 dark:border-white/10">
                  <div className="p-1.5 rounded-xl bg-emerald-100 dark:bg-emerald-400/20 text-emerald-600 dark:text-emerald-300">
                    <CreditCard className="w-4 h-4" />
                  </div>
                  <span>3. Escrow Payment Method</span>
                </div>

                <div className="space-y-3">
                  {[
                    {
                      id: 'cash_on_delivery' as const,
                      icon: <Banknote className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />,
                      label: 'Cash on Delivery (Escrow Guarantee)',
                      sub: 'Pay cash upon delivery after inspecting produce',
                    },
                    {
                      id: 'pola_wallet' as const,
                      icon: <Wallet className="w-5 h-5 text-indigo-500 dark:text-indigo-400" />,
                      label: 'Pola LankaPay Wallet',
                      sub: 'Instant local bank transfer via LankaPay',
                    },
                    {
                      id: 'paypal' as const,
                      icon: <CreditCard className="w-5 h-5 text-sky-500 dark:text-sky-400" />,
                      label: 'PayPal International Escrow',
                      sub: 'Card balance held until OTP verified',
                    },
                  ].map(({ id, icon, label, sub }) => (
                    <div
                      key={id}
                      onClick={() => setPaymentMethod(id)}
                      className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                        paymentMethod === id
                          ? 'border-emerald-400 bg-emerald-50 dark:bg-emerald-500/20 shadow-xs'
                          : 'border-slate-200 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-white/5'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        {icon}
                        <div>
                          <span className="font-extrabold text-sm block text-slate-900 dark:text-white">{label}</span>
                          <span className="text-[11px] text-slate-500 dark:text-slate-400">{sub}</span>
                        </div>
                      </div>
                      {paymentMethod === id && <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Column: Order Summary */}
            <div className="lg:col-span-5">
              <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-white/10 shadow-sm space-y-6 sticky top-24">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-white/10">
                  <h3 className="font-black text-slate-900 dark:text-white text-base">Produce Crate Summary</h3>
                  <span className="text-xs text-slate-500 dark:text-slate-400 font-bold font-mono">
                    {items.length} item{items.length !== 1 ? 's' : ''}
                  </span>
                </div>

                {/* Items List */}
                <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
                  {items.map((item) => (
                    <div key={item.productId} className="flex justify-between items-start text-xs gap-2">
                      <div className="min-w-0">
                        <span className="font-bold text-slate-900 dark:text-white block truncate">{item.title}</span>
                        <span className="text-[11px] text-slate-500 dark:text-slate-400">
                          {item.quantity} {item.unit || 'kg'} × LKR {item.pricePerUnit?.toLocaleString()}
                        </span>
                      </div>
                      <span className="font-black text-emerald-600 dark:text-emerald-400 font-mono shrink-0">
                        LKR {(item.quantity * item.pricePerUnit).toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Cost Breakdown */}
                <div className="pt-4 border-t border-slate-100 dark:border-white/10 space-y-2 text-xs">
                  <div className="flex justify-between text-slate-600 dark:text-slate-300">
                    <span>Harvest Subtotal</span>
                    <span className="font-bold font-mono text-slate-900 dark:text-white">
                      LKR {subtotal.toLocaleString()}.00
                    </span>
                  </div>
                  <div className="flex justify-between text-slate-600 dark:text-slate-300 items-center">
                    <span>Regional Courier Dispatch</span>
                    {isValidating ? (
                      <span className="inline-block animate-pulse h-3 w-16 bg-slate-200 dark:bg-slate-700 rounded-full" />
                    ) : (
                      <span className="font-bold font-mono text-slate-900 dark:text-white">
                        LKR {deliveryFee.toLocaleString()}.00
                      </span>
                    )}
                  </div>
                  <div className="flex justify-between text-base font-black text-slate-900 dark:text-white pt-2 border-t border-slate-100 dark:border-white/10">
                    <span>Total Payable</span>
                    {isValidating ? (
                      <span className="inline-block animate-pulse h-5 w-24 bg-slate-200 dark:bg-slate-700 rounded-full" />
                    ) : (
                      <span className="text-emerald-600 dark:text-emerald-400 text-lg font-mono">
                        LKR {totalAmount.toLocaleString()}.00
                      </span>
                    )}
                  </div>
                </div>

                {/* Place Order Button */}
                <button
                  type="submit"
                  disabled={isLoading || items.length === 0}
                  className="w-full py-4 px-6 rounded-full bg-emerald-500 hover:bg-emerald-400 dark:bg-emerald-400 dark:hover:bg-emerald-300 text-white dark:text-slate-950 font-black text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/25 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <span className="inline-block animate-spin w-4 h-4 border-2 border-current border-t-transparent rounded-full" />
                  ) : (
                    <>
                      <span>
                        {!isAuthenticated ? 'Sign In to Confirm Order' : 'Confirm Order & Lock Escrow'}
                      </span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>

                {!isAuthenticated && (
                  <p className="text-[11px] text-center text-slate-500 dark:text-slate-400">
                    You'll be asked to sign in. Your basket will be saved.
                  </p>
                )}
              </div>
            </div>
          </form>
        )}
      </div>

      <AddressDrawer
        isOpen={isAddressDrawerOpen}
        onClose={() => setIsAddressDrawerOpen(false)}
        onSelectAddress={(addr) => {
          setActiveAddress(addr);
          setIsAddressDrawerOpen(false);
        }}
      />
    </MarketplaceLayout>
  );
};
