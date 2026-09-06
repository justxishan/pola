import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from '@/components/templates/DashboardLayout';
import { Input } from '@/components/atoms/Input';
import { Select } from '@/components/atoms/Select';
import { Toggle } from '@/components/atoms/Toggle';
import { FileDropzone } from '@/components/molecules/FileDropzone';
import { Button } from '@/components/atoms/Button';
import { FarmService } from '@/services/farm.service';
import { useAuthStore } from '@/store/authStore';
import { useThemeStore } from '@/store/themeStore';
import { useTranslation } from '@/lib/i18n';
import { getFarmerNavItems } from '@/lib/navItems';
import { PROVINCES_DISTRICTS } from '@pola/shared';
import {
  MapPin,
  ArrowLeft,
  Navigation,
  CheckCircle2,
} from 'lucide-react';
import { cn } from '@/lib/cn';
import toast from 'react-hot-toast';

export const AddFarmPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const { isDark, toggleTheme, language, setLanguage } = useThemeStore();
  const { t } = useTranslation();

  const [farmName, setFarmName] = useState('');
  const [province, setProvince] = useState('Central');
  const [district, setDistrict] = useState('Matale');
  const [nearestVillage, setNearestVillage] = useState('');
  const [addressLine, setAddressLine] = useState('');
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  
  // Clean empty default for numeric farm size (Bug 6 class)
  const [landExtent, setLandExtent] = useState<number | ''>('');
  const [extentUnit, setExtentUnit] = useState<'acres' | 'perches' | 'hectares'>('acres');
  const [ownershipType, setOwnershipType] = useState('owned');
  const [irrigationSource, setIrrigationSource] = useState('well');
  const [isOrganicCertified, setIsOrganicCertified] = useState(false);
  const [certFiles, setCertFiles] = useState<File[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const navItems = getFarmerNavItems(t);

  const handleGetLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setLatitude(pos.coords.latitude);
          setLongitude(pos.coords.longitude);
          toast.success('GPS coordinates captured from your device!');
        },
        () => toast.error('Could not retrieve GPS location')
      );
    }
  };

  // 8 Core fields for completeness tracking
  const completedFieldsCount = [
    Boolean(farmName.trim()),
    Boolean(province),
    Boolean(district),
    Boolean(nearestVillage.trim() || addressLine.trim()),
    typeof landExtent === 'number' && landExtent > 0,
    Boolean(extentUnit),
    Boolean(ownershipType),
    Boolean(irrigationSource),
  ].filter(Boolean).length;
  const progressPercent = Math.round((completedFieldsCount / 8) * 100);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!farmName.trim()) {
      toast.error('Please enter your farm name');
      return;
    }
    if (!addressLine.trim() && !nearestVillage.trim()) {
      toast.error('Please enter a village or street address');
      return;
    }
    if (landExtent === '' || landExtent <= 0) {
      toast.error('Please enter a valid farm size');
      return;
    }

    try {
      setIsLoading(true);

      // If organic cert file needs uploading, use FormData; otherwise JSON
      if (certFiles[0]) {
        const formData = new FormData();
        formData.append('farmName', farmName.trim());
        formData.append('province', province);
        formData.append('district', district);
        formData.append('addressLine', addressLine.trim() || nearestVillage.trim());
        formData.append('city', nearestVillage.trim() || addressLine.trim());
        if (latitude !== null && longitude !== null) {
          formData.append('latitude', String(latitude));
          formData.append('longitude', String(longitude));
        }
        formData.append('extentValue', String(landExtent));
        formData.append('extentUnit', extentUnit);
        formData.append('ownershipType', ownershipType);
        formData.append('irrigationType', irrigationSource);
        formData.append('isOrganicCertified', String(isOrganicCertified));
        formData.append('organicCertificate', certFiles[0]);
        await FarmService.createFarm(formData);
      } else {
        const payload: any = {
          farmName: farmName.trim(),
          province,
          district,
          addressLine: addressLine.trim() || nearestVillage.trim(),
          city: nearestVillage.trim() || addressLine.trim(),
          extentValue: landExtent,
          extentUnit,
          ownershipType,
          irrigationType: irrigationSource,
          isOrganicCertified,
        };
        if (latitude !== null && longitude !== null) {
          payload.latitude = latitude;
          payload.longitude = longitude;
        }
        await FarmService.createFarmJson(payload);
      }

      toast.success('Farm registered successfully!');
      navigate('/farmer/farms');
    } catch (err: any) {
      toast.error(err.response?.data?.message || err.message || 'Failed to register farm');
    } finally {
      setIsLoading(false);
    }
  };

  const availableDistricts = PROVINCES_DISTRICTS[province] || [];

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
      activePath="/farmer/farms"
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
      <div className="max-w-3xl space-y-6">
        <button
          onClick={() => navigate('/farmer/farms')}
          className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to My Farms</span>
        </button>

        <div>
          <h1 className="text-xl font-extrabold text-slate-900 dark:text-slate-100">
            Register Farm Plot
          </h1>
          <p className="text-xs text-slate-400">
            Enter land acreage, irrigation, and optional GPS pin for village hub collection routing
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-6">
          {/* Progress Indicator matching 01 */}
          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800/80 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <CheckCircle2 className={cn('w-4 h-4', progressPercent === 100 ? 'text-emerald-500' : 'text-slate-400')} />
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Registration Completeness: {completedFieldsCount} of 8 required fields
              </span>
            </div>
            <div className="w-28 bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
              <div
                className="bg-emerald-600 h-full rounded-full transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          {/* Section: Farm Identity */}
          <div className="space-y-4">
            <Input
              label="Farm Name"
              placeholder="e.g. Green Valley Farm - Parcel 01"
              value={farmName}
              onChange={(e) => setFarmName(e.target.value)}
              required
            />
          </div>

          {/* Section: Location & Hub Routing */}
          <div className="space-y-4 pt-2">
            <div className="border-b border-slate-100 dark:border-slate-800 pb-1.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Location & Hub Routing
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Select
                label="Province"
                value={province}
                onChange={(e) => {
                  setProvince(e.target.value);
                  const newDists = PROVINCES_DISTRICTS[e.target.value] || [];
                  if (newDists.length > 0) setDistrict(newDists[0]);
                }}
                options={Object.keys(PROVINCES_DISTRICTS).map((p) => ({
                  value: p,
                  label: `${p} Province`,
                }))}
              />

              <Select
                label="District"
                value={district}
                onChange={(e) => setDistrict(e.target.value)}
                options={availableDistricts.map((d) => ({
                  value: d,
                  label: `${d} District`,
                }))}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Village / Town"
                placeholder="e.g. Galewela or Kandapola"
                value={nearestVillage}
                onChange={(e) => setNearestVillage(e.target.value)}
              />
              <Input
                label="Street / Access Address (optional)"
                placeholder="e.g. Near Tank Bund Road"
                value={addressLine}
                onChange={(e) => setAddressLine(e.target.value)}
              />
            </div>

            {/* GPS Coordinates (Optional) */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                    <MapPin className="w-4 h-4 text-emerald-600" />
                    GPS Coordinates (Optional)
                  </span>
                  <p className="text-[11px] text-slate-400">
                    Used for nearest village hub routing. You can skip this or capture with one tap.
                  </p>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleGetLocation}
                  leftIcon={<Navigation className="w-3.5 h-3.5" />}
                >
                  Use My Current Location
                </Button>
              </div>

              {latitude !== null && longitude !== null && (
                <div className="flex items-center gap-2 p-3 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-medium border border-emerald-500/20">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>Detected Location: {latitude.toFixed(4)}° N, {longitude.toFixed(4)}° E</span>
                </div>
              )}
            </div>
          </div>

          {/* Section: Land & Agronomy */}
          <div className="space-y-4 pt-2">
            <div className="border-b border-slate-100 dark:border-slate-800 pb-1.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Land & Agronomy
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="grid grid-cols-2 gap-2">
                <Input
                  label={`Farm Size (${extentUnit})`}
                  type="number"
                  step="0.1"
                  placeholder="e.g. 2.5"
                  value={landExtent}
                  onChange={(e) => setLandExtent(e.target.value === '' ? '' : parseFloat(e.target.value))}
                  required
                />
                <Select
                  label="Unit"
                  value={extentUnit}
                  onChange={(e) => setExtentUnit(e.target.value as any)}
                >
                  <option value="acres">Acres</option>
                  <option value="perches">Perches</option>
                  <option value="hectares">Hectares</option>
                </Select>
              </div>

              <Select
                label="Ownership"
                value={ownershipType}
                onChange={(e) => setOwnershipType(e.target.value)}
              >
                <option value="owned">Owned / Freehold</option>
                <option value="leased">Leased Land</option>
                <option value="rented">Rented / Tenant</option>
              </Select>

              <Select
                label="Irrigation"
                value={irrigationSource}
                onChange={(e) => setIrrigationSource(e.target.value)}
              >
                <option value="well">Agro Well</option>
                <option value="canal">Irrigation Canal / Tank</option>
                <option value="rain_fed">Rain-fed / Monsoon</option>
                <option value="drip">Drip Irrigation</option>
                <option value="irrigated">Irrigated / Other</option>
              </Select>
            </div>
          </div>

          {/* Section: Certification */}
          <div className="space-y-4 pt-2">
            <div className="border-b border-slate-100 dark:border-slate-800 pb-1.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Certification
              </span>
            </div>

            <Toggle
              label="Organic Certified"
              description="Check this if you hold a Sri Lanka Organic Standard (SLS) or PGS certification"
              checked={isOrganicCertified}
              onChange={setIsOrganicCertified}
            />

            {isOrganicCertified && (
              <FileDropzone
                label="Upload Organic Certificate Document"
                helperText="PDF or image up to 10MB"
                files={certFiles}
                onFilesChange={setCertFiles}
                maxFiles={1}
              />
            )}
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
            <Button
              type="button"
              variant="outline"
              size="md"
              onClick={() => navigate('/farmer/farms')}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="md"
              isLoading={isLoading}
              disabled={isLoading}
            >
              {isLoading && certFiles.length > 0 ? 'Uploading certificate...' : isLoading ? 'Registering farm...' : 'Register Farm'}
            </Button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
};

