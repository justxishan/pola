import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MarketplaceLayout } from '@/components/templates/MarketplaceLayout';
import { Breadcrumbs } from '@/components/organisms/Breadcrumbs';
import { ProductCard } from '@/components/molecules/ProductCard';
import { PricingTierTable, PricingTier } from '@/components/molecules/PricingTierTable';
import { QuantityStepper } from '@/components/molecules/QuantityStepper';
import { ReviewCard } from '@/components/molecules/ReviewCard';
import { Spinner } from '@/components/atoms/Spinner';
import { Avatar } from '@/components/atoms/Avatar';
import { ProductService } from '@/services/product.service';
import { RatingService } from '@/services/rating.service';
import { useCartStore } from '@/store/cartStore';
import { useThemeStore } from '@/store/themeStore';
import { useAuthStore } from '@/store/authStore';
import { useWishlistStore } from '@/store/wishlistStore';
import { useTranslation } from '@/lib/i18n';
import {
  MapPin,
  Leaf,
  ShieldCheck,
  ShoppingBag,
  Truck,
  Star,
  Share2,
  Heart,
  Zap,
  Snowflake,
  ArrowRight,
  AlertTriangle,
  Info,
} from 'lucide-react';
import toast from 'react-hot-toast';

export const ProductDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const [product, setProduct] = useState<any>(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [farmerProducts, setFarmerProducts] = useState<any[]>([]);
  const [categoryProducts, setCategoryProducts] = useState<any[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingReviews, setIsLoadingReviews] = useState(false);

  const { items, openCart, addItem } = useCartStore();
  const { isDark, toggleTheme, language, setLanguage } = useThemeStore();
  const { user } = useAuthStore();
  const isWishlisted = useWishlistStore((state) => (id ? state.itemIds.includes(id) : false));
  const toggleWishlist = useWishlistStore((state) => state.toggleItem);

  useEffect(() => {
    if (id) {
      window.scrollTo(0, 0);
      fetchProductDetails(id);
      fetchReviews(id);
    }
  }, [id]);

  const fetchProductDetails = async (productId: string) => {
    try {
      setIsLoading(true);
      const res: any = await ProductService.getProductById(productId);

      if (res.success && res.data && res.data.product) {
        const prod = res.data.product;
        setProduct(prod);
        setSelectedImageIndex(0);
        setQuantity(prod.minOrderQuantity || 1);
        fetchRelatedProducts(prod);
      }
    } catch (err: any) {
      toast.error('Failed to load product details');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchReviews = async (productId: string) => {
    try {
      setIsLoadingReviews(true);
      const res: any = await RatingService.getTargetRatings(undefined, productId);
      if (res.success && res.data) {
        setReviews(res.data.ratings || []);
      }
    } catch (err) {
      console.error('Failed to load product reviews:', err);
    } finally {
      setIsLoadingReviews(false);
    }
  };

  const fetchRelatedProducts = async (prod: any) => {
    try {
      const farmerId =
        prod.farmerId?._id || (typeof prod.farmerId === 'string' ? prod.farmerId : undefined);

      const [farmerRes, catRes]: [any, any] = await Promise.all([
        farmerId
          ? ProductService.getCatalog({ farmerId, limit: 5 })
          : Promise.resolve({ success: true, data: { products: [] } }),
        prod.category
          ? ProductService.getCatalog({ category: prod.category, limit: 5 })
          : Promise.resolve({ success: true, data: { products: [] } }),
      ]);

      if (farmerRes?.data?.products) {
        setFarmerProducts(farmerRes.data.products.filter((p: any) => p._id !== prod._id));
      }
      if (catRes?.data?.products) {
        setCategoryProducts(catRes.data.products.filter((p: any) => p._id !== prod._id));
      }
    } catch (err) {
      console.error('Failed to load related products:', err);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center space-y-4 bg-slate-50 dark:bg-slate-950 px-4">
        <p className="text-base font-semibold text-slate-800 dark:text-slate-200">
          Produce listing not found
        </p>
        <button
          onClick={() => navigate('/')}
          className="px-6 py-2.5 rounded-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs cursor-pointer shadow-md transition-all"
        >
          Back to Marketplace
        </button>
      </div>
    );
  }

  const defaultImage =
    'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=800&q=80';
  const images = product.images && product.images.length > 0 ? product.images : [defaultImage];

  const availableStock =
    product.availableQuantity !== undefined && product.availableQuantity !== null
      ? product.availableQuantity
      : 0;
  const isDecimalUnit = ['kg', 'g', 'l', 'ml'].includes((product.unit || 'kg').toLowerCase());
  const step = isDecimalUnit ? 0.5 : 1;
  const minQty = product.minOrderQuantity || (isDecimalUnit ? 0.5 : 1);

  // Dynamic Tier Calculation
  const basePrice = product.basePricePerUnit || product.pricePerUnit || 0;
  let activePrice = basePrice;
  const rawTiers = product.b2bPricingTiers || product.pricingTiers || [];

  if (rawTiers.length > 0) {
    const matchedTier = [...rawTiers]
      .reverse()
      .find((tier: any) => quantity >= tier.minQuantity);
    if (matchedTier) {
      activePrice = matchedTier.unitPrice || matchedTier.pricePerUnit || basePrice;
    }
  }

  const tiers: PricingTier[] = rawTiers.map((t: any) => {
    const tierUnitPrice = t.unitPrice || t.pricePerUnit || basePrice;
    return {
      minQuantity: t.minQuantity,
      maxQuantity: t.maxQuantity,
      pricePerUnit: tierUnitPrice,
      discountPercentage:
        basePrice > 0 ? Math.round(((basePrice - tierUnitPrice) / basePrice) * 100) : 0,
    };
  });

  const totalCalculated = activePrice * quantity;
  const isLowStock = availableStock > 0 && availableStock < minQty * 10;

  const handleAddToCart = (itemToCart: any = product, qty: number = quantity) => {
    if (availableStock <= 0) {
      toast.error('This harvest lot is currently out of stock.');
      return;
    }
    addItem({
      productId: itemToCart._id,
      title: itemToCart.title || itemToCart.productName,
      pricePerUnit: activePrice,
      unit: itemToCart.unit || 'kg',
      quantity: qty,
      image: itemToCart.images?.[0] || images[0],
      farmerName: itemToCart.farmerId?.fullName || 'Verified Pola Grower',
      minOrderQuantity: itemToCart.minOrderQuantity || 1,
      maxOrderQuantity: availableStock,
    });
    toast.success(`Added ${qty} ${itemToCart.unit || 'kg'} of ${itemToCart.title || itemToCart.productName} to your basket!`);
  };

  const handleBuyNow = () => {
    if (availableStock <= 0) {
      toast.error('This harvest lot is currently out of stock.');
      return;
    }
    handleAddToCart();
    navigate('/checkout');
  };

  const handleWishlistToggle = () => {
    if (!user) {
      navigate(`/customer/login?redirect=/product/${product._id}`);
      return;
    }
    toggleWishlist(product._id);
    toast.success(isWishlisted ? 'Removed from wishlist' : 'Saved to wishlist');
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: product.title || product.productName,
          text: `Check out ${product.title || product.productName} on Pola Marketplace!`,
          url: window.location.href,
        });
      } catch (err) {
        // User dismissed share dialog
      }
    } else {
      await navigator.clipboard.writeText(window.location.href);
      toast.success('Link copied to clipboard!');
    }
  };

  const farmerIdStr =
    product.farmerId?._id || (typeof product.farmerId === 'string' ? product.farmerId : '');
  const farmerName = product.farmerId?.fullName || 'Verified Pola Grower';
  const districtName =
    product.district ||
    product.farmId?.district ||
    product.farmId?.location?.district ||
    'Matale';

  // Specification Items
  const specifications: { label: string; value: string }[] = [];
  if (product.variety) specifications.push({ label: 'Crop Variety', value: product.variety });
  if (product.qualityGrade || product.selfDeclaredGrade) {
    specifications.push({
      label: 'Quality Classification',
      value: product.qualityGrade || product.selfDeclaredGrade,
    });
  }
  if (districtName) {
    specifications.push({ label: 'Harvest District', value: `${districtName}, Sri Lanka` });
  }
  if (product.seasonTag || product.season) {
    const seasonDisplay =
      product.seasonTag === 'maha'
        ? 'Maha Season Harvest'
        : product.seasonTag === 'yala'
        ? 'Yala Season Harvest'
        : 'Year-round Cultivation';
    specifications.push({ label: 'Cultivation Season', value: seasonDisplay });
  }
  if (product.harvestDate) {
    specifications.push({
      label: 'Harvest Date',
      value: new Date(product.harvestDate).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      }),
    });
  }
  if (product.shelfLifeDays) {
    specifications.push({ label: 'Shelf Life', value: `${product.shelfLifeDays} days from dispatch` });
  }
  if (product.requiresColdChain !== undefined) {
    specifications.push({
      label: 'Cold Chain Handling',
      value: product.requiresColdChain
        ? 'Refrigerated transit required (Hub cold-storage active)'
        : 'Standard ambient transport',
    });
  }
  if (product.unit) {
    specifications.push({ label: 'Selling Unit', value: `Per ${product.unit.toUpperCase()}` });
  }

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
      <div className="space-y-8 pb-20 md:pb-8">
        {/* 1. Breadcrumbs */}
        <Breadcrumbs
          items={[
            {
              label: product.category ? product.category.charAt(0).toUpperCase() + product.category.slice(1) : 'Produce',
              path: `/?category=${product.category}`,
            },
            { label: product.title || product.productName },
          ]}
          onNavigate={(path) => navigate(path)}
        />

        {/* 2. Main Two-Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Image Gallery (7 cols) */}
          <div className="lg:col-span-7 space-y-4">
            <div className="relative aspect-4/3 sm:aspect-16/11 w-full rounded-3xl overflow-hidden bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-white/10 shadow-xl flex items-center justify-center">
              <img
                src={images[selectedImageIndex]}
                alt={product.title || product.productName}
                className="w-full h-full object-cover brightness-95"
              />

              {/* Floating Badges */}
              <div className="absolute top-4 left-4 flex flex-col gap-2 items-start">
                <span className="px-3 py-1 rounded-full bg-slate-900/80 backdrop-blur-md text-white font-extrabold text-xs uppercase tracking-wider flex items-center gap-1.5 shadow-md border border-white/10">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  {product.qualityGrade || product.selfDeclaredGrade || 'Grade A'}
                </span>
                {product.isOrganic && (
                  <span className="px-3 py-1 rounded-full bg-emerald-500/90 backdrop-blur-md text-white font-black text-xs flex items-center gap-1.5 shadow-md">
                    <Leaf className="w-3.5 h-3.5" />
                    100% Organic
                  </span>
                )}
                {product.requiresColdChain && (
                  <span className="px-3 py-1 rounded-full bg-sky-500/90 backdrop-blur-md text-white font-black text-xs flex items-center gap-1.5 shadow-md">
                    <Snowflake className="w-3.5 h-3.5" />
                    Cold Chain
                  </span>
                )}
              </div>

              {/* District Badge */}
              <div className="absolute top-4 right-4">
                <span className="px-3 py-1 rounded-full bg-slate-900/80 backdrop-blur-md text-white font-bold text-xs flex items-center gap-1.5 border border-white/10 shadow-md">
                  <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                  {districtName}
                </span>
              </div>
            </div>

            {/* Thumbnail Strip */}
            {images.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-1 no-scrollbar">
                {images.map((img: string, idx: number) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setSelectedImageIndex(idx)}
                    className={`relative w-20 h-20 rounded-2xl overflow-hidden border-2 transition-all shrink-0 cursor-pointer ${
                      selectedImageIndex === idx
                        ? 'border-emerald-500 ring-2 ring-emerald-500/30'
                        : 'border-slate-200 dark:border-white/10 opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right Column: Header & Buy Box (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-200/80 dark:border-white/10 shadow-xl space-y-6">
              {/* Category, Farmer, Actions Row */}
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={() => navigate(`/?category=${product.category}`)}
                    className="text-xs font-black uppercase tracking-wider text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 px-3 py-1 rounded-full hover:bg-emerald-100 dark:hover:bg-emerald-900/50 transition-colors cursor-pointer"
                  >
                    {product.category}
                  </button>

                  <div className="flex items-center gap-2">
                    {/* Share Button */}
                    <button
                      type="button"
                      onClick={handleShare}
                      className="p-2.5 rounded-full border border-slate-200 dark:border-white/10 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                      title="Share product"
                      aria-label="Share product"
                    >
                      <Share2 className="w-4 h-4" />
                    </button>

                    {/* Wishlist Heart */}
                    <button
                      type="button"
                      onClick={handleWishlistToggle}
                      className={`p-2.5 rounded-full border transition-all cursor-pointer ${
                        isWishlisted
                          ? 'bg-rose-50 dark:bg-rose-950/40 text-rose-500 border-rose-200 dark:border-rose-900/50'
                          : 'border-slate-200 dark:border-white/10 text-slate-500 dark:text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30'
                      }`}
                      title={isWishlisted ? 'Remove from wishlist' : 'Save to wishlist'}
                      aria-label={isWishlisted ? 'Remove from wishlist' : 'Save to wishlist'}
                    >
                      <Heart
                        className={`w-4 h-4 ${isWishlisted ? 'fill-rose-500 text-rose-500' : ''}`}
                      />
                    </button>
                  </div>
                </div>

                <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white leading-tight">
                  {product.title || product.productName}
                </h1>
                {product.titleSi && (
                  <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">
                    {product.titleSi}
                  </p>
                )}

                {/* Farmer attribution + Rating */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100 dark:border-white/10 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="text-slate-500 dark:text-slate-400">Grown by</span>
                    {farmerIdStr ? (
                      <button
                        type="button"
                        onClick={() => navigate(`/?farmerId=${farmerIdStr}`)}
                        className="font-bold text-slate-900 dark:text-white hover:text-emerald-600 dark:hover:text-emerald-400 underline decoration-slate-300 dark:decoration-slate-700 cursor-pointer"
                      >
                        {farmerName}
                      </button>
                    ) : (
                      <span className="font-bold text-slate-900 dark:text-white">{farmerName}</span>
                    )}
                  </div>

                  <a
                    href="#customer-reviews"
                    className="flex items-center gap-1.5 font-bold text-amber-500 hover:text-amber-600 transition-colors"
                  >
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    <span>{(product.averageRating || 4.9).toFixed(1)}</span>
                    <span className="text-slate-400 font-normal">
                      ({product.ratingCount || reviews.length} reviews)
                    </span>
                  </a>
                </div>
              </div>

              {/* 3. Pricing Block */}
              <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 dark:bg-black/40 border border-slate-200/80 dark:border-white/10 space-y-3">
                <div className="flex items-baseline justify-between gap-2">
                  <div>
                    <span className="text-3xl font-black text-emerald-600 dark:text-emerald-400 font-mono">
                      LKR {activePrice.toLocaleString()}
                    </span>
                    <span className="text-xs text-slate-500 dark:text-slate-400 font-bold ml-1.5">
                      per {product.unit || 'kg'}
                    </span>
                  </div>

                  {activePrice < basePrice && (
                    <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[11px] font-black border border-emerald-500/20">
                      Tier savings applied
                    </span>
                  )}
                </div>

                {/* Stock & MOQ Indicators */}
                <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
                  <span
                    className={`font-bold px-2.5 py-0.5 rounded-full ${
                      availableStock > 0
                        ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400'
                        : 'bg-rose-500/10 text-rose-600 dark:text-rose-400'
                    }`}
                  >
                    {availableStock > 0
                      ? `In Stock: ${availableStock} ${product.unit || 'kg'}`
                      : 'Out of Stock'}
                  </span>

                  <span className="text-slate-500 dark:text-slate-400 font-medium">
                    MOQ: {minQty} {product.unit || 'kg'}
                  </span>

                  {isLowStock && (
                    <span className="inline-flex items-center gap-1 font-bold text-amber-600 dark:text-amber-400 bg-amber-500/10 px-2.5 py-0.5 rounded-full border border-amber-500/20">
                      <AlertTriangle className="w-3 h-3" /> Low Stock
                    </span>
                  )}
                </div>

                {/* Volume Tier Table if available */}
                {tiers.length > 0 && (
                  <div className="pt-2">
                    <PricingTierTable
                      unit={product.unit || 'kg'}
                      basePrice={basePrice}
                      tiers={tiers}
                      selectedQuantity={quantity}
                    />
                  </div>
                )}
              </div>

              {/* 4. Quantity Stepper & Action Buttons */}
              <div className="space-y-4">
                <div className="flex items-center justify-between gap-4">
                  <div className="space-y-1">
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      Order Quantity
                    </span>
                    <p className="text-[11px] text-slate-400">
                      Total: LKR {totalCalculated.toLocaleString()}
                    </p>
                  </div>
                  <QuantityStepper
                    value={quantity}
                    onChange={(val) => setQuantity(val)}
                    min={minQty}
                    max={availableStock > 0 ? availableStock : 1}
                    step={step}
                    unit={product.unit || 'kg'}
                    disabled={availableStock <= 0}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  <button
                    type="button"
                    disabled={availableStock <= 0}
                    onClick={() => handleAddToCart()}
                    className="w-full py-3.5 px-5 rounded-full bg-emerald-500 hover:bg-emerald-400 dark:bg-emerald-400 dark:hover:bg-emerald-300 disabled:bg-slate-300 dark:disabled:bg-slate-800 disabled:text-slate-500 disabled:cursor-not-allowed text-white dark:text-slate-950 font-black text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 transition-all cursor-pointer"
                  >
                    <ShoppingBag className="w-4 h-4" />
                    <span>{availableStock > 0 ? 'Add to Basket' : 'Out of Stock'}</span>
                  </button>

                  <button
                    type="button"
                    disabled={availableStock <= 0}
                    onClick={handleBuyNow}
                    className="w-full py-3.5 px-5 rounded-full bg-slate-900 hover:bg-slate-800 dark:bg-white/10 dark:hover:bg-white/20 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer border border-slate-900 dark:border-white/15"
                  >
                    <Zap className="w-4 h-4 text-emerald-400" />
                    <span>Buy Now</span>
                  </button>
                </div>
              </div>

              {/* 5. Delivery Estimate Strip */}
              <div className="p-4 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/20 border border-emerald-200/60 dark:border-emerald-500/20 space-y-2 text-xs">
                <div className="flex items-center gap-2 font-bold text-emerald-800 dark:text-emerald-300">
                  <Truck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <span>Two-Leg Village-to-Doorstep Logistics</span>
                </div>
                <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed">
                  Harvested fresh upon your order. Transported from local village collection hub to
                  regional distribution facility, then straight to your doorstep with guaranteed delivery verification.
                </p>
                <div className="pt-2 border-t border-emerald-200/50 dark:border-emerald-500/20 flex items-center gap-1.5 text-[11px] font-bold text-emerald-700 dark:text-emerald-400">
                  <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
                  <span>100% Escrow Protected — Funds released only after delivery inspection.</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 6. Product Information (Specification Table) */}
        {specifications.length > 0 && (
          <section className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-200/80 dark:border-white/10 shadow-xl space-y-4">
            <h2 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
              <Info className="w-5 h-5 text-emerald-500" />
              Crop Specifications & Harvest Details
            </h2>
            <div className="divide-y divide-slate-100 dark:divide-white/5 border-t border-slate-100 dark:border-white/5 text-xs">
              {specifications.map((spec, idx) => (
                <div key={idx} className="py-3.5 grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <span className="font-semibold text-slate-500 dark:text-slate-400">
                    {spec.label}
                  </span>
                  <span className="sm:col-span-2 font-bold text-slate-800 dark:text-slate-200">
                    {spec.value}
                  </span>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* 7. Farm & Origin Profile Card */}
        <section className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-200/80 dark:border-white/10 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <Avatar
              src={product.farmerId?.profileImage}
              name={farmerName}
              size="lg"
            />
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h3 className="font-black text-base sm:text-lg text-slate-900 dark:text-white">
                  {farmerName}
                </h3>
                {product.farmerId?.kycStatus === 'verified' && (
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-black border border-emerald-500/20">
                    Verified Grower
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {product.farmId?.farmName || 'Registered Agricultural Holding'} • {districtName}, Sri Lanka
              </p>
              <p className="text-xs text-slate-600 dark:text-slate-300 pt-1">
                Direct village harvest partner operating under standard Pola quality inspection protocols.
              </p>
            </div>
          </div>

          {farmerIdStr && (
            <button
              type="button"
              onClick={() => navigate(`/?farmerId=${farmerIdStr}`)}
              className="px-5 py-2.5 rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-white/10 dark:hover:bg-white/20 text-slate-900 dark:text-white font-bold text-xs flex items-center gap-2 transition-all shrink-0 cursor-pointer"
            >
              <span>View Farmer's Other Listings</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </section>

        {/* 8. Description */}
        {product.description && (
          <section className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-200/80 dark:border-white/10 shadow-xl space-y-3">
            <h2 className="text-lg font-black text-slate-900 dark:text-white">Harvest Description</h2>
            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-line">
              {product.description}
            </p>
          </section>
        )}

        {/* 9. Reviews Section */}
        <section
          id="customer-reviews"
          className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-200/80 dark:border-white/10 shadow-xl space-y-6"
        >
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 dark:border-white/10 pb-4">
            <div>
              <h2 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white">
                Customer Reviews & Quality Feedback
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Feedback from buyers who received and verified this produce via Pola delivery.
              </p>
            </div>

            <div className="flex items-center gap-2 bg-amber-500/10 dark:bg-amber-500/15 px-3.5 py-1.5 rounded-2xl border border-amber-500/20">
              <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
              <span className="font-black text-sm text-amber-600 dark:text-amber-400">
                {(product.averageRating || 4.9).toFixed(1)} / 5.0
              </span>
              <span className="text-xs text-slate-400 ml-1">
                ({product.ratingCount || reviews.length} verified ratings)
              </span>
            </div>
          </div>

          {isLoadingReviews ? (
            <div className="py-8 flex justify-center">
              <Spinner size="md" />
            </div>
          ) : reviews.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {reviews.map((rev: any) => (
                <ReviewCard
                  key={rev._id}
                  userName={rev.raterUserId?.fullName || 'Verified Customer'}
                  userAvatar={rev.raterUserId?.profileImage}
                  rating={rev.ratingScore || 5}
                  createdAt={rev.createdAt}
                  comment={rev.reviewText}
                  isVerifiedBuyer={true}
                />
              ))}
            </div>
          ) : (
            <div className="py-8 text-center space-y-2">
              <p className="text-xs text-slate-500 dark:text-slate-400">
                No buyer reviews have been submitted for this lot yet.
              </p>
              <p className="text-[11px] text-slate-400">
                Reviews are collected exclusively from buyers who complete order inspection upon delivery.
              </p>
            </div>
          )}
        </section>

        {/* 10. Related Products: Shelf 1 - More from this farmer */}
        {farmerProducts.length > 0 && (
          <section className="space-y-4 pt-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white">
                  More from {farmerName}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Other active harvest lots from this farmer's registered acreage.
                </p>
              </div>
              {farmerIdStr && (
                <button
                  type="button"
                  onClick={() => navigate(`/?farmerId=${farmerIdStr}`)}
                  className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1 cursor-pointer"
                >
                  View All <ArrowRight className="w-3 h-3" />
                </button>
              )}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {farmerProducts.slice(0, 4).map((p) => (
                <ProductCard
                  key={p._id}
                  id={p._id}
                  title={p.title || p.productName}
                  titleSi={p.titleSi}
                  pricePerUnit={p.basePricePerUnit || p.pricePerUnit}
                  unit={p.unit || 'kg'}
                  category={p.category}
                  images={p.images}
                  district={p.district || p.farmId?.district || 'Matale'}
                  isOrganic={p.isOrganic}
                  qualityGrade={p.qualityGrade || p.selfDeclaredGrade || 'Grade A'}
                  minOrderQuantity={p.minOrderQuantity || 1}
                  ratingAverage={p.averageRating || p.ratingAverage || 4.9}
                  farmerName={farmerName}
                  onClick={() => navigate(`/product/${p._id}`)}
                />
              ))}
            </div>
          </section>
        )}

        {/* 10. Related Products: Shelf 2 - You May Also Like (Category) */}
        {categoryProducts.length > 0 && (
          <section className="space-y-4 pt-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white">
                  You May Also Like
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Similar {product.category} crops harvested recently across Sri Lanka.
                </p>
              </div>
              <button
                type="button"
                onClick={() => navigate(`/?category=${product.category}`)}
                className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1 cursor-pointer"
              >
                Browse {product.category} <ArrowRight className="w-3 h-3" />
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {categoryProducts.slice(0, 4).map((p) => (
                <ProductCard
                  key={p._id}
                  id={p._id}
                  title={p.title || p.productName}
                  titleSi={p.titleSi}
                  pricePerUnit={p.basePricePerUnit || p.pricePerUnit}
                  unit={p.unit || 'kg'}
                  category={p.category}
                  images={p.images}
                  district={p.district || p.farmId?.district || 'Matale'}
                  isOrganic={p.isOrganic}
                  qualityGrade={p.qualityGrade || p.selfDeclaredGrade || 'Grade A'}
                  minOrderQuantity={p.minOrderQuantity || 1}
                  ratingAverage={p.averageRating || p.ratingAverage || 4.9}
                  farmerName={p.farmerId?.fullName || 'Verified Pola Grower'}
                  onClick={() => navigate(`/product/${p._id}`)}
                />
              ))}
            </div>
          </section>
        )}
      </div>

      {/* 11. Mobile Sticky Bottom Action Bar */}
      <div className="block md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200 dark:border-white/10 p-3 shadow-2xl">
        <div className="flex items-center justify-between gap-3">
          <div className="leading-tight">
            <span className="text-base font-black text-emerald-600 dark:text-emerald-400 font-mono block">
              LKR {activePrice.toLocaleString()}
            </span>
            <span className="text-[10px] text-slate-500 dark:text-slate-400">
              per {product.unit || 'kg'}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={availableStock <= 0}
              onClick={() => handleAddToCart()}
              className="px-4 py-2.5 rounded-full bg-emerald-500 hover:bg-emerald-400 dark:bg-emerald-400 dark:hover:bg-emerald-300 disabled:opacity-40 text-white dark:text-slate-950 font-black text-xs flex items-center gap-1.5 shadow-md transition-all cursor-pointer"
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>Add</span>
            </button>

            <button
              type="button"
              disabled={availableStock <= 0}
              onClick={handleBuyNow}
              className="px-4 py-2.5 rounded-full bg-slate-900 hover:bg-slate-800 dark:bg-white/20 disabled:opacity-40 text-white font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <Zap className="w-3.5 h-3.5 text-emerald-400" />
              <span>Buy</span>
            </button>
          </div>
        </div>
      </div>
    </MarketplaceLayout>
  );
};
