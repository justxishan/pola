import React, { useState, useEffect } from 'react';
import { useTranslation } from '@/lib/i18n';
import { Input } from '@/components/atoms/Input';
import { Select } from '@/components/atoms/Select';
import { Button } from '@/components/atoms/Button';
import { FarmService } from '@/services/farm.service';
import { PROVINCES_DISTRICTS } from '@pola/shared';
import { Sprout, X, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';

export interface EditFarmModalProps {
  farm: any | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const EditFarmModal: React.FC<EditFarmModalProps> = ({
  farm,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState(false);

  const [farmName, setFarmName] = useState('');
  const [province, setProvince] = useState('Central');
  const [district, setDistrict] = useState('Matale');
  const [nearestVillage, setNearestVillage] = useState('');
  const [landExtentAcres, setLandExtentAcres] = useState('2.5');
  const [ownershipType, setOwnershipType] = useState('owned');
  const [irrigationSource, setIrrigationSource] = useState('well');
  const [isOrganicCertified, setIsOrganicCertified] = useState(false);
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    if (farm) {
      setFarmName(farm.farmName || '');
      setProvince(farm.location?.province || 'Central');
      setDistrict(farm.location?.district || 'Matale');
      setNearestVillage(farm.location?.nearestVillage || '');
      setLandExtentAcres(farm.landExtentAcres?.toString() || '1');
      setOwnershipType(farm.ownershipType || 'owned');
      setIrrigationSource(farm.irrigationSource || 'well');
      setIsOrganicCertified(!!farm.isOrganicCertified);
      setIsActive(farm.isActive !== false);
    }
  }, [farm]);

  if (!isOpen || !farm) return null;

  const districtsList =
    PROVINCES_DISTRICTS[province as keyof typeof PROVINCES_DISTRICTS] || [];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!farmName.trim()) {
      toast.error('Please enter a farm name');
      return;
    }

    try {
      setIsLoading(true);
      await FarmService.updateFarm(farm._id, {
        farmName,
        location: {
          province,
          district,
          nearestVillage,
        },
        landExtentAcres: parseFloat(landExtentAcres) || 1,
        ownershipType: ownershipType as any,
        irrigationSource: irrigationSource as any,
        isOrganicCertified,
        isActive,
      });

      toast.success('Farm details updated successfully');
      onSuccess();
      onClose();
    } catch (err: any) {
      toast.error(err.message || 'Failed to update farm details');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
      <div
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity animate-in fade-in"
        onClick={onClose}
      />

      <div className="relative w-full max-w-lg rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl p-6 sm:p-8 space-y-6 animate-in zoom-in-95 duration-150">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-300">
              <Sprout className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 dark:text-slate-100 text-lg">
                {t.editFarm}
              </h3>
              <p className="text-xs text-slate-400">Update land extent, irrigation & organic certification</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Farm Name / Label"
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
                const d =
                  PROVINCES_DISTRICTS[
                    e.target.value as keyof typeof PROVINCES_DISTRICTS
                  ];
                if (d && d.length > 0) setDistrict(d[0]);
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
              options={districtsList.map((d) => ({
                value: d,
                label: d,
              }))}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label={`Land Extent (${t.acres})`}
              type="number"
              value={landExtentAcres}
              onChange={(e) => setLandExtentAcres(e.target.value)}
            />

            <Input
              label="Nearest Village / Town"
              value={nearestVillage}
              onChange={(e) => setNearestVillage(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Ownership"
              value={ownershipType}
              onChange={(e) => setOwnershipType(e.target.value)}
              options={[
                { value: 'owned', label: 'Owned' },
                { value: 'leased', label: 'Leased' },
                { value: 'state_permit', label: 'State Permit' },
              ]}
            />

            <Select
              label="Irrigation"
              value={irrigationSource}
              onChange={(e) => setIrrigationSource(e.target.value)}
              options={[
                { value: 'rain', label: 'Rain-fed' },
                { value: 'canal', label: 'Canal' },
                { value: 'well', label: 'Deep Well' },
                { value: 'river', label: 'River / Stream' },
                { value: 'drip', label: 'Drip System' },
              ]}
            />
          </div>

          <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/40">
            <label
              htmlFor="editOrganic"
              className="text-xs font-bold text-slate-800 dark:text-slate-200 cursor-pointer"
            >
              Certified Organic Farm
            </label>
            <input
              type="checkbox"
              id="editOrganic"
              checked={isOrganicCertified}
              onChange={(e) => setIsOrganicCertified(e.target.checked)}
              className="w-4 h-4 rounded text-emerald-600"
            />
          </div>

          <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/40">
            <label
              htmlFor="editActive"
              className="text-xs font-bold text-slate-800 dark:text-slate-200 cursor-pointer"
            >
              Active Farm Field Status
            </label>
            <input
              type="checkbox"
              id="editActive"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              className="w-4 h-4 rounded text-emerald-600"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
            <Button variant="outline" size="sm" type="button" onClick={onClose}>
              {t.cancel}
            </Button>
            <Button
              variant="primary"
              size="sm"
              type="submit"
              isLoading={isLoading}
              className="bg-emerald-600 hover:bg-emerald-700"
            >
              {t.save}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
