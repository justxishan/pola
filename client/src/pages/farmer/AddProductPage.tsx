import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from '@/components/templates/DashboardLayout';
import { Input } from '@/components/atoms/Input';
import { Select } from '@/components/atoms/Select';
import { Textarea } from '@/components/atoms/Textarea';
import { Toggle } from '@/components/atoms/Toggle';
import { FileDropzone } from '@/components/molecules/FileDropzone';
import { Button } from '@/components/atoms/Button';
import { ProductService } from '@/services/product.service';
import { FarmService } from '@/services/farm.service';
import { useAuthStore } from '@/store/authStore';
import { useThemeStore } from '@/store/themeStore';
import { PRODUCT_CATEGORIES, STANDARD_UNITS } from '@pola/shared';
import {
  LayoutDashboard,
  Sprout,
  Package,
  Wallet,
  ShoppingBag,
  ArrowLeft,
  Plus,
  Trash2,
} from 'lucide-react';
import toast from 'react-hot-toast';

export const AddProductPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const { isDark, toggleTheme, language, setLanguage } = useThemeStore();

  const [farms, setFarms] = useState<any[]>([]);
  const [farmId, setFarmId] = useState('');
  const [title, setTitle] = useState('');
  const [titleSi, setTitleSi] = useState('');
  const [category, setCategory] = useState(Object.keys(PRODUCT_CATEGORIES)[0]);
  const [unit, setUnit] = useState('kg');
  const [pricePerUnit, setPricePerUnit] = useState(250);
  const [availableQuantity, setAvailableQuantity] = useState(100);
  const [minOrderQuantity, setMinOrderQuantity] = useState(5);
  const [description, setDescription] = useState('');
  const [harvestSeason, setHarvestSeason] = useState('Yala');
  const [isOrganic, setIsOrganic] = useState(false);
  const [images, setImages] = useState<File[]>([]);

  // B2B Pricing Tiers
  const [pricingTiers, setPricingTiers] = useState<
    { minQuantity: number; maxQuantity?: number; pricePerUnit: number }[]
  >([]);

  const [isLoading, setIsLoading] = useState(false);

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-5 h-5" />, path: '/farmer/dashboard' },
    { id: 'farms', label: 'My Farms', icon: <Sprout className="w-5 h-5" />, path: '/farmer/farms' },
    { id: 'products', label: 'Crop Listings', icon: <Package className="w-5 h-5" />, path: '/farmer/products' },
    { id: 'orders', label: 'Farm Orders', icon: <ShoppingBag className="w-5 h-5" />, path: '/farmer/orders' },
    { id: 'wallet', label: 'Earnings & Wallet', icon: <Wallet className="w-5 h-5" />, path: '/wallet' },
  ];

  useEffect(() => {
    fetchFarms();
  }, []);

  const fetchFarms = async () => {
    try {
      const res: any = await FarmService.getMyFarms();
      if (res.success && res.data && res.data.farms.length > 0) {
        setFarms(res.data.farms);
        setFarmId(res.data.farms[0]._id);
      }
    } catch (err: any) {
      console.error(err);
    }
  };

  const addPricingTier = () => {
    setPricingTiers([
      ...pricingTiers,
      { minQuantity: 50, maxQuantity: 200, pricePerUnit: Math.round(pricePerUnit * 0.9) },
    ]);
  };

  const removePricingTier = (idx: number) => {
    setPricingTiers(pricingTiers.filter((_, i) => i !== idx));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      toast.error('Please enter the produce name');
      return;
    }

    if (!farmId) {
      toast.error('Please select or register a farm field');
      return;
    }

    if (images.length === 0) {
      toast.error('Please upload at least 1 photo of your crop');
      return;
    }

    try {
      setIsLoading(true);
      const formData = new FormData();
      formData.append('farmId', farmId);
      formData.append('productName', title.trim());   // validator expects 'productName'
      formData.append('category', category);
      formData.append('unit', unit);
      formData.append('basePricePerUnit', String(pricePerUnit));  // validator expects 'basePricePerUnit'
      formData.append('availableQuantity', String(availableQuantity));
      formData.append('minOrderQuantity', String(minOrderQuantity));
      formData.append('description', description);
      formData.append('seasonTag', harvestSeason.toLowerCase());  // validator expects 'seasonTag'
      formData.append('isOrganic', String(isOrganic));

      if (pricingTiers.length > 0) {
        formData.append('b2bPricingTiers', JSON.stringify(pricingTiers));  // validator expects 'b2bPricingTiers'
      }

      images.forEach((img) => formData.append('images', img));

      const res: any = await ProductService.createProduct(formData);
      if (res.success) {
        toast.success('Crop harvest listed on marketplace!');
        navigate('/farmer/products');
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || err.message || 'Failed to publish crop listing');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <DashboardLayout
      portalTitle="Farmer Operations Center"
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
      <div className="max-w-3xl space-y-6">
        <button
          onClick={() => navigate('/farmer/products')}
          className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Crop Listings</span>
        </button>

        <div>
          <h1 className="text-xl font-extrabold text-slate-900 dark:text-slate-100">
            Publish Crop Harvest Listing
          </h1>
          <p className="text-xs text-slate-400">
            List fresh produce available for pickup during upcoming village collection schedules
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Produce Name (English)"
              placeholder="e.g. Fresh Red Carrots"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
            <Input
              label="Produce Name (Sinhala)"
              placeholder="e.g. කැරට්"
              value={titleSi}
              onChange={(e) => setTitleSi(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select
              label="Grown on Farm Field"
              value={farmId}
              onChange={(e) => setFarmId(e.target.value)}
              required
            >
              {farms.length === 0 && <option value="">No farms found — Register one first</option>}
              {farms.map((f) => (
                <option key={f._id} value={f._id}>
                  {f.farmName} ({f.location?.district} District)
                </option>
              ))}
            </Select>

            <Select
              label="Category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              {Object.values(PRODUCT_CATEGORIES).map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nameEn} ({c.nameSi})
                </option>
              ))}
            </Select>
          </div>

          {/* Pricing & Stock Brackets */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <Select
              label="Unit of Measurement"
              value={unit}
              onChange={(e) => setUnit(e.target.value)}
            >
              {STANDARD_UNITS.map((u) => (
                <option key={u.code} value={u.code}>
                  {u.nameEn} ({u.code})
                </option>
              ))}
            </Select>

            <Input
              label="Base Price (LKR)"
              type="number"
              value={pricePerUnit}
              onChange={(e) => setPricePerUnit(parseFloat(e.target.value))}
              required
            />

            <Input
              label="Ready Stock"
              type="number"
              value={availableQuantity}
              onChange={(e) => setAvailableQuantity(parseFloat(e.target.value))}
              required
            />

            <Input
              label="Min Order (MOQ)"
              type="number"
              value={minOrderQuantity}
              onChange={(e) => setMinOrderQuantity(parseFloat(e.target.value))}
              required
            />
          </div>

          {/* B2B Wholesale Tiers */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                Optional B2B Wholesale Quantity Discounts
              </span>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addPricingTier}
                leftIcon={<Plus className="w-3.5 h-3.5" />}
              >
                Add Tier
              </Button>
            </div>

            {pricingTiers.map((tier, idx) => (
              <div key={idx} className="flex items-center gap-3 text-xs">
                <Input
                  label="Min Qty"
                  type="number"
                  value={tier.minQuantity}
                  onChange={(e) => {
                    const val = parseFloat(e.target.value);
                    setPricingTiers(
                      pricingTiers.map((t, i) => (i === idx ? { ...t, minQuantity: val } : t))
                    );
                  }}
                />
                <Input
                  label="Max Qty"
                  type="number"
                  value={tier.maxQuantity || ''}
                  onChange={(e) => {
                    const val = e.target.value ? parseFloat(e.target.value) : undefined;
                    setPricingTiers(
                      pricingTiers.map((t, i) => (i === idx ? { ...t, maxQuantity: val } : t))
                    );
                  }}
                />
                <Input
                  label={`Tier Price (${unit})`}
                  type="number"
                  value={tier.pricePerUnit}
                  onChange={(e) => {
                    const val = parseFloat(e.target.value);
                    setPricingTiers(
                      pricingTiers.map((t, i) => (i === idx ? { ...t, pricePerUnit: val } : t))
                    );
                  }}
                />
                <button
                  type="button"
                  onClick={() => removePricingTier(idx)}
                  className="p-2 text-slate-400 hover:text-rose-500 mt-5"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>

          <FileDropzone
            label="Upload Crop Photos (Up to 5 images)"
            multiple
            maxFiles={5}
            files={images}
            onFilesChange={setImages}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select
              label="Harvest Season"
              value={harvestSeason}
              onChange={(e) => setHarvestSeason(e.target.value)}
            >
              <option value="Yala">Yala Season</option>
              <option value="Maha">Maha Season</option>
              <option value="Year-Round">Year-Round Crop</option>
            </Select>

            <div className="pt-6">
              <Toggle
                label="Pesticide-Free / Organic"
                checked={isOrganic}
                onChange={setIsOrganic}
              />
            </div>
          </div>

          <Textarea
            label="Harvest Quality Notes & Grade Description"
            placeholder="E.g. Harvested this morning, washed and packed in 20kg crates..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
          />

          <div className="flex justify-end gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              size="md"
              onClick={() => navigate('/farmer/products')}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="md"
              isLoading={isLoading}
            >
              Publish to Marketplace
            </Button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
};
