import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from '@/components/templates/DashboardLayout';
import { StatCard } from '@/components/molecules/StatCard';
import { Button } from '@/components/atoms/Button';
import { AdminService } from '@/services/admin.service';
import { useAuthStore } from '@/store/authStore';
import { useThemeStore } from '@/store/themeStore';
import {
  LayoutDashboard,
  ShieldCheck,
  Users,
  ShoppingBag,
  CreditCard,
  AlertTriangle,
  FileSpreadsheet,
  Building,
  ArrowRight,
  TrendingUp,
  ArrowUpRight,
  Layers,
} from 'lucide-react';
import { PortalBackgroundManagerModal } from '@/components/organisms/PortalBackgroundManagerModal';
import toast from 'react-hot-toast';

export const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const { isDark, toggleTheme, language, setLanguage } = useThemeStore();

  const [kpis, setKpis] = useState<any>({
    totalUsersCount: 0,
    totalOrdersCount: 0,
    totalGmvLkr: 0,
    platformRevenueLkr: 0,
    pendingKycCount: 0,
    pendingPayoutsCount: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isThemeModalOpen, setIsThemeModalOpen] = useState(false);

  const navItems = [
    { id: 'dashboard', label: 'Command Center', icon: <LayoutDashboard className="w-5 h-5" />, path: '/admin/dashboard' },
    { id: 'kyc', label: 'KYC Verification', icon: <ShieldCheck className="w-5 h-5" />, path: '/admin/kyc', badgeCount: kpis.pendingKycCount },
    { id: 'payouts', label: 'LankaPay Payouts', icon: <CreditCard className="w-5 h-5" />, path: '/admin/payouts', badgeCount: kpis.pendingPayoutsCount },
    { id: 'orders', label: 'Order Oversight', icon: <ShoppingBag className="w-5 h-5" />, path: '/admin/orders' },
    { id: 'disputes', label: 'Dispute Desk', icon: <AlertTriangle className="w-5 h-5" />, path: '/admin/disputes' },
    { id: 'hubs', label: 'Hubs & DCs', icon: <Building className="w-5 h-5" />, path: '/admin/hubs' },
  ];

  useEffect(() => {
    fetchKpis();
  }, []);

  const fetchKpis = async () => {
    try {
      setIsLoading(true);
      const res: any = await AdminService.getExecutiveDashboardKpis();
      if (res.success && res.data) {
        setKpis(res.data.kpis);
      }
    } catch (err: any) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <DashboardLayout
      portalTitle="Executive Command Center"
      portalRole={user?.role || 'Admin'}
      navItems={navItems}
      activePath="/admin/dashboard"
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
        {/* Header with Theme Manager Action */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
              Executive Command &{' '}
              <span className="font-serif-accent italic font-normal text-teal-300">
                Operations Oversight
              </span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-300">
              Real-time GMV across all 25 districts, escrow balances, and KYC verification queues
            </p>
          </div>

          <button
            onClick={() => setIsThemeModalOpen(true)}
            className="px-5 py-2.5 rounded-full bg-white/10 hover:bg-white/20 text-teal-300 border border-teal-400/30 font-bold text-xs flex items-center gap-2 backdrop-blur-md transition-all cursor-pointer shadow-md"
          >
            <Layers className="w-4 h-4 text-teal-300" />
            <span>Portal Themes & Backgrounds</span>
          </button>
        </div>

        {/* Modal */}
        <PortalBackgroundManagerModal
          isOpen={isThemeModalOpen}
          onClose={() => setIsThemeModalOpen(false)}
        />

        {/* 6 Core Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          <StatCard
            title="Total Marketplace GMV"
            value={`LKR ${kpis.totalGmvLkr?.toLocaleString() || '0'}`}
            subtitle="Gross merchandise volume"
            icon={<TrendingUp className="w-6 h-6 text-teal-400" />}
            iconBgColor="bg-teal-500/20 text-teal-300 border border-teal-400/30"
          />

          <StatCard
            title="Platform Commission (5%)"
            value={`LKR ${kpis.platformRevenueLkr?.toLocaleString() || '0'}`}
            subtitle="Platform revenue realized"
            icon={<CreditCard className="w-6 h-6 text-emerald-400" />}
            iconBgColor="bg-emerald-500/20 text-emerald-300 border border-emerald-400/30"
          />

          <StatCard
            title="Orders Processed"
            value={kpis.totalOrdersCount || 0}
            subtitle="Across distribution centers"
            icon={<ShoppingBag className="w-6 h-6 text-sky-400" />}
            iconBgColor="bg-sky-500/20 text-sky-300 border border-sky-400/30"
          />

          <StatCard
            title="Pending KYC Submissions"
            value={kpis.pendingKycCount || 0}
            subtitle="Awaiting compliance review"
            icon={<ShieldCheck className="w-6 h-6 text-amber-400" />}
            iconBgColor="bg-amber-500/20 text-amber-300 border border-amber-400/30"
          />

          <StatCard
            title="Pending LankaPay Payouts"
            value={kpis.pendingPayoutsCount || 0}
            subtitle="Farmer & driver bank requests"
            icon={<CreditCard className="w-6 h-6 text-rose-400" />}
            iconBgColor="bg-rose-500/20 text-rose-300 border border-rose-400/30"
          />

          <StatCard
            title="Registered Stakeholders"
            value={kpis.totalUsersCount || 0}
            subtitle="Farmers, couriers & buyers"
            icon={<Users className="w-6 h-6 text-purple-400" />}
            iconBgColor="bg-purple-500/20 text-purple-300 border border-purple-400/30"
          />
        </div>

        {/* Priority Operations Action Panels */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="glass-terminal p-6 sm:p-8 rounded-3xl border border-white/15 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center justify-center">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-extrabold text-base text-white">
                  KYC Verification Queue
                </h3>
                <p className="text-xs text-slate-300">
                  {kpis.pendingKycCount || 0} farmer & courier profiles waiting for review
                </p>
              </div>
            </div>

            <button
              onClick={() => navigate('/admin/kyc')}
              className="w-full py-3.5 px-6 rounded-2xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <span>Open KYC Review Desk</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div className="glass-terminal p-6 sm:p-8 rounded-3xl border border-white/15 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-teal-500/20 text-teal-300 border border-teal-500/30 flex items-center justify-center">
                <CreditCard className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-extrabold text-base text-white">
                  LankaPay Payout Processing
                </h3>
                <p className="text-xs text-slate-300">
                  {kpis.pendingPayoutsCount || 0} manual bank withdrawal batches ready for export
                </p>
              </div>
            </div>

            <button
              onClick={() => navigate('/admin/payouts')}
              className="w-full py-3.5 px-6 rounded-2xl bg-teal-400 hover:bg-teal-300 text-slate-950 font-black text-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <span>Manage Payout Desk</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};
