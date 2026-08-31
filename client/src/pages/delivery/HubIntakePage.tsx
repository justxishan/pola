import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from '@/components/templates/DashboardLayout';
import { Input } from '@/components/atoms/Input';
import { Select } from '@/components/atoms/Select';
import { Button } from '@/components/atoms/Button';
import { Badge } from '@/components/atoms/Badge';
import { FileDropzone } from '@/components/molecules/FileDropzone';
import { useAuthStore } from '@/store/authStore';
import { useThemeStore } from '@/store/themeStore';
import { useTranslation } from '@/lib/i18n';
import {
  Compass,
  Radar,
  Calendar,
  Truck,
  DollarSign,
  Clock,
  Scale,
  Camera,
  CheckCircle2,
  AlertTriangle,
  FileCheck,
} from 'lucide-react';
import toast from 'react-hot-toast';

export const HubIntakePage: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const { isDark, toggleTheme, language, setLanguage } = useThemeStore();
  const { t } = useTranslation();

  const [farmerEntries, setFarmerEntries] = useState([
    {
      id: 'FARM-01',
      farmerName: 'K.M. Bandara',
      crop: 'Nuwara Eliya Carrot (Kuroda)',
      listedWeight: 120,
      scaleWeight: '118.5',
      grade: 'Grade A',
      notes: 'Crisp, washed, uniform size',
      isVerified: true,
    },
    {
      id: 'FARM-02',
      farmerName: 'S.P. Jayawardena',
      crop: 'Leeks (Bonanza)',
      listedWeight: 45,
      scaleWeight: '45.0',
      grade: 'Grade A',
      notes: 'Clean root bundle',
      isVerified: false,
    },
    {
      id: 'FARM-03',
      farmerName: 'W.M. Dissanayake',
      crop: 'Green Chillies (MICH 1)',
      listedWeight: 25,
      scaleWeight: '24.2',
      grade: 'Grade B',
      notes: 'Minor color variation',
      isVerified: false,
    },
  ]);

  const navItems = [
    { id: 'hud', label: 'Delivery HUD', icon: <Compass className="w-5 h-5" />, path: '/delivery/dashboard' },
    { id: 'available', label: 'Available Radar Trips', icon: <Radar className="w-5 h-5" />, path: '/delivery/available' },
    { id: 'hub', label: 'Hub Intake Sheet', icon: <Calendar className="w-5 h-5" />, path: '/delivery/hub-schedule' },
    { id: 'vehicles', label: 'My Vehicles', icon: <Truck className="w-5 h-5" />, path: '/delivery/vehicles' },
    { id: 'earnings', label: 'Trip Earnings', icon: <DollarSign className="w-5 h-5" />, path: '/delivery/earnings' },
  ];

  const handleUpdateEntry = (index: number, field: string, value: any) => {
    const updated = [...farmerEntries];
    (updated[index] as any)[field] = value;
    setFarmerEntries(updated);
  };

  const handleLockManifest = () => {
    toast.success('Hub Manifest signed and locked! All orders moved to "In Transit to DC".');
    navigate('/delivery/dashboard');
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
            className="bg-emerald-600 hover:bg-emerald-700"
            leftIcon={<FileCheck className="w-4 h-4" />}
          >
            {t.signLockManifest}
          </Button>
        </div>

        {/* Scheduled Transport Run Banner */}
        <div className="p-6 rounded-3xl bg-slate-900 text-white space-y-4 shadow-md">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-amber-500 text-slate-950 font-black">
                LEG-1
              </div>
              <div>
                <h3 className="font-extrabold text-base text-slate-100">
                  Keppetipola Village Hub ──► Dambulla Distribution Center
                </h3>
                <p className="text-xs text-slate-400">
                  Tuesday Pickup Window: 06:00 AM – 09:00 AM • Vehicle: WP CAB-1234 (Mini-Truck)
                </p>
              </div>
            </div>

            <Badge variant="emerald" size="md">
              Intake Active
            </Badge>
          </div>
        </div>

        {/* Farmer Drop-off Intake Checklist */}
        <div className="space-y-4">
          {farmerEntries.map((entry, idx) => (
            <div
              key={entry.id}
              className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4"
            >
              <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
                <div>
                  <h4 className="font-extrabold text-slate-900 dark:text-slate-100 text-sm">
                    {entry.farmerName}
                  </h4>
                  <p className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold mt-0.5">
                    {entry.crop}
                  </p>
                </div>

                <Badge variant={entry.isVerified ? 'emerald' : 'amber'} size="sm">
                  {entry.isVerified ? 'Verified' : 'Pending Weighing'}
                </Badge>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Input
                  label={`Scale Weight (Listed: ${entry.listedWeight} kg)`}
                  type="number"
                  value={entry.scaleWeight}
                  onChange={(e) => handleUpdateEntry(idx, 'scaleWeight', e.target.value)}
                />

                <Select
                  label="Assigned Quality Grade"
                  value={entry.grade}
                  onChange={(e) => handleUpdateEntry(idx, 'grade', e.target.value)}
                  options={[
                    { value: 'Grade A', label: 'Grade A — Premium (100% Payout)' },
                    { value: 'Grade B', label: 'Grade B — Standard (90% Payout)' },
                    { value: 'Grade C', label: 'Grade C — Below Standard (75% Payout)' },
                    { value: 'Rejected', label: 'Rejected — Spoilage / Damage (0% Payout)' },
                  ]}
                />

                <Input
                  label="Inspection Notes / Observations"
                  value={entry.notes}
                  onChange={(e) => handleUpdateEntry(idx, 'notes', e.target.value)}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
};
