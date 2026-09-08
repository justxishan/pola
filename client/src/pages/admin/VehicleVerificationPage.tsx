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
import { VehicleService } from '@/services/vehicle.service';
import {
  Truck,
  CheckCircle2,
  XCircle,
  FileText,
  User,
  Phone,
  Mail,
  Snowflake,
  AlertTriangle,
  Calendar,
  ExternalLink,
} from 'lucide-react';
import toast from 'react-hot-toast';

export const VehicleVerificationPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const { isDark, toggleTheme, language, setLanguage } = useThemeStore();
  const { t } = useTranslation();

  const [vehicles, setVehicles] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);

  // Rejection modal
  const [rejectTarget, setRejectTarget] = useState<any | null>(null);
  const [rejectReason, setRejectReason] = useState('');

  const navItems = getAdminNavItems({ pendingVehiclesCount: vehicles.length });

  useEffect(() => {
    fetchQueue();
  }, []);

  const fetchQueue = async () => {
    try {
      setIsLoading(true);
      const res: any = await VehicleService.getPendingVehicles();
      if (res.success && res.data) {
        setVehicles(res.data.vehicles || []);
      }
    } catch {
      toast.error('Failed to load vehicle verification queue');
    } finally {
      setIsLoading(false);
    }
  };

  const handleApprove = async (id: string) => {
    try {
      setProcessingId(id);
      const res: any = await VehicleService.verifyVehicle(id, true);
      if (res.success) {
        toast.success('Vehicle verified and approved for courier operations');
        setVehicles((prev) => prev.filter((v) => v._id !== id));
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || err.message || 'Failed to verify vehicle');
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async () => {
    if (!rejectTarget) return;
    if (!rejectReason.trim()) {
      toast.error('Please specify a rejection reason');
      return;
    }
    try {
      setProcessingId(rejectTarget._id);
      const res: any = await VehicleService.verifyVehicle(rejectTarget._id, false, rejectReason.trim());
      if (res.success) {
        toast.success('Vehicle rejected');
        setVehicles((prev) => prev.filter((v) => v._id !== rejectTarget._id));
        setRejectTarget(null);
        setRejectReason('');
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || err.message || 'Failed to reject vehicle');
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <DashboardLayout
      portalTitle="Pola Admin Command"
      portalRole={user?.role || 'Administrator'}
      navItems={navItems}
      activePath="/admin/vehicles"
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
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Truck className="w-7 h-7 text-amber-500" />
            Fleet &amp; Vehicle Verification Queue ({vehicles.length})
          </h1>
          <p className="text-xs text-slate-400">
            Review transport vehicles, commercial permits, CR books, and refrigerated cold chain specs before activating for radar dispatch.
          </p>
        </div>

        {isLoading ? (
          <div className="py-20 flex justify-center">
            <Spinner size="lg" />
          </div>
        ) : vehicles.length === 0 ? (
          <EmptyState
            title="Queue is Clear!"
            description="No transport vehicles are currently awaiting administrative verification."
            icon={<CheckCircle2 className="w-8 h-8 text-emerald-500" />}
          />
        ) : (
          <div className="space-y-4">
            {vehicles.map((v) => {
              const owner = v.ownerId;
              const isProcessing = processingId === v._id;

              return (
                <div
                  key={v._id}
                  className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4"
                >
                  <div className="flex flex-wrap items-start justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
                    <div className="flex items-start gap-3">
                      <div className="p-3 rounded-2xl bg-amber-50 dark:bg-amber-950 text-amber-600 dark:text-amber-300">
                        <Truck className="w-6 h-6" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-lg font-black text-slate-900 dark:text-slate-100">
                            {v.registrationPlate || v.licensePlate}
                          </h3>
                          <Badge variant="amber" size="sm">Pending Verification</Badge>
                          {v.hasColdChain && (
                            <Badge variant="sky" size="sm" className="flex items-center gap-1">
                              <Snowflake className="w-3 h-3" /> Cold Chain
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-slate-500 capitalize mt-0.5">
                          {v.makeModel} • Category: {v.vehicleType?.replace(/_/g, ' ')} • Capacity: {v.maxPayloadKg || v.capacityKg || 500} kg
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={isProcessing}
                        onClick={() => setRejectTarget(v)}
                        className="text-red-600 border-red-300 hover:bg-red-50"
                        leftIcon={<XCircle className="w-4 h-4" />}
                      >
                        Reject
                      </Button>
                      <Button
                        variant="primary"
                        size="sm"
                        isLoading={isProcessing}
                        onClick={() => handleApprove(v._id)}
                        className="bg-emerald-600 hover:bg-emerald-700 font-bold"
                        leftIcon={<CheckCircle2 className="w-4 h-4" />}
                      >
                        Approve Vehicle
                      </Button>
                    </div>
                  </div>

                  {/* Owner & Document Details */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                    <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 space-y-1.5">
                      <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                        Vehicle Owner Details
                      </span>
                      <p className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5 text-slate-400" />
                        {owner?.fullName || 'Delivery Partner'}
                      </p>
                      {owner?.email && (
                        <p className="text-slate-500 flex items-center gap-1.5">
                          <Mail className="w-3.5 h-3.5 text-slate-400" />
                          {owner.email}
                        </p>
                      )}
                      {owner?.phone && (
                        <p className="text-slate-500 flex items-center gap-1.5">
                          <Phone className="w-3.5 h-3.5 text-slate-400" />
                          {owner.phone}
                        </p>
                      )}
                    </div>

                    <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 space-y-2">
                      <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                        Compliance Documents
                      </span>
                      <div className="flex flex-wrap items-center gap-2">
                        {v.crBookDoc ? (
                          <a
                            href={v.crBookDoc}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-bold text-emerald-600 flex items-center gap-1.5 hover:bg-slate-50"
                          >
                            <FileText className="w-3.5 h-3.5" />
                            <span>CR Book Document</span>
                            <ExternalLink className="w-3 h-3 text-slate-400" />
                          </a>
                        ) : (
                          <span className="text-slate-400 text-xs flex items-center gap-1">
                            <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                            CR Book not uploaded
                          </span>
                        )}

                        {v.revenueLicenseDoc ? (
                          <a
                            href={v.revenueLicenseDoc}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-bold text-emerald-600 flex items-center gap-1.5 hover:bg-slate-50"
                          >
                            <FileText className="w-3.5 h-3.5" />
                            <span>Revenue License</span>
                            <ExternalLink className="w-3 h-3 text-slate-400" />
                          </a>
                        ) : (
                          <span className="text-slate-400 text-xs flex items-center gap-1">
                            <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                            Revenue License not uploaded
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Rejection Reason Modal */}
        {rejectTarget && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
              className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs"
              onClick={() => setRejectTarget(null)}
            />
            <div className="relative w-full max-w-md rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl p-6 sm:p-8 space-y-4 animate-in zoom-in-95">
              <div>
                <h3 className="font-extrabold text-slate-900 dark:text-slate-100 text-lg">
                  Reject Vehicle Registration
                </h3>
                <p className="text-xs text-slate-400">
                  Vehicle: {rejectTarget.registrationPlate || rejectTarget.licensePlate}
                </p>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Rejection Reason
                </label>
                <textarea
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  placeholder="e.g. Blurred CR Book photo, revenue license expired"
                  className="w-full h-24 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs p-3 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                <Button variant="outline" size="sm" onClick={() => setRejectTarget(null)}>
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  isLoading={processingId === rejectTarget._id}
                  onClick={handleReject}
                  className="bg-red-600 hover:bg-red-700"
                >
                  Confirm Rejection
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};
