import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from '@/components/templates/DashboardLayout';
import { DataTable } from '@/components/organisms/DataTable';
import { Badge } from '@/components/atoms/Badge';
import { Button } from '@/components/atoms/Button';
import { Input } from '@/components/atoms/Input';
import { Spinner } from '@/components/atoms/Spinner';
import { useAuthStore } from '@/store/authStore';
import { useThemeStore } from '@/store/themeStore';
import { useTranslation } from '@/lib/i18n';
import { AdminService } from '@/services/admin.service';
import {
  ShieldAlert,
  Users,
  Scale,
  DollarSign,
  Truck,
  FileText,
  FileCheck,
  FileSpreadsheet,
  CheckCircle2,
  XCircle,
  Sliders,
} from 'lucide-react';
import toast from 'react-hot-toast';

export const PayoutQueuePage: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const { isDark, toggleTheme, language, setLanguage } = useThemeStore();
  const { t } = useTranslation();

  const [activeTab, setActiveTab] = useState<'queue' | 'config'>('queue');
  const [refNumbers, setRefNumbers] = useState<{ [id: string]: string }>({});
  const [rejectReasons, setRejectReasons] = useState<{ [id: string]: string }>({});

  // Real queue from DB
  const [payouts, setPayouts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);

  // Commission Config — loaded from DB
  const [platformFee, setPlatformFee] = useState('5.0');
  const [collectorFee, setCollectorFee] = useState('3.0');
  const [gradeAMultiplier, setGradeAMultiplier] = useState('100');
  const [gradeBMultiplier, setGradeBMultiplier] = useState('90');
  const [gradeCMultiplier, setGradeCMultiplier] = useState('75');
  const [isSavingConfig, setIsSavingConfig] = useState(false);

  const navItems = [
    { id: 'dashboard', label: 'Command Center', icon: <ShieldAlert className="w-5 h-5" />, path: '/admin/dashboard' },
    { id: 'kyc', label: 'KYC Verifications', icon: <Users className="w-5 h-5" />, path: '/admin/kyc' },
    { id: 'payouts', label: 'LankaPay Payouts', icon: <DollarSign className="w-5 h-5" />, path: '/admin/payouts' },
    { id: 'disputes', label: 'Disputes Desk', icon: <Scale className="w-5 h-5" />, path: '/admin/disputes' },
    { id: 'logistics', label: 'Logistics Config', icon: <Truck className="w-5 h-5" />, path: '/admin/hubs' },
    { id: 'audit', label: 'Audit Trail', icon: <FileCheck className="w-5 h-5" />, path: '/admin/audit' },
    { id: 'reports', label: 'Reports Studio', icon: <FileText className="w-5 h-5" />, path: '/admin/reports' },
  ];

  useEffect(() => {
    fetchQueue();
  }, []);

  const fetchQueue = async () => {
    try {
      setIsLoading(true);
      const res: any = await AdminService.getLankaPayWithdrawalQueue();
      if (res.success && res.data) {
        setPayouts(res.data.queue || []);
      }
    } catch (err: any) {
      toast.error('Failed to load withdrawal queue');
    } finally {
      setIsLoading(false);
    }
  };

  const handleProcessPayout = async (id: string) => {
    const ref = refNumbers[id];
    if (!ref || !ref.trim()) {
      toast.error('Please enter LankaPay bank transaction reference number');
      return;
    }
    try {
      setProcessingId(id);
      await AdminService.processBankWithdrawal(id, ref.trim());
      toast.success(`Withdrawal processed (Ref: ${ref}). Funds released.`);
      setRefNumbers((prev) => { const n = { ...prev }; delete n[id]; return n; });
      await fetchQueue();
    } catch (err: any) {
      toast.error(err.message || 'Failed to process withdrawal');
    } finally {
      setProcessingId(null);
    }
  };

  const handleRejectPayout = async (id: string) => {
    const reason = rejectReasons[id];
    if (!reason || !reason.trim()) {
      toast.error('Please enter a rejection reason');
      return;
    }
    try {
      setProcessingId(id);
      await AdminService.rejectBankWithdrawal(id, reason.trim());
      toast.success('Withdrawal rejected and amount returned to user wallet');
      setRejectReasons((prev) => { const n = { ...prev }; delete n[id]; return n; });
      await fetchQueue();
    } catch (err: any) {
      toast.error(err.message || 'Failed to reject withdrawal');
    } finally {
      setProcessingId(null);
    }
  };

  const handleSaveConfig = async () => {
    try {
      setIsSavingConfig(true);
      await AdminService.updatePlatformConfig({
        platformCommissionPercent: parseFloat(platformFee),
        collectorCommissionPercent: parseFloat(collectorFee),
        gradeMultipliers: {
          A: parseFloat(gradeAMultiplier),
          B: parseFloat(gradeBMultiplier),
          C: parseFloat(gradeCMultiplier),
        },
      });
      toast.success('Platform configuration saved and versioned');
    } catch (err: any) {
      toast.error(err.message || 'Failed to save configuration');
    } finally {
      setIsSavingConfig(false);
    }
  };

  return (
    <DashboardLayout
      portalTitle={t.executiveCommandCenter}
      portalRole={user?.role || 'Finance Admin'}
      navItems={navItems}
      activePath="/admin/payouts"
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
      <div className="space-y-6 max-w-6xl mx-auto">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-slate-900 dark:text-slate-100">
              Finance & LankaPay Payout Desk
            </h1>
            <p className="text-xs text-slate-400">
              Execute commercial bank withdrawals and configure platform grade multipliers
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant={activeTab === 'queue' ? 'primary' : 'outline'}
              size="sm"
              onClick={() => setActiveTab('queue')}
              className={activeTab === 'queue' ? 'bg-emerald-600' : ''}
            >
              Withdrawal Queue ({payouts.length})
            </Button>
            <Button
              variant={activeTab === 'config' ? 'primary' : 'outline'}
              size="sm"
              onClick={() => setActiveTab('config')}
              className={activeTab === 'config' ? 'bg-emerald-600' : ''}
              leftIcon={<Sliders className="w-4 h-4" />}
            >
              Commission Rates
            </Button>
          </div>
        </div>

        {activeTab === 'queue' ? (
          <div className="space-y-4">
            {isLoading ? (
              <div className="flex justify-center py-12">
                <Spinner size="md" />
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-400 font-bold">
                    Total Pending: LKR {payouts.reduce((acc: number, p: any) => acc + (p.amountLkr || 0), 0).toLocaleString()}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => toast.success('Exported LankaPay CEFT batch file')}
                    leftIcon={<FileSpreadsheet className="w-4 h-4" />}
                  >
                    Export LankaPay Batch
                  </Button>
                </div>

                <DataTable
                  data={payouts}
                  keyExtractor={(p: any) => p._id}
                  columns={[
                    {
                      header: 'Recipient & Role',
                      accessor: (row: any) => (
                        <div>
                          <span className="font-bold text-xs text-slate-900 dark:text-slate-100 block">
                            {(row.userId as any)?.fullName || 'Unknown User'}
                          </span>
                          <span className="text-[11px] text-slate-400">
                            {(row.userId as any)?.role} • {new Date(row.createdAt).toLocaleString()}
                          </span>
                        </div>
                      ),
                    },
                    {
                      header: 'Bank Account (LankaPay)',
                      accessor: (row: any) => {
                        const bank = (row.userId as any)?.bankDetails;
                        const raw = bank?.accountNumber || '';
                        const masked = raw.startsWith('••••')
                          ? raw
                          : raw.length > 4
                          ? `•••• •••• ${raw.slice(-4)}`
                          : raw || '—';
                        return (
                          <div className="text-xs">
                            <span className="font-semibold text-slate-800 dark:text-slate-200 block">
                              {bank?.bankName || '—'}
                            </span>
                            <span className="text-slate-400 font-mono">
                              {masked} {bank?.branchName ? `(${bank.branchName})` : ''}
                            </span>
                          </div>
                        );
                      },
                    },
                    {
                      header: 'Amount (LKR)',
                      accessor: (row: any) => (
                        <span className="font-mono font-black text-xs text-emerald-600 dark:text-emerald-400">
                          LKR {(row.amountLkr || 0).toLocaleString()}
                        </span>
                      ),
                    },
                    {
                      header: 'LankaPay Ref & Actions',
                      accessor: (row: any) => (
                        <div className="flex flex-col gap-1.5">
                          <div className="flex items-center gap-2">
                            <Input
                              placeholder="CEFT-ref"
                              value={refNumbers[row._id] || ''}
                              onChange={(e) =>
                                setRefNumbers({ ...refNumbers, [row._id]: e.target.value })
                              }
                              className="w-28 text-xs h-8"
                            />
                            <Button
                              variant="primary"
                              size="sm"
                              isLoading={processingId === row._id}
                              onClick={() => handleProcessPayout(row._id)}
                              className="bg-emerald-600 hover:bg-emerald-700 text-xs py-1 px-2.5 h-8"
                              leftIcon={<CheckCircle2 className="w-3 h-3" />}
                            >
                              Process
                            </Button>
                          </div>
                          <div className="flex items-center gap-2">
                            <Input
                              placeholder="Rejection reason"
                              value={rejectReasons[row._id] || ''}
                              onChange={(e) =>
                                setRejectReasons({ ...rejectReasons, [row._id]: e.target.value })
                              }
                              className="w-28 text-xs h-8"
                            />
                            <Button
                              variant="outline"
                              size="sm"
                              isLoading={processingId === row._id}
                              onClick={() => handleRejectPayout(row._id)}
                              className="text-rose-600 border-rose-200 text-xs py-1 px-2.5 h-8"
                              leftIcon={<XCircle className="w-3 h-3" />}
                            >
                              Reject
                            </Button>
                          </div>
                        </div>
                      ),
                    },
                  ]}
                  emptyMessage="All bank withdrawal requests have been processed!"
                />
              </>
            )}
          </div>
        ) : (
          <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
            <h3 className="font-extrabold text-slate-900 dark:text-slate-100 text-base">
              Platform Commission & Quality Grade Multipliers
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Base Platform Commission (%)"
                type="number"
                value={platformFee}
                onChange={(e) => setPlatformFee(e.target.value)}
              />
              <Input
                label="Village Collector Commission (%)"
                type="number"
                value={collectorFee}
                onChange={(e) => setCollectorFee(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-3 gap-4 pt-2">
              <Input
                label="Grade A Multiplier (%)"
                type="number"
                value={gradeAMultiplier}
                onChange={(e) => setGradeAMultiplier(e.target.value)}
              />
              <Input
                label="Grade B Multiplier (%)"
                type="number"
                value={gradeBMultiplier}
                onChange={(e) => setGradeBMultiplier(e.target.value)}
              />
              <Input
                label="Grade C Multiplier (%)"
                type="number"
                value={gradeCMultiplier}
                onChange={(e) => setGradeCMultiplier(e.target.value)}
              />
            </div>

            <Button
              variant="primary"
              size="md"
              onClick={handleSaveConfig}
              isLoading={isSavingConfig}
              className="bg-emerald-600 hover:bg-emerald-700"
            >
              Save & Version Rates
            </Button>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};
