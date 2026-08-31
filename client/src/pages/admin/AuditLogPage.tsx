import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from '@/components/templates/DashboardLayout';
import { DataTable } from '@/components/organisms/DataTable';
import { Badge } from '@/components/atoms/Badge';
import { Button } from '@/components/atoms/Button';
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
  Lock,
} from 'lucide-react';
import toast from 'react-hot-toast';

export const AuditLogPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const { isDark, toggleTheme, language, setLanguage } = useThemeStore();
  const { t } = useTranslation();

  const auditLogs = [
    {
      id: 'LOG-9842',
      timestamp: 'Today, 11:45 AM',
      adminName: 'Super Admin (admin@pola.lk)',
      action: 'PAYOUT_PROCESSED',
      target: 'Payout PAY-901 (K.M. Bandara)',
      beforeState: 'pending_lankapay',
      afterState: 'cleared (Ref: CEFT-984920)',
      ip: '192.168.1.1',
    },
    {
      id: 'LOG-9841',
      timestamp: 'Today, 10:30 AM',
      adminName: 'Super Admin (admin@pola.lk)',
      action: 'DISPUTE_ADJUDICATED',
      target: 'Dispute DISP-1049 (Order #POL-84920)',
      beforeState: 'in_review',
      afterState: 'resolved_partial_refund',
      ip: '192.168.1.1',
    },
    {
      id: 'LOG-9840',
      timestamp: 'Yesterday, 04:15 PM',
      adminName: 'Operations Staff (ops@pola.lk)',
      action: 'KYC_APPROVED',
      target: 'User 6a91bd44... (K.M. Bandara)',
      beforeState: 'pending_verification',
      afterState: 'verified',
      ip: '192.168.1.4',
    },
  ];

  const navItems = [
    { id: 'dashboard', label: 'Command Center', icon: <ShieldAlert className="w-5 h-5" />, path: '/admin/dashboard' },
    { id: 'kyc', label: 'KYC Verifications', icon: <Users className="w-5 h-5" />, path: '/admin/kyc' },
    { id: 'payouts', label: 'LankaPay Payouts', icon: <DollarSign className="w-5 h-5" />, path: '/admin/payouts' },
    { id: 'disputes', label: 'Disputes Desk', icon: <Scale className="w-5 h-5" />, path: '/admin/disputes' },
    { id: 'logistics', label: 'Logistics Config', icon: <Truck className="w-5 h-5" />, path: '/admin/hubs' },
    { id: 'audit', label: 'Audit Trail', icon: <FileCheck className="w-5 h-5" />, path: '/admin/audit' },
    { id: 'reports', label: 'Reports Studio', icon: <FileText className="w-5 h-5" />, path: '/admin/reports' },
  ];

  return (
    <DashboardLayout
      portalTitle={t.executiveCommandCenter}
      portalRole={user?.role || 'Super Admin'}
      navItems={navItems}
      activePath="/admin/audit"
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
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-purple-50 dark:bg-purple-950 text-purple-600 dark:text-purple-300">
              <Lock className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-slate-900 dark:text-slate-100">
                Immutable System Audit Trail
              </h1>
              <p className="text-xs text-slate-400">
                Append-only ledger recording every executive state change, payout, and KYC approval
              </p>
            </div>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => toast.success('Exported Audit Log to CSV')}
            leftIcon={<FileSpreadsheet className="w-4 h-4" />}
          >
            Export Audit CSV
          </Button>
        </div>

        <DataTable
          data={auditLogs}
          keyExtractor={(l) => l.id}
          columns={[
            {
              header: 'Timestamp & Log ID',
              accessor: (row) => (
                <div>
                  <span className="font-mono font-bold text-xs text-slate-900 dark:text-slate-100 block">
                    {row.id}
                  </span>
                  <span className="text-[11px] text-slate-400">{row.timestamp}</span>
                </div>
              ),
            },
            {
              header: 'Action Performed',
              accessor: (row) => (
                <Badge variant="purple" size="sm">
                  {row.action}
                </Badge>
              ),
            },
            {
              header: 'Admin User',
              accessor: (row) => (
                <span className="text-xs text-slate-600 dark:text-slate-300">
                  {row.adminName}
                </span>
              ),
            },
            {
              header: 'Target Entity & State Transition',
              accessor: (row) => (
                <div className="text-xs space-y-0.5">
                  <span className="font-semibold text-slate-800 dark:text-slate-200 block">
                    {row.target}
                  </span>
                  <span className="text-[11px] text-slate-400">
                    {row.beforeState} ──► <strong>{row.afterState}</strong>
                  </span>
                </div>
              ),
            },
          ]}
        />
      </div>
    </DashboardLayout>
  );
};
