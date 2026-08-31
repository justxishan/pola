import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from '@/components/templates/DashboardLayout';
import { Badge } from '@/components/atoms/Badge';
import { Button } from '@/components/atoms/Button';
import { Textarea } from '@/components/atoms/Textarea';
import { Input } from '@/components/atoms/Input';
import { Spinner } from '@/components/atoms/Spinner';
import { useAuthStore } from '@/store/authStore';
import { useThemeStore } from '@/store/themeStore';
import { useTranslation } from '@/lib/i18n';
import { DisputeService } from '@/services/dispute.service';
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
  const [disputes, setDisputes] = useState<any[]>([]);
  const [selectedDispute, setSelectedDispute] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [decisionNotes, setDecisionNotes] = useState('');
  const [partialRefundAmount, setPartialRefundAmount] = useState('');
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

  useEffect(() => {
    fetchDisputes();
  }, [activeTab]);

  const fetchDisputes = async () => {
    try {
      setIsLoading(true);
      const status = activeTab === 'open' ? 'open,in_review' : 'resolved,rejected';
      const res: any = await DisputeService.getAllDisputes(status);
      if (res.success && res.data) {
        const fetched = res.data.disputes || [];
        setDisputes(fetched);
        setSelectedDispute(fetched[0] || null);
      }
    } catch (err: any) {
      toast.error('Failed to load disputes');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResolve = async (decision: 'full_refund' | 'partial_refund' | 'reject' | 'replace') => {
    if (!selectedDispute) return;
    if (!decisionNotes.trim()) {
      toast.error('Please enter adjudication decision notes before resolving');
      return;
    }
    if (decision === 'partial_refund' && !partialRefundAmount) {
      toast.error('Please enter the partial refund amount');
      return;
    }
    try {
      setIsResolving(true);
      await DisputeService.adjudicateDispute(
        selectedDispute._id,
        decision,
        decisionNotes.trim(),
        decision === 'partial_refund' ? parseFloat(partialRefundAmount) : undefined
      );
      toast.success(`Dispute resolved: ${decision.replace(/_/g, ' ')}. Escrow adjusted automatically.`);
      setDecisionNotes('');
      setPartialRefundAmount('');
      await fetchDisputes();
    } catch (err: any) {
      toast.error(err.message || 'Failed to execute adjudication');
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

          <div className="flex items-center gap-2">
            <Button
              variant={activeTab === 'open' ? 'primary' : 'outline'}
              size="sm"
              onClick={() => setActiveTab('open')}
              className={activeTab === 'open' ? 'bg-emerald-600' : ''}
            >
              Open ({disputes.length})
            </Button>
            <Button
              variant={activeTab === 'resolved' ? 'primary' : 'outline'}
              size="sm"
              onClick={() => setActiveTab('resolved')}
              className={activeTab === 'resolved' ? 'bg-emerald-600' : ''}
            >
              Resolved
            </Button>
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-16">
            <Spinner size="md" />
          </div>
        ) : !selectedDispute ? (
          <div className="p-12 text-center text-xs text-slate-400 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800">
            <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
            <p className="font-bold text-slate-700 dark:text-slate-300">All disputes adjudicated!</p>
            <p>No open customer or farmer claims awaiting executive decision.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Dispute list */}
            {disputes.length > 1 && (
              <div className="space-y-2">
                {disputes.map((d: any) => (
                  <button
                    key={d._id}
                    onClick={() => setSelectedDispute(d)}
                    className={`w-full text-left p-4 rounded-2xl border text-xs transition-all ${
                      selectedDispute?._id === d._id
                        ? 'border-teal-500 bg-teal-50 dark:bg-teal-950/30'
                        : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-teal-300'
                    }`}
                  >
                    <span className="font-bold text-slate-900 dark:text-slate-100 block">
                      #{d.orderId?.orderNumber || d._id?.slice(-8)}
                    </span>
                    <span className="text-slate-400">{d.reason?.slice(0, 40)}...</span>
                  </button>
                ))}
              </div>
            )}

            {/* Main dispute card */}
            <div className={`${disputes.length > 1 ? 'lg:col-span-2' : 'lg:col-span-3'} p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-6`}>
              <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
                <div>
                  <span className="font-mono font-bold text-sm text-slate-900 dark:text-slate-100">
                    Case #{selectedDispute._id?.slice(-8).toUpperCase()}
                  </span>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Opened: {new Date(selectedDispute.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <Badge variant="amber" size="sm">{selectedDispute.status}</Badge>
              </div>

              {/* Split Screen Evidence */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-5 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200/60 dark:border-emerald-800/40 space-y-3">
                  <span className="font-bold text-xs text-emerald-800 dark:text-emerald-300">
                    Hub Intake Record
                  </span>
                  <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs space-y-1.5">
                    <p><strong>Farmer:</strong> {(selectedDispute.farmerId as any)?.fullName || 'Unknown'}</p>
                    <p><strong>Hub Grade:</strong> {selectedDispute.hubReport?.grade || 'N/A'}</p>
                    <p><strong>Inspector Notes:</strong> {selectedDispute.hubReport?.notes || '—'}</p>
                  </div>
                </div>

                <div className="p-5 rounded-2xl bg-red-50/50 dark:bg-red-950/20 border border-red-200/60 dark:border-red-800/40 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-red-800 dark:text-red-300">
                      Customer Complaint
                    </span>
                    <Badge variant="rose" size="sm">Reported Damage</Badge>
                  </div>
                  <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs space-y-1.5">
                    <p><strong>Issue:</strong> {selectedDispute.reason}</p>
                    <p><strong>Details:</strong> {selectedDispute.description}</p>
                    <p><strong>Order Value:</strong> LKR {(selectedDispute.orderId?.grandTotal || 0).toLocaleString()}</p>
                  </div>
                </div>
              </div>

              {/* Evidence photos */}
              {selectedDispute.evidencePhotos?.length > 0 && (
                <div className="space-y-2">
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Customer Evidence Photos:</span>
                  <div className="flex gap-2 flex-wrap">
                    {selectedDispute.evidencePhotos.map((url: string, i: number) => (
                      <a key={i} href={url} target="_blank" rel="noopener noreferrer">
                        <img src={url} alt={`Evidence ${i + 1}`} className="w-24 h-24 rounded-xl object-cover border border-slate-200 dark:border-slate-800" />
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {/* Adjudication Controls */}
              {activeTab === 'open' && (
                <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 space-y-4">
                  <h4 className="font-bold text-xs text-slate-800 dark:text-slate-200">
                    Execute Adjudication Decision:
                  </h4>

                  <Textarea
                    label="Decision Notes (required)"
                    placeholder="Explain the rationale for your decision..."
                    value={decisionNotes}
                    onChange={(e) => setDecisionNotes(e.target.value)}
                    rows={3}
                  />

                  <Input
                    label="Partial Refund Amount (LKR) — only for partial refund"
                    type="number"
                    placeholder="e.g. 1500"
                    value={partialRefundAmount}
                    onChange={(e) => setPartialRefundAmount(e.target.value)}
                  />

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <Button
                      variant="primary"
                      size="sm"
                      isLoading={isResolving}
                      onClick={() => handleResolve('partial_refund')}
                      className="bg-amber-600 hover:bg-amber-700"
                    >
                      Partial Refund
                    </Button>

                    <Button
                      variant="primary"
                      size="sm"
                      isLoading={isResolving}
                      onClick={() => handleResolve('full_refund')}
                      className="bg-red-600 hover:bg-red-700"
                    >
                      Full Refund
                    </Button>

                    <Button
                      variant="outline"
                      size="sm"
                      isLoading={isResolving}
                      onClick={() => handleResolve('reject')}
                    >
                      Reject Complaint
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};
