import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from '@/components/templates/DashboardLayout';
import { Badge } from '@/components/atoms/Badge';
import { Button } from '@/components/atoms/Button';
import { Textarea } from '@/components/atoms/Textarea';
import { useAuthStore } from '@/store/authStore';
import { useThemeStore } from '@/store/themeStore';
import { useTranslation } from '@/lib/i18n';
import {
  ShieldAlert,
  Users,
  ShoppingBag,
  Scale,
  DollarSign,
  Truck,
  FileText,
  FileCheck,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Layers,
  Sparkles,
} from 'lucide-react';
import toast from 'react-hot-toast';

export const DisputeAdjudicationPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const { isDark, toggleTheme, language, setLanguage } = useThemeStore();
  const { t } = useTranslation();

  const [activeTab, setActiveTab] = useState<'open' | 'resolved'>('open');
  const [selectedDispute, setSelectedDispute] = useState<any | null>({
    id: 'DISP-1049',
    orderNumber: '#POL-84920',
    date: 'Today, 10:15 AM',
    customerName: 'Ruwan Perera',
    farmerName: 'K.M. Bandara',
    driverName: 'N.S. Kumara',
    crop: 'Nuwara Eliya Carrot (Kuroda)',
    orderValue: 13250,
    reason: 'Bruised and damaged carrots upon delivery arrival',
    hubReport: {
      grade: 'Grade A',
      weightReceived: '120.0 kg',
      graderNotes: 'Dispatched in flawless condition from Keppetipola Hub #2',
    },
    customerComplaint: {
      notes: 'Approximately 5kg of carrots at the bottom of Crate #1 were squashed during transport transit.',
    },
  });

  const [decisionNotes, setDecisionNotes] = useState('');
  const [isResolving, setIsResolving] = useState(false);

  const navItems = [
    { id: 'dashboard', label: 'Command Center', icon: <ShieldAlert className="w-5 h-5" />, path: '/admin/dashboard' },
    { id: 'kyc', label: 'KYC Verifications', icon: <Users className="w-5 h-5" />, path: '/admin/kyc' },
    { id: 'payouts', label: 'LankaPay Payouts', icon: <DollarSign className="w-5 h-5" />, path: '/admin/payouts' },
    { id: 'disputes', label: 'Disputes Desk', icon: <Scale className="w-5 h-5" />, path: '/admin/disputes' },
    { id: 'logistics', label: 'Logistics Config', icon: <Truck className="w-5 h-5" />, path: '/admin/hubs' },
    { id: 'audit', label: 'Audit Trail', icon: <FileCheck className="w-5 h-5" />, path: '/admin/audit' },
    { id: 'reports', label: 'Reports Studio', icon: <FileText className="w-5 h-5" />, path: '/admin/reports' },
  ];

  const handleResolve = async (action: string) => {
    try {
      setIsResolving(true);
      await new Promise((resolve) => setTimeout(resolve, 800));
      toast.success(`Dispute ${selectedDispute?.id} resolved: ${action}. Escrow adjusted automatically.`);
      setSelectedDispute(null);
    } catch (err: any) {
      toast.error('Failed to execute adjudication');
    } finally {
      setIsResolving(false);
    }
  };

  return (
    <DashboardLayout
      portalTitle={t.executiveCommandCenter}
      portalRole={user?.role || 'Super Admin'}
      navItems={navItems}
      activePath="/admin/disputes"
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
              Dispute Adjudication Desk
            </h1>
            <p className="text-xs text-slate-400">
              Comparative photo evidence desk • Resolve customer damage claims vs Hub intake records
            </p>
          </div>

          <Badge variant="amber" size="md">
            1 Open Case Pending Decision
          </Badge>
        </div>

        {selectedDispute ? (
          <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
              <div>
                <span className="font-mono font-bold text-sm text-slate-900 dark:text-slate-100">
                  Case {selectedDispute.id} ({selectedDispute.orderNumber})
                </span>
                <p className="text-xs text-slate-400 mt-0.5">
                  Produce: <strong>{selectedDispute.crop}</strong> • Order Value: <strong>LKR {selectedDispute.orderValue.toLocaleString()}</strong>
                </p>
              </div>

              <div className="text-xs space-y-0.5 text-right">
                <p><strong>Customer:</strong> {selectedDispute.customerName}</p>
                <p><strong>Farmer:</strong> {selectedDispute.farmerName} • <strong>Driver:</strong> {selectedDispute.driverName}</p>
              </div>
            </div>

            {/* Split Screen Evidence */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left: Hub Inspection Record */}
              <div className="p-5 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200/60 dark:border-emerald-800/40 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-emerald-800 dark:text-emerald-300">
                    1. Hub Intake Inspection Record
                  </span>
                  <Badge variant="emerald" size="sm">{selectedDispute.hubReport.grade}</Badge>
                </div>
                <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs space-y-1.5">
                  <p><strong>Scale Weight:</strong> {selectedDispute.hubReport.weightReceived}</p>
                  <p><strong>Inspector Notes:</strong> {selectedDispute.hubReport.graderNotes}</p>
                </div>
              </div>

              {/* Right: Customer Complaint */}
              <div className="p-5 rounded-2xl bg-red-50/50 dark:bg-red-950/20 border border-red-200/60 dark:border-red-800/40 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-red-800 dark:text-red-300">
                    2. Customer Complaint & Photos
                  </span>
                  <Badge variant="rose" size="sm">Reported Damage</Badge>
                </div>
                <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs space-y-1.5">
                  <p><strong>Issue:</strong> {selectedDispute.reason}</p>
                  <p><strong>Customer Notes:</strong> {selectedDispute.customerComplaint.notes}</p>
                </div>
              </div>
            </div>

            {/* Adjudication Controls */}
            <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 space-y-4">
              <h4 className="font-bold text-xs text-slate-800 dark:text-slate-200">
                Execute Adjudication Decision:
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <Button
                  variant="primary"
                  size="sm"
                  isLoading={isResolving}
                  onClick={() => handleResolve('Partial Customer Refund (Transit Liability)')}
                  className="bg-amber-600 hover:bg-amber-700"
                >
                  Partial Wallet Credit (LKR 1,500)
                </Button>

                <Button
                  variant="primary"
                  size="sm"
                  isLoading={isResolving}
                  onClick={() => handleResolve('Full Refund to Customer')}
                  className="bg-red-600 hover:bg-red-700"
                >
                  Full Customer Refund
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  isLoading={isResolving}
                  onClick={() => handleResolve('Dispute Rejected (Hub Verified)')}
                >
                  Reject Complaint
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <div className="p-12 text-center text-xs text-slate-400 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800">
            <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
            <p className="font-bold text-slate-700 dark:text-slate-300">All disputes adjudicated!</p>
            <p>No open customer or farmer claims awaiting executive decision.</p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};
