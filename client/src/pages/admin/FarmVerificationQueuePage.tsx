import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from '@/components/templates/DashboardLayout';
import { Button } from '@/components/atoms/Button';
import { Badge } from '@/components/atoms/Badge';
import { Spinner } from '@/components/atoms/Spinner';
import { EmptyState } from '@/components/molecules/EmptyState';
import { useAuthStore } from '@/store/authStore';
import { useThemeStore } from '@/store/themeStore';
import { useTranslation } from '@/lib/i18n';
import { getAdminNavItems } from '@/lib/navItems';
import { api } from '@/services/api';
import {
  CheckCircle2,
  XCircle,
  Sprout,
  MapPin,
  Calendar,
  Droplets,
  Ruler,
  Leaf,
  User,
  Phone,
  Mail,
  Info,
} from 'lucide-react';
import toast from 'react-hot-toast';

interface PendingFarm {
  _id: string;
  farmName: string;
  province: string;
  district: string;
  city: string;
  addressLine: string;
  extentValue: number;
  extentUnit: string;
  ownershipType: string;
  irrigationType: string;
  primaryCrops: string[];
  isOrganicCertified: boolean;
  organicCertIssuer?: string;
  organicCertExpiry?: string;
  notes?: string;
  createdAt: string;
  farmerId: {
    _id: string;
    fullName: string;
    email: string;
    phone: string;
    kycStatus: string;
  };
}

const irrigationLabels: Record<string, string> = {
  rain_fed: 'Rain-fed',
  irrigated: 'Irrigated',
  drip: 'Drip Irrigation',
  well: 'Well',
  canal: 'Canal',
};

export const FarmVerificationQueuePage: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const { isDark, toggleTheme, language, setLanguage } = useThemeStore();
  const { t } = useTranslation();

  const [farms, setFarms] = useState<PendingFarm[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [approveTarget, setApproveTarget] = useState<PendingFarm | null>(null);
  const [approveNotes, setApproveNotes] = useState('');
  const [rejectTarget, setRejectTarget] = useState<PendingFarm | null>(null);
  const [rejectReason, setRejectReason] = useState('');

  const navItems = getAdminNavItems({ pendingFarmsCount: farms.length });

  useEffect(() => {
    fetchQueue();
  }, []);

  const fetchQueue = async () => {
    try {
      setIsLoading(true);
      const res: any = await api.get('/admin/farms/queue');
      if (res.success && res.data) setFarms(res.data.farms || []);
    } catch {
      toast.error('Failed to load farm verification queue');
    } finally {
      setIsLoading(false);
    }
  };

  const handleApprove = async () => {
    if (!approveTarget) return;
    try {
      setProcessingId(approveTarget._id);
      const res: any = await api.patch(`/admin/farms/${approveTarget._id}/verify`, { notes: approveNotes });
      toast.success(res.message || `Farm "${approveTarget.farmName}" approved!`);
      setApproveTarget(null);
      setApproveNotes('');
      fetchQueue();
    } catch (err: any) {
      toast.error(err.message || 'Failed to approve farm');
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async () => {
    if (!rejectTarget) return;
    if (!rejectReason.trim()) { toast.error('Please provide a rejection reason'); return; }
    try {
      setProcessingId(rejectTarget._id);
      const res: any = await api.patch(`/admin/farms/${rejectTarget._id}/reject`, { reason: rejectReason });
      toast.success(res.message || `Farm "${rejectTarget.farmName}" rejected.`);
      setRejectTarget(null);
      setRejectReason('');
      fetchQueue();
    } catch (err: any) {
      toast.error(err.message || 'Failed to reject farm');
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <DashboardLayout
      portalTitle="Executive Command Center"
      portalRole={user?.role || 'Super Admin'}
      navItems={navItems}
      activePath="/admin/farms"
      onNavigate={(path) => navigate(path)}
      currentLanguage={language}
      onLanguageChange={setLanguage}
      isDark={isDark}
      onToggleTheme={toggleTheme}
      user={user || undefined}
      onLogout={() => { logout(); navigate('/'); }}
    >
      <div className="space-y-6 max-w-5xl mx-auto">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-slate-900 dark:text-slate-100">Farm Plot Verification Queue</h1>
            <p className="text-xs text-slate-400 mt-0.5">
              Approving a farm sets it to Verified and automatically activates all its pending crop listings on the marketplace.
            </p>
          </div>
          <Badge variant="warning" size="md">{farms.length} Pending</Badge>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-20"><Spinner size="lg" /></div>
        ) : farms.length === 0 ? (
          <EmptyState title="No Pending Farm Registrations" description="All submitted farm plots have been reviewed. New registrations will appear here." />
        ) : (
          <div className="space-y-5">
            {farms.map((farm) => (
              <div key={farm._id} className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-5">
                {/* Header */}
                <div className="flex flex-wrap items-start justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-lime-100 dark:bg-lime-900/30 flex items-center justify-center shrink-0">
                      <Sprout className="w-5 h-5 text-lime-600 dark:text-lime-400" />
                    </div>
                    <div>
                      <h3 className="font-black text-slate-900 dark:text-slate-100 text-base">{farm.farmName}</h3>
                      <div className="flex items-center gap-1.5 text-xs text-slate-400 font-mono">
                        <MapPin className="w-3 h-3" />
                        <span>{farm.city}, {farm.district}, {farm.province}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-slate-400">
                    <Calendar className="w-3.5 h-3.5" />
                    {new Date(farm.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </div>
                </div>

                {/* Detail Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 text-xs">
                  <div className="space-y-1.5">
                    <p className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">Farm Owner</p>
                    <div className="flex items-center gap-1.5 font-semibold text-slate-800 dark:text-slate-200">
                      <User className="w-3.5 h-3.5 text-teal-500" />{farm.farmerId?.fullName || '—'}
                    </div>
                    <div className="flex items-center gap-1.5 text-slate-400">
                      <Phone className="w-3 h-3" />{farm.farmerId?.phone || '—'}
                    </div>
                    <div className="flex items-center gap-1.5 text-slate-400">
                      <Mail className="w-3 h-3" />{farm.farmerId?.email || '—'}
                    </div>
                    <Badge variant={farm.farmerId?.kycStatus === 'verified' ? 'success' : 'warning'} size="sm">
                      KYC: {farm.farmerId?.kycStatus || 'unknown'}
                    </Badge>
                  </div>

                  <div className="space-y-1.5">
                    <p className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">Plot Details</p>
                    <div className="flex items-center gap-1.5 font-semibold text-slate-800 dark:text-slate-200">
                      <Ruler className="w-3.5 h-3.5 text-blue-500" />
                      {farm.extentValue} {farm.extentUnit} · {farm.ownershipType}
                    </div>
                    <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
                      <Droplets className="w-3.5 h-3.5 text-sky-500" />
                      {irrigationLabels[farm.irrigationType] || farm.irrigationType}
                    </div>
                    {farm.isOrganicCertified && (
                      <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-semibold">
                        <Leaf className="w-3.5 h-3.5" />
                        Organic {farm.organicCertIssuer ? `(${farm.organicCertIssuer})` : ''}
                      </div>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <p className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">Primary Crops</p>
                    <div className="flex flex-wrap gap-1">
                      {farm.primaryCrops?.length > 0
                        ? farm.primaryCrops.map((c) => <Badge key={c} variant="lime" size="sm">{c}</Badge>)
                        : <span className="text-slate-400">Not specified</span>
                      }
                    </div>
                  </div>
                </div>

                {farm.notes && (
                  <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 flex gap-2 text-xs text-slate-600 dark:text-slate-300">
                    <Info className="w-3.5 h-3.5 mt-0.5 shrink-0 text-slate-400" />{farm.notes}
                  </div>
                )}

                {/* Actions */}
                <div className="flex flex-wrap gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                  <Button variant="primary" size="sm" isLoading={processingId === farm._id}
                    onClick={() => { setApproveTarget(farm); setApproveNotes(''); }}
                    leftIcon={<CheckCircle2 className="w-4 h-4" />}
                    className="bg-emerald-600 hover:bg-emerald-700">
                    Approve & Activate Products
                  </Button>
                  <Button variant="outline" size="sm" isLoading={processingId === farm._id}
                    onClick={() => { setRejectTarget(farm); setRejectReason(''); }}
                    leftIcon={<XCircle className="w-4 h-4 text-red-500" />}
                    className="border-red-200 dark:border-red-900 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20">
                    Reject Farm
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Approve Modal */}
      {approveTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <h3 className="font-black text-slate-900 dark:text-slate-100">Approve Farm Plot</h3>
                <p className="text-xs text-slate-400">{approveTarget.farmName} · {approveTarget.district}</p>
              </div>
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-300">
              This will set the farm to <strong>Verified</strong> and automatically activate all pending crop listings on the public marketplace.
            </p>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Admin Notes (optional)</label>
              <textarea className="w-full rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-emerald-500" rows={2}
                placeholder="e.g. Documents verified, GPS confirmed" value={approveNotes} onChange={(e) => setApproveNotes(e.target.value)} />
            </div>
            <div className="flex gap-3">
              <Button variant="outline" size="sm" onClick={() => setApproveTarget(null)} className="flex-1">Cancel</Button>
              <Button variant="primary" size="sm" onClick={handleApprove} isLoading={processingId === approveTarget._id}
                className="flex-1 bg-emerald-600 hover:bg-emerald-700">Approve & Activate</Button>
            </div>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {rejectTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                <XCircle className="w-5 h-5 text-red-500" />
              </div>
              <div>
                <h3 className="font-black text-slate-900 dark:text-slate-100">Reject Farm Plot</h3>
                <p className="text-xs text-slate-400">{rejectTarget.farmName} · {rejectTarget.district}</p>
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Rejection Reason *</label>
              <textarea className="w-full rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-red-500" rows={3}
                placeholder="e.g. Invalid ownership documents, GPS coordinates out of service area" value={rejectReason} onChange={(e) => setRejectReason(e.target.value)} />
            </div>
            <div className="flex gap-3">
              <Button variant="outline" size="sm" onClick={() => setRejectTarget(null)} className="flex-1">Cancel</Button>
              <Button variant="primary" size="sm" onClick={handleReject} isLoading={processingId === rejectTarget._id}
                className="flex-1 bg-red-600 hover:bg-red-700">Reject Farm</Button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};
