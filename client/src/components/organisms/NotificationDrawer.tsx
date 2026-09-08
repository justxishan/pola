import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from '@/lib/i18n';
import { useAuthStore } from '@/store/authStore';
import { resolveNotificationPath } from '@/lib/routeResolver';
import { Badge } from '@/components/atoms/Badge';
import { Button } from '@/components/atoms/Button';
import { NotificationService } from '@/services/notification.service';
import { NotificationDetailModal } from '@/components/molecules/NotificationDetailModal';
import {
  Bell,
  X,
  CheckCircle2,
  AlertTriangle,
  Info,
  Clock,
  CheckCheck,
  Package,
  Wallet,
  Truck,
  ShieldCheck,
  Loader2,
  Trash2,
  MessageSquare,
  CheckSquare,
  Square,
} from 'lucide-react';
import toast from 'react-hot-toast';

export interface NotificationItem {
  _id: string;
  id?: string;
  title: string;
  message: string;
  type: 'order' | 'payout' | 'wallet' | 'grading' | 'delivery' | 'dispute' | 'system' | 'kyc' | 'message';
  portal?: 'customer' | 'farmer' | 'delivery' | 'admin';
  destinationKey?: string;
  relatedId?: string;
  isRead: boolean;
  linkUrl?: string;
  createdAt: string;
}

export interface NotificationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onRefreshCount?: () => void;
  portal?: 'customer' | 'farmer' | 'delivery' | 'admin';
}

export const NotificationDrawer: React.FC<NotificationDrawerProps> = ({
  isOpen,
  onClose,
  onRefreshCount,
  portal,
}) => {
  const { user } = useAuthStore();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();

  const activePortal: 'customer' | 'farmer' | 'delivery' | 'admin' =
    portal ||
    (location.pathname.startsWith('/farmer')
      ? 'farmer'
      : location.pathname.startsWith('/delivery')
      ? 'delivery'
      : location.pathname.startsWith('/admin')
      ? 'admin'
      : 'customer');

  const [activeTab, setActiveTab] = useState<'all' | 'system' | 'messages'>('all');
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState<NotificationItem | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  // Selection mode & bulk delete
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isBulkDeleting, setIsBulkDeleting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchNotifications();
      setIsSelectionMode(false);
      setSelectedIds(new Set());
    }
  }, [isOpen, activePortal]);

  const fetchNotifications = async () => {
    try {
      setIsLoading(true);
      const res: any = await NotificationService.getMyNotifications(activePortal);
      if (res.success && res.data) {
        const raw: NotificationItem[] = res.data.notifications || [];
        setNotifications(raw.filter((n) => !n.portal || n.portal === activePortal));
      }
    } catch (err: any) {
      console.warn('Failed to load notifications:', err);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  const markAllAsRead = async () => {
    try {
      await NotificationService.markAsRead('all', activePortal);
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      if (onRefreshCount) onRefreshCount();
      toast.success('All marked as read');
    } catch (err) {
      console.error(err);
    }
  };

  const handleNotificationClick = async (item: NotificationItem) => {
    const itemId = item._id || item.id || '';

    // If selection mode is on, toggle selection
    if (isSelectionMode) {
      toggleSelectItem(itemId);
      return;
    }

    // Mark as read
    if (!item.isRead) {
      try {
        await NotificationService.markAsRead(itemId);
        setNotifications((prev) =>
          prev.map((n) => ((n._id === item._id || n.id === item.id) ? { ...n, isRead: true } : n))
        );
        if (onRefreshCount) onRefreshCount();
      } catch (err) {}
    }

    // Chat notifications directly navigate to conversation
    if (item.type === 'message') {
      const resolvedPath = resolveNotificationPath(item, user?.role);
      if (resolvedPath) {
        onClose();
        navigate(resolvedPath);
      }
      return;
    }

    // System notifications open detail modal
    setSelectedNotification(item);
    setIsDetailModalOpen(true);
  };

  const toggleSelectItem = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleSelectAll = () => {
    if (selectedIds.size === filtered.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filtered.map((n) => n._id || n.id || '')));
    }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.size === 0) return;
    try {
      setIsBulkDeleting(true);
      await NotificationService.deleteNotifications(Array.from(selectedIds));
      setNotifications((prev) => prev.filter((n) => !selectedIds.has(n._id || n.id || '')));
      setSelectedIds(new Set());
      setIsSelectionMode(false);
      if (onRefreshCount) onRefreshCount();
      toast.success('Selected notifications deleted');
    } catch (err) {
      toast.error('Failed to delete notifications');
    } finally {
      setIsBulkDeleting(false);
    }
  };

  const handleDeleteFromModal = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n._id !== id && n.id !== id));
    if (onRefreshCount) onRefreshCount();
  };

  const filtered = notifications.filter((n) => {
    if (activeTab === 'system') return n.type !== 'message';
    if (activeTab === 'messages') return n.type === 'message';
    return true;
  });

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'order':
        return <Package className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />;
      case 'wallet':
      case 'payout':
        return <Wallet className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />;
      case 'delivery':
        return <Truck className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />;
      case 'kyc':
        return <ShieldCheck className="w-4 h-4 text-sky-600 dark:text-sky-400" />;
      case 'message':
        return <MessageSquare className="w-4 h-4 text-teal-600 dark:text-teal-400" />;
      default:
        return <Info className="w-4 h-4 text-slate-500" />;
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-50 overflow-hidden">
        <div
          className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity animate-in fade-in"
          onClick={onClose}
        />

        <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
          <div className="w-screen max-w-md bg-white dark:bg-slate-900 shadow-2xl border-l border-slate-200 dark:border-slate-800 flex flex-col">
            {/* Header */}
            <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-300">
                  <Bell className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 dark:text-slate-100 text-base">
                    Notifications
                  </h3>
                  <p className="text-xs text-slate-400">
                    {unreadCount} unread alert{unreadCount !== 1 ? 's' : ''}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                {notifications.length > 0 && (
                  <button
                    onClick={() => {
                      setIsSelectionMode(!isSelectionMode);
                      setSelectedIds(new Set());
                    }}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                      isSelectionMode
                        ? 'bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-white font-bold'
                        : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    {isSelectionMode ? 'Cancel' : 'Select'}
                  </button>
                )}

                {unreadCount > 0 && !isSelectionMode && (
                  <button
                    onClick={markAllAsRead}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    title="Mark all as read"
                  >
                    <CheckCheck className="w-4 h-4" />
                  </button>
                )}

                <button
                  onClick={onClose}
                  className="p-1.5 rounded-xl text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Selection Action Bar */}
            {isSelectionMode && (
              <div className="px-4 py-2.5 bg-slate-100 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between text-xs">
                <button
                  onClick={handleSelectAll}
                  className="font-semibold text-slate-700 dark:text-slate-200 hover:text-emerald-600 dark:hover:text-emerald-400 flex items-center gap-1.5 cursor-pointer"
                >
                  {selectedIds.size === filtered.length && filtered.length > 0 ? (
                    <CheckSquare className="w-4 h-4 text-emerald-600" />
                  ) : (
                    <Square className="w-4 h-4 text-slate-400" />
                  )}
                  <span>Select All ({selectedIds.size}/{filtered.length})</span>
                </button>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleBulkDelete}
                  disabled={selectedIds.size === 0}
                  isLoading={isBulkDeleting}
                  className="text-xs h-7 px-2.5 border-red-200 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40"
                  leftIcon={<Trash2 className="w-3.5 h-3.5" />}
                >
                  Delete ({selectedIds.size})
                </Button>
              </div>
            )}

            {/* Filter Tabs */}
            <div className="flex items-center gap-1.5 px-4 py-2 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
              {(
                [
                  { id: 'all', label: 'All' },
                  { id: 'system', label: 'System' },
                  { id: 'messages', label: 'Messages' },
                ] as const
              ).map((tab) => {
                const count =
                  tab.id === 'all'
                    ? notifications.length
                    : tab.id === 'system'
                    ? notifications.filter((n) => n.type !== 'message').length
                    : notifications.filter((n) => n.type === 'message').length;

                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all shrink-0 cursor-pointer flex items-center gap-1.5 ${
                      activeTab === tab.id
                        ? 'bg-white dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 shadow-2xs font-bold'
                        : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                    }`}
                  >
                    <span>{tab.label}</span>
                    <span className="text-[10px] opacity-70">({count})</span>
                  </button>
                );
              })}
            </div>

            {/* List Content */}
            <div className="flex-1 overflow-y-auto p-4 space-y-2.5">
              {isLoading ? (
                <div className="flex flex-col items-center justify-center py-16 space-y-2 text-slate-400">
                  <Loader2 className="w-6 h-6 animate-spin text-emerald-600" />
                  <span className="text-xs">Loading alerts...</span>
                </div>
              ) : filtered.length === 0 ? (
                <div className="py-16 text-center space-y-2">
                  <Bell className="w-8 h-8 mx-auto text-slate-300 dark:text-slate-700" />
                  <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                    No notifications in this tab
                  </p>
                  <p className="text-xs text-slate-400">
                    Order updates, customer chats, and escrow payments will appear here.
                  </p>
                </div>
              ) : (
                filtered.map((item) => {
                  const id = item._id || item.id || '';
                  const isSelected = selectedIds.has(id);

                  return (
                    <div
                      key={id}
                      onClick={() => handleNotificationClick(item)}
                      className={`p-3.5 rounded-2xl border transition-all cursor-pointer space-y-1.5 ${
                        isSelected
                          ? 'border-emerald-500 bg-emerald-50/70 dark:bg-emerald-950/40 ring-1 ring-emerald-500/50'
                          : item.isRead
                          ? 'border-slate-100 dark:border-slate-800/60 bg-white dark:bg-slate-900/40 text-slate-600 dark:text-slate-400'
                          : 'border-emerald-200 dark:border-emerald-800/60 bg-emerald-50/40 dark:bg-emerald-950/20 text-slate-900 dark:text-slate-100 shadow-xs'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2">
                          {isSelectionMode && (
                            <div className="shrink-0 text-emerald-600">
                              {isSelected ? (
                                <CheckSquare className="w-4 h-4" />
                              ) : (
                                <Square className="w-4 h-4 text-slate-400" />
                              )}
                            </div>
                          )}
                          <div className="p-1.5 rounded-lg bg-white dark:bg-slate-800 shadow-2xs shrink-0">
                            {getNotificationIcon(item.type)}
                          </div>
                          <span className="font-bold text-xs line-clamp-1">
                            {item.title}
                          </span>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
                          {item.portal && (
                            <span className="px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider bg-slate-100 dark:bg-slate-800 text-slate-500">
                              {item.portal}
                            </span>
                          )}
                          {!item.isRead && (
                            <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                          )}
                        </div>
                      </div>

                      <p className="text-xs leading-relaxed pl-7 text-slate-600 dark:text-slate-300 line-clamp-2">
                        {item.message}
                      </p>

                      <div className="flex items-center justify-between pl-7 pt-1 text-[10px] text-slate-400">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {new Date(item.createdAt).toLocaleDateString()}
                        </span>
                        <span className="font-bold text-emerald-600 dark:text-emerald-400 hover:underline">
                          {item.type === 'message' ? 'Open Chat →' : 'View →'}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Centered Notification Detail Modal for System Notifications */}
      <NotificationDetailModal
        isOpen={isDetailModalOpen}
        notification={selectedNotification}
        onClose={() => {
          setIsDetailModalOpen(false);
          setSelectedNotification(null);
        }}
        onDelete={handleDeleteFromModal}
      />
    </>
  );
};
