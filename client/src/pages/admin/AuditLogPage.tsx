import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from '@/components/templates/DashboardLayout';
import { DataTable } from '@/components/organisms/DataTable';
import { Badge } from '@/components/atoms/Badge';
import { Button } from '@/components/atoms/Button';
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
  Lock,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import toast from 'react-hot-toast';

const ACTION_COLORS: Record<string, string> = {
  KYC_VERIFIED: 'emerald',
  KYC_REJECTED: 'rose',
  WITHDRAWAL_PROCESSED: 'emerald',
  WITHDRAWAL_REJECTED: 'rose',
  ORDER_FORCE_REASSIGNED: 'amber',
};

export const AuditLogPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const { isDark, toggleTheme, language, setLanguage } = useThemeStore();
  const { t } = useTranslation();

  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

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
    fetchLogs(page);
  }, [page]);

  const fetchLogs = async (currentPage: number) => {
    try {
      setIsLoading(true);
      const res: any = await AdminService.getAuditLogs(currentPage);
      if (res.success && res.data) {
        setAuditLogs(res.data.logs || []);
        setTotalPages(res.data.meta?.totalPages || 1);
      }
    } catch (err: any) {
      toast.error('Failed to load audit logs');
    } finally {
      setIsLoading(false);
    }
  };

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

        {isLoading ? (
          <div className="flex justify-center py-16">
            <Spinner size="md" />
          </div>
        ) : (
          <>
            <DataTable
              data={auditLogs}
              keyExtractor={(l: any) => l._id}
              columns={[
                {
                  header: 'Timestamp & Log ID',
                  accessor: (row: any) => (
                    <div>
                      <span className="font-mono font-bold text-xs text-slate-900 dark:text-slate-100 block">
                        {row._id?.slice(-8).toUpperCase()}
                      </span>
                      <span className="text-[11px] text-slate-400">
                        {new Date(row.createdAt).toLocaleString()}
                      </span>
                    </div>
                  ),
                },
                {
                  header: 'Action Performed',
                  accessor: (row: any) => (
                    <Badge variant={(ACTION_COLORS[row.action] as any) || 'purple'} size="sm">
                      {row.action}
                    </Badge>
                  ),
                },
                {
                  header: 'Admin User',
                  accessor: (row: any) => (
                    <div className="text-xs">
                      <span className="font-semibold text-slate-800 dark:text-slate-200 block">
                        {row.adminEmail}
                      </span>
                      <span className="text-slate-400 capitalize">{row.adminRole}</span>
                    </div>
                  ),
                },
                {
                  header: 'Target Entity',
                  accessor: (row: any) => (
                    <div className="text-xs space-y-0.5">
                      <span className="font-semibold text-slate-800 dark:text-slate-200 block">
                        {row.targetEntity} #{row.targetId?.slice(-8)}
                      </span>
                      {row.details?.rejectionReason && (
                        <span className="text-[11px] text-rose-500">
                          Reason: {row.details.rejectionReason}
                        </span>
                      )}
                      {row.details?.bankReferenceNumber && (
                        <span className="text-[11px] text-emerald-600">
                          Ref: {row.details.bankReferenceNumber}
                        </span>
                      )}
                    </div>
                  ),
                },
              ]}
              emptyMessage="No audit log entries found"
            />

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  leftIcon={<ChevronLeft className="w-4 h-4" />}
                >
                  Previous
                </Button>
                <span className="text-xs text-slate-500 font-semibold">
                  Page {page} of {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  rightIcon={<ChevronRight className="w-4 h-4" />}
                >
                  Next
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </DashboardLayout>
  );
};
