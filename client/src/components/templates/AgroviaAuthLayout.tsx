import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { usePortalThemeStore, PortalThemeConfig } from '@/store/portalThemeStore';
import { useThemeStore } from '@/store/themeStore';
import {
  Sprout,
  ShoppingBag,
  Truck,
  ShieldCheck,
  ArrowUpRight,
  ChevronDown,
  Star,
  Globe,
  Lock,
  Layers,
} from 'lucide-react';

export interface AgroviaAuthLayoutProps {
  portalId: 'customer' | 'farmer' | 'delivery' | 'admin';
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  footerContent?: React.ReactNode;
  badgeContent?: React.ReactNode;
}

export const AgroviaAuthLayout: React.FC<AgroviaAuthLayoutProps> = ({
  portalId,
  title,
  subtitle,
  children,
  footerContent,
  badgeContent,
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { themes } = usePortalThemeStore();
  const { language, setLanguage } = useThemeStore();

  const theme: PortalThemeConfig = themes[portalId] || themes.customer;

  const navLinks = [
    { id: 'customer', label: 'Marketplace', path: '/customer/login', icon: <ShoppingBag className="w-3.5 h-3.5" /> },
    { id: 'farmer', label: 'Farmers', path: '/farmer/login', icon: <Sprout className="w-3.5 h-3.5" /> },
    { id: 'delivery', label: 'Delivery Fleet', path: '/delivery/login', icon: <Truck className="w-3.5 h-3.5" /> },
    { id: 'admin', label: 'Admin HQ', path: '/admin/login', icon: <ShieldCheck className="w-3.5 h-3.5" /> },
  ];

  return (
    <div className="relative min-h-screen w-full bg-slate-950 text-white overflow-x-hidden flex flex-col justify-between selection:bg-lime-400 selection:text-slate-950">
      {/* 1. Fullscreen Background Imagery with High Contrast Gradient Overlays */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <img
          src={theme.bgImage}
          alt={theme.name}
          className="w-full h-full object-cover object-center transform scale-105 animate-subtle-zoom transition-all duration-1000 brightness-90"
        />
        {/* Layered high contrast dark gradients for razor-sharp readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-black/60" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-black/80" />
        <div className="absolute inset-0 backdrop-blur-[1px]" />
      </div>

      {/* 2. Top Floating Frosted Navigation Pill (Agrovia style) */}
      <header className="relative z-20 pt-6 px-4 sm:px-8 max-w-7xl mx-auto w-full">
        <div className="glass-nav-pill rounded-full py-2.5 px-4 sm:px-6 flex items-center justify-between shadow-2xl">
          {/* Brand Logo Pill */}
          <a
            href="/"
            className="flex items-center gap-2.5 group cursor-pointer"
          >
            <div className="w-8 h-8 rounded-xl bg-lime-400 text-slate-950 flex items-center justify-center font-black shadow-md shadow-lime-400/20 group-hover:scale-105 transition-transform">
              <Sprout className="w-5 h-5 text-slate-950" />
            </div>
            <span className="font-extrabold text-lg sm:text-xl tracking-tight text-white flex items-center gap-1">
              Pola <span className="text-lime-400 text-sm font-mono font-semibold">.lk</span>
            </span>
          </a>

          {/* Navigation Links Pills */}
          <nav className="hidden md:flex items-center gap-1.5 p-1 rounded-full bg-white/5 border border-white/10 text-xs">
            {navLinks.map((link) => {
              const isActive = portalId === link.id || location.pathname === link.path;
              return (
                <button
                  key={link.id}
                  onClick={() => navigate(link.path)}
                  className={`px-3.5 py-1.5 rounded-full transition-all duration-200 flex items-center gap-1.5 font-medium cursor-pointer ${
                    isActive
                      ? 'bg-white/20 text-white font-bold shadow-xs border border-white/30'
                      : 'text-slate-300 hover:text-white hover:bg-white/10'
                  }`}
                >
                  {link.icon}
                  <span>{link.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Right Action & Language Switcher */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Language Selector */}
            <div className="flex items-center rounded-full bg-white/10 border border-white/15 p-0.5 text-xs text-slate-200">
              <button
                type="button"
                onClick={() => setLanguage('en')}
                className={`px-2.5 py-1 rounded-full text-[11px] font-bold transition-colors cursor-pointer ${
                  language === 'en' ? 'bg-white text-slate-950 shadow-xs' : 'hover:text-white'
                }`}
              >
                EN
              </button>
              <button
                type="button"
                onClick={() => setLanguage('si')}
                className={`px-2.5 py-1 rounded-full text-[11px] font-bold transition-colors cursor-pointer ${
                  language === 'si' ? 'bg-white text-slate-950 shadow-xs' : 'hover:text-white'
                }`}
              >
                සිං
              </button>
              <button
                type="button"
                onClick={() => setLanguage('ta')}
                className={`px-2.5 py-1 rounded-full text-[11px] font-bold transition-colors cursor-pointer ${
                  language === 'ta' ? 'bg-white text-slate-950 shadow-xs' : 'hover:text-white'
                }`}
              >
                த
              </button>
            </div>

            {/* Portal Hub Quick Pill Button */}
            <button
              onClick={() => navigate('/portals')}
              className="px-3.5 sm:px-4 py-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white text-xs font-semibold border border-white/20 flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <Layers className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">All Portals</span>
            </button>
          </div>
        </div>
      </header>

      {/* 3. Main Hero & Login Terminal Grid */}
      <main className="relative z-10 max-w-7xl mx-auto w-full px-4 sm:px-8 py-8 sm:py-16 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center flex-1">
        {/* Left Column: Agrovia Luxury Hero Typography */}
        <div className="lg:col-span-7 space-y-6 sm:space-y-8 text-left">
          {/* Tag Pill */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/10 border border-white/20 backdrop-blur-md text-[11px] sm:text-xs font-extrabold tracking-wider text-lime-300 uppercase">
            <span className="w-2 h-2 rounded-full bg-lime-400 animate-ping" />
            {theme.tag}
          </div>

          {/* Grand Dual-Font Headline (Sans + Italic Serif Accent) */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-[1.1]">
            {theme.headingPrefix}{' '}
            <span className="font-serif-accent italic font-normal text-lime-300 drop-shadow-sm">
              {theme.headingAccent}
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-sm sm:text-base text-slate-200/90 max-w-xl font-normal leading-relaxed">
            {theme.subtitle}
          </p>

          {/* Dual Action Pills & Micro Statistics */}
          <div className="flex flex-wrap items-center gap-4 pt-2">
            <a
              href={theme.dashboardPath}
              className={`px-6 py-3 rounded-full text-xs sm:text-sm font-bold flex items-center gap-2 transition-all transform hover:-translate-y-0.5 active:translate-y-0 cursor-pointer ${theme.primaryButtonClass}`}
            >
              <span>Explore {theme.name.split(' ')[0]}</span>
              <ArrowUpRight className="w-4 h-4" />
            </a>

            <a
              href="/catalog"
              className="px-5 py-3 rounded-full bg-white/10 hover:bg-white/20 text-white text-xs sm:text-sm font-semibold border border-white/25 backdrop-blur-md transition-all cursor-pointer"
            >
              Browse Live Marketplace
            </a>
          </div>

          {/* Micro Stat Badges */}
          <div className="pt-4 flex items-center gap-6 text-xs text-slate-300">
            <div className="flex items-center gap-2">
              <span className="flex text-amber-400">
                <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
              </span>
              <span className="font-extrabold text-white">4.9 / 5.0</span>
              <span className="text-slate-400">(2,400+ reviews)</span>
            </div>
            <div className="hidden sm:block text-slate-500">•</div>
            <div className="hidden sm:block text-slate-300 font-medium">
              {theme.statsText}
            </div>
          </div>
        </div>

        {/* Right Column: Frosted Glass Login Terminal */}
        <div className="lg:col-span-5 w-full max-w-md mx-auto lg:max-w-none">
          <div className="glass-terminal rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl relative overflow-hidden">
            {/* Top Accent Line */}
            <div
              className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-lime-400 to-transparent opacity-80"
            />

            {/* Terminal Header */}
            <div className="space-y-2 text-left">
              {badgeContent || (
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold border border-white/20 bg-white/10 text-lime-300">
                  <Lock className="w-3 h-3" />
                  <span>Secure Access Gateway</span>
                </div>
              )}
              <h2 className="text-2xl font-extrabold text-white tracking-tight">{title}</h2>
              {subtitle && <p className="text-xs text-slate-300 leading-relaxed">{subtitle}</p>}
            </div>

            {/* Login Card Body */}
            <div className="space-y-4">{children}</div>

            {/* Footer Content */}
            {footerContent && (
              <div className="pt-4 border-t border-white/10 text-xs text-slate-400 text-center">
                {footerContent}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* 4. Bottom Horizon & Trust Partner Ribbon (Agrovia style) */}
      <footer className="relative z-10 w-full border-t border-white/10 bg-black/40 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 py-4 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          {/* Left stats info */}
          <div className="flex items-center gap-4">
            <span className="font-bold text-white tracking-wider text-[11px] uppercase">
              ESCROW VERIFIED NETWORK
            </span>
            <span className="text-slate-600">|</span>
            <span>247 Agrarian Hubs</span>
            <span className="text-slate-600">•</span>
            <span>25 Sri Lankan Districts</span>
          </div>

          {/* Right Trust Logos Ribbon */}
          <div className="flex items-center gap-6 font-bold tracking-wider text-[11px] text-slate-300 uppercase opacity-85">
            <span className="hover:text-white transition-colors">LANKAPAY</span>
            <span>•</span>
            <span className="hover:text-white transition-colors">CBSL ESCROW</span>
            <span>•</span>
            <span className="hover:text-white transition-colors">ORGANIC PGS</span>
            <span>•</span>
            <span className="hover:text-white transition-colors">AGRO-TECH LK</span>
          </div>
        </div>
      </footer>
    </div>
  );
};
