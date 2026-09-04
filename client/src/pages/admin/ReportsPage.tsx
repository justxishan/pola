import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from '@/components/templates/DashboardLayout';
import { Select } from '@/components/atoms/Select';
import { Button } from '@/components/atoms/Button';
import { Badge } from '@/components/atoms/Badge';
import { useAuthStore } from '@/store/authStore';
import { useThemeStore } from '@/store/themeStore';
import { useTranslation } from '@/lib/i18n';
import { getAdminNavItems } from '@/lib/navItems';
import { api } from '@/services/api';
import {
  Download,
  FileSpreadsheet,
  FileText,
  Loader2,
} from 'lucide-react';
import toast from 'react-hot-toast';

interface ReportCard {
  id: number;
  title: string;
  type?: string;
  format: 'PDF / Excel' | 'PDF' | 'Excel';
  category: string;
}

export const ReportsPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const { isDark, toggleTheme, language, setLanguage } = useThemeStore();
  const { t } = useTranslation();

  const [selectedRange, setSelectedRange] = useState('30d');
  const [downloadingKey, setDownloadingKey] = useState<string | null>(null);

  const reports: ReportCard[] = [
    { id: 1, title: '1. Farmer Income & Net Revenue Report', type: 'farmer_income', format: 'PDF / Excel', category: 'Financial' },
    { id: 2, title: '2. Hub Collection & Intake Inspection Log', type: 'hub_collection', format: 'PDF / Excel', category: 'Logistics' },
    { id: 3, title: '3. Village Collector Commission Statement', type: 'collector_commission', format: 'PDF / Excel', category: 'Financial' },
    { id: 4, title: '4. Customer Order Detail & B2B Tax Invoices', format: 'PDF', category: 'Sales' },
    { id: 5, title: '5. Monthly B2B Commercial Purchase Summary', format: 'Excel', category: 'Sales' },
    { id: 6, title: '6. Produce Spending by Agricultural Category', format: 'PDF / Excel', category: 'Analytics' },
    { id: 7, title: '7. Delivery Fleet Trip & Earnings Statement', format: 'PDF / Excel', category: 'Logistics' },
    { id: 8, title: '8. Fleet Vehicle Capacity Utilization Report', format: 'Excel', category: 'Logistics' },
    { id: 9, title: '9. Platform GMV & 5% Commission Revenue', format: 'Excel', category: 'Executive' },
    { id: 10, title: '10. Courier Performance & Document Audit', format: 'PDF', category: 'Compliance' },
    { id: 11, title: '11. Farmer Quality & Hub Rejection Report', format: 'Excel', category: 'Quality' },
    { id: 12, title: '12. Customer Segmentation (B2B vs B2C)', format: 'Excel', category: 'Analytics' },
    { id: 13, title: '13. Village Hub Throughput & Volume Matrix', format: 'PDF', category: 'Logistics' },
    { id: 14, title: '14. Dispute, Refund & Grade Appeal Register', format: 'Excel', category: 'Executive' },
    { id: 15, title: '15. Agricultural Wastage & Spoilage Log', type: 'wastage_summary', format: 'PDF / Excel', category: 'Quality' },
  ];

  const navItems = getAdminNavItems();

  const handleGenerateReport = async (rep: ReportCard, requestedFormat: 'pdf' | 'excel') => {
    if (!rep.type) {
      toast(`Report "${rep.title}" is queued for background processing.`, { icon: 'ℹ️' });
      return;
    }

    const key = `${rep.id}-${requestedFormat}`;
    setDownloadingKey(key);
    const toastId = toast.loading(`Generating ${rep.title} (${requestedFormat.toUpperCase()})...`);

    try {
      const response = await api.get('/reports', {
        params: {
          reportType: rep.type,
          format: requestedFormat,
        },
        responseType: 'blob',
      });

      const mimeType = requestedFormat === 'pdf'
        ? 'application/pdf'
        : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';

      const blob = new Blob([response.data], { type: mimeType });
      const downloadUrl = window.URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.href = downloadUrl;
      anchor.download = `Pola-${rep.type}-${Date.now()}.${requestedFormat === 'pdf' ? 'pdf' : 'xlsx'}`;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      window.URL.revokeObjectURL(downloadUrl);

      toast.success(`${rep.title} exported successfully!`, { id: toastId });
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to download report', { id: toastId });
    } finally {
      setDownloadingKey(null);
    }
  };

  return (
    <DashboardLayout
      portalTitle={t.executiveCommandCenter}
      portalRole={user?.role || 'Super Admin'}
      navItems={navItems}
      activePath="/admin/reports"
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
              Reports & Analytics Studio
            </h1>
            <p className="text-xs text-slate-400">
              Generate and export operational, escrow, and agricultural logistics reports in PDF or Excel
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Select
              value={selectedRange}
              onChange={(e) => setSelectedRange(e.target.value)}
              options={[
                { value: '7d', label: 'Past 7 Days' },
                { value: '30d', label: 'Past 30 Days (Monthly)' },
                { value: 'maha', label: 'Maha Season (2025/26)' },
                { value: 'yala', label: 'Yala Season (2026)' },
                { value: 'annual', label: 'Annual FY 2026' },
              ]}
              className="w-44 text-xs"
            />
          </div>
        </div>

        {/* Reports Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {reports.map((rep) => {
            const isPdfLoading = downloadingKey === `${rep.id}-pdf`;
            const isExcelLoading = downloadingKey === `${rep.id}-excel`;
            const hasPdf = rep.format.includes('PDF');
            const hasExcel = rep.format.includes('Excel');

            return (
              <div
                key={rep.id}
                className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-4"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Badge variant="purple" size="sm">{rep.category}</Badge>
                    <span className="text-[11px] font-mono text-slate-400 font-bold">{rep.format}</span>
                  </div>
                  <h4 className="font-extrabold text-slate-900 dark:text-slate-100 text-sm leading-snug">
                    {rep.title}
                  </h4>
                </div>

                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex gap-2">
                  {hasPdf && (
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={isPdfLoading || isExcelLoading}
                      onClick={() => handleGenerateReport(rep, 'pdf')}
                      className="flex-1 text-xs"
                      leftIcon={isPdfLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <FileText className="w-3.5 h-3.5 text-rose-500" />}
                    >
                      {isPdfLoading ? 'Exporting...' : 'PDF'}
                    </Button>
                  )}
                  {hasExcel && (
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={isPdfLoading || isExcelLoading}
                      onClick={() => handleGenerateReport(rep, 'excel')}
                      className="flex-1 text-xs"
                      leftIcon={isExcelLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-500" />}
                    >
                      {isExcelLoading ? 'Exporting...' : 'Excel'}
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </DashboardLayout>
  );
};
