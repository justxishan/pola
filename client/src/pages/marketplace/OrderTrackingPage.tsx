import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MarketplaceLayout } from '@/components/templates/MarketplaceLayout';
import { OrderTimeline } from '@/components/organisms/OrderTimeline';
import { StatusPill } from '@/components/molecules/StatusPill';
import { Button } from '@/components/atoms/Button';
import { Spinner } from '@/components/atoms/Spinner';
import { OrderService } from '@/services/order.service';
import { useCartStore } from '@/store/cartStore';
import { useThemeStore } from '@/store/themeStore';
import { useAuthStore } from '@/store/authStore';
import { FileText, Key, MapPin, Package, ShieldCheck, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';

export const OrderTrackingPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [order, setOrder] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  const { items, openCart } = useCartStore();
  const { isDark, toggleTheme, language, setLanguage } = useThemeStore();
  const { user } = useAuthStore();

  useEffect(() => {
    if (id) fetchOrder(id);
  }, [id]);

  const fetchOrder = async (orderId: string) => {
    try {
      setIsLoading(true);
      const res: any = await OrderService.getOrderById(orderId);
      if (res.success && res.data) {
        setOrder(res.data.order);
      }
    } catch (err: any) {
      toast.error('Failed to load order tracking details');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center space-y-4">
        <p className="text-sm font-semibold">Order not found</p>
        <Button onClick={() => navigate('/catalog')}>Back to Marketplace</Button>
      </div>
    );
  }

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
      <div className="max-w-4xl mx-auto space-y-8 pb-16">
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigate('/customer/orders')}
            className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>My Orders</span>
          </button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => OrderService.downloadInvoicePdf(order._id)}
            leftIcon={<FileText className="w-4 h-4" />}
          >
            Download Invoice PDF
          </Button>
        </div>

        {/* Order Header Card */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-extrabold text-slate-900 dark:text-slate-100">
                Order #{order.orderNumber}
              </h2>
              <StatusPill status={order.status} size="sm" />
            </div>
            <p className="text-xs text-slate-400">
              Placed on {new Date(order.createdAt).toLocaleString()}
            </p>
          </div>

          {/* 6-Digit Handover OTP Card */}
          {order.handoverOtp && order.status !== 'completed' && order.status !== 'cancelled' && (
            <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center">
                <Key className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-emerald-800 dark:text-emerald-300 block">
                  Delivery Handover OTP
                </span>
                <span className="font-mono text-xl font-black text-emerald-900 dark:text-emerald-100 tracking-widest">
                  {order.handoverOtp}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* 10-Stage Visual Logistics Timeline */}
        <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
          <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">
            Live Farm-to-Doorstep Tracking
          </h3>
          <OrderTimeline currentStatus={order.status} />
        </div>

        {/* Order Details & Summary */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Produce Items */}
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
            <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Package className="w-4 h-4 text-emerald-600" />
              <span>Items in this Order ({order.items?.length || 0})</span>
            </h4>

            <div className="space-y-3 divide-y divide-slate-100 dark:divide-slate-800 text-xs">
              {order.items?.map((item: any, idx: number) => (
                <div key={idx} className="pt-3 flex justify-between items-center">
                  <div>
                    <p className="font-semibold text-slate-800 dark:text-slate-200">
                      {item.productTitle}
                    </p>
                    <p className="text-slate-400">
                      {item.orderedQuantity} {item.unit} × LKR {item.pricePerUnit}
                    </p>
                  </div>
                  <span className="font-bold text-slate-900 dark:text-slate-100">
                    LKR {(item.orderedQuantity * item.pricePerUnit).toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Delivery & Financial Summary */}
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
            <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-sky-600" />
              <span>Delivery Destination & Payment</span>
            </h4>

            <div className="space-y-2 text-xs text-slate-600 dark:text-slate-300">
              <p className="font-semibold text-slate-900 dark:text-slate-100">
                {order.deliveryAddress?.addressLine1}
              </p>
              <p>
                {order.deliveryAddress?.city}, {order.deliveryAddress?.district} District
              </p>
              <p className="text-slate-400 font-mono">Contact: {order.deliveryAddress?.contactPhone}</p>
            </div>

            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-1.5 text-xs text-slate-500">
              <div className="flex justify-between">
                <span>Produce Subtotal</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  LKR {order.feeBreakdown?.produceSubtotalLkr?.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Delivery Logistics Fee</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  LKR {order.feeBreakdown?.deliveryFeeTotalLkr?.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between text-base font-bold text-slate-900 dark:text-slate-100 pt-2 border-t border-slate-200 dark:border-slate-700">
                <span>Total Paid</span>
                <span className="text-emerald-600 dark:text-emerald-400">
                  LKR {order.totalAmountLkr?.toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MarketplaceLayout>
  );
};
