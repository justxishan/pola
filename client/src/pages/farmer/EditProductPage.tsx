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
import { getFarmerNavItems } from '@/lib/navItems';
import { FileDropzone } from '@/components/molecules/FileDropzone';
import { STANDARD_UNITS, UNIT_LABELS, getPricingUnitInputLabel } from '@pola/shared';
import {
  ArrowLeft,
  Plus,
  Trash2,
  FileText,
  Globe,
  Lock,
  X,
  Image as ImageIcon,
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
  const [isPublishingAction, setIsPublishingAction] = useState(false);
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
  const [productStatus, setProductStatus] = useState('active');
  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [newImageFiles, setNewImageFiles] = useState<File[]>([]);
  const [pricingTiers, setPricingTiers] = useState<
    Array<{ minQuantity: number; maxQuantity?: number; pricePerUnit: number }>
  >([]);

  const navItems = getFarmerNavItems(t);

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
        setFarms((farmsRes.data.farms || []).filter((f: any) => f.isActive !== false));
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
        setProductStatus(p.status || 'active');
        setExistingImages(p.images || []);
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

  const handleSave = async (publishToMarketplace: boolean) => {
    if (!id) return;
    if (!title.trim()) {
      toast.error('Please enter a produce title');
      return;
    }

    const priceNum = parseFloat(pricePerUnit) || 0;
    const availNum = parseFloat(availableQuantity) || 0;
    const moqNum = parseInt(minOrderQuantity) || 1;

    const totalImages = existingImages.length + newImageFiles.length;

    if (publishToMarketplace) {
      if (priceNum <= 0) {
        toast.error('Price must be greater than 0 to publish to marketplace');
        return;
      }
      if (availNum <= 0) {
        toast.error('Available stock must be greater than 0 to publish to marketplace');
        return;
      }
      if (moqNum > availNum) {
        toast.error('Minimum order quantity cannot exceed available stock');
        return;
      }
      if (totalImages === 0) {
        toast.error('Please upload at least 1 photo of your crop');
        return;
      }
    }

    if (totalImages > 5) {
      toast.error('A maximum of 5 photos are allowed per listing');
      return;
    }

    try {
      setIsSaving(true);
      setIsPublishingAction(publishToMarketplace);

      const normalizedTiers = pricingTiers.map((t: any) => ({
        minQuantity: Number(t.minQuantity),
        maxQuantity: t.maxQuantity ? Number(t.maxQuantity) : undefined,
        unitPrice: Number(t.unitPrice ?? t.pricePerUnit ?? 0),
        pricePerUnit: Number(t.unitPrice ?? t.pricePerUnit ?? 0),
      }));

      const formData = new FormData();
      formData.append('productName', title.trim());
      formData.append('title', title.trim());
      formData.append('category', category);
      if (farmId) formData.append('farmId', farmId);
      formData.append('unit', unit);
      formData.append('basePricePerUnit', String(priceNum));
      formData.append('pricePerUnit', String(priceNum));
      formData.append('minOrderQuantity', String(moqNum));
      formData.append('availableQuantity', String(availNum));
      formData.append('isOrganic', String(isOrganic));
      formData.append('seasonTag', season);
      formData.append('season', season);
      formData.append('description', description);
      formData.append('b2bPricingTiers', JSON.stringify(normalizedTiers));
      formData.append('pricingTiers', JSON.stringify(normalizedTiers));
      formData.append('isDraft', String(!publishToMarketplace));
      formData.append('saveAsDraft', String(!publishToMarketplace));
      formData.append('publish', String(publishToMarketplace));
      formData.append('status', publishToMarketplace ? 'active' : 'draft');

      // Append retained existing image URLs
      existingImages.forEach((imgUrl) => {
        formData.append('images', imgUrl);
      });

      // Append new image files
      newImageFiles.forEach((file) => {
        formData.append('images', file);
      });

      await ProductService.updateProduct(id, formData);

      toast.success(
        publishToMarketplace
          ? 'Crop harvest listed on marketplace!'
          : 'Draft crop listing updated!'
      );
      navigate('/farmer/products');
    } catch (err: any) {
      toast.error(err.response?.data?.message || err.message || 'Failed to update listing');
    } finally {
      setIsSaving(false);
      setIsPublishingAction(false);
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
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-xl font-extrabold text-slate-900 dark:text-slate-100">
                Edit Crop Harvest Listing
              </h1>
              {productStatus === 'draft' && (
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase bg-amber-400/20 text-amber-500 dark:text-amber-300 border border-amber-400/30">
                  Draft Listing
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              {productStatus === 'draft'
                ? 'Complete required pricing and stock fields to publish this lot to buyers on Pola Marketplace'
                : 'Update inventory stock, pricing tiers, and harvest cultivation details'}
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
            onSubmit={(e) => {
              e.preventDefault();
              handleSave(productStatus !== 'draft');
            }}
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
                  options={STANDARD_UNITS.map((u) => ({
                    value: u,
                    label: UNIT_LABELS[u as keyof typeof UNIT_LABELS] || u,
                  }))}
                />

                <Input
                  label={getPricingUnitInputLabel(unit)}
                  type="number"
                  min="0"
                  step="any"
                  value={pricePerUnit}
                  onChange={(e) => {
                    const val = e.target.value;
                    setPricePerUnit(val === '' ? '' : Math.max(0, parseFloat(val)).toString());
                  }}
                  required
                />

                <Input
                  label="Available Stock"
                  type="number"
                  min="0"
                  step="any"
                  value={availableQuantity}
                  onChange={(e) => {
                    const val = e.target.value;
                    setAvailableQuantity(val === '' ? '' : Math.max(0, parseFloat(val)).toString());
                  }}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Min Order Qty (MOQ)"
                  type="number"
                  min="0"
                  step="any"
                  value={minOrderQuantity}
                  onChange={(e) => {
                    const val = e.target.value;
                    setMinOrderQuantity(val === '' ? '' : Math.max(0, parseFloat(val)).toString());
                  }}
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

              {/* Produce Photos (Existing retained + New uploads, 1 to 5 total) */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <label className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                      <ImageIcon className="w-4 h-4 text-emerald-500" />
                      Produce Photos ({existingImages.length + newImageFiles.length}/5)
                    </label>
                  </div>
                  <span className="text-[11px] text-slate-400">
                    Add or remove photos (1 to 5 photos)
                  </span>
                </div>

                {/* Thumbnail strip of existing and new photos */}
                {(existingImages.length > 0 || newImageFiles.length > 0) && (
                  <div className="flex flex-wrap items-center gap-3 pt-1">
                    {existingImages.map((imgUrl, idx) => (
                      <div
                        key={`existing-${idx}`}
                        className="relative w-20 h-20 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 shrink-0 bg-slate-100 dark:bg-slate-900 group"
                      >
                        <img
                          src={imgUrl}
                          alt={`Existing photo ${idx + 1}`}
                          className="w-full h-full object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => setExistingImages(existingImages.filter((_, i) => i !== idx))}
                          className="absolute top-1 right-1 p-1 rounded-full bg-red-600/90 hover:bg-red-600 text-white shadow-md transition-all cursor-pointer"
                          title="Remove photo"
                        >
                          <X className="w-3 h-3" />
                        </button>
                        <span className="absolute bottom-1 left-1 px-1.5 py-0.5 rounded bg-black/60 text-[9px] font-bold text-white">
                          Saved
                        </span>
                      </div>
                    ))}

                    {newImageFiles.map((file, idx) => {
                      const objectUrl = URL.createObjectURL(file);
                      return (
                        <div
                          key={`new-${idx}`}
                          className="relative w-20 h-20 rounded-xl overflow-hidden border border-emerald-400/50 shrink-0 bg-slate-100 dark:bg-slate-900 group"
                        >
                          <img
                            src={objectUrl}
                            alt={`New file ${idx + 1}`}
                            className="w-full h-full object-cover"
                          />
                          <button
                            type="button"
                            onClick={() => setNewImageFiles(newImageFiles.filter((_, i) => i !== idx))}
                            className="absolute top-1 right-1 p-1 rounded-full bg-red-600/90 hover:bg-red-600 text-white shadow-md transition-all cursor-pointer"
                            title="Remove photo"
                          >
                            <X className="w-3 h-3" />
                          </button>
                          <span className="absolute bottom-1 left-1 px-1.5 py-0.5 rounded bg-emerald-600 text-[9px] font-bold text-white">
                            New
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}

                {existingImages.length + newImageFiles.length < 5 && (
                  <FileDropzone
                    label="Add More Photos"
                    helperText={`Upload JPG or PNG (${5 - (existingImages.length + newImageFiles.length)} slots remaining)`}
                    accept="image/*"
                    multiple={true}
                    maxFiles={5 - (existingImages.length + newImageFiles.length)}
                    files={newImageFiles}
                    onFilesChange={(files) => {
                      const allowedCount = 5 - existingImages.length;
                      setNewImageFiles(files.slice(0, allowedCount));
                    }}
                  />
                )}
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

              {productStatus === 'draft' ? (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    type="button"
                    isLoading={isSaving && !isPublishingAction}
                    onClick={() => handleSave(false)}
                    leftIcon={<FileText className="w-3.5 h-3.5" />}
                    className="border-amber-400/40 text-amber-600 dark:text-amber-400 hover:bg-amber-400/10"
                  >
                    Save as Draft
                  </Button>
                  <Button
                    variant="primary"
                    size="sm"
                    type="button"
                    isLoading={isSaving && isPublishingAction}
                    onClick={() => handleSave(true)}
                    leftIcon={<Globe className="w-3.5 h-3.5" />}
                    className="bg-lime-500 hover:bg-lime-600 text-slate-950 font-bold"
                  >
                    Publish to Marketplace
                  </Button>
                </>
              ) : (
                <Button
                  variant="primary"
                  size="sm"
                  type="submit"
                  isLoading={isSaving}
                  className="bg-emerald-600 hover:bg-emerald-700"
                >
                  {t.save}
                </Button>
              )}
            </div>
          </form>
        )}
      </div>
    </DashboardLayout>
  );
};
