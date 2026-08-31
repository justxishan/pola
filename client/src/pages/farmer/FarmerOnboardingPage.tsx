import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { useThemeStore } from '@/store/themeStore';
import { useTranslation, LanguageCode } from '@/lib/i18n';
import { FarmService } from '@/services/farm.service';
import { ProductService } from '@/services/product.service';
import { AuthService } from '@/services/auth.service';
import { PROVINCES_DISTRICTS, DISTRICTS, ProductCategory } from '@pola/shared';
import {
  Sprout,
  Sparkles,
  MapPin,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  TrendingUp,
  ShieldCheck,
  Package,
  Globe,
  Building,
  CreditCard,
  FileText,
  DollarSign,
  AlertCircle,
  SkipForward,
} from 'lucide-react';
import toast from 'react-hot-toast';

export const FarmerOnboardingPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, updateUser } = useAuthStore();
  const { language, setLanguage } = useThemeStore();
  const { t } = useTranslation();

  // Cards: 0 (Lang), 1 (Intro), 2 (Crop), 3 (Volume), 4 (FarmName), 5 (Province), 6 (District), 7 (Acres), 8 (Organic), 9 (ProduceName), 10 (Price), 11 (KYC), 12 (Bank), 13 (Branch), 14 (AccNum), 15 (AccHolder), 16 (Celebration)
  const [currentStep, setCurrentStep] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Crop & Revenue
  const [selectedCrop, setSelectedCrop] = useState('carrots');
  const [harvestKg, setHarvestKg] = useState(500);

  // Farm Details Section
  const [hasFarmSection, setHasFarmSection] = useState(true);
  const [farmName, setFarmName] = useState('');
  const [province, setProvince] = useState('Central');
  const [district, setDistrict] = useState('Nuwara Eliya');
  const [landAcres, setLandAcres] = useState(2.5);
  const [isOrganic, setIsOrganic] = useState(false);

  // Produce Section
  const [hasProduceSection, setHasProduceSection] = useState(true);
  const [produceName, setProduceName] = useState('Highland Carrots (Grade A)');
  const [pricePerKg, setPricePerKg] = useState(280);

  // KYC Section
  const [hasKycSection, setHasKycSection] = useState(true);
  const [nicNumber, setNicNumber] = useState('');

  // Bank Section
  const [hasBankSection, setHasBankSection] = useState(true);
  const [bankName, setBankName] = useState('Bank of Ceylon (BOC)');
  const [bankBranch, setBankBranch] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [accountHolderName, setAccountHolderName] = useState('');

  const cropOptions = [
    { id: 'carrots', name: 'Highland Carrots', nameSi: 'කැරට්', avgPrice: 280, middlemanPrice: 190, unit: 'kg', category: ProductCategory.VEGETABLE },
    { id: 'chillies', name: 'Green Chillies (MICH)', nameSi: 'අමු මිරිස්', avgPrice: 450, middlemanPrice: 310, unit: 'kg', category: ProductCategory.SPICE_HERB },
    { id: 'rice', name: 'Traditional Rathu Kakulu', nameSi: 'රතු කැකුළු සහල්', avgPrice: 220, middlemanPrice: 155, unit: 'kg', category: ProductCategory.GRAIN_PULSE },
    { id: 'potatoes', name: 'Nuwara Eliya Potatoes', nameSi: 'අල', avgPrice: 380, middlemanPrice: 260, unit: 'kg', category: ProductCategory.TUBER_ROOT },
    { id: 'bananas', name: 'Ambul Bananas', nameSi: 'කෙසෙල්', avgPrice: 120, middlemanPrice: 75, unit: 'kg', category: ProductCategory.FRUIT },
  ];

  const currentCropObj = cropOptions.find((c) => c.id === selectedCrop) || cropOptions[0];
  const polaRevenue = currentCropObj.avgPrice * harvestKg;
  const middlemanRevenue = currentCropObj.middlemanPrice * harvestKg;
  const extraEarnings = polaRevenue - middlemanRevenue;

  const provinces = Object.keys(PROVINCES_DISTRICTS);
  const districtsInProvince = PROVINCES_DISTRICTS[province] || DISTRICTS || [];

  const handleLanguageSelect = async (lang: LanguageCode) => {
    setLanguage(lang);
    try {
      await AuthService.updateProfile({ preferredLanguage: lang } as any);
    } catch (e) {}
    setCurrentStep(1);
  };

  // Section Skip Handlers with Data Discard
  const handleSkipFarmSection = () => {
    setHasFarmSection(false);
    setFarmName('');
    setLandAcres(0);
    setProvince('Central');
    setDistrict('Nuwara Eliya');
    setErrorMsg('');
    toast('Farm registration skipped. You can register farms later in My Farms.');
    setCurrentStep(11); // Skip Farm & Produce drafts, jump to KYC
  };

  const handleSkipProduceSection = () => {
    setHasProduceSection(false);
    setProduceName('');
    setPricePerKg(0);
    setErrorMsg('');
    toast('Crop listing draft skipped.');
    setCurrentStep(11); // Jump to KYC
  };

  const handleSkipKycSection = () => {
    setHasKycSection(false);
    setNicNumber('');
    setErrorMsg('');
    toast('KYC verification skipped. You can verify anytime in Settings.');
    setCurrentStep(12); // Jump to Bank Setup
  };

  const handleSkipBankSection = () => {
    setHasBankSection(false);
    setBankName('');
    setBankBranch('');
    setAccountNumber('');
    setAccountHolderName('');
    setErrorMsg('');
    toast('Bank setup skipped. You can link your bank in Wallet.');
    setCurrentStep(16); // Jump to Celebration
  };

  // Validation on Next
  const handleNextStep = () => {
    setErrorMsg('');

    // Step 4: Farm Name
    if (currentStep === 4) {
      if (!farmName.trim() || farmName.trim().length < 3) {
        setErrorMsg('Please enter a farm name (minimum 3 characters).');
        return;
      }
    }

    // Step 7: Land Extent
    if (currentStep === 7) {
      if (!landAcres || landAcres <= 0) {
        setErrorMsg('Please enter valid land acreage.');
        return;
      }
    }

    // Step 9: Produce Name
    if (currentStep === 9) {
      if (!produceName.trim() || produceName.trim().length < 2) {
        setErrorMsg('Please enter a produce listing title.');
        return;
      }
    }

    // Step 10: Price per kg
    if (currentStep === 10) {
      if (!pricePerKg || pricePerKg < 10) {
        setErrorMsg('Please enter a valid price per kg (minimum LKR 10).');
        return;
      }
    }

    // Step 11: KYC NIC
    if (currentStep === 11) {
      if (!nicNumber.trim() || nicNumber.trim().length < 9) {
        setErrorMsg('Please enter a valid 9-12 character NIC number, or click "Skip this section".');
        return;
      }
    }

    // Step 13: Bank Branch
    if (currentStep === 13) {
      if (!bankBranch.trim()) {
        setErrorMsg('Please enter your bank branch name, or click "Skip this section".');
        return;
      }
    }

    // Step 14: Bank Account Number
    if (currentStep === 14) {
      if (!accountNumber.trim() || accountNumber.trim().length < 5) {
        setErrorMsg('Please enter a valid account number, or click "Skip this section".');
        return;
      }
    }

    // Step 15: Account Holder Name
    if (currentStep === 15) {
      if (!accountHolderName.trim()) {
        setErrorMsg('Please enter the account holder name, or click "Skip this section".');
        return;
      }
    }

    setCurrentStep((prev) => prev + 1);
  };

  const prevStep = () => {
    setErrorMsg('');
    setCurrentStep((prev) => Math.max(0, prev - 1));
  };

  const handleComplete = async () => {
    try {
      setIsLoading(true);

      // 1. Create Farm only if section not skipped and name is valid
      let createdFarmId: string | undefined;
      if (hasFarmSection && farmName.trim()) {
        try {
          const farmRes: any = await FarmService.createFarm({
            name: farmName.trim(),
            province,
            district,
            city: district,
            streetAddress: district,
            totalAreaAcres: landAcres,
            isOrganicCertified: isOrganic,
            isActive: true,
          });
          if (farmRes.success && farmRes.data) {
            createdFarmId = farmRes.data.farm._id;
          }
        } catch (e) {
          console.warn('Farm creation warning:', e);
        }
      }

      // 2. Create Initial Product listing only if farm created and produce not skipped
      if (createdFarmId && hasProduceSection && produceName.trim() && pricePerKg > 0) {
        try {
          await ProductService.createProduct({
            farmId: createdFarmId,
            title: produceName.trim(),
            category: currentCropObj.category,
            pricePerUnit: pricePerKg,
            unit: currentCropObj.unit,
            availableQuantity: harvestKg,
            minOrderQuantity: 5,
            isOrganic,
            qualityGrade: 'Grade A',
            images: ['https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?auto=format&fit=crop&w=800&q=80'],
          });
        } catch (e) {
          console.warn('Product draft creation warning:', e);
        }
      }

      // 3. Update User Profile with Role, Bank, KYC & Onboarding Flag
      const bankDetails = hasBankSection && bankName && accountNumber.trim() ? {
        bankName,
        branch: bankBranch.trim() || 'Main Branch',
        accountNumber: accountNumber.trim(),
        accountHolderName: accountHolderName.trim() || user?.fullName || 'Farmer',
      } : undefined;

      try {
        await AuthService.updateProfile({
          role: 'farmer' as any,
          bankDetails,
          onboardingCompleted: true,
        });
      } catch (e) {}

      updateUser({
        role: 'farmer' as any,
        bankDetails,
      });

      toast.success('Your farmer profile is live on Pola!');
      navigate('/farmer/dashboard');
    } catch (err: any) {
      toast.error('Failed to complete farmer registration');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSkipAll = async () => {
    try {
      await AuthService.updateProfile({ onboardingCompleted: true });
    } catch (e) {}
    navigate('/farmer/dashboard');
  };

  return (
    <div className="min-h-screen w-full bg-slate-950 text-white flex flex-col justify-between selection:bg-lime-400 selection:text-slate-950 relative overflow-hidden">
      {/* Background Graphic */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <img
          src="https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&w=2400&q=85"
          alt="Farmland"
          className="w-full h-full object-cover brightness-40 scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/80 to-black/70" />
      </div>

      {/* Top Bar */}
      <header className="relative z-10 max-w-4xl mx-auto w-full px-4 pt-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-lime-400 text-slate-950 flex items-center justify-center font-black">
            <Sprout className="w-4 h-4 text-slate-950" />
          </div>
          <span className="font-extrabold text-lg tracking-tight">
            Pola <span className="text-lime-400 text-sm font-mono">.lk</span>
          </span>
        </div>

        {currentStep > 0 && (
          <div className="flex items-center gap-3">
            <span className="text-xs text-slate-400 font-bold font-mono">
              Step {currentStep} of 16
            </span>
            <button
              onClick={handleSkipAll}
              className="text-xs text-slate-400 hover:text-white font-bold transition-colors cursor-pointer"
            >
              Skip Onboarding
            </button>
          </div>
        )}
      </header>

      {/* Main Card Container */}
      <main className="relative z-10 max-w-2xl mx-auto w-full px-4 py-8 flex-1 flex items-center justify-center">
        {/* CARD 0: Language */}
        {currentStep === 0 && (
          <div className="glass-terminal rounded-3xl p-8 space-y-6 w-full text-center animate-in fade-in">
            <div className="w-12 h-12 rounded-2xl bg-lime-500/20 text-lime-300 border border-lime-500/30 flex items-center justify-center mx-auto">
              <Globe className="w-6 h-6" />
            </div>

            <div className="space-y-1">
              <h2 className="text-2xl sm:text-3xl font-black text-white">Choose your language</h2>
              <p className="text-xs text-slate-300">භාෂාව තෝරන්න • மொழியை தேர்ந்தெடுக்கவும்</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
              <button
                onClick={() => handleLanguageSelect('en')}
                className="p-5 rounded-2xl border border-white/20 bg-white/10 hover:bg-lime-500/20 hover:border-lime-400 text-left transition-all cursor-pointer group"
              >
                <span className="block font-black text-base text-white group-hover:text-lime-300">English</span>
                <span className="text-[11px] text-slate-300">Standard</span>
              </button>

              <button
                onClick={() => handleLanguageSelect('si')}
                className="p-5 rounded-2xl border border-white/20 bg-white/10 hover:bg-lime-500/20 hover:border-lime-400 text-left transition-all cursor-pointer group"
              >
                <span className="block font-black text-base text-white group-hover:text-lime-300">සිංහල</span>
                <span className="text-[11px] text-slate-300">ස්වාභාවික</span>
              </button>

              <button
                onClick={() => handleLanguageSelect('ta')}
                className="p-5 rounded-2xl border border-white/20 bg-white/10 hover:bg-lime-500/20 hover:border-lime-400 text-left transition-all cursor-pointer group"
              >
                <span className="block font-black text-base text-white group-hover:text-lime-300">தமிழ்</span>
                <span className="text-[11px] text-slate-300">இயற்கையான</span>
              </button>
            </div>
          </div>
        )}

        {/* CARD 1: Value Promise */}
        {currentStep === 1 && (
          <div className="glass-terminal rounded-3xl p-8 space-y-6 w-full text-center animate-in fade-in">
            <div className="w-14 h-14 rounded-3xl bg-lime-500/20 text-lime-300 border border-lime-500/30 flex items-center justify-center mx-auto">
              <TrendingUp className="w-7 h-7" />
            </div>

            <div className="space-y-2">
              <h2 className="text-3xl font-black text-white">
                Sell Directly. <span className="text-lime-300 font-serif-accent italic">Earn +40% More.</span>
              </h2>
              <p className="text-sm text-slate-300 leading-relaxed max-w-md mx-auto">
                No middlemen taking unfair cuts. List your harvest directly to supermarkets, hotels, and households with guaranteed 24-hour LankaPay payouts.
              </p>
            </div>

            <div className="pt-4">
              <button
                onClick={handleNextStep}
                className="w-full py-3.5 px-6 rounded-2xl bg-lime-400 hover:bg-lime-300 text-slate-950 font-extrabold text-sm flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <span>Calculate My Earnings</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* CARD 2: Crop Selector & Live Calculator */}
        {currentStep === 2 && (
          <div className="glass-terminal rounded-3xl p-8 space-y-6 w-full text-left animate-in fade-in">
            <div className="space-y-1">
              <span className="text-[11px] font-bold text-lime-400 uppercase tracking-wider font-mono">Step 2 • Crop Type</span>
              <h2 className="text-2xl font-black text-white">What primary crop do you harvest?</h2>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {cropOptions.map((crop) => (
                <div
                  key={crop.id}
                  onClick={() => {
                    setSelectedCrop(crop.id);
                    setProduceName(`${crop.name} (Grade A)`);
                    setPricePerKg(crop.avgPrice);
                    setErrorMsg('');
                  }}
                  className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
                    selectedCrop === crop.id
                      ? 'border-lime-400 bg-lime-500/20 text-white shadow-md'
                      : 'border-white/15 bg-white/5 text-slate-300 hover:bg-white/10'
                  }`}
                >
                  <p className="font-extrabold text-xs text-white">{crop.name}</p>
                  <span className="text-[11px] text-lime-300 font-bold block mt-1">LKR {crop.avgPrice}/kg</span>
                </div>
              ))}
            </div>

            {/* Live Gain Box */}
            <div className="p-4 rounded-2xl bg-black/40 border border-white/10 space-y-1">
              <div className="flex justify-between text-xs text-slate-300">
                <span>Middleman Rate: LKR {middlemanRevenue.toLocaleString()}</span>
                <span className="text-lime-300 font-bold">Pola Direct: LKR {polaRevenue.toLocaleString()}</span>
              </div>
              <p className="text-xs font-black text-lime-400 pt-1">
                You earn +LKR {extraEarnings.toLocaleString()} more per {harvestKg} kg on Pola!
              </p>
            </div>

            <div className="pt-2 flex justify-between items-center gap-3">
              <button
                onClick={prevStep}
                className="py-3 px-4 rounded-2xl border border-white/20 text-slate-300 hover:text-white text-xs font-bold transition-colors cursor-pointer"
              >
                Back
              </button>
              <button
                onClick={handleNextStep}
                className="py-3 px-6 rounded-2xl bg-lime-400 hover:bg-lime-300 text-slate-950 text-xs font-black flex items-center gap-2 transition-all cursor-pointer"
              >
                <span>Continue</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* CARD 3: Volume Slider */}
        {currentStep === 3 && (
          <div className="glass-terminal rounded-3xl p-8 space-y-6 w-full text-left animate-in fade-in">
            <div className="space-y-1">
              <span className="text-[11px] font-bold text-lime-400 uppercase tracking-wider font-mono">Step 3 • Harvest Volume</span>
              <h2 className="text-2xl font-black text-white">How much do you harvest per cycle?</h2>
            </div>

            <div className="space-y-4 py-4 text-center">
              <span className="text-4xl font-black text-lime-300 font-mono">
                {harvestKg.toLocaleString()} <span className="text-lg font-bold text-white">kg</span>
              </span>

              <input
                type="range"
                min="50"
                max="5000"
                step="50"
                value={harvestKg}
                onChange={(e) => setHarvestKg(parseInt(e.target.value))}
                className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-lime-400"
              />
            </div>

            <div className="pt-2 flex justify-between items-center gap-3">
              <button
                onClick={prevStep}
                className="py-3 px-4 rounded-2xl border border-white/20 text-slate-300 hover:text-white text-xs font-bold transition-colors cursor-pointer"
              >
                Back
              </button>
              <button
                onClick={handleNextStep}
                className="py-3 px-6 rounded-2xl bg-lime-400 hover:bg-lime-300 text-slate-950 text-xs font-black flex items-center gap-2 transition-all cursor-pointer"
              >
                <span>Continue</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* CARD 4: Farm Name (Farm Section) */}
        {currentStep === 4 && (
          <div className="glass-terminal rounded-3xl p-8 space-y-6 w-full text-left animate-in fade-in">
            <div className="flex justify-between items-start">
              <div className="space-y-1">
                <span className="text-[11px] font-bold text-lime-400 uppercase tracking-wider font-mono">Farm Section • Step 4</span>
                <h2 className="text-2xl font-black text-white">What is your farm called?</h2>
              </div>

              <button
                onClick={handleSkipFarmSection}
                className="px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white text-[11px] font-bold transition-all cursor-pointer flex items-center gap-1 shrink-0"
              >
                <SkipForward className="w-3 h-3" />
                <span>Skip Farm Setup</span>
              </button>
            </div>

            <div>
              <input
                type="text"
                placeholder="e.g. Karunathilaka Organic Farm, Green Valley Estate"
                value={farmName}
                onChange={(e) => {
                  setFarmName(e.target.value);
                  setErrorMsg('');
                }}
                className="w-full px-4 py-3.5 rounded-2xl bg-white/10 border border-white/20 text-white placeholder-white/40 text-sm focus:outline-none focus:border-lime-400"
                autoFocus
              />
            </div>

            {errorMsg && (
              <div className="p-3 rounded-xl bg-rose-500/20 border border-rose-400/40 text-xs text-rose-300 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <div className="pt-2 flex justify-between items-center gap-3">
              <button
                onClick={prevStep}
                className="py-3 px-4 rounded-2xl border border-white/20 text-slate-300 hover:text-white text-xs font-bold transition-colors cursor-pointer"
              >
                Back
              </button>
              <button
                onClick={handleNextStep}
                className="py-3 px-6 rounded-2xl bg-lime-400 hover:bg-lime-300 text-slate-950 text-xs font-black flex items-center gap-2 transition-all cursor-pointer"
              >
                <span>Continue</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* CARD 5: Farm Province */}
        {currentStep === 5 && (
          <div className="glass-terminal rounded-3xl p-8 space-y-6 w-full text-left animate-in fade-in">
            <div className="flex justify-between items-start">
              <div className="space-y-1">
                <span className="text-[11px] font-bold text-lime-400 uppercase tracking-wider font-mono">Farm Section • Step 5</span>
                <h2 className="text-2xl font-black text-white">Which province is your land in?</h2>
              </div>

              <button
                onClick={handleSkipFarmSection}
                className="px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white text-[11px] font-bold transition-all cursor-pointer flex items-center gap-1 shrink-0"
              >
                <SkipForward className="w-3 h-3" />
                <span>Skip Farm Setup</span>
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 max-h-60 overflow-y-auto pr-1">
              {provinces.map((prov) => (
                <button
                  key={prov}
                  onClick={() => {
                    setProvince(prov);
                    const firstD = PROVINCES_DISTRICTS[prov]?.[0] || 'Nuwara Eliya';
                    setDistrict(firstD);
                    setErrorMsg('');
                  }}
                  className={`p-3 rounded-2xl border text-xs font-bold text-left transition-all cursor-pointer ${
                    province === prov
                      ? 'border-lime-400 bg-lime-500/20 text-lime-300 shadow-md'
                      : 'border-white/15 bg-white/5 text-slate-300 hover:bg-white/10'
                  }`}
                >
                  {prov}
                </button>
              ))}
            </div>

            <div className="pt-2 flex justify-between items-center gap-3">
              <button
                onClick={prevStep}
                className="py-3 px-4 rounded-2xl border border-white/20 text-slate-300 hover:text-white text-xs font-bold transition-colors cursor-pointer"
              >
                Back
              </button>
              <button
                onClick={handleNextStep}
                className="py-3 px-6 rounded-2xl bg-lime-400 hover:bg-lime-300 text-slate-950 text-xs font-black flex items-center gap-2 transition-all cursor-pointer"
              >
                <span>Continue</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* CARD 6: Farm District */}
        {currentStep === 6 && (
          <div className="glass-terminal rounded-3xl p-8 space-y-6 w-full text-left animate-in fade-in">
            <div className="flex justify-between items-start">
              <div className="space-y-1">
                <span className="text-[11px] font-bold text-lime-400 uppercase tracking-wider font-mono">Farm Section • Step 6</span>
                <h2 className="text-2xl font-black text-white">Which district in {province}?</h2>
              </div>

              <button
                onClick={handleSkipFarmSection}
                className="px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white text-[11px] font-bold transition-all cursor-pointer flex items-center gap-1 shrink-0"
              >
                <SkipForward className="w-3 h-3" />
                <span>Skip Farm Setup</span>
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 max-h-60 overflow-y-auto pr-1">
              {districtsInProvince.map((d) => (
                <button
                  key={d}
                  onClick={() => {
                    setDistrict(d);
                    setErrorMsg('');
                  }}
                  className={`p-3 rounded-2xl border text-xs font-bold text-left transition-all cursor-pointer ${
                    district === d
                      ? 'border-lime-400 bg-lime-500/20 text-lime-300 shadow-md'
                      : 'border-white/15 bg-white/5 text-slate-300 hover:bg-white/10'
                  }`}
                >
                  {d}
                </button>
              ))}
            </div>

            <div className="pt-2 flex justify-between items-center gap-3">
              <button
                onClick={prevStep}
                className="py-3 px-4 rounded-2xl border border-white/20 text-slate-300 hover:text-white text-xs font-bold transition-colors cursor-pointer"
              >
                Back
              </button>
              <button
                onClick={handleNextStep}
                className="py-3 px-6 rounded-2xl bg-lime-400 hover:bg-lime-300 text-slate-950 text-xs font-black flex items-center gap-2 transition-all cursor-pointer"
              >
                <span>Continue</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* CARD 7: Land Extent */}
        {currentStep === 7 && (
          <div className="glass-terminal rounded-3xl p-8 space-y-6 w-full text-left animate-in fade-in">
            <div className="flex justify-between items-start">
              <div className="space-y-1">
                <span className="text-[11px] font-bold text-lime-400 uppercase tracking-wider font-mono">Farm Section • Step 7</span>
                <h2 className="text-2xl font-black text-white">How many acres do you cultivate?</h2>
              </div>

              <button
                onClick={handleSkipFarmSection}
                className="px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white text-[11px] font-bold transition-all cursor-pointer flex items-center gap-1 shrink-0"
              >
                <SkipForward className="w-3 h-3" />
                <span>Skip Farm Setup</span>
              </button>
            </div>

            <div className="space-y-4 py-4 text-center">
              <span className="text-4xl font-black text-lime-300 font-mono">
                {landAcres} <span className="text-lg font-bold text-white">Acres</span>
              </span>

              <input
                type="range"
                min="0.25"
                max="50"
                step="0.25"
                value={landAcres}
                onChange={(e) => {
                  setLandAcres(parseFloat(e.target.value));
                  setErrorMsg('');
                }}
                className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-lime-400"
              />
            </div>

            {errorMsg && (
              <div className="p-3 rounded-xl bg-rose-500/20 border border-rose-400/40 text-xs text-rose-300 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <div className="pt-2 flex justify-between items-center gap-3">
              <button
                onClick={prevStep}
                className="py-3 px-4 rounded-2xl border border-white/20 text-slate-300 hover:text-white text-xs font-bold transition-colors cursor-pointer"
              >
                Back
              </button>
              <button
                onClick={handleNextStep}
                className="py-3 px-6 rounded-2xl bg-lime-400 hover:bg-lime-300 text-slate-950 text-xs font-black flex items-center gap-2 transition-all cursor-pointer"
              >
                <span>Continue</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* CARD 8: Organic Certification */}
        {currentStep === 8 && (
          <div className="glass-terminal rounded-3xl p-8 space-y-6 w-full text-left animate-in fade-in">
            <div className="flex justify-between items-start">
              <div className="space-y-1">
                <span className="text-[11px] font-bold text-lime-400 uppercase tracking-wider font-mono">Farm Section • Step 8</span>
                <h2 className="text-2xl font-black text-white">Is your farm PGS or organic certified?</h2>
              </div>

              <button
                onClick={handleSkipFarmSection}
                className="px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white text-[11px] font-bold transition-all cursor-pointer flex items-center gap-1 shrink-0"
              >
                <SkipForward className="w-3 h-3" />
                <span>Skip Farm Setup</span>
              </button>
            </div>

            <div className="space-y-3">
              <div
                onClick={() => setIsOrganic(true)}
                className={`p-4 rounded-2xl border transition-all flex items-center justify-between cursor-pointer ${
                  isOrganic
                    ? 'border-lime-400 bg-lime-500/20 text-white shadow-md'
                    : 'border-white/15 bg-white/5 text-slate-300 hover:bg-white/10'
                }`}
              >
                <div className="flex items-center gap-3">
                  <ShieldCheck className="w-5 h-5 text-lime-400" />
                  <div>
                    <span className="font-extrabold text-sm block">Yes, PGS or Certified Organic</span>
                    <span className="text-[11px] text-slate-300">Pesticide-free / Organic Farming</span>
                  </div>
                </div>
                {isOrganic && <CheckCircle2 className="w-5 h-5 text-lime-400" />}
              </div>

              <div
                onClick={() => setIsOrganic(false)}
                className={`p-4 rounded-2xl border transition-all flex items-center justify-between cursor-pointer ${
                  !isOrganic
                    ? 'border-lime-400 bg-lime-500/20 text-white shadow-md'
                    : 'border-white/15 bg-white/5 text-slate-300 hover:bg-white/10'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Sprout className="w-5 h-5 text-slate-400" />
                  <div>
                    <span className="font-extrabold text-sm block">Conventional Good Agrarian Practices (GAP)</span>
                    <span className="text-[11px] text-slate-300">Standard high-yield production</span>
                  </div>
                </div>
                {!isOrganic && <CheckCircle2 className="w-5 h-5 text-lime-400" />}
              </div>
            </div>

            <div className="pt-2 flex justify-between items-center gap-3">
              <button
                onClick={prevStep}
                className="py-3 px-4 rounded-2xl border border-white/20 text-slate-300 hover:text-white text-xs font-bold transition-colors cursor-pointer"
              >
                Back
              </button>
              <button
                onClick={handleNextStep}
                className="py-3 px-6 rounded-2xl bg-lime-400 hover:bg-lime-300 text-slate-950 text-xs font-black flex items-center gap-2 transition-all cursor-pointer"
              >
                <span>Continue to First Crop</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* CARD 9: Produce Name */}
        {currentStep === 9 && (
          <div className="glass-terminal rounded-3xl p-8 space-y-6 w-full text-left animate-in fade-in">
            <div className="flex justify-between items-start">
              <div className="space-y-1">
                <span className="text-[11px] font-bold text-lime-400 uppercase tracking-wider font-mono">Produce Section • Step 9</span>
                <h2 className="text-2xl font-black text-white">First crop listing title</h2>
              </div>

              <button
                onClick={handleSkipProduceSection}
                className="px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white text-[11px] font-bold transition-all cursor-pointer flex items-center gap-1 shrink-0"
              >
                <SkipForward className="w-3 h-3" />
                <span>Skip Crop Listing</span>
              </button>
            </div>

            <div>
              <input
                type="text"
                placeholder="e.g. Highland Carrots (Grade A)"
                value={produceName}
                onChange={(e) => {
                  setProduceName(e.target.value);
                  setErrorMsg('');
                }}
                className="w-full px-4 py-3.5 rounded-2xl bg-white/10 border border-white/20 text-white placeholder-white/40 text-sm focus:outline-none focus:border-lime-400"
                autoFocus
              />
            </div>

            {errorMsg && (
              <div className="p-3 rounded-xl bg-rose-500/20 border border-rose-400/40 text-xs text-rose-300 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <div className="pt-2 flex justify-between items-center gap-3">
              <button
                onClick={prevStep}
                className="py-3 px-4 rounded-2xl border border-white/20 text-slate-300 hover:text-white text-xs font-bold transition-colors cursor-pointer"
              >
                Back
              </button>
              <button
                onClick={handleNextStep}
                className="py-3 px-6 rounded-2xl bg-lime-400 hover:bg-lime-300 text-slate-950 text-xs font-black flex items-center gap-2 transition-all cursor-pointer"
              >
                <span>Continue</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* CARD 10: Price per kg */}
        {currentStep === 10 && (
          <div className="glass-terminal rounded-3xl p-8 space-y-6 w-full text-left animate-in fade-in">
            <div className="flex justify-between items-start">
              <div className="space-y-1">
                <span className="text-[11px] font-bold text-lime-400 uppercase tracking-wider font-mono">Produce Section • Step 10</span>
                <h2 className="text-2xl font-black text-white">Your asking price (LKR / kg)?</h2>
              </div>

              <button
                onClick={handleSkipProduceSection}
                className="px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white text-[11px] font-bold transition-all cursor-pointer flex items-center gap-1 shrink-0"
              >
                <SkipForward className="w-3 h-3" />
                <span>Skip Crop Listing</span>
              </button>
            </div>

            <div>
              <input
                type="number"
                value={pricePerKg}
                onChange={(e) => {
                  setPricePerKg(parseInt(e.target.value) || 0);
                  setErrorMsg('');
                }}
                className="w-full px-4 py-3.5 rounded-2xl bg-white/10 border border-white/20 text-white text-lg font-black focus:outline-none focus:border-lime-400 font-mono"
                autoFocus
              />
            </div>

            {errorMsg && (
              <div className="p-3 rounded-xl bg-rose-500/20 border border-rose-400/40 text-xs text-rose-300 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <div className="pt-2 flex justify-between items-center gap-3">
              <button
                onClick={prevStep}
                className="py-3 px-4 rounded-2xl border border-white/20 text-slate-300 hover:text-white text-xs font-bold transition-colors cursor-pointer"
              >
                Back
              </button>
              <button
                onClick={handleNextStep}
                className="py-3 px-6 rounded-2xl bg-lime-400 hover:bg-lime-300 text-slate-950 text-xs font-black flex items-center gap-2 transition-all cursor-pointer"
              >
                <span>Continue to Verification</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* CARD 11: KYC Identity */}
        {currentStep === 11 && (
          <div className="glass-terminal rounded-3xl p-8 space-y-6 w-full text-left animate-in fade-in">
            <div className="flex justify-between items-start">
              <div className="space-y-1">
                <span className="text-[11px] font-bold text-lime-400 uppercase tracking-wider font-mono">KYC Section • Step 11</span>
                <h2 className="text-2xl font-black text-white">National Identity Card (NIC)</h2>
                <p className="text-xs text-slate-300">Unlocks Verified Farmer badge and priority hub scheduling.</p>
              </div>

              <button
                onClick={handleSkipKycSection}
                className="px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white text-[11px] font-bold transition-all cursor-pointer flex items-center gap-1 shrink-0"
              >
                <SkipForward className="w-3 h-3" />
                <span>Skip Verification</span>
              </button>
            </div>

            <div>
              <input
                type="text"
                placeholder="e.g. 198512345678 or 851234567V"
                value={nicNumber}
                onChange={(e) => {
                  setNicNumber(e.target.value);
                  setErrorMsg('');
                }}
                className="w-full px-4 py-3.5 rounded-2xl bg-white/10 border border-white/20 text-white placeholder-white/40 text-sm focus:outline-none focus:border-lime-400 font-mono"
                autoFocus
              />
            </div>

            {errorMsg && (
              <div className="p-3 rounded-xl bg-rose-500/20 border border-rose-400/40 text-xs text-rose-300 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <div className="pt-2 flex justify-between items-center gap-3">
              <button
                onClick={prevStep}
                className="py-3 px-4 rounded-2xl border border-white/20 text-slate-300 hover:text-white text-xs font-bold transition-colors cursor-pointer"
              >
                Back
              </button>
              <button
                onClick={handleNextStep}
                className="py-3 px-6 rounded-2xl bg-lime-400 hover:bg-lime-300 text-slate-950 text-xs font-black flex items-center gap-2 transition-all cursor-pointer"
              >
                <span>Continue to Bank Setup</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* CARD 12: Bank Name */}
        {currentStep === 12 && (
          <div className="glass-terminal rounded-3xl p-8 space-y-6 w-full text-left animate-in fade-in">
            <div className="flex justify-between items-start">
              <div className="space-y-1">
                <span className="text-[11px] font-bold text-lime-400 uppercase tracking-wider font-mono">Bank Section • Step 12</span>
                <h2 className="text-2xl font-black text-white">Which bank do you use?</h2>
              </div>

              <button
                onClick={handleSkipBankSection}
                className="px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white text-[11px] font-bold transition-all cursor-pointer flex items-center gap-1 shrink-0"
              >
                <SkipForward className="w-3 h-3" />
                <span>Skip Bank Setup</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-60 overflow-y-auto pr-1">
              {[
                'Bank of Ceylon (BOC)',
                "People's Bank",
                'Commercial Bank',
                'Hatton National Bank (HNB)',
                'Sampath Bank',
                'National Savings Bank (NSB)',
                'Seylan Bank',
                'NDB Bank',
              ].map((bank) => (
                <button
                  key={bank}
                  onClick={() => {
                    setBankName(bank);
                    setErrorMsg('');
                  }}
                  className={`p-3.5 rounded-2xl border text-xs font-bold text-left transition-all cursor-pointer ${
                    bankName === bank
                      ? 'border-lime-400 bg-lime-500/20 text-lime-300 shadow-md'
                      : 'border-white/15 bg-white/5 text-slate-300 hover:bg-white/10'
                  }`}
                >
                  {bank}
                </button>
              ))}
            </div>

            <div className="pt-2 flex justify-between items-center gap-3">
              <button
                onClick={prevStep}
                className="py-3 px-4 rounded-2xl border border-white/20 text-slate-300 hover:text-white text-xs font-bold transition-colors cursor-pointer"
              >
                Back
              </button>
              <button
                onClick={handleNextStep}
                className="py-3 px-6 rounded-2xl bg-lime-400 hover:bg-lime-300 text-slate-950 text-xs font-black flex items-center gap-2 transition-all cursor-pointer"
              >
                <span>Continue</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* CARD 13: Bank Branch */}
        {currentStep === 13 && (
          <div className="glass-terminal rounded-3xl p-8 space-y-6 w-full text-left animate-in fade-in">
            <div className="flex justify-between items-start">
              <div className="space-y-1">
                <span className="text-[11px] font-bold text-lime-400 uppercase tracking-wider font-mono">Bank Section • Step 13</span>
                <h2 className="text-2xl font-black text-white">Which branch?</h2>
              </div>

              <button
                onClick={handleSkipBankSection}
                className="px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white text-[11px] font-bold transition-all cursor-pointer flex items-center gap-1 shrink-0"
              >
                <SkipForward className="w-3 h-3" />
                <span>Skip Bank Setup</span>
              </button>
            </div>

            <div>
              <input
                type="text"
                placeholder="e.g. Nuwara Eliya Main Branch"
                value={bankBranch}
                onChange={(e) => {
                  setBankBranch(e.target.value);
                  setErrorMsg('');
                }}
                className="w-full px-4 py-3.5 rounded-2xl bg-white/10 border border-white/20 text-white placeholder-white/40 text-sm focus:outline-none focus:border-lime-400"
                autoFocus
              />
            </div>

            {errorMsg && (
              <div className="p-3 rounded-xl bg-rose-500/20 border border-rose-400/40 text-xs text-rose-300 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <div className="pt-2 flex justify-between items-center gap-3">
              <button
                onClick={prevStep}
                className="py-3 px-4 rounded-2xl border border-white/20 text-slate-300 hover:text-white text-xs font-bold transition-colors cursor-pointer"
              >
                Back
              </button>
              <button
                onClick={handleNextStep}
                className="py-3 px-6 rounded-2xl bg-lime-400 hover:bg-lime-300 text-slate-950 text-xs font-black flex items-center gap-2 transition-all cursor-pointer"
              >
                <span>Continue</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* CARD 14: Bank Account Number */}
        {currentStep === 14 && (
          <div className="glass-terminal rounded-3xl p-8 space-y-6 w-full text-left animate-in fade-in">
            <div className="flex justify-between items-start">
              <div className="space-y-1">
                <span className="text-[11px] font-bold text-lime-400 uppercase tracking-wider font-mono">Bank Section • Step 14</span>
                <h2 className="text-2xl font-black text-white">Your Bank Account Number</h2>
              </div>

              <button
                onClick={handleSkipBankSection}
                className="px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white text-[11px] font-bold transition-all cursor-pointer flex items-center gap-1 shrink-0"
              >
                <SkipForward className="w-3 h-3" />
                <span>Skip Bank Setup</span>
              </button>
            </div>

            <div>
              <input
                type="text"
                placeholder="e.g. 008749210"
                value={accountNumber}
                onChange={(e) => {
                  setAccountNumber(e.target.value);
                  setErrorMsg('');
                }}
                className="w-full px-4 py-3.5 rounded-2xl bg-white/10 border border-white/20 text-white placeholder-white/40 text-sm font-mono focus:outline-none focus:border-lime-400"
                autoFocus
              />
            </div>

            {errorMsg && (
              <div className="p-3 rounded-xl bg-rose-500/20 border border-rose-400/40 text-xs text-rose-300 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <div className="pt-2 flex justify-between items-center gap-3">
              <button
                onClick={prevStep}
                className="py-3 px-4 rounded-2xl border border-white/20 text-slate-300 hover:text-white text-xs font-bold transition-colors cursor-pointer"
              >
                Back
              </button>
              <button
                onClick={handleNextStep}
                className="py-3 px-6 rounded-2xl bg-lime-400 hover:bg-lime-300 text-slate-950 text-xs font-black flex items-center gap-2 transition-all cursor-pointer"
              >
                <span>Continue</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* CARD 15: Account Holder Name */}
        {currentStep === 15 && (
          <div className="glass-terminal rounded-3xl p-8 space-y-6 w-full text-left animate-in fade-in">
            <div className="flex justify-between items-start">
              <div className="space-y-1">
                <span className="text-[11px] font-bold text-lime-400 uppercase tracking-wider font-mono">Bank Section • Step 15</span>
                <h2 className="text-2xl font-black text-white">Account Holder Name</h2>
              </div>

              <button
                onClick={handleSkipBankSection}
                className="px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white text-[11px] font-bold transition-all cursor-pointer flex items-center gap-1 shrink-0"
              >
                <SkipForward className="w-3 h-3" />
                <span>Skip Bank Setup</span>
              </button>
            </div>

            <div>
              <input
                type="text"
                placeholder="Full name as printed in bank passbook"
                value={accountHolderName}
                onChange={(e) => {
                  setAccountHolderName(e.target.value);
                  setErrorMsg('');
                }}
                className="w-full px-4 py-3.5 rounded-2xl bg-white/10 border border-white/20 text-white placeholder-white/40 text-sm focus:outline-none focus:border-lime-400"
                autoFocus
              />
            </div>

            {errorMsg && (
              <div className="p-3 rounded-xl bg-rose-500/20 border border-rose-400/40 text-xs text-rose-300 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <div className="pt-2 flex justify-between items-center gap-3">
              <button
                onClick={prevStep}
                className="py-3 px-4 rounded-2xl border border-white/20 text-slate-300 hover:text-white text-xs font-bold transition-colors cursor-pointer"
              >
                Back
              </button>
              <button
                onClick={handleNextStep}
                className="py-3 px-6 rounded-2xl bg-lime-400 hover:bg-lime-300 text-slate-950 text-xs font-black flex items-center gap-2 transition-all cursor-pointer"
              >
                <span>Finalize Setup</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* CARD 16: Celebration & Launch */}
        {currentStep === 16 && (
          <div className="glass-terminal rounded-3xl p-8 space-y-6 w-full text-center animate-in fade-in">
            <div className="w-16 h-16 rounded-3xl bg-lime-500/20 text-lime-300 border border-lime-500/30 flex items-center justify-center mx-auto">
              <Sprout className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <h2 className="text-3xl font-black text-white">
                Your Farm is Live on <span className="font-serif-accent italic text-lime-300">Pola</span>
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-md mx-auto">
                Buyers across Sri Lanka can now find your produce. Payouts from confirmed sales will deposit into your LankaPay wallet.
              </p>
            </div>

            <div className="pt-4">
              <button
                onClick={handleComplete}
                disabled={isLoading}
                className="w-full py-4 px-6 rounded-2xl bg-lime-400 hover:bg-lime-300 text-slate-950 font-black text-sm flex items-center justify-center gap-2 shadow-lg shadow-lime-500/25 transition-all cursor-pointer"
              >
                {isLoading ? (
                  <span className="inline-block animate-spin w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full" />
                ) : (
                  <>
                    <span>Enter Farmer Command Center</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="relative z-10 max-w-4xl mx-auto w-full px-4 pb-6 text-center text-xs text-slate-400 font-mono">
        <span>© 2026 Pola (පොළ) AgriTech Marketplace • Sri Lanka</span>
      </footer>
    </div>
  );
};
