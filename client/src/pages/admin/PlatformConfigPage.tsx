import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/templates/DashboardLayout';
import { Spinner } from '@/components/atoms/Spinner';
import { AdminService } from '@/services/admin.service';
import { useAuthStore } from '@/store/authStore';
import { useThemeStore } from '@/store/themeStore';
import { getAdminNavItems } from '@/lib/navItems';
import { Settings, Save, RotateCcw, Percent, Truck, TrendingUp } from 'lucide-react';
import toast from 'react-hot-toast';

interface PlatformConfig {
  platformCommissionPercent: number;
  collectorCommissionPercent: number;
  deliveryBaseFeeLkr: number;
  deliveryPerKmLkr: number;
  deliveryPerKgLkr: number;
}

const DEFAULT_CONFIG: PlatformConfig = {
  platformCommissionPercent: 5,
  collectorCommissionPercent: 3,
  deliveryBaseFeeLkr: 150,
  deliveryPerKmLkr: 25,
  deliveryPerKgLkr: 10,
};

export const PlatformConfigPage: React.FC = () => {
  const { user, logout } = useAuthStore();
  const { isDark, toggleTheme, language, setLanguage } = useThemeStore();
  const navItems = getAdminNavItems();

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState<PlatformConfig>(DEFAULT_CONFIG);
  const [draft, setDraft] = useState<PlatformConfig>(DEFAULT_CONFIG);
  const isDirty = JSON.stringify(saved) !== JSON.stringify(draft);

  useEffect(() => {
    fetchConfig();
  }, []);

  const fetchConfig = async () => {
    try {
      setIsLoading(true);
      const res: any = await AdminService.getPlatformConfig();
      if (res.success && res.data?.config) {
        const c = res.data.config as PlatformConfig;
        setSaved(c);
        setDraft(c);
      }
    } catch {
      toast.error('Failed to load platform configuration');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await AdminService.updatePlatformConfig(draft);
      setSaved(draft);
      toast.success('Platform configuration saved');
    } catch (err: any) {
      toast.error(err?.message || 'Failed to save configuration');
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = () => {
    setDraft(saved);
  };

  const set = (field: keyof PlatformConfig, raw: string) => {
    const val = parseFloat(raw);
    if (!isNaN(val) && val >= 0) {
      setDraft((prev) => ({ ...prev, [field]: val }));
    }
  };

  const inputClass = (isDark: boolean) =>
    `w-full px-3 py-2 rounded-lg border text-sm font-mono ${
      isDark
        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-green-500'
        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400 focus:border-green-600'
    } focus:outline-none focus:ring-1 focus:ring-green-500 transition`;

  const labelClass = (isDark: boolean) =>
    `block text-xs font-medium mb-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`;

  const cardClass = (isDark: boolean) =>
    `rounded-xl p-5 border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} shadow-sm`;

  if (isLoading) {
    return (
      <DashboardLayout
        portalType="admin"
        navItems={navItems}
        user={user}
        isDark={isDark}
        toggleTheme={toggleTheme}
        language={language}
        setLanguage={setLanguage}
        onLogout={logout}
      >
        <div className="flex items-center justify-center h-64">
          <Spinner />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout
      portalType="admin"
      navItems={navItems}
      user={user}
      isDark={isDark}
      toggleTheme={toggleTheme}
      language={language}
      setLanguage={setLanguage}
      onLogout={logout}
    >
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900/30">
              <Settings className="w-5 h-5 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <h1 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Platform Configuration
              </h1>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                Live fee rates — changes apply immediately to new orders
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isDirty && (
              <button
                onClick={handleReset}
                className={`flex items-center gap-1.5 px-3 py-2 text-sm rounded-lg border transition ${
                  isDark
                    ? 'border-gray-600 text-gray-300 hover:bg-gray-700'
                    : 'border-gray-300 text-gray-600 hover:bg-gray-50'
                }`}
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Reset
              </button>
            )}
            <button
              onClick={handleSave}
              disabled={!isDirty || isSaving}
              className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-lg bg-green-600 text-white hover:bg-green-700 disabled:opacity-40 disabled:cursor-not-allowed transition"
            >
              {isSaving ? <Spinner /> : <Save className="w-3.5 h-3.5" />}
              {isSaving ? 'Saving…' : 'Save Changes'}
            </button>
          </div>
        </div>

        {/* Commission Rates */}
        <div className={cardClass(isDark)}>
          <div className="flex items-center gap-2 mb-4">
            <Percent className="w-4 h-4 text-green-500" />
            <h2 className={`text-sm font-semibold ${isDark ? 'text-white' : 'text-gray-800'}`}>
              Commission Rates
            </h2>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass(isDark)}>
                Platform Commission (%)
              </label>
              <div className="relative">
                <input
                  type="number"
                  min={0}
                  max={100}
                  step={0.1}
                  value={draft.platformCommissionPercent}
                  onChange={(e) => set('platformCommissionPercent', e.target.value)}
                  className={inputClass(isDark)}
                />
                <span className={`absolute right-3 top-1/2 -translate-y-1/2 text-xs ${isDark ? 'text-gray-400' : 'text-gray-400'}`}>
                  %
                </span>
              </div>
              <p className={`mt-1 text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                Pola's cut of each sale
              </p>
            </div>
            <div>
              <label className={labelClass(isDark)}>
                Collector Commission (%)
              </label>
              <div className="relative">
                <input
                  type="number"
                  min={0}
                  max={100}
                  step={0.1}
                  value={draft.collectorCommissionPercent}
                  onChange={(e) => set('collectorCommissionPercent', e.target.value)}
                  className={inputClass(isDark)}
                />
                <span className={`absolute right-3 top-1/2 -translate-y-1/2 text-xs ${isDark ? 'text-gray-400' : 'text-gray-400'}`}>
                  %
                </span>
              </div>
              <p className={`mt-1 text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                Village collector's share
              </p>
            </div>
          </div>
        </div>

        {/* Delivery Fee Components */}
        <div className={cardClass(isDark)}>
          <div className="flex items-center gap-2 mb-4">
            <Truck className="w-4 h-4 text-green-500" />
            <h2 className={`text-sm font-semibold ${isDark ? 'text-white' : 'text-gray-800'}`}>
              Delivery Fee Components
            </h2>
          </div>
          <p className={`text-xs mb-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
            Total delivery fee = Base + (Distance km × Per-km rate) + (Weight kg × Per-kg rate)
          </p>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className={labelClass(isDark)}>
                Base Fee (LKR)
              </label>
              <div className="relative">
                <input
                  type="number"
                  min={0}
                  step={1}
                  value={draft.deliveryBaseFeeLkr}
                  onChange={(e) => set('deliveryBaseFeeLkr', e.target.value)}
                  className={inputClass(isDark)}
                />
              </div>
              <p className={`mt-1 text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                Flat fee per trip
              </p>
            </div>
            <div>
              <label className={labelClass(isDark)}>
                Per km (LKR)
              </label>
              <div className="relative">
                <input
                  type="number"
                  min={0}
                  step={1}
                  value={draft.deliveryPerKmLkr}
                  onChange={(e) => set('deliveryPerKmLkr', e.target.value)}
                  className={inputClass(isDark)}
                />
              </div>
              <p className={`mt-1 text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                Distance component
              </p>
            </div>
            <div>
              <label className={labelClass(isDark)}>
                Per kg (LKR)
              </label>
              <div className="relative">
                <input
                  type="number"
                  min={0}
                  step={0.5}
                  value={draft.deliveryPerKgLkr}
                  onChange={(e) => set('deliveryPerKgLkr', e.target.value)}
                  className={inputClass(isDark)}
                />
              </div>
              <p className={`mt-1 text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                Weight component
              </p>
            </div>
          </div>
        </div>

        {/* Live Preview */}
        <div className={cardClass(isDark)}>
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-4 h-4 text-green-500" />
            <h2 className={`text-sm font-semibold ${isDark ? 'text-white' : 'text-gray-800'}`}>
              Example Order Preview
            </h2>
          </div>
          <p className={`text-xs mb-3 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
            A 10 km, 5 kg delivery on a LKR 2,000 order
          </p>
          {(() => {
            const orderValue = 2000;
            const distKm = 10;
            const weightKg = 5;
            const platformFee = (draft.platformCommissionPercent / 100) * orderValue;
            const collectorFee = (draft.collectorCommissionPercent / 100) * orderValue;
            const deliveryFee =
              draft.deliveryBaseFeeLkr +
              distKm * draft.deliveryPerKmLkr +
              weightKg * draft.deliveryPerKgLkr;
            const farmerPayout = orderValue - platformFee - collectorFee;

            const row = (label: string, value: string, highlight?: boolean) => (
              <div
                key={label}
                className={`flex justify-between items-center py-1.5 text-sm ${
                  highlight ? 'font-semibold' : ''
                } ${isDark ? 'text-gray-300' : 'text-gray-700'}`}
              >
                <span className={isDark ? 'text-gray-400' : 'text-gray-500'}>{label}</span>
                <span>{value}</span>
              </div>
            );

            return (
              <div className={`rounded-lg p-3 divide-y ${isDark ? 'bg-gray-700/50 divide-gray-600' : 'bg-gray-50 divide-gray-200'}`}>
                {row('Order value', `LKR ${orderValue.toFixed(2)}`)}
                {row(`Platform fee (${draft.platformCommissionPercent}%)`, `− LKR ${platformFee.toFixed(2)}`)}
                {row(`Collector fee (${draft.collectorCommissionPercent}%)`, `− LKR ${collectorFee.toFixed(2)}`)}
                {row('Farmer payout', `LKR ${farmerPayout.toFixed(2)}`, true)}
                {row(`Delivery fee (${distKm} km, ${weightKg} kg)`, `LKR ${deliveryFee.toFixed(2)}`, true)}
              </div>
            );
          })()}
        </div>

        {isDirty && (
          <p className={`text-xs text-center ${isDark ? 'text-yellow-400' : 'text-yellow-600'}`}>
            ⚠️ You have unsaved changes — click "Save Changes" to apply them live.
          </p>
        )}
      </div>
    </DashboardLayout>
  );
};
