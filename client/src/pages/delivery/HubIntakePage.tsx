import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from '@/components/templates/DashboardLayout';
import { Input } from '@/components/atoms/Input';
import { Select } from '@/components/atoms/Select';
import { Button } from '@/components/atoms/Button';
import { Badge } from '@/components/atoms/Badge';
import { Spinner } from '@/components/atoms/Spinner';
import { EmptyState } from '@/components/molecules/EmptyState';
import { useAuthStore } from '@/store/authStore';
import { useThemeStore } from '@/store/themeStore';
import { useTranslation } from '@/lib/i18n';
import { api } from '@/services/api';
import {
  Compass,
  Radar,
  Calendar,
  Truck,
  DollarSign,
  Scale,
  FileCheck,
  Package,
} from 'lucide-react';
import toast from 'react-hot-toast';

type GradeEntry = {
  orderId: string;
  farmerId: string;
  farmerName: string;
  productName: string;
  listedWeightKg: number;
  actualWeightKg: string;
  grade: string;
  notes: string;
  isVerified: boolean;
};

export const HubIntakePage: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const { isDark, toggleTheme, language, setLanguage } = useThemeStore();
  const { t } = useTranslation();

  const [schedule, setSchedule] = useState<any>(null);
  const [entries, setEntries] = useState<GradeEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const navItems = [
    { id: 'hud', label: 'Delivery HUD', icon: <Compass className="w-5 h-5" />, path: '/delivery/dashboard' },
    { id: 'available', label: 'Available Radar Trips', icon: <Radar className="w-5 h-5" />, path: '/delivery/available' },
    { id: 'hub', label: 'Hub Intake Sheet', icon: <Calendar className="w-5 h-5" />, path: '/delivery/hub-schedule' },
    { id: 'vehicles', label: 'My Vehicles', icon: <Truck className="w-5 h-5" />, path: '/delivery/vehicles' },
    { id: 'earnings', label: 'Trip Earnings', icon: <DollarSign className="w-5 h-5" />, path: '/delivery/earnings' },
  ];

  useEffect(() => {
    fetchTodaySchedule();
  }, []);

  const fetchTodaySchedule = async () => {
    try {
      setIsLoading(true);
      // Fetch pending orders at hub assigned to this driver/hub
      const res: any = await api.get('/delivery/hub-schedule');
      if (res.success && res.data) {
        setSchedule(res.data.schedule || null);
        // Build grading entry list from pending hub orders
        const rawEntries: GradeEntry[] = (res.data.pendingOrders || []).flatMap((order: any) =>
          (order.items || []).map((item: any) => ({
            orderId: order._id,
            farmerId: item.farmerId,
            farmerName: item.farmerName || 'Unknown',
            productName: item.productName,
            listedWeightKg: item.quantityOrdered || 0,
            actualWeightKg: String(item.quantityOrdered || ''),
            grade: 'A',
            notes: '',
            isVerified: false,
          }))
        );
        setEntries(rawEntries);
      }
    } catch (err: any) {
      // If endpoint doesn't exist yet, show empty state gracefully
      setEntries([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateEntry = (index: number, field: keyof GradeEntry, value: any) => {
    const updated = [...entries];
    (updated[index] as any)[field] = value;
    setEntries(updated);
  };

  const handleLockManifest = async () => {
    const unverifiedCount = entries.filter((e) => !e.actualWeightKg || !e.grade).length;
    if (unverifiedCount > 0) {
      toast.error(`${unverifiedCount} item(s) still need actual weight and grade before locking`);
      return;
    }

    try {
      setIsSubmitting(true);
      // Build grading payload for POST /hubs/intake-grading
      const gradingPayload = {
        hubId: schedule?.hubId,
        intakeDate: new Date().toISOString(),
        entries: entries.map((e) => ({
          orderId: e.orderId,
          farmerId: e.farmerId,
          productName: e.productName,
          listedWeightKg: e.listedWeightKg,
          actualWeightKg: parseFloat(e.actualWeightKg) || e.listedWeightKg,
          grade: e.grade,
          notes: e.notes,
        })),
      };

      await api.post('/hubs/intake-grading', gradingPayload);
      toast.success('Hub Manifest signed and locked! All orders moved to "In Transit to DC".');
      navigate('/delivery/dashboard');
    } catch (err: any) {
      toast.error(err.message || 'Failed to submit hub intake grading');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <DashboardLayout
      portalTitle={t.deliveryFleet}
      portalRole={user?.role || 'Delivery Partner'}
      navItems={navItems}
      activePath="/delivery/hub-schedule"
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
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-slate-900 dark:text-slate-100">
              {t.hubIntakeSheet}
            </h1>
            <p className="text-xs text-slate-400">
              Leg-1 Village Hub Intake • Log verified scale weights and assign Grade A/B/C/Reject
            </p>
          </div>

          <Button
            variant="primary"
            size="md"
            onClick={handleLockManifest}
            isLoading={isSubmitting}
            disabled={entries.length === 0}
            className="bg-emerald-600 hover:bg-emerald-700"
            leftIcon={<FileCheck className="w-4 h-4" />}
          >
            {t.signLockManifest}
          </Button>
        </div>

        {/* Scheduled Transport Run Banner */}
        {schedule && (
          <div className="p-6 rounded-3xl bg-slate-900 text-white space-y-4 shadow-md">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-2xl bg-amber-500 text-slate-950 font-black text-xs">
                  LEG-1
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-slate-100">
                    {schedule.hubName} ──► {schedule.dcName}
                  </h3>
                  <p className="text-xs text-slate-400">
                    {schedule.pickupWindow} • Vehicle: {schedule.vehiclePlate}
                  </p>
                </div>
              </div>
              <Badge variant="emerald" size="md">Intake Active</Badge>
            </div>
          </div>
        )}

        {isLoading ? (
          <div className="flex justify-center py-16">
            <Spinner size="md" />
          </div>
        ) : entries.length === 0 ? (
          <EmptyState
            title="No pending intake entries"
            description="No farmers have dropped produce at this hub for today's run yet"
            icon={<Package className="w-8 h-8" />}
          />
        ) : (
          <div className="space-y-4">
            {entries.map((entry, idx) => (
              <div
                key={`${entry.orderId}-${idx}`}
                className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4"
              >
                <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
                  <div>
                    <h4 className="font-extrabold text-slate-900 dark:text-slate-100 text-sm">
                      {entry.farmerName}
                    </h4>
                    <p className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold mt-0.5">
                      {entry.productName}
                    </p>
                  </div>
                  <Badge variant={entry.isVerified ? 'emerald' : 'amber'} size="sm">
                    {entry.isVerified ? 'Verified' : 'Pending Weighing'}
                  </Badge>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <Input
                    label={`Scale Weight (Listed: ${entry.listedWeightKg} kg)`}
                    type="number"
                    value={entry.actualWeightKg}
                    onChange={(e) => {
                      handleUpdateEntry(idx, 'actualWeightKg', e.target.value);
                      handleUpdateEntry(idx, 'isVerified', !!e.target.value);
                    }}
                  />

                  <Select
                    label="Assigned Quality Grade"
                    value={entry.grade}
                    onChange={(e) => handleUpdateEntry(idx, 'grade', e.target.value)}
                    options={[
                      { value: 'A', label: 'Grade A — Premium (100% Payout)' },
                      { value: 'B', label: 'Grade B — Standard (90% Payout)' },
                      { value: 'C', label: 'Grade C — Below Standard (75% Payout)' },
                      { value: 'rejected', label: 'Rejected — Spoilage / Damage (0% Payout)' },
                    ]}
                  />

                  <Input
                    label="Inspection Notes"
                    value={entry.notes}
                    onChange={(e) => handleUpdateEntry(idx, 'notes', e.target.value)}
                    placeholder="Optional observations..."
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};
