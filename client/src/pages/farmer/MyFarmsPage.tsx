import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from '@/components/templates/DashboardLayout';
import { FarmCard } from '@/components/molecules/FarmCard';
import { FarmDetailModal } from '@/components/organisms/FarmDetailModal';
import { EditFarmModal } from '@/components/organisms/EditFarmModal';
import { ConfirmDialog } from '@/components/molecules/ConfirmDialog';
import { Spinner } from '@/components/atoms/Spinner';
import { FarmService } from '@/services/farm.service';
import { useAuthStore } from '@/store/authStore';
import { useThemeStore } from '@/store/themeStore';
import { useTranslation } from '@/lib/i18n';
import { getFarmerNavItems } from '@/lib/navItems';
import { Plus, Sprout } from 'lucide-react';
import toast from 'react-hot-toast';

export const MyFarmsPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const { isDark, toggleTheme, language, setLanguage } = useThemeStore();
  const { t } = useTranslation();

  const [farms, setFarms] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);

  const [selectedFarm, setSelectedFarm] = useState<any | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  const [editFarm, setEditFarm] = useState<any | null>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);

  const [confirmAction, setConfirmAction] = useState<{ type: 'deactivate' | 'delete'; farm: any } | null>(null);

  const navItems = getFarmerNavItems(t);

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

  const openDetails = (farm: any) => {
    setSelectedFarm(farm);
    setIsDetailOpen(true);
  };

  const closeDetails = () => {
    setIsDetailOpen(false);
    setSelectedFarm(null);
  };

  const handleEdit = (farm: any) => {
    setIsDetailOpen(false);
    setEditFarm(farm);
    setIsEditOpen(true);
  };

  const handleReactivate = async (farm: any) => {
    try {
      setProcessingId(farm._id);
      await FarmService.reactivateFarm(farm._id);
      toast.success(`Farm "${farm.farmName}" reactivated`);
      closeDetails();
      fetchFarms();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to reactivate farm');
    } finally {
      setProcessingId(null);
    }
  };

  const executeConfirmedAction = async () => {
    if (!confirmAction) return;
    const { type, farm } = confirmAction;
    try {
      setProcessingId(farm._id);
      if (type === 'deactivate') {
        await FarmService.deactivateFarm(farm._id);
        toast.success(`Farm "${farm.farmName}" deactivated`);
      } else {
        await FarmService.deleteFarm(farm._id);
        toast.success(`Farm "${farm.farmName}" deleted`);
      }
      closeDetails();
      fetchFarms();
    } catch (err: any) {
      toast.error(err.response?.data?.message || `Failed to ${type} farm`);
    } finally {
      setProcessingId(null);
      setConfirmAction(null);
    }
  };

  return (
    <DashboardLayout
      portalTitle={t.farmerOpsCenter || 'Farmer Portal'}
      portalRole={user?.role || 'Farmer'}
      navItems={navItems}
      mobileNavItems={navItems.map((item) => ({ id: item.id, label: item.label, icon: item.icon, path: item.path }))}
      activePath="/farmer/farms"
      onNavigate={(path) => navigate(path)}
      currentLanguage={language}
      onLanguageChange={setLanguage}
      isDark={isDark}
      onToggleTheme={toggleTheme}
      user={user || undefined}
      onLogout={() => { logout(); navigate('/'); }}
    >
      <div className="space-y-8 text-left">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
          <div className="space-y-1">
            <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">My Farms</h1>
            <p className="text-xs sm:text-sm text-slate-300">
              Manage your verified cultivation plots, GPS coordinates, and organic PGS certifications
            </p>
          </div>
          {farms.length > 0 && (
            <button
              onClick={() => navigate('/farmer/farms/new')}
              className="px-6 py-3 rounded-full bg-lime-400 hover:bg-lime-300 text-slate-950 font-black text-xs flex items-center gap-2 shadow-lg shadow-lime-500/25 transition-all cursor-pointer shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>Register New Farm Plot</span>
            </button>
          )}
        </div>

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
              <div key={farm._id} className={farm.isActive === false ? 'opacity-60' : ''}>
                <FarmCard
                  id={farm._id}
                  farmName={farm.farmName || 'Unnamed Farm'}
                  province={farm.province || 'Central'}
                  district={farm.district || 'Matale'}
                  nearestVillage={farm.city || farm.addressLine || 'Village Hub Zone'}
                  landExtentAcres={farm.extentValue ?? 2.5}
                  ownershipType={farm.ownershipType || 'owned'}
                  irrigationSource={farm.irrigationType || 'well'}
                  isOrganicCertified={farm.isOrganicCertified}
                  isActive={farm.isActive ?? true}
                  verificationStatus={farm.verificationStatus}
                  onOpenDetails={() => openDetails(farm)}
                  onViewListings={() => navigate(`/farmer/products?farmId=${farm._id}`)}
                />
              </div>
            ))}
          </div>
        )}
      </div>

      <FarmDetailModal
        farm={selectedFarm}
        isOpen={isDetailOpen}
        isProcessing={!!processingId}
        onClose={closeDetails}
        onEdit={handleEdit}
        onDeactivate={(farm) => setConfirmAction({ type: 'deactivate', farm })}
        onReactivate={handleReactivate}
        onDelete={(farm) => setConfirmAction({ type: 'delete', farm })}
      />

      <EditFarmModal
        farm={editFarm}
        isOpen={isEditOpen}
        onClose={() => { setIsEditOpen(false); setEditFarm(null); }}
        onSuccess={fetchFarms}
      />

      <ConfirmDialog
        isOpen={!!confirmAction}
        title={confirmAction?.type === 'delete' ? 'Delete Farm Permanently' : 'Deactivate Farm Parcel'}
        description={
          confirmAction?.type === 'delete'
            ? `Permanently delete "${confirmAction?.farm?.farmName}"? This only works if the farm has no crop listing history.`
            : `Are you sure you want to deactivate "${confirmAction?.farm?.farmName}"? Its crop listings will be hidden from the marketplace but kept on record, not deleted.`
        }
        confirmText={confirmAction?.type === 'delete' ? 'Delete' : 'Deactivate'}
        cancelText="Cancel"
        isDestructive
        isLoading={!!processingId}
        onConfirm={executeConfirmedAction}
        onCancel={() => setConfirmAction(null)}
      />
    </DashboardLayout>
  );
};
