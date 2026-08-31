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
import { OrderService } from '@/services/order.service';
import { useCartStore } from '@/store/cartStore';
import { useThemeStore } from '@/store/themeStore';
import { useAuthStore } from '@/store/authStore';
import { useTranslation } from '@/lib/i18n';
import {
  ShoppingBag,
  Package,
  Clock,
  Star,
  AlertTriangle,
  FileText,
  Truck,
  ArrowRight,
} from 'lucide-react';
import toast from 'react-hot-toast';

export const CustomerOrdersPage: React.FC = () => {
  const navigate = useNavigate();
  const { items, openCart } = useCartStore();
  const { isDark, toggleTheme, language, setLanguage } = useThemeStore();
  const { user } = useAuthStore();
  const { t } = useTranslation();

  const [orders, setOrders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Modal States
  const [ratingOrder, setRatingOrder] = useState<any | null>(null);
  const [disputeOrder, setDisputeOrder] = useState<any | null>(null);

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
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownloadInvoice = async (orderId: string) => {
    try {
      toast.loading('Generating PDF invoice...', { id: 'pdf' });
      await OrderService.downloadInvoice(orderId);
      toast.success('Tax invoice downloaded successfully', { id: 'pdf' });
    } catch (err: any) {
      toast.error('Failed to download invoice', { id: 'pdf' });
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
      <div className="max-w-4xl mx-auto space-y-6 pb-12">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-slate-100">
            My Purchase Orders ({orders.length})
          </h1>
          <p className="text-xs text-slate-400">
            Track farm collection status, live driver delivery, escrow releases, and tax invoices
          </p>
        </div>

        {isLoading ? (
          <div className="py-20 flex justify-center">
            <Spinner size="lg" />
          </div>
        ) : orders.length === 0 ? (
          <EmptyState
            title="No Orders Placed Yet"
            description="Explore verified agricultural harvest listings directly from farmers across Sri Lanka."
            actionText="Start Shopping Fresh Harvest"
            onAction={() => navigate('/catalog')}
          />
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
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
                    <span className="font-extrabold text-sm text-emerald-600 dark:text-emerald-400">
                      LKR {order.pricing?.totalLkr?.toLocaleString() || '0'}
                    </span>
                  </div>
                </div>

                {/* Items */}
                <div className="space-y-2">
                  {order.items?.map((item: any, idx: number) => (
                    <div key={idx} className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2 text-slate-800 dark:text-slate-200">
                        <Package className="w-4 h-4 text-emerald-600" />
                        <span className="font-medium">{item.title}</span>
                        <span className="text-slate-400">× {item.quantity} {item.unit || 'kg'}</span>
                      </div>
                      <span className="font-bold text-slate-700 dark:text-slate-300">
                        LKR {(item.pricePerUnit * item.quantity).toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Footer Actions */}
                <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDownloadInvoice(order._id)}
                    leftIcon={<FileText className="w-3.5 h-3.5" />}
                  >
                    Tax Invoice (PDF)
                  </Button>

                  <div className="flex items-center gap-2">
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

                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => navigate(`/orders/${order._id}/track`)}
                      className="bg-emerald-600"
                      rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
                    >
                      Track Order
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Rating Modal */}
        {ratingOrder && (
          <RatingModal
            isOpen={!!ratingOrder}
            onClose={() => setRatingOrder(null)}
            orderId={ratingOrder._id}
            farmerName={ratingOrder.farmerId?.fullName || 'Farmer Partner'}
            driverName={ratingOrder.deliveryPartnerId?.fullName || 'Delivery Partner'}
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
      </div>
    </MarketplaceLayout>
  );
};
