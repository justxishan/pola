import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from '@/components/templates/DashboardLayout';
import { StatCard } from '@/components/molecules/StatCard';
import { DataTable } from '@/components/organisms/DataTable';
import { Badge } from '@/components/atoms/Badge';
import { Button } from '@/components/atoms/Button';
import { Input } from '@/components/atoms/Input';
import { useAuthStore } from '@/store/authStore';
import { useThemeStore } from '@/store/themeStore';
import { useTranslation } from '@/lib/i18n';
import {
  Compass,
  Radar,
  Calendar,
  Truck,
  DollarSign,
  Wallet,
  ArrowUpRight,
  Clock,
  Building,
  FileSpreadsheet,
  X,
} from 'lucide-react';
import toast from 'react-hot-toast';

export const EarningsPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const { isDark, toggleTheme, language, setLanguage } = useThemeStore();
  const { t } = useTranslation();

  const [isWithdrawOpen, setIsWithdrawOpen] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const navItems = [
    { id: 'hud', label: 'Delivery HUD', icon: <Compass className="w-5 h-5" />, path: '/delivery/dashboard' },
    { id: 'available', label: 'Available Radar Trips', icon: <Radar className="w-5 h-5" />, path: '/delivery/available' },
    { id: 'hub', label: 'Hub Intake Sheet', icon: <Calendar className="w-5 h-5" />, path: '/delivery/hub-schedule' },
    { id: 'vehicles', label: 'My Vehicles', icon: <Truck className="w-5 h-5" />, path: '/delivery/vehicles' },
    { id: 'earnings', label: 'Trip Earnings', icon: <DollarSign className="w-5 h-5" />, path: '/delivery/earnings' },
  ];

  const trips = [
    {
      id: 'TRIP-84920',
      date: 'Today, 11:30 AM',
      route: 'Meegoda DC ──► Nugegoda (Leg 2)',
      distanceKm: 7.2,
      weightKg: 35.0,
      baseFee: 650,
      distanceBonus: 350,
      weightBonus: 250,
      totalPayout: 1250,
      status: 'Completed',
    },
    {
      id: 'TRIP-84812',
      date: 'Yesterday, 08:00 AM',
      route: 'Keppetipola Hub ──► Dambulla DC (Leg 1)',
      distanceKm: 42.0,
      weightKg: 450.0,
      baseFee: 2500,
      distanceBonus: 1800,
      weightBonus: 1200,
      totalPayout: 5500,
      status: 'Completed',
    },
  ];

  const handleWithdraw = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsProcessing(true);
      await new Promise((resolve) => setTimeout(resolve, 800));
      toast.success('Withdrawal of LKR ' + withdrawAmount + ' queued for LankaPay transfer');
      setIsWithdrawOpen(false);
      setWithdrawAmount('');
    } catch (err: any) {
      toast.error('Failed to submit withdrawal');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <DashboardLayout
      portalTitle={t.deliveryFleet}
      portalRole={user?.role || 'Delivery Partner'}
      navItems={navItems}
      activePath="/delivery/earnings"
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
      <div className="space-y-6 max-w-5xl mx-auto">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-slate-900 dark:text-slate-100">
              Courier Earnings & Trip Statements
            </h1>
            <p className="text-xs text-slate-400">
              Per-trip distance & weight bonuses with direct LankaPay bank settlements
            </p>
          </div>

          <Button
            variant="primary"
            size="sm"
            onClick={() => setIsWithdrawOpen(true)}
            className="bg-emerald-600 hover:bg-emerald-700"
            leftIcon={<ArrowUpRight className="w-4 h-4" />}
          >
            Cash-out to Bank
          </Button>
        </div>

        {/* 3 Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StatCard
            title="Available Cash-out"
            value="LKR 14,850.00"
            subtitle="Ready for bank transfer"
            icon={<Wallet className="w-5 h-5" />}
            iconBgColor="bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-300"
          />

          <StatCard
            title="Today’s Earnings"
            value="LKR 4,850.00"
            subtitle="4 completed runs"
            icon={<DollarSign className="w-5 h-5" />}
            iconBgColor="bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-300"
          />

          <StatCard
            title="Lifetime Transport Payouts"
            value="LKR 184,200.00"
            subtitle="142 completed trips"
            icon={<Clock className="w-5 h-5" />}
            iconBgColor="bg-purple-50 text-purple-600 dark:bg-purple-950/40 dark:text-purple-300"
          />
        </div>

        {/* Trip Statements Table */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-extrabold text-slate-900 dark:text-slate-100">
              Itemized Delivery Trip Log
            </h3>

            <Button
              variant="outline"
              size="sm"
              onClick={() => toast.success('Exporting trip statement to Excel...')}
              leftIcon={<FileSpreadsheet className="w-4 h-4" />}
            >
              Export Statement
            </Button>
          </div>

          <DataTable
            data={trips}
            keyExtractor={(t) => t.id}
            columns={[
              {
                header: 'Trip ID & Date',
                accessor: (row) => (
                  <div>
                    <span className="font-mono font-bold text-xs text-slate-900 dark:text-slate-100 block">
                      {row.id}
                    </span>
                    <span className="text-[11px] text-slate-400">{row.date}</span>
                  </div>
                ),
              },
              {
                header: 'Transport Route',
                accessor: (row) => (
                  <div>
                    <span className="font-bold text-xs text-slate-800 dark:text-slate-200 block">
                      {row.route}
                    </span>
                    <span className="text-[11px] text-slate-400">
                      {row.distanceKm} km • {row.weightKg} kg payload
                    </span>
                  </div>
                ),
              },
              {
                header: 'Fee Breakdown',
                accessor: (row) => (
                  <span className="text-xs text-slate-500">
                    Base: LKR {row.baseFee} + Dist: LKR {row.distanceBonus} + Wgt: LKR {row.weightBonus}
                  </span>
                ),
              },
              {
                header: 'Net Payout (LKR)',
                accessor: (row) => (
                  <span className="font-mono font-bold text-xs text-emerald-600 dark:text-emerald-400">
                    LKR {row.totalPayout.toLocaleString()}.00
                  </span>
                ),
              },
            ]}
          />
        </div>

        {/* Withdraw Modal */}
        {isWithdrawOpen && (
          <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
            <div
              className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity"
              onClick={() => setIsWithdrawOpen(false)}
            />

            <div className="relative w-full max-w-md rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl p-6 sm:p-8 space-y-6 animate-in zoom-in-95">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-extrabold text-slate-900 dark:text-slate-100 text-lg">
                    Courier LankaPay Cash-out
                  </h3>
                  <p className="text-xs text-slate-400">Available: <strong>LKR 14,850.00</strong></p>
                </div>
                <button onClick={() => setIsWithdrawOpen(false)} className="p-1 text-slate-400 hover:bg-slate-100">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleWithdraw} className="space-y-4">
                <Input
                  label="Withdrawal Amount (LKR)"
                  type="number"
                  placeholder="5000"
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(e.target.value)}
                  required
                />

                <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                  <Button variant="outline" size="sm" type="button" onClick={() => setIsWithdrawOpen(false)}>
                    Cancel
                  </Button>
                  <Button variant="primary" size="sm" type="submit" isLoading={isProcessing} className="bg-emerald-600">
                    Confirm Transfer
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};
