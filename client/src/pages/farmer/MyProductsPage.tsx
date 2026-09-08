import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { DashboardLayout } from '@/components/templates/DashboardLayout';
import { Spinner } from '@/components/atoms/Spinner';
import { ConfirmDialog } from '@/components/molecules/ConfirmDialog';
import { ProductService } from '@/services/product.service';
import { useAuthStore } from '@/store/authStore';
import { useThemeStore } from '@/store/themeStore';
import { useTranslation } from '@/lib/i18n';
import { getFarmerNavItems } from '@/lib/navItems';
import {
  Plus,
  Edit,
  Trash2,
  Power,
  Package,
  X,
  FileText,
} from 'lucide-react';
import { cn } from '@/lib/cn';
import toast from 'react-hot-toast';

export const MyProductsPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const farmId = searchParams.get('farmId');

  const { user, logout } = useAuthStore();
  const { isDark, toggleTheme, language, setLanguage } = useThemeStore();
  const { t } = useTranslation();

  const [products, setProducts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'draft'>('all');
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<any | null>(null);

  const totalCount = products.length;
  const activeCount = products.filter(
    (p) => p.status === 'active' || (p.isActive && p.status !== 'draft')
  ).length;
  const draftCount = products.filter((p) => p.status === 'draft').length;

  const filteredProducts = products.filter((p) => {
    if (statusFilter === 'active') {
      return p.status === 'active' || (p.isActive && p.status !== 'draft');
    }
    if (statusFilter === 'draft') {
      return p.status === 'draft';
    }
    return true;
  });

  const navItems = getFarmerNavItems(t);

  useEffect(() => {
    fetchProducts();
  }, [farmId]);

  const fetchProducts = async () => {
    try {
      setIsLoading(true);
      const res: any = await ProductService.getMyProducts(farmId ? { farmId } : undefined);
      if (res.success && res.data) {
        setProducts(res.data.products || []);
      }
    } catch (err: any) {
      toast.error('Failed to load listings');
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleActive = async (product: any) => {
    try {
      const isCurrentlyActive = product.status === 'active';
      const nextStatus = isCurrentlyActive ? 'delisted' : 'active';
      const res: any = await ProductService.updateProduct(product._id, { status: nextStatus });
      const updated = res?.data?.product;

      if (!isCurrentlyActive && updated?.status === 'pending_verification') {
        toast.error('This listing needs your farm and your own KYC to both be verified by Pola admin before it can go live.');
      } else {
        toast.success(nextStatus === 'active' ? 'Listing is now live on the marketplace' : 'Listing deactivated');
      }
      fetchProducts();
    } catch (err: any) {
      toast.error(err.response?.data?.message || err.message || 'Failed to update listing status');
    }
  };

  const handleDeleteClick = (product: any) => {
    setProductToDelete(product);
    setIsConfirmOpen(true);
  };

  const executeDelete = async (id: string) => {
    try {
      await ProductService.deleteProduct(id);
      toast.success('Listing deleted');
      fetchProducts();
    } catch (err: any) {
      toast.error('Failed to delete listing');
    } finally {
      setIsConfirmOpen(false);
      setProductToDelete(null);
    }
  };

  return (
    <DashboardLayout
      portalTitle={t.farmerOpsCenter || 'Farmer Portal'}
      portalRole={user?.role || 'Farmer'}
      navItems={navItems}
      mobileNavItems={navItems.map((item) => ({
        id: item.id,
        label: item.label,
        icon: item.icon,
        path: item.path,
      }))}
      activePath="/farmer/products"
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
              Crop Listings
            </h1>
            <p className="text-xs sm:text-sm text-slate-300">
              Manage your active agricultural listings, tiered wholesale rates, and inventory levels
            </p>
          </div>

          <button
            onClick={() => navigate('/farmer/products/new')}
            className="px-6 py-3 rounded-full bg-lime-400 hover:bg-lime-300 text-slate-950 font-black text-xs flex items-center gap-2 shadow-lg shadow-lime-500/25 transition-all cursor-pointer shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>List New Crop Harvest</span>
          </button>
        </div>

        {/* Farm Filter Tag */}
        {farmId && (
          <div className="flex items-center gap-2 text-xs bg-lime-400/10 text-lime-300 px-4 py-2 rounded-2xl border border-lime-400/20 w-fit">
            <span>Filtered by Farm Plot</span>
            <button
              onClick={() => setSearchParams({})}
              className="p-1 hover:bg-lime-400/20 rounded-full cursor-pointer"
              title="Clear Filter"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Status Filter Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 border-b border-white/5">
          <button
            onClick={() => setStatusFilter('all')}
            className={cn(
              'px-4 py-2 rounded-full text-xs font-bold transition-all cursor-pointer flex items-center gap-2 shrink-0',
              statusFilter === 'all'
                ? 'bg-lime-400 text-slate-950 shadow-md shadow-lime-500/20'
                : 'bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10'
            )}
          >
            <span>All Lots</span>
            <span
              className={cn(
                'px-2 py-0.5 rounded-full text-[10px] font-mono',
                statusFilter === 'all'
                  ? 'bg-slate-950/20 text-slate-950 font-black'
                  : 'bg-white/10 text-slate-300'
              )}
            >
              {totalCount}
            </span>
          </button>

          <button
            onClick={() => setStatusFilter('active')}
            className={cn(
              'px-4 py-2 rounded-full text-xs font-bold transition-all cursor-pointer flex items-center gap-2 shrink-0',
              statusFilter === 'active'
                ? 'bg-lime-400 text-slate-950 shadow-md shadow-lime-500/20'
                : 'bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10'
            )}
          >
            <span>Active</span>
            <span
              className={cn(
                'px-2 py-0.5 rounded-full text-[10px] font-mono',
                statusFilter === 'active'
                  ? 'bg-slate-950/20 text-slate-950 font-black'
                  : 'bg-white/10 text-slate-300'
              )}
            >
              {activeCount}
            </span>
          </button>

          <button
            onClick={() => setStatusFilter('draft')}
            className={cn(
              'px-4 py-2 rounded-full text-xs font-bold transition-all cursor-pointer flex items-center gap-2 shrink-0',
              statusFilter === 'draft'
                ? 'bg-amber-400 text-slate-950 shadow-md shadow-amber-500/20'
                : 'bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10'
            )}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Drafts</span>
            <span
              className={cn(
                'px-2 py-0.5 rounded-full text-[10px] font-mono',
                statusFilter === 'draft'
                  ? 'bg-slate-950/20 text-slate-950 font-black'
                  : 'bg-white/10 text-slate-300'
              )}
            >
              {draftCount}
            </span>
          </button>
        </div>

        {/* Listings Grid */}
        {isLoading ? (
          <div className="py-24 flex flex-col items-center justify-center space-y-2">
            <Spinner size="lg" />
            <span className="text-xs font-mono text-slate-400">Loading crop lots...</span>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="glass-terminal p-12 rounded-3xl border border-white/10 text-center space-y-4 max-w-lg mx-auto">
            <div className="w-16 h-16 rounded-3xl bg-lime-400/10 text-lime-400 border border-lime-400/20 flex items-center justify-center mx-auto">
              <Package className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-black text-white">
              {products.length === 0
                ? 'No Crop Listings Yet'
                : statusFilter === 'draft'
                ? 'No Draft Listings'
                : 'No Matching Lots'}
            </h3>
            <p className="text-xs text-slate-300 max-w-md mx-auto leading-relaxed">
              {products.length === 0
                ? 'You have not listed any crop harvests yet. List your harvested produce directly to buyers across Sri Lanka with guaranteed 24-hour escrow payouts.'
                : statusFilter === 'draft'
                ? 'You currently have no saved drafts. Incomplete listings can be saved as drafts at any time.'
                : 'No listings match your selected status filter.'}
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <button
                onClick={() => navigate('/farmer/products/new')}
                className="px-6 py-3 rounded-full bg-lime-400 hover:bg-lime-300 text-slate-950 font-black text-xs flex items-center gap-2 shadow-lg shadow-lime-500/25 transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>List New Crop Harvest</span>
              </button>
              {statusFilter !== 'all' && products.length > 0 && (
                <button
                  onClick={() => setStatusFilter('all')}
                  className="px-5 py-3 rounded-full bg-white/10 hover:bg-white/20 text-white font-bold text-xs cursor-pointer"
                >
                  View All Lots
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProducts.map((product) => {
              const isDraft = product.status === 'draft';
              const isActiveListing = product.status === 'active' || product.isActive;
              const displayTitle = product.productName || product.title;
              const displayPrice = product.basePricePerUnit ?? product.pricePerUnit;
              const farmDisplayName = product.farmId?.farmName || product.farmId?.name || 'Verified Farm';
              const isFarmUnavailable = product.farmId && product.farmId.isActive === false;

              return (
                <div
                  key={product._id}
                  className="glass-terminal p-5 rounded-3xl border border-white/10 hover:border-lime-400/40 shadow-2xl transition-all flex flex-col justify-between space-y-4 cursor-pointer"
                  onClick={() => navigate(`/farmer/products/${product._id}/edit`)}
                >
                  <div className="space-y-3">
                    <div className="relative aspect-16/9 rounded-2xl overflow-hidden bg-black/40">
                      <img
                        src={product.images?.[0] || 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=800&q=80'}
                        alt={displayTitle}
                        className="w-full h-full object-cover brightness-90"
                      />
                      <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
                        <span className="px-2.5 py-0.5 rounded-full bg-black/70 backdrop-blur-md text-lime-300 border border-lime-400/30 text-[10px] font-bold font-mono uppercase">
                          {product.category}
                        </span>
                      </div>

                      <div className="absolute top-2.5 right-2.5">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase ${
                            isFarmUnavailable
                              ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                              : isDraft
                              ? 'bg-amber-400/20 text-amber-300 border border-amber-400/30'
                              : product.status === 'pending_verification'
                              ? 'bg-amber-400/20 text-amber-300 border border-amber-400/30'
                              : product.status === 'out_of_stock'
                              ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                              : isActiveListing
                              ? 'bg-lime-400 text-slate-950 shadow-md'
                              : 'bg-white/20 text-slate-300'
                          }`}
                        >
                          {isFarmUnavailable
                            ? 'Farm Unavailable'
                            : isDraft
                            ? 'Draft'
                            : product.status === 'pending_verification'
                            ? 'Pending Verification'
                            : product.status === 'out_of_stock'
                            ? 'Out of Stock'
                            : isActiveListing
                            ? 'Active'
                            : 'Paused'}
                        </span>
                      </div>
                    </div>

                    <div>
                      <h3 className="font-extrabold text-white text-base truncate">{displayTitle}</h3>
                      <p className="text-xs text-slate-400">{farmDisplayName}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-2 pt-2 border-t border-white/10 text-xs">
                      <div>
                        <span className="text-slate-400 block text-[10px] font-mono uppercase">Unit Price</span>
                        <span className="font-black text-lime-400 font-mono text-sm">
                          {isDraft && (!displayPrice || displayPrice === 0)
                            ? 'Not set'
                            : `LKR ${displayPrice} / ${product.unit}`}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px] font-mono uppercase">Available Stock</span>
                        <span className="font-bold text-white font-mono">
                          {isDraft && (!product.availableQuantity || product.availableQuantity === 0)
                            ? 'Not set'
                            : `${product.availableQuantity} ${product.unit}`}
                        </span>
                      </div>
                    </div>
                  </div>

                <div
                  className="pt-3 border-t border-white/10 flex items-center justify-between gap-2"
                  onClick={(e) => e.stopPropagation()}
                >
                  {isFarmUnavailable ? (
                    <span className="px-3.5 py-1.5 rounded-full bg-rose-500/10 border border-rose-500/20 text-[11px] font-bold text-rose-300">
                      Farm Deactivated
                    </span>
                  ) : isDraft ? (
                    <button
                      onClick={() => navigate(`/farmer/products/${product._id}/edit`)}
                      className="px-3.5 py-1.5 rounded-full bg-amber-400/20 hover:bg-amber-400/30 border border-amber-400/30 text-[11px] font-bold text-amber-300 flex items-center gap-1.5 transition-all cursor-pointer"
                    >
                      <Edit className="w-3.5 h-3.5" />
                      <span>Resume Draft</span>
                    </button>
                  ) : product.status === 'pending_verification' ? (
                    <span className="px-3.5 py-1.5 rounded-full bg-amber-400/10 border border-amber-400/20 text-[11px] font-bold text-amber-300">
                      Awaiting Farm/KYC Verification
                    </span>
                  ) : (
                    <button
                      onClick={() => handleToggleActive(product)}
                      className={cn(
                        'px-3.5 py-1.5 rounded-full border text-[11px] font-bold flex items-center gap-1.5 transition-all cursor-pointer',
                        isActiveListing
                          ? 'bg-rose-500/10 hover:bg-rose-500/20 border-rose-400/30 text-rose-300'
                          : 'bg-lime-400/10 hover:bg-lime-400/20 border-lime-400/30 text-lime-300'
                      )}
                    >
                      <Power className="w-3.5 h-3.5" />
                      <span>{isActiveListing ? 'Deactivate' : 'Go Live'}</span>
                    </button>
                  )}

                  <div className="flex gap-1.5">
                    <button
                      onClick={() => navigate(`/farmer/products/${product._id}/edit`)}
                      className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all cursor-pointer"
                      title="Edit"
                    >
                      <Edit className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeleteClick(product)}
                      className="p-2 rounded-full bg-rose-500/20 text-rose-300 hover:bg-rose-500/30 transition-all cursor-pointer"
                      title="Delete"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
          </div>
        )}
      </div>

      <ConfirmDialog
        isOpen={isConfirmOpen}
        title="Delete Crop Listing"
        description={`Are you sure you want to permanently remove "${productToDelete?.productName || productToDelete?.title || 'this listing'}"? This cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        isDestructive={true}
        onConfirm={() => productToDelete && executeDelete(productToDelete._id)}
        onCancel={() => {
          setIsConfirmOpen(false);
          setProductToDelete(null);
        }}
      />
    </DashboardLayout>
  );
};
