import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from '@/components/templates/DashboardLayout';
import { DataTable, Column } from '@/components/organisms/DataTable';
import { StatusPill } from '@/components/molecules/StatusPill';
import { Badge } from '@/components/atoms/Badge';
import { Button } from '@/components/atoms/Button';
import { Input } from '@/components/atoms/Input';
import { Spinner } from '@/components/atoms/Spinner';
import { EmptyState } from '@/components/molecules/EmptyState';
import { AdminService } from '@/services/admin.service';
import { OrderService } from '@/services/order.service';
import { useAuthStore } from '@/store/authStore';
import { useThemeStore } from '@/store/themeStore';
import {
  LayoutDashboard,
  ShieldCheck,
  CreditCard,
  ShoppingBag,
  AlertTriangle,
  Building,
  Search,
  RefreshCw,
  Eye,
  UserCheck,
  XCircle,
  Clock,
  Truck,
  MapPin,
  X,
  FileText,
} from 'lucide-react';
import toast from 'react-hot-toast';

export const OrderManagementPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const { isDark, toggleTheme, language, setLanguage } = useThemeStore();

  const [orders, setOrders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState({ total: 0, totalPages: 1, limit: 25 });
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);

  // Modal states for admin action
  const [isReassignModalOpen, setIsReassignModalOpen] = useState(false);
  const [reassignDriverId, setReassignDriverId] = useState('');
  const [reassignReason, setReassignReason] = useState('');
  const [isSubmittingReassign, setIsSubmittingReassign] = useState(false);

  const navItems = [
    { id: 'dashboard', label: 'Command Center', icon: <LayoutDashboard className="w-5 h-5" />, path: '/admin/dashboard' },
    { id: 'kyc', label: 'KYC Verification', icon: <ShieldCheck className="w-5 h-5" />, path: '/admin/kyc' },
    { id: 'payouts', label: 'LankaPay Payouts', icon: <CreditCard className="w-5 h-5" />, path: '/admin/payouts' },
    { id: 'orders', label: 'Order Oversight', icon: <ShoppingBag className="w-5 h-5" />, path: '/admin/orders' },
    { id: 'disputes', label: 'Dispute Desk', icon: <AlertTriangle className="w-5 h-5" />, path: '/admin/disputes' },
    { id: 'hubs', label: 'Hubs & DCs', icon: <Building className="w-5 h-5" />, path: '/admin/hubs' },
  ];

  const statusPills = [
    { id: 'all', label: 'All Orders' },
    { id: 'placed', label: 'Placed' },
    { id: 'payment_confirmed', label: 'Paid' },
    { id: 'awaiting_hub_collection', label: 'Hub Ready' },
    { id: 'in_transit_to_dc', label: 'In Transit' },
    { id: 'received_at_dc', label: 'At DC' },
    { id: 'out_for_delivery', label: 'Out for Delivery' },
    { id: 'delivered', label: 'Delivered' },
    { id: 'completed', label: 'Completed' },
    { id: 'cancelled', label: 'Cancelled' },
  ];

  useEffect(() => {
    fetchOrders();
  }, [page, statusFilter]);

  const fetchOrders = async () => {
    try {
      setIsLoading(true);
      const res: any = await AdminService.getAllOrders({
        page,
        limit: 25,
        status: statusFilter !== 'all' ? statusFilter : undefined,
        search: searchQuery.trim() || undefined,
      });

      if (res.success && res.data) {
        setOrders(res.data.orders || []);
        if (res.data.meta) setMeta(res.data.meta);
      }
    } catch (err: any) {
      toast.error('Failed to load orders');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchOrders();
  };

  const handleForceCancel = async (orderId: string) => {
    if (!window.confirm('Are you sure you want to force cancel this order? Reserved stock will be restored and wallet funds refunded.')) {
      return;
    }

    try {
      toast.loading('Cancelling order...', { id: 'admin-cancel' });
      await OrderService.cancelOrder(orderId, 'Cancelled by Admin Command Center');
      toast.success('Order cancelled and inventory restored', { id: 'admin-cancel' });
      fetchOrders();
    } catch (err: any) {
      toast.error(err.message || 'Failed to cancel order', { id: 'admin-cancel' });
    }
  };

  const handleForceReassign = async () => {
    if (!selectedOrder || !reassignDriverId.trim()) {
      toast.error('Please enter a valid driver ID');
      return;
    }

    try {
      setIsSubmittingReassign(true);
      await AdminService.forceReassignOrder(
        selectedOrder._id,
        reassignDriverId.trim(),
        reassignReason || 'Reassigned by Admin Operations'
      );
      toast.success('Courier successfully reassigned');
      setIsReassignModalOpen(false);
      setReassignDriverId('');
      setReassignReason('');
      fetchOrders();
    } catch (err: any) {
      toast.error(err.response?.data?.message || err.message || 'Failed to reassign courier');
    } finally {
      setIsSubmittingReassign(false);
    }
  };

  const columns: Column<any>[] = [
    {
      header: 'Order #',
      accessor: (row) => (
        <div className="font-mono text-xs font-bold text-slate-900 dark:text-slate-100">
          {row.orderNumber || `#${row._id.substring(row._id.length - 6).toUpperCase()}`}
          <div className="text-[10px] text-slate-400 font-sans">
            {new Date(row.createdAt).toLocaleDateString()}
          </div>
        </div>
      ),
    },
    {
      header: 'Customer',
      accessor: (row) => (
        <div className="text-xs">
          <div className="font-bold text-slate-900 dark:text-slate-100">
            {row.customerId?.fullName || 'Anonymous User'}
          </div>
          <div className="text-[10px] text-slate-400">{row.customerId?.phone || row.customerId?.email}</div>
        </div>
      ),
    },
    {
      header: 'Status',
      accessor: (row) => <StatusPill status={row.status} size="sm" />,
    },
    {
      header: 'Grand Total',
      accessor: (row) => (
        <div className="font-mono text-xs font-bold text-emerald-600 dark:text-emerald-400">
          LKR {(row.grandTotal || 0).toLocaleString()}
          <div className="text-[10px] text-slate-400 uppercase font-sans">{row.paymentMethod}</div>
        </div>
      ),
    },
    {
      header: 'Assigned DC Hub',
      accessor: (row) => (
        <div className="text-xs text-slate-700 dark:text-slate-300">
          {row.assignedDcId?.name ? (
            <span className="font-semibold">{row.assignedDcId.name} ({row.assignedDcId.district})</span>
          ) : (
            <span className="text-slate-400 italic">Unassigned DC</span>
          )}
        </div>
      ),
    },
    {
      header: 'Courier',
      accessor: (row) => (
        <div className="text-xs">
          {row.leg2DriverId?.fullName ? (
            <div className="font-semibold text-slate-900 dark:text-slate-100">
              {row.leg2DriverId.fullName}
              <div className="text-[10px] text-slate-400">{row.leg2DriverId.phone}</div>
            </div>
          ) : (
            <Badge variant="amber" size="sm">Awaiting Driver</Badge>
          )}
        </div>
      ),
    },
    {
      header: 'Actions',
      accessor: (row) => (
        <div className="flex items-center gap-1.5">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate(`/orders/${row._id}/track`)}
            title="View Live Timeline"
            leftIcon={<Eye className="w-3.5 h-3.5" />}
          >
            Track
          </Button>

          {row.status !== 'completed' && row.status !== 'cancelled' && (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSelectedOrder(row);
                  setIsReassignModalOpen(true);
                }}
                title="Reassign Driver"
                leftIcon={<UserCheck className="w-3.5 h-3.5" />}
              >
                Reassign
              </Button>

              <button
                onClick={() => handleForceCancel(row._id)}
                className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors cursor-pointer"
                title="Force Cancel Order"
              >
                <XCircle className="w-4 h-4" />
              </button>
            </>
          )}
        </div>
      ),
    },
  ];

  return (
    <DashboardLayout
      portalTitle="Admin Command Center"
      portalRole={user?.role || 'Admin'}
      navItems={navItems}
      activePath="/admin/orders"
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
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-extrabold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <ShoppingBag className="w-6 h-6 text-teal-600" />
              Order Oversight Command ({meta.total})
            </h1>
            <p className="text-xs text-slate-400">
              Real-time multi-district order dispatch monitoring, courier assignment, and dispute intervention
            </p>
          </div>

          <div className="flex items-center gap-3">
            <form onSubmit={handleSearchSubmit} className="flex items-center gap-2">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Lookup Order #..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 pr-3 py-1.5 rounded-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-teal-500 w-48 sm:w-64"
                />
              </div>
              <Button type="submit" variant="outline" size="sm">Search</Button>
            </form>

            <Button
              variant="outline"
              size="sm"
              onClick={() => fetchOrders()}
              leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
            >
              Refresh
            </Button>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 gap-3 overflow-x-auto no-scrollbar text-xs font-bold pb-2">
          {statusPills.map((pill) => (
            <button
              key={pill.id}
              onClick={() => {
                setStatusFilter(pill.id);
                setPage(1);
              }}
              className={`px-3 py-1.5 rounded-full transition-all cursor-pointer whitespace-nowrap ${
                statusFilter === pill.id
                  ? 'bg-teal-600 text-white font-black shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800/60 text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              {pill.label}
            </button>
          ))}
        </div>

        {/* Orders Table */}
        {isLoading ? (
          <div className="py-20 flex justify-center">
            <Spinner size="lg" />
          </div>
        ) : orders.length === 0 ? (
          <EmptyState
            title="No Orders Match Criteria"
            description="No orders were found matching your current filter selection or search query."
          />
        ) : (
          <div className="space-y-4">
            <DataTable columns={columns} data={orders} />

            {/* Pagination Controls */}
            {meta.totalPages > 1 && (
              <div className="flex items-center justify-between p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 text-xs">
                <span className="text-slate-500">
                  Page {meta.page} of {meta.totalPages} ({meta.total} total orders)
                </span>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page <= 1}
                    onClick={() => setPage(page - 1)}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page >= meta.totalPages}
                    onClick={() => setPage(page + 1)}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Reassign Driver Modal */}
        {isReassignModalOpen && selectedOrder && (
          <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
            <div
              className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity"
              onClick={() => setIsReassignModalOpen(false)}
            />

            <div className="relative w-full max-w-md rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl p-6 sm:p-8 space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-extrabold text-slate-900 dark:text-slate-100">
                  Reassign Courier Partner
                </h3>
                <button
                  onClick={() => setIsReassignModalOpen(false)}
                  className="p-1 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 text-xs space-y-1">
                <div>Order: <strong>{selectedOrder.orderNumber}</strong></div>
                <div>Customer: <strong>{selectedOrder.customerId?.fullName}</strong></div>
                <div>Destination: <strong>{selectedOrder.deliveryAddress?.city}, {selectedOrder.deliveryAddress?.district}</strong></div>
              </div>

              <div className="space-y-4">
                <Input
                  label="Target Courier User ID / Driver ID"
                  placeholder="e.g. 64b1f280c4512a809..."
                  value={reassignDriverId}
                  onChange={(e) => setReassignDriverId(e.target.value)}
                  required
                />

                <Input
                  label="Administrative Reason"
                  placeholder="e.g. Previous driver vehicle breakdown"
                  value={reassignReason}
                  onChange={(e) => setReassignReason(e.target.value)}
                />

                <div className="flex items-center justify-end gap-3 pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsReassignModalOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="primary"
                    size="sm"
                    isLoading={isSubmittingReassign}
                    onClick={handleForceReassign}
                    className="bg-teal-600 hover:bg-teal-500"
                  >
                    Confirm Assignment
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};
