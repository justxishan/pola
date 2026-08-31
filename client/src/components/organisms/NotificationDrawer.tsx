import React, { useState } from 'react';
import { useTranslation } from '@/lib/i18n';
import { Badge } from '@/components/atoms/Badge';
import { Button } from '@/components/atoms/Button';
import {
  Bell,
  X,
  CheckCircle2,
  AlertTriangle,
  Info,
  Clock,
  CheckCheck,
} from 'lucide-react';

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: 'order' | 'payout' | 'system' | 'kyc';
  isRead: boolean;
  createdAt: string;
}

export interface NotificationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NotificationDrawer: React.FC<NotificationDrawerProps> = ({
  isOpen,
  onClose,
}) => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<'all' | 'orders' | 'payouts' | 'system'>('all');

  const [notifications, setNotifications] = useState<NotificationItem[]>([
    {
      id: '1',
      title: 'Upcoming Village Hub Intake',
      message: 'Keppetipola Hub intake scheduled for tomorrow at 06:00 AM. Please prepare your crates.',
      type: 'order',
      isRead: false,
      createdAt: '10m ago',
    },
    {
      id: '2',
      title: 'LankaPay Payout Cleared',
      message: 'Your bank withdrawal request for LKR 25,000.00 has been processed to Bank of Ceylon.',
      type: 'payout',
      isRead: false,
      createdAt: '2h ago',
    },
    {
      id: '3',
      title: 'Quality Grade A Confirmed',
      message: 'Your 120kg Kuroda Carrot delivery received Grade A (100% price multiplier) at Dambulla DC.',
      type: 'system',
      isRead: true,
      createdAt: '1d ago',
    },
  ]);

  if (!isOpen) return null;

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  const filtered = notifications.filter((n) => {
    if (activeTab === 'orders') return n.type === 'order';
    if (activeTab === 'payouts') return n.type === 'payout';
    if (activeTab === 'system') return n.type === 'system' || n.type === 'kyc';
    return true;
  });

  const unreadCount = notifications.filter((n) => !n.isRead).length;

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
                  className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <CheckCheck className="w-3.5 h-3.5" />
                  <span>Mark all read</span>
                </button>
              )}
              <button
                onClick={onClose}
                className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Filter Tabs */}
          <div className="flex border-b border-slate-100 dark:border-slate-800 px-4 pt-2 gap-2 text-xs font-bold">
            {(['all', 'orders', 'payouts', 'system'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`pb-2.5 px-2 border-b-2 transition-colors capitalize cursor-pointer ${
                  activeTab === tab
                    ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400'
                    : 'border-transparent text-slate-400 hover:text-slate-600'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {filtered.length === 0 ? (
              <div className="py-20 text-center text-xs text-slate-400 space-y-2">
                <Bell className="w-8 h-8 mx-auto text-slate-300 dark:text-slate-700" />
                <p>No notifications in this category.</p>
              </div>
            ) : (
              filtered.map((item) => (
                <div
                  key={item.id}
                  className={`p-4 rounded-2xl border transition-all ${
                    item.isRead
                      ? 'bg-slate-50/60 dark:bg-slate-800/30 border-slate-100 dark:border-slate-800'
                      : 'bg-white dark:bg-slate-800 border-emerald-500/30 shadow-xs'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      {!item.isRead && (
                        <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                      )}
                      <h4 className="font-bold text-slate-900 dark:text-slate-100 text-xs">
                        {item.title}
                      </h4>
                    </div>
                    <span className="text-[10px] text-slate-400 shrink-0">{item.createdAt}</span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed">
                    {item.message}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
