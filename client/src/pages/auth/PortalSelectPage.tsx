import React from 'react';
import { useNavigate } from 'react-router-dom';
import { usePortalThemeStore } from '@/store/portalThemeStore';
import {
  Sprout,
  ShoppingBag,
  Truck,
  ShieldCheck,
  ArrowUpRight,
  Sparkles,
  Layers,
  ArrowRight,
  Lock,
  Star,
} from 'lucide-react';

export const PortalSelectPage: React.FC = () => {
  const navigate = useNavigate();
  const { themes } = usePortalThemeStore();

  const portals = [
    {
      id: 'customer',
      title: 'Customer Marketplace',
      titleSi: 'පාරිභෝගික සහ වෙළඳ පිවිසුම',
      url: '/customer/login',
      bgImage: themes.customer.bgImage,
      icon: <ShoppingBag className="w-6 h-6 text-emerald-300" />,
      tag: 'DIRECT BUYERS & B2B',
      accentColor: 'emerald',
      borderColor: 'hover:border-emerald-400/80',
      btnClass: 'bg-emerald-400 hover:bg-emerald-300 text-slate-950 shadow-emerald-500/25',
      badgeClass: 'bg-emerald-500/20 text-emerald-300 border-emerald-400/30',
      description:
        'Browse seasonal harvests from all 25 districts with dual-range price filters, wholesale bulk tiers, and doorstep escrow protection.',
    },
    {
      id: 'farmer',
      title: 'Farmer & Producer Hub',
      titleSi: 'ගොවි සහ එකතුකරන්නන්ගේ පිවිසුම',
      url: '/farmer/login',
      bgImage: themes.farmer.bgImage,
      icon: <Sprout className="w-6 h-6 text-lime-300" />,
      tag: 'AGRI-PRODUCERS',
      accentColor: 'lime',
      borderColor: 'hover:border-lime-400/80',
      btnClass: 'bg-lime-400 hover:bg-lime-300 text-slate-950 shadow-lime-500/25',
      badgeClass: 'bg-lime-500/20 text-lime-300 border-lime-400/30',
      description:
        'List crop harvests, schedule village hub drop-offs, track wholesale orders, and receive direct 24-hour LankaPay bank payouts.',
    },
    {
      id: 'delivery',
      title: 'Delivery Fleet & Courier',
      titleSi: 'බෙදාහැරීමේ රියදුරු පිවිසුම',
      url: '/delivery/login',
      bgImage: themes.delivery.bgImage,
      icon: <Truck className="w-6 h-6 text-yellow-300" />,
      tag: 'LOGISTICS FLEET',
      accentColor: 'yellow',
      borderColor: 'hover:border-yellow-400/80',
      btnClass: 'bg-yellow-400 hover:bg-yellow-300 text-slate-950 shadow-yellow-500/25',
      badgeClass: 'bg-yellow-500/20 text-yellow-300 border-yellow-400/30',
      description:
        'Access GPS radius radar to match with Leg-1 village collections or Leg-2 doorstep deliveries with driver payouts.',
    },
    {
      id: 'admin',
      title: 'Executive Command HQ',
      titleSi: 'පරිපාලන පාලක මැදිරිය',
      url: '/admin/login',
      bgImage: themes.admin.bgImage,
      icon: <ShieldCheck className="w-6 h-6 text-teal-300" />,
      tag: 'INTERNAL OPERATIONS',
      accentColor: 'teal',
      borderColor: 'hover:border-teal-400/80',
      btnClass: 'bg-teal-400 hover:bg-teal-300 text-slate-950 shadow-teal-500/25',
      badgeClass: 'bg-teal-500/20 text-teal-300 border-teal-400/30',
      description:
        'Platform GMV analytics, split-screen KYC document verification, LankaPay withdrawal processing, and order routing.',
    },
  ];

  return (
    <div className="relative min-h-screen w-full bg-slate-950 text-white overflow-x-hidden flex flex-col justify-between selection:bg-lime-400 selection:text-slate-950">
      {/* Background Graphic Grid */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&w=2400&q=85"
          alt="Agriculture"
          className="w-full h-full object-cover object-center brightness-75 scale-105 animate-subtle-zoom"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/80 to-black/75" />
        <div className="absolute inset-0 backdrop-blur-xs" />
      </div>

      {/* Header Bar */}
      <header className="relative z-20 pt-6 px-4 sm:px-8 max-w-7xl mx-auto w-full">
        <div className="glass-nav-pill rounded-full py-2.5 px-6 flex items-center justify-between shadow-2xl">
          <a href="/" className="flex items-center gap-2.5 group cursor-pointer">
            <div className="w-8 h-8 rounded-xl bg-lime-400 text-slate-950 flex items-center justify-center font-black shadow-md shadow-lime-400/20 group-hover:scale-105 transition-transform">
              <Sprout className="w-5 h-5 text-slate-950" />
            </div>
            <span className="font-extrabold text-lg sm:text-xl tracking-tight text-white flex items-center gap-1">
              Pola <span className="text-lime-400 text-sm font-mono font-semibold">.lk</span>
            </span>
          </a>

          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/10 border border-white/15 text-xs text-slate-200 font-medium">
            <Layers className="w-3.5 h-3.5 text-lime-400" />
            <span>4 Independent Operations Portals</span>
          </div>

          <a
            href="/"
            className="px-4 py-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white text-xs font-semibold border border-white/20 flex items-center gap-1.5 transition-all"
          >
            <span>Live Marketplace</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </a>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 max-w-7xl mx-auto w-full px-4 sm:px-8 py-10 sm:py-14 space-y-10">
        {/* Title Header */}
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/10 border border-white/20 backdrop-blur-md text-[11px] font-extrabold tracking-wider text-lime-300 uppercase">
            <span className="w-2 h-2 rounded-full bg-lime-400 animate-ping" />
            ENTERPRISE AGRITECH ARCHITECTURE
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
            Select Your Dedicated{' '}
            <span className="font-serif-accent italic font-normal text-lime-300">
              Operations Portal
            </span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            Tailored interfaces, authenticated workflows, and dedicated operational tools for every
            stakeholder in the Sri Lankan agricultural supply chain.
          </p>
        </div>

        {/* 4 Portals Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {portals.map((p) => (
            <div
              key={p.id}
              onClick={() => navigate(p.url)}
              className={`group relative rounded-3xl overflow-hidden border border-white/15 bg-slate-900/60 backdrop-blur-2xl p-6 sm:p-8 flex flex-col justify-between space-y-6 shadow-2xl transition-all duration-300 hover:scale-[1.01] hover:shadow-2xl cursor-pointer ${p.borderColor}`}
            >
              {/* Card Image Banner Backdrop */}
              <div className="absolute inset-0 z-0 opacity-25 group-hover:opacity-35 transition-opacity pointer-events-none">
                <img
                  src={p.bgImage}
                  alt={p.title}
                  className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/80 to-transparent" />
              </div>

              {/* Card Content */}
              <div className="relative z-10 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="p-3 rounded-2xl bg-white/10 border border-white/15 backdrop-blur-md">
                    {p.icon}
                  </div>
                  <span className={`text-[11px] font-extrabold px-3 py-1 rounded-full border ${p.badgeClass}`}>
                    {p.tag}
                  </span>
                </div>

                <div className="space-y-1">
                  <h3 className="text-xl sm:text-2xl font-extrabold text-white group-hover:text-lime-300 transition-colors">
                    {p.title}
                  </h3>
                  <p className="text-xs text-slate-400 font-medium">{p.titleSi}</p>
                  <p className="text-xs text-slate-300 leading-relaxed pt-2">
                    {p.description}
                  </p>
                </div>
              </div>

              {/* Card Action Button */}
              <div className="relative z-10 pt-2 flex items-center justify-between border-t border-white/10">
                <span className="font-mono text-[11px] text-slate-400">
                  URL: <span className="text-white font-semibold">{p.url}</span>
                </span>
                <button
                  type="button"
                  className={`px-5 py-2.5 rounded-full font-extrabold text-xs flex items-center gap-1.5 shadow-lg transition-all transform group-hover:-translate-y-0.5 ${p.btnClass}`}
                >
                  <span>Launch Portal</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 w-full border-t border-white/10 bg-black/40 backdrop-blur-xl py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-400">
          <span>© 2026 Pola (පොළ) AgriTech Marketplace • Sri Lanka</span>
          <span>LankaPay Escrow Protection • Real-Time Agrarian Dispatch</span>
        </div>
      </footer>
    </div>
  );
};
