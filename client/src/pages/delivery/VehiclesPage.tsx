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
import { VehicleType } from '@pola/shared';
import {
  Compass,
  Radar,
  Calendar,
  Truck,
  DollarSign,
  Plus,
  X,
  CheckCircle2,
  AlertTriangle,
  Snowflake,
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

  const navItems = [
    { id: 'hud', label: 'Delivery HUD', icon: <Compass className="w-5 h-5" />, path: '/delivery/dashboard' },
    { id: 'available', label: 'Available Radar Trips', icon: <Radar className="w-5 h-5" />, path: '/delivery/available' },
    { id: 'hub', label: 'Hub Intake Sheet', icon: <Calendar className="w-5 h-5" />, path: '/delivery/hub-schedule' },
    { id: 'vehicles', label: 'My Vehicles', icon: <Truck className="w-5 h-5" />, path: '/delivery/vehicles' },
    { id: 'earnings', label: 'Trip Earnings', icon: <DollarSign className="w-5 h-5" />, path: '/delivery/earnings' },
  ];

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
      await fetchVehicles(); // Refresh from DB
    } catch (err: any) {
      toast.error(err.response?.data?.message || err.message || 'Failed to register vehicle');
    } finally {
      setIsSubmitting(false);
    }
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
              Manage your three-wheelers, mini-trucks, lorries & refrigerated bodies
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {vehicles.map((v) => (
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
                      {v.licensePlate}
                    </h4>
                    <p className="text-xs text-slate-400 capitalize">
                      {v.vehicleType?.replace(/_/g, ' ')}
                    </p>
                  </div>
                </div>

                <Badge variant={v.isVerified ? 'emerald' : 'amber'} size="sm">
                  {v.isVerified ? 'Verified Active' : 'Pending Check'}
                </Badge>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs">
                <div>
                  <span className="text-slate-400 block text-[11px]">Payload Capacity</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">{v.capacityKg} kg</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Cold Storage Body</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">
                    {v.hasColdStorage ? 'Equipped (Refrigerated)' : 'Standard Body'}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

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
                  <p className="text-xs text-slate-400">Register new fleet vehicle for order radar matching</p>
                </div>
                <button onClick={() => setIsAddOpen(false)} className="p-1 rounded-lg text-slate-400 hover:bg-slate-100">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleAddVehicle} className="space-y-4">
                <Select
                  label="Vehicle Category"
                  value={vehicleType}
                  onChange={(e) => setVehicleType(e.target.value as VehicleType)}
                  options={[
                    { value: VehicleType.THREE_WHEELER, label: 'Three-Wheeler (Tuk-Tuk) — Up to 250 kg' },
                    { value: VehicleType.MOTORCYCLE, label: 'Motorcycle — Up to 35 kg' },
                    { value: VehicleType.MINI_TRUCK, label: 'Mini-Truck (Dimo Batta / Bolero) — Up to 1,000 kg' },
                    { value: VehicleType.SMALL_LORRY, label: 'Small Lorry (10-14ft) — Up to 2,500 kg' },
                    { value: VehicleType.LARGE_LORRY, label: 'Large Lorry (16-20ft) — Up to 5,000 kg' },
                    { value: VehicleType.REFRIGERATED_TRUCK, label: 'Refrigerated Cold-Chain Truck' },
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
                  <label htmlFor="vehCold" className="text-xs font-bold text-slate-800 dark:text-slate-200 cursor-pointer">
                    Cold-Storage / Insulated Body
                  </label>
                </div>

                <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                  <Button variant="outline" size="sm" type="button" onClick={() => setIsAddOpen(false)}>
                    Cancel
                  </Button>
                  <Button variant="primary" size="sm" type="submit" isLoading={isSubmitting} className="bg-amber-600">
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
