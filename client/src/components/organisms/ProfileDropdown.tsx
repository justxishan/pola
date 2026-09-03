import React, { useRef, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { useTranslation } from '@/lib/i18n';
import { Avatar } from '@/components/atoms/Avatar';
import { Badge } from '@/components/atoms/Badge';
import { ConfirmDialog } from '@/components/molecules/ConfirmDialog';
import {
  User,
  ShieldCheck,
  Wallet,
  Package,
  LayoutGrid,
  Settings,
  LogOut,
  ChevronRight,
  ExternalLink,
  MessageSquare,
  HelpCircle,
} from 'lucide-react';
import toast from 'react-hot-toast';

export interface ProfileDropdownProps {
  isOpen: boolean;
  onClose: () => void;
  className?: string;
}

export const ProfileDropdown: React.FC<ProfileDropdownProps> = ({
  isOpen,
  onClose,
  className,
}) => {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const { t } = useTranslation();
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [isSignOutConfirmOpen, setIsSignOutConfirmOpen] = useState(false);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // Don't close dropdown if clicking inside confirm dialog
      if (isSignOutConfirmOpen) return;
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose, isSignOutConfirmOpen]);

  if (!isOpen || !user) return null;

  const isVerified = user.kycStatus === 'verified';
  const roleName = (user.role || 'customer_b2c').replace(/_/g, ' ').toUpperCase();

  const handleSignOut = () => {
    setIsSignOutConfirmOpen(false);
    logout();
    onClose();
    toast.success('Signed out successfully');
    navigate('/');
  };

  const getPortalLink = () => {
    if (user.role?.startsWith('farmer') || user.role === 'collector') return '/farmer/dashboard';
    if (user.role?.startsWith('delivery')) return '/delivery/dashboard';
    if (user.role?.startsWith('admin')) return '/admin/dashboard';
    return '/';
  };

  return (
    <div
      ref={dropdownRef}
      className={`absolute right-0 top-full mt-2 w-80 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-2xl z-50 p-4 space-y-4 animate-in fade-in slide-in-from-top-2 duration-150 ${className || ''}`}
    >
      {/* User Header Summary */}
      <div className="flex items-center gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
        <Avatar
          src={user.avatarUrl}
          name={user.fullName || user.email}
          size="md"
          isOnline
        />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <h4 className="font-bold text-slate-900 dark:text-slate-100 text-sm truncate">
              {user.fullName || 'User Profile'}
            </h4>
            {isVerified && <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />}
          </div>
          <p className="text-xs text-slate-400 truncate">{user.email}</p>

          <div className="flex items-center gap-2 mt-1.5">
            <Badge variant={isVerified ? 'emerald' : 'amber'} size="sm">
              {isVerified ? t.verified : t.pending}
            </Badge>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 uppercase">
              {roleName}
            </span>
          </div>
        </div>
      </div>

      {/* Quick Navigation Actions */}
      <div className="space-y-1 text-xs font-semibold">
        <button
          onClick={() => {
            onClose();
            navigate('/profile/edit');
          }}
          className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 transition-colors cursor-pointer"
        >
          <div className="flex items-center gap-2.5">
            <User className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>Edit Profile</span>
          </div>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
        </button>

        <button
          onClick={() => {
            onClose();
            navigate('/messages');
          }}
          className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 transition-colors cursor-pointer"
        >
          <div className="flex items-center gap-2.5">
            <MessageSquare className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <span>Messages & Chats</span>
          </div>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
        </button>

        <button
          onClick={() => {
            onClose();
            navigate('/support');
          }}
          className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 transition-colors cursor-pointer"
        >
          <div className="flex items-center gap-2.5">
            <HelpCircle className="w-4 h-4 text-amber-600 dark:text-amber-400" />
            <span>Help & Support</span>
          </div>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
        </button>

        {/* My Orders — only shown for customer accounts */}
        {!user.role?.startsWith('farmer') &&
          user.role !== 'collector' &&
          !user.role?.startsWith('delivery') &&
          !user.role?.startsWith('admin') && (
            <button
              onClick={() => {
                onClose();
                navigate('/customer/orders');
              }}
              className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-2.5">
                <Package className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>My Orders</span>
              </div>
              <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            </button>
          )}

        <button
          onClick={() => {
            onClose();
            navigate('/auth/kyc');
          }}
          className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 transition-colors cursor-pointer"
        >
          <div className="flex items-center gap-2.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>NIC & KYC Verification</span>
          </div>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
        </button>

        <button
          onClick={() => {
            onClose();
            navigate('/portals');
          }}
          className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 transition-colors cursor-pointer"
        >
          <div className="flex items-center gap-2.5">
            <ExternalLink className="w-4 h-4 text-purple-600 dark:text-purple-400" />
            <span>{t.fourPortals} Directory</span>
          </div>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
        </button>
      </div>

      {/* Sign Out Button */}
      <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
        <button
          onClick={() => setIsSignOutConfirmOpen(true)}
          className="w-full flex items-center gap-2.5 p-2.5 rounded-xl text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors text-xs font-bold cursor-pointer"
        >
          <LogOut className="w-4 h-4" />
          <span>{t.signOut}</span>
        </button>
      </div>

      <ConfirmDialog
        isOpen={isSignOutConfirmOpen}
        onCancel={() => setIsSignOutConfirmOpen(false)}
        onConfirm={handleSignOut}
        title="Sign Out"
        description="Are you sure you want to end your active session and sign out of Pola?"
        confirmText="Sign Out"
        cancelText="Cancel"
        isDestructive={true}
      />
    </div>
  );
};
