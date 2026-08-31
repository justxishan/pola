import React from 'react';
import { cn } from '@/lib/cn';
import { Sprout } from 'lucide-react';

export interface AuthLayoutProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  footerContent?: React.ReactNode;
  className?: string;
}

export const AuthLayout: React.FC<AuthLayoutProps> = ({
  title,
  subtitle,
  children,
  footerContent,
  className,
}) => {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      {/* Brand Header */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center space-y-2">
        <a href="/" className="inline-flex items-center gap-2 group">
          <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-emerald-500/20 shadow-md group-hover:scale-105 transition-transform">
            <Sprout className="w-7 h-7" />
          </div>
          <span className="text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
            Pola <span className="text-emerald-600 dark:text-emerald-400">.lk</span>
          </span>
        </a>
        <h2 className="text-xl font-extrabold text-slate-900 dark:text-slate-100">{title}</h2>
        {subtitle && <p className="text-xs text-slate-500 dark:text-slate-400">{subtitle}</p>}
      </div>

      {/* Card Body */}
      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <div
          className={cn(
            'bg-white dark:bg-slate-900 py-8 px-6 sm:px-8 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xl space-y-6',
            className
          )}
        >
          {children}
        </div>

        {footerContent && (
          <div className="mt-6 text-center text-xs text-slate-500 dark:text-slate-400">
            {footerContent}
          </div>
        )}
      </div>
    </div>
  );
};
