import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from '@/components/templates/DashboardLayout';
import { StatCard } from '@/components/molecules/StatCard';
import { DataTable } from '@/components/organisms/DataTable';
import { Badge } from '@/components/atoms/Badge';
import { Button } from '@/components/atoms/Button';
import { Input } from '@/components/atoms/Input';
import { Spinner } from '@/components/atoms/Spinner';
import { EmptyState } from '@/components/molecules/EmptyState';
import { useAuthStore } from '@/store/authStore';
import { useThemeStore } from '@/store/themeStore';
import { useTranslation } from '@/lib/i18n';
import { DeliveryService } from '@/services/delivery.service';
import { WalletService } from '@/services/wallet.service';
import {
  Compass,
  Radar,
  Calendar,
  Truck,
  DollarSign,
  Wallet,
  ArrowUpRight,
  Clock,
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

  // Real data state
  const [walletData, setWalletData] = useState<any>(null);
  const [trips, setTrips] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const navItems = [
    { id: 'hud', label: 'Delivery HUD', icon: <Compass className="w-5 h-5" />, path: '/delivery/dashboard' },
    { id: 'available', label: 'Available Radar Trips', icon: <Radar className="w-5 h-5" />, path: '/delivery/available' },
    { id: 'hub', label: 'Hub Intake Sheet', icon: <Calendar className="w-5 h-5" />, path: '/delivery/hub-schedule' },
    { id: 'vehicles', label: 'My Vehicles', icon: <Truck className="w-5 h-5" />, path: '/delivery/vehicles' },
    { id: 'earnings', label: 'Trip Earnings', icon: <DollarSign className="w-5 h-5" />, path: '/delivery/earnings' },
  ];

  useEffect(() => {
    fetchEarningsData();
  }, []);

  const fetchEarningsData = async () => {
    try {
      setIsLoading(true);
      const [earningsRes, walletRes]: any[] = await Promise.all([
        DeliveryService.getEarnings(),
        WalletService.getMyWallet(),
      ]);

      if (earningsRes.success && earningsRes.data) {
        setTrips(earningsRes.data.completedTrips || []);
        setWalletData(earningsRes.data.wallet);
      }
      // Override wallet from real wallet endpoint if available
      if (walletRes.success && walletRes.data?.wallet) {
        setWalletData(walletRes.data.wallet);
      }
    } catch (err: any) {
      toast.error('Failed to load earnings data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleWithdraw = async (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(withdrawAmount);
    if (!amount || amount < 100) {
      toast.error('Minimum withdrawal amount is LKR 100');
      return;
    }
    if (walletData && amount > (walletData.availableBalanceLkr || walletData.availableBalance || 0)) {
      toast.error('Withdrawal amount exceeds available balance');
      return;
    }
    try {
      setIsProcessing(true);
      await WalletService.requestBankWithdrawal(amount);
      toast.success(`Withdrawal of LKR ${amount.toLocaleString()} queued for LankaPay transfer`);
      setIsWithdrawOpen(false);
      setWithdrawAmount('');
      await fetchEarningsData(); // Refresh balance
    } catch (err: any) {
      toast.error(err.message || 'Failed to submit withdrawal');
    } finally {
      setIsProcessing(false);
    }
  };

  const availableBalance = walletData?.availableBalanceLkr ?? walletData?.availableBalance ?? 0;
  const totalEarned = walletData?.totalEarnedLkr ?? walletData?.totalEarned ?? 0;

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
              Courier Earnings &amp; Trip Statements
            </h1>
            <p className="text-xs text-slate-400">
              Per-trip payouts with direct LankaPay bank settlements
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

        {isLoading ? (
          <div className="flex justify-center py-16">
            <Spinner size="md" />
          </div>
        ) : (
          <>
            {/* Wallet Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <StatCard
                title="Available Cash-out"
                value={`LKR ${availableBalance.toLocaleString()}`}
                subtitle="Ready for bank transfer"
                icon={<Wallet className="w-5 h-5" />}
                iconBgColor="bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-300"
              />
              <StatCard
                title="Pending Escrow"
                value={`LKR ${(walletData?.pendingEscrowBalanceLkr ?? walletData?.pendingBalance ?? 0).toLocaleString()}`}
                subtitle="To be released on delivery confirm"
                icon={<Clock className="w-5 h-5" />}
                iconBgColor="bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-300"
              />
              <StatCard
                title="Lifetime Payouts"
                value={`LKR ${totalEarned.toLocaleString()}`}
                subtitle={`${trips.length} completed trips`}
                icon={<DollarSign className="w-5 h-5" />}
                iconBgColor="bg-purple-50 text-purple-600 dark:bg-purple-950/40 dark:text-purple-300"
              />
            </div>

            {/* Trip History Table */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-extrabold text-slate-900 dark:text-slate-100">
                  Completed Trip Log
                </h3>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => toast.success('Exporting trip statement...')}
                  leftIcon={<FileSpreadsheet className="w-4 h-4" />}
                >
                  Export Statement
                </Button>
              </div>

              {trips.length === 0 ? (
                <EmptyState
                  title="No completed trips yet"
                  description="Accept your first radar trip to start earning"
                  icon={<Truck className="w-8 h-8" />}
                />
              ) : (
                <DataTable
                  data={trips}
                  keyExtractor={(trip: any) => trip._id}
                  columns={[
                    {
                      header: 'Order & Date',
                      accessor: (row: any) => (
                        <div>
                          <span className="font-mono font-bold text-xs text-slate-900 dark:text-slate-100 block">
                            {row.orderNumber}
                          </span>
                          <span className="text-[11px] text-slate-400">
                            {row.deliveredAt
                              ? new Date(row.deliveredAt).toLocaleString()
                              : new Date(row.createdAt).toLocaleString()}
                          </span>
                        </div>
                      ),
                    },
                    {
                      header: 'Delivery Address',
                      accessor: (row: any) => (
                        <span className="text-xs text-slate-600 dark:text-slate-300">
                          {row.deliveryAddress?.city}, {row.deliveryAddress?.district}
                        </span>
                      ),
                    },
                    {
                      header: 'Status',
                      accessor: (row: any) => (
                        <Badge variant="emerald" size="sm">
                          {row.status?.replace(/_/g, ' ')}
                        </Badge>
                      ),
                    },
                    {
                      header: 'Trip Payout (LKR)',
                      accessor: (row: any) => (
                        <span className="font-mono font-bold text-xs text-emerald-600 dark:text-emerald-400">
                          LKR {(row.leg2DeliveryFee || 0).toLocaleString()}
                        </span>
                      ),
                    },
                  ]}
                />
              )}
            </div>
          </>
        )}

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
                  <p className="text-xs text-slate-400">
                    Available: <strong>LKR {availableBalance.toLocaleString()}</strong>
                  </p>
                </div>
                <button onClick={() => setIsWithdrawOpen(false)} className="p-1 text-slate-400 hover:bg-slate-100 rounded-lg">
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
