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
  const [landExtent, setLandExtent] = useState(2.5);
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!farmName.trim()) {
      toast.error('Please enter your farm field name');
      return;
    }
    if (!addressLine.trim() && !nearestVillage.trim()) {
      toast.error('Please enter an address or nearest village');
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

      toast.success('Farm field registered successfully!');
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
            Register Farm Parcel
          </h1>
          <p className="text-xs text-slate-400">
            Enter land acreage, irrigation, and optional GPS pin for village hub collection routing
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-6">
          <Input
            label="Farm / Field Name"
            placeholder="e.g. Green Valley Farm - Parcel 01"
            value={farmName}
            onChange={(e) => setFarmName(e.target.value)}
            required
          />

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
              label="Nearest Village / Suburb"
              placeholder="e.g. Galewela or Kandapola"
              value={nearestVillage}
              onChange={(e) => setNearestVillage(e.target.value)}
            />
            <Input
              label="Farm Road / Access Address"
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

          {/* Agronomy Details */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="grid grid-cols-2 gap-2">
              <Input
                label="Land Extent"
                type="number"
                step="0.1"
                value={landExtent}
                onChange={(e) => setLandExtent(parseFloat(e.target.value))}
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
              label="Ownership Type"
              value={ownershipType}
              onChange={(e) => setOwnershipType(e.target.value)}
            >
              <option value="owned">Owned Land</option>
              <option value="leased">Leased Land</option>
              <option value="state_permit">State Permit</option>
            </Select>

            <Select
              label="Irrigation Source"
              value={irrigationSource}
              onChange={(e) => setIrrigationSource(e.target.value)}
            >
              <option value="well">Agro Well</option>
              <option value="canal">Irrigation Canal / Tank</option>
              <option value="rainfed">Rainfed / Monsoon</option>
              <option value="river">River / Stream</option>
            </Select>
          </div>

          {/* Organic Certificate */}
          <div className="space-y-4 pt-2 border-t border-slate-100 dark:border-slate-800">
            <Toggle
              label="Certified Organic Farm"
              description="Check this if you hold a Sri Lanka Organic Standard (SLS) certification"
              checked={isOrganicCertified}
              onChange={setIsOrganicCertified}
            />

            {isOrganicCertified && (
              <FileDropzone
                label="Upload Organic Certificate Document"
                files={certFiles}
                onFilesChange={setCertFiles}
                maxFiles={1}
              />
            )}
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              size="md"
              onClick={() => navigate('/farmer/farms')}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="md"
              isLoading={isLoading}
            >
              Save Farm Field
            </Button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
};
