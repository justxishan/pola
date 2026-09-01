import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from '@/components/templates/DashboardLayout';
import { StatCard } from '@/components/molecules/StatCard';
import { Toggle } from '@/components/atoms/Toggle';
import { useAuthStore } from '@/store/authStore';
import { useThemeStore } from '@/store/themeStore';
import {
  LayoutDashboard,
  Truck,
  Wallet,
  Radar,
  Calendar,
  DollarSign,
  Navigation,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  Circle,
  ShieldCheck,
  Package,
  Clock,
  ArrowUpRight,
  TrendingUp,
} from 'lucide-react';
import toast from 'react-hot-toast';

export const DeliveryDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const { isDark, toggleTheme, language, setLanguage } = useThemeStore();

  const [isOnline, setIsOnline] = useState(true);

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-5 h-5" />, path: '/delivery/dashboard' },
    { id: 'radar', label: 'Available Trips', icon: <Radar className="w-5 h-5" />, path: '/delivery/available' },
    { id: 'active', label: 'Active Trip', icon: <Navigation className="w-5 h-5" />, path: '/delivery/active-trip' },
    { id: 'hub', label: 'Hub Intake Sheet', icon: <Calendar className="w-5 h-5" />, path: '/delivery/hub-schedule' },
    { id: 'vehicles', label: 'My Vehicles', icon: <Truck className="w-5 h-5" />, path: '/delivery/vehicles' },
    { id: 'earnings', label: 'Trip Earnings', icon: <DollarSign className="w-5 h-5" />, path: '/delivery/earnings' },
    { id: 'wallet', label: 'Earnings & Payouts', icon: <Wallet className="w-5 h-5" />, path: '/wallet' },
  ];

  const isKycVerified = user?.kycStatus === 'verified';
  const hasBank = !!(user as any)?.bankDetails?.accountNumber || !!(user as any)?.bankAccount?.accountNumber;

  return (
    <DashboardLayout
      portalTitle="Delivery Operations Hub"
      portalRole={user?.role || 'Delivery Partner'}
      navItems={navItems}
      activePath="/delivery/dashboard"
      onNavigate={(path) => navigate(path)}
      currentLanguage={language}
      onLanguageChange={setLanguage}
      isDark={isDark}
      onToggleTheme={toggleTheme}
      user={user || undefined}
      onLogout={() => {
        logout();
        navigate('/');
      }}
    >
      <div className="space-y-8">
        {/* Top Online Status Card */}
        <div className="glass-terminal p-6 sm:p-8 rounded-3xl border border-white/15 flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-2xl sm:text-3xl font-black text-white flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-yellow-400/20 text-yellow-300">
                <Truck className="w-6 h-6 text-yellow-400" />
              </div>
              <span>
                Courier Dispatch &{' '}
                <span className="font-serif-accent italic font-normal text-yellow-300">
                  Radar Feed
                </span>
              </span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-300">
              Accept orders within your regional radius and verify delivery with customer OTPs.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Toggle
              label={isOnline ? 'Online & Accepting Radar Trips' : 'Offline'}
              checked={isOnline}
              onChange={(on) => {
                setIsOnline(on);
                toast.success(on ? 'Online! Radar listening for nearby trips.' : 'Switched offline.');
              }}
            />
          </div>
        </div>

        {/* 4 Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <StatCard
            title="Available Trips"
            value="3 Nearby"
            subtitle="Within your 15km radar"
            icon={<Radar className="w-6 h-6 text-yellow-400" />}
            iconBgColor="bg-yellow-500/20 text-yellow-300 border border-yellow-400/30"
          />

          <StatCard
            title="Today's Earnings"
            value="LKR 4,250"
            subtitle="3 trips completed"
            icon={<TrendingUp className="w-6 h-6 text-lime-400" />}
            iconBgColor="bg-lime-500/20 text-lime-300 border border-lime-400/30"
          />

          <StatCard
            title="Total Cargo Delivered"
            value="480 kg"
            subtitle="Leg-1 & Leg-2 runs"
            icon={<Package className="w-6 h-6 text-emerald-400" />}
            iconBgColor="bg-emerald-500/20 text-emerald-300 border border-emerald-400/30"
          />

          <StatCard
            title="Courier Reliability"
            value="98.6%"
            subtitle="Verified OTP handovers"
            icon={<ShieldCheck className="w-6 h-6 text-sky-400" />}
            iconBgColor="bg-sky-500/20 text-sky-300 border border-sky-400/30"
          />
        </div>

        {/* Action Panel & Radar Link */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-8 glass-terminal p-6 sm:p-8 rounded-3xl border border-white/15 space-y-6">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-yellow-400/20 text-yellow-300">
                  <Radar className="w-5 h-5 animate-spin" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-white">Live Route Radar</h3>
                  <p className="text-xs text-slate-300">Matching farm pickups with hub dropoffs</p>
                </div>
              </div>
              <button
                onClick={() => navigate('/delivery/available')}
                className="px-4 py-2 rounded-full bg-yellow-400 hover:bg-yellow-300 text-slate-950 font-black text-xs flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <span>Open Full Radar</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="p-5 rounded-2xl bg-white/5 border border-white/10 space-y-3">
              <div className="flex justify-between items-center text-xs">
                <span className="font-bold text-yellow-300 flex items-center gap-1.5">
                  <Radar className="w-3.5 h-3.5" /> Trip Request • Nuwara Eliya DC → Kandy
                </span>
                <span className="font-black text-sm text-yellow-400">LKR 2,450</span>
              </div>
              <p className="text-xs text-slate-300">
                Cargo: 220 kg Highland Vegetables (Carrots & Leeks). Escrow payout upon arrival.
              </p>
            </div>
          </div>

          <div className="lg:col-span-4 space-y-4">
            <div
              onClick={() => navigate('/delivery/vehicles')}
              className="glass-terminal p-6 rounded-3xl border border-white/15 hover:border-yellow-400/50 transition-all cursor-pointer space-y-3"
            >
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-2xl bg-yellow-400/20 text-yellow-300 flex items-center justify-center">
                  <Truck className="w-5 h-5" />
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400" />
              </div>
              <h4 className="font-black text-sm text-white">Manage Vehicles & Cold Chain</h4>
              <p className="text-xs text-slate-300">
                Register tuk-tuks, mini-trucks, and refrigerated lorries.
              </p>
            </div>

            <div
              onClick={() => navigate('/wallet')}
              className="glass-terminal p-6 rounded-3xl border border-white/15 hover:border-yellow-400/50 transition-all cursor-pointer space-y-3"
            >
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-2xl bg-lime-400/20 text-lime-300 flex items-center justify-center">
                  <Wallet className="w-5 h-5" />
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400" />
              </div>
              <h4 className="font-black text-sm text-white">LankaPay Cash-out Wallet</h4>
              <p className="text-xs text-slate-300">
                Withdraw trip earnings directly to any Sri Lankan bank account.
              </p>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};
