import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from '@/components/templates/DashboardLayout';
import { Button } from '@/components/atoms/Button';
import { Badge } from '@/components/atoms/Badge';
import { StatusPill } from '@/components/molecules/StatusPill';
import { EmptyState } from '@/components/molecules/EmptyState';
import { Spinner } from '@/components/atoms/Spinner';
import { OrderService } from '@/services/order.service';
import { useAuthStore } from '@/store/authStore';
import { useThemeStore } from '@/store/themeStore';
import { useTranslation } from '@/lib/i18n';
import { getFarmerNavItems } from '@/lib/navItems';
import { ChatDrawer } from '@/components/organisms/ChatDrawer';
import {
  QrCode,
  FileText,
  Calendar,
  X,
  Printer,
  CheckCircle2,
  Truck,
  MessageSquare,
  Search,
  SlidersHorizontal,
  User,
  Phone,
  RotateCcw,
  Package,
} from 'lucide-react';
import toast from 'react-hot-toast';

export const FarmerOrdersPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const { isDark, toggleTheme, language, setLanguage } = useThemeStore();
  const { t } = useTranslation();

  const [activeTab, setActiveTab] = useState('all');
  const [orders, setOrders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);
  const [isSlipModalOpen, setIsSlipModalOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatOrder, setChatOrder] = useState<any | null>(null);

  // Advanced Search & Filter States
  const [searchTerm, setSearchTerm] = useState('');
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [filters, setFilters] = useState({
    dateFrom: '',
    dateTo: '',
    minAmount: '',
    maxAmount: '',
    sortBy: 'newest',
  });

  const navItems = getFarmerNavItems(t);

  const activeFilterCount =
    (filters.dateFrom ? 1 : 0) +
    (filters.dateTo ? 1 : 0) +
    (filters.minAmount ? 1 : 0) +
    (filters.maxAmount ? 1 : 0) +
    (filters.sortBy !== 'newest' ? 1 : 0);

  useEffect(() => {
    fetchOrders();
  }, [activeTab, searchTerm, filters]);

  const fetchOrders = async () => {
    try {
      setIsLoading(true);
      const queryParams: any = {};
      if (activeTab !== 'all') queryParams.status = activeTab;
      if (searchTerm.trim()) queryParams.search = searchTerm.trim();
      if (filters.dateFrom) queryParams.dateFrom = filters.dateFrom;
      if (filters.dateTo) queryParams.dateTo = filters.dateTo;
      if (filters.minAmount) queryParams.minAmount = filters.minAmount;
      if (filters.maxAmount) queryParams.maxAmount = filters.maxAmount;
      if (filters.sortBy) queryParams.sortBy = filters.sortBy;

      const res: any = await OrderService.getFarmerOrders(queryParams);
      if (res.success && res.data) {
        setOrders(res.data.orders || []);
      }
    } catch (err: any) {
      console.error('Failed to load farmer orders:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateStatus = async (orderId: string, nextStatus: string, note?: string) => {
    try {
      setUpdatingOrderId(orderId);
      const res: any = await OrderService.updateOrderStatus(orderId, nextStatus, note);
      if (res.success) {
        toast.success(`Order updated to ${nextStatus.replace(/_/g, ' ')}`);
        fetchOrders();
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to update order');
    } finally {
      setUpdatingOrderId(null);
    }
  };

  const tabs = [
    { id: 'all', label: 'All Orders' },
    { id: 'placed', label: 'New Orders' },
    { id: 'awaiting_hub_collection', label: 'Packing / Ready for Hub' },
    { id: 'collected_at_hub', label: 'Dropped at Hub' },
    { id: 'in_transit_to_dc', label: 'In Transit' },
    { id: 'completed', label: 'Completed' },
  ];

  return (
    <DashboardLayout
      portalTitle={t.farmerOpsCenter || 'Farmer Portal'}
      portalRole={user?.role || 'Farmer'}
      navItems={navItems}
      mobileNavItems={navItems.map((item) => ({
        id: item.id,
        label: item.label,
        icon: item.icon,
        path: item.path,
      }))}
      activePath="/farmer/orders"
      onNavigate={(path) => navigate(path)}
      currentLanguage={language}
      onLanguageChange={setLanguage}
      isDark={isDark}
      onToggleTheme={toggleTheme}
      user={user || undefined}
      onLogout={() => {
        logout();
        navigate('/');
      }}
    >
      <div className="space-y-6">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 dark:text-slate-100">
            {t.farmOrders} ({orders.length})
          </h1>
          <p className="text-xs text-slate-400">
            Track customer crop orders, prepare hub packing slips, and monitor escrow settlement stages
          </p>
        </div>

        {/* Search & Advanced Filters Bar */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[240px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search customer name, order number, or crop..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <Button
            variant={activeFilterCount > 0 ? 'primary' : 'outline'}
            size="sm"
            onClick={() => setIsFilterModalOpen(true)}
            leftIcon={<SlidersHorizontal className="w-3.5 h-3.5" />}
            className={activeFilterCount > 0 ? 'bg-emerald-600 hover:bg-emerald-700' : ''}
          >
            Filters {activeFilterCount > 0 && `(${activeFilterCount})`}
          </Button>

          {(activeFilterCount > 0 || searchTerm) && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSearchTerm('');
                setFilters({ dateFrom: '', dateTo: '', minAmount: '', maxAmount: '', sortBy: 'newest' });
              }}
              leftIcon={<RotateCcw className="w-3.5 h-3.5" />}
              className="text-xs text-slate-500 hover:text-slate-700 dark:text-slate-400"
            >
              Reset
            </Button>
          )}
        </div>

        {/* Tab Filters */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 gap-4 overflow-x-auto no-scrollbar text-xs font-bold">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`pb-3 border-b-2 transition-colors whitespace-nowrap cursor-pointer ${
                activeTab === tab.id
                  ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400 font-extrabold'
                  : 'border-transparent text-slate-400 hover:text-slate-600'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Orders List */}
        {isLoading ? (
          <div className="py-20 flex justify-center">
            <Spinner size="lg" />
          </div>
        ) : orders.length === 0 ? (
          <EmptyState
            title="No Farm Orders Found"
            description={
              searchTerm || activeFilterCount > 0
                ? "No orders match your filter criteria. Try clearing search or filters."
                : "When buyers order your crops, they will appear here with designated hub dropoff schedules."
            }
          />
        ) : (
          <div className="space-y-4">
            {orders.map((order) => {
              const myItems = order.items?.filter(
                (item: any) =>
                  !item.farmerId || item.farmerId === user?._id || item.farmerId?._id === user?._id
              ) || order.items || [];

              const itemsTotalLkr = myItems.reduce(
                (sum: number, i: any) => sum + (i.unitPrice || i.pricePerUnit || 0) * (i.quantityOrdered || i.quantity || 1),
                0
              );

              const isUpdating = updatingOrderId === order._id;

              return (
                <div
                  key={order._id}
                  className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs hover:shadow-md transition-all space-y-4"
                >
                  <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-3">
                      <span className="font-mono font-bold text-sm text-slate-900 dark:text-slate-100">
                        {order.orderNumber || `#POL-${order._id.substring(order._id.length - 6).toUpperCase()}`}
                      </span>
                      <Badge variant={order.customerType === 'b2b' ? 'purple' : 'sky'} size="sm">
                        {order.customerType === 'b2b' ? 'B2B Wholesale' : 'B2C Consumer'}
                      </Badge>
                    </div>

                    <div className="flex items-center gap-3">
                      <StatusPill status={order.status} size="sm" />
                      <span className="text-xs text-slate-400 font-mono">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  {/* Customer Information (Prominent Display) */}
                  <div className="flex flex-wrap items-center gap-3 p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 text-xs">
                    <div className="flex items-center gap-1.5 font-bold text-slate-800 dark:text-slate-200">
                      <User className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Customer: <strong>{(order.customerId as any)?.fullName || 'Marketplace Buyer'}</strong></span>
                    </div>
                    {(order.customerId as any)?.phone && (
                      <div className="flex items-center gap-1 text-slate-400 font-mono text-[11px]">
                        <Phone className="w-3 h-3" />
                        <span>{(order.customerId as any)?.phone}</span>
                      </div>
                    )}
                    {(order.customerId as any)?.email && (
                      <span className="text-slate-400 text-[11px] hidden sm:inline">
                        · {(order.customerId as any)?.email}
                      </span>
                    )}
                  </div>

                  {/* Line Items */}
                  <div className="space-y-2">
                    {myItems.map((item: any, idx: number) => {
                      const title = item.productName || item.title || 'Produce Harvest';
                      const qty = item.quantityOrdered || item.quantity || 1;
                      const unit = item.unit || 'kg';
                      const price = item.unitPrice || item.pricePerUnit || 0;

                      return (
                        <div key={idx} className="flex items-center justify-between text-xs">
                          <div className="flex items-center gap-2 font-medium text-slate-800 dark:text-slate-200">
                            <Package className="w-4 h-4 text-emerald-600" />
                            <span className="font-bold">{title}</span>
                            <span className="text-slate-400 font-mono">
                              × {qty} {unit} @ LKR {price}
                            </span>
                          </div>
                          <span className="font-bold text-slate-900 dark:text-slate-100 font-mono">
                            LKR {(price * qty).toLocaleString()}
                          </span>
                        </div>
                      );
                    })}
                  </div>

                  {/* Footer Controls */}
                  <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                    <div className="text-xs text-slate-500 flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-emerald-600" />
                      <span>
                        Destination: <strong>{order.deliveryAddress?.city}, {order.deliveryAddress?.district}</strong>
                        {order.assignedDcId && ` (via ${order.assignedDcId?.name})`}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setChatOrder(order);
                          setIsChatOpen(true);
                        }}
                        leftIcon={<MessageSquare className="w-3.5 h-3.5 text-emerald-600" />}
                      >
                        Message Buyer
                      </Button>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedOrder(order);
                          setIsSlipModalOpen(true);
                        }}
                        leftIcon={<QrCode className="w-3.5 h-3.5" />}
                      >
                        Crate Tag
                      </Button>

                      {/* State transitions for Farmer */}
                      {order.status === 'placed' || order.status === 'payment_confirmed' ? (
                        <Button
                          variant="primary"
                          size="sm"
                          isLoading={isUpdating}
                          onClick={() => handleUpdateStatus(order._id, 'awaiting_hub_collection', 'Farmer started packing harvest')}
                          className="bg-emerald-600 hover:bg-emerald-500"
                          leftIcon={<Package className="w-3.5 h-3.5" />}
                        >
                          Accept & Start Packing
                        </Button>
                      ) : order.status === 'awaiting_hub_collection' ? (
                        <Button
                          variant="primary"
                          size="sm"
                          isLoading={isUpdating}
                          onClick={() => handleUpdateStatus(order._id, 'collected_at_hub', 'Farmer dropped crates at collection hub')}
                          className="bg-sky-600 hover:bg-sky-500"
                          leftIcon={<CheckCircle2 className="w-3.5 h-3.5" />}
                        >
                          Mark Dropped at Hub
                        </Button>
                      ) : null}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Crate Packing Slip / QR Modal */}
        {isSlipModalOpen && selectedOrder && (
          <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
            <div
              className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity animate-in fade-in"
              onClick={() => setIsSlipModalOpen(false)}
            />

            <div className="relative w-full max-w-md rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl p-6 sm:p-8 space-y-6 text-center animate-in zoom-in-95">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-600">
                  Pola Agri-Crate Packing Slip
                </span>
                <button
                  onClick={() => setIsSlipModalOpen(false)}
                  className="p-1 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-800 flex flex-col items-center justify-center space-y-3">
                <QrCode className="w-24 h-24 text-slate-800 dark:text-slate-200" />
                <span className="font-mono text-sm font-bold tracking-widest text-slate-900 dark:text-slate-100">
                  {selectedOrder.orderNumber || `#POL-${selectedOrder._id.substring(selectedOrder._id.length - 6).toUpperCase()}`}
                </span>
              </div>

              <div className="text-left text-xs space-y-1.5 border-y border-slate-100 dark:border-slate-800 py-3">
                <p><strong>Producer:</strong> {user?.fullName}</p>
                <p><strong>Target Hub:</strong> {selectedOrder.assignedDcId?.name || 'Regional DC Hub'}</p>
                <p><strong>Total Line-items:</strong> {selectedOrder.items?.length || 1} produce crates</p>
                <p><strong>Buyer City:</strong> {selectedOrder.deliveryAddress?.city}, {selectedOrder.deliveryAddress?.district}</p>
              </div>

              <Button
                variant="primary"
                size="sm"
                onClick={() => {
                  window.print();
                  setIsSlipModalOpen(false);
                }}
                className="w-full bg-emerald-600"
                leftIcon={<Printer className="w-4 h-4" />}
              >
                Print Crate Tag Slip
              </Button>
            </div>
          </div>
        )}

        {/* Real-time Buyer Coordination Drawer */}
        <ChatDrawer
          isOpen={isChatOpen}
          onClose={() => {
            setIsChatOpen(false);
            setChatOrder(null);
          }}
          orderId={chatOrder?._id}
          orderNumber={chatOrder?.orderNumber}
          counterpartName={chatOrder?.customerId?.fullName || 'Produce Buyer'}
          counterpartRole="customer"
          counterpartPhone={chatOrder?.customerId?.phone || chatOrder?.deliveryAddress?.contactPhone}
        />

        {/* Advanced Filter Modal */}
        {isFilterModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
              className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm"
              onClick={() => setIsFilterModalOpen(false)}
            />
            <div className="relative w-full max-w-sm rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl p-6 space-y-5 animate-in zoom-in-95">
              {/* Header */}
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">Advanced Filters</h3>
                <button
                  onClick={() => setIsFilterModalOpen(false)}
                  className="p-1 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Date Range */}
              <div className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Date Range</p>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs text-slate-500 mb-1">From</label>
                    <input
                      type="date"
                      value={filters.dateFrom}
                      onChange={(e) => setFilters((f) => ({ ...f, dateFrom: e.target.value }))}
                      className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-500 mb-1">To</label>
                    <input
                      type="date"
                      value={filters.dateTo}
                      onChange={(e) => setFilters((f) => ({ ...f, dateTo: e.target.value }))}
                      className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>
              </div>

              {/* Amount Range */}
              <div className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Amount Range (LKR)</p>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs text-slate-500 mb-1">Min</label>
                    <input
                      type="number"
                      placeholder="0"
                      min={0}
                      value={filters.minAmount}
                      onChange={(e) => setFilters((f) => ({ ...f, minAmount: e.target.value }))}
                      className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-500 mb-1">Max</label>
                    <input
                      type="number"
                      placeholder="Any"
                      min={0}
                      value={filters.maxAmount}
                      onChange={(e) => setFilters((f) => ({ ...f, maxAmount: e.target.value }))}
                      className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>
              </div>

              {/* Sort By */}
              <div className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Sort By</p>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { value: 'newest', label: 'Newest First' },
                    { value: 'oldest', label: 'Oldest First' },
                    { value: 'amount_high', label: 'Highest Amount' },
                    { value: 'amount_low', label: 'Lowest Amount' },
                  ].map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => setFilters((f) => ({ ...f, sortBy: opt.value }))}
                      className={`rounded-xl border px-3 py-2 text-xs font-medium transition-colors ${
                        filters.sortBy === opt.value
                          ? 'bg-emerald-600 border-emerald-600 text-white'
                          : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-1">
                <button
                  onClick={() => {
                    setFilters({ dateFrom: '', dateTo: '', minAmount: '', maxAmount: '', sortBy: 'newest' });
                    setIsFilterModalOpen(false);
                  }}
                  className="flex-1 rounded-xl border border-slate-200 dark:border-slate-700 py-2.5 text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                >
                  Reset
                </button>
                <button
                  onClick={() => setIsFilterModalOpen(false)}
                  className="flex-1 rounded-xl bg-emerald-600 hover:bg-emerald-700 py-2.5 text-sm font-semibold text-white transition-colors"
                >
                  Apply Filters
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};
