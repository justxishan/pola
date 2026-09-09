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
import { DISTRICTS } from '@pola/shared';
import { ArrowLeft, User, Building, ShieldCheck, Save, MapPin, Home, Camera, Clock, ShieldAlert } from 'lucide-react';
import { DeleteAccountModal } from '@/components/organisms/DeleteAccountModal';
import toast from 'react-hot-toast';

export const EditProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const { user, updateUser, logout } = useAuthStore();
  const { isDark, toggleTheme, language, setLanguage } = useThemeStore();
  const { t } = useTranslation();

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const [fullName, setFullName] = useState(user?.fullName || '');
  const [username, setUsername] = useState(user?.username || '');
  const [usernameError, setUsernameError] = useState('');
  const [avatarPreview, setAvatarPreview] = useState(user?.avatarUrl || '');
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const [phone, setPhone] = useState(user?.phone || '');
  const [dob, setDob] = useState<string>(
    (user as any)?.dateOfBirth
      ? new Date((user as any).dateOfBirth).toISOString().split('T')[0]
      : ''
  );
  const [addressLine1, setAddressLine1] = useState(
    user?.addresses?.[0]?.addressLine1 || ''
  );
  const [city, setCity] = useState(user?.addresses?.[0]?.city || '');
  const [district, setDistrict] = useState(
    user?.addresses?.[0]?.district || 'Colombo'
  );
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

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file (JPG, PNG, WEBP)');
      return;
    }

    try {
      setIsUploadingAvatar(true);
      const localUrl = URL.createObjectURL(file);
      setAvatarPreview(localUrl);

      const formData = new FormData();
      formData.append('avatar', file);

      const res: any = await AuthService.uploadAvatar(formData);
      if (res.success && res.data?.avatarUrl) {
        updateUser({ avatarUrl: res.data.avatarUrl });
        toast.success('Profile picture updated successfully!');
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || err.message || 'Failed to upload profile picture');
      setAvatarPreview(user?.avatarUrl || '');
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  const handleUsernameChange = (val: string) => {
    const clean = val.toLowerCase().replace(/[^a-z_.]/g, '');
    setUsername(clean);
    if (val && !/^[a-z_.]+$/.test(val)) {
      setUsernameError('Only simple lowercase letters, underscore (_), and full stop (.) allowed');
    } else if (clean && clean.length < 3) {
      setUsernameError('Username must be at least 3 characters');
    } else {
      setUsernameError('');
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (username) {
        if (!/^[a-z_.]+$/.test(username)) {
          toast.error('Username can only contain simple letters, underscore (_), and full stop (.)');
          return;
        }
        if (username.length < 3) {
          toast.error('Username must be at least 3 characters');
          return;
        }
      }

      setIsSaving(true);
      const updates: any = {
        fullName,
        username: username || undefined,
        phone,
        preferredLanguage: preferredLang,
        themePreference: themePref,
      };

      if (dob) {
        updates.dateOfBirth = dob;
      }

      if (addressLine1 || city || district) {
        updates.addresses = [
          {
            label: 'Primary Address',
            addressLine1,
            city,
            district,
            province: 'Western',
            isDefault: true,
          },
        ];
      }

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

        toast.success('Profile updated successfully');
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
            Edit Account Profile & Settings
          </h1>
          <p className="text-xs text-slate-400">
            Update your personal contact information, date of birth, primary address, and preferences
          </p>
        </div>

        {/* KYC Status Banner */}
        <div className="p-4 sm:p-5 rounded-3xl bg-slate-50 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            {user?.kycStatus === 'verified' ? (
              <div className="p-2.5 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                <ShieldCheck className="w-5 h-5" />
              </div>
            ) : user?.kycStatus === 'pending' ? (
              <div className="p-2.5 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                <Clock className="w-5 h-5" />
              </div>
            ) : (
              <div className="p-2.5 rounded-2xl bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                <ShieldAlert className="w-5 h-5" />
              </div>
            )}
            <div>
              <div className="flex items-center gap-2">
                <h4 className="font-bold text-xs text-slate-900 dark:text-slate-100">
                  Verification Status
                </h4>
                <Badge
                  variant={
                    user?.kycStatus === 'verified'
                      ? 'emerald'
                      : user?.kycStatus === 'pending'
                      ? 'amber'
                      : 'secondary'
                  }
                  size="sm"
                >
                  {user?.kycStatus === 'verified'
                    ? 'Verified'
                    : user?.kycStatus === 'pending'
                    ? 'Docs Sent — Verification Pending'
                    : 'Unverified'}
                </Badge>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                {user?.kycStatus === 'verified'
                  ? 'Your national identity and business credentials have been officially verified.'
                  : user?.kycStatus === 'pending'
                  ? 'Your verification documents have been received and are currently under review by Pola administrators.'
                  : 'Submit your NIC or business registration to activate verified trader badges.'}
              </p>
            </div>
          </div>

          {user?.kycStatus !== 'verified' && user?.kycStatus !== 'pending' && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => navigate('/auth/kyc')}
              className="shrink-0 text-xs text-amber-600 border-amber-400/30"
            >
              Verify Now
            </Button>
          )}
        </div>

        <form onSubmit={handleSave} className="space-y-6">
          {/* Profile Picture Card */}
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
              <Camera className="w-4 h-4 text-emerald-600" />
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                Profile Picture
              </h3>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-6">
              <div className="relative w-24 h-24 rounded-full overflow-hidden border-2 border-emerald-500/30 bg-slate-100 dark:bg-slate-800 shrink-0 shadow-md">
                {avatarPreview ? (
                  <img
                    src={avatarPreview}
                    alt="Profile preview"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center font-bold text-2xl text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40">
                    {(username?.[0] || fullName?.[0] || 'U').toUpperCase()}
                  </div>
                )}
                {isUploadingAvatar && (
                  <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                    <span className="text-[10px] text-white font-bold animate-pulse">Uploading...</span>
                  </div>
                )}
              </div>

              <div className="space-y-2 text-center sm:text-left">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                  onChange={handleAvatarChange}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                  isLoading={isUploadingAvatar}
                  leftIcon={<Camera className="w-4 h-4" />}
                >
                  Change Profile Photo
                </Button>
                <p className="text-[11px] text-slate-400">
                  Select a JPG, PNG, or WEBP picture (Max 10MB).
                </p>
              </div>
            </div>
          </div>

          {/* Personal Info Card */}
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
              <User className="w-4 h-4 text-emerald-600" />
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                Personal Information
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Input
                  label="Username (Publicly Visible)"
                  placeholder="e.g. dilmina.ishan"
                  value={username}
                  onChange={(e) => handleUsernameChange(e.target.value)}
                  error={usernameError}
                  helperText="Visible to other users. Only lowercase letters, underscore (_), and full stop (.)"
                  required
                />
              </div>

              <Input
                label="Full Name (Private)"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                helperText="Personal name, visible only to you and administrators"
                required
              />

              <Input
                label="Email Address"
                value={user?.email || ''}
                disabled
                helperText="Email address cannot be changed directly"
              />

              <Input
                label="Date of Birth"
                type="date"
                value={dob}
                onChange={(e) => setDob(e.target.value)}
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

          {/* Primary Address Card */}
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
              <Home className="w-4 h-4 text-emerald-600" />
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                Delivery & Residential Address
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <Input
                  label="Street Address / Premises"
                  placeholder="e.g. No. 45, Temple Road"
                  value={addressLine1}
                  onChange={(e) => setAddressLine1(e.target.value)}
                />
              </div>

              <Input
                label="City / Town"
                placeholder="e.g. Nugegoda"
                value={city}
                onChange={(e) => setCity(e.target.value)}
              />

              <Select
                label="District"
                value={district}
                onChange={(e) => setDistrict(e.target.value)}
              >
                {DISTRICTS.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
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

          {/* Bank Accounts Card (Separate Management) */}
          {(isFarmer || isDelivery) && (
            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <Building className="w-4 h-4 text-emerald-600" />
                  <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                    Payout Bank Accounts
                  </h3>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => navigate('/wallet')}
                  className="text-xs text-emerald-600 dark:text-emerald-400 border-emerald-500/30"
                >
                  Manage in Wallet &rarr;
                </Button>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Your settlement bank accounts are managed directly inside your <strong>Earnings & Wallet</strong> section. You can register multiple accounts, set a primary payout destination, and securely update bank details.
              </p>
            </div>
          )}

          {/* Danger Zone */}
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-rose-200 dark:border-rose-900/50 shadow-xs space-y-3">
            <h3 className="text-sm font-bold text-rose-600 dark:text-rose-400">Danger Zone</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Deleting your account will delist all your crop listings and sign you out immediately.
            </p>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsDeleteModalOpen(true)}
              className="text-rose-600 border-rose-300 dark:border-rose-800"
            >
              Delete My Account
            </Button>
          </div>

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

      <DeleteAccountModal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} />
    </DashboardLayout>
  );
};
