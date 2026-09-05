import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { NotificationService } from '@/services/notification.service';
import { resolveNotificationPath } from '@/lib/routeResolver';
import { Button } from '@/components/atoms/Button';
import { Badge } from '@/components/atoms/Badge';
import {
  X,
  Trash2,
  ExternalLink,
  Package,
  Wallet,
  Truck,
  ShieldCheck,
  Info,
  Clock,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { NotificationItem } from '@/components/organisms/NotificationDrawer';

export interface NotificationDetailModalProps {
  isOpen: boolean;
  notification: NotificationItem | null;
  onClose: () => void;
  onDelete?: (id: string) => void;
}

export const NotificationDetailModal: React.FC<NotificationDetailModalProps> = ({
  isOpen,
  notification,
  onClose,
  onDelete,
}) => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [isDeleting, setIsDeleting] = useState(false);

  if (!isOpen || !notification) return null;

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'order':
        return <Package className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />;
      case 'wallet':
      case 'payout':
        return <Wallet className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />;
      case 'delivery':
        return <Truck className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />;
      case 'kyc':
        return <ShieldCheck className="w-6 h-6 text-sky-600 dark:text-sky-400" />;
      default:
        return <Info className="w-6 h-6 text-slate-500" />;
    }
  };

  const resolvedPath = resolveNotificationPath(notification, user?.role);
  const formattedDate = notification.createdAt
    ? new Date(notification.createdAt).toLocaleString(undefined, {
        dateStyle: 'medium',
        timeStyle: 'short',
      })
    : '';

  const handleDelete = async () => {
    const id = notification._id || notification.id;
    if (!id) return;
    try {
      setIsDeleting(true);
      await NotificationService.deleteNotification(id);
      toast.success('Notification deleted');
      if (onDelete) onDelete(id);
      onClose();
    } catch (err) {
      toast.error('Failed to delete notification');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleNavigate = () => {
    if (resolvedPath) {
      onClose();
      navigate(resolvedPath);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity animate-in fade-in"
        onClick={onClose}
      />

      {/* Dialog Card */}
      <div className="relative w-full max-w-lg rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-2xl z-10 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-slate-100 dark:border-slate-800 flex items-start justify-between gap-4 bg-slate-50/50 dark:bg-slate-900/50">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0">
              {getNotificationIcon(notification.type)}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-200/70 dark:bg-slate-800 text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                  {notification.type}
                </span>
                {notification.portal && (
                  <Badge variant="outline" size="sm">
                    {notification.portal.toUpperCase()}
                  </Badge>
                )}
              </div>
              <h3 className="font-extrabold text-base text-slate-900 dark:text-slate-100 mt-1 truncate">
                {notification.title}
              </h3>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 sm:p-6 space-y-4">
          <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium">
            <Clock className="w-3.5 h-3.5" />
            <span>{formattedDate}</span>
          </div>

          <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-line">
            {notification.message}
          </p>
        </div>

        {/* Footer Actions */}
        <div className="p-4 sm:p-5 border-t border-slate-100 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-800/40 flex items-center justify-between gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={handleDelete}
            isLoading={isDeleting}
            className="border-red-200 dark:border-red-900/50 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 text-xs"
            leftIcon={<Trash2 className="w-4 h-4" />}
          >
            Delete
          </Button>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={onClose}
              className="text-xs"
            >
              Close
            </Button>
            {resolvedPath && (
              <Button
                variant="primary"
                size="sm"
                onClick={handleNavigate}
                className="bg-emerald-600 hover:bg-emerald-500 text-xs font-bold"
                rightIcon={<ExternalLink className="w-3.5 h-3.5" />}
              >
                Go to Related Item
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
