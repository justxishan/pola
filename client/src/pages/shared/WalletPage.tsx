import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from '@/components/templates/DashboardLayout';
import { MarketplaceLayout } from '@/components/templates/MarketplaceLayout';
import { StatCard } from '@/components/molecules/StatCard';
import { DataTable } from '@/components/organisms/DataTable';
import { Badge } from '@/components/atoms/Badge';
import { Button } from '@/components/atoms/Button';
import { Input } from '@/components/atoms/Input';
import { Spinner } from '@/components/atoms/Spinner';
import { WalletService } from '@/services/wallet.service';
import { useAuthStore } from '@/store/authStore';
import { useThemeStore } from '@/store/themeStore';
import { useCartStore } from '@/store/cartStore';
import { useTranslation } from '@/lib/i18n';
import { getFarmerNavItems, getDeliveryNavItems } from '@/lib/navItems';
import {
  Wallet,
  ArrowUpRight,
  CreditCard,
  FileText,
  X,
  Lock,
} from 'lucide-react';
import toast from 'react-hot-toast';

export const WalletPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const { isDark, toggleTheme, language, setLanguage } = useThemeStore();
  const { items, openCart } = useCartStore();
  const { t } = useTranslation();

  const [wallet, setWallet] = useState<any | null>(null);
  const [ledger, setLedger] = useState<any[]>([]);
  const [meta, setMeta] = useState<any>({ total: 0, page: 1, limit: 20, totalPages: 1 });
  const [isLoading, setIsLoading] = useState(true);

  // Withdrawal Modal
  const [isWithdrawOpen, setIsWithdrawOpen] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [isProcessingWithdrawal, setIsProcessingWithdrawal] = useState(false);

  const isFarmerOrDelivery =
    user?.role?.startsWith('farmer') ||
    user?.role === 'collector' ||
    user?.role?.startsWith('delivery');

  const isDelivery = user?.role?.startsWith('delivery');
  const navItems = isDelivery ? getDeliveryNavItems(t) : getFarmerNavItems(t);

  useEffect(() => {
    fetchWalletData(1);
  }, []);

  const fetchWalletData = async (targetPage: number = 1) => {
    try {
      setIsLoading(true);
      const [walletRes, ledgerRes]: [any, any] = await Promise.all([
        WalletService.getMyWallet(),
        WalletService.getLedger(targetPage, 20),
      ]);

      if (walletRes.success && walletRes.data) {
        setWallet(walletRes.data.wallet);
      }
      if (ledgerRes.success && ledgerRes.data) {
        setLedger(ledgerRes.data.transactions || []);
        if (ledgerRes.data.meta) {
          setMeta(ledgerRes.data.meta);
        }
      }
    } catch (err: any) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleWithdraw = async (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(withdrawAmount);
    if (!amount || amount < 500) {
      toast.error('Minimum withdrawal amount is LKR 500.00');
      return;
    }
    const available = wallet?.availableBalanceLkr ?? wallet?.availableBalance ?? 0;
    if (amount > available) {
      toast.error('Withdrawal amount exceeds available balance');
      return;
    }

    try {
      setIsProcessingWithdrawal(true);
      const res: any = await WalletService.requestWithdrawal(amount);
      if (res.success) {
        toast.success(res.message || 'Withdrawal request submitted for LankaPay batch processing');
        setIsWithdrawOpen(false);
        setWithdrawAmount('');
        fetchWalletData(meta.page || 1);
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || err.message || 'Failed to request withdrawal');
    } finally {
      setIsProcessingWithdrawal(false);
    }
  };

  const content = (
    <div className="space-y-8 text-left">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            Escrow Wallet &{' '}
            <span className="font-serif-accent italic font-normal text-emerald-300">
              LankaPay Desk
            </span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-300">
            Real-time balance, escrow reserves, and bank payout history backed by CBSL trust standards
          </p>
        </div>

        {isFarmerOrDelivery && (
          <button
            onClick={() => setIsWithdrawOpen(true)}
            className="px-6 py-3 rounded-full bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-black text-xs flex items-center gap-2 shadow-lg shadow-emerald-500/25 transition-all cursor-pointer"
          >
            <ArrowUpRight className="w-4 h-4" />
            <span>Request Bank Payout</span>
          </button>
        )}
      </div>

      {/* 4 Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <StatCard
          title="Available Balance"
          value={`LKR ${(wallet?.availableBalanceLkr ?? wallet?.availableBalance ?? 0).toLocaleString()}.00`}
          subtitle="Ready for withdrawal or checkout"
          icon={<Wallet className="w-6 h-6 text-emerald-400" />}
          iconBgColor="bg-emerald-500/20 text-emerald-300 border border-emerald-400/30"
        />

        <StatCard
          title="Escrow Hold Balance"
          value={`LKR ${(wallet?.pendingEscrowBalanceLkr ?? wallet?.escrowBalance ?? 0).toLocaleString()}.00`}
          subtitle="Held until delivery OTP verified"
          icon={<Lock className="w-6 h-6 text-amber-400" />}
          iconBgColor="bg-amber-500/20 text-amber-300 border border-amber-400/30"
        />

        <StatCard
          title="Total Gross Earned"
          value={`LKR ${(wallet?.totalEarnedLkr ?? 0).toLocaleString()}.00`}
          subtitle="Direct sales and earnings"
          icon={<CreditCard className="w-6 h-6 text-sky-400" />}
          iconBgColor="bg-sky-500/20 text-sky-300 border border-sky-400/30"
        />

        <StatCard
          title="Pending Payouts"
          value={`LKR ${ledger
            .filter((e: any) => e.withdrawalStatus === 'pending')
            .reduce((sum: number, e: any) => sum + Math.abs(e.amountLkr ?? e.amount ?? 0), 0)
            .toLocaleString()}.00`}
          subtitle="In LankaPay clearing queue"
          icon={<ArrowUpRight className="w-6 h-6 text-amber-400" />}
          iconBgColor="bg-amber-500/20 text-amber-300 border border-amber-400/30"
        />
      </div>

      {/* Ledger Table */}
      <div className="glass-terminal p-6 sm:p-8 rounded-3xl border border-white/15 space-y-4">
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-300">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-white">Immutable Ledger Audit</h3>
              <p className="text-xs text-slate-300">Double-entry verified transactions</p>
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="py-12 flex justify-center">
            <Spinner size="lg" />
          </div>
        ) : ledger.length === 0 ? (
          <div className="py-12 text-center text-xs text-slate-400">
            No wallet ledger transactions recorded yet.
          </div>
        ) : (
          <div className="space-y-4">
            <div className="overflow-x-auto no-scrollbar">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="border-b border-white/10 text-slate-400 font-bold uppercase tracking-wider">
                    <th className="pb-3">Date</th>
                    <th className="pb-3">Type</th>
                    <th className="pb-3">Reference / Order</th>
                    <th className="pb-3">Amount</th>
                    <th className="pb-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {ledger.map((entry: any) => {
                    const amount = entry.amountLkr ?? entry.amount ?? 0;
                    const isCredit = amount >= 0;
                    const orderRef = entry.referenceOrderId?.orderNumber || entry.referenceOrderId || entry.referenceId || entry.orderId || 'N/A';

                    return (
                      <tr key={entry._id} className="hover:bg-white/5 transition-colors">
                        <td className="py-3.5 text-slate-300">
                          {new Date(entry.createdAt).toLocaleDateString()}
                        </td>
                        <td className="py-3.5 font-bold text-white capitalize">
                          {(entry.transactionType || entry.type)?.replace(/_/g, ' ')}
                        </td>
                        <td className="py-3.5 font-mono text-[11px] text-slate-400">
                          {typeof orderRef === 'object' ? orderRef.orderNumber || 'Order' : orderRef}
                        </td>
                        <td className={`py-3.5 font-black text-sm ${isCredit ? 'text-emerald-400' : 'text-rose-400'}`}>
                          {isCredit ? '+' : '-'} LKR {Math.abs(amount).toLocaleString()}
                        </td>
                        <td className="py-3.5">
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                            entry.withdrawalStatus === 'rejected'
                              ? 'bg-rose-500/20 text-rose-300 border border-rose-400/30'
                              : entry.withdrawalStatus === 'pending'
                              ? 'bg-amber-500/20 text-amber-300 border border-amber-400/30'
                              : 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/30'
                          }`}>
                            {entry.withdrawalStatus || 'VERIFIED'}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {meta.totalPages > 1 && (
              <div className="flex items-center justify-between pt-4 border-t border-white/10 text-xs text-slate-300">
                <span>Page {meta.page} of {meta.totalPages} ({meta.total} total)</span>
                <div className="flex gap-2">
                  <button
                    disabled={meta.page <= 1}
                    onClick={() => fetchWalletData(meta.page - 1)}
                    className="px-3 py-1 rounded-xl bg-white/10 hover:bg-white/20 disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed transition-all"
                  >
                    Previous
                  </button>
                  <button
                    disabled={meta.page >= meta.totalPages}
                    onClick={() => fetchWalletData(meta.page + 1)}
                    className="px-3 py-1 rounded-xl bg-white/10 hover:bg-white/20 disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed transition-all"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Withdrawal Request Modal */}
      {isWithdrawOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-md w-full p-6 sm:p-8 space-y-6 shadow-2xl">
            <div className="flex items-center justify-between border-slate-800 pb-3 border-b">
              <h3 className="font-extrabold text-base text-white">LankaPay Bank Withdrawal</h3>
              <button
                onClick={() => setIsWithdrawOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleWithdraw} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  Withdrawal Amount (LKR)
                </label>
                <input
                  type="number"
                  placeholder="Min. LKR 500"
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl bg-slate-800 border border-slate-700 text-white text-base font-black focus:outline-none focus:border-emerald-400"
                  autoFocus
                  required
                />
                <p className="text-[11px] text-slate-400 mt-1">
                  Available for withdrawal: LKR {(wallet?.availableBalanceLkr ?? wallet?.availableBalance ?? 0).toLocaleString()}
                </p>
              </div>

              <button
                type="submit"
                disabled={isProcessingWithdrawal}
                className="w-full py-3.5 rounded-2xl bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-black text-xs flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
              >
                {isProcessingWithdrawal ? (
                  <span className="inline-block animate-spin w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full" />
                ) : (
                  <span>Submit Withdrawal Request</span>
                )}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );

  if (isFarmerOrDelivery) {
    return (
      <DashboardLayout
        portalTitle="Earnings & Wallet"
        portalRole={user?.role || 'Partner'}
        navItems={navItems}
        mobileNavItems={navItems.map((item) => ({
          id: item.id,
          label: item.label,
          icon: item.icon,
          path: item.path,
        }))}
        activePath="/wallet"
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
        {content}
      </DashboardLayout>
    );
  }

  return (
    <MarketplaceLayout
      searchQuery=""
      onSearchChange={() => {}}
      cartItemCount={items.length}
      onOpenCart={openCart}
      currentLanguage={language}
      onLanguageChange={setLanguage}
      isDark={isDark}
      onToggleTheme={toggleTheme}
      user={user}
    >
      <div className="py-8">{content}</div>
    </MarketplaceLayout>
  );
};
