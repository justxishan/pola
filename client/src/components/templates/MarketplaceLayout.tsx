import React from 'react';
import { cn } from '@/lib/cn';
import { Navbar, NavbarProps } from '@/components/organisms/Navbar';
import { Sprout, ShieldCheck } from 'lucide-react';
import { usePortalThemeStore } from '@/store/portalThemeStore';

export interface MarketplaceLayoutProps extends Omit<NavbarProps, 'className'> {
  children: React.ReactNode;
  className?: string;
}

export const MarketplaceLayout: React.FC<MarketplaceLayoutProps> = ({
  children,
  className,
  ...navbarProps
}) => {
  const { themes } = usePortalThemeStore();
  const bgImage = themes.customer?.bgImage || 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=2400&q=85';

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-white flex flex-col justify-between selection:bg-emerald-400 selection:text-slate-950 relative overflow-x-hidden transition-colors duration-300">
      {/* 1. Fullscreen Cinematic Bokeh Backdrop with Light/Dark adaptivity */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <img
          src={bgImage}
          alt="Marketplace Backdrop"
          className="w-full h-full object-cover dark:brightness-[0.25] dark:contrast-125 brightness-105 opacity-25 dark:opacity-100 scale-105 transition-all duration-300"
        />
        <div className="absolute inset-0 bg-radial from-transparent via-slate-100/60 dark:via-slate-950/70 to-slate-100 dark:to-slate-950" />
        <div className="absolute inset-0 bg-gradient-to-b from-slate-100/80 dark:from-slate-950/80 via-transparent to-slate-100 dark:to-slate-950" />
      </div>

      {/* 2. Floating Frosted Glass Navbar Pill */}
      <Navbar {...navbarProps} />

      {/* 3. Main Page Content Container */}
      <main className={cn('relative z-10 flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6', className)}>
        {children}
      </main>

      {/* 4. Luxury Frosted Glass Footer */}
      <footer className="relative z-10 border-t border-slate-200/80 dark:border-white/10 bg-white/70 dark:bg-black/60 backdrop-blur-2xl py-10 mt-16 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col md:flex-row items-center justify-between gap-6 text-xs text-slate-600 dark:text-slate-300">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-400 text-slate-950 flex items-center justify-center font-black shadow-lg shadow-emerald-500/20">
              <Sprout className="w-5 h-5 text-slate-950" />
            </div>
            <div>
              <p className="font-extrabold text-sm text-slate-900 dark:text-white tracking-tight">
                Pola <span className="font-serif-accent italic font-normal text-emerald-600 dark:text-emerald-400">AgriTech Network</span>
              </p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">Direct agricultural escrow marketplace connecting all 25 districts</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 sm:gap-4 font-semibold">
            <a href="/catalog" className="px-3.5 py-1.5 rounded-full bg-slate-200/60 dark:bg-white/5 border border-slate-300/80 dark:border-white/10 hover:bg-slate-300/60 dark:hover:bg-white/15 text-slate-800 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white transition-all">
              Catalog
            </a>
            <a href="/farmer/login" className="px-3.5 py-1.5 rounded-full bg-slate-200/60 dark:bg-white/5 border border-slate-300/80 dark:border-white/10 hover:bg-lime-500/20 hover:text-lime-700 dark:hover:text-lime-300 hover:border-lime-400/40 text-slate-800 dark:text-slate-300 transition-all">
              Farmer Network
            </a>
            <a href="/delivery/login" className="px-3.5 py-1.5 rounded-full bg-slate-200/60 dark:bg-white/5 border border-slate-300/80 dark:border-white/10 hover:bg-yellow-500/20 hover:text-yellow-700 dark:hover:text-yellow-300 hover:border-yellow-400/40 text-slate-800 dark:text-slate-300 transition-all">
              Delivery Fleet
            </a>
            <a href="/admin/login" className="px-3.5 py-1.5 rounded-full bg-slate-200/60 dark:bg-white/5 border border-slate-300/80 dark:border-white/10 hover:bg-teal-500/20 hover:text-teal-700 dark:hover:text-teal-300 hover:border-teal-400/40 text-slate-800 dark:text-slate-300 transition-all">
              Admin HQ
            </a>
            <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-extrabold px-3.5 py-1.5 rounded-full bg-emerald-500/15 border border-emerald-400/30">
              <ShieldCheck className="w-4 h-4" /> 100% Escrow Protected
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
};
