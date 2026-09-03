import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from '@/components/templates/DashboardLayout';
import { StatCard } from '@/components/molecules/StatCard';
import { KycAlertBanner } from '@/components/molecules/KycAlertBanner';
import { useAuthStore } from '@/store/authStore';
import { useThemeStore } from '@/store/themeStore';
import { useTranslation } from '@/lib/i18n';
import { getFarmerNavItems } from '@/lib/navItems';
import { api } from '@/services/api';
import {
  Plus,
  ArrowRight,
  TrendingUp,
  CheckCircle2,
  Circle,
  Sparkles,
  ArrowUpRight,
  Scale,
  Sprout,
  Package,
  ShoppingBag,
} from 'lucide-react';

export const FarmerDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const { isDark, toggleTheme, language, setLanguage } = useThemeStore();
  const { t } = useTranslation();

  const [stats, setStats] = useState<any>({
    activeProducts: 0,
    registeredFarms: 0,
    pendingHubCollections: 0,
    wallet: {
      availableBalance: 0,
      pendingEscrowBalance: 0,
      totalEarned: 0,
    },
    recentOrders: [],
  });
  const [isLoading, setIsLoading] = useState(true);

  const navItems = getFarmerNavItems(t);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);
      const res: any = await api.get('/farmer/dashboard');
      if (res.success && res.data) {
        setStats(res.data);
      }
    } catch (err: any) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const isKycVerified = user?.kycStatus === 'verified';
  const hasBank = !!(user as any)?.bankDetails?.accountNumber || !!(user as any)?.bankAccount?.accountNumber;
  const hasFarms = (stats.registeredFarms || 0) > 0;

  const completedSteps = 1 + (hasBank ? 1 : 0) + (isKycVerified ? 1 : 0) + (hasFarms ? 1 : 0);
  const completionPercentage = Math.round((completedSteps / 4) * 100);

  return (
    <DashboardLayout
      portalTitle={t.farmerOpsCenter || 'Farmer Portal'}
      portalRole={user?.role || 'Farmer'}
      navItems={navItems}
      mobileNavItems={navItems.map((item) => ({
        id: item.id,
        label: item.label,
        icon: item.icon,
        path: item.path,
      }))}
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
              {t.dashboard || 'Dashboard'}
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
            value={`LKR ${(stats.wallet?.totalEarned || 0).toLocaleString()}`}
            subtitle="Confirmed direct sales"
            icon={<TrendingUp className="w-6 h-6 text-lime-400" />}
            iconBgColor="bg-lime-500/20 text-lime-300 border border-lime-400/30"
          />

          <StatCard
            title="Active Harvest Listings"
            value={stats.activeProducts || 0}
            subtitle="Available in catalog"
            icon={<Package className="w-6 h-6 text-emerald-400" />}
            iconBgColor="bg-emerald-500/20 text-emerald-300 border border-emerald-400/30"
          />

          <StatCard
            title="Pending Hub Collections"
            value={stats.pendingHubCollections || 0}
            subtitle="Awaiting hub dropoff"
            icon={<ShoppingBag className="w-6 h-6 text-yellow-400" />}
            iconBgColor="bg-yellow-500/20 text-yellow-300 border border-yellow-400/30"
          />

          <StatCard
            title="Registered Farm Plots"
            value={stats.registeredFarms || 0}
            subtitle="Active land parcels"
            icon={<Sprout className="w-6 h-6 text-sky-400" />}
            iconBgColor="bg-sky-500/20 text-sky-300 border border-sky-400/30"
          />
        </div>

        {/* Activation Checklist & Quick Actions Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left: Complete Your Profile Checklist */}
          <div className="lg:col-span-7 glass-terminal p-6 sm:p-8 rounded-3xl border border-white/15 space-y-6">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-lime-400/20 text-lime-300">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-white">
                    Complete Your Profile
                  </h3>
                  <p className="text-xs text-slate-300">Complete setup to unlock automatic bulk dispatch matching</p>
                </div>
              </div>
              <span className="px-3 py-1 rounded-full text-xs font-mono font-black bg-lime-400/20 text-lime-300 border border-lime-400/30">
                {completionPercentage}% Completed
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

              {/* Task 4 */}
              <div
                onClick={() => navigate(hasFarms ? '/farmer/farms' : '/farmer/farms/new')}
                className="p-4 rounded-2xl bg-white/5 border border-white/10 hover:border-lime-400/50 transition-all flex items-center justify-between cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  {hasFarms ? (
                    <CheckCircle2 className="w-5 h-5 text-lime-400 shrink-0" />
                  ) : (
                    <Circle className="w-5 h-5 text-slate-500 shrink-0" />
                  )}
                  <div>
                    <h4 className="font-bold text-xs text-white">Registered Farm Parcel</h4>
                    <p className="text-[11px] text-slate-400">Plot extent, soil, and irrigation setup</p>
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

        {/* Recent Orders Section */}
        {stats.recentOrders && stats.recentOrders.length > 0 && (
          <div className="glass-terminal p-6 sm:p-8 rounded-3xl border border-white/15 space-y-4 text-left">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-lime-400/20 text-lime-300">
                  <ShoppingBag className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-white">Recent Orders</h3>
                  <p className="text-xs text-slate-300">Latest direct orders matching your harvest</p>
                </div>
              </div>
              <button
                onClick={() => navigate('/farmer/orders')}
                className="text-xs font-bold text-lime-300 hover:text-lime-200 flex items-center gap-1 cursor-pointer"
              >
                <span>View All</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="overflow-x-auto no-scrollbar">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="border-b border-white/10 text-slate-400 font-bold uppercase tracking-wider">
                    <th className="pb-3">Order #</th>
                    <th className="pb-3">Date</th>
                    <th className="pb-3">Items</th>
                    <th className="pb-3">Total (LKR)</th>
                    <th className="pb-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {stats.recentOrders.map((order: any) => (
                    <tr key={order._id} className="hover:bg-white/5 transition-colors">
                      <td className="py-3.5 font-mono text-white font-bold">
                        {order.orderNumber}
                      </td>
                      <td className="py-3.5 text-slate-300">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </td>
                      <td className="py-3.5 text-slate-300">
                        {order.items?.length || 0} produce lot(s)
                      </td>
                      <td className="py-3.5 font-black text-lime-400">
                        LKR {(order.grandTotal || 0).toLocaleString()}
                      </td>
                      <td className="py-3.5">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase bg-lime-400/20 text-lime-300 border border-lime-400/30">
                          {order.status?.replace(/_/g, ' ')}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};
