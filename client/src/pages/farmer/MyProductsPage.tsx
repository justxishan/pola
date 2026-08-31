import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from '@/components/templates/DashboardLayout';
import { Spinner } from '@/components/atoms/Spinner';
import { ProductService } from '@/services/product.service';
import { useAuthStore } from '@/store/authStore';
import { useThemeStore } from '@/store/themeStore';
import { useTranslation } from '@/lib/i18n';
import {
  LayoutDashboard,
  Sprout,
  Package,
  Wallet,
  ShoppingBag,
  Plus,
  Edit,
  Trash2,
  Power,
  Layers,
  Scale,
  Sparkles,
} from 'lucide-react';
import toast from 'react-hot-toast';

export const MyProductsPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const { isDark, toggleTheme, language, setLanguage } = useThemeStore();
  const { t } = useTranslation();

  const [products, setProducts] = useState<any[]>([]);
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
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setIsLoading(true);
      const res: any = await ProductService.getMyProducts();
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
      const nextStatus = !product.isActive;
      await ProductService.updateProduct(product._id, { isActive: nextStatus });
      toast.success(`Listing ${nextStatus ? 'activated' : 'paused'}`);
      fetchProducts();
    } catch (err: any) {
      toast.error('Failed to toggle status');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to remove this crop listing?')) return;
    try {
      await ProductService.deleteProduct(id);
      toast.success('Listing deleted');
      fetchProducts();
    } catch (err: any) {
      toast.error('Failed to delete listing');
    }
  };

  return (
    <DashboardLayout
      portalTitle={t.farmerOpsCenter}
      portalRole={user?.role || 'Farmer'}
      navItems={navItems}
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
              Crop Inventory &{' '}
              <span className="font-serif-accent italic font-normal text-lime-300">
                Harvest Catalog
              </span>
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

        {/* Listings Grid */}
        {isLoading ? (
          <div className="py-24 flex flex-col items-center justify-center space-y-2">
            <Spinner size="lg" />
            <span className="text-xs font-mono text-slate-400">Loading crop lots...</span>
          </div>
        ) : products.length === 0 ? (
          <div className="glass-terminal p-12 rounded-3xl border border-white/10 text-center space-y-4">
            <div className="w-14 h-14 rounded-3xl bg-lime-500/20 text-lime-300 border border-lime-500/30 flex items-center justify-center mx-auto">
              <Package className="w-7 h-7" />
            </div>
            <h3 className="text-xl font-black text-white">No Harvest Listings Published</h3>
            <p className="text-xs text-slate-300 max-w-sm mx-auto">
              Publish your first fresh crop harvest lot to receive direct buyer orders and guaranteed Escrow payouts.
            </p>
            <button
              onClick={() => navigate('/farmer/products/new')}
              className="px-6 py-3 rounded-full bg-lime-400 text-slate-950 font-black text-xs cursor-pointer shadow-lg shadow-lime-500/20"
            >
              Publish First Harvest Lot
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product) => (
              <div
                key={product._id}
                className="glass-terminal p-5 rounded-3xl border border-white/10 hover:border-lime-400/40 shadow-2xl transition-all flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  <div className="relative aspect-16/9 rounded-2xl overflow-hidden bg-black/40">
                    <img
                      src={product.images?.[0] || 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=800&q=80'}
                      alt={product.title}
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
                          product.isActive
                            ? 'bg-lime-400 text-slate-950 shadow-md'
                            : 'bg-white/20 text-slate-300'
                        }`}
                      >
                        {product.isActive ? 'Active' : 'Paused'}
                      </span>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-extrabold text-white text-base truncate">{product.title}</h3>
                    <p className="text-xs text-slate-400">{product.farmId?.name || 'Verified Farm'}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-white/10 text-xs">
                    <div>
                      <span className="text-slate-400 block text-[10px] font-mono uppercase">Unit Price</span>
                      <span className="font-black text-lime-400 font-mono text-sm">
                        LKR {product.pricePerUnit} / {product.unit}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px] font-mono uppercase">Available Stock</span>
                      <span className="font-bold text-white font-mono">
                        {product.availableQuantity} {product.unit}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-white/10 flex items-center justify-between gap-2">
                  <button
                    onClick={() => handleToggleActive(product)}
                    className="px-3.5 py-1.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-[11px] font-bold text-slate-300 flex items-center gap-1.5 transition-all cursor-pointer"
                  >
                    <Power className="w-3.5 h-3.5" />
                    <span>{product.isActive ? 'Pause' : 'Activate'}</span>
                  </button>

                  <div className="flex gap-1.5">
                    <button
                      onClick={() => navigate(`/farmer/products/${product._id}/edit`)}
                      className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all cursor-pointer"
                      title="Edit"
                    >
                      <Edit className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(product._id)}
                      className="p-2 rounded-full bg-rose-500/20 text-rose-300 hover:bg-rose-500/30 transition-all cursor-pointer"
                      title="Delete"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
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
