import React from 'react';
import { cn } from '@/lib/cn';
import { ChevronRight, Home } from 'lucide-react';

export interface BreadcrumbItem {
  label: string;
  path?: string;
}

export interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  onNavigate?: (path: string) => void;
  className?: string;
}

export const Breadcrumbs: React.FC<BreadcrumbsProps> = ({
  items,
  onNavigate,
  className,
}) => {
  return (
    <nav
      aria-label="Breadcrumbs"
      className={cn('flex items-center gap-1.5 text-xs text-slate-400 font-medium', className)}
    >
      <a
        href="/"
        onClick={(e) => {
          if (onNavigate) {
            e.preventDefault();
            onNavigate('/');
          }
        }}
        className="hover:text-emerald-600 transition-colors flex items-center gap-1"
      >
        <Home className="w-3.5 h-3.5" />
      </a>

      {items.map((item, idx) => {
        const isLast = idx === items.length - 1;

        return (
          <React.Fragment key={idx}>
            <ChevronRight className="w-3.5 h-3.5 text-slate-300 dark:text-slate-700 shrink-0" />
            {isLast || !item.path ? (
              <span className="text-slate-800 dark:text-slate-200 font-semibold truncate">
                {item.label}
              </span>
            ) : (
              <a
                href={item.path}
                onClick={(e) => {
                  if (onNavigate && item.path) {
                    e.preventDefault();
                    onNavigate(item.path);
                  }
                }}
                className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors truncate"
              >
                {item.label}
              </a>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
};
