import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from '@/components/templates/DashboardLayout';
import { Button } from '@/components/atoms/Button';
import { Badge } from '@/components/atoms/Badge';
import { useAuthStore } from '@/store/authStore';
import { useThemeStore } from '@/store/themeStore';
import { useTranslation } from '@/lib/i18n';
import {
  LayoutDashboard,
  Sprout,
  Package,
  Wallet,
  ShoppingBag,
  MapPin,
  Clock,
  QrCode,
  CheckCircle2,
  AlertTriangle,
  FileCheck,
  Truck,
  Printer,
  X,
} from 'lucide-react';
import toast from 'react-hot-toast';

export const HubDropoffPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const { isDark, toggleTheme, language, setLanguage } = useThemeStore();
  const { t } = useTranslation();

  const [isManifestOpen, setIsManifestOpen] = useState(false);

  const navItems = [
    { id: 'dashboard', label: t.dashboard, icon: <LayoutDashboard className="w-5 h-5" />, path: '/farmer/dashboard' },
    { id: 'farms', label: t.myFarms, icon: <Sprout className="w-5 h-5" />, path: '/farmer/farms' },
    { id: 'products', label: t.cropListings, icon: <Package className="w-5 h-5" />, path: '/farmer/products' },
    { id: 'orders', label: t.farmOrders, icon: <ShoppingBag className="w-5 h-5" />, path: '/farmer/orders' },
    { id: 'hubs', label: t.hubDropoffs, icon: <MapPin className="w-5 h-5" />, path: '/farmer/hubs' },
    { id: 'wallet', label: t.earningsWallet, icon: <Wallet className="w-5 h-5" />, path: '/wallet' },
  ];

  const pastReceipts = [
    {
      id: 'REC-9012',
      date: 'Yesterday, 07:15 AM',
      hubName: 'Keppetipola Hub #2',
      crop: 'Nuwara Eliya Carrot (Kuroda)',
      listedWeight: 120,
      scaleWeight: 118.5,
      grade: 'Grade A',
      multiplier: '100%',
      graderNotes: 'Excellent freshness, uniform size, no bruising.',
    },
    {
      id: 'REC-8840',
      date: '24 Aug 2026',
      hubName: 'Keppetipola Hub #2',
      crop: 'Leeks (Bonanza)',
      listedWeight: 50,
      scaleWeight: 49.0,
      grade: 'Grade B',
      multiplier: '90%',
      graderNotes: 'Minor wilting on outer leaves. Graded Standard.',
    },
  ];

  return (
    <DashboardLayout
      portalTitle={t.farmerOpsCenter}
      portalRole={user?.role || 'Farmer'}
      navItems={navItems}
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
      <div className="space-y-8">
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
                  Keppetipola Village Collection Hub #2
                </h3>
                <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                  <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                  Keppetipola Agrarian Services Center, Welimada Rd
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
                  Tue & Fri: 06:00 AM – 09:30 AM
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Truck className="w-4 h-4 text-slate-400" />
              <div>
                <span className="text-slate-400 block text-[11px]">Leg-1 Transport Route</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">
                  Hub → Dambulla DC
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <FileCheck className="w-4 h-4 text-slate-400" />
              <div>
                <span className="text-slate-400 block text-[11px]">Next Intake Session</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400">
                  Tomorrow at 06:00 AM
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Prepare Drop-off Section */}
        <div className="p-6 rounded-3xl bg-slate-900 text-white space-y-4 shadow-md">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="space-y-1">
              <h3 className="text-base font-bold">Prepare for Tomorrow’s Drop-off Batch</h3>
              <p className="text-xs text-slate-400">
                Aggregated crops ready for transport loading based on active customer orders
              </p>
            </div>

            <Button
              variant="primary"
              size="sm"
              onClick={() => setIsManifestOpen(true)}
              className="bg-emerald-500 hover:bg-emerald-600"
              leftIcon={<QrCode className="w-4 h-4" />}
            >
              Generate Batch Manifest QR
            </Button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
            <div className="p-3.5 rounded-2xl bg-slate-800/80 border border-slate-700">
              <span className="text-slate-400 text-xs block">Carrots (Kuroda)</span>
              <span className="text-base font-black text-emerald-400">120 kg</span>
            </div>
            <div className="p-3.5 rounded-2xl bg-slate-800/80 border border-slate-700">
              <span className="text-slate-400 text-xs block">Leeks (Bonanza)</span>
              <span className="text-base font-black text-emerald-400">45 kg</span>
            </div>
            <div className="p-3.5 rounded-2xl bg-slate-800/80 border border-slate-700">
              <span className="text-slate-400 text-xs block">Crates Required</span>
              <span className="text-base font-black text-slate-200">8 Standard Crates</span>
            </div>
            <div className="p-3.5 rounded-2xl bg-slate-800/80 border border-slate-700">
              <span className="text-slate-400 text-xs block">Total Batch Value</span>
              <span className="text-base font-black text-amber-400">LKR 46,200.00</span>
            </div>
          </div>
        </div>

        {/* Past Intake Receipts & Quality Reports */}
        <div className="space-y-4">
          <h3 className="text-base font-extrabold text-slate-900 dark:text-slate-100">
            Hub Quality Inspection Receipts
          </h3>

          <div className="space-y-3">
            {pastReceipts.map((receipt) => (
              <div
                key={receipt.id}
                className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-3"
              >
                <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-3">
                    <span className="font-mono font-bold text-xs text-slate-900 dark:text-slate-100">
                      {receipt.id}
                    </span>
                    <span className="text-xs text-slate-400">{receipt.date}</span>
                    <span className="text-xs text-slate-500">• {receipt.crop}</span>
                  </div>

                  <Badge variant={receipt.grade === 'Grade A' ? 'emerald' : 'amber'} size="sm">
                    {receipt.grade} ({receipt.multiplier})
                  </Badge>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div>
                    <span className="text-slate-400 block text-[11px]">Weight Verification</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">
                      Listed: {receipt.listedWeight} kg → Scale: {receipt.scaleWeight} kg
                    </span>
                  </div>

                  <div className="sm:col-span-2">
                    <span className="text-slate-400 block text-[11px]">Grader Criteria Notes</span>
                    <span className="text-slate-600 dark:text-slate-300">
                      {receipt.graderNotes}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
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
                  MANIFEST-KEP-20260829-01
                </span>
              </div>

              <div className="text-left text-xs space-y-1.5 border-y border-slate-100 dark:border-slate-800 py-3">
                <p><strong>Producer:</strong> {user?.fullName}</p>
                <p><strong>Total Produce Weight:</strong> 165.0 kg</p>
                <p><strong>Target Intake:</strong> Keppetipola Hub #2 (06:00 AM)</p>
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
