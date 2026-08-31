import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from '@/components/templates/DashboardLayout';
import { FarmCard } from '@/components/molecules/FarmCard';
import { Spinner } from '@/components/atoms/Spinner';
import { FarmService } from '@/services/farm.service';
import { useAuthStore } from '@/store/authStore';
import { useThemeStore } from '@/store/themeStore';
import { useTranslation } from '@/lib/i18n';
import { LayoutDashboard, Sprout, Package, Wallet, ShoppingBag, Plus, Scale } from 'lucide-react';
import toast from 'react-hot-toast';

export const MyFarmsPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const { isDark, toggleTheme, language, setLanguage } = useThemeStore();
  const { t } = useTranslation();

  const [farms, setFarms] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const navItems = [
    { id: 'dashboard', label: t.dashboard, icon: <LayoutDashboard className="w-5 h-5" />, path: '/farmer/dashboard' },
    { id: 'farms', label: t.myFarms, icon: <Sprout className="w-5 h-5" />, path: '/farmer/farms' },
    { id: 'products', label: t.cropListings, icon: <Package className="w-5 h-5" />, path: '/farmer/products' },
    { id: 'orders', label: t.farmOrders, icon: <ShoppingBag className="w-5 h-5" />, path: '/farmer/orders' },
    { id: 'hubs', label: t.hubDropoffs, icon: <Scale className="w-5 h-5" />, path: '/farmer/hubs' },
    { id: 'wallet', label: t.earningsWallet, icon: <Wallet className="w-5 h-5" />, path: '/wallet' },
  ];

  useEffect(() => {
    fetchFarms();
  }, []);

  const fetchFarms = async () => {
    try {
      setIsLoading(true);
      const res: any = await FarmService.getMyFarms();
      if (res.success && res.data) {
        setFarms(res.data.farms || []);
      }
    } catch (err: any) {
      toast.error('Failed to load farms');
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleActive = async (farm: any) => {
    try {
      const nextStatus = !farm.isActive;
      await FarmService.updateFarm(farm._id, { isActive: nextStatus });
      toast.success(`Farm ${nextStatus ? 'activated' : 'deactivated'}`);
      fetchFarms();
    } catch (err: any) {
      toast.error('Failed to toggle farm status');
    }
  };

  return (
    <DashboardLayout
      portalTitle={t.farmerOpsCenter}
      portalRole={user?.role || 'Farmer'}
      navItems={navItems}
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
      <div className="space-y-8 text-left">
        {/* Header with Dual-Font Typography */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
          <div className="space-y-1">
            <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
              Registered Agricultural Parcels &{' '}
              <span className="font-serif-accent italic font-normal text-lime-300">
                Land Holdings
              </span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-300">
              Manage your verified cultivation plots, GPS coordinates, and organic PGS certifications
            </p>
          </div>

          <button
            onClick={() => navigate('/farmer/farms/new')}
            className="px-6 py-3 rounded-full bg-lime-400 hover:bg-lime-300 text-slate-950 font-black text-xs flex items-center gap-2 shadow-lg shadow-lime-500/25 transition-all cursor-pointer shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Register New Farm Plot</span>
          </button>
        </div>

        {/* Farm Cards Grid */}
        {isLoading ? (
          <div className="py-24 flex flex-col items-center justify-center space-y-2">
            <Spinner size="lg" />
            <span className="text-xs font-mono text-slate-400">Loading agrarian parcels...</span>
          </div>
        ) : farms.length === 0 ? (
          <div className="glass-terminal p-12 rounded-3xl border border-white/10 text-center space-y-4">
            <div className="w-14 h-14 rounded-3xl bg-lime-500/20 text-lime-300 border border-lime-500/30 flex items-center justify-center mx-auto">
              <Sprout className="w-7 h-7" />
            </div>
            <h3 className="text-xl font-black text-white">No Farm Parcels Registered Yet</h3>
            <p className="text-xs text-slate-300 max-w-sm mx-auto">
              Register your cultivation land plots to begin listing fresh harvest lots on the national marketplace.
            </p>
            <button
              onClick={() => navigate('/farmer/farms/new')}
              className="px-6 py-3 rounded-full bg-lime-400 text-slate-950 font-black text-xs cursor-pointer shadow-lg shadow-lime-500/20"
            >
              Register First Farm Plot
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {farms.map((farm) => (
              <FarmCard
                key={farm._id}
                id={farm._id}
                farmName={farm.name}
                province={farm.location?.province || farm.province || 'Central'}
                district={farm.location?.district || farm.district || 'Nuwara Eliya'}
                nearestVillage={farm.location?.city || farm.city}
                landExtentAcres={farm.totalAreaAcres || farm.landExtentAcres || 2.5}
                ownershipType={farm.ownershipType || 'freehold'}
                irrigationSource={farm.irrigationSource || 'rainfed'}
                isOrganicCertified={farm.isOrganicCertified}
                isActive={farm.isActive}
                onToggleActive={() => handleToggleActive(farm)}
                onViewListings={() => navigate('/farmer/products')}
              />
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};
