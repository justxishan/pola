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
import { useTranslation } from '@/lib/i18n';
import { getFarmerNavItems } from '@/lib/navItems';
import { PRODUCT_CATEGORIES, STANDARD_UNITS, UNIT_LABELS } from '@pola/shared';
import {
  ArrowLeft,
  Plus,
  Trash2,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';
import { cn } from '@/lib/cn';
import toast from 'react-hot-toast';

function formatRelativeTime(timestamp: number): string {
  const diffMs = Date.now() - timestamp;
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);

  if (diffMin < 1) return 'just now';
  if (diffMin === 1) return '1 minute ago';
  if (diffMin < 60) return `${diffMin} minutes ago`;
  if (diffHour === 1) return '1 hour ago';
  if (diffHour < 24) return `${diffHour} hours ago`;
  if (diffDay === 1) return 'yesterday';
  return `${diffDay} days ago`;
}

export const AddProductPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const { isDark, toggleTheme, language, setLanguage } = useThemeStore();
  const { t } = useTranslation();

  const farmerId = user?._id || user?.id || 'anonymous';
  const DRAFT_STORAGE_KEY = `pola:draft:product:new:${farmerId}`;

  const [farms, setFarms] = useState<any[]>([]);
  const [farmId, setFarmId] = useState('');
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState(Object.keys(PRODUCT_CATEGORIES)[0]);
  const [unit, setUnit] = useState('kg');
  
  // Clean empty-state numeric fields
  const [pricePerUnit, setPricePerUnit] = useState<number | ''>('');
  const [availableQuantity, setAvailableQuantity] = useState<number | ''>('');
  const [minOrderQuantity, setMinOrderQuantity] = useState<number | ''>('');
  
  const [description, setDescription] = useState('');
  const [harvestSeason, setHarvestSeason] = useState('Yala');
  const [isOrganic, setIsOrganic] = useState(false);
  const [images, setImages] = useState<File[]>([]);

  // B2B Pricing Tiers
  const [pricingTiers, setPricingTiers] = useState<
    { minQuantity: number; maxQuantity?: number; pricePerUnit: number }[]
  >([]);

  const [isPublishing, setIsPublishing] = useState(false);
  const [isSavingDraft, setIsSavingDraft] = useState(false);

  // Autosave and Recovery state
  const [isInitialized, setIsInitialized] = useState(false);
  const [pendingDraft, setPendingDraft] = useState<{
    data: any;
    savedAt: number;
  } | null>(null);

  const navItems = getFarmerNavItems(t);
  const unitDisplay = UNIT_LABELS[unit as keyof typeof UNIT_LABELS] || unit;

  // Mount effect: fetch farms and check for an unsubmitted local draft (< 48h)
  useEffect(() => {
    fetchFarms();
    checkExistingDraft();
  }, []);

  const checkExistingDraft = () => {
    try {
      const raw = localStorage.getItem(DRAFT_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        const savedAt = parsed.savedAt || 0;
        const isFresh = Date.now() - savedAt < 48 * 60 * 60 * 1000;
        const hasContent = Boolean(
          (parsed.title && parsed.title.trim()) ||
          (parsed.pricePerUnit !== undefined && parsed.pricePerUnit !== '') ||
          (parsed.availableQuantity !== undefined && parsed.availableQuantity !== '') ||
          (parsed.description && parsed.description.trim()) ||
          (parsed.pricingTiers && parsed.pricingTiers.length > 0)
        );

        if (isFresh && hasContent) {
          setPendingDraft({ data: parsed, savedAt });
        } else {
          localStorage.removeItem(DRAFT_STORAGE_KEY);
        }
      }
    } catch (err) {
      console.warn('Error checking draft storage', err);
    } finally {
      setIsInitialized(true);
    }
  };

  // Autosave debouncer: writes form state to localStorage after 1.5s of inactivity
  useEffect(() => {
    if (!isInitialized || pendingDraft) return;

    const hasContent = Boolean(
      title.trim() ||
      pricePerUnit !== '' ||
      availableQuantity !== '' ||
      description.trim() ||
      pricingTiers.length > 0
    );

    if (!hasContent) return;

    const timer = setTimeout(() => {
      try {
        const payload = {
          title,
          farmId,
          category,
          unit,
          pricePerUnit,
          availableQuantity,
          minOrderQuantity,
          description,
          harvestSeason,
          isOrganic,
          pricingTiers,
          savedAt: Date.now(),
        };
        localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(payload));
      } catch (err) {
        console.warn('Failed to autosave crop listing to localStorage', err);
      }
    }, 1500);

    return () => clearTimeout(timer);
  }, [
    isInitialized,
    pendingDraft,
    title,
    farmId,
    category,
    unit,
    pricePerUnit,
    availableQuantity,
    minOrderQuantity,
    description,
    harvestSeason,
    isOrganic,
    pricingTiers,
    DRAFT_STORAGE_KEY,
  ]);

  const handleResumeDraft = () => {
    if (!pendingDraft?.data) return;
    const d = pendingDraft.data;
    if (d.title) setTitle(d.title);
    if (d.farmId) setFarmId(d.farmId);
    if (d.category) setCategory(d.category);
    if (d.unit) setUnit(d.unit);
    if (d.pricePerUnit !== undefined) setPricePerUnit(d.pricePerUnit);
    if (d.availableQuantity !== undefined) setAvailableQuantity(d.availableQuantity);
    if (d.minOrderQuantity !== undefined) setMinOrderQuantity(d.minOrderQuantity);
    if (d.description) setDescription(d.description);
    if (d.harvestSeason) setHarvestSeason(d.harvestSeason);
    if (d.isOrganic !== undefined) setIsOrganic(d.isOrganic);
    if (d.pricingTiers && Array.isArray(d.pricingTiers)) setPricingTiers(d.pricingTiers);

    setPendingDraft(null);
    toast.success('Restored unfinished crop listing from autosave');
  };

  const handleDiscardDraft = () => {
    try {
      localStorage.removeItem(DRAFT_STORAGE_KEY);
    } catch (e) {
      console.warn(e);
    }
    setPendingDraft(null);
    toast('Autosaved draft discarded');
  };

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
    const basePrice = typeof pricePerUnit === 'number' && pricePerUnit > 0 ? pricePerUnit : 100;
    setPricingTiers([
      ...pricingTiers,
      { minQuantity: 50, maxQuantity: 200, pricePerUnit: Math.round(basePrice * 0.9) },
    ]);
  };

  const removePricingTier = (idx: number) => {
    setPricingTiers(pricingTiers.filter((_, i) => i !== idx));
  };

  const addStockQuick = (amt: number) => {
    setAvailableQuantity((prev) => (typeof prev === 'number' ? prev + amt : amt));
  };

  const setMoqQuick = (amt: number) => {
    setMinOrderQuantity(amt);
  };

  // Progress computation (8 core fields)
  const completedFieldsCount = [
    Boolean(farmId),
    Boolean(title.trim()),
    Boolean(category),
    Boolean(unit),
    typeof pricePerUnit === 'number' && pricePerUnit > 0,
    typeof availableQuantity === 'number' && availableQuantity > 0,
    typeof minOrderQuantity === 'number' && minOrderQuantity > 0,
    images.length > 0,
  ].filter(Boolean).length;
  const progressPercent = Math.round((completedFieldsCount / 8) * 100);

  const handleSave = async (isDraft: boolean) => {
    if (!title.trim()) {
      toast.error('Please enter a crop name');
      return;
    }

    if (!farmId) {
      toast.error('Please select or register a farm');
      return;
    }

    if (!isDraft) {
      if (pricePerUnit === '' || pricePerUnit <= 0) {
        toast.error(`Please enter a valid price per ${unitDisplay}`);
        return;
      }
      if (availableQuantity === '' || availableQuantity <= 0) {
        toast.error(`Please specify stock available in ${unitDisplay}`);
        return;
      }
      if (minOrderQuantity === '' || minOrderQuantity <= 0) {
        toast.error(`Please specify minimum order quantity in ${unitDisplay}`);
        return;
      }
      if (minOrderQuantity > availableQuantity) {
        toast.error('Minimum order cannot exceed total available stock');
        return;
      }
      if (images.length === 0) {
        toast.error('Please upload at least 1 photo of your crop');
        return;
      }
    }

    try {
      if (isDraft) {
        setIsSavingDraft(true);
      } else {
        setIsPublishing(true);
      }

      const formData = new FormData();
      formData.append('farmId', farmId);
      formData.append('productName', title.trim());
      formData.append('category', category);
      formData.append('unit', unit);
      formData.append('basePricePerUnit', String(pricePerUnit === '' ? 0 : pricePerUnit));
      formData.append('availableQuantity', String(availableQuantity === '' ? 0 : availableQuantity));
      formData.append('minOrderQuantity', String(minOrderQuantity === '' ? 1 : minOrderQuantity));
      formData.append('description', description);
      formData.append('seasonTag', harvestSeason.toLowerCase().replace('-', '_'));
      formData.append('isOrganic', String(isOrganic));

      if (isDraft) {
        formData.append('isDraft', 'true');
        formData.append('status', 'draft');
      }

      if (pricingTiers.length > 0) {
        formData.append(
          'b2bPricingTiers',
          JSON.stringify(
            pricingTiers.map((t) => ({
              minQuantity: Number(t.minQuantity),
              maxQuantity: t.maxQuantity ? Number(t.maxQuantity) : undefined,
              unitPrice: Number(t.pricePerUnit),
              pricePerUnit: Number(t.pricePerUnit),
            }))
          )
        );
      }

      images.forEach((img) => formData.append('images', img));

      const res: any = await ProductService.createProduct(formData);
      if (res.success) {
        try {
          localStorage.removeItem(DRAFT_STORAGE_KEY);
        } catch (e) {
          console.warn(e);
        }
        toast.success(isDraft ? 'Crop listing saved as draft!' : 'Crop harvest listed on marketplace!');
        navigate('/farmer/products');
      }
    } catch (err: any) {
      toast.error(
        err.response?.data?.message || err.message || (isDraft ? 'Failed to save draft' : 'Failed to publish crop listing')
      );
    } finally {
      setIsPublishing(false);
      setIsSavingDraft(false);
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

        {/* Reconnect Recovery Banner */}
        {pendingDraft && (
          <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-slate-800 dark:text-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-xl bg-amber-500/20 text-amber-600 dark:text-amber-400 mt-0.5">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100">
                  Unfinished crop listing found
                </h4>
                <p className="text-xs text-slate-600 dark:text-slate-300">
                  You have an unfinished crop listing from {formatRelativeTime(pendingDraft.savedAt)}.{' '}
                  <span className="text-amber-600 dark:text-amber-400 font-medium">
                    (Photos must be re-attached upon resuming)
                  </span>
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
              <button
                type="button"
                onClick={handleDiscardDraft}
                className="px-3.5 py-1.5 rounded-full text-xs font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-200/50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                Discard
              </button>
              <button
                type="button"
                onClick={handleResumeDraft}
                className="px-4 py-1.5 rounded-full text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 transition-colors cursor-pointer shadow-xs"
              >
                Resume Listing
              </button>
            </div>
          </div>
        )}

        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSave(false);
          }}
          className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-6"
        >
          {/* Progress Indicator */}
          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800/80 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <CheckCircle2 className={cn('w-4 h-4', progressPercent === 100 ? 'text-emerald-500' : 'text-slate-400')} />
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Listing Completeness: {completedFieldsCount} of 8 required fields
              </span>
            </div>
            <div className="w-28 bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
              <div
                className="bg-emerald-600 h-full rounded-full transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Crop Name"
              placeholder="e.g. Fresh Red Carrots"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />

            <Select
              label="Farm"
              value={farmId}
              onChange={(e) => setFarmId(e.target.value)}
              required
            >
              {farms.length === 0 && <option value="">No farms found — Register one first</option>}
              {farms.map((f) => (
                <option key={f._id} value={f._id}>
                  {f.farmName} ({f.district} District)
                </option>
              ))}
            </Select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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

            <Select
              label="Unit"
              value={unit}
              onChange={(e) => setUnit(e.target.value)}
            >
              {STANDARD_UNITS.map((u) => (
                <option key={u} value={u}>
                  {UNIT_LABELS[u as keyof typeof UNIT_LABELS] || u}
                </option>
              ))}
            </Select>
          </div>

          {/* Pricing & Availability Sub-section */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-1.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Pricing & Availability
              </span>
              <span className="text-[11px] text-slate-400">
                Units measured in <strong className="text-emerald-600 dark:text-emerald-400">{unitDisplay}</strong>
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Dynamic Price */}
              <div>
                <Input
                  label={`Price per ${unitDisplay}`}
                  type="number"
                  placeholder="e.g. 250"
                  value={pricePerUnit}
                  onChange={(e) => setPricePerUnit(e.target.value === '' ? '' : parseFloat(e.target.value))}
                  required
                />
              </div>

              {/* Dynamic Stock with quick-add chips */}
              <div>
                <Input
                  label={`Stock Available (${unitDisplay})`}
                  type="number"
                  placeholder="e.g. 100"
                  value={availableQuantity}
                  onChange={(e) => setAvailableQuantity(e.target.value === '' ? '' : parseFloat(e.target.value))}
                  required
                />
                <div className="flex items-center gap-1.5 pt-1.5">
                  <span className="text-[10px] text-slate-400 font-medium">Add:</span>
                  {[20, 50, 100].map((amt) => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => addStockQuick(amt)}
                      className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 text-slate-600 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer"
                    >
                      +{amt}
                    </button>
                  ))}
                </div>
              </div>

              {/* Dynamic MOQ with quick-set chips */}
              <div>
                <Input
                  label={`Minimum Order (${unitDisplay})`}
                  type="number"
                  placeholder="e.g. 5"
                  value={minOrderQuantity}
                  onChange={(e) => setMinOrderQuantity(e.target.value === '' ? '' : parseFloat(e.target.value))}
                  required
                />
                <div className="flex items-center gap-1.5 pt-1.5">
                  <span className="text-[10px] text-slate-400 font-medium">Set:</span>
                  {[1, 5, 10, 25].map((amt) => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => setMoqQuick(amt)}
                      className={cn(
                        'px-2 py-0.5 rounded-full text-[11px] font-semibold border transition-colors cursor-pointer',
                        minOrderQuantity === amt
                          ? 'bg-emerald-600 text-white border-emerald-600 shadow-2xs'
                          : 'bg-slate-100 dark:bg-slate-800 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 text-slate-600 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 border-slate-200 dark:border-slate-700'
                      )}
                    >
                      {amt}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* B2B Wholesale Tiers */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                Bulk Discounts (optional)
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

            {pricingTiers.length === 0 && (
              <p className="text-[11px] text-slate-400">
                Offer special discounted rates for bulk orders from restaurants, supermarkets, or hotels.
              </p>
            )}

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
                  label={`Tier Price (${unitDisplay})`}
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
                  className="p-2 text-slate-400 hover:text-rose-500 mt-5 cursor-pointer"
                  title="Remove tier"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>

          <FileDropzone
            label="Photos (up to 5)"
            helperText="Clear photos of freshly harvested produce improve sales"
            multiple
            maxFiles={5}
            files={images}
            onFilesChange={setImages}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select
              label="Season"
              value={harvestSeason}
              onChange={(e) => setHarvestSeason(e.target.value)}
            >
              <option value="Yala">Yala Season</option>
              <option value="Maha">Maha Season</option>
              <option value="Year-Round">Year-Round Crop</option>
            </Select>

            <div className="pt-6">
              <Toggle
                label="Organic"
                checked={isOrganic}
                onChange={setIsOrganic}
              />
            </div>
          </div>

          <Textarea
            label="Notes (optional)"
            placeholder="e.g. Harvested this morning, washed and packed in 20kg crates..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
          />

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
            <Button
              type="button"
              variant="outline"
              size="md"
              onClick={() => navigate('/farmer/products')}
              disabled={isPublishing || isSavingDraft}
            >
              Cancel
            </Button>

            <div className="flex items-center gap-3">
              <Button
                type="button"
                variant="outline"
                size="md"
                onClick={() => handleSave(true)}
                isLoading={isSavingDraft}
                disabled={isPublishing || isSavingDraft}
              >
                Save as Draft
              </Button>
              <Button
                type="submit"
                variant="primary"
                size="md"
                isLoading={isPublishing}
                disabled={isPublishing || isSavingDraft}
              >
                {isPublishing && images.length > 0 ? 'Uploading photos...' : 'Publish to Marketplace'}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
};

