import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MarketplaceLayout } from '@/components/templates/MarketplaceLayout';
import { OrderService } from '@/services/order.service';
import { AuthService } from '@/services/auth.service';
import { useCartStore } from '@/store/cartStore';
import { useThemeStore } from '@/store/themeStore';
import { useAuthStore } from '@/store/authStore';
import { PROVINCES_DISTRICTS } from '@pola/shared';
import {
  ShieldCheck,
  MapPin,
  CreditCard,
  ArrowRight,
  Package,
  Banknote,
  Wallet,
  CheckCircle2,
  Plus,
  Bookmark,
  Home,
  Building2,
  Trash2,
  Lock,
} from 'lucide-react';
import toast from 'react-hot-toast';

export const CheckoutPage: React.FC = () => {
  const navigate = useNavigate();
  const { items, getSubtotal, clearCart, openCart } = useCartStore();
  const { isDark, toggleTheme, language, setLanguage } = useThemeStore();
  const { user, isAuthenticated, updateUser } = useAuthStore();

  // Saved Addresses list from user profile
  const savedAddresses = user?.addresses || [];
  const [selectedAddressIndex, setSelectedAddressIndex] = useState<number>(
    savedAddresses.length > 0 ? 0 : -1
  );
  const [isAddingNewAddress, setIsAddingNewAddress] = useState(savedAddresses.length === 0);

  // Address Fields
  const [addressLabel, setAddressLabel] = useState('Home');
  const [recipientName, setRecipientName] = useState(user?.fullName || '');
  const [province, setProvince] = useState('Western');
  const [district, setDistrict] = useState('Colombo');
  const [city, setCity] = useState('');
  const [addressLine, setAddressLine] = useState('');
  const [contactPhone, setContactPhone] = useState(user?.phone || '');
  const [customerNotes, setCustomerNotes] = useState('');
  const [saveAddressForFuture, setSaveAddressForFuture] = useState(true);

  // Payment Method State: 'cash_on_delivery' | 'paypal' | 'pola_wallet'
  const [paymentMethod, setPaymentMethod] = useState<'cash_on_delivery' | 'paypal' | 'pola_wallet'>(
    'cash_on_delivery'
  );

  const [isLoading, setIsLoading] = useState(false);

  // Populate from chosen saved address
  useEffect(() => {
    if (selectedAddressIndex >= 0 && savedAddresses[selectedAddressIndex]) {
      const addr = savedAddresses[selectedAddressIndex];
      setAddressLabel(addr.label || 'Saved Address');
      setProvince(addr.province || 'Western');
      setDistrict(addr.district || 'Colombo');
      setCity(addr.city || '');
      setAddressLine(addr.addressLine1 || addr.streetAddress || '');
      setContactPhone(addr.contactPhone || user?.phone || '');
      setIsAddingNewAddress(false);
    }
  }, [selectedAddressIndex, user]);

  const subtotal = getSubtotal();
  const deliveryFee = items.length > 0 ? 450 : 0;
  const totalAmount = subtotal + deliveryFee;

  const handleSelectSaved = (index: number) => {
    setSelectedAddressIndex(index);
    setIsAddingNewAddress(false);
  };

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isAuthenticated) {
      toast.error('Please sign in to place your order');
      navigate('/customer/login');
      return;
    }

    if (items.length === 0) {
      toast.error('Your produce basket is empty');
      navigate('/catalog');
      return;
    }

    if (!addressLine.trim() || !city.trim()) {
      toast.error('Please provide a complete street address and city');
      return;
    }

    try {
      setIsLoading(true);

      const activeDeliveryAddress = {
        label: addressLabel.trim() || 'Home',
        province,
        district,
        city: city.trim(),
        addressLine1: addressLine.trim(),
        contactPhone: contactPhone.trim() || user?.phone || '+94771234567',
      };

      // If user opted to save new address to profile
      if (isAddingNewAddress && saveAddressForFuture) {
        try {
          const updatedList = [
            ...savedAddresses,
            {
              ...activeDeliveryAddress,
              streetAddress: activeDeliveryAddress.addressLine1,
              postalCode: '00300',
              isDefault: savedAddresses.length === 0,
            },
          ];
          await AuthService.updateProfile({ addresses: updatedList });
          updateUser({ addresses: updatedList });
        } catch (profileErr) {
          console.warn('Address sync error:', profileErr);
        }
      }

      const orderPayload = {
        items: items.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
          unitPrice: item.pricePerUnit,
        })),
        deliveryAddress: {
          label: addressLabel.trim() || 'Home',
          province,
          district,
          city: city.trim(),
          addressLine1: addressLine.trim(),
          postalCode: '00300',
          contactPhone: contactPhone.trim() || user?.phone || '+94771234567',
        },
        recipientName: recipientName.trim() || user?.fullName || 'Valued Buyer',
        recipientPhone: contactPhone.trim() || user?.phone || '+94771234567',
        deliveryInstructions: 'morning_8_12',
        customerNotes: customerNotes.trim() || undefined,
        paymentMethod,
      };

      const res: any = await OrderService.checkout(orderPayload);

      if (res.success && res.data?.order) {
        clearCart();
        const orderId = res.data.order._id || res.data.order.id;
        toast.success('Order placed successfully! Funds held securely in Escrow.');
        navigate(`/orders/${orderId}`);
      } else {
        throw new Error(res.message || 'Failed to place order');
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || err.message || 'Checkout failed. Please review your address details.');
    } finally {
      setIsLoading(false);
    }
  };

  const availableDistricts = PROVINCES_DISTRICTS[province] || [];

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
      <div className="max-w-6xl mx-auto space-y-8 pb-16 text-left">
        {/* Header with Dual-Font Typography */}
        <div className="space-y-1.5 pb-4 border-b border-white/10">
          <span className="px-3 py-1 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 inline-flex items-center gap-1.5">
            <Lock className="w-3 h-3 text-emerald-400" />
            256-Bit SSL Escrow Checkout
          </span>
          <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            Order Review &{' '}
            <span className="font-serif-accent italic font-normal text-emerald-400">
              Escrow Protection
            </span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-300">
            Payment is held securely in escrow and released to the farmer only upon physical verification.
          </p>
        </div>

        <form onSubmit={handlePlaceOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Addresses & Payment Selector (7 Columns) */}
          <div className="lg:col-span-7 space-y-6">
            {/* Section 1: Saved Addresses / New Address */}
            <div className="glass-terminal p-6 sm:p-8 rounded-3xl border border-white/10 shadow-2xl space-y-6">
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <div className="flex items-center gap-2 font-black text-white text-base">
                  <div className="p-1.5 rounded-xl bg-emerald-400/20 text-emerald-300">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <span>1. Doorstep Delivery Address</span>
                </div>

                {savedAddresses.length > 0 && (
                  <button
                    type="button"
                    onClick={() => {
                      setIsAddingNewAddress(true);
                      setSelectedAddressIndex(-1);
                      setAddressLabel('Office');
                      setCity('');
                      setAddressLine('');
                    }}
                    className="text-xs font-bold text-emerald-400 hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add New Address
                  </button>
                )}
              </div>

              {/* Saved Address Cards */}
              {savedAddresses.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {savedAddresses.map((addr: any, idx: number) => {
                    const isSelected = selectedAddressIndex === idx && !isAddingNewAddress;
                    return (
                      <div
                        key={idx}
                        onClick={() => handleSelectSaved(idx)}
                        className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between space-y-2 ${
                          isSelected
                            ? 'border-emerald-400 bg-emerald-500/20 shadow-md text-white'
                            : 'border-white/10 bg-white/5 hover:bg-white/10 text-slate-300'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="inline-flex items-center gap-1.5 font-extrabold text-xs text-white">
                            <Bookmark className="w-3.5 h-3.5 text-emerald-400" />
                            {addr.label || `Address #${idx + 1}`}
                          </span>
                          {isSelected && (
                            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                          )}
                        </div>

                        <p className="text-xs text-slate-300 leading-snug">
                          {addr.addressLine1 || addr.streetAddress}
                        </p>
                        <p className="text-[11px] text-slate-400 font-medium font-mono">
                          {addr.city}, {addr.district} District
                        </p>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Form (if adding new address) */}
              {isAddingNewAddress && (
                <div className="space-y-4 pt-2 border-t border-white/10 animate-in fade-in">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-bold text-slate-300 block mb-1">Tag (e.g. Home, Office)</label>
                      <input
                        type="text"
                        placeholder="Home / Office"
                        value={addressLabel}
                        onChange={(e) => setAddressLabel(e.target.value)}
                        className="w-full px-4 py-3 rounded-2xl bg-white/5 border border-white/15 text-white text-xs font-bold focus:outline-none focus:border-emerald-400"
                        required
                      />
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-300 block mb-1">Recipient Name</label>
                      <input
                        type="text"
                        placeholder="Full Legal Name"
                        value={recipientName}
                        onChange={(e) => setRecipientName(e.target.value)}
                        className="w-full px-4 py-3 rounded-2xl bg-white/5 border border-white/15 text-white text-xs font-bold focus:outline-none focus:border-emerald-400"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-bold text-slate-300 block mb-1">Province</label>
                      <select
                        value={province}
                        onChange={(e) => {
                          setProvince(e.target.value);
                          const newDists = PROVINCES_DISTRICTS[e.target.value] || [];
                          if (newDists.length > 0) setDistrict(newDists[0]);
                        }}
                        className="w-full px-4 py-3 rounded-2xl bg-white/5 border border-white/15 text-white text-xs font-bold focus:outline-none focus:border-emerald-400"
                      >
                        {Object.keys(PROVINCES_DISTRICTS).map((p) => (
                          <option key={p} value={p} className="bg-slate-900 text-white">{p} Province</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-300 block mb-1">District</label>
                      <select
                        value={district}
                        onChange={(e) => setDistrict(e.target.value)}
                        className="w-full px-4 py-3 rounded-2xl bg-white/5 border border-white/15 text-white text-xs font-bold focus:outline-none focus:border-emerald-400"
                      >
                        {availableDistricts.map((d) => (
                          <option key={d} value={d} className="bg-slate-900 text-white">{d} District</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-bold text-slate-300 block mb-1">City / Town</label>
                      <input
                        type="text"
                        placeholder="e.g. Nugegoda"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        className="w-full px-4 py-3 rounded-2xl bg-white/5 border border-white/15 text-white text-xs font-bold focus:outline-none focus:border-emerald-400"
                        required
                      />
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-300 block mb-1">Contact Phone</label>
                      <input
                        type="tel"
                        placeholder="077 123 4567"
                        value={contactPhone}
                        onChange={(e) => setContactPhone(e.target.value)}
                        className="w-full px-4 py-3 rounded-2xl bg-white/5 border border-white/15 text-white text-xs font-bold focus:outline-none focus:border-emerald-400 font-mono"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-300 block mb-1">Street Address</label>
                    <input
                      type="text"
                      placeholder="e.g. No. 45, Temple Road"
                      value={addressLine}
                      onChange={(e) => setAddressLine(e.target.value)}
                      className="w-full px-4 py-3 rounded-2xl bg-white/5 border border-white/15 text-white text-xs font-bold focus:outline-none focus:border-emerald-400"
                      required
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Section 2: Payment Selector */}
            <div className="glass-terminal p-6 sm:p-8 rounded-3xl border border-white/10 shadow-2xl space-y-4">
              <div className="flex items-center gap-2 font-black text-white text-base pb-3 border-b border-white/10">
                <div className="p-1.5 rounded-xl bg-emerald-400/20 text-emerald-300">
                  <CreditCard className="w-4 h-4" />
                </div>
                <span>2. Escrow Payment Method</span>
              </div>

              <div className="space-y-3">
                {/* Cash on Delivery Escrow */}
                <div
                  onClick={() => setPaymentMethod('cash_on_delivery')}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                    paymentMethod === 'cash_on_delivery'
                      ? 'border-emerald-400 bg-emerald-500/20 text-white shadow-md'
                      : 'border-white/10 bg-white/5 text-slate-300 hover:bg-white/10'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Banknote className="w-5 h-5 text-emerald-400" />
                    <div>
                      <span className="font-extrabold text-sm block">Cash on Delivery (Escrow Guarantee)</span>
                      <span className="text-[11px] text-slate-400">Pay cash upon delivery after inspecting produce crate</span>
                    </div>
                  </div>
                  {paymentMethod === 'cash_on_delivery' && <CheckCircle2 className="w-5 h-5 text-emerald-400" />}
                </div>

                {/* PayPal Escrow */}
                <div
                  onClick={() => setPaymentMethod('paypal')}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                    paymentMethod === 'paypal'
                      ? 'border-emerald-400 bg-emerald-500/20 text-white shadow-md'
                      : 'border-white/10 bg-white/5 text-slate-300 hover:bg-white/10'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <CreditCard className="w-5 h-5 text-sky-400" />
                    <div>
                      <span className="font-extrabold text-sm block">PayPal International Escrow</span>
                      <span className="text-[11px] text-slate-400">Card & PayPal balance held until OTP verified</span>
                    </div>
                  </div>
                  {paymentMethod === 'paypal' && <CheckCircle2 className="w-5 h-5 text-emerald-400" />}
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Order Summary & Place Order Pill (5 Columns) */}
          <div className="lg:col-span-5 space-y-6">
            <div className="glass-terminal p-6 sm:p-8 rounded-3xl border border-white/10 shadow-2xl space-y-6 sticky top-24">
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <h3 className="font-black text-white text-base">Produce Crate Summary</h3>
                <span className="text-xs text-slate-400 font-bold font-mono">{items.length} items</span>
              </div>

              {/* Items List */}
              <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
                {items.map((item) => (
                  <div key={item.productId} className="flex justify-between items-center text-xs">
                    <div>
                      <span className="font-bold text-white block truncate max-w-[200px]">{item.title}</span>
                      <span className="text-[11px] text-slate-400">{item.quantity} {item.unit || 'kg'} × LKR {item.pricePerUnit}</span>
                    </div>
                    <span className="font-black text-emerald-400 font-mono">
                      LKR {(item.quantity * item.pricePerUnit).toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>

              {/* Cost Breakdown */}
              <div className="pt-4 border-t border-white/10 space-y-2 text-xs">
                <div className="flex justify-between text-slate-300">
                  <span>Harvest Subtotal</span>
                  <span className="font-bold font-mono">LKR {subtotal.toLocaleString()}.00</span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span>Regional Courier Dispatch</span>
                  <span className="font-bold font-mono">LKR {deliveryFee.toLocaleString()}.00</span>
                </div>
                <div className="flex justify-between text-base font-black text-white pt-2 border-t border-white/10">
                  <span>Total Payable</span>
                  <span className="text-emerald-400 text-lg font-mono">LKR {totalAmount.toLocaleString()}.00</span>
                </div>
              </div>

              {/* Place Order Action Button */}
              <button
                type="submit"
                disabled={isLoading || items.length === 0}
                className="w-full py-4 px-6 rounded-full bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-black text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/25 transition-all cursor-pointer disabled:opacity-50"
              >
                {isLoading ? (
                  <span className="inline-block animate-spin w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full" />
                ) : (
                  <>
                    <span>Confirm Order & Lock Escrow</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </MarketplaceLayout>
  );
};
