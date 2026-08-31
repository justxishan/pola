import React from 'react';
import { cn } from '@/lib/cn';
import { Avatar } from '@/components/atoms/Avatar';
import {
  ChevronLeft,
  ChevronRight,
  LogOut,
  Sprout,
  ShoppingBag,
  Truck,
  ShieldCheck,
  LayoutDashboard,
  Package,
  Wallet,
  Building,
  CreditCard,
  AlertTriangle,
  Radar,
} from 'lucide-react';

export interface SidebarNavItem {
  id: string;
  label: string;
  labelSi?: string;
  icon: React.ReactNode;
  path: string;
  badgeCount?: number;
}

export interface SidebarProps {
  portalTitle: string;
  portalRole: string;
  items: SidebarNavItem[];
  activePath: string;
  onNavigate: (path: string) => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  user?: {
    name?: string;
    email: string;
    avatar?: string;
    role?: string;
  };
  onLogout?: () => void;
  className?: string;
}

export const Sidebar: React.FC<SidebarProps> = ({
  portalTitle,
  portalRole,
  items,
  activePath,
  onNavigate,
  isCollapsed,
  onToggleCollapse,
  user,
  onLogout,
  className,
}) => {
  // Determine portal brand theme
  const getPortalTheme = () => {
    const r = portalRole.toLowerCase();
    if (r.includes('farmer') || r.includes('collector')) {
      return {
        accentBg: 'bg-lime-400',
        accentText: 'text-lime-300',
        activePill: 'bg-lime-400 text-slate-950 font-black shadow-lg shadow-lime-500/20',
        icon: <Sprout className="w-5 h-5 text-slate-950" />,
      };
    }
    if (r.includes('delivery')) {
      return {
        accentBg: 'bg-yellow-400',
        accentText: 'text-yellow-300',
        activePill: 'bg-yellow-400 text-slate-950 font-black shadow-lg shadow-yellow-500/20',
        icon: <Truck className="w-5 h-5 text-slate-950" />,
      };
    }
    if (r.includes('admin')) {
      return {
        accentBg: 'bg-teal-400',
        accentText: 'text-teal-300',
        activePill: 'bg-teal-400 text-slate-950 font-black shadow-lg shadow-teal-500/20',
        icon: <ShieldCheck className="w-5 h-5 text-slate-950" />,
      };
    }
    return {
      accentBg: 'bg-emerald-400',
      accentText: 'text-emerald-300',
      activePill: 'bg-emerald-400 text-slate-950 font-black shadow-lg shadow-emerald-500/20',
      icon: <ShoppingBag className="w-5 h-5 text-slate-950" />,
    };
  };

  const theme = getPortalTheme();

  return (
    <aside
      className={cn(
        'h-screen sticky top-0 bg-slate-950 border-r border-white/10 text-white flex flex-col justify-between transition-all duration-300 z-30 shrink-0 select-none backdrop-blur-2xl',
        isCollapsed ? 'w-20' : 'w-64',
        className
      )}
    >
      {/* Top Brand Header */}
      <div>
        <div className="h-20 px-4 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-3 min-w-0">
            <div className={`w-10 h-10 rounded-2xl ${theme.accentBg} flex items-center justify-center shrink-0 shadow-md shadow-black/40`}>
              {theme.icon}
            </div>
            {!isCollapsed && (
              <div className="min-w-0">
                <span className="font-black text-sm text-white tracking-tight truncate block">
                  {portalTitle}
                </span>
                <span className={`text-[10px] font-bold ${theme.accentText} uppercase tracking-wider block font-mono`}>
                  {portalRole.replace(/_/g, ' ')}
                </span>
              </div>
            )}
          </div>

          <button
            onClick={onToggleCollapse}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="p-3 space-y-1.5 overflow-y-auto">
          {items.map((item) => {
            const isActive = activePath === item.path;
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.path)}
                className={cn(
                  'w-full flex items-center gap-3 px-3.5 py-3 rounded-2xl text-xs font-extrabold transition-all duration-200 cursor-pointer group',
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

      {/* Bottom User & Logout Profile Card */}
      <div className="p-3 border-t border-white/10 space-y-2 bg-black/40">
        <div
          className={cn(
            'flex items-center gap-3 p-2 rounded-2xl bg-white/5 border border-white/10',
            isCollapsed && 'justify-center p-2'
          )}
        >
          <Avatar
            src={user?.avatar}
            name={user?.name || user?.email || 'User'}
            size="sm"
            isOnline
          />
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
