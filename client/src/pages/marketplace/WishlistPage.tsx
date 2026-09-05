import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MarketplaceLayout } from '@/components/templates/MarketplaceLayout';
import { ProductCard } from '@/components/molecules/ProductCard';
import { EmptyState } from '@/components/molecules/EmptyState';
import { Spinner } from '@/components/atoms/Spinner';
import { useWishlistStore } from '@/store/wishlistStore';
import { useCartStore } from '@/store/cartStore';
import { useThemeStore } from '@/store/themeStore';
import { useAuthStore } from '@/store/authStore';
import { useTranslation } from '@/lib/i18n';
import { Heart, ArrowLeft, Sparkles, ArrowRight } from 'lucide-react';

export const WishlistPage: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const { items, itemIds, isLoading, fetchWishlist } = useWishlistStore();
  const { items: cartItems, openCart } = useCartStore();
  const { isDark, toggleTheme, language, setLanguage } = useThemeStore();
  const { user } = useAuthStore();

  useEffect(() => {
    fetchWishlist();
  }, []);

  // Filter out any items without valid populated product data
  const validProducts = items
    .map((item) => {
      const prod = item.productId;
      if (prod && typeof prod === 'object' && prod._id) {
        return prod;
      }
      return null;
    })
    .filter(Boolean);

  return (
    <MarketplaceLayout
      searchQuery=""
      onSearchChange={() => {}}
      cartItemCount={cartItems.length}
      onOpenCart={openCart}
      currentLanguage={language}
      onLanguageChange={setLanguage}
      isDark={isDark}
      onToggleTheme={toggleTheme}
      user={user}
    >
      <div className="space-y-8 pb-16">
        {/* Header Strip */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 dark:border-white/10 pb-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400">
              <button
                type="button"
                onClick={() => navigate('/')}
                className="hover:text-emerald-500 transition-colors flex items-center gap-1 cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Marketplace</span>
              </button>
              <span>/</span>
              <span className="text-slate-900 dark:text-white">Saved Wishlist</span>
            </div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                My Saved Wishlist
              </h1>
              <span className="px-3 py-1 rounded-full bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 font-black text-xs border border-rose-200 dark:border-rose-900/50 flex items-center gap-1.5 shadow-2xs">
                <Heart className="w-3.5 h-3.5 fill-rose-500 text-rose-500" />
                <span>{itemIds.length} {itemIds.length === 1 ? 'crop' : 'crops'}</span>
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => navigate('/')}
            className="px-5 py-2.5 rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-white/10 dark:hover:bg-white/20 text-slate-900 dark:text-white font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <span>Explore Produce</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Loading State */}
        {isLoading && validProducts.length === 0 ? (
          <div className="py-20 flex justify-center">
            <Spinner size="lg" />
          </div>
        ) : validProducts.length === 0 ? (
          /* Empty State */
          <div className="py-12">
            <EmptyState
              icon={<Heart className="w-8 h-8 text-rose-500 fill-rose-500/20" />}
              title="Your Wishlist is Empty"
              description="Save your favorite crops from verified Sri Lankan growers by tapping the heart icon on any harvest lot."
              actionText="Discover Fresh Produce"
              onAction={() => navigate('/')}
            />
          </div>
        ) : (
          /* Wishlist Grid */
          <div className="space-y-4">
            <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-medium">
              <span>Showing {validProducts.length} saved {validProducts.length === 1 ? 'item' : 'items'}</span>
              <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold">
                Tap heart to remove from wishlist
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {validProducts.map((product: any) => (
                <ProductCard
                  key={product._id}
                  id={product._id}
                  title={product.title || product.productName}
                  titleSi={product.titleSi}
                  pricePerUnit={product.basePricePerUnit || product.pricePerUnit}
                  unit={product.unit || 'kg'}
                  category={product.category}
                  images={product.images || []}
                  district={product.district || product.farmId?.district || 'Matale'}
                  isOrganic={product.isOrganic}
                  qualityGrade={product.qualityGrade || product.selfDeclaredGrade || 'Grade A'}
                  minOrderQuantity={product.minOrderQuantity || 1}
                  ratingAverage={product.averageRating || product.ratingAverage || 4.9}
                  farmerName={product.farmerId?.fullName || 'Verified Pola Grower'}
                  onClick={() => navigate(`/product/${product._id}`)}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </MarketplaceLayout>
  );
};
