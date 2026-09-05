import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MarketplaceLayout } from '@/components/templates/MarketplaceLayout';
import { OrderTimeline } from '@/components/organisms/OrderTimeline';
import { StatusPill } from '@/components/molecules/StatusPill';
import { Button } from '@/components/atoms/Button';
import { Spinner } from '@/components/atoms/Spinner';
import { ConfirmDialog } from '@/components/molecules/ConfirmDialog';
import { OrderService } from '@/services/order.service';
import { useCartStore } from '@/store/cartStore';
import { useThemeStore } from '@/store/themeStore';
import { useAuthStore } from '@/store/authStore';
import { ChatDrawer } from '@/components/organisms/ChatDrawer';
import {
  FileText,
  Key,
  MapPin,
  Package,
  ShieldCheck,
  ArrowLeft,
  Truck,
  User,
  XCircle,
  Phone,
  Clock,
  MessageSquare,
} from 'lucide-react';
import toast from 'react-hot-toast';

export const OrderTrackingPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [order, setOrder] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCancelling, setIsCancelling] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatCounterpart, setChatCounterpart] = useState<{
    name: string;
    role: string;
    phone?: string;
  }>({ name: 'Logistics Partner', role: 'driver' });

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

  const handleCancel = async () => {
    if (!order) return;
    try {
      setIsCancelling(true);
      const res: any = await OrderService.cancelOrder(order._id, 'Customer cancelled from tracking screen');
      if (res.success) {
        toast.success('Order cancelled and reserved items restored');
        setShowCancelModal(false);
        fetchOrder(order._id);
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to cancel order');
    } finally {
      setIsCancelling(false);
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
        <p className="text-sm font-semibold text-slate-600 dark:text-slate-300">Order not found</p>
        <Button onClick={() => navigate('/catalog')}>Back to Marketplace</Button>
      </div>
    );
  }

  const isCancelable =
    order.status === 'placed' ||
    order.status === 'payment_confirmed' ||
    order.status === 'awaiting_hub_collection';

  const isCancelled =
    order.status === 'cancelled' ||
    order.status === 'refunded' ||
    order.status === 'returned';

  const subtotal = order.itemsTotal || 0;
  const deliveryFee = order.totalDeliveryFee || 0;
  const totalPaid = order.grandTotal || subtotal + deliveryFee;

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
            <span>My Purchase Orders</span>
          </button>

          <div className="flex items-center gap-2">
            {isCancelable && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowCancelModal(true)}
                className="text-rose-600 hover:text-rose-700 hover:bg-rose-50 border-rose-200 dark:border-rose-800"
                leftIcon={<XCircle className="w-4 h-4" />}
              >
                Cancel Order
              </Button>
            )}

            <Button
              variant="outline"
              size="sm"
              onClick={() => !isCancelled && OrderService.downloadInvoicePdf(order._id)}
              disabled={isCancelled}
              className={isCancelled ? 'opacity-40 cursor-not-allowed' : ''}
              title={isCancelled ? 'Invoice not available for cancelled orders' : 'Download Invoice PDF'}
              leftIcon={<FileText className="w-3.5 h-3.5" />}
            >
              Download Invoice PDF
            </Button>
          </div>
        </div>

        {/* Order Header Card */}
        <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <h2 className="text-xl font-extrabold text-slate-900 dark:text-slate-100">
                Order #{order.orderNumber}
              </h2>
              <StatusPill status={order.status} size="sm" />
            </div>
            <p className="text-xs text-slate-400">
              Placed on {new Date(order.createdAt).toLocaleString()} • Escrow Status: <strong>{order.paymentStatus?.replace(/_/g, ' ').toUpperCase()}</strong>
            </p>
          </div>

          {/* 6-Digit Handover OTP Card */}
          {order.handoverOtp && order.status !== 'completed' && order.status !== 'cancelled' && (
            <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-700 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-xs">
                <Key className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] uppercase font-extrabold text-emerald-800 dark:text-emerald-300 block tracking-wider">
                  Delivery Handover OTP
                </span>
                <span className="font-mono text-2xl font-black text-emerald-950 dark:text-emerald-100 tracking-widest">
                  {order.handoverOtp}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* 10-Stage Visual Logistics Timeline */}
        <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Truck className="w-4 h-4 text-emerald-600" />
              <span>Live Farm-to-Doorstep Tracking Progress</span>
            </h3>
            {order.assignedDcId && (
              <span className="text-xs font-mono text-slate-400">
                Hub DC: <strong>{order.assignedDcId?.name || 'Regional DC'}</strong>
              </span>
            )}
          </div>
          <OrderTimeline currentStatus={order.status} />

          {/* Driver Assigned Card */}
          {order.leg2DriverId && (
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-yellow-400 text-slate-950 flex items-center justify-center font-bold">
                  <Truck className="w-4 h-4" />
                </div>
                <div>
                  <span className="font-bold text-slate-900 dark:text-slate-100 block">
                    Courier: {order.leg2DriverId.fullName || 'Registered Partner'}
                  </span>
                  <span className="text-slate-400 text-[11px]">
                    Vehicle: {order.leg2DriverId.vehicleType || 'Courier Vehicle'}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => {
                    setChatCounterpart({
                      name: order.leg2DriverId.fullName || 'Courier Partner',
                      role: 'driver',
                      phone: order.leg2DriverId.phone,
                    });
                    setIsChatOpen(true);
                  }}
                  className="bg-yellow-500 hover:bg-yellow-400 text-slate-950 font-bold"
                  leftIcon={<MessageSquare className="w-3.5 h-3.5" />}
                >
                  Message Courier
                </Button>
                {order.leg2DriverId.phone && (
                  <a
                    href={`tel:${order.leg2DriverId.phone}`}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-emerald-600 dark:text-emerald-400 font-bold hover:underline"
                  >
                    <Phone className="w-3 h-3" />
                    <span>Call</span>
                  </a>
                )}
              </div>
            </div>
          )}
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
              {order.items?.map((item: any, idx: number) => {
                const title = item.productName || item.title || 'Fresh Harvest Produce';
                const qty = item.quantityOrdered || item.quantity || 1;
                const unit = item.unit || 'kg';
                const price = item.unitPrice || item.pricePerUnit || 0;
                const farmerName = item.farmerId?.fullName || 'Harvest Farmer';

                return (
                  <div key={idx} className="pt-3 flex justify-between items-center gap-3">
                    <div className="min-w-0">
                      <p className="font-semibold text-slate-800 dark:text-slate-200 truncate">
                        {title}
                      </p>
                      <p className="text-slate-400 font-mono text-[11px]">
                        {qty} {unit} × LKR {price} • <span className="text-emerald-600 dark:text-emerald-400 font-medium">Farmer: {farmerName}</span>
                      </p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="font-black text-emerald-600 dark:text-emerald-400 font-mono">
                        LKR {(qty * price).toLocaleString()}
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setChatCounterpart({
                            name: farmerName,
                            role: 'farmer',
                            phone: item.farmerId?.phone,
                          });
                          setIsChatOpen(true);
                        }}
                        className="text-[11px] h-7 px-2.5 border-emerald-300 dark:border-emerald-700 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40"
                        leftIcon={<MessageSquare className="w-3 h-3" />}
                      >
                        Message Farmer
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Delivery & Financial Summary */}
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
            <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-sky-600" />
              <span>Delivery Destination & Payment</span>
            </h4>

            <div className="space-y-2 text-xs text-slate-600 dark:text-slate-300">
              <p className="font-bold text-slate-900 dark:text-slate-100">
                {order.recipientName || 'Valued Customer'}
              </p>
              <p>{order.deliveryAddress?.addressLine1 || order.deliveryAddress?.streetAddress}</p>
              <p>
                {order.deliveryAddress?.city}, {order.deliveryAddress?.district} District ({order.deliveryAddress?.province} Province)
              </p>
              <p className="text-slate-400 font-mono">
                Phone: {order.recipientPhone || order.deliveryAddress?.contactPhone}
              </p>
              {order.deliveryInstructions && (
                <p className="text-slate-500 italic pt-1">
                  Instructions: "{order.deliveryInstructions}"
                </p>
              )}
            </div>

            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-1.5 text-xs text-slate-500">
              <div className="flex justify-between">
                <span>Harvest Subtotal</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200 font-mono">
                  LKR {subtotal.toLocaleString()}.00
                </span>
              </div>
              <div className="flex justify-between">
                <span>Regional Courier Logistics</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200 font-mono">
                  LKR {deliveryFee.toLocaleString()}.00
                </span>
              </div>
              <div className="flex justify-between text-base font-black text-slate-900 dark:text-slate-100 pt-2 border-t border-slate-200 dark:border-slate-700">
                <span>Total Escrow Amount</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-mono">
                  LKR {totalPaid.toLocaleString()}.00
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Status History Timeline */}
        {order.timeline && order.timeline.length > 0 && (
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-3">
            <h4 className="font-bold text-xs uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" />
              <span>Event Activity History</span>
            </h4>
            <div className="space-y-2 text-xs">
              {order.timeline.map((evt: any, i: number) => (
                <div key={i} className="flex items-start justify-between py-1 border-b border-slate-100 dark:border-slate-800/60 last:border-0">
                  <div>
                    <span className="font-bold capitalize text-slate-800 dark:text-slate-200">
                      {evt.status?.replace(/_/g, ' ')}
                    </span>
                    <p className="text-slate-500 text-[11px]">{evt.note}</p>
                  </div>
                  <span className="text-slate-400 font-mono text-[10px] shrink-0">
                    {new Date(evt.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {new Date(evt.timestamp).toLocaleDateString()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Cancel Confirmation Modal */}
        <ConfirmDialog
          isOpen={showCancelModal}
          title={`Cancel Order #${order?.orderNumber || ''}?`}
          description="Cancelling this order will release the reserved crop quantities back to the farmer. Escrow funds will be returned."
          confirmText="Confirm Cancellation"
          cancelText="Keep Order"
          isDestructive={true}
          isLoading={isCancelling}
          onConfirm={handleCancel}
          onCancel={() => setShowCancelModal(false)}
        />

        {/* Real-time Order Chat Drawer */}
        <ChatDrawer
          isOpen={isChatOpen}
          onClose={() => setIsChatOpen(false)}
          orderId={order?._id}
          orderNumber={order?.orderNumber}
          counterpartName={chatCounterpart.name}
          counterpartRole={chatCounterpart.role}
          counterpartPhone={chatCounterpart.phone}
        />
      </div>
    </MarketplaceLayout>
  );
};
