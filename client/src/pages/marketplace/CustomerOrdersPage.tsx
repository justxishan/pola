import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MarketplaceLayout } from '@/components/templates/MarketplaceLayout';
import { StatusPill } from '@/components/molecules/StatusPill';
import { Badge } from '@/components/atoms/Badge';
import { Button } from '@/components/atoms/Button';
import { EmptyState } from '@/components/molecules/EmptyState';
import { Spinner } from '@/components/atoms/Spinner';
import { RatingModal } from '@/components/organisms/RatingModal';
import { DisputeModal } from '@/components/organisms/DisputeModal';
import { ConfirmDialog } from '@/components/molecules/ConfirmDialog';
import { OrderService } from '@/services/order.service';
import { useCartStore } from '@/store/cartStore';
import { useThemeStore } from '@/store/themeStore';
import { useAuthStore } from '@/store/authStore';
import { useTranslation } from '@/lib/i18n';
import {
  ShoppingCart,
  Package,
  Clock,
  Star,
  AlertTriangle,
  FileText,
  Truck,
  ArrowRight,
  XCircle,
  Key,
  RotateCcw,
} from 'lucide-react';
import toast from 'react-hot-toast';

export type OrderFilterTab = 'all' | 'to_pay' | 'to_deliver' | 'completed' | 'cancelled';

export const CustomerOrdersPage: React.FC = () => {
  const navigate = useNavigate();
  const { items, openCart } = useCartStore();
  const { isDark, toggleTheme, language, setLanguage } = useThemeStore();
  const { user } = useAuthStore();
  const { t } = useTranslation();

  const [orders, setOrders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<OrderFilterTab>('all');

  // Modal States
  const [ratingOrder, setRatingOrder] = useState<any | null>(null);
  const [disputeOrder, setDisputeOrder] = useState<any | null>(null);
  const [cancelOrderTarget, setCancelOrderTarget] = useState<any | null>(null);
  const [isCancelling, setIsCancelling] = useState(false);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setIsLoading(true);
      const res: any = await OrderService.getCustomerOrders();
      if (res.success && res.data) {
        setOrders(res.data.orders || []);
      }
    } catch (err: any) {
      console.error('Failed to load customer orders:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownloadInvoice = (orderId: string) => {
    OrderService.downloadInvoice(orderId);
  };

  const handleConfirmCancel = async () => {
    if (!cancelOrderTarget) return;
    try {
      setIsCancelling(true);
      const res: any = await OrderService.cancelOrder(cancelOrderTarget._id, 'Customer requested cancellation');
      if (res.success) {
        toast.success('Order has been cancelled and stock returned');
        setCancelOrderTarget(null);
        fetchOrders();
      } else {
        throw new Error(res.message || 'Failed to cancel order');
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to cancel order');
    } finally {
      setIsCancelling(false);
    }
  };

  const isToDeliver = (s: string) =>
    [
      'payment_confirmed',
      'awaiting_hub_collection',
      'collected_at_hub',
      'in_transit_to_dc',
      'received_at_dc',
      'assigned_for_delivery',
      'out_for_delivery',
    ].includes(s);

  const isCompleted = (s: string) => s === 'delivered' || s === 'completed';
  const isCancelledStatus = (s: string) => s === 'cancelled' || s === 'refunded' || s === 'returned';

  const counts = {
    all: orders.length,
    to_pay: orders.filter((o) => o.status === 'placed').length,
    to_deliver: orders.filter((o) => isToDeliver(o.status)).length,
    completed: orders.filter((o) => isCompleted(o.status)).length,
    cancelled: orders.filter((o) => isCancelledStatus(o.status)).length,
  };

  const filteredOrders = orders.filter((o) => {
    if (activeTab === 'all') return true;
    if (activeTab === 'to_pay') return o.status === 'placed';
    if (activeTab === 'to_deliver') return isToDeliver(o.status);
    if (activeTab === 'completed') return isCompleted(o.status);
    if (activeTab === 'cancelled') return isCancelledStatus(o.status);
    return true;
  });

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
      <div className="max-w-4xl mx-auto space-y-6 pb-12">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-slate-900 dark:text-slate-100">
              My Purchase Orders ({orders.length})
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Track farm collection status, live driver delivery, escrow releases, and tax invoices
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/')}
          >
            Explore Fresh Harvest
          </Button>
        </div>

        {/* Status Filter Tabs */}
        {orders.length > 0 && (
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-xs font-bold">
            {(
              [
                { id: 'all', label: 'All Orders', count: counts.all },
                { id: 'to_pay', label: 'To Pay', count: counts.to_pay },
                { id: 'to_deliver', label: 'To Deliver', count: counts.to_deliver },
                { id: 'completed', label: 'Completed', count: counts.completed },
                { id: 'cancelled', label: 'Cancelled', count: counts.cancelled },
              ] as const
            ).map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-4 py-2 rounded-full transition-all flex items-center gap-2 shrink-0 cursor-pointer ${
                    isActive
                      ? 'bg-emerald-400 text-slate-950 font-black shadow-md'
                      : 'bg-white/80 dark:bg-slate-900/80 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200/80 dark:border-slate-800'
                  }`}
                >
                  <span>{tab.label}</span>
                  <span
                    className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                      isActive
                        ? 'bg-slate-950 text-emerald-400'
                        : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    {tab.count}
                  </span>
                </button>
              );
            })}
          </div>
        )}

        {isLoading ? (
          <div className="py-20 flex justify-center">
            <Spinner size="lg" />
          </div>
        ) : orders.length === 0 ? (
          <EmptyState
            title="No Orders Placed Yet"
            description="Explore verified agricultural harvest listings directly from farmers across Sri Lanka."
            actionText="Start Shopping Fresh Harvest"
            onAction={() => navigate('/')}
          />
        ) : filteredOrders.length === 0 ? (
          <EmptyState
            title="No Orders in this Status"
            description="You don't have any purchase orders under the selected fulfillment tab."
            actionText="View All Orders"
            onAction={() => setActiveTab('all')}
          />
        ) : (
          <div className="space-y-4">
            {filteredOrders.map((order) => {
              const totalLkr = order.grandTotal || order.itemsTotal || 0;
              const canCancel = isCancelable(order.status);
              const isCancelled = isCancelledStatus(order.status);

              return (
                <div
                  key={order._id}
                  className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4"
                >
                  <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-3">
                      <span className="font-mono font-bold text-sm text-slate-900 dark:text-slate-100">
                        {order.orderNumber || `#POL-${order._id.substring(order._id.length - 6).toUpperCase()}`}
                      </span>
                      <span className="text-xs text-slate-400">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      <StatusPill status={order.status} size="sm" />
                      <span className="font-black text-sm text-emerald-600 dark:text-emerald-400 font-mono">
                        LKR {totalLkr.toLocaleString()}.00
                      </span>
                    </div>
                  </div>

                  {/* Handover OTP Pill for in-progress orders */}
                  {order.handoverOtp && order.status !== 'completed' && !isCancelled && (
                    <div className="p-3 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2 text-emerald-900 dark:text-emerald-300">
                        <Key className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                        <span className="font-bold">Doorstep Handover OTP:</span>
                        <span className="text-slate-600 dark:text-slate-400 text-[11px]">
                          (Share with driver only upon inspecting produce)
                        </span>
                      </div>
                      <span className="font-mono font-black text-base tracking-widest text-emerald-700 dark:text-emerald-300 bg-white dark:bg-slate-900 px-3 py-1 rounded-xl shadow-2xs border border-emerald-300 dark:border-emerald-700">
                        {order.handoverOtp}
                      </span>
                    </div>
                  )}

                  {/* Items */}
                  <div className="space-y-2">
                    {order.items?.map((item: any, idx: number) => {
                      const title = item.productName || item.title || 'Fresh Harvest Produce';
                      const qty = item.quantityOrdered || item.quantity || 1;
                      const unit = item.unit || 'kg';
                      const price = item.unitPrice || item.pricePerUnit || 0;

                      return (
                        <div key={idx} className="flex items-center justify-between text-xs">
                          <div className="flex items-center gap-2 text-slate-800 dark:text-slate-200">
                            <Package className="w-4 h-4 text-emerald-600" />
                            <span className="font-semibold">{title}</span>
                            <span className="text-slate-400 font-mono">
                              × {qty} {unit} @ LKR {price}
                            </span>
                          </div>
                          <span className="font-bold text-slate-700 dark:text-slate-300 font-mono">
                            LKR {(price * qty).toLocaleString()}
                          </span>
                        </div>
                      );
                    })}
                  </div>

                  {/* Footer Actions */}
                  <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => !isCancelled && handleDownloadInvoice(order._id)}
                        disabled={isCancelled}
                        className={isCancelled ? 'opacity-40 cursor-not-allowed' : ''}
                        title={isCancelled ? 'Invoice not available for cancelled orders' : 'Download Tax Invoice (PDF)'}
                        leftIcon={<FileText className="w-3.5 h-3.5" />}
                      >
                        Invoice (PDF)
                      </Button>

                      {canCancel && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setCancelOrderTarget(order)}
                          className="text-rose-600 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/30 border-rose-200 dark:border-rose-800"
                          leftIcon={<XCircle className="w-3.5 h-3.5" />}
                        >
                          Cancel Order
                        </Button>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      {order.status === 'completed' || order.status === 'delivered' ? (
                        <>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setDisputeOrder(order)}
                            leftIcon={<AlertTriangle className="w-3.5 h-3.5 text-amber-500" />}
                          >
                            Report Issue
                          </Button>

                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setRatingOrder(order)}
                            leftIcon={<Star className="w-3.5 h-3.5 text-amber-400" />}
                          >
                            Review Produce
                          </Button>
                        </>
                      ) : null}

                      {isCancelled ? (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => navigate('/')}
                          className="border-emerald-500 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 font-bold"
                          rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
                        >
                          Reorder Produce
                        </Button>
                      ) : (
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => navigate(`/orders/${order._id}/track`)}
                          className="bg-emerald-600 hover:bg-emerald-500"
                          rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
                        >
                          Track Live Transit
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Rating Modal */}
        {ratingOrder && (
          <RatingModal
            isOpen={!!ratingOrder}
            onClose={() => setRatingOrder(null)}
            orderId={ratingOrder._id}
            farmerName={ratingOrder.farmerId?.fullName || 'Farmer Partner'}
            driverName={ratingOrder.leg2DriverId?.fullName || 'Delivery Partner'}
            onSubmitSuccess={fetchOrders}
          />
        )}

        {/* Dispute Modal */}
        {disputeOrder && (
          <DisputeModal
            isOpen={!!disputeOrder}
            onClose={() => setDisputeOrder(null)}
            orderId={disputeOrder._id}
            onSuccess={fetchOrders}
          />
        )}

        {/* Cancel Confirmation Modal using ConfirmDialog */}
        <ConfirmDialog
          isOpen={!!cancelOrderTarget}
          title="Cancel Purchase Order?"
          description={
            cancelOrderTarget
              ? `Are you sure you want to cancel order #${cancelOrderTarget.orderNumber || ''}? Reserved produce inventory will be immediately restored to the farmer, and any locked escrow funds will be returned.`
              : ''
          }
          confirmText="Yes, Cancel Order"
          cancelText="Keep Order"
          isDestructive={true}
          isLoading={isCancelling}
          onConfirm={handleConfirmCancel}
          onCancel={() => setCancelOrderTarget(null)}
        />
      </div>
    </MarketplaceLayout>
  );
};
