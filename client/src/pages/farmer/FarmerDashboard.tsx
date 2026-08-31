import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from '@/components/templates/DashboardLayout';
import { StatCard } from '@/components/molecules/StatCard';
import { KycAlertBanner } from '@/components/molecules/KycAlertBanner';
import { useAuthStore } from '@/store/authStore';
import { useThemeStore } from '@/store/themeStore';
import { useTranslation } from '@/lib/i18n';
import { api } from '@/services/api';
import {
  LayoutDashboard,
  Sprout,
  Package,
  Wallet,
  ShoppingBag,
  Plus,
  ArrowRight,
  TrendingUp,
  CheckCircle2,
  Circle,
  CreditCard,
  ShieldCheck,
  Sparkles,
  ArrowUpRight,
  Scale,
} from 'lucide-react';
import toast from 'react-hot-toast';

export const FarmerDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const { isDark, toggleTheme, language, setLanguage } = useThemeStore();
  const { t } = useTranslation();

  const [kpis, setKpis] = useState<any>({
    activeProductsCount: 0,
    totalOrdersCount: 0,
    pendingOrdersCount: 0,
    totalSalesVolumeKg: 0,
    grossRevenueLkr: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  const navItems = [
    {
      id: 'dashboard',
      label: t.dashboard,
      icon: <LayoutDashboard className="w-5 h-5" />,
      path: '/farmer/dashboard',
    },
    {
      id: 'farms',
      label: t.myFarms,
      icon: <Sprout className="w-5 h-5" />,
      path: '/farmer/farms',
    },
    {
      id: 'products',
      label: t.cropListings,
      icon: <Package className="w-5 h-5" />,
      path: '/farmer/products',
    },
    {
      id: 'orders',
      label: t.farmOrders,
      icon: <ShoppingBag className="w-5 h-5" />,
      path: '/farmer/orders',
    },
    {
      id: 'hubs',
      label: t.hubDropoffs,
      icon: <Scale className="w-5 h-5" />,
      path: '/farmer/hubs',
    },
    {
      id: 'wallet',
      label: t.earningsWallet,
      icon: <Wallet className="w-5 h-5" />,
      path: '/wallet',
    },
  ];

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);
      const res: any = await api.get('/farmer/dashboard/kpis');
      if (res.success && res.data) {
        setKpis(res.data.kpis);
      }
    } catch (err: any) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const isKycVerified = user?.kycStatus === 'verified';
  const hasBank = !!(user as any)?.bankDetails?.accountNumber || !!(user as any)?.bankAccount?.accountNumber;

  return (
    <DashboardLayout
      portalTitle={t.farmerOpsCenter}
      portalRole={user?.role || 'Farmer'}
      navItems={navItems}
      activePath="/farmer/dashboard"
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
        {/* KYC Verification Banner */}
        <KycAlertBanner />

        {/* Hero Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
              Producer Command &{' '}
              <span className="font-serif-accent italic font-normal text-lime-300">
                Harvest Analytics
              </span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-300">
              Direct marketplace orders, LankaPay wallet balance, and village hub intake logistics
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/farmer/products/new')}
              className="px-5 py-3 rounded-full bg-lime-400 hover:bg-lime-300 text-slate-950 font-black text-xs flex items-center gap-2 shadow-lg shadow-lime-500/25 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>List New Crop Lot</span>
            </button>
          </div>
        </div>

        {/* 4 Core Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <StatCard
            title="Total Revenue (Gross)"
            value={`LKR ${kpis.grossRevenueLkr?.toLocaleString() || '0'}`}
            subtitle="Confirmed direct sales"
            icon={<TrendingUp className="w-6 h-6 text-lime-400" />}
            iconBgColor="bg-lime-500/20 text-lime-300 border border-lime-400/30"
          />

          <StatCard
            title="Active Harvest Listings"
            value={kpis.activeProductsCount || 0}
            subtitle="Available in catalog"
            icon={<Package className="w-6 h-6 text-emerald-400" />}
            iconBgColor="bg-emerald-500/20 text-emerald-300 border border-emerald-400/30"
          />

          <StatCard
            title="Pending Orders"
            value={kpis.pendingOrdersCount || 0}
            subtitle="Awaiting hub dropoff"
            icon={<ShoppingBag className="w-6 h-6 text-yellow-400" />}
            iconBgColor="bg-yellow-500/20 text-yellow-300 border border-yellow-400/30"
          />

          <StatCard
            title="Harvest Dispatched"
            value={`${kpis.totalSalesVolumeKg || 0} kg`}
            subtitle="Escrow verified volume"
            icon={<Sprout className="w-6 h-6 text-sky-400" />}
            iconBgColor="bg-sky-500/20 text-sky-300 border border-sky-400/30"
          />
        </div>

        {/* Activation Checklist & Quick Actions Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left: Gamified Launchpad Checklist */}
          <div className="lg:col-span-7 glass-terminal p-6 sm:p-8 rounded-3xl border border-white/15 space-y-6">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-lime-400/20 text-lime-300">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-white">
                    Producer Launchpad Checklist
                  </h3>
                  <p className="text-xs text-slate-300">Complete setup to unlock automatic bulk dispatch matching</p>
                </div>
              </div>
              <span className="px-3 py-1 rounded-full text-xs font-mono font-black bg-lime-400/20 text-lime-300 border border-lime-400/30">
                {hasBank && isKycVerified ? '100% Active' : hasBank || isKycVerified ? '66% Completed' : '33% Completed'}
              </span>
            </div>

            <div className="space-y-3">
              {/* Task 1 */}
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-lime-400 shrink-0" />
                  <div>
                    <h4 className="font-bold text-xs text-white">Farmer Account Activated</h4>
                    <p className="text-[11px] text-slate-400">Authenticated via email OTP security</p>
                  </div>
                </div>
                <span className="text-[11px] font-bold text-lime-300">Ready</span>
              </div>

              {/* Task 2 */}
              <div
                onClick={() => navigate('/wallet')}
                className="p-4 rounded-2xl bg-white/5 border border-white/10 hover:border-lime-400/50 transition-all flex items-center justify-between cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  {hasBank ? (
                    <CheckCircle2 className="w-5 h-5 text-lime-400 shrink-0" />
                  ) : (
                    <Circle className="w-5 h-5 text-slate-500 shrink-0" />
                  )}
                  <div>
                    <h4 className="font-bold text-xs text-white">LankaPay Bank Account Setup</h4>
                    <p className="text-[11px] text-slate-400">For guaranteed 24-hour sale payouts</p>
                  </div>
                </div>
                <ArrowUpRight className="w-4 h-4 text-slate-400" />
              </div>

              {/* Task 3 */}
              <div
                onClick={() => navigate('/auth/kyc')}
                className="p-4 rounded-2xl bg-white/5 border border-white/10 hover:border-lime-400/50 transition-all flex items-center justify-between cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  {isKycVerified ? (
                    <CheckCircle2 className="w-5 h-5 text-lime-400 shrink-0" />
                  ) : (
                    <Circle className="w-5 h-5 text-slate-500 shrink-0" />
                  )}
                  <div>
                    <h4 className="font-bold text-xs text-white">NIC & Agrarian Land Verification</h4>
                    <p className="text-[11px] text-slate-400">Unlocks Verified Producer green badge</p>
                  </div>
                </div>
                <ArrowUpRight className="w-4 h-4 text-slate-400" />
              </div>
            </div>
          </div>

          {/* Right: Quick Action Tiles */}
          <div className="lg:col-span-5 space-y-4">
            <div
              onClick={() => navigate('/farmer/farms')}
              className="glass-terminal p-6 rounded-3xl border border-white/15 hover:border-lime-400/50 transition-all cursor-pointer space-y-3"
            >
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-2xl bg-lime-400/20 text-lime-300 flex items-center justify-center">
                  <Sprout className="w-5 h-5" />
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400" />
              </div>
              <h4 className="font-black text-sm text-white">Manage Farm Parcels</h4>
              <p className="text-xs text-slate-300">
                GPS coordinate mapping, soil types, and organic PGS certification records.
              </p>
            </div>

            <div
              onClick={() => navigate('/farmer/hubs')}
              className="glass-terminal p-6 rounded-3xl border border-white/15 hover:border-lime-400/50 transition-all cursor-pointer space-y-3"
            >
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 text-emerald-300 flex items-center justify-center">
                  <Scale className="w-5 h-5" />
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400" />
              </div>
              <h4 className="font-black text-sm text-white">Village Hub Dropoff Schedule</h4>
              <p className="text-xs text-slate-300">
                Generate intake QR codes for crate weigh-ins and quality grading.
              </p>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};
