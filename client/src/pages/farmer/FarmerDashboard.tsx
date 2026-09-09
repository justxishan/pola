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
import { RatingService } from '@/services/rating.service';
import { ReviewCard } from '@/components/molecules/ReviewCard';
import { cn } from '@/lib/cn';
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
  Star,
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
  const [farmerRatings, setFarmerRatings] = useState<any[]>([]);
  const [ratingStats, setRatingStats] = useState<{ average: number; count: number }>({
    average: 0,
    count: 0,
  });
  const [isLoadingRatings, setIsLoadingRatings] = useState(false);

  const navItems = getFarmerNavItems(t);

  useEffect(() => {
    fetchDashboardData();
    fetchFarmerRatings();
  }, [user]);

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

  const fetchFarmerRatings = async () => {
    const farmerId = user?._id || (user as any)?.id;
    if (!farmerId) return;
    try {
      setIsLoadingRatings(true);
      const res: any = await RatingService.getTargetRatings(farmerId);
      if (res.success && res.data?.ratings) {
        const list = res.data.ratings;
        setFarmerRatings(list);
        if (list.length > 0) {
          const avg =
            list.reduce((acc: number, r: any) => acc + (r.ratingScore || 0), 0) / list.length;
          setRatingStats({
            average: Math.round(avg * 10) / 10,
            count: list.length,
          });
        } else {
          setRatingStats({ average: 0, count: 0 });
        }
      }
    } catch (err) {
      console.error('Failed to load farmer ratings:', err);
    } finally {
      setIsLoadingRatings(false);
    }
  };

  const isKycVerified = user?.kycStatus === 'verified';
  const hasBank = !!user?.bankDetails?.accountNumber;
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
              Direct marketplace orders, wallet balance, and village hub intake logistics
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
        <div className={cn(
          "grid grid-cols-1 gap-6",
          completionPercentage < 100 ? "lg:grid-cols-12" : "sm:grid-cols-2"
        )}>
          {/* Left: Complete Your Profile Checklist */}
          {completionPercentage < 100 && (
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
                      <h4 className="font-bold text-xs text-white">Bank Account Setup</h4>
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
                      <h4 className="font-bold text-xs text-white">Identity Verification (NIC)</h4>
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
          )}

          {/* Right: Quick Action Tiles */}
          <div className={completionPercentage < 100 ? "lg:col-span-5 space-y-4" : "contents"}>
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

        {/* Ratings & Buyer Reviews Section */}
        <div className="glass-terminal p-6 sm:p-8 rounded-3xl border border-white/15 space-y-6 text-left">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-2xl bg-amber-400/20 text-amber-300">
                <Star className="w-5 h-5 fill-amber-400" />
              </div>
              <div>
                <h3 className="font-extrabold text-base text-white">Ratings & Buyer Reviews</h3>
                <p className="text-xs text-slate-300">Direct quality feedback from buyers on verified deliveries</p>
              </div>
            </div>

            <div className="flex items-center gap-2.5 bg-amber-400/10 border border-amber-400/20 px-4 py-2 rounded-2xl">
              <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
              <span className="text-base font-black text-amber-300">
                {ratingStats.count > 0 ? `${ratingStats.average.toFixed(1)} / 5.0` : 'New Producer'}
              </span>
              <span className="text-xs text-slate-400">
                ({ratingStats.count} {ratingStats.count === 1 ? 'review' : 'reviews'})
              </span>
            </div>
          </div>

          {isLoadingRatings ? (
            <div className="py-8 text-center text-slate-400 text-xs">Loading buyer reviews...</div>
          ) : farmerRatings.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {farmerRatings.map((rev: any) => (
                <ReviewCard
                  key={rev._id}
                  userName={
                    rev.raterUserId?.username
                      ? `@${rev.raterUserId.username}`
                      : rev.raterUserId?.fullName
                      ? `@${rev.raterUserId.fullName.toLowerCase().replace(/\s+/g, '_')}`
                      : 'Verified Buyer'
                  }
                  userAvatar={rev.raterUserId?.profileImage}
                  rating={rev.ratingScore || 5}
                  createdAt={rev.createdAt}
                  comment={rev.reviewText}
                  tags={rev.tags}
                  isVerifiedBuyer={true}
                />
              ))}
            </div>
          ) : (
            <div className="py-8 text-center space-y-2">
              <p className="text-xs text-slate-300 font-medium">
                No buyer reviews have been submitted for your produce yet.
              </p>
              <p className="text-[11px] text-slate-400">
                Ratings are recorded automatically when buyers verify and complete delivered orders.
              </p>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};
