import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from '@/components/templates/DashboardLayout';
import { Badge } from '@/components/atoms/Badge';
import { Button } from '@/components/atoms/Button';
import { useAuthStore } from '@/store/authStore';
import { useThemeStore } from '@/store/themeStore';
import { useTranslation } from '@/lib/i18n';
import {
  ShieldAlert,
  Users,
  Scale,
  DollarSign,
  Truck,
  FileText,
  FileCheck,
  Building,
  MapPin,
  Clock,
  Snowflake,
  Plus,
} from 'lucide-react';
import toast from 'react-hot-toast';

export const LogisticsPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const { isDark, toggleTheme, language, setLanguage } = useThemeStore();
  const { t } = useTranslation();

  const [activeTab, setActiveTab] = useState<'dcs' | 'hubs'>('dcs');

  const dcs = [
    {
      id: 'DC-01',
      name: 'Dambulla Regional Distribution Center',
      location: 'Dambulla Dedicated Economic Centre, Central Province',
      manager: 'Sunil Weerasinghe (+94 66 228 4920)',
      operatingHours: '24/7 Receiving & Cold Storage',
      coldCapacity: '50 Metric Tons',
      linkedHubsCount: 8,
      status: 'Active',
    },
    {
      id: 'DC-02',
      name: 'Meegoda Distribution Center',
      location: 'Meegoda Dedicated Economic Center, Western Province',
      manager: 'Chaminda Silva (+94 11 289 1048)',
      operatingHours: '04:00 AM – 10:00 PM',
      coldCapacity: '35 Metric Tons',
      linkedHubsCount: 5,
      status: 'Active',
    },
    {
      id: 'DC-03',
      name: 'Matara Distribution Center',
      location: 'Matara Southern Expressway Logistics Zone, Southern Province',
      manager: 'Priyantha De Silva (+94 41 223 9048)',
      operatingHours: '05:00 AM – 09:00 PM',
      coldCapacity: '25 Metric Tons',
      linkedHubsCount: 4,
      status: 'Active',
    },
    {
      id: 'DC-04',
      name: 'Anuradhapura Distribution Center',
      location: 'New Town Commercial Complex, North Central Province',
      manager: 'Gamini Ratnayake (+94 25 222 1948)',
      operatingHours: '05:00 AM – 08:00 PM',
      coldCapacity: '30 Metric Tons',
      linkedHubsCount: 6,
      status: 'Active',
    },
  ];

  const hubs = [
    {
      id: 'HUB-01',
      name: 'Keppetipola Village Hub #2',
      village: 'Keppetipola, Badulla District',
      linkedDc: 'Dambulla DC',
      schedule: 'Tue & Fri (06:00 AM – 09:30 AM)',
      leg1Partner: 'N.S. Kumara (CAB-1234)',
      status: 'Active',
    },
    {
      id: 'HUB-02',
      name: 'Kandapola Collection Point',
      village: 'Kandapola, Nuwara Eliya District',
      linkedDc: 'Dambulla DC',
      schedule: 'Mon & Thu (06:00 AM – 09:00 AM)',
      leg1Partner: 'J.A. Premadasa (WP DA-4819)',
      status: 'Active',
    },
  ];

  const navItems = [
    { id: 'dashboard', label: 'Command Center', icon: <ShieldAlert className="w-5 h-5" />, path: '/admin/dashboard' },
    { id: 'kyc', label: 'KYC Verifications', icon: <Users className="w-5 h-5" />, path: '/admin/kyc' },
    { id: 'payouts', label: 'LankaPay Payouts', icon: <DollarSign className="w-5 h-5" />, path: '/admin/payouts' },
    { id: 'disputes', label: 'Disputes Desk', icon: <Scale className="w-5 h-5" />, path: '/admin/disputes' },
    { id: 'logistics', label: 'Logistics Config', icon: <Truck className="w-5 h-5" />, path: '/admin/hubs' },
    { id: 'audit', label: 'Audit Trail', icon: <FileCheck className="w-5 h-5" />, path: '/admin/audit' },
    { id: 'reports', label: 'Reports Studio', icon: <FileText className="w-5 h-5" />, path: '/admin/reports' },
  ];

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
            <h1 className="text-2xl font-black text-slate-900 dark:text-slate-100">
              Logistics & Distribution Network
            </h1>
            <p className="text-xs text-slate-400">
              Configure 4 Regional Distribution Centers, Village Intake Hubs & Transport Schedules
            </p>
          </div>

          <div className="flex items-center gap-2">
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

        {activeTab === 'dcs' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {dcs.map((dc) => (
              <div
                key={dc.id}
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
                        {dc.location}
                      </p>
                    </div>
                  </div>

                  <Badge variant="emerald" size="sm">{dc.status}</Badge>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs">
                  <div>
                    <span className="text-slate-400 block text-[11px]">Cold Storage Capacity</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1">
                      <Snowflake className="w-3.5 h-3.5 text-sky-500" />
                      {dc.coldCapacity}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Operating Hours</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">{dc.operatingHours}</span>
                  </div>
                </div>

                <div className="text-xs text-slate-500 pt-1">
                  Manager: <strong>{dc.manager}</strong>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {hubs.map((hub) => (
              <div
                key={hub.id}
                className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-extrabold text-slate-900 dark:text-slate-100 text-base">
                      {hub.name}
                    </h4>
                    <p className="text-xs text-slate-400">{hub.village} ──► {hub.linkedDc}</p>
                  </div>
                  <Badge variant="emerald" size="sm">{hub.status}</Badge>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs">
                  <div>
                    <span className="text-slate-400 block text-[11px]">Intake Window</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">{hub.schedule}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Leg-1 Carrier</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">{hub.leg1Partner}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};
