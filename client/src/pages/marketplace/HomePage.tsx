import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { MarketplaceLayout } from '@/components/templates/MarketplaceLayout';
import { ProductCard } from '@/components/molecules/ProductCard';
import { FilterModal, FilterState } from '@/components/organisms/FilterModal';
import { ProductService } from '@/services/product.service';
import { useCartStore } from '@/store/cartStore';
import { useThemeStore } from '@/store/themeStore';
import { useAuthStore } from '@/store/authStore';
import { useTranslation } from '@/lib/i18n';
import { Spinner } from '@/components/atoms/Spinner';
import { cn } from '@/lib/cn';
import {
  Sprout,
  ShieldCheck,
  Building2,
  Scale,
  Sparkles,
  ArrowRight,
  ArrowUpRight,
  Flame,
  MapPin,
  RotateCcw,
  X,
  SlidersHorizontal,
  Star,
  Snowflake,
  Heart,
  Package,
  Wallet,
} from 'lucide-react';
import toast from 'react-hot-toast';

export const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const [products, setProducts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [stats, setStats] = useState<{ totalListings: number; totalFarmers: number; totalDistricts: number } | null>(null);

  // Flash Deals Countdown State
  const [timeLeft, setTimeLeft] = useState({ hours: 4, minutes: 28, seconds: 15 });

  const { items, openCart, addItem } = useCartStore();
  const { isDark, toggleTheme, language, setLanguage } = useThemeStore();
  const { user } = useAuthStore();
  const { t } = useTranslation();

  // Read URL search & filter params
  const search = searchParams.get('search') || '';
  const selectedCategory = searchParams.get('category') || null;
  const selectedDistrict = searchParams.get('district') || null;
  const minPrice = searchParams.get('minPrice') ? Number(searchParams.get('minPrice')) : undefined;
  const maxPrice = searchParams.get('maxPrice') ? Number(searchParams.get('maxPrice')) : undefined;
  const isOrganicOnly = searchParams.get('organic') === 'true' || searchParams.get('isOrganicOnly') === 'true';
  const qualityGrade = searchParams.get('grade') || searchParams.get('qualityGrade') || null;
  const requiresColdChain = searchParams.get('coldChain') === 'true' || searchParams.get('requiresColdChain') === 'true';
  const minRating = searchParams.get('rating') ? Number(searchParams.get('rating')) : null;
  const sortBy = searchParams.get('sort') || searchParams.get('sortBy') || 'featured';
  const isB2b = searchParams.get('b2b') === 'true';

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (selectedCategory) count++;
    if (selectedDistrict) count++;
    if (minPrice !== undefined || maxPrice !== undefined) count++;
    if (isOrganicOnly) count++;
    if (qualityGrade) count++;
    if (requiresColdChain) count++;
    if (minRating) count++;
    if (sortBy && sortBy !== 'featured') count++;
    return count;
  }, [selectedCategory, selectedDistrict, minPrice, maxPrice, isOrganicOnly, qualityGrade, requiresColdChain, minRating, sortBy]);

  const isFilteredOrSearched = Boolean(search || activeFilterCount > 0 || isB2b);

  const currentFilters: FilterState = useMemo(() => ({
    category: selectedCategory,
    district: selectedDistrict,
    minPrice,
    maxPrice,
    isOrganicOnly,
    qualityGrade,
    requiresColdChain,
    minRating,
    sortBy,
  }), [selectedCategory, selectedDistrict, minPrice, maxPrice, isOrganicOnly, qualityGrade, requiresColdChain, minRating, sortBy]);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0) return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        if (prev.hours > 0) return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        return { hours: 4, minutes: 59, seconds: 59 };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Listen for open-filter custom events
  useEffect(() => {
    const handleOpenFilterEvent = () => setIsFilterModalOpen(true);
    window.addEventListener('pola:open-filter', handleOpenFilterEvent);
    return () => window.removeEventListener('pola:open-filter', handleOpenFilterEvent);
  }, []);

  // Fetch live stats for logged-out hero
  useEffect(() => {
    if (!user) {
      ProductService.getStats()
        .then((data) => setStats(data))
        .catch((err) => console.error('Failed to load catalog stats:', err));
    }
  }, [user]);

  // Pre-open filter modal if b2b query param is present on mount
  useEffect(() => {
    if (searchParams.get('b2b') === 'true') {
      setIsFilterModalOpen(true);
    }
  }, []);

  const handleExploreLots = () => {
    const gridEl = document.getElementById('produce-grid');
    if (gridEl) {
      gridEl.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleB2bClick = () => {
    const params = new URLSearchParams(searchParams);
    if (isB2b) {
      params.delete('b2b');
    } else {
      params.set('b2b', 'true');
      setIsFilterModalOpen(true);
    }
    setSearchParams(params);
  };

  useEffect(() => {
    fetchProducts();
  }, [searchParams]);

  const fetchProducts = async () => {
    try {
      setIsLoading(true);
      const res: any = await ProductService.getCatalog({
        search: search || undefined,
        category: selectedCategory || undefined,
        district: selectedDistrict || undefined,
        minPrice,
        maxPrice,
        isOrganicOnly,
        qualityGrade: qualityGrade || undefined,
        requiresColdChain: requiresColdChain ? true : undefined,
        minRating: minRating || undefined,
        sort: sortBy,
        limit: 24,
      });

      if (res.success && res.data) {
        let prods = res.data.products || [];
        if (isB2b) {
          prods = prods.filter((p: any) => p.pricingTiers && p.pricingTiers.length > 0);
        }
        setProducts(prods);
      }
    } catch (err: any) {
      console.error('Catalog fetch error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleApplyFilters = (newFilters: FilterState) => {
    const params = new URLSearchParams(searchParams);
    if (newFilters.category) params.set('category', newFilters.category);
    else params.delete('category');

    if (newFilters.district) params.set('district', newFilters.district);
    else params.delete('district');

    if (newFilters.minPrice !== undefined) params.set('minPrice', String(newFilters.minPrice));
    else params.delete('minPrice');

    if (newFilters.maxPrice !== undefined) params.set('maxPrice', String(newFilters.maxPrice));
    else params.delete('maxPrice');

    if (newFilters.isOrganicOnly) params.set('organic', 'true');
    else params.delete('organic');

    if (newFilters.qualityGrade) params.set('grade', newFilters.qualityGrade);
    else params.delete('grade');

    if (newFilters.requiresColdChain) params.set('coldChain', 'true');
    else params.delete('coldChain');

    if (newFilters.minRating) params.set('rating', String(newFilters.minRating));
    else params.delete('rating');

    if (newFilters.sortBy && newFilters.sortBy !== 'featured') params.set('sort', newFilters.sortBy);
    else params.delete('sort');

    setSearchParams(params);
  };

  const handleClearAll = () => {
    setSearchParams(new URLSearchParams());
  };

  const handleRemoveFilter = (key: string) => {
    const params = new URLSearchParams(searchParams);
    params.delete(key);
    if (key === 'price') {
      params.delete('minPrice');
      params.delete('maxPrice');
    }
    if (key === 'organic') {
      params.delete('isOrganicOnly');
      params.delete('organic');
    }
    if (key === 'grade') {
      params.delete('qualityGrade');
      params.delete('grade');
    }
    if (key === 'coldChain') {
      params.delete('requiresColdChain');
      params.delete('coldChain');
    }
    setSearchParams(params);
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
    });
    toast.success(`Added ${quantity} ${product.unit || 'kg'} of ${product.title} to your basket!`);
  };

  const dbDeals = products.filter((p) => p.isOrganic || (p.pricingTiers && p.pricingTiers.length > 0)).slice(0, 4);
  const activeDeals = dbDeals.length > 0 ? dbDeals : products.slice(0, 4);

  return (
    <MarketplaceLayout
      searchQuery={search}
      onSearchChange={(q) => {
        const params = new URLSearchParams(searchParams);
        if (q) params.set('search', q);
        else params.delete('search');
        setSearchParams(params);
      }}
      onOpenFilter={() => setIsFilterModalOpen(true)}
      activeFilterCount={activeFilterCount}
      cartItemCount={items.length}
      onOpenCart={openCart}
      currentLanguage={language}
      onLanguageChange={setLanguage}
      isDark={isDark}
      onToggleTheme={toggleTheme}
      user={user}
    >
      <div className="space-y-8 pb-16">
        {/* 1. Sleek Compact Hero Header (Logged-out visitors only) */}
        {!user && (
          <section className="glass-terminal p-5 sm:p-7 rounded-3xl border border-slate-200/80 dark:border-white/10 shadow-xl flex flex-col gap-6 transition-colors">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div className="space-y-2 max-w-2xl text-left">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-400/30 text-emerald-700 dark:text-emerald-300 text-xs font-bold font-mono">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-500" />
                  <span>
                    Direct Agritech Sourcing •{' '}
                    {stats && stats.totalDistricts > 0 ? `${stats.totalDistricts} Active Districts` : '25 Districts'}
                    {stats && stats.totalFarmers > 0 ? ` • ${stats.totalFarmers}+ Verified Farmers` : ''}
                  </span>
                </div>
                <h1 className="text-2xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight leading-tight">
                  Farm-Gate Fresh Produce,{' '}
                  <span className="font-serif-accent italic font-normal text-emerald-600 dark:text-emerald-400">
                    Direct to Your Doorstep
                  </span>
                </h1>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 font-medium leading-relaxed">
                  Eliminate middlemen and buy farm-graded produce straight from verified Sri Lankan growers with 100% Escrow protection
                  {stats && stats.totalListings > 0 ? ` across ${stats.totalListings} live harvest listings.` : '.'}
                </p>
              </div>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 shrink-0 w-full md:w-auto">
                <button
                  type="button"
                  onClick={handleB2bClick}
                  className={cn(
                    'px-5 py-3 rounded-full border text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer',
                    isB2b
                      ? 'bg-purple-500 text-white border-purple-500 shadow-md font-black'
                      : 'bg-slate-200/60 dark:bg-white/10 hover:bg-slate-200 dark:hover:bg-white/20 border-slate-300/80 dark:border-white/15 text-slate-900 dark:text-white'
                  )}
                >
                  <Building2 className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                  <span>{isB2b ? t.viewingB2bWholesale : t.b2bWholesale}</span>
                </button>

                <button
                  type="button"
                  onClick={handleExploreLots}
                  className="px-6 py-3 rounded-full bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-black text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/25 transition-all cursor-pointer"
                >
                  <Sprout className="w-4 h-4 text-slate-950" />
                  <span>{t.exploreAllLots}</span>
                </button>
              </div>
            </div>

            {/* Compact "Sign in to unlock" Row */}
            <div className="pt-4 border-t border-slate-200/60 dark:border-white/10 flex flex-wrap items-center gap-3 text-xs">
              <span className="text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                {t.signInToUnlock}:
              </span>
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => navigate('/customer/login?redirect=/wishlist')}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-200/50 dark:bg-white/5 hover:bg-emerald-500/15 dark:hover:bg-emerald-500/20 text-slate-700 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 border border-slate-300/60 dark:border-white/10 transition-colors font-medium text-[11px] cursor-pointer"
                >
                  <Heart className="w-3 h-3 text-rose-500" />
                  <span>{t.savedWishlist}</span>
                </button>
                <button
                  type="button"
                  onClick={() => navigate('/customer/login?redirect=/orders')}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-200/50 dark:bg-white/5 hover:bg-emerald-500/15 dark:hover:bg-emerald-500/20 text-slate-700 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 border border-slate-300/60 dark:border-white/10 transition-colors font-medium text-[11px] cursor-pointer"
                >
                  <Package className="w-3 h-3 text-emerald-500" />
                  <span>{t.liveOrderTracking}</span>
                </button>
                <button
                  type="button"
                  onClick={() => navigate('/customer/login?redirect=/wallet')}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-200/50 dark:bg-white/5 hover:bg-emerald-500/15 dark:hover:bg-emerald-500/20 text-slate-700 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 border border-slate-300/60 dark:border-white/10 transition-colors font-medium text-[11px] cursor-pointer"
                >
                  <Wallet className="w-3 h-3 text-amber-500" />
                  <span>{t.escrowWallet}</span>
                </button>
              </div>
            </div>
          </section>
        )}

        <section id="produce-grid" className="space-y-4 text-left">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                {search ? (
                  <>Results for <span className="text-emerald-600 dark:text-emerald-400 font-serif-accent italic">"{search}"</span></>
                ) : isFilteredOrSearched ? (
                  <>Filtered Fresh Harvest Lots</>
                ) : (
                  <>Live Farm Produce Lots</>
                )}
                {selectedDistrict && (
                  <span className="text-emerald-600 dark:text-emerald-400 font-normal"> in {selectedDistrict}</span>
                )}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {products.length} farm-direct lot{products.length === 1 ? '' : 's'} available for immediate dispatch under Escrow guarantee
              </p>
            </div>

            <button
              type="button"
              onClick={() => setIsFilterModalOpen(true)}
              className="self-start sm:self-auto px-4 py-1.5 rounded-full bg-slate-200/60 dark:bg-white/10 hover:bg-slate-200 dark:hover:bg-white/15 border border-slate-300/80 dark:border-white/15 text-xs font-bold text-slate-700 dark:text-slate-200 flex items-center gap-2 transition-all cursor-pointer"
            >
              <SlidersHorizontal className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>All Filters</span>
              {activeFilterCount > 0 && (
                <span className="px-1.5 py-0.2 rounded-full bg-emerald-500 text-slate-950 font-black text-[9px]">
                  {activeFilterCount}
                </span>
              )}
            </button>
          </div>

          {isFilteredOrSearched && (
            <div className="flex flex-wrap items-center gap-2 pt-1 pb-2 border-b border-slate-200/60 dark:border-white/10 animate-in fade-in">
              <span className="text-xs font-bold text-slate-400 dark:text-slate-500">Active:</span>

              {search && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/15 border border-emerald-400/30 text-emerald-700 dark:text-emerald-300">
                  <span>Keyword: "{search}"</span>
                  <button onClick={() => handleRemoveFilter('search')} className="hover:text-emerald-950 dark:hover:text-white cursor-pointer" title="Remove keyword">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}

              {selectedCategory && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/15 border border-emerald-400/30 text-emerald-700 dark:text-emerald-300">
                  <span>{selectedCategory}</span>
                  <button onClick={() => handleRemoveFilter('category')} className="hover:text-emerald-950 dark:hover:text-white cursor-pointer" title="Remove category">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}

              {selectedDistrict && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/15 border border-emerald-400/30 text-emerald-700 dark:text-emerald-300">
                  <MapPin className="w-3 h-3" />
                  <span>{selectedDistrict}</span>
                  <button onClick={() => handleRemoveFilter('district')} className="hover:text-emerald-950 dark:hover:text-white cursor-pointer" title="Remove district">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}

              {(minPrice !== undefined || maxPrice !== undefined) && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/15 border border-emerald-400/30 text-emerald-700 dark:text-emerald-300">
                  <span>LKR {minPrice ?? 0} – {maxPrice ? `${maxPrice.toLocaleString()}` : 'Any'}</span>
                  <button onClick={() => handleRemoveFilter('price')} className="hover:text-emerald-950 dark:hover:text-white cursor-pointer" title="Remove price filter">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}

              {isOrganicOnly && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/15 border border-emerald-400/30 text-emerald-700 dark:text-emerald-300">
                  <ShieldCheck className="w-3 h-3" />
                  <span>Certified Organic</span>
                  <button onClick={() => handleRemoveFilter('organic')} className="hover:text-emerald-950 dark:hover:text-white cursor-pointer" title="Remove organic filter">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}

              {qualityGrade && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/15 border border-emerald-400/30 text-emerald-700 dark:text-emerald-300">
                  <span>{qualityGrade}</span>
                  <button onClick={() => handleRemoveFilter('grade')} className="hover:text-emerald-950 dark:hover:text-white cursor-pointer" title="Remove grade filter">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}

              {requiresColdChain && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-cyan-500/15 border border-cyan-400/30 text-cyan-700 dark:text-cyan-300">
                  <Snowflake className="w-3 h-3" />
                  <span>Cold Chain</span>
                  <button onClick={() => handleRemoveFilter('coldChain')} className="hover:text-cyan-950 dark:hover:text-white cursor-pointer" title="Remove cold chain filter">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}

              {minRating && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/15 border border-amber-400/30 text-amber-700 dark:text-amber-300">
                  <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                  <span>{minRating}★ & up</span>
                  <button onClick={() => handleRemoveFilter('rating')} className="hover:text-amber-950 dark:hover:text-white cursor-pointer" title="Remove rating filter">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}

              {isB2b && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-purple-500/15 border border-purple-400/30 text-purple-700 dark:text-purple-300">
                  <Building2 className="w-3 h-3" />
                  <span>B2B Wholesale Only</span>
                  <button onClick={() => handleRemoveFilter('b2b')} className="hover:text-purple-950 dark:hover:text-white cursor-pointer" title="Remove B2B filter">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}

              <button
                type="button"
                onClick={handleClearAll}
                className="text-xs font-bold text-slate-500 hover:text-rose-500 dark:hover:text-rose-400 hover:underline flex items-center gap-1 ml-1 cursor-pointer transition-colors"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Clear all</span>
              </button>
            </div>
          )}

          {isLoading ? (
            <div className="py-16 flex flex-col items-center justify-center space-y-2">
              <Spinner size="lg" />
              <span className="text-xs font-mono text-slate-400">Querying live agrarian hubs...</span>
            </div>
          ) : products.length === 0 ? (
            <div className="glass-terminal rounded-3xl p-12 text-center text-slate-500 dark:text-slate-400 text-xs border border-slate-200/80 dark:border-white/10 space-y-3">
              <p className="font-bold text-sm text-slate-700 dark:text-slate-200">No produce lots match your search or filters</p>
              <p>Try adjusting your category, district, price range, or search keywords.</p>
              <button
                type="button"
                onClick={handleClearAll}
                className="px-5 py-2 rounded-full bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-black text-xs cursor-pointer shadow-md transition-all"
              >
                Reset All Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
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
                  farmerName={product.farmerId?.fullName || 'Verified Pola Grower'}
                  onAddToCart={() => handleAddToCart(product)}
                  onClick={() => navigate(`/product/${product._id}`)}
                />
              ))}
            </div>
          )}
        </section>

        {!isFilteredOrSearched && activeDeals.length > 0 && (
          <section className="glass-terminal p-6 sm:p-8 rounded-3xl text-slate-900 dark:text-white space-y-6 shadow-2xl border border-slate-200/80 dark:border-white/10 transition-colors">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-2xl bg-emerald-500/20 text-emerald-600 dark:text-emerald-300 border border-emerald-500/30">
                  <Flame className="w-6 h-6 text-emerald-500 animate-pulse" />
                </div>
                <div className="text-left">
                  <h3 className="text-xl sm:text-2xl font-black">Featured Harvest Allocations</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Direct listings from verified agrarian village hubs</p>
                </div>
              </div>

              <div className="flex items-center gap-2 text-xs font-black">
                <span className="text-slate-500 dark:text-slate-300 font-bold uppercase tracking-wider text-[11px]">Today's Dispatch:</span>
                <div className="px-2.5 py-1 rounded-xl bg-slate-200 dark:bg-black/50 text-slate-900 dark:text-white font-mono text-sm border border-slate-300 dark:border-white/15">
                  {String(timeLeft.hours).padStart(2, '0')}
                </div>
                <span>:</span>
                <div className="px-2.5 py-1 rounded-xl bg-slate-200 dark:bg-black/50 text-slate-900 dark:text-white font-mono text-sm border border-slate-300 dark:border-white/15">
                  {String(timeLeft.minutes).padStart(2, '0')}
                </div>
                <span>:</span>
                <div className="px-2.5 py-1 rounded-xl bg-slate-200 dark:bg-black/50 text-slate-900 dark:text-white font-mono text-sm border border-slate-300 dark:border-white/15">
                  {String(timeLeft.seconds).padStart(2, '0')}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {activeDeals.map((deal) => (
                <div
                  key={deal._id}
                  onClick={() => navigate(`/product/${deal._id}`)}
                  className="bg-slate-100/80 dark:bg-black/40 text-slate-900 dark:text-white p-4 rounded-3xl border border-slate-200 dark:border-white/10 shadow-lg flex flex-col justify-between space-y-3 cursor-pointer group hover:border-emerald-400/50 transition-all text-left"
                >
                  <div className="relative aspect-4/3 rounded-2xl overflow-hidden bg-slate-200 dark:bg-slate-800">
                    <img
                      src={deal.images?.[0] || 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=600&q=80'}
                      alt={deal.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                    {deal.isOrganic && (
                      <div className="absolute top-2 left-2 px-2.5 py-0.5 rounded-full bg-emerald-500 text-slate-950 text-[10px] font-black">ORGANIC</div>
                    )}
                  </div>
                  <div className="space-y-1">
                    <h4 className="font-extrabold text-xs line-clamp-1 group-hover:text-emerald-600 dark:group-hover:text-emerald-300">{deal.title}</h4>
                    <div className="flex items-baseline gap-2">
                      <span className="font-black text-base text-emerald-600 dark:text-emerald-400 font-mono">LKR {deal.pricePerUnit} / {deal.unit || 'kg'}</span>
                    </div>
                  </div>
                  <div className="pt-2 border-t border-slate-200 dark:border-white/10 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
                    <span className="truncate">{deal.district || 'Western'} Hub</span>
                    <span className="text-emerald-600 dark:text-emerald-400 font-bold">View Lot →</span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <div
            onClick={() => setIsFilterModalOpen(true)}
            className="glass-terminal p-6 rounded-3xl border border-slate-200/80 dark:border-white/10 hover:border-emerald-400/50 shadow-xl transition-all cursor-pointer space-y-3 text-left group"
          >
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-600 dark:text-emerald-300 border border-emerald-400/30 flex items-center justify-center font-black">
              <Sprout className="w-6 h-6" />
            </div>
            <h3 className="font-extrabold text-slate-900 dark:text-white text-base group-hover:text-emerald-600 dark:group-hover:text-emerald-300 transition-colors">Direct Farm Sourcing</h3>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">Browse freshly harvested produce directly from verified farmers across Sri Lanka.</p>
            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">Filter Lots <ArrowRight className="w-3.5 h-3.5" /></span>
          </div>

          <div
            onClick={() => {
              const params = new URLSearchParams();
              params.set('b2b', 'true');
              setSearchParams(params);
            }}
            className="glass-terminal p-6 rounded-3xl border border-slate-200/80 dark:border-white/10 hover:border-purple-400/50 shadow-xl transition-all cursor-pointer space-y-3 text-left group"
          >
            <div className="w-12 h-12 rounded-2xl bg-purple-500/20 text-purple-600 dark:text-purple-300 border border-purple-400/30 flex items-center justify-center font-black">
              <Building2 className="w-6 h-6" />
            </div>
            <h3 className="font-extrabold text-slate-900 dark:text-white text-base group-hover:text-purple-600 dark:group-hover:text-purple-300 transition-colors">B2B Commercial Wholesale</h3>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">Tiered volume discounts for hotels, restaurants, supermarkets, and exporters.</p>
            <span className="text-xs font-bold text-purple-600 dark:text-purple-400 flex items-center gap-1">View Wholesale Tiers <ArrowRight className="w-3.5 h-3.5" /></span>
          </div>

          <div
            onClick={() => {
              const params = new URLSearchParams();
              params.set('grade', 'Grade A');
              setSearchParams(params);
            }}
            className="glass-terminal p-6 rounded-3xl border border-slate-200/80 dark:border-white/10 hover:border-sky-400/50 shadow-xl transition-all cursor-pointer space-y-3 text-left group"
          >
            <div className="w-12 h-12 rounded-2xl bg-sky-500/20 text-sky-600 dark:text-sky-300 border border-sky-400/30 flex items-center justify-center font-black">
              <Scale className="w-6 h-6" />
            </div>
            <h3 className="font-extrabold text-slate-900 dark:text-white text-base group-hover:text-sky-600 dark:group-hover:text-sky-300 transition-colors">Hub Quality Inspection</h3>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">Every crop crate is weighed and graded (A/B/C) at Village Hubs before transit.</p>
            <span className="text-xs font-bold text-sky-600 dark:text-sky-400 flex items-center gap-1">Browse Grade A <ArrowRight className="w-3.5 h-3.5" /></span>
          </div>

          <div
            onClick={() => {
              const params = new URLSearchParams();
              params.set('organic', 'true');
              setSearchParams(params);
            }}
            className="glass-terminal p-6 rounded-3xl border border-slate-200/80 dark:border-white/10 hover:border-amber-400/50 shadow-xl transition-all cursor-pointer space-y-3 text-left group"
          >
            <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-600 dark:text-amber-300 border border-amber-400/30 flex items-center justify-center font-black">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="font-extrabold text-slate-900 dark:text-white text-base group-hover:text-amber-600 dark:group-hover:text-amber-300 transition-colors">100% Escrow Protection</h3>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">Your money stays locked until you inspect and provide your 6-digit handover OTP.</p>
            <span className="text-xs font-bold text-amber-600 dark:text-amber-400 flex items-center gap-1">Organic & Safe Produce <ArrowRight className="w-3.5 h-3.5" /></span>
          </div>
        </section>
      </div>

      <FilterModal
        isOpen={isFilterModalOpen}
        onClose={() => setIsFilterModalOpen(false)}
        filters={currentFilters}
        onApply={handleApplyFilters}
        onReset={handleClearAll}
        resultCount={products.length}
      />
    </MarketplaceLayout>
  );
};
