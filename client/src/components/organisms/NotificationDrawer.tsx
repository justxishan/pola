import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from '@/lib/i18n';
import { Badge } from '@/components/atoms/Badge';
import { Button } from '@/components/atoms/Button';
import { NotificationService } from '@/services/notification.service';
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
} from 'lucide-react';

export interface NotificationItem {
  _id: string;
  id?: string;
  title: string;
  message: string;
  type: 'order' | 'payout' | 'wallet' | 'grading' | 'delivery' | 'dispute' | 'system' | 'kyc';
  isRead: boolean;
  linkUrl?: string;
  createdAt: string;
}

export interface NotificationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onRefreshCount?: () => void;
}

export const NotificationDrawer: React.FC<NotificationDrawerProps> = ({
  isOpen,
  onClose,
  onRefreshCount,
}) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'all' | 'orders' | 'wallet' | 'delivery'>('all');
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchNotifications();
    }
  }, [isOpen]);

  const fetchNotifications = async () => {
    try {
      setIsLoading(true);
      const res: any = await NotificationService.getMyNotifications();
      if (res.success && res.data) {
        setNotifications(res.data.notifications || []);
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
      await NotificationService.markAsRead('all');
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      if (onRefreshCount) onRefreshCount();
    } catch (err) {
      console.error(err);
    }
  };

  const handleNotificationClick = async (item: NotificationItem) => {
    if (!item.isRead) {
      try {
        await NotificationService.markAsRead(item._id || item.id || '');
        setNotifications((prev) =>
          prev.map((n) => ((n._id === item._id || n.id === item.id) ? { ...n, isRead: true } : n))
        );
        if (onRefreshCount) onRefreshCount();
      } catch (err) {}
    }
    if (item.linkUrl) {
      onClose();
      navigate(item.linkUrl);
    }
  };

  const filtered = notifications.filter((n) => {
    if (activeTab === 'orders') return n.type === 'order';
    if (activeTab === 'wallet') return n.type === 'wallet' || n.type === 'payout';
    if (activeTab === 'delivery') return n.type === 'delivery';
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
      default:
        return <Info className="w-4 h-4 text-slate-500" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity animate-in fade-in"
        onClick={onClose}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white dark:bg-slate-900 shadow-2xl border-l border-slate-200 dark:border-slate-800 flex flex-col">
          {/* Header */}
          <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
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

            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
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
                className="p-2 rounded-xl text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Filter Pills */}
          <div className="px-5 py-3 border-b border-slate-100 dark:border-slate-800 flex gap-2 overflow-x-auto no-scrollbar">
            {(['all', 'orders', 'wallet', 'delivery'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-3 py-1.5 rounded-full text-xs font-bold transition-colors capitalize shrink-0 cursor-pointer ${
                  activeTab === tab
                    ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto p-5 space-y-3">
            {isLoading ? (
              <div className="py-12 text-center text-xs text-slate-400">
                Loading notifications...
              </div>
            ) : filtered.length === 0 ? (
              <div className="py-16 text-center space-y-2">
                <Bell className="w-8 h-8 mx-auto text-slate-300 dark:text-slate-700" />
                <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                  No notifications yet
                </p>
                <p className="text-xs text-slate-400">
                  We will notify you about farm orders, delivery updates, and escrow payouts.
                </p>
              </div>
            ) : (
              filtered.map((item) => (
                <div
                  key={item._id || item.id}
                  onClick={() => handleNotificationClick(item)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer space-y-1.5 ${
                    item.isRead
                      ? 'border-slate-100 dark:border-slate-800/60 bg-white dark:bg-slate-900/40 text-slate-600 dark:text-slate-400'
                      : 'border-emerald-200 dark:border-emerald-800/60 bg-emerald-50/40 dark:bg-emerald-950/20 text-slate-900 dark:text-slate-100 shadow-xs'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 rounded-lg bg-white dark:bg-slate-800 shadow-2xs">
                        {getNotificationIcon(item.type)}
                      </div>
                      <span className="font-bold text-xs">
                        {item.title}
                      </span>
                    </div>

                    {!item.isRead && (
                      <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0 mt-1.5" />
                    )}
                  </div>

                  <p className="text-xs leading-relaxed pl-8 text-slate-600 dark:text-slate-300">
                    {item.message}
                  </p>

                  <div className="flex items-center justify-between pl-8 pt-1 text-[10px] text-slate-400">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {new Date(item.createdAt).toLocaleDateString()}
                    </span>
                    {item.linkUrl && (
                      <span className="font-bold text-emerald-600 dark:text-emerald-400 hover:underline">
                        View details →
                      </span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
