import React, { useState } from 'react';
import { cn } from '@/lib/cn';
import { LanguageCode } from '@/lib/i18n';
import { ProfileDropdown } from '@/components/organisms/ProfileDropdown';
import { SidebarNavItem } from '@/components/templates/DashboardLayout';
import {
  Bell,
  ChevronDown,
} from 'lucide-react';

export interface TopNavProps {
  portalTitle: string;
  portalRole: string;
  items: SidebarNavItem[];
  activePath: string;
  onNavigate: (path: string) => void;
  currentLanguage?: LanguageCode;
  onLanguageChange?: (lang: LanguageCode) => void;
  isDark?: boolean;
  onToggleTheme?: () => void;
  displayedUnreadCount: number;
  onOpenNotifications: () => void;
  user?: {
    name?: string;
    email: string;
    avatar?: string;
    role?: string;
  };
  onRequestSignOut?: () => void;
  theme: {
    accentBg: string;
    accentText: string;
    activePill: string;
    accentRing: string;
    dotColor: string;
    icon: React.ReactNode;
    avatarBg: string;
  };
}

export const TopNav: React.FC<TopNavProps> = ({
  portalTitle,
  portalRole,
  items,
  activePath,
  onNavigate,
  currentLanguage,
  onLanguageChange,
  isDark,
  onToggleTheme,
  displayedUnreadCount,
  onOpenNotifications,
  user,
  onRequestSignOut,
  theme,
}) => {
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  return (
    <header className="sticky top-3 z-30 px-3 sm:px-6 w-full max-w-[1440px] mx-auto">
      <div className="rounded-full bg-slate-900/95 dark:bg-slate-900/95 text-white backdrop-blur-xl border border-slate-700/60 shadow-xl shadow-black/20 px-3 sm:px-5 py-2 flex items-center justify-between gap-2 sm:gap-4 transition-all">
        {/* Left: Brand / Portal Icon & Title */}
        <div className="flex items-center gap-2.5 shrink-0">
          <div
            className={cn(
              'w-8 h-8 rounded-full flex items-center justify-center font-black shadow-md cursor-pointer shrink-0',
              theme.accentBg
            )}
            onClick={() => onNavigate(items[0]?.path || '/')}
            title={portalTitle}
          >
            {theme.icon}
          </div>
          <div className="hidden xl:block min-w-0">
            <h2 className="text-xs font-black text-white tracking-tight leading-none truncate">
              {portalTitle}
            </h2>
            <span
              className={cn(
                'text-[9px] font-bold uppercase tracking-wider font-mono block mt-0.5',
                theme.accentText
              )}
            >
              {portalRole.replace(/_/g, ' ')}
            </span>
          </div>
        </div>

        {/* Center: Horizontal Pill Nav Links (Desktop) */}
        <nav className="hidden md:flex items-center gap-1 overflow-x-auto no-scrollbar py-0.5">
          {items.map((item) => {
            const isActive =
              activePath === item.path ||
              (item.path !== '/' && activePath.startsWith(item.path));

            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.path)}
                className={cn(
                  'relative flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 whitespace-nowrap cursor-pointer',
                  isActive
                    ? theme.activePill
                    : 'text-slate-300 hover:text-white hover:bg-white/10'
                )}
                title={item.label}
              >
                <span className="w-4 h-4 shrink-0 flex items-center justify-center">
                  {item.icon}
                </span>
                <span className={cn('transition-all', isActive ? 'inline font-bold' : 'hidden xl:inline')}>
                  {item.label}
                </span>
                {item.badgeCount !== undefined && item.badgeCount > 0 && (
                  <span
                    className={cn(
                      'ml-0.5 px-1.5 py-0.2 rounded-full text-[9px] font-mono font-black',
                      isActive
                        ? 'bg-slate-950 text-white'
                        : 'bg-red-500 text-white'
                    )}
                  >
                    {item.badgeCount}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Right: Actions Cluster */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Notification Bell */}
          <button
            onClick={onOpenNotifications}
            className="relative p-2 rounded-full bg-white/10 border border-white/10 text-slate-300 hover:text-white hover:bg-white/15 transition-all cursor-pointer"
            aria-label="Notifications"
          >
            <Bell className="w-4 h-4" />
            {displayedUnreadCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 min-w-[15px] h-3.5 px-0.5 rounded-full text-[9px] font-black text-white flex items-center justify-center leading-none ring-1 ring-slate-900 bg-red-500">
                {displayedUnreadCount > 9 ? '9+' : displayedUnreadCount}
              </span>
            )}
          </button>

          {/* User Profile Capsule (Icon-only Trigger) */}
          {user && (
            <div className="relative">
              <button
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="flex items-center gap-1.5 p-1 pr-2 rounded-full bg-white/10 border border-white/10 hover:bg-white/20 text-white transition-all cursor-pointer"
                title={user.name || user.email}
              >
                <div
                  className={cn(
                    'w-7 h-7 rounded-full flex items-center justify-center font-black text-xs text-slate-950 shadow-xs',
                    theme.avatarBg
                  )}
                >
                  {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              <ProfileDropdown
                isOpen={isProfileOpen}
                onClose={() => setIsProfileOpen(false)}
                currentLanguage={currentLanguage}
                onLanguageChange={onLanguageChange}
                isDark={isDark}
                onToggleTheme={onToggleTheme}
              />
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
