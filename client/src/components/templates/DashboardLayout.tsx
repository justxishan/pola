import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { cn } from '@/lib/cn';
import { useTranslation, LanguageCode } from '@/lib/i18n';
import { useThemeStore } from '@/store/themeStore';
import { ProfileDropdown } from '@/components/organisms/ProfileDropdown';
import { NotificationDrawer } from '@/components/organisms/NotificationDrawer';
import { Avatar } from '@/components/atoms/Avatar';
import { MobileBottomNav, MobileNavItem } from '@/components/organisms/MobileBottomNav';
import { NotificationService } from '@/services/notification.service';
import {
  Bell,
  Sun,
  Moon,
  ChevronDown,
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
function getPortalTheme(portalRole: string) {
  const r = portalRole.toLowerCase();
  if (r.includes('farmer') || r.includes('collector'))
    return {
      accentBg: 'bg-lime-400',
      accentText: 'text-lime-300',
      activePill: 'bg-lime-400 text-slate-950 font-black shadow-lg shadow-lime-500/20',
      accentRing: 'ring-lime-400/40',
      dotColor: 'bg-lime-400',
      icon: <Sprout className="w-5 h-5 text-slate-950" />,
      avatarBg: 'bg-lime-400',
    };
  if (r.includes('delivery'))
    return {
      accentBg: 'bg-yellow-400',
      accentText: 'text-yellow-300',
      activePill: 'bg-yellow-400 text-slate-950 font-black shadow-lg shadow-yellow-500/20',
      accentRing: 'ring-yellow-400/40',
      dotColor: 'bg-yellow-400',
      icon: <Truck className="w-5 h-5 text-slate-950" />,
      avatarBg: 'bg-yellow-400',
    };
  if (r.includes('admin'))
    return {
      accentBg: 'bg-teal-400',
      accentText: 'text-teal-300',
      activePill: 'bg-teal-400 text-slate-950 font-black shadow-lg shadow-teal-500/20',
      accentRing: 'ring-teal-400/40',
      dotColor: 'bg-teal-400',
      icon: <ShieldCheck className="w-5 h-5 text-slate-950" />,
      avatarBg: 'bg-teal-400',
    };
  return {
    accentBg: 'bg-emerald-400',
    accentText: 'text-emerald-300',
    activePill: 'bg-emerald-400 text-slate-950 font-black shadow-lg shadow-emerald-500/20',
    accentRing: 'ring-emerald-400/40',
    dotColor: 'bg-emerald-400',
    icon: <ShoppingBag className="w-5 h-5 text-slate-950" />,
    avatarBg: 'bg-emerald-400',
  };
}

// ─── Collapsible Sidebar ─────────────────────────────────────────────────────
interface SidebarProps {
  portalTitle: string;
  portalRole: string;
  items: SidebarNavItem[];
  onNavigate: (path: string) => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  user?: DashboardLayoutProps['user'];
  onLogout?: () => void;
  className?: string;
}

import { ChevronLeft, ChevronRight, LogOut } from 'lucide-react';

const Sidebar: React.FC<SidebarProps> = ({
  portalTitle,
  portalRole,
  items,
  onNavigate,
  isCollapsed,
  onToggleCollapse,
  user,
  onLogout,
  className,
}) => {
  const location = useLocation();
  const theme = getPortalTheme(portalRole);

  return (
    <aside
      className={cn(
        'h-screen sticky top-0 bg-slate-950 dark:bg-slate-950 border-r border-white/10 dark:border-white/10 text-white flex flex-col justify-between transition-all duration-300 z-30 shrink-0 select-none',
        isCollapsed ? 'w-20' : 'w-64',
        className
      )}
    >
      {/* Top Brand Header */}
      <div>
        <div className="h-16 px-3 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-3 min-w-0">
            <div className={cn('w-9 h-9 rounded-xl flex items-center justify-center shrink-0 shadow-md shadow-black/40', theme.accentBg)}>
              {theme.icon}
            </div>
            {!isCollapsed && (
              <div className="min-w-0">
                <span className="font-black text-sm text-white tracking-tight truncate block">
                  {portalTitle}
                </span>
                <span className={cn('text-[10px] font-bold uppercase tracking-wider block font-mono', theme.accentText)}>
                  {portalRole.replace(/_/g, ' ')}
                </span>
              </div>
            )}
          </div>

          <button
            onClick={onToggleCollapse}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer shrink-0"
            aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="p-3 space-y-1 overflow-y-auto">
          {items.map((item) => {
            // Use location.pathname for accurate active state — never rely on hardcoded prop
            const isActive = location.pathname === item.path || location.pathname.startsWith(item.path + '/');
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.path)}
                className={cn(
                  'w-full flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-xs font-bold transition-all duration-150 cursor-pointer',
                  isActive
                    ? theme.activePill
                    : 'text-slate-300 hover:text-white hover:bg-white/10'
                )}
                title={isCollapsed ? item.label : undefined}
              >
                <div className="shrink-0">{item.icon}</div>
                {!isCollapsed && (
                  <span className="truncate flex-1 text-left">{item.label}</span>
                )}
                {!isCollapsed && item.badgeCount !== undefined && item.badgeCount > 0 && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-rose-500 text-white">
                    {item.badgeCount}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom User & Logout */}
      <div className="p-3 border-t border-white/10 space-y-2 bg-black/40">
        <div
          className={cn(
            'flex items-center gap-3 p-2.5 rounded-2xl bg-white/5 border border-white/10',
            isCollapsed && 'justify-center'
          )}
        >
          <Avatar src={user?.avatar} name={user?.name || user?.email || 'User'} size="sm" isOnline />
          {!isCollapsed && (
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-white truncate">
                {user?.name || user?.email?.split('@')[0]}
              </p>
              <p className="text-[10px] text-slate-400 truncate">{user?.email}</p>
            </div>
          )}
        </div>

        {onLogout && (
          <button
            onClick={onLogout}
            className={cn(
              'w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-2xl text-xs font-bold text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition-colors cursor-pointer',
              isCollapsed && 'justify-center'
            )}
            title="Logout"
          >
            <LogOut className="w-4 h-4 shrink-0" />
            {!isCollapsed && <span>Sign Out</span>}
          </button>
        )}
      </div>
    </aside>
  );
};

// ─── DashboardLayout (Portal Top Header + Sidebar) ───────────────────────────
export const DashboardLayout: React.FC<DashboardLayoutProps> = ({
  portalTitle,
  portalRole,
  navItems,
  mobileNavItems,
  onNavigate,
  unreadNotificationsCount,
  user,
  onLogout,
  children,
  className,
}) => {
  const { t, language, setLanguage } = useTranslation();
  const { isDark, toggleTheme } = useThemeStore();
  const navigate = useNavigate();
  const location = useLocation();

  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [liveUnreadCount, setLiveUnreadCount] = useState(0);
  const pollIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const theme = getPortalTheme(portalRole);

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
    // Only self-manage if the parent didn't pass an explicit count
    if (unreadNotificationsCount !== undefined) return;
    fetchUnreadCount();
    pollIntervalRef.current = setInterval(fetchUnreadCount, 30_000);
    return () => {
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
    };
  }, [user, unreadNotificationsCount]);

  // Use caller-supplied count when explicitly provided, else use our own live count
  const displayedUnreadCount = unreadNotificationsCount ?? liveUnreadCount;

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex transition-colors duration-300 selection:bg-lime-400 selection:text-slate-950">
      {/* ── Sidebar Navigation ──────────────────────────────────────── */}
      <Sidebar
        portalTitle={portalTitle}
        portalRole={portalRole}
        items={navItems}
        onNavigate={onNavigate}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        user={user}
        onLogout={onLogout}
        className="hidden md:flex"
      />

      {/* ── Main Content ─────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0 pb-16 md:pb-0">
        {/* Portal Top Header Bar */}
        <header className="h-16 sticky top-0 z-20 bg-white/80 dark:bg-slate-950/80 backdrop-blur-2xl border-b border-slate-200/80 dark:border-white/10 px-4 sm:px-6 flex items-center justify-between gap-4 transition-colors">
          {/* Left: Portal title / page label */}
          <div className="flex items-center gap-3 min-w-0">
            {/* Mobile brand logo */}
            <div className={cn('md:hidden w-8 h-8 rounded-xl flex items-center justify-center shrink-0', theme.accentBg)}>
              {theme.icon}
            </div>
            <div className="min-w-0">
              <h2 className="text-sm sm:text-base font-black text-slate-900 dark:text-white tracking-tight truncate">
                {portalTitle}
              </h2>
              <p className={cn('text-[10px] font-bold uppercase tracking-wider font-mono hidden sm:block', theme.accentText)}>
                {portalRole.replace(/_/g, ' ')}
              </p>
            </div>
          </div>

          {/* Right: Controls cluster */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {/* Trilingual Switcher Capsule */}
            <div className="hidden sm:flex items-center p-0.5 rounded-full bg-slate-200/60 dark:bg-white/5 border border-slate-300/80 dark:border-white/10 text-[11px] font-bold">
              {(['en', 'si', 'ta'] as const).map((lang, i) => (
                <button
                  key={lang}
                  onClick={() => setLanguage(lang)}
                  className={cn(
                    'px-2.5 py-0.5 rounded-full transition-all cursor-pointer',
                    language === lang
                      ? 'bg-white dark:bg-white/25 text-slate-900 dark:text-white shadow-xs font-black'
                      : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  )}
                >
                  {['EN', 'සිං', 'த'][i]}
                </button>
              ))}
            </div>

            {/* Theme Toggle */}
            <button
              type="button"
              onClick={toggleTheme}
              className="p-2 rounded-full bg-slate-200/60 dark:bg-white/5 border border-slate-300/80 dark:border-white/10 text-slate-700 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white transition-all cursor-pointer"
              title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {isDark
                ? <Sun className="w-3.5 h-3.5 text-amber-400" />
                : <Moon className="w-3.5 h-3.5 text-indigo-600" />}
            </button>

            {/* Notification Bell */}
            <button
              onClick={() => setIsNotificationsOpen(true)}
              className="relative p-2 rounded-full bg-slate-200/60 dark:bg-white/5 border border-slate-300/80 dark:border-white/10 text-slate-700 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white transition-all cursor-pointer"
              aria-label="Notifications"
            >
              <Bell className="w-3.5 h-3.5" />
              {displayedUnreadCount > 0 && (
                <span className={cn('absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-0.5 rounded-full text-[9px] font-black text-white flex items-center justify-center leading-none ring-1 ring-white dark:ring-slate-950 bg-red-500')} >
                  {displayedUnreadCount > 9 ? '9+' : displayedUnreadCount}
                </span>
              )}
            </button>

            {/* Profile Capsule */}
            {user && (
              <div className="relative">
                <button
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-full bg-slate-200/60 dark:bg-white/10 border border-slate-300/80 dark:border-white/15 hover:bg-slate-200 dark:hover:bg-white/20 text-slate-900 dark:text-white transition-all cursor-pointer"
                >
                  <div className={cn('w-6 h-6 rounded-full flex items-center justify-center font-black text-xs text-slate-950', theme.avatarBg)}>
                    {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <span className="hidden sm:inline text-xs font-bold truncate max-w-[80px]">
                    {user.name || user.email.split('@')[0]}
                  </span>
                  <ChevronDown className="w-3 h-3 text-slate-400" />
                </button>

                <ProfileDropdown
                  isOpen={isProfileOpen}
                  onClose={() => setIsProfileOpen(false)}
                />
              </div>
            )}
          </div>
        </header>

        {/* Page Body */}
        <main className={cn('flex-1 p-4 sm:p-8 max-w-[1400px] w-full mx-auto space-y-6', className)}>
          {children}
        </main>
      </div>

      {/* Notifications Drawer */}
      <NotificationDrawer
        isOpen={isNotificationsOpen}
        onClose={() => {
          setIsNotificationsOpen(false);
          // Refresh badge count after user reads notifications
          if (unreadNotificationsCount === undefined) fetchUnreadCount();
        }}
      />

      {/* Mobile Bottom Navigation */}
      {mobileNavItems && mobileNavItems.length > 0 && (
        <MobileBottomNav
          items={mobileNavItems}
          activePath={location.pathname}
          onNavigate={onNavigate}
        />
      )}
    </div>
  );
};
