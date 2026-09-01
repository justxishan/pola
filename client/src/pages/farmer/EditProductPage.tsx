import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { DashboardLayout } from '@/components/templates/DashboardLayout';
import { Input } from '@/components/atoms/Input';
import { Select } from '@/components/atoms/Select';
import { Button } from '@/components/atoms/Button';
import { Spinner } from '@/components/atoms/Spinner';
import { ProductService } from '@/services/product.service';
import { FarmService } from '@/services/farm.service';
import { useAuthStore } from '@/store/authStore';
import { useThemeStore } from '@/store/themeStore';
import { useTranslation } from '@/lib/i18n';
import {
  LayoutDashboard,
  Sprout,
  Package,
  Wallet,
  ShoppingBag,
  ArrowRight,
  ArrowLeft,
  Plus,
  Trash2,
  MapPin,
} from 'lucide-react';
import toast from 'react-hot-toast';

export const EditProductPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const { isDark, toggleTheme, language, setLanguage } = useThemeStore();
  const { t } = useTranslation();

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [farms, setFarms] = useState<any[]>([]);

  // Form State
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('vegetables');
  const [farmId, setFarmId] = useState('');
  const [unit, setUnit] = useState('kg');
  const [pricePerUnit, setPricePerUnit] = useState('250');
  const [minOrderQuantity, setMinOrderQuantity] = useState('1');
  const [availableQuantity, setAvailableQuantity] = useState('100');
  const [isOrganic, setIsOrganic] = useState(false);
  const [season, setSeason] = useState('year_round');
  const [description, setDescription] = useState('');
  const [pricingTiers, setPricingTiers] = useState<
    Array<{ minQuantity: number; maxQuantity?: number; pricePerUnit: number }>
  >([]);

  const navItems = [
    { id: 'dashboard', label: t.dashboard, icon: <LayoutDashboard className="w-5 h-5" />, path: '/farmer/dashboard' },
    { id: 'farms', label: t.myFarms, icon: <Sprout className="w-5 h-5" />, path: '/farmer/farms' },
    { id: 'products', label: t.cropListings, icon: <Package className="w-5 h-5" />, path: '/farmer/products' },
    { id: 'orders', label: t.farmOrders, icon: <ShoppingBag className="w-5 h-5" />, path: '/farmer/orders' },
    { id: 'hubs', label: t.hubDropoffs, icon: <MapPin className="w-5 h-5" />, path: '/farmer/hubs' },
    { id: 'wallet', label: t.earningsWallet, icon: <Wallet className="w-5 h-5" />, path: '/wallet' },
  ];

  useEffect(() => {
    fetchInitialData();
  }, [id]);

  const fetchInitialData = async () => {
    try {
      setIsLoading(true);
      const [farmsRes, productRes]: [any, any] = await Promise.all([
        FarmService.getMyFarms(),
        id ? ProductService.getProductById(id) : Promise.resolve(null),
      ]);

      if (farmsRes.success && farmsRes.data) {
        setFarms(farmsRes.data.farms || []);
      }

      if (productRes && productRes.success && productRes.data) {
        const p = productRes.data.product;
        setTitle(p.productName || p.title || '');
        setCategory(p.category || 'vegetables');
        setFarmId(p.farmId?._id || p.farmId || '');
        setUnit(p.unit || 'kg');
        setPricePerUnit((p.basePricePerUnit ?? p.pricePerUnit ?? 250).toString());
        setMinOrderQuantity((p.minOrderQuantity || 1).toString());
        setAvailableQuantity((p.availableQuantity || 100).toString());
        setIsOrganic(!!p.isOrganic);
        setSeason(p.seasonTag || p.season || 'year_round');
        setDescription(p.description || '');
        setPricingTiers(p.b2bPricingTiers || p.pricingTiers || []);
      }
    } catch (err: any) {
      toast.error('Failed to load crop listing details');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddTier = () => {
    setPricingTiers([
      ...pricingTiers,
      { minQuantity: 50, pricePerUnit: Math.floor(parseFloat(pricePerUnit) * 0.9) },
    ]);
  };

  const handleRemoveTier = (index: number) => {
    setPricingTiers(pricingTiers.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;

    try {
      setIsSaving(true);
      await ProductService.updateProduct(id, {
        productName: title.trim(),
        title: title.trim(),
        category: category as any,
        farmId: farmId || undefined,
        unit: unit as any,
        basePricePerUnit: parseFloat(pricePerUnit),
        pricePerUnit: parseFloat(pricePerUnit),
        minOrderQuantity: parseInt(minOrderQuantity) || 1,
        availableQuantity: parseFloat(availableQuantity) || 0,
        isOrganic,
        seasonTag: season as any,
        season: season as any,
        description,
        b2bPricingTiers: pricingTiers,
        pricingTiers,
      });

      toast.success('Crop harvest listing updated!');
      navigate('/farmer/products');
    } catch (err: any) {
      toast.error(err.response?.data?.message || err.message || 'Failed to update listing');
    } finally {
      setIsSaving(false);
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
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-extrabold text-slate-900 dark:text-slate-100">
              Edit Crop Harvest Listing
            </h1>
            <p className="text-xs text-slate-400">
              Update inventory stock, pricing tiers, and harvest cultivation details
            </p>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/farmer/products')}
            leftIcon={<ArrowLeft className="w-4 h-4" />}
          >
            {t.back}
          </Button>
        </div>

        {isLoading ? (
          <div className="py-20 flex justify-center">
            <Spinner size="lg" />
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6"
          >
            <div className="space-y-4">
              <Input
                label="Produce Title & Variety"
                placeholder="e.g. Nuwara Eliya Carrot (New Kuroda)"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Select
                  label="Produce Category"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  options={[
                    { value: 'vegetables', label: 'Vegetables (එළවළු)' },
                    { value: 'fruits', label: 'Fruits (පළතුරු)' },
                    { value: 'grains', label: 'Grains & Rice (ධාන්‍ය)' },
                    { value: 'spices', label: 'Spices & Herbs (කුළුබඩු)' },
                    { value: 'dairy', label: 'Fresh Dairy (කිරි නිෂ්පාදන)' },
                  ]}
                />

                <Select
                  label="Cultivated Farm"
                  value={farmId}
                  onChange={(e) => setFarmId(e.target.value)}
                  options={farms.map((f) => ({
                    value: f._id,
                    label: `${f.farmName} (${f.location?.district})`,
                  }))}
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <Select
                  label="Unit of Sale"
                  value={unit}
                  onChange={(e) => setUnit(e.target.value)}
                  options={[
                    { value: 'kg', label: 'Kilograms (kg)' },
                    { value: 'g', label: 'Grams (g)' },
                    { value: 'litre', label: 'Litres (L)' },
                    { value: 'dozen', label: 'Dozen' },
                    { value: 'bundle', label: 'Bundle' },
                  ]}
                />

                <Input
                  label="Base Price (LKR / Unit)"
                  type="number"
                  value={pricePerUnit}
                  onChange={(e) => setPricePerUnit(e.target.value)}
                  required
                />

                <Input
                  label="Available Stock"
                  type="number"
                  value={availableQuantity}
                  onChange={(e) => setAvailableQuantity(e.target.value)}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Min Order Qty (MOQ)"
                  type="number"
                  value={minOrderQuantity}
                  onChange={(e) => setMinOrderQuantity(e.target.value)}
                />

                <Select
                  label="Cultivation Season"
                  value={season}
                  onChange={(e) => setSeason(e.target.value)}
                  options={[
                    { value: 'maha', label: 'Maha Season (මහ කන්නය)' },
                    { value: 'yala', label: 'Yala Season (යල කන්නය)' },
                    { value: 'year_round', label: 'Year-Round (වසර පුරා)' },
                  ]}
                />
              </div>

              {/* B2B Wholesale Pricing Tiers */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">
                      B2B Wholesale Tiered Discounts
                    </h4>
                    <p className="text-[11px] text-slate-400">
                      Offer volume discounts to commercial buyers, hotels, and supermarkets
                    </p>
                  </div>

                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleAddTier}
                    leftIcon={<Plus className="w-3.5 h-3.5" />}
                  >
                    Add Tier
                  </Button>
                </div>

                {pricingTiers.map((tier, idx) => (
                  <div key={idx} className="flex items-center gap-3">
                    <Input
                      label={`From Qty (${unit})`}
                      type="number"
                      value={tier.minQuantity.toString()}
                      onChange={(e) => {
                        const updated = [...pricingTiers];
                        updated[idx].minQuantity = parseFloat(e.target.value) || 0;
                        setPricingTiers(updated);
                      }}
                    />
                    <Input
                      label="Wholesale Price (LKR)"
                      type="number"
                      value={tier.pricePerUnit.toString()}
                      onChange={(e) => {
                        const updated = [...pricingTiers];
                        updated[idx].pricePerUnit = parseFloat(e.target.value) || 0;
                        setPricingTiers(updated);
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveTier(idx)}
                      className="p-2.5 rounded-xl text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 mt-5"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/40">
                <label htmlFor="prodOrganic" className="text-xs font-bold text-slate-800 dark:text-slate-200 cursor-pointer">
                  Certified Organic Produce
                </label>
                <input
                  type="checkbox"
                  id="prodOrganic"
                  checked={isOrganic}
                  onChange={(e) => setIsOrganic(e.target.checked)}
                  className="w-4 h-4 rounded text-emerald-600"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
              <Button
                variant="outline"
                size="sm"
                type="button"
                onClick={() => navigate('/farmer/products')}
              >
                {t.cancel}
              </Button>
              <Button
                variant="primary"
                size="sm"
                type="submit"
                isLoading={isSaving}
                className="bg-emerald-600 hover:bg-emerald-700"
              >
                {t.save}
              </Button>
            </div>
          </form>
        )}
      </div>
    </DashboardLayout>
  );
};
