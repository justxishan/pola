import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { cn } from '@/lib/cn';
import { useTranslation, LanguageCode } from '@/lib/i18n';
import { useThemeStore } from '@/store/themeStore';
import { TopNav } from '@/components/organisms/TopNav';
import { NotificationDrawer } from '@/components/organisms/NotificationDrawer';
import { ConfirmDialog } from '@/components/molecules/ConfirmDialog';
import { MobileBottomNav, MobileNavItem } from '@/components/organisms/MobileBottomNav';
import { NotificationService } from '@/services/notification.service';
import {
  Sprout,
  Truck,
  ShieldCheck,
  ShoppingBag,
} from 'lucide-react';

export interface SidebarNavItem {
  id: string;
  label: string;
  labelSi?: string;
  icon: React.ReactNode;
  path: string;
  badgeCount?: number;
}

export interface DashboardLayoutProps {
  portalTitle: string;
  portalRole: string;
  navItems: SidebarNavItem[];
  mobileNavItems?: MobileNavItem[];
  activePath?: string; // optional, falls back to location.pathname
  onNavigate: (path: string) => void;
  currentLanguage?: LanguageCode;
  onLanguageChange?: (lang: LanguageCode) => void;
  isDark?: boolean;
  onToggleTheme?: () => void;
  unreadNotificationsCount?: number;
  user?: {
    name?: string;
    email: string;
    avatar?: string;
    role?: string;
  };
  onLogout?: () => void;
  children: React.ReactNode;
  className?: string;
}

// ─── Portal theme helpers ────────────────────────────────────────────────────
export function getPortalTheme(portalRole: string) {
  const r = portalRole.toLowerCase();
  if (r.includes('farmer') || r.includes('collector'))
    return {
      accentBg: 'bg-lime-400',
      accentText: 'text-lime-300',
      activePill: 'bg-lime-400 text-slate-950 font-black shadow-lg shadow-lime-500/20',
      accentRing: 'ring-lime-400/40',
      dotColor: 'bg-lime-400',
      icon: <Sprout className="w-4 h-4 text-slate-950" />,
      avatarBg: 'bg-lime-400',
    };
  if (r.includes('delivery'))
    return {
      accentBg: 'bg-yellow-400',
      accentText: 'text-yellow-300',
      activePill: 'bg-yellow-400 text-slate-950 font-black shadow-lg shadow-yellow-500/20',
      accentRing: 'ring-yellow-400/40',
      dotColor: 'bg-yellow-400',
      icon: <Truck className="w-4 h-4 text-slate-950" />,
      avatarBg: 'bg-yellow-400',
    };
  if (r.includes('admin'))
    return {
      accentBg: 'bg-teal-400',
      accentText: 'text-teal-300',
      activePill: 'bg-teal-400 text-slate-950 font-black shadow-lg shadow-teal-500/20',
      accentRing: 'ring-teal-400/40',
      dotColor: 'bg-teal-400',
      icon: <ShieldCheck className="w-4 h-4 text-slate-950" />,
      avatarBg: 'bg-teal-400',
    };
  return {
    accentBg: 'bg-emerald-400',
    accentText: 'text-emerald-300',
    activePill: 'bg-emerald-400 text-slate-950 font-black shadow-lg shadow-emerald-500/20',
    accentRing: 'ring-emerald-400/40',
    dotColor: 'bg-emerald-400',
    icon: <ShoppingBag className="w-4 h-4 text-slate-950" />,
    avatarBg: 'bg-emerald-400',
  };
}

// ─── DashboardLayout (Portal Top Nav + Full-width Content) ───────────────────
export const DashboardLayout: React.FC<DashboardLayoutProps> = ({
  portalTitle,
  portalRole,
  navItems,
  mobileNavItems,
  activePath,
  onNavigate,
  currentLanguage,
  onLanguageChange,
  isDark: propIsDark,
  onToggleTheme: propToggleTheme,
  unreadNotificationsCount,
  user,
  onLogout,
  children,
  className,
}) => {
  const { language, setLanguage } = useTranslation();
  const { isDark, toggleTheme } = useThemeStore();
  const location = useLocation();

  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isSignOutConfirmOpen, setIsSignOutConfirmOpen] = useState(false);
  const [liveUnreadCount, setLiveUnreadCount] = useState(0);
  const pollIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const theme = getPortalTheme(portalRole);
  const currentActivePath = activePath || location.pathname;

  const fetchUnreadCount = async () => {
    try {
      const res: any = await NotificationService.getMyNotifications();
      if (res?.data?.notifications) {
        const count = res.data.notifications.filter((n: any) => !n.isRead).length;
        setLiveUnreadCount(count);
      }
    } catch {
      // silently fail
    }
  };

  useEffect(() => {
    if (!user) return;
    if (unreadNotificationsCount !== undefined) return;
    fetchUnreadCount();
    pollIntervalRef.current = setInterval(fetchUnreadCount, 30_000);

    const handleInstantAlert = () => {
      fetchUnreadCount();
    };
    window.addEventListener('pola:notification:new', handleInstantAlert);

    return () => {
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
      window.removeEventListener('pola:notification:new', handleInstantAlert);
    };
  }, [user, unreadNotificationsCount]);

  const displayedUnreadCount = unreadNotificationsCount ?? liveUnreadCount;

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col transition-colors duration-300 selection:bg-lime-400 selection:text-slate-950">
      {/* ── Top Floating Navigation Bar ─────────────────────────────── */}
      <TopNav
        portalTitle={portalTitle}
        portalRole={portalRole}
        items={navItems}
        activePath={currentActivePath}
        onNavigate={onNavigate}
        currentLanguage={currentLanguage || language}
        onLanguageChange={onLanguageChange || setLanguage}
        isDark={propIsDark !== undefined ? propIsDark : isDark}
        onToggleTheme={propToggleTheme || toggleTheme}
        displayedUnreadCount={displayedUnreadCount}
        onOpenNotifications={() => setIsNotificationsOpen(true)}
        user={user}
        onRequestSignOut={() => setIsSignOutConfirmOpen(true)}
        theme={theme}
      />

      {/* ── Main Full-Width Content ─────────────────────────────────── */}
      <main
        className={cn(
          'flex-1 p-4 sm:p-6 lg:p-8 max-w-[1440px] w-full mx-auto pb-24 md:pb-12 space-y-6',
          className
        )}
      >
        {children}
      </main>

      {/* ── Notifications Drawer ────────────────────────────────────── */}
      <NotificationDrawer
        isOpen={isNotificationsOpen}
        onClose={() => {
          setIsNotificationsOpen(false);
          if (unreadNotificationsCount === undefined) fetchUnreadCount();
        }}
      />

      {/* ── Mobile Bottom Navigation ────────────────────────────────── */}
      {mobileNavItems && mobileNavItems.length > 0 && (
        <MobileBottomNav
          items={mobileNavItems}
          activePath={currentActivePath}
          onNavigate={onNavigate}
        />
      )}

      {/* ── Centered Sign Out Confirmation Dialog ───────────────────── */}
      <ConfirmDialog
        isOpen={isSignOutConfirmOpen}
        title="Sign Out of Pola?"
        description="Are you sure you want to end your active session? You will need your login credentials to sign back in."
        confirmText="Sign Out"
        cancelText="Stay Logged In"
        isDestructive={true}
        onConfirm={() => {
          setIsSignOutConfirmOpen(false);
          onLogout?.();
        }}
        onCancel={() => setIsSignOutConfirmOpen(false)}
      />
    </div>
  );
};
