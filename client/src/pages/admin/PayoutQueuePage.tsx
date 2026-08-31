import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from '@/components/templates/DashboardLayout';
import { DataTable } from '@/components/organisms/DataTable';
import { Badge } from '@/components/atoms/Badge';
import { Button } from '@/components/atoms/Button';
import { Input } from '@/components/atoms/Input';
import { useAuthStore } from '@/store/authStore';
import { useThemeStore } from '@/store/themeStore';
import { useTranslation } from '@/lib/i18n';
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

  const [payouts, setPayouts] = useState([
    {
      id: 'PAY-901',
      userName: 'K.M. Bandara',
      role: 'Farmer',
      amount: 45000,
      bankName: 'Bank of Ceylon',
      branchName: 'Dambulla Main',
      accountNumber: '00849201948',
      holderName: 'K.M. Bandara',
      date: 'Today, 09:30 AM',
      status: 'Pending LankaPay',
    },
    {
      id: 'PAY-902',
      userName: 'N.S. Kumara',
      role: 'Delivery Driver',
      amount: 14850,
      bankName: 'Commercial Bank of Ceylon',
      branchName: 'Colombo 03 Branch',
      accountNumber: '1092847102',
      holderName: 'N.S. Kumara',
      date: 'Today, 10:45 AM',
      status: 'Pending LankaPay',
    },
  ]);

  // Commission Config
  const [platformFee, setPlatformFee] = useState('5.0');
  const [collectorFee, setCollectorFee] = useState('3.0');
  const [gradeAMultiplier, setGradeAMultiplier] = useState('100');
  const [gradeBMultiplier, setGradeBMultiplier] = useState('90');
  const [gradeCMultiplier, setGradeCMultiplier] = useState('75');

  const navItems = [
    { id: 'dashboard', label: 'Command Center', icon: <ShieldAlert className="w-5 h-5" />, path: '/admin/dashboard' },
    { id: 'kyc', label: 'KYC Verifications', icon: <Users className="w-5 h-5" />, path: '/admin/kyc' },
    { id: 'payouts', label: 'LankaPay Payouts', icon: <DollarSign className="w-5 h-5" />, path: '/admin/payouts' },
    { id: 'disputes', label: 'Disputes Desk', icon: <Scale className="w-5 h-5" />, path: '/admin/disputes' },
    { id: 'logistics', label: 'Logistics Config', icon: <Truck className="w-5 h-5" />, path: '/admin/hubs' },
    { id: 'audit', label: 'Audit Trail', icon: <FileCheck className="w-5 h-5" />, path: '/admin/audit' },
    { id: 'reports', label: 'Reports Studio', icon: <FileText className="w-5 h-5" />, path: '/admin/reports' },
  ];

  const handleProcessPayout = (id: string) => {
    const ref = refNumbers[id];
    if (!ref || !ref.trim()) {
      toast.error('Please enter LankaPay bank transaction reference number');
      return;
    }

    setPayouts(payouts.filter((p) => p.id !== id));
    toast.success(`Payout ${id} marked as Processed (Ref: ${ref}). Email receipt dispatched.`);
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
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400 font-bold">
                Total Pending Queue: LKR {payouts.reduce((acc, p) => acc + p.amount, 0).toLocaleString()}.00
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
              keyExtractor={(p) => p.id}
              columns={[
                {
                  header: 'Recipient & Role',
                  accessor: (row) => (
                    <div>
                      <span className="font-bold text-xs text-slate-900 dark:text-slate-100 block">
                        {row.userName}
                      </span>
                      <span className="text-[11px] text-slate-400">{row.role} • {row.date}</span>
                    </div>
                  ),
                },
                {
                  header: 'Bank Account (LankaPay)',
                  accessor: (row) => (
                    <div className="text-xs">
                      <span className="font-semibold text-slate-800 dark:text-slate-200 block">
                        {row.bankName}
                      </span>
                      <span className="text-slate-400">
                        {row.accountNumber} ({row.branchName})
                      </span>
                    </div>
                  ),
                },
                {
                  header: 'Amount (LKR)',
                  accessor: (row) => (
                    <span className="font-mono font-black text-xs text-emerald-600 dark:text-emerald-400">
                      LKR {row.amount.toLocaleString()}.00
                    </span>
                  ),
                },
                {
                  header: 'LankaPay Ref No. & Action',
                  accessor: (row) => (
                    <div className="flex items-center gap-2">
                      <Input
                        placeholder="e.g. CEFT-984920"
                        value={refNumbers[row.id] || ''}
                        onChange={(e) =>
                          setRefNumbers({ ...refNumbers, [row.id]: e.target.value })
                        }
                        className="w-36 text-xs h-8"
                      />
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => handleProcessPayout(row.id)}
                        className="bg-emerald-600 hover:bg-emerald-700 text-xs py-1 px-2.5 h-8"
                      >
                        Processed
                      </Button>
                    </div>
                  ),
                },
              ]}
              emptyMessage="All bank withdrawal requests have been processed!"
            />
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
              onClick={() => toast.success('Configuration saved & versioned in immutable ledger')}
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
