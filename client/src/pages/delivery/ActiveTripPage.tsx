import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from '@/components/templates/DashboardLayout';
import { Button } from '@/components/atoms/Button';
import { Input } from '@/components/atoms/Input';
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
  MapPin,
  Phone,
  MessageSquare,
  QrCode,
  ShieldCheck,
  CheckCircle2,
  Navigation,
  Sparkles,
} from 'lucide-react';
import toast from 'react-hot-toast';

export const ActiveTripPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const { isDark, toggleTheme, language, setLanguage } = useThemeStore();
  const { t } = useTranslation();

  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(2); // 1: Pickup at DC, 2: En Route, 3: Arrived & Handover
  const [handoverOtp, setHandoverOtp] = useState('');
  const [isCodCollected, setIsCodCollected] = useState(false);
  const [podPhoto, setPodPhoto] = useState<File | null>(null);
  const [isCompleting, setIsCompleting] = useState(false);

  const navItems = [
    { id: 'hud', label: 'Delivery HUD', icon: <Compass className="w-5 h-5" />, path: '/delivery/dashboard' },
    { id: 'available', label: 'Available Radar Trips', icon: <Radar className="w-5 h-5" />, path: '/delivery/available' },
    { id: 'hub', label: 'Hub Intake Sheet', icon: <Calendar className="w-5 h-5" />, path: '/delivery/hub-schedule' },
    { id: 'vehicles', label: 'My Vehicles', icon: <Truck className="w-5 h-5" />, path: '/delivery/vehicles' },
    { id: 'earnings', label: 'Trip Earnings', icon: <DollarSign className="w-5 h-5" />, path: '/delivery/earnings' },
  ];

  const handleCompleteTrip = async () => {
    if (handoverOtp.length !== 4 && !podPhoto) {
      toast.error('Please enter customer 4-digit OTP or upload Proof of Delivery photo');
      return;
    }

    try {
      setIsCompleting(true);
      toast.loading('Verifying handover & releasing trip payout...', { id: 'pod' });
      await new Promise((resolve) => setTimeout(resolve, 1200));

      toast.success('Delivery Completed! LKR 1,250.00 credited to your Pola Wallet.', { id: 'pod' });
      navigate('/delivery/dashboard');
    } catch (err: any) {
      toast.error('Failed to complete delivery', { id: 'pod' });
    } finally {
      setIsCompleting(false);
    }
  };

  return (
    <DashboardLayout
      portalTitle={t.deliveryFleet}
      portalRole={user?.role || 'Delivery Partner'}
      navItems={navItems}
      activePath="/delivery/dashboard"
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
      <div className="space-y-6 max-w-4xl mx-auto">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 text-xs font-bold mb-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Active Doorstep Run In Progress
            </div>
            <h1 className="text-2xl font-black text-slate-900 dark:text-slate-100">
              Trip #TRIP-84920 — Doorstep Drop-off
            </h1>
            <p className="text-xs text-slate-400">
              Meegoda DC ──► Nugegoda, Colombo (7.2 km) • Payout: <strong>LKR 1,250.00</strong>
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.open('https://maps.google.com', '_blank')}
              leftIcon={<Navigation className="w-4 h-4 text-sky-500" />}
            >
              Open Google Maps
            </Button>
          </div>
        </div>

        {/* Live Step Progress */}
        <div className="grid grid-cols-3 gap-3 text-center">
          <div
            className={`p-3.5 rounded-2xl border text-xs font-bold transition-all ${
              currentStep === 1
                ? 'border-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-200'
                : 'border-slate-200 dark:border-slate-800 text-slate-400'
            }`}
          >
            1. Pickup at DC ✓
          </div>
          <div
            className={`p-3.5 rounded-2xl border text-xs font-bold transition-all ${
              currentStep === 2
                ? 'border-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-200'
                : 'border-slate-200 dark:border-slate-800 text-slate-400'
            }`}
          >
            2. En Route to Buyer
          </div>
          <div
            className={`p-3.5 rounded-2xl border text-xs font-bold transition-all ${
              currentStep === 3
                ? 'border-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-200'
                : 'border-slate-200 dark:border-slate-800 text-slate-400'
            }`}
          >
            3. Proof of Delivery (POD)
          </div>
        </div>

        {/* Customer Contact & Address Card */}
        <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-6">
          <div className="flex flex-wrap items-start justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
            <div>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                Customer Delivery Recipient
              </span>
              <h3 className="text-lg font-black text-slate-900 dark:text-slate-100 mt-0.5">
                Ruwan Perera (Household B2C)
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5 mt-1">
                <MapPin className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>No. 45/2, Chapel Lane, Nugegoda (Near Supermarket)</span>
              </p>
            </div>

            <div className="flex items-center gap-2">
              <a
                href="tel:+94771234567"
                className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-bold text-xs flex items-center gap-1.5 hover:bg-emerald-100 transition-colors"
              >
                <Phone className="w-4 h-4" />
                <span>Call Customer</span>
              </a>
            </div>
          </div>

          {/* Crate Packages Summary */}
          <div className="space-y-2">
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
              Assigned Packages (2 Crates • 35.0 kg):
            </span>
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 text-xs flex items-center justify-between">
              <span>CRATE-01: Nuwara Eliya Carrots (20 kg Grade A)</span>
              <Badge variant="emerald" size="sm">Scanned & Loaded</Badge>
            </div>
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 text-xs flex items-center justify-between">
              <span>CRATE-02: Leeks & Green Chillies (15 kg Grade A)</span>
              <Badge variant="emerald" size="sm">Scanned & Loaded</Badge>
            </div>
          </div>

          {/* Proof of Delivery / Handover Section */}
          <div className="p-6 rounded-3xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 space-y-4">
            <div className="flex items-center gap-2 font-extrabold text-sm text-slate-900 dark:text-slate-100">
              <ShieldCheck className="w-5 h-5 text-emerald-600" />
              <span>Proof of Delivery Verification</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Customer 4-Digit Delivery Code (from Buyer App)"
                placeholder="e.g. 7842"
                maxLength={4}
                value={handoverOtp}
                onChange={(e) => setHandoverOtp(e.target.value)}
              />

              <div className="flex items-center gap-3 p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 self-end">
                <input
                  type="checkbox"
                  id="codCheck"
                  checked={isCodCollected}
                  onChange={(e) => setIsCodCollected(e.target.checked)}
                  className="w-4 h-4 rounded text-emerald-600"
                />
                <label htmlFor="codCheck" className="text-xs font-bold text-slate-800 dark:text-slate-200 cursor-pointer">
                  COD Payment of LKR 8,450.00 Collected
                </label>
              </div>
            </div>

            <div>
              <FileDropzone
                label="Or Upload Doorstep Delivery Photo (Optional Fallback)"
                onFileSelect={setPodPhoto}
                accept="image/*"
              />
            </div>

            <Button
              variant="primary"
              size="lg"
              isLoading={isCompleting}
              onClick={handleCompleteTrip}
              className="w-full bg-emerald-600 hover:bg-emerald-700"
              rightIcon={<Sparkles className="w-5 h-5" />}
            >
              Complete Delivery & Unlock LKR 1,250 Payout
            </Button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};
