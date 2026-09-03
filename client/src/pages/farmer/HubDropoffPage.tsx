import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from '@/components/templates/DashboardLayout';
import { Button } from '@/components/atoms/Button';
import { Badge } from '@/components/atoms/Badge';
import { Spinner } from '@/components/atoms/Spinner';
import { HubService } from '@/services/hub.service';
import { useAuthStore } from '@/store/authStore';
import { useThemeStore } from '@/store/themeStore';
import { useTranslation } from '@/lib/i18n';
import { getFarmerNavItems } from '@/lib/navItems';
import {
  Sprout,
  MapPin,
  Clock,
  QrCode,
  CheckCircle2,
  FileCheck,
  Truck,
  Printer,
  X,
  Scale,
} from 'lucide-react';
import toast from 'react-hot-toast';

export const HubDropoffPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const { isDark, toggleTheme, language, setLanguage } = useThemeStore();
  const { t } = useTranslation();

  const [hubData, setHubData] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isManifestOpen, setIsManifestOpen] = useState(false);

  const navItems = getFarmerNavItems(t);

  useEffect(() => {
    fetchHubData();
  }, []);

  const fetchHubData = async () => {
    try {
      setIsLoading(true);
      const res: any = await HubService.getMyHubDropoffs();
      if (res.success && res.data) {
        setHubData(res.data);
      }
    } catch (err: any) {
      console.error('Failed to load hub data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const assignedHub = hubData?.assignedHub;
  const upcomingBatch = hubData?.upcomingBatch;
  const inspections = hubData?.inspections || [];

  return (
    <DashboardLayout
      portalTitle={t.farmerOpsCenter || 'Farmer Portal'}
      portalRole={user?.role || 'Farmer'}
      navItems={navItems}
      mobileNavItems={navItems.map((item) => ({
        id: item.id,
        label: item.label,
        icon: item.icon,
        path: item.path,
      }))}
      activePath="/farmer/hubs"
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
      <div className="space-y-8 text-left">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 dark:text-slate-100">
            {t.hubDropoffs}
          </h1>
          <p className="text-xs text-slate-400">
            Manage scheduled drop-offs at your assigned Village Collection Point and inspect grading receipts
          </p>
        </div>

        {/* Assigned Village Hub Card */}
        <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-300">
                <Sprout className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-extrabold text-slate-900 dark:text-slate-100 text-lg">
                  {assignedHub?.hubName || 'Nearest Agrarian Services Hub'}
                </h3>
                <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                  <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                  {assignedHub?.addressLine ? `${assignedHub.addressLine}, ${assignedHub.city || ''}` : 'Keppetipola Agrarian Services Center, Welimada Rd'}
                </p>
              </div>
            </div>

            <Badge variant="emerald" size="md">
              Assigned Active Hub
            </Badge>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-slate-100 dark:border-slate-800 text-xs">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-slate-400" />
              <div>
                <span className="text-slate-400 block text-[11px]">Intake Schedule</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">
                  {assignedHub?.collectionSchedules?.find((s: any) => s.isActive)
                    ? `${assignedHub.collectionSchedules.find((s: any) => s.isActive).dayOfWeek}: ${assignedHub.collectionSchedules.find((s: any) => s.isActive).startTime} – ${assignedHub.collectionSchedules.find((s: any) => s.isActive).endTime}`
                    : 'Tue & Fri: 06:00 AM – 09:30 AM'}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Truck className="w-4 h-4 text-slate-400" />
              <div>
                <span className="text-slate-400 block text-[11px]">Leg-1 Transport Route</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">
                  {assignedHub?.linkedDcId?.name ? `Hub → ${assignedHub.linkedDcId.name}` : 'Hub → Dambulla DC'}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <FileCheck className="w-4 h-4 text-slate-400" />
              <div>
                <span className="text-slate-400 block text-[11px]">Next Intake Session</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400">
                  Scheduled for active intake days
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Prepare Drop-off Section */}
        <div className="p-6 rounded-3xl bg-slate-900 text-white space-y-4 shadow-md">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="space-y-1">
              <h3 className="text-base font-bold">Upcoming Drop-off Packing Batch</h3>
              <p className="text-xs text-slate-400">
                Aggregated crops ready for transport loading based on active customer orders
              </p>
            </div>

            {(upcomingBatch?.crops?.length || 0) > 0 && (
              <Button
                variant="primary"
                size="sm"
                onClick={() => setIsManifestOpen(true)}
                className="bg-emerald-500 hover:bg-emerald-600"
                leftIcon={<QrCode className="w-4 h-4" />}
              >
                Generate Batch Manifest QR
              </Button>
            )}
          </div>

          {(upcomingBatch?.crops?.length || 0) > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
              {upcomingBatch.crops.map((c: any, i: number) => (
                <div key={i} className="p-3.5 rounded-2xl bg-slate-800/80 border border-slate-700">
                  <span className="text-slate-400 text-xs block truncate">{c.cropName}</span>
                  <span className="text-base font-black text-emerald-400">{c.totalQuantity} {c.unit}</span>
                </div>
              ))}
              <div className="p-3.5 rounded-2xl bg-slate-800/80 border border-slate-700">
                <span className="text-slate-400 text-xs block">Crates Required</span>
                <span className="text-base font-black text-slate-200">{upcomingBatch.cratesRequired} Standard Crates</span>
              </div>
              <div className="p-3.5 rounded-2xl bg-slate-800/80 border border-slate-700">
                <span className="text-slate-400 text-xs block">Total Batch Value</span>
                <span className="text-base font-black text-amber-400">LKR {(upcomingBatch.totalBatchValue || 0).toLocaleString()}.00</span>
              </div>
            </div>
          ) : (
            <div className="py-6 text-center text-xs text-slate-400 border border-slate-800 rounded-2xl bg-slate-800/40">
              No orders awaiting hub collection currently. As soon as buyers place orders for your produce, batch packing slips and intake QR manifests will be generated here.
            </div>
          )}
        </div>

        {/* Past Intake Receipts & Quality Reports */}
        <div className="space-y-4">
          <h3 className="text-base font-extrabold text-slate-900 dark:text-slate-100">
            Hub Quality Inspection Receipts
          </h3>

          {isLoading ? (
            <div className="py-12 flex justify-center">
              <Spinner size="lg" />
            </div>
          ) : inspections.length === 0 ? (
            <div className="p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 text-center space-y-2">
              <Scale className="w-8 h-8 text-slate-400 mx-auto" />
              <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300">No Quality Inspection Receipts Yet</h4>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Receipts will appear here after your produce lots are weighed and quality-graded at the hub.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {inspections.map((receipt: any) => {
                const receiptNum = receipt.receiptNumber || 'REC-' + receipt._id.slice(-4).toUpperCase();
                const cropName = receipt.productId?.productName || receipt.productId?.title || 'Produce Lot';
                const dateStr = new Date(receipt.createdAt).toLocaleDateString(undefined, { dateStyle: 'medium' });
                const gradeStr = receipt.assignedGrade?.replace(/_/g, ' ').toUpperCase() || 'GRADE A';
                const multiplierPct = Math.round((receipt.priceMultiplier || 1) * 100);

                return (
                  <div
                    key={receipt._id}
                    className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-3"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
                      <div className="flex items-center gap-3">
                        <span className="font-mono font-bold text-xs text-slate-900 dark:text-slate-100">
                          {receiptNum}
                        </span>
                        <span className="text-xs text-slate-400">{dateStr}</span>
                        <span className="text-xs text-slate-500">• {cropName}</span>
                      </div>

                      <Badge variant={receipt.assignedGrade === 'grade_a' ? 'emerald' : 'amber'} size="sm">
                        {gradeStr} ({multiplierPct}%)
                      </Badge>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                      <div>
                        <span className="text-slate-400 block text-[11px]">Weight Verification</span>
                        <span className="font-bold text-slate-800 dark:text-slate-200">
                          Listed: {receipt.listedQuantity} kg → Scale: {receipt.confirmedQuantity} kg
                        </span>
                      </div>

                      <div className="sm:col-span-2">
                        <span className="text-slate-400 block text-[11px]">Grader Criteria Notes</span>
                        <span className="text-slate-600 dark:text-slate-300">
                          {receipt.criteriaNotes || 'Standard intake verified. No major defects noted.'}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Batch Manifest Modal */}
        {isManifestOpen && (
          <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
            <div
              className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity"
              onClick={() => setIsManifestOpen(false)}
            />

            <div className="relative w-full max-w-md rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl p-6 sm:p-8 space-y-6 text-center animate-in zoom-in-95">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-600">
                  Village Hub Intake Manifest
                </span>
                <button
                  onClick={() => setIsManifestOpen(false)}
                  className="p-1 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-800 flex flex-col items-center justify-center space-y-3">
                <QrCode className="w-28 h-28 text-slate-800 dark:text-slate-200" />
                <span className="font-mono text-xs font-bold text-slate-600 dark:text-slate-400">
                  MANIFEST-{assignedHub?.hubCode || 'HUB'}-{Date.now().toString().slice(-6)}
                </span>
              </div>

              <div className="text-left text-xs space-y-1.5 border-y border-slate-100 dark:border-slate-800 py-3">
                <p><strong>Producer:</strong> {user?.fullName}</p>
                <p><strong>Total Produce Weight:</strong> {upcomingBatch?.totalBatchKg || 0} kg</p>
                <p><strong>Crates:</strong> {upcomingBatch?.cratesRequired || 0} Standard Crates</p>
                <p><strong>Target Intake:</strong> {assignedHub?.hubName || 'Village Collection Hub'}</p>
              </div>

              <Button
                variant="primary"
                size="sm"
                onClick={() => {
                  window.print();
                  setIsManifestOpen(false);
                }}
                className="w-full bg-emerald-600"
                leftIcon={<Printer className="w-4 h-4" />}
              >
                Print Manifest Sheet
              </Button>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};
