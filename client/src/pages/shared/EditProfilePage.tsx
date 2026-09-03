import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from '@/components/templates/DashboardLayout';
import { Input } from '@/components/atoms/Input';
import { Select } from '@/components/atoms/Select';
import { Button } from '@/components/atoms/Button';
import { Badge } from '@/components/atoms/Badge';
import { AuthService } from '@/services/auth.service';
import { HubService } from '@/services/hub.service';
import { useAuthStore } from '@/store/authStore';
import { useThemeStore } from '@/store/themeStore';
import { useTranslation } from '@/lib/i18n';
import { getFarmerNavItems, getDeliveryNavItems } from '@/lib/navItems';
import { ArrowLeft, User, Building, ShieldCheck, Save, MapPin } from 'lucide-react';
import toast from 'react-hot-toast';

export const EditProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const { user, updateUser, logout } = useAuthStore();
  const { isDark, toggleTheme, language, setLanguage } = useThemeStore();
  const { t } = useTranslation();

  const [fullName, setFullName] = useState(user?.fullName || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [preferredLang, setPreferredLang] = useState<'en' | 'si' | 'ta'>(
    (user?.preferredLanguage as any) || language || 'en'
  );
  const [themePref, setThemePref] = useState<'light' | 'dark' | 'system'>(
    (user?.themePreference as any) || 'system'
  );
  const [assignedHubId, setAssignedHubId] = useState(user?.assignedHubId || '');
  const [hubs, setHubs] = useState<any[]>([]);

  // Bank details
  const [bankName, setBankName] = useState(user?.bankDetails?.bankName || '');
  const [branchName, setBranchName] = useState(user?.bankDetails?.branchName || '');
  const [accountNumber, setAccountNumber] = useState(user?.bankDetails?.accountNumber || '');
  const [accountHolderName, setAccountHolderName] = useState(user?.bankDetails?.accountHolderName || '');

  const [isSaving, setIsSaving] = useState(false);
  const [isLoadingHubs, setIsLoadingHubs] = useState(false);

  const isFarmer = user?.role?.startsWith('farmer') || user?.role === 'collector';
  const isDelivery = user?.role?.startsWith('delivery');

  const navItems = isFarmer
    ? getFarmerNavItems(t)
    : isDelivery
    ? getDeliveryNavItems(t)
    : [];

  useEffect(() => {
    if (isFarmer) {
      fetchHubs();
    }
  }, [isFarmer]);

  const fetchHubs = async () => {
    try {
      setIsLoadingHubs(true);
      const res: any = await HubService.getAllHubs();
      if (res.success && res.data) {
        setHubs(res.data.hubs || []);
      }
    } catch (err) {
      console.error('Failed to load hubs', err);
    } finally {
      setIsLoadingHubs(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSaving(true);
      const updates: any = {
        fullName,
        phone,
        preferredLanguage: preferredLang,
        themePreference: themePref,
      };

      if (isFarmer && assignedHubId) {
        updates.assignedHubId = assignedHubId;
      }

      if (isFarmer || isDelivery) {
        updates.bankDetails = {
          bankName,
          branchName,
          accountNumber,
          accountHolderName,
        };
      }

      const res: any = await AuthService.updateProfile(updates);
      if (res.success) {
        updateUser(updates);
        setLanguage(preferredLang);
        if (themePref === 'dark' && !isDark) toggleTheme();
        if (themePref === 'light' && isDark) toggleTheme();

        toast.success('Profile credentials updated successfully');
        navigate(-1);
      }
    } catch (err: any) {
      console.error(err);
      toast.error(err.response?.data?.message || err.message || 'Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <DashboardLayout
      portalTitle={isFarmer ? (t.farmerOpsCenter || 'Farmer Portal') : 'Pola Portal'}
      portalRole={user?.role || 'User'}
      navItems={navItems}
      mobileNavItems={navItems.map((item) => ({
        id: item.id,
        label: item.label,
        icon: item.icon,
        path: item.path,
      }))}
      activePath=""
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
      <div className="max-w-2xl mx-auto space-y-6 text-left">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </button>

        <div>
          <h1 className="text-xl font-extrabold text-slate-900 dark:text-slate-100">
            Edit Account Profile
          </h1>
          <p className="text-xs text-slate-400">
            Update your personal contact information, payout bank details, and collection center
          </p>
        </div>

        <form onSubmit={handleSave} className="space-y-6">
          {/* Personal Info Card */}
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
              <User className="w-4 h-4 text-emerald-600" />
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                Personal Information
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Full Name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
              />

              <Input
                label="Email Address"
                value={user?.email || ''}
                disabled
                helperText="Email address cannot be changed directly"
              />

              <Input
                label="Sri Lankan Mobile Phone"
                placeholder="e.g. 0771234567"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />

              <Select
                label="Preferred Language"
                value={preferredLang}
                onChange={(e) => setPreferredLang(e.target.value as any)}
              >
                <option value="en">English</option>
                <option value="si">සිංහල (Sinhala)</option>
                <option value="ta">தமிழ் (Tamil)</option>
              </Select>
            </div>
          </div>

          {/* Assigned Village Hub Card (Farmers only) */}
          {isFarmer && (
            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
                <MapPin className="w-4 h-4 text-emerald-600" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                  Assigned Village Collection Hub
                </h3>
              </div>

              <Select
                label="Village Hub"
                value={assignedHubId}
                onChange={(e) => setAssignedHubId(e.target.value)}
                helperText="Select the village center where you deliver harvested produce for intake grading"
              >
                <option value="">Default Nearest Hub in District</option>
                {hubs.map((hub) => (
                  <option key={hub._id} value={hub._id}>
                    {hub.hubName} ({hub.district} — {hub.city})
                  </option>
                ))}
              </Select>
            </div>
          )}

          {/* Bank Details Card (Farmers & Delivery) */}
          {(isFarmer || isDelivery) && (
            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
                <Building className="w-4 h-4 text-emerald-600" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                  Settlement Bank Account (LankaPay)
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Bank Name"
                  placeholder="e.g. Bank of Ceylon"
                  value={bankName}
                  onChange={(e) => setBankName(e.target.value)}
                />

                <Input
                  label="Branch Name"
                  placeholder="e.g. Keppetipola Branch"
                  value={branchName}
                  onChange={(e) => setBranchName(e.target.value)}
                />

                <Input
                  label="Account Number"
                  placeholder="e.g. 1002345678"
                  value={accountNumber}
                  onChange={(e) => setAccountNumber(e.target.value)}
                />

                <Input
                  label="Account Holder Name"
                  placeholder="As registered in bank passbook"
                  value={accountHolderName}
                  onChange={(e) => setAccountHolderName(e.target.value)}
                />
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              size="md"
              onClick={() => navigate(-1)}
            >
              Cancel
            </Button>

            <Button
              type="submit"
              variant="primary"
              size="md"
              isLoading={isSaving}
              leftIcon={<Save className="w-4 h-4" />}
            >
              Save Changes
            </Button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
};
