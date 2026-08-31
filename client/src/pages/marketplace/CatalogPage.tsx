import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { MarketplaceLayout } from '@/components/templates/MarketplaceLayout';
import { FilterPanel, FilterState } from '@/components/organisms/FilterPanel';
import { ProductCard } from '@/components/molecules/ProductCard';
import { Spinner } from '@/components/atoms/Spinner';
import { ProductService } from '@/services/product.service';
import { useCartStore } from '@/store/cartStore';
import { useThemeStore } from '@/store/themeStore';
import { useAuthStore } from '@/store/authStore';
import { useTranslation } from '@/lib/i18n';
import {
  Filter,
  SlidersHorizontal,
  X,
  RotateCcw,
  Sparkles,
  ArrowUpDown,
  ShoppingBag,
  Sprout,
  ArrowRight,
} from 'lucide-react';
import toast from 'react-hot-toast';

export const CatalogPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [sortBy, setSortBy] = useState('featured');
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  const [filters, setFilters] = useState<FilterState>({
    category: searchParams.get('category') || null,
    district: searchParams.get('district') || null,
    minPrice: 50,
    maxPrice: 5000,
    isOrganicOnly: searchParams.get('organic') === 'true',
    qualityGrade: searchParams.get('grade') || null,
  });

  const [products, setProducts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);

  const { items, openCart, addItem } = useCartStore();
  const { isDark, toggleTheme, language, setLanguage } = useThemeStore();
  const { user } = useAuthStore();

  useEffect(() => {
    fetchProducts();
  }, [filters, search, sortBy, page]);

  const fetchProducts = async () => {
    try {
      setIsLoading(true);
      const res: any = await ProductService.getCatalog({
        category: filters.category || undefined,
        district: filters.district || undefined,
        minPrice: filters.minPrice,
        maxPrice: filters.maxPrice,
        isOrganicOnly: filters.isOrganicOnly || undefined,
        search: search || undefined,
        page,
        limit: 16,
      });

      if (res.success && res.data) {
        let list = res.data.products || [];

        if (sortBy === 'price_asc') {
          list = [...list].sort((a, b) => a.pricePerUnit - b.pricePerUnit);
        } else if (sortBy === 'price_desc') {
          list = [...list].sort((a, b) => b.pricePerUnit - a.pricePerUnit);
        } else if (sortBy === 'rating') {
          list = [...list].sort((a, b) => (b.ratingAverage || 0) - (a.ratingAverage || 0));
        }

        setProducts(list);
      }
    } catch (err: any) {
      toast.error('Failed to load marketplace catalog');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddToCart = (product: any, quantity: number = 1) => {
    addItem({
      productId: product._id,
      title: product.title,
      pricePerUnit: product.pricePerUnit,
      unit: product.unit,
      quantity,
      image: product.images?.[0],
      farmerName: product.farmerId?.fullName || 'Verified Farmer',
      minOrderQuantity: product.minOrderQuantity || 1,
      maxOrderQuantity: product.availableQuantity || 999,
      tierPricing: product.pricingTiers || [],
    });
    toast.success(`Added ${product.title} to your harvest basket!`);
  };

  return (
    <MarketplaceLayout
      searchQuery={search}
      onSearchChange={setSearch}
      onSearchSubmit={fetchProducts}
      cartItemCount={items.length}
      onOpenCart={openCart}
      currentLanguage={language}
      onLanguageChange={setLanguage}
      isDark={isDark}
      onToggleTheme={toggleTheme}
      user={user}
    >
      <div className="space-y-8">
        {/* Catalog Header with Dual-Font Luxury Typography */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-4 border-b border-white/10">
          <div className="space-y-1.5">
            <span className="px-3 py-1 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 inline-flex items-center gap-1.5">
              <Sprout className="w-3 h-3 text-emerald-400" />
              Verified Farm Lots • 25 Districts
            </span>
            <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
              Direct Farmer Harvest &{' '}
              <span className="font-serif-accent italic font-normal text-emerald-300">
                Fresh Produce Lots
              </span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-300">
              Showing {products.length} active wholesale and retail produce lots with 100% Escrow delivery guarantee.
            </p>
          </div>

          {/* Sort & Mobile Filter Pills */}
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => setIsMobileFilterOpen(true)}
              className="lg:hidden px-4 py-2 rounded-full bg-white/10 border border-white/15 text-xs font-bold text-white flex items-center gap-2"
            >
              <SlidersHorizontal className="w-3.5 h-3.5 text-emerald-400" />
              <span>Filters</span>
            </button>

            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/15">
              <ArrowUpDown className="w-3.5 h-3.5 text-emerald-400" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-transparent text-xs font-bold text-white outline-none cursor-pointer pr-2"
              >
                <option value="featured" className="bg-slate-900 text-white">Featured Deals</option>
                <option value="price_asc" className="bg-slate-900 text-white">Price: Low to High</option>
                <option value="price_desc" className="bg-slate-900 text-white">Price: High to Low</option>
                <option value="rating" className="bg-slate-900 text-white">Highest Buyer Rating</option>
              </select>
            </div>
          </div>
        </div>

        {/* Catalog 2-Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Desktop Left Sidebar: Filter Panel */}
          <aside className="hidden lg:block lg:col-span-3 sticky top-24">
            <FilterPanel
              filters={filters}
              onFilterChange={setFilters}
              onReset={() =>
                setFilters({
                  category: null,
                  district: null,
                  minPrice: 50,
                  maxPrice: 5000,
                  isOrganicOnly: false,
                  qualityGrade: null,
                })
              }
            />
          </aside>

          {/* Right Product Grid */}
          <main className="lg:col-span-9 space-y-6">
            {isLoading ? (
              <div className="py-24 flex flex-col items-center justify-center space-y-3">
                <Spinner size="lg" />
                <span className="text-xs font-mono text-slate-400">Querying live agrarian hubs...</span>
              </div>
            ) : products.length === 0 ? (
              <div className="glass-terminal rounded-3xl p-12 text-center space-y-4 border border-white/10">
                <div className="w-14 h-14 rounded-3xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center justify-center mx-auto">
                  <Sprout className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-black text-white">No crop lots matched your filter</h3>
                <p className="text-xs text-slate-300 max-w-sm mx-auto">
                  Try adjusting the district origin or asking price range to view more produce.
                </p>
                <button
                  onClick={() =>
                    setFilters({
                      category: null,
                      district: null,
                      minPrice: 50,
                      maxPrice: 5000,
                      isOrganicOnly: false,
                      qualityGrade: null,
                    })
                  }
                  className="px-6 py-2.5 rounded-full bg-emerald-400 text-slate-950 font-black text-xs cursor-pointer"
                >
                  Clear All Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {products.map((product) => (
                  <ProductCard
                    key={product._id}
                    id={product._id}
                    title={product.title}
                    titleSi={product.titleSi}
                    pricePerUnit={product.pricePerUnit}
                    unit={product.unit || 'kg'}
                    category={product.category}
                    images={product.images}
                    district={product.district || product.farmId?.location?.district || 'Matale'}
                    isOrganic={product.isOrganic}
                    qualityGrade={product.qualityGrade || 'Grade A'}
                    minOrderQuantity={product.minOrderQuantity || 1}
                    ratingAverage={product.ratingAverage || 4.9}
                    farmerName={product.farmerId?.fullName || 'Verified Pola Farmer'}
                    onAddToCart={() => handleAddToCart(product)}
                    onClick={() => navigate(`/product/${product._id}`)}
                  />
                ))}
              </div>
            )}
          </main>
        </div>
      </div>

      {/* Mobile Filter Modal */}
      {isMobileFilterOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-lg w-full p-6 space-y-4 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-black text-white text-base">Produce Filters</h3>
              <button
                onClick={() => setIsMobileFilterOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <FilterPanel
              filters={filters}
              onFilterChange={setFilters}
              onReset={() =>
                setFilters({
                  category: null,
                  district: null,
                  minPrice: 50,
                  maxPrice: 5000,
                  isOrganicOnly: false,
                  qualityGrade: null,
                })
              }
            />
            <button
              onClick={() => setIsMobileFilterOpen(false)}
              className="w-full py-3.5 rounded-full bg-emerald-400 text-slate-950 font-black text-xs"
            >
              Apply Filters ({products.length} Results)
            </button>
          </div>
        </div>
      )}
    </MarketplaceLayout>
  );
};
