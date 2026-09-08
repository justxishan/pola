import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from '@/components/templates/DashboardLayout';
import { Button } from '@/components/atoms/Button';
import { Input } from '@/components/atoms/Input';
import { Select } from '@/components/atoms/Select';
import { Badge } from '@/components/atoms/Badge';
import { Spinner } from '@/components/atoms/Spinner';
import { EmptyState } from '@/components/molecules/EmptyState';
import { VehicleService } from '@/services/vehicle.service';
import { useAuthStore } from '@/store/authStore';
import { useThemeStore } from '@/store/themeStore';
import { useTranslation } from '@/lib/i18n';
import { getDeliveryNavItems } from '@/lib/navItems';
import { VehicleType } from '@pola/shared';
import {
  Truck,
  Plus,
  X,
  FileText,
  Upload,
  AlertTriangle,
  CheckCircle2,
  Calendar,
} from 'lucide-react';
import toast from 'react-hot-toast';

export const VehiclesPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const { isDark, toggleTheme, language, setLanguage } = useThemeStore();
  const { t } = useTranslation();

  const [vehicles, setVehicles] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Add Vehicle Modal
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [vehicleType, setVehicleType] = useState<VehicleType>(VehicleType.MINI_TRUCK);
  const [makeModel, setMakeModel] = useState('Tata Ace / Dimo Batta');
  const [licensePlate, setLicensePlate] = useState('');
  const [capacityKg, setCapacityKg] = useState('1000');
  const [hasColdStorage, setHasColdStorage] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Document Upload Modal
  const [uploadVehicle, setUploadVehicle] = useState<any | null>(null);
  const [crBookFile, setCrBookFile] = useState<File | null>(null);
  const [revenueLicenseFile, setRevenueLicenseFile] = useState<File | null>(null);
  const [isUploadingDocs, setIsUploadingDocs] = useState(false);

  const navItems = getDeliveryNavItems(t as any);

  useEffect(() => {
    fetchVehicles();
  }, []);

  const fetchVehicles = async () => {
    try {
      setIsLoading(true);
      const res: any = await VehicleService.getMyVehicles();
      if (res.success && res.data) {
        setVehicles(res.data.vehicles || []);
      }
    } catch (err: any) {
      toast.error('Failed to load vehicles');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddVehicle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!licensePlate.trim()) {
      toast.error('Please enter license plate number');
      return;
    }

    try {
      setIsSubmitting(true);
      await VehicleService.registerVehicle({
        vehicleType,
        registrationPlate: licensePlate.trim().toUpperCase(),
        makeModel: makeModel.trim() || 'Standard Commercial',
        maxPayloadKg: parseFloat(capacityKg) || 500,
        hasColdChain: hasColdStorage,
      });
      toast.success('Vehicle registered successfully — pending admin verification');
      setIsAddOpen(false);
      setLicensePlate('');
      setMakeModel('Tata Ace / Dimo Batta');
      setCapacityKg('1000');
      setHasColdStorage(false);
      await fetchVehicles();
    } catch (err: any) {
      toast.error(err.response?.data?.message || err.message || 'Failed to register vehicle');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleOperationalStatus = async (vehicleId: string, status: 'active' | 'maintenance' | 'suspended') => {
    try {
      await VehicleService.updateOperationalStatus(vehicleId, status);
      toast.success(`Vehicle set to ${status}`);
      await fetchVehicles();
    } catch (err: any) {
      toast.error(err.response?.data?.message || err.message || 'Failed to update vehicle status');
    }
  };

  const handleUploadDocs = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadVehicle) return;
    if (!crBookFile && !revenueLicenseFile) {
      toast.error('Please select at least one document to upload');
      return;
    }

    try {
      setIsUploadingDocs(true);
      const formData = new FormData();
      if (crBookFile) formData.append('crBook', crBookFile);
      if (revenueLicenseFile) formData.append('revenueLicense', revenueLicenseFile);

      await VehicleService.uploadVehicleDocs(uploadVehicle._id, formData);
      toast.success('Vehicle documents uploaded successfully');
      setUploadVehicle(null);
      setCrBookFile(null);
      setRevenueLicenseFile(null);
      await fetchVehicles();
    } catch (err: any) {
      toast.error(err.response?.data?.message || err.message || 'Failed to upload documents');
    } finally {
      setIsUploadingDocs(false);
    }
  };

  const daysUntil = (date?: string | Date) => {
    if (!date) return null;
    return Math.ceil((new Date(date).getTime() - Date.now()) / 86400000);
  };

  return (
    <DashboardLayout
      portalTitle={t.deliveryFleet}
      portalRole={user?.role || 'Delivery Partner'}
      navItems={navItems}
      activePath="/delivery/vehicles"
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
              Registered Transport Vehicles ({vehicles.length})
            </h1>
            <p className="text-xs text-slate-400">
              Manage your three-wheelers, mini-trucks, lorries &amp; refrigerated bodies
            </p>
          </div>

          <Button
            variant="primary"
            size="sm"
            onClick={() => setIsAddOpen(true)}
            className="bg-amber-600 hover:bg-amber-700"
            leftIcon={<Plus className="w-4 h-4" />}
          >
            Add New Vehicle
          </Button>
        </div>

        {/* Vehicles Grid */}
        {isLoading ? (
          <div className="py-20 flex justify-center">
            <Spinner size="lg" />
          </div>
        ) : vehicles.length === 0 ? (
          <EmptyState
            title="No vehicles registered"
            description="Add your delivery vehicles to accept radar trips"
            icon={<Truck className="w-8 h-8" />}
            action={{ label: 'Add First Vehicle', onClick: () => setIsAddOpen(true) }}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {vehicles.map((v) => {
              const insDays = daysUntil(v.insuranceExpiry);
              const revDays = daysUntil(v.revenueLicenseExpiry);

              return (
                <div
                  key={v._id}
                  className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-3 rounded-2xl bg-amber-50 dark:bg-amber-950 text-amber-600 dark:text-amber-300">
                        <Truck className="w-6 h-6" />
                      </div>
                      <div>
                        <h4 className="font-extrabold text-slate-900 dark:text-slate-100 text-base">
                          {v.registrationPlate || v.licensePlate}
                        </h4>
                        <p className="text-xs text-slate-400 capitalize">
                          {v.makeModel} • {v.vehicleType?.replace(/_/g, ' ')}
                        </p>
                      </div>
                    </div>

                    <Badge
                      variant={
                        v.status === 'verified'
                          ? 'emerald'
                          : v.status === 'rejected'
                          ? 'rose'
                          : 'amber'
                      }
                      size="sm"
                    >
                      {v.status === 'verified'
                        ? 'Verified Active'
                        : v.status === 'rejected'
                        ? 'Rejected'
                        : 'Pending Check'}
                    </Badge>
                  </div>

                  {/* Expiry Warnings */}
                  {(insDays !== null && insDays <= 30) || (revDays !== null && revDays <= 30) ? (
                    <div className="space-y-1">
                      {insDays !== null && insDays <= 30 && (
                        <div className="flex items-center gap-1.5 text-xs text-amber-600 dark:text-amber-400 font-semibold bg-amber-50 dark:bg-amber-950/40 px-3 py-1.5 rounded-xl border border-amber-200 dark:border-amber-800">
                          <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                          <span>
                            {insDays <= 0
                              ? 'Insurance has expired!'
                              : `Insurance expires in ${insDays} days`}
                          </span>
                        </div>
                      )}
                      {revDays !== null && revDays <= 30 && (
                        <div className="flex items-center gap-1.5 text-xs text-amber-600 dark:text-amber-400 font-semibold bg-amber-50 dark:bg-amber-950/40 px-3 py-1.5 rounded-xl border border-amber-200 dark:border-amber-800">
                          <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                          <span>
                            {revDays <= 0
                              ? 'Revenue license has expired!'
                              : `Revenue license expires in ${revDays} days`}
                          </span>
                        </div>
                      )}
                    </div>
                  ) : null}

                  <div className="grid grid-cols-2 gap-2 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs">
                    <div>
                      <span className="text-slate-400 block text-[11px]">Payload Capacity</span>
                      <span className="font-bold text-slate-800 dark:text-slate-200">
                        {v.maxPayloadKg || v.capacityKg || 500} kg
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[11px]">Cold Storage</span>
                      <span className="font-bold text-slate-800 dark:text-slate-200">
                        {v.hasColdChain || v.hasColdStorage ? 'Equipped' : 'Standard'}
                      </span>
                    </div>
                  </div>

                  {/* Documents Section */}
                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="text-slate-400 text-[11px]">Documents:</span>
                      <span
                        className={`inline-flex items-center gap-1 text-[11px] font-bold ${
                          v.crBookDoc ? 'text-emerald-600' : 'text-slate-400'
                        }`}
                      >
                        CR {v.crBookDoc ? '✓' : '—'}
                      </span>
                      <span
                        className={`inline-flex items-center gap-1 text-[11px] font-bold ${
                          v.revenueLicenseDoc ? 'text-emerald-600' : 'text-slate-400'
                        }`}
                      >
                        License {v.revenueLicenseDoc ? '✓' : '—'}
                      </span>
                    </div>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setUploadVehicle(v)}
                      leftIcon={<Upload className="w-3.5 h-3.5" />}
                      className="text-xs py-1 px-2.5 h-auto"
                    >
                      {v.crBookDoc || v.revenueLicenseDoc ? 'Update Docs' : 'Upload Docs'}
                    </Button>
                  </div>

                  <div className="flex items-center gap-1.5 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
                    <span className="text-slate-400 text-[11px] font-semibold">Operational:</span>
                    {(['active', 'maintenance', 'suspended'] as const).map((st) => (
                      <button
                        key={st}
                        onClick={() => handleToggleOperationalStatus(v._id, st)}
                        className={`px-2 py-0.5 rounded-lg text-[11px] font-bold capitalize transition-colors cursor-pointer ${
                          (v.operationalStatus || 'active') === st
                            ? st === 'active'
                              ? 'bg-emerald-500 text-white'
                              : st === 'maintenance'
                              ? 'bg-amber-500 text-slate-950'
                              : 'bg-rose-500 text-white'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-slate-100'
                        }`}
                      >
                        {st}
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Upload Documents Modal */}
        {uploadVehicle && (
          <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
            <div
              className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs"
              onClick={() => setUploadVehicle(null)}
            />
            <div className="relative w-full max-w-md rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl p-6 sm:p-8 space-y-6 animate-in zoom-in-95">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-extrabold text-slate-900 dark:text-slate-100 text-lg">
                    Upload Vehicle Documents
                  </h3>
                  <p className="text-xs text-slate-400">
                    Plate: {uploadVehicle.registrationPlate || uploadVehicle.licensePlate}
                  </p>
                </div>
                <button
                  onClick={() => setUploadVehicle(null)}
                  className="p-1 rounded-lg text-slate-400 hover:bg-slate-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleUploadDocs} className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    CR Book (Certificate of Registration)
                  </label>
                  <input
                    type="file"
                    accept=".pdf,image/*"
                    onChange={(e) => setCrBookFile(e.target.files?.[0] || null)}
                    className="w-full text-xs text-slate-600 dark:text-slate-400 file:mr-3 file:py-2 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-amber-50 file:text-amber-700 hover:file:bg-amber-100 cursor-pointer"
                  />
                  {uploadVehicle.crBookDoc && (
                    <p className="text-[11px] text-emerald-600 font-semibold mt-1">
                      ✓ Previously uploaded
                    </p>
                  )}
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Revenue License
                  </label>
                  <input
                    type="file"
                    accept=".pdf,image/*"
                    onChange={(e) => setRevenueLicenseFile(e.target.files?.[0] || null)}
                    className="w-full text-xs text-slate-600 dark:text-slate-400 file:mr-3 file:py-2 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-amber-50 file:text-amber-700 hover:file:bg-amber-100 cursor-pointer"
                  />
                  {uploadVehicle.revenueLicenseDoc && (
                    <p className="text-[11px] text-emerald-600 font-semibold mt-1">
                      ✓ Previously uploaded
                    </p>
                  )}
                </div>

                <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                  <Button
                    variant="outline"
                    size="sm"
                    type="button"
                    onClick={() => setUploadVehicle(null)}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="primary"
                    size="sm"
                    type="submit"
                    isLoading={isUploadingDocs}
                    className="bg-amber-600 hover:bg-amber-700"
                  >
                    Submit Documents
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Add Modal */}
        {isAddOpen && (
          <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
            <div
              className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity"
              onClick={() => setIsAddOpen(false)}
            />

            <div className="relative w-full max-w-lg rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl p-6 sm:p-8 space-y-6 animate-in zoom-in-95">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-extrabold text-slate-900 dark:text-slate-100 text-lg">
                    Add Transport Vehicle
                  </h3>
                  <p className="text-xs text-slate-400">
                    Register new fleet vehicle for order radar matching
                  </p>
                </div>
                <button
                  onClick={() => setIsAddOpen(false)}
                  className="p-1 rounded-lg text-slate-400 hover:bg-slate-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleAddVehicle} className="space-y-4">
                <Select
                  label="Vehicle Category"
                  value={vehicleType}
                  onChange={(e) => setVehicleType(e.target.value as VehicleType)}
                  options={[
                    {
                      value: VehicleType.THREE_WHEELER,
                      label: 'Three-Wheeler (Tuk-Tuk) — Up to 250 kg',
                    },
                    { value: VehicleType.MOTORCYCLE, label: 'Motorcycle — Up to 35 kg' },
                    {
                      value: VehicleType.MINI_TRUCK,
                      label: 'Mini-Truck (Dimo Batta / Bolero) — Up to 1,000 kg',
                    },
                    { value: VehicleType.SMALL_LORRY, label: 'Small Lorry (10-14ft) — Up to 2,500 kg' },
                    { value: VehicleType.LARGE_LORRY, label: 'Large Lorry (16-20ft) — Up to 5,000 kg' },
                    {
                      value: VehicleType.REFRIGERATED_TRUCK,
                      label: 'Refrigerated Cold-Chain Truck',
                    },
                  ]}
                />

                <Input
                  label="Make & Model"
                  placeholder="e.g. Tata Ace, Dimo Batta, Mahindra Bolero"
                  value={makeModel}
                  onChange={(e) => setMakeModel(e.target.value)}
                  required
                />

                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="License Plate"
                    placeholder="WP CAB-1234"
                    value={licensePlate}
                    onChange={(e) => setLicensePlate(e.target.value)}
                    required
                  />

                  <Input
                    label="Capacity (kg)"
                    type="number"
                    value={capacityKg}
                    onChange={(e) => setCapacityKg(e.target.value)}
                    required
                  />
                </div>

                <div className="flex items-center gap-3 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800">
                  <input
                    type="checkbox"
                    id="vehCold"
                    checked={hasColdStorage}
                    onChange={(e) => setHasColdStorage(e.target.checked)}
                    className="w-4 h-4 rounded text-amber-600"
                  />
                  <label
                    htmlFor="vehCold"
                    className="text-xs font-bold text-slate-800 dark:text-slate-200 cursor-pointer"
                  >
                    Cold-Storage / Insulated Body
                  </label>
                </div>

                <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                  <Button
                    variant="outline"
                    size="sm"
                    type="button"
                    onClick={() => setIsAddOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="primary"
                    size="sm"
                    type="submit"
                    isLoading={isSubmitting}
                    className="bg-amber-600"
                  >
                    Register Vehicle
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};
