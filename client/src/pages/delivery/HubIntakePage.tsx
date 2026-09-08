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
import { getDeliveryNavItems } from '@/lib/navItems';
import { HubService } from '@/services/hub.service';
import {
  Truck,
  Scale,
  CheckCircle2,
  Package,
  Navigation,
  ArrowRight,
  Save,
} from 'lucide-react';
import toast from 'react-hot-toast';

type GradeEntry = {
  orderId: string;
  productId: string;
  farmerId: string;
  farmerName: string;
  productName: string;
  listedWeightKg: number;
  actualWeightKg: string;
  grade: string;
  notes: string;
  isVerified: boolean;
  isSaved?: boolean;
};

export const HubIntakePage: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const { isDark, toggleTheme, language, setLanguage } = useThemeStore();
  const { t } = useTranslation();

  const [needsAssignment, setNeedsAssignment] = useState(false);
  const [schedule, setSchedule] = useState<any>(null);
  const [entries, setEntries] = useState<GradeEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [savingRowKey, setSavingRowKey] = useState<string | null>(null);
  const [isAcceptingRun, setIsAcceptingRun] = useState(false);
  const [isDeparting, setIsDeparting] = useState(false);
  const [isConfirmingArrival, setIsConfirmingArrival] = useState(false);
  const [runStage, setRunStage] = useState<'pending_accept' | 'intake' | 'in_transit' | 'arrived'>('intake');

  const navItems = getDeliveryNavItems(t as any);

  useEffect(() => {
    fetchTodaySchedule();
  }, []);

  const fetchTodaySchedule = async () => {
    try {
      setIsLoading(true);
      const res: any = await HubService.getMySchedule();
      if (res.success && res.data) {
        if (res.data.needsAssignment) {
          setNeedsAssignment(true);
          return;
        }
        setNeedsAssignment(false);
        const sched = res.data.schedules?.[0] || null;
        setSchedule(sched);

        const rawEntries: GradeEntry[] = (res.data.pendingOrders || []).flatMap((order: any) =>
          (order.items || []).map((item: any) => ({
            orderId: order._id,
            productId: item.productId,
            farmerId: item.farmerId?._id || item.farmerId,
            farmerName: item.farmerId?.fullName || item.farmerName || 'Registered Farmer',
            productName: item.productName,
            listedWeightKg: item.quantityOrdered || 0,
            actualWeightKg: String(item.quantityCollected || item.quantityOrdered || ''),
            grade: item.inspectedGrade || 'A',
            notes: '',
            isVerified: !!item.quantityCollected,
            isSaved: !!item.quantityCollected,
          }))
        );
        setEntries(rawEntries);

        // Check overall orders stage
        const orders = res.data.pendingOrders || [];
        if (orders.length > 0) {
          const hasAssignedDriver = orders.some((o: any) => o.leg1DriverId);
          const allDeparted = orders.every((o: any) => o.status === 'in_transit_to_dc');
          const allArrived = orders.every((o: any) => o.status === 'received_at_dc');

          if (allArrived) {
            setRunStage('arrived');
          } else if (allDeparted) {
            setRunStage('in_transit');
          } else if (hasAssignedDriver) {
            setRunStage('intake');
          } else {
            setRunStage('pending_accept');
          }
        }
      }
    } catch {
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

  const handleAcceptRun = async () => {
    if (!schedule?.hubId) {
      toast.error('No hub assigned for today');
      return;
    }
    try {
      setIsAcceptingRun(true);
      const res: any = await HubService.acceptHubRun(schedule.hubId);
      if (res.success) {
        toast.success(res.message || 'Leg-1 run accepted! You can now grade hub produce.');
        setRunStage('intake');
        await fetchTodaySchedule();
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || err.message || 'Failed to accept run');
    } finally {
      setIsAcceptingRun(false);
    }
  };

  const handleSaveRow = async (entry: GradeEntry, index: number) => {
    const rowKey = `${entry.orderId}-${entry.productId}`;
    setSavingRowKey(rowKey);
    try {
      await HubService.submitIntakeGrading({
        orderId: entry.orderId,
        productId: entry.productId,
        confirmedQuantity: parseFloat(entry.actualWeightKg) || entry.listedWeightKg,
        assignedGrade: entry.grade,
        criteriaNotes: entry.notes,
      });
      const updated = [...entries];
      updated[index].isVerified = true;
      updated[index].isSaved = true;
      setEntries(updated);
      toast.success(`Verified & saved: ${entry.productName}`);
    } catch (err: any) {
      toast.error(err.response?.data?.message || err.message || 'Failed to save entry');
    } finally {
      setSavingRowKey(null);
    }
  };

  const handleDepartForDc = async () => {
    if (!schedule?.hubId) return;
    const unsaved = entries.filter((e) => !e.isSaved);
    if (unsaved.length > 0) {
      toast.error(`Please save all ${unsaved.length} item(s) before departing`);
      return;
    }
    try {
      setIsDeparting(true);
      await HubService.departForDc(schedule.hubId);
      toast.success('Run departed! Cargo is now in transit to Distribution Center.');
      setRunStage('in_transit');
      await fetchTodaySchedule();
    } catch (err: any) {
      toast.error(err.response?.data?.message || err.message || 'Failed to depart');
    } finally {
      setIsDeparting(false);
    }
  };

  const handleConfirmArrival = async () => {
    if (!schedule?.hubId) return;
    try {
      setIsConfirmingArrival(true);
      await HubService.confirmDcArrival(schedule.hubId);
      toast.success('Cargo arrived and confirmed at Distribution Center!');
      setRunStage('arrived');
      await fetchTodaySchedule();
    } catch (err: any) {
      toast.error(err.response?.data?.message || err.message || 'Failed to confirm arrival');
    } finally {
      setIsConfirmingArrival(false);
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
        {needsAssignment ? (
          <EmptyState
            icon={<Truck className="w-8 h-8 text-slate-400" />}
            title="No Hub Assignment"
            description="You have not been assigned to a hub yet. Contact your Operations Admin to assign your leg-1 hub."
          />
        ) : (
          <>
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl font-black text-slate-900 dark:text-slate-100">
                  {t.hubIntakeSheet}
                </h1>
                <p className="text-xs text-slate-400">
                  Leg-1 Village Hub Intake • Log verified scale weights and assign Grade A/B/C/Reject
                </p>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                {runStage === 'pending_accept' && (
                  <Button
                    variant="primary"
                    size="md"
                    onClick={handleAcceptRun}
                    isLoading={isAcceptingRun}
                    className="bg-amber-600 hover:bg-amber-700"
                    leftIcon={<Truck className="w-4 h-4" />}
                  >
                    Accept Leg-1 Hub Run
                  </Button>
                )}

                {runStage === 'intake' && (
                  <Button
                    variant="primary"
                    size="md"
                    onClick={handleDepartForDc}
                    isLoading={isDeparting}
                    className="bg-emerald-600 hover:bg-emerald-700"
                    leftIcon={<Navigation className="w-4 h-4" />}
                  >
                    Depart for DC
                  </Button>
                )}

                {runStage === 'in_transit' && (
                  <Button
                    variant="primary"
                    size="md"
                    onClick={handleConfirmArrival}
                    isLoading={isConfirmingArrival}
                    className="bg-sky-600 hover:bg-sky-700"
                    leftIcon={<CheckCircle2 className="w-4 h-4" />}
                  >
                    Confirm DC Arrival
                  </Button>
                )}

                {runStage === 'arrived' && (
                  <Badge variant="emerald" size="md">
                    Arrival Confirmed at DC
                  </Badge>
                )}
              </div>
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
                    {schedule.pickupWindow} • Vehicle: {schedule.vehiclePlate || 'Assigned Transport'}
                  </p>
                </div>
              </div>

              <Badge
                variant={
                  runStage === 'arrived'
                    ? 'emerald'
                    : runStage === 'in_transit'
                    ? 'sky'
                    : runStage === 'intake'
                    ? 'emerald'
                    : 'amber'
                }
                size="md"
              >
                {runStage === 'arrived'
                  ? 'Delivered to DC'
                  : runStage === 'in_transit'
                  ? 'En Route to DC'
                  : runStage === 'intake'
                  ? 'Intake Active'
                  : 'Awaiting Run Acceptance'}
              </Badge>
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
            {entries.map((entry, idx) => {
              const rowKey = `${entry.orderId}-${entry.productId}`;
              const isSaving = savingRowKey === rowKey;

              return (
                <div
                  key={rowKey}
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

                    <div className="flex items-center gap-2">
                      <Badge variant={entry.isSaved ? 'emerald' : 'amber'} size="sm">
                        {entry.isSaved ? 'Verified & Saved' : 'Pending Weighing'}
                      </Badge>
                      <Button
                        variant="primary"
                        size="sm"
                        isLoading={isSaving}
                        onClick={() => handleSaveRow(entry, idx)}
                        className={entry.isSaved ? 'bg-slate-700 hover:bg-slate-800' : 'bg-emerald-600 hover:bg-emerald-700'}
                        leftIcon={<Save className="w-3.5 h-3.5" />}
                      >
                        {entry.isSaved ? 'Update' : 'Save'}
                      </Button>
                    </div>
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
              );
            })}
          </div>
        )}
          </>
        )}
      </div>
    </DashboardLayout>
  );
};
