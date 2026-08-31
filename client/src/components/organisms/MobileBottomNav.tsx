import React from 'react';
import { cn } from '@/lib/cn';

export interface MobileNavItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  path: string;
  badgeCount?: number;
}

export interface MobileBottomNavProps {
  items: MobileNavItem[];
  activePath: string;
  onNavigate: (path: string) => void;
  className?: string;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  items,
  activePath,
  onNavigate,
  className,
}) => {
  return (
    <div
      className={cn(
        'md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 px-2 py-1 flex items-center justify-around shadow-lg select-none',
        className
      )}
    >
      {items.map((item) => {
        const isActive = activePath === item.path;

        return (
          <button
            key={item.id}
            onClick={() => onNavigate(item.path)}
            className={cn(
              'flex flex-col items-center justify-center py-1.5 px-3 rounded-xl transition-all duration-200 cursor-pointer relative',
              isActive
                ? 'text-emerald-600 dark:text-emerald-400 font-bold'
                : 'text-slate-400 dark:text-slate-500 hover:text-slate-600'
            )}
          >
            <div className="relative">
              <div className="w-5 h-5 flex items-center justify-center">{item.icon}</div>
              {typeof item.badgeCount === 'number' && item.badgeCount > 0 && (
                <span className="absolute -top-1 -right-2 w-4 h-4 bg-emerald-600 text-white rounded-full text-[9px] font-bold flex items-center justify-center ring-2 ring-white dark:ring-slate-900">
                  {item.badgeCount}
                </span>
              )}
            </div>
            <span className="text-[10px] mt-1 tracking-tight">{item.label}</span>
          </button>
        );
      })}
    </div>
  );
};
