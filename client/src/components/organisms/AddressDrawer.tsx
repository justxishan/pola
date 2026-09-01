import React, { useState } from 'react';
import { useTranslation } from '@/lib/i18n';
import { useAuthStore } from '@/store/authStore';
import { AuthService } from '@/services/auth.service';
import { Input } from '@/components/atoms/Input';
import { Select } from '@/components/atoms/Select';
import { Button } from '@/components/atoms/Button';
import { PROVINCES_DISTRICTS } from '@pola/shared';
import { MapPin, X, Plus, CheckCircle2, Trash2, Star } from 'lucide-react';
import toast from 'react-hot-toast';

export interface AddressDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectAddress?: (address: any) => void;
}

export const AddressDrawer: React.FC<AddressDrawerProps> = ({
  isOpen,
  onClose,
  onSelectAddress,
}) => {
  const { t } = useTranslation();
  const { user, updateUser } = useAuthStore();

  const [isAddingNew, setIsAddingNew] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [label, setLabel] = useState('Home');
  const [province, setProvince] = useState('Western');
  const [district, setDistrict] = useState('Colombo');
  const [city, setCity] = useState('Kollupitiya');
  const [streetAddress, setStreetAddress] = useState('');
  const [postalCode, setPostalCode] = useState('00300');

  if (!isOpen) return null;

  const addresses = user?.addresses || [];
  const districtsList =
    PROVINCES_DISTRICTS[province as keyof typeof PROVINCES_DISTRICTS] || [];

  const handleSaveAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!streetAddress.trim() || !city.trim()) {
      toast.error('Please fill in street and city');
      return;
    }

    try {
      setIsLoading(true);
      const newAddress = {
        label: label.trim() || 'Home',
        province,
        district,
        city: city.trim(),
        addressLine1: streetAddress.trim(),
        streetAddress: streetAddress.trim(),
        postalCode: postalCode.trim() || '00300',
        isDefault: addresses.length === 0,
      };

      const updatedAddresses = [...addresses, newAddress];
      await AuthService.updateProfile({ addresses: updatedAddresses });
      updateUser({ addresses: updatedAddresses });

      toast.success('New delivery address added!');
      setIsAddingNew(false);
      setStreetAddress('');

      if (onSelectAddress) {
        onSelectAddress(newAddress);
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || err.message || 'Failed to save address');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSetDefault = async (index: number) => {
    try {
      const updated = addresses.map((addr, idx) => ({
        ...addr,
        isDefault: idx === index,
      }));
      await AuthService.updateProfile({ addresses: updated });
      updateUser({ addresses: updated });
      toast.success('Default address updated');
    } catch (err: any) {
      toast.error('Failed to update default address');
    }
  };

  const handleDeleteAddress = async (index: number) => {
    try {
      const updated = addresses.filter((_, idx) => idx !== index);
      // If we removed the default address, make the first remaining address default
      if (updated.length > 0 && !updated.some((a) => a.isDefault)) {
        updated[0].isDefault = true;
      }
      await AuthService.updateProfile({ addresses: updated });
      updateUser({ addresses: updated });
      toast.success('Address removed');
    } catch (err: any) {
      toast.error('Failed to remove address');
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div
        className="absolute inset-0 bg-slate-900/50 backdrop-blur-xs transition-opacity animate-in fade-in"
        onClick={onClose}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white dark:bg-slate-900 shadow-2xl border-l border-slate-200 dark:border-slate-800 flex flex-col">
          {/* Header */}
          <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-300">
                <MapPin className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-slate-900 dark:text-slate-100 text-base">
                  Delivery Addresses
                </h3>
                <p className="text-xs text-slate-400">Manage your shipping destinations</p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {!isAddingNew ? (
              <>
                <div className="space-y-3">
                  {addresses.length === 0 ? (
                    <div className="py-12 text-center text-xs text-slate-400 space-y-2">
                      <MapPin className="w-8 h-8 mx-auto text-slate-300 dark:text-slate-700" />
                      <p>No saved addresses yet.</p>
                    </div>
                  ) : (
                    addresses.map((addr, idx) => {
                      const displayStreet = addr.addressLine1 || addr.streetAddress || '';
                      return (
                        <div
                          key={idx}
                          onClick={() => {
                            if (onSelectAddress) {
                              onSelectAddress(addr);
                              onClose();
                            }
                          }}
                          className={`p-4 rounded-2xl border transition-all cursor-pointer space-y-1 ${
                            addr.isDefault
                              ? 'border-emerald-500 bg-emerald-50/40 dark:bg-emerald-950/20 shadow-xs'
                              : 'border-slate-200 dark:border-slate-800 hover:border-slate-300'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-xs text-slate-900 dark:text-slate-100">
                              {addr.label || 'Address'}
                            </span>
                            <div className="flex items-center gap-1.5">
                              {addr.isDefault ? (
                                <span className="text-[10px] font-bold text-emerald-600 bg-emerald-100 dark:bg-emerald-950 px-2 py-0.5 rounded-full">
                                  Default
                                </span>
                              ) : (
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleSetDefault(idx);
                                  }}
                                  className="text-[10px] font-bold text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-slate-100 dark:hover:bg-slate-800 px-2 py-0.5 rounded-full flex items-center gap-1 cursor-pointer transition-colors"
                                  title="Set as Default"
                                >
                                  <Star className="w-3 h-3" />
                                  <span>Make Default</span>
                                </button>
                              )}
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteAddress(idx);
                                }}
                                className="p-1 text-slate-400 hover:text-rose-500 rounded-md cursor-pointer transition-colors"
                                title="Delete address"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                          <p className="text-xs text-slate-700 dark:text-slate-300">
                            {displayStreet}, {addr.city}
                          </p>
                          <p className="text-[11px] text-slate-400">
                            {addr.district}, {addr.province} Province • {addr.postalCode || '00300'}
                          </p>
                        </div>
                      );
                    })
                  )}
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsAddingNew(true)}
                  className="w-full mt-4"
                  leftIcon={<Plus className="w-4 h-4" />}
                >
                  Add New Delivery Address
                </Button>
              </>
            ) : (
              <form onSubmit={handleSaveAddress} className="space-y-4">
                <Input
                  label="Address Label (e.g. Home, Office, Kitchen)"
                  value={label}
                  onChange={(e) => setLabel(e.target.value)}
                  required
                />

                <div className="grid grid-cols-2 gap-3">
                  <Select
                    label="Province"
                    value={province}
                    onChange={(e) => {
                      setProvince(e.target.value);
                      const newDistricts = PROVINCES_DISTRICTS[e.target.value as keyof typeof PROVINCES_DISTRICTS] || [];
                      setDistrict(newDistricts[0] || '');
                    }}
                  >
                    {Object.keys(PROVINCES_DISTRICTS).map((p) => (
                      <option key={p} value={p}>
                        {p}
                      </option>
                    ))}
                  </Select>

                  <Select
                    label="District"
                    value={district}
                    onChange={(e) => setDistrict(e.target.value)}
                  >
                    {districtsList.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </Select>
                </div>

                <Input
                  label="City / Town"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  required
                />

                <Input
                  label="Street Address / Building"
                  placeholder="e.g. 45/2 Galle Road"
                  value={streetAddress}
                  onChange={(e) => setStreetAddress(e.target.value)}
                  required
                />

                <Input
                  label="Postal Code"
                  value={postalCode}
                  onChange={(e) => setPostalCode(e.target.value)}
                />

                <div className="flex gap-2 pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    type="button"
                    onClick={() => setIsAddingNew(false)}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="primary"
                    size="sm"
                    type="submit"
                    isLoading={isLoading}
                    className="flex-1"
                  >
                    Save Address
                  </Button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
