import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MarketplaceLayout } from '@/components/templates/MarketplaceLayout';
import { Breadcrumbs } from '@/components/organisms/Breadcrumbs';
import { ProductCard } from '@/components/molecules/ProductCard';
import { Spinner } from '@/components/atoms/Spinner';
import { ProductService } from '@/services/product.service';
import { useCartStore } from '@/store/cartStore';
import { useThemeStore } from '@/store/themeStore';
import { useAuthStore } from '@/store/authStore';
import { useTranslation } from '@/lib/i18n';
import {
  MapPin,
  Leaf,
  ShieldCheck,
  ShoppingBag,
  Truck,
  Calendar,
  Sprout,
  Star,
  Plus,
  Minus,
  CheckCircle2,
  Building2,
  Share2,
  Heart,
  Zap,
} from 'lucide-react';
import toast from 'react-hot-toast';

export const ProductDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const [product, setProduct] = useState<any>(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [relatedProducts, setRelatedProducts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const { items, openCart, addItem } = useCartStore();
  const { isDark, toggleTheme, language, setLanguage } = useThemeStore();
  const { user } = useAuthStore();

  useEffect(() => {
    if (id) fetchProductDetails(id);
  }, [id]);

  const fetchProductDetails = async (productId: string) => {
    try {
      setIsLoading(true);
      const [res, relatedRes]: [any, any] = await Promise.all([
        ProductService.getProductById(productId),
        ProductService.getCatalog({ limit: 4 }),
      ]);

      if (res.success && res.data) {
        setProduct(res.data.product);
        setQuantity(res.data.product.minOrderQuantity || 1);
      }
      if (relatedRes.success && relatedRes.data) {
        setRelatedProducts(
          (relatedRes.data.products || []).filter((p: any) => p._id !== productId)
        );
      }
    } catch (err: any) {
      toast.error('Failed to load product details');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center space-y-4">
        <p className="text-sm font-semibold text-white">Produce listing not found</p>
        <button
          onClick={() => navigate('/catalog')}
          className="px-6 py-2.5 rounded-full bg-emerald-400 text-slate-950 font-bold text-xs"
        >
          Back to Catalog
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
  let activePrice = product.pricePerUnit;
  if (product.pricingTiers && product.pricingTiers.length > 0) {
    const matchedTier = [...product.pricingTiers]
      .reverse()
      .find((tier: any) => quantity >= tier.minQuantity);
    if (matchedTier) {
      activePrice = matchedTier.pricePerUnit;
    }
  }

  const totalCalculated = activePrice * quantity;

  const handleAddToCart = (itemToCart: any = product, qty: number = quantity) => {
    if (availableStock <= 0) {
      toast.error('This harvest listing is currently out of stock.');
      return;
    }
    addItem({
      productId: itemToCart._id,
      title: itemToCart.title,
      pricePerUnit: activePrice,
      unit: itemToCart.unit,
      quantity: qty,
      image: itemToCart.images?.[0] || images[0],
      farmerName: itemToCart.farmerId?.fullName || 'Pola Farmer',
      minOrderQuantity: itemToCart.minOrderQuantity || 1,
      maxOrderQuantity: availableStock,
    });
    toast.success(`Added ${qty} ${itemToCart.unit} of ${itemToCart.title} to your basket!`);
  };

  const handleBuyNow = () => {
    if (availableStock <= 0) {
      toast.error('This harvest listing is currently out of stock.');
      return;
    }
    handleAddToCart();
    openCart();
  };

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
      <div className="space-y-8">
        {/* Breadcrumb Capsules */}
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-400">
          <button onClick={() => navigate('/')} className="hover:text-emerald-400">Home</button>
          <span>/</span>
          <button onClick={() => navigate('/catalog')} className="hover:text-emerald-400">Produce Catalog</button>
          <span>/</span>
          <span className="text-white truncate max-w-xs">{product.title}</span>
        </div>

        {/* Main PDP 3-Column Glassmorphic Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* 1. Left Gallery (5 Columns) */}
          <div className="lg:col-span-5 space-y-4">
            <div className="relative aspect-square w-full rounded-3xl overflow-hidden glass-terminal border border-white/10 shadow-2xl">
              <img
                src={images[selectedImageIndex]}
                alt={product.title}
                className="w-full h-full object-cover brightness-95 contrast-105"
              />
              <div className="absolute top-4 left-4 flex flex-col gap-2">
                <span className="px-3 py-1 rounded-full bg-emerald-500/80 backdrop-blur-md text-slate-950 font-black text-xs uppercase tracking-wider flex items-center gap-1 shadow-md">
                  <ShieldCheck className="w-4 h-4 text-slate-950" />
                  {product.qualityGrade || 'Grade A Verified'}
                </span>
                {product.isOrganic && (
                  <span className="px-3 py-1 rounded-full bg-black/60 backdrop-blur-md text-emerald-300 border border-emerald-400/30 font-extrabold text-xs flex items-center gap-1">
                    <Leaf className="w-3.5 h-3.5 text-emerald-400" />
                    Organic Certified
                  </span>
                )}
              </div>
            </div>

            {/* Thumbnails */}
            {images.length > 1 && (
              <div className="flex gap-3 overflow-x-auto no-scrollbar">
                {images.map((img: string, idx: number) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setSelectedImageIndex(idx)}
                    className={`relative w-20 h-20 rounded-2xl overflow-hidden border-2 transition-all shrink-0 cursor-pointer ${
                      selectedImageIndex === idx
                        ? 'border-emerald-400 ring-2 ring-emerald-500/30'
                        : 'border-white/10 opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* 2. Center Product Details (4 Columns) */}
          <div className="lg:col-span-4 glass-terminal p-6 sm:p-8 rounded-3xl border border-white/10 space-y-6 shadow-2xl">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-400">
                <span className="capitalize font-mono text-emerald-400">{product.category}</span>
                <span>•</span>
                <span className="flex items-center gap-1 text-slate-300 font-bold">
                  <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                  {product.district || product.farmId?.location?.district || 'Matale'}, Sri Lanka
                </span>
              </div>

              <h1 className="text-2xl sm:text-3xl font-black text-white leading-tight">
                {product.title}
              </h1>
              {product.titleSi && (
                <p className="text-sm font-semibold text-slate-400">
                  {product.titleSi}
                </p>
              )}

              {/* Rating & Reviews */}
              <div className="flex items-center gap-2 pt-1">
                <div className="flex items-center gap-1 font-bold text-amber-400 text-sm">
                  <Star className="w-4 h-4 fill-amber-400" />
                  <span>{(product.ratingAverage || 4.9).toFixed(1)}</span>
                </div>
                <span className="text-xs text-slate-400">
                  ({product.reviews?.length || 18} Verified Buyer Reviews)
                </span>
              </div>
            </div>

            {/* Price & Unit */}
            <div className="p-4 rounded-2xl bg-black/40 border border-white/10 space-y-1.5">
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-black text-emerald-400 font-mono">
                  LKR {activePrice.toLocaleString()}
                </span>
                <span className="text-xs text-slate-300 font-bold">per {product.unit || 'kg'}</span>
              </div>
              {activePrice < product.pricePerUnit && (
                <p className="text-xs font-bold text-emerald-300 flex items-center gap-1">
                  <Zap className="w-3.5 h-3.5" />
                  <span>Tiered volume discount applied! (Saved LKR {(product.pricePerUnit - activePrice) * quantity})</span>
                </p>
              )}
            </div>

            {/* Description */}
            <p className="text-xs text-slate-300 leading-relaxed">
              {product.description ||
                'Freshly harvested directly from certified agricultural fields. Shipped in standardized crates with temperature-controlled hub intake.'}
            </p>

            {/* B2B Tier Table */}
            {product.pricingTiers && product.pricingTiers.length > 0 && (
              <div className="space-y-2 pt-2 border-t border-white/10">
                <h4 className="text-xs font-extrabold text-white uppercase tracking-wider flex items-center gap-1.5">
                  <Building2 className="w-4 h-4 text-emerald-400" />
                  B2B Wholesale Tiered Discounts
                </h4>
                <div className="grid grid-cols-3 gap-2 text-center text-xs">
                  {product.pricingTiers.map((tier: any, idx: number) => (
                    <div
                      key={idx}
                      className={`p-2.5 rounded-xl border transition-all ${
                        quantity >= tier.minQuantity
                          ? 'border-emerald-400 bg-emerald-500/20 text-emerald-300 font-bold'
                          : 'border-white/10 bg-white/5 text-slate-400'
                      }`}
                    >
                      <span className="text-[10px] block text-slate-400 font-mono">
                        {tier.minQuantity}+ {product.unit}
                      </span>
                      <span className="font-mono">LKR {tier.pricePerUnit}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* 3. Right Buy Box (3 Columns) */}
          <div className="lg:col-span-3 glass-terminal p-6 sm:p-8 rounded-3xl border border-white/10 shadow-2xl space-y-6">
            <div className="space-y-1">
              <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">Total Order Value</span>
              <div className="text-3xl font-black text-white font-mono">
                LKR {totalCalculated.toLocaleString()}.00
              </div>
              <span className={`text-[11px] font-semibold block ${availableStock > 0 ? 'text-emerald-400' : 'text-rose-400 font-bold'}`}>
                {availableStock > 0
                  ? `In Stock: ${availableStock} ${product.unit || 'kg'} available`
                  : 'Out of Stock'}
              </span>
            </div>

            {/* Quantity Stepper */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-300">
                Quantity ({product.unit || 'kg'})
              </label>
              <div className="flex items-center border border-white/15 rounded-2xl overflow-hidden bg-black/40 p-1">
                <button
                  type="button"
                  disabled={availableStock <= 0 || quantity <= minQty}
                  onClick={() => setQuantity(Math.max(minQty, Number((quantity - step).toFixed(2))))}
                  className="p-2 rounded-xl text-slate-300 hover:text-white hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <input
                  type="number"
                  step={step}
                  min={minQty}
                  max={availableStock > 0 ? availableStock : 99999}
                  disabled={availableStock <= 0}
                  value={quantity}
                  onChange={(e) => {
                    const parsed = isDecimalUnit ? parseFloat(e.target.value) : parseInt(e.target.value);
                    if (isNaN(parsed)) {
                      setQuantity(minQty);
                    } else {
                      const clamped = Math.max(minQty, Math.min(availableStock > 0 ? availableStock : 99999, parsed));
                      setQuantity(clamped);
                    }
                  }}
                  className="w-full text-center text-sm font-black bg-transparent text-white outline-none font-mono disabled:opacity-40"
                />
                <button
                  type="button"
                  disabled={availableStock <= 0 || (availableStock > 0 && quantity >= availableStock)}
                  onClick={() => {
                    if (availableStock > 0 && quantity >= availableStock) {
                      toast.error(`Maximum available stock is ${availableStock} ${product.unit || 'kg'}`);
                      return;
                    }
                    const nextVal = Number((quantity + step).toFixed(2));
                    setQuantity(Math.min(availableStock > 0 ? availableStock : 99999, nextVal));
                  }}
                  className="p-2 rounded-xl text-slate-300 hover:text-white hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-2.5 pt-2">
              <button
                type="button"
                disabled={availableStock <= 0}
                onClick={handleAddToCart}
                className="w-full py-3.5 px-6 rounded-full bg-emerald-400 hover:bg-emerald-300 disabled:bg-slate-700 disabled:text-slate-400 disabled:cursor-not-allowed text-slate-950 font-black text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/25 transition-all cursor-pointer"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>{availableStock > 0 ? 'Add to Basket' : 'Out of Stock'}</span>
              </button>

              <button
                type="button"
                disabled={availableStock <= 0}
                onClick={handleBuyNow}
                className="w-full py-3.5 px-6 rounded-full bg-white/10 hover:bg-white/20 disabled:bg-white/5 disabled:text-slate-500 disabled:cursor-not-allowed border border-white/15 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <Zap className="w-4 h-4 text-emerald-400" />
                <span>Instant Checkout</span>
              </button>
            </div>

            {/* Escrow Trust Guarantee */}
            <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-400/20 text-xs text-emerald-300 space-y-1">
              <div className="flex items-center gap-1.5 font-bold">
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>100% Escrow Protection</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-tight">
                Funds released to farmer only after you inspect produce and provide delivery OTP.
              </p>
            </div>
          </div>
        </div>

        {/* Related Produce Shelf */}
        {relatedProducts.length > 0 && (
          <section className="space-y-4 pt-8 border-t border-white/10">
            <h3 className="text-xl sm:text-2xl font-black text-white">
              Frequently Bought Together &{' '}
              <span className="font-serif-accent italic font-normal text-emerald-300">
                Related Crops
              </span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.map((p) => (
                <ProductCard
                  key={p._id}
                  id={p._id}
                  title={p.title}
                  titleSi={p.titleSi}
                  pricePerUnit={p.pricePerUnit}
                  unit={p.unit || 'kg'}
                  category={p.category}
                  images={p.images}
                  district={p.district || p.farmId?.location?.district || 'Matale'}
                  isOrganic={p.isOrganic}
                  qualityGrade={p.qualityGrade || 'Grade A'}
                  minOrderQuantity={p.minOrderQuantity || 1}
                  ratingAverage={p.ratingAverage || 4.9}
                  farmerName={p.farmerId?.fullName || 'Verified Pola Grower'}
                  onAddToCart={() => handleAddToCart(p, 1)}
                  onClick={() => navigate(`/product/${p._id}`)}
                />
              ))}
            </div>
          </section>
        )}
      </div>
    </MarketplaceLayout>
  );
};
