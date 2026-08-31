import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MarketplaceLayout } from '@/components/templates/MarketplaceLayout';
import { ProductCard } from '@/components/molecules/ProductCard';
import { CategoryRibbon } from '@/components/organisms/CategoryRibbon';
import { Spinner } from '@/components/atoms/Spinner';
import { ProductService } from '@/services/product.service';
import { useCartStore } from '@/store/cartStore';
import { useThemeStore } from '@/store/themeStore';
import { useAuthStore } from '@/store/authStore';
import { useTranslation } from '@/lib/i18n';
import {
  Sprout,
  ArrowRight,
  ShieldCheck,
  Truck,
  Scale,
  Sparkles,
  Zap,
  Building2,
  MapPin,
  Flame,
  Star,
  ArrowUpRight,
  RotateCcw,
  LayoutGrid,
} from 'lucide-react';
import toast from 'react-hot-toast';

export const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState<any[]>([]);
  const [selectedDistrict, setSelectedDistrict] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Flash Deals Countdown State
  const [timeLeft, setTimeLeft] = useState({ hours: 4, minutes: 28, seconds: 15 });

  const { items, openCart, addItem } = useCartStore();
  const { isDark, toggleTheme, language, setLanguage } = useThemeStore();
  const { user } = useAuthStore();
  const { t } = useTranslation();

  useEffect(() => {
    fetchProducts();
  }, [selectedCategory, selectedDistrict]);

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

  const fetchProducts = async () => {
    try {
      setIsLoading(true);
      const res: any = await ProductService.getCatalog({
        category: selectedCategory || undefined,
        district: selectedDistrict || undefined,
        limit: 12,
      });

      if (res.success && res.data) {
        setProducts(res.data.products || []);
      }
    } catch (err: any) {
      console.error(err);
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
    });
    toast.success(`Added ${quantity} ${product.unit || 'kg'} of ${product.title} to your basket!`);
  };

  const dbDeals = products.filter((p) => p.isOrganic || (p.pricingTiers && p.pricingTiers.length > 0)).slice(0, 4);
  const activeDeals = dbDeals.length > 0 ? dbDeals : products.slice(0, 4);

  const featuredDistricts = [
    'Nuwara Eliya',
    'Matale',
    'Kandy',
    'Anuradhapura',
    'Badulla',
    'Kurunegala',
    'Jaffna',
    'Polonnaruwa',
    'Hambantota',
    'Monaragala',
  ];

  return (
    <MarketplaceLayout
      searchQuery=""
      onSearchChange={() => {}}
      cartItemCount={items.length}
      onOpenCart={openCart}
      currentLanguage={language}
      onLanguageChange={setLanguage}
      isDark={isDark}
      onToggleTheme={toggleTheme}
      user={user}
    >
      <div className="space-y-8 pb-16">
        
        {/* 1. Sleek Compact Hero Header (Immediate Above-The-Fold Produce Layout) */}
        <section className="glass-terminal p-5 sm:p-7 rounded-3xl border border-slate-200/80 dark:border-white/10 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6 transition-colors">
          <div className="space-y-2 max-w-2xl text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-400/30 text-emerald-700 dark:text-emerald-300 text-xs font-bold font-mono">
              <Sparkles className="w-3.5 h-3.5 text-emerald-500" />
              <span>Direct Agritech Sourcing • 25 Districts</span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight leading-tight">
              Fresh Harvest for{' '}
              <span className="font-serif-accent italic font-normal text-emerald-600 dark:text-emerald-400">
                Every Home
              </span>
            </h1>

            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
              Eliminate middlemen and buy farm-graded produce straight from verified Sri Lankan growers with 100% Escrow protection.
            </p>
          </div>

          {/* Quick CTA Pills & Sourcing Trust Badges */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 shrink-0 w-full md:w-auto">
            <button
              onClick={() => navigate('/catalog?b2b=true')}
              className="px-5 py-3 rounded-full bg-slate-200/60 dark:bg-white/10 hover:bg-slate-200 dark:hover:bg-white/20 border border-slate-300/80 dark:border-white/15 text-slate-900 dark:text-white text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <Building2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>B2B Wholesale</span>
            </button>

            <button
              onClick={() => navigate('/catalog')}
              className="px-6 py-3 rounded-full bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-black text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/25 transition-all cursor-pointer"
            >
              <span>Explore All Lots</span>
              <ArrowUpRight className="w-4 h-4" />
            </button>
          </div>
        </section>

        {/* 2. Floating Category Ribbon Pill Selector */}
        <section className="text-left space-y-2">
          <CategoryRibbon
            selectedCategory={selectedCategory}
            onSelectCategory={(cat) => setSelectedCategory(cat)}
          />
        </section>

        {/* 3. PRIMARY ABOVE-THE-FOLD FRESH PRODUCE SHELF (Users see products immediately!) */}
        <section className="space-y-4 text-left">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                Live Farm Produce Lots{' '}
                {selectedDistrict && <span className="text-emerald-600 dark:text-emerald-400">in {selectedDistrict}</span>}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Direct farm lots available for immediate dispatch under Escrow guarantee
              </p>
            </div>

            <button
              onClick={() => navigate('/catalog')}
              className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>View Catalog ({products.length})</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {isLoading ? (
            <div className="py-16 flex flex-col items-center justify-center space-y-2">
              <Spinner size="lg" />
              <span className="text-xs font-mono text-slate-400">Querying live agrarian hubs...</span>
            </div>
          ) : products.length === 0 ? (
            <div className="glass-terminal rounded-3xl p-12 text-center text-slate-500 dark:text-slate-400 text-xs border border-slate-200/80 dark:border-white/10">
              No produce listings found for the selected category.
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

        {/* 4. Active Live Harvest Deals (Flash Dispatch Bar) */}
        {activeDeals.length > 0 && (
          <section className="glass-terminal p-6 sm:p-8 rounded-3xl text-slate-900 dark:text-white space-y-6 shadow-2xl border border-slate-200/80 dark:border-white/10 transition-colors">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-2xl bg-emerald-500/20 text-emerald-600 dark:text-emerald-300 border border-emerald-500/30">
                  <Flame className="w-6 h-6 text-emerald-500 animate-pulse" />
                </div>
                <div className="text-left">
                  <h3 className="text-xl sm:text-2xl font-black">
                    Featured Harvest Allocations
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Direct listings from verified agrarian village hubs</p>
                </div>
              </div>

              {/* Countdown Box */}
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

            {/* Active Cards Grid */}
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
                      <div className="absolute top-2 left-2 px-2.5 py-0.5 rounded-full bg-emerald-500 text-slate-950 text-[10px] font-black">
                        ORGANIC
                      </div>
                    )}
                  </div>

                  <div className="space-y-1">
                    <h4 className="font-extrabold text-xs line-clamp-1 group-hover:text-emerald-600 dark:group-hover:text-emerald-300">
                      {deal.title}
                    </h4>
                    <div className="flex items-baseline gap-2">
                      <span className="font-black text-base text-emerald-600 dark:text-emerald-400 font-mono">
                        LKR {deal.pricePerUnit} / {deal.unit || 'kg'}
                      </span>
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

        {/* 5. District Sourcing Hub Filter Pills */}
        <section className="glass-terminal p-6 sm:p-8 rounded-3xl border border-slate-200/80 dark:border-white/10 space-y-4 text-left transition-colors">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="space-y-1">
              <h3 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                <MapPin className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                Source by Agrarian Farming District
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Filter fresh harvest lots based on regional climate and origin farms
              </p>
            </div>
            {selectedDistrict && (
              <button
                onClick={() => setSelectedDistrict(null)}
                className="text-xs text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1 font-bold cursor-pointer"
              >
                <RotateCcw className="w-3 h-3" />
                Reset District
              </button>
            )}
          </div>

          <div className="flex flex-wrap gap-2 pt-2">
            <button
              onClick={() => setSelectedDistrict(null)}
              className={`px-4 py-2 rounded-full text-xs font-bold transition-all cursor-pointer ${
                selectedDistrict === null
                  ? 'bg-emerald-400 text-slate-950 font-black shadow-md'
                  : 'bg-slate-200/60 dark:bg-white/5 text-slate-700 dark:text-slate-300 hover:bg-slate-300/60 dark:hover:bg-white/15 border border-slate-300/80 dark:border-white/10'
              }`}
            >
              All Sri Lanka (25 Districts)
            </button>
            {featuredDistricts.map((dist) => {
              const isSelected = selectedDistrict === dist;
              return (
                <button
                  key={dist}
                  onClick={() => setSelectedDistrict(isSelected ? null : dist)}
                  className={`px-4 py-2 rounded-full text-xs font-bold transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-emerald-400 text-slate-950 font-black shadow-md'
                      : 'bg-slate-200/60 dark:bg-white/5 text-slate-700 dark:text-slate-300 hover:bg-slate-300/60 dark:hover:bg-white/15 border border-slate-300/80 dark:border-white/10'
                  }`}
                >
                  {dist}
                </button>
              );
            })}
          </div>
        </section>

        {/* 6. 4-Card Quick Sourcing Action Grid */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <div
            onClick={() => navigate('/catalog')}
            className="glass-terminal p-6 rounded-3xl border border-slate-200/80 dark:border-white/10 hover:border-emerald-400/50 shadow-xl transition-all cursor-pointer space-y-3 text-left group"
          >
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-600 dark:text-emerald-300 border border-emerald-400/30 flex items-center justify-center font-black">
              <Sprout className="w-6 h-6" />
            </div>
            <h3 className="font-extrabold text-slate-900 dark:text-white text-base group-hover:text-emerald-600 dark:group-hover:text-emerald-300 transition-colors">
              Direct Farm Sourcing
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              Browse freshly harvested produce directly from verified farmers across Sri Lanka.
            </p>
            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
              Shop Now <ArrowRight className="w-3.5 h-3.5" />
            </span>
          </div>

          <div
            onClick={() => navigate('/catalog?b2b=true')}
            className="glass-terminal p-6 rounded-3xl border border-slate-200/80 dark:border-white/10 hover:border-purple-400/50 shadow-xl transition-all cursor-pointer space-y-3 text-left group"
          >
            <div className="w-12 h-12 rounded-2xl bg-purple-500/20 text-purple-600 dark:text-purple-300 border border-purple-400/30 flex items-center justify-center font-black">
              <Building2 className="w-6 h-6" />
            </div>
            <h3 className="font-extrabold text-slate-900 dark:text-white text-base group-hover:text-purple-600 dark:group-hover:text-purple-300 transition-colors">
              B2B Commercial Wholesale
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              Tiered volume discounts for hotels, restaurants, supermarkets, and exporters.
            </p>
            <span className="text-xs font-bold text-purple-600 dark:text-purple-400 flex items-center gap-1">
              View Wholesale Tiers <ArrowRight className="w-3.5 h-3.5" />
            </span>
          </div>

          <div
            onClick={() => navigate('/catalog?grade=Grade%20A')}
            className="glass-terminal p-6 rounded-3xl border border-slate-200/80 dark:border-white/10 hover:border-sky-400/50 shadow-xl transition-all cursor-pointer space-y-3 text-left group"
          >
            <div className="w-12 h-12 rounded-2xl bg-sky-500/20 text-sky-600 dark:text-sky-300 border border-sky-400/30 flex items-center justify-center font-black">
              <Scale className="w-6 h-6" />
            </div>
            <h3 className="font-extrabold text-slate-900 dark:text-white text-base group-hover:text-sky-600 dark:group-hover:text-sky-300 transition-colors">
              Hub Quality Inspection
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              Every crop crate is weighed and graded (A/B/C) at Village Hubs before transit.
            </p>
            <span className="text-xs font-bold text-sky-600 dark:text-sky-400 flex items-center gap-1">
              Browse Grade A <ArrowRight className="w-3.5 h-3.5" />
            </span>
          </div>

          <div
            onClick={() => navigate('/catalog?organic=true')}
            className="glass-terminal p-6 rounded-3xl border border-slate-200/80 dark:border-white/10 hover:border-amber-400/50 shadow-xl transition-all cursor-pointer space-y-3 text-left group"
          >
            <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-600 dark:text-amber-300 border border-amber-400/30 flex items-center justify-center font-black">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="font-extrabold text-slate-900 dark:text-white text-base group-hover:text-amber-600 dark:group-hover:text-amber-300 transition-colors">
              100% Escrow Protection
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              Your money stays locked until you inspect and provide your 6-digit handover OTP.
            </p>
            <span className="text-xs font-bold text-amber-600 dark:text-amber-400 flex items-center gap-1">
              Learn Escrow Flow <ArrowRight className="w-3.5 h-3.5" />
            </span>
          </div>
        </section>
      </div>
    </MarketplaceLayout>
  );
};
