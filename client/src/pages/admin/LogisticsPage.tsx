import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from '@/components/templates/DashboardLayout';
import { Badge } from '@/components/atoms/Badge';
import { Button } from '@/components/atoms/Button';
import { Input } from '@/components/atoms/Input';
import { Select } from '@/components/atoms/Select';
import { Spinner } from '@/components/atoms/Spinner';
import { useAuthStore } from '@/store/authStore';
import { useThemeStore } from '@/store/themeStore';
import { useTranslation } from '@/lib/i18n';
import { getAdminNavItems } from '@/lib/navItems';
import { api } from '@/services/api';
import { HubService } from '@/services/hub.service';
import {
  Building,
  MapPin,
  Clock,
  Snowflake,
  Wrench,
  X,
  Phone,
  CheckCircle2,
} from 'lucide-react';
import toast from 'react-hot-toast';

export const LogisticsPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const { isDark, toggleTheme, language, setLanguage } = useThemeStore();
  const { t } = useTranslation();

  const [activeTab, setActiveTab] = useState<'dcs' | 'hubs'>('dcs');
  const [dcs, setDcs] = useState<any[]>([]);
  const [hubs, setHubs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Stuck Order Override Modal
  const [isOverrideOpen, setIsOverrideOpen] = useState(false);
  const [overrideOrderId, setOverrideOrderId] = useState('');
  const [overrideStatus, setOverrideStatus] = useState('received_at_dc');
  const [overrideReason, setOverrideReason] = useState('');
  const [isOverriding, setIsOverriding] = useState(false);

  const navItems = getAdminNavItems();

  useEffect(() => {
    fetchNetworkData();
  }, []);

  const fetchNetworkData = async () => {
    try {
      setIsLoading(true);
      const [dcRes, hubRes]: any[] = await Promise.all([
        api.get('/distribution-centers').catch(() => ({ data: { centers: [] } })),
        api.get('/hubs').catch(() => ({ data: { hubs: [] } })),
      ]);

      if (dcRes.data?.centers?.length) {
        setDcs(dcRes.data.centers);
      } else {
        // Fallback default network representation
        setDcs([
          {
            _id: 'DC-01',
            name: 'Dambulla Regional Distribution Center',
            addressLine: 'Dambulla Dedicated Economic Centre',
            district: 'Central Province',
            contactPhone: '+94 66 228 4920',
            operatingHours: '24/7 Receiving & Cold Storage',
            capacityMetricTons: 50,
            hasColdStorage: true,
            isActive: true,
          },
          {
            _id: 'DC-02',
            name: 'Meegoda Distribution Center',
            addressLine: 'Meegoda Dedicated Economic Center',
            district: 'Western Province',
            contactPhone: '+94 11 289 1048',
            operatingHours: '04:00 AM – 10:00 PM',
            capacityMetricTons: 35,
            hasColdStorage: true,
            isActive: true,
          },
        ]);
      }

      if (hubRes.data?.hubs?.length) {
        setHubs(hubRes.data.hubs);
      } else {
        setHubs([
          {
            _id: 'HUB-01',
            hubName: 'Keppetipola Village Hub #2',
            addressLine: 'Keppetipola',
            district: 'Badulla',
            linkedDcId: { name: 'Dambulla Regional Distribution Center' },
            operatingHours: '06:00 AM – 09:30 AM',
            isActive: true,
          },
          {
            _id: 'HUB-02',
            hubName: 'Kandapola Collection Point',
            addressLine: 'Kandapola',
            district: 'Nuwara Eliya',
            linkedDcId: { name: 'Dambulla Regional Distribution Center' },
            operatingHours: '06:00 AM – 09:00 AM',
            isActive: true,
          },
        ]);
      }
    } catch {
      toast.error('Failed to load logistics network');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOverrideStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!overrideOrderId.trim()) {
      toast.error('Please enter the Order ID');
      return;
    }
    try {
      setIsOverriding(true);
      const res: any = await HubService.adminOverrideStatus(
        overrideOrderId.trim(),
        overrideStatus,
        overrideReason.trim() || 'Logistics Admin manual status transition'
      );
      if (res.success) {
        toast.success(`Order #${res.data?.order?.orderNumber || overrideOrderId} updated to ${overrideStatus}`);
        setIsOverrideOpen(false);
        setOverrideOrderId('');
        setOverrideReason('');
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || err.message || 'Failed to override order status');
    } finally {
      setIsOverriding(false);
    }
  };

  return (
    <DashboardLayout
      portalTitle={t.executiveCommandCenter}
      portalRole={user?.role || 'Operations Admin'}
      navItems={navItems}
      activePath="/admin/hubs"
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
      <div className="space-y-6 max-w-6xl mx-auto">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Building className="w-6 h-6 text-emerald-600" />
              Logistics &amp; Distribution Network
            </h1>
            <p className="text-xs text-slate-400">
              Configure Regional Distribution Centers, Village Intake Hubs &amp; Manage Transit Exceptions
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsOverrideOpen(true)}
              className="border-amber-500/50 text-amber-700 dark:text-amber-300 hover:bg-amber-50 dark:hover:bg-amber-950/40"
              leftIcon={<Wrench className="w-4 h-4" />}
            >
              Stuck Order Override
            </Button>
            <Button
              variant={activeTab === 'dcs' ? 'primary' : 'outline'}
              size="sm"
              onClick={() => setActiveTab('dcs')}
              className={activeTab === 'dcs' ? 'bg-emerald-600' : ''}
            >
              Distribution Centers ({dcs.length})
            </Button>
            <Button
              variant={activeTab === 'hubs' ? 'primary' : 'outline'}
              size="sm"
              onClick={() => setActiveTab('hubs')}
              className={activeTab === 'hubs' ? 'bg-emerald-600' : ''}
            >
              Village Hubs ({hubs.length})
            </Button>
          </div>
        </div>

        {isLoading ? (
          <div className="py-20 flex justify-center">
            <Spinner size="lg" />
          </div>
        ) : activeTab === 'dcs' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {dcs.map((dc) => (
              <div
                key={dc._id || dc.id}
                className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-300">
                      <Building className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="font-extrabold text-slate-900 dark:text-slate-100 text-base">
                        {dc.name}
                      </h4>
                      <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                        {dc.addressLine || dc.city}, {dc.district}
                      </p>
                    </div>
                  </div>

                  <Badge variant={dc.isActive !== false ? 'emerald' : 'amber'} size="sm">
                    {dc.isActive !== false ? 'Active' : 'Inactive'}
                  </Badge>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs">
                  <div>
                    <span className="text-slate-400 block text-[11px]">Cold Storage Capacity</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1">
                      <Snowflake className="w-3.5 h-3.5 text-sky-500" />
                      {dc.capacityMetricTons || 50} Metric Tons
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Operating Hours</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">
                      {dc.operatingHours || '24/7 Cold Chain'}
                    </span>
                  </div>
                </div>

                {dc.contactPhone && (
                  <div className="text-xs text-slate-500 flex items-center gap-1.5 pt-1">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    <span>Contact: <strong>{dc.contactPhone}</strong></span>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {hubs.map((hub) => (
              <div
                key={hub._id || hub.id}
                className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-extrabold text-slate-900 dark:text-slate-100 text-base">
                      {hub.hubName || hub.name}
                    </h4>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {hub.district} District ──► {hub.linkedDcId?.name || 'Regional DC'}
                    </p>
                  </div>
                  <Badge variant={hub.isActive !== false ? 'emerald' : 'amber'} size="sm">
                    {hub.isActive !== false ? 'Active' : 'Inactive'}
                  </Badge>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs">
                  <div>
                    <span className="text-slate-400 block text-[11px]">Address</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">
                      {hub.addressLine || hub.city || hub.district}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Operating Hours</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">
                      {hub.operatingHours || '06:00 AM – 10:00 AM'}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Stuck Order Override Modal */}
        {isOverrideOpen && (
          <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
            <div
              className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs"
              onClick={() => setIsOverrideOpen(false)}
            />
            <div className="relative w-full max-w-md rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl p-6 sm:p-8 space-y-6 animate-in zoom-in-95">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-extrabold text-slate-900 dark:text-slate-100 text-lg flex items-center gap-2">
                    <Wrench className="w-5 h-5 text-amber-500" />
                    Stuck Order Admin Override
                  </h3>
                  <p className="text-xs text-slate-400">
                    Manually unblock or transition orders stuck in Leg-1 or DC intake
                  </p>
                </div>
                <button
                  onClick={() => setIsOverrideOpen(false)}
                  className="p-1 text-slate-400 hover:bg-slate-100 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleOverrideStatus} className="space-y-4">
                <Input
                  label="Order ID / MongoDB _id"
                  placeholder="e.g. 64b8f... or paste order ID"
                  value={overrideOrderId}
                  onChange={(e) => setOverrideOrderId(e.target.value)}
                  required
                />

                <Select
                  label="Target Status"
                  value={overrideStatus}
                  onChange={(e) => setOverrideStatus(e.target.value)}
                  options={[
                    { value: 'awaiting_hub_collection', label: 'Awaiting Hub Collection' },
                    { value: 'collected_at_hub', label: 'Collected at Hub' },
                    { value: 'in_transit_to_dc', label: 'In Transit to DC' },
                    { value: 'received_at_dc', label: 'Received at DC (DC Intake Ready)' },
                    { value: 'assigned_for_delivery', label: 'Assigned for Courier Delivery' },
                    { value: 'returned', label: 'Returned (Transit Exception)' },
                  ]}
                />

                <Input
                  label="Override Reason / Audit Note"
                  placeholder="e.g. Truck breakdown, driver reassigned"
                  value={overrideReason}
                  onChange={(e) => setOverrideReason(e.target.value)}
                  required
                />

                <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                  <Button
                    variant="outline"
                    size="sm"
                    type="button"
                    onClick={() => setIsOverrideOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="primary"
                    size="sm"
                    type="submit"
                    isLoading={isOverriding}
                    className="bg-amber-600 hover:bg-amber-700"
                  >
                    Apply Status Override
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
