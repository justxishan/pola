import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { useThemeStore } from '@/store/themeStore';
import { useTranslation, LanguageCode } from '@/lib/i18n';
import { AuthService } from '@/services/auth.service';
import { PROVINCES_DISTRICTS, DISTRICTS } from '@pola/shared';
import {
  ShoppingBag,
  Sparkles,
  MapPin,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Leaf,
  Building2,
  Clock,
  Heart,
  Globe,
  Utensils,
  Store,
  Home,
  Sun,
  Sunrise,
  Sunset,
  ShieldCheck,
  AlertCircle,
  SkipForward,
} from 'lucide-react';
import toast from 'react-hot-toast';

export const CustomerOnboardingPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, updateUser } = useAuthStore();
  const { language, setLanguage } = useThemeStore();
  const { t } = useTranslation();

  // Cards: 0 (Lang), 1 (Intro), 2 (Persona), 3 (Interests), 4 (Province), 5 (District), 6 (City), 7 (Timing), 8 (Celebration)
  const [currentStep, setCurrentStep] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Persona & Interests
  const [customerPersona, setCustomerPersona] = useState<'b2c' | 'b2b'>('b2c');
  const [selectedInterests, setSelectedInterests] = useState<string[]>([
    'vegetables',
    'fruits',
    'grains',
  ]);

  // Location Section
  const [hasLocationSection, setHasLocationSection] = useState(true);
  const [province, setProvince] = useState('Western');
  const [district, setDistrict] = useState('Colombo');
  const [city, setCity] = useState('');
  const [deliveryTiming, setDeliveryTiming] = useState('morning');

  const provinces = Object.keys(PROVINCES_DISTRICTS);
  const districtsInProvince = PROVINCES_DISTRICTS[province] || DISTRICTS || [];

  const handleLanguageSelect = async (lang: LanguageCode) => {
    setLanguage(lang);
    try {
      await AuthService.updateProfile({ preferredLanguage: lang } as any);
    } catch (e) {
      console.warn('Lang sync:', e);
    }
    setCurrentStep(1);
  };

  const toggleInterest = (id: string) => {
    setErrorMsg('');
    if (selectedInterests.includes(id)) {
      if (selectedInterests.length > 1) {
        setSelectedInterests(selectedInterests.filter((i) => i !== id));
      } else {
        setErrorMsg('Please select at least 1 produce interest.');
      }
    } else {
      setSelectedInterests([...selectedInterests, id]);
    }
  };

  // Section Skip Handlers (Discards partial data for that section)
  const handleSkipLocationSection = () => {
    // Discard location section data completely
    setHasLocationSection(false);
    setCity('');
    setProvince('Western');
    setDistrict('Colombo');
    setErrorMsg('');
    toast('Location setup skipped. You can add delivery addresses during checkout.');
    setCurrentStep(7); // Jump to Delivery Timing
  };

  // Step Validation before advancing
  const handleNextStep = () => {
    setErrorMsg('');

    // Step 2 Validation: Persona
    if (currentStep === 2) {
      if (!customerPersona) {
        setErrorMsg('Please select a buying persona.');
        return;
      }
    }

    // Step 3 Validation: Interests
    if (currentStep === 3) {
      if (selectedInterests.length === 0) {
        setErrorMsg('Please select at least one produce interest.');
        return;
      }
    }

    // Step 4 Validation: Province
    if (currentStep === 4) {
      if (!province.trim()) {
        setErrorMsg('Please select your province.');
        return;
      }
    }

    // Step 5 Validation: District
    if (currentStep === 5) {
      if (!district.trim()) {
        setErrorMsg('Please select your district.');
        return;
      }
    }

    // Step 6 Validation: City / Town
    if (currentStep === 6) {
      if (!city.trim() || city.trim().length < 2) {
        setErrorMsg('Please enter your city or town name (minimum 2 characters).');
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

      const addresses = hasLocationSection && city.trim() ? [
        {
          label: customerPersona === 'b2b' ? 'Commercial Outlet' : 'Home Delivery',
          province,
          district,
          city: city.trim(),
          streetAddress: city.trim(),
          postalCode: '00300',
          isDefault: true,
        },
      ] : [];

      try {
        await AuthService.updateProfile({
          role: customerPersona === 'b2b' ? 'customer_b2b' : ('customer_b2c' as any),
          addresses,
          onboardingCompleted: true,
        });
      } catch (apiErr) {
        console.warn('Profile sync warning:', apiErr);
      }

      updateUser({
        role: customerPersona === 'b2b' ? 'customer_b2b' : ('customer_b2c' as any),
        addresses,
      });

      toast.success('Welcome to Pola!');
      navigate('/');
    } catch (err: any) {
      toast.error('Failed to complete onboarding setup');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSkipAll = async () => {
    try {
      await AuthService.updateProfile({ onboardingCompleted: true });
    } catch (e) {}
    navigate('/');
  };

  return (
    <div className="min-h-screen w-full bg-slate-950 text-white flex flex-col justify-between selection:bg-lime-400 selection:text-slate-950 relative overflow-hidden">
      {/* Background Graphic */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <img
          src="https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=2400&q=85"
          alt="Marketplace"
          className="w-full h-full object-cover brightness-40 scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/80 to-black/70" />
      </div>

      {/* Top Bar */}
      <header className="relative z-10 max-w-4xl mx-auto w-full px-4 pt-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-emerald-400 text-slate-950 flex items-center justify-center font-black">
            <ShoppingBag className="w-4 h-4 text-slate-950" />
          </div>
          <span className="font-extrabold text-lg tracking-tight">
            Pola <span className="text-emerald-400 text-sm font-mono">.lk</span>
          </span>
        </div>

        {currentStep > 0 && (
          <div className="flex items-center gap-3">
            <span className="text-xs text-slate-400 font-bold font-mono">
              Step {currentStep} of 8
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
        {/* CARD 0: Language Selection */}
        {currentStep === 0 && (
          <div className="glass-terminal rounded-3xl p-8 space-y-6 w-full text-center animate-in fade-in">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center justify-center mx-auto">
              <Globe className="w-6 h-6" />
            </div>

            <div className="space-y-1">
              <h2 className="text-2xl sm:text-3xl font-black text-white">Choose your language</h2>
              <p className="text-xs text-slate-300 font-medium">
                භාෂාව තෝරන්න • மொழியை தேர்ந்தெடுக்கவும்
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
              <button
                onClick={() => handleLanguageSelect('en')}
                className="p-5 rounded-2xl border border-white/20 bg-white/10 hover:bg-emerald-500/20 hover:border-emerald-400 text-left transition-all cursor-pointer group"
              >
                <span className="block font-black text-base text-white group-hover:text-emerald-300">English</span>
                <span className="text-[11px] text-slate-300">Standard English</span>
              </button>

              <button
                onClick={() => handleLanguageSelect('si')}
                className="p-5 rounded-2xl border border-white/20 bg-white/10 hover:bg-emerald-500/20 hover:border-emerald-400 text-left transition-all cursor-pointer group"
              >
                <span className="block font-black text-base text-white group-hover:text-emerald-300">සිංහල</span>
                <span className="text-[11px] text-slate-300">ස්වාභාවික සිංහල</span>
              </button>

              <button
                onClick={() => handleLanguageSelect('ta')}
                className="p-5 rounded-2xl border border-white/20 bg-white/10 hover:bg-emerald-500/20 hover:border-emerald-400 text-left transition-all cursor-pointer group"
              >
                <span className="block font-black text-base text-white group-hover:text-emerald-300">தமிழ்</span>
                <span className="text-[11px] text-slate-300">இயற்கையான தமிழ்</span>
              </button>
            </div>
          </div>
        )}

        {/* CARD 1: Welcome & Intro */}
        {currentStep === 1 && (
          <div className="glass-terminal rounded-3xl p-8 space-y-6 w-full text-center animate-in fade-in">
            <div className="w-14 h-14 rounded-3xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center justify-center mx-auto">
              <Sparkles className="w-7 h-7" />
            </div>

            <div className="space-y-2">
              <h2 className="text-3xl font-black text-white">
                Welcome to <span className="text-emerald-400 font-serif-accent italic">Pola</span>
              </h2>
              <p className="text-sm text-slate-300 leading-relaxed max-w-md mx-auto">
                Sri Lanka's direct farm-to-doorstep marketplace. Fresh vegetables, fruits, and grains delivered from certified village growers under Escrow guarantee.
              </p>
            </div>

            <div className="pt-4">
              <button
                onClick={handleNextStep}
                className="w-full py-3.5 px-6 rounded-2xl bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-extrabold text-sm flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <span>Get Started</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* CARD 2: Persona */}
        {currentStep === 2 && (
          <div className="glass-terminal rounded-3xl p-8 space-y-6 w-full text-left animate-in fade-in">
            <div className="space-y-1">
              <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider font-mono">Step 2 • Persona</span>
              <h2 className="text-2xl font-black text-white">How will you shop on Pola?</h2>
              <p className="text-xs text-slate-300">Choose your buying profile for tailored pricing tiers.</p>
            </div>

            <div className="space-y-3">
              <div
                onClick={() => {
                  setCustomerPersona('b2c');
                  setErrorMsg('');
                }}
                className={`p-4 rounded-2xl border transition-all flex items-center gap-4 cursor-pointer ${
                  customerPersona === 'b2c'
                    ? 'border-emerald-400 bg-emerald-500/20 shadow-md'
                    : 'border-white/15 bg-white/5 hover:bg-white/10'
                }`}
              >
                <div className="p-3 rounded-xl bg-emerald-500/20 text-emerald-300">
                  <Home className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-extrabold text-sm text-white">Home Cook & Family Groceries</h4>
                  <p className="text-xs text-slate-300">Weekly fresh vegetables and seasonal fruits for home meals</p>
                </div>
              </div>

              <div
                onClick={() => {
                  setCustomerPersona('b2b');
                  setErrorMsg('');
                }}
                className={`p-4 rounded-2xl border transition-all flex items-center gap-4 cursor-pointer ${
                  customerPersona === 'b2b'
                    ? 'border-emerald-400 bg-emerald-500/20 shadow-md'
                    : 'border-white/15 bg-white/5 hover:bg-white/10'
                }`}
              >
                <div className="p-3 rounded-xl bg-purple-500/20 text-purple-300">
                  <Utensils className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-extrabold text-sm text-white">Hotel, Restaurant or Commercial Buyer</h4>
                  <p className="text-xs text-slate-300">Bulk crates with tiered wholesale pricing and VAT invoices</p>
                </div>
              </div>
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
                className="py-3 px-6 rounded-2xl bg-emerald-400 hover:bg-emerald-300 text-slate-950 text-xs font-black flex items-center gap-2 transition-all cursor-pointer"
              >
                <span>Continue</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* CARD 3: Interests */}
        {currentStep === 3 && (
          <div className="glass-terminal rounded-3xl p-8 space-y-6 w-full text-left animate-in fade-in">
            <div className="space-y-1">
              <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider font-mono">Step 3 • Produce</span>
              <h2 className="text-2xl font-black text-white">What produce interests you?</h2>
              <p className="text-xs text-slate-300">Select categories to personalize your harvest feed.</p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {[
                { id: 'vegetables', label: 'Highland Vegetables', icon: <Leaf className="w-4 h-4 text-emerald-400" /> },
                { id: 'fruits', label: 'Tropical Fruits', icon: <Sparkles className="w-4 h-4 text-rose-400" /> },
                { id: 'grains', label: 'Heritage Rice & Grains', icon: <ShoppingBag className="w-4 h-4 text-amber-400" /> },
                { id: 'spices', label: 'Ceylon Spices & Herbs', icon: <Building2 className="w-4 h-4 text-orange-400" /> },
              ].map((item) => {
                const isSelected = selectedInterests.includes(item.id);
                return (
                  <div
                    key={item.id}
                    onClick={() => toggleInterest(item.id)}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between space-y-2 ${
                      isSelected
                        ? 'border-emerald-400 bg-emerald-500/20 text-white shadow-md'
                        : 'border-white/15 bg-white/5 text-slate-300 hover:bg-white/10'
                    }`}
                  >
                    {item.icon}
                    <span className="font-extrabold text-xs">{item.label}</span>
                  </div>
                );
              })}
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
                className="py-3 px-6 rounded-2xl bg-emerald-400 hover:bg-emerald-300 text-slate-950 text-xs font-black flex items-center gap-2 transition-all cursor-pointer"
              >
                <span>Continue</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* CARD 4: Province (Location Section) */}
        {currentStep === 4 && (
          <div className="glass-terminal rounded-3xl p-8 space-y-6 w-full text-left animate-in fade-in">
            <div className="flex justify-between items-start">
              <div className="space-y-1">
                <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider font-mono">Location Section • Step 4</span>
                <h2 className="text-2xl font-black text-white">Which province do you live in?</h2>
              </div>

              <button
                onClick={handleSkipLocationSection}
                className="px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white text-[11px] font-bold transition-all cursor-pointer flex items-center gap-1 shrink-0"
              >
                <SkipForward className="w-3 h-3" />
                <span>Skip Location Setup</span>
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 max-h-60 overflow-y-auto pr-1">
              {provinces.map((prov) => (
                <button
                  key={prov}
                  onClick={() => {
                    setProvince(prov);
                    const firstDistrict = PROVINCES_DISTRICTS[prov]?.[0] || 'Colombo';
                    setDistrict(firstDistrict);
                    setErrorMsg('');
                  }}
                  className={`p-3 rounded-2xl border text-xs font-bold text-left transition-all cursor-pointer ${
                    province === prov
                      ? 'border-emerald-400 bg-emerald-500/20 text-emerald-300 shadow-md'
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
                className="py-3 px-6 rounded-2xl bg-emerald-400 hover:bg-emerald-300 text-slate-950 text-xs font-black flex items-center gap-2 transition-all cursor-pointer"
              >
                <span>Continue</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* CARD 5: District (Location Section) */}
        {currentStep === 5 && (
          <div className="glass-terminal rounded-3xl p-8 space-y-6 w-full text-left animate-in fade-in">
            <div className="flex justify-between items-start">
              <div className="space-y-1">
                <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider font-mono">Location Section • Step 5</span>
                <h2 className="text-2xl font-black text-white">Which district in {province}?</h2>
              </div>

              <button
                onClick={handleSkipLocationSection}
                className="px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white text-[11px] font-bold transition-all cursor-pointer flex items-center gap-1 shrink-0"
              >
                <SkipForward className="w-3 h-3" />
                <span>Skip Location Setup</span>
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
                      ? 'border-emerald-400 bg-emerald-500/20 text-emerald-300 shadow-md'
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
                className="py-3 px-6 rounded-2xl bg-emerald-400 hover:bg-emerald-300 text-slate-950 text-xs font-black flex items-center gap-2 transition-all cursor-pointer"
              >
                <span>Continue</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* CARD 6: City / Town (Location Section) */}
        {currentStep === 6 && (
          <div className="glass-terminal rounded-3xl p-8 space-y-6 w-full text-left animate-in fade-in">
            <div className="flex justify-between items-start">
              <div className="space-y-1">
                <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider font-mono">Location Section • Step 6</span>
                <h2 className="text-2xl font-black text-white">What is your city or town?</h2>
                <p className="text-xs text-slate-300">Matches you with the closest courier dispatch radar.</p>
              </div>

              <button
                onClick={handleSkipLocationSection}
                className="px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white text-[11px] font-bold transition-all cursor-pointer flex items-center gap-1 shrink-0"
              >
                <SkipForward className="w-3 h-3" />
                <span>Skip Location Setup</span>
              </button>
            </div>

            <div>
              <input
                type="text"
                placeholder="e.g. Maharagama, Nugegoda, Kandy Town"
                value={city}
                onChange={(e) => {
                  setCity(e.target.value);
                  setErrorMsg('');
                }}
                className="w-full px-4 py-3.5 rounded-2xl bg-white/10 border border-white/20 text-white placeholder-white/40 text-sm focus:outline-none focus:border-emerald-400"
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
                className="py-3 px-6 rounded-2xl bg-emerald-400 hover:bg-emerald-300 text-slate-950 text-xs font-black flex items-center gap-2 transition-all cursor-pointer"
              >
                <span>Continue</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* CARD 7: Delivery Timing */}
        {currentStep === 7 && (
          <div className="glass-terminal rounded-3xl p-8 space-y-6 w-full text-left animate-in fade-in">
            <div className="space-y-1">
              <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider font-mono">Step 7 • Timing</span>
              <h2 className="text-2xl font-black text-white">When do you prefer deliveries?</h2>
              <p className="text-xs text-slate-300">Hub couriers dispatch at specific window times.</p>
            </div>

            <div className="space-y-3">
              {[
                { id: 'morning', label: 'Morning Dispatch (8:00 AM – 12:00 PM)', icon: <Sunrise className="w-4 h-4 text-amber-400" /> },
                { id: 'afternoon', label: 'Afternoon Dispatch (1:00 PM – 5:00 PM)', icon: <Sun className="w-4 h-4 text-yellow-400" /> },
                { id: 'flexible', label: 'Flexible Window (Anytime same-day)', icon: <Clock className="w-4 h-4 text-emerald-400" /> },
              ].map((item) => (
                <div
                  key={item.id}
                  onClick={() => {
                    setDeliveryTiming(item.id);
                    setErrorMsg('');
                  }}
                  className={`p-4 rounded-2xl border transition-all flex items-center gap-3 cursor-pointer ${
                    deliveryTiming === item.id
                      ? 'border-emerald-400 bg-emerald-500/20 text-white shadow-md'
                      : 'border-white/15 bg-white/5 text-slate-300 hover:bg-white/10'
                  }`}
                >
                  {item.icon}
                  <span className="font-extrabold text-xs">{item.label}</span>
                </div>
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
                className="py-3 px-6 rounded-2xl bg-emerald-400 hover:bg-emerald-300 text-slate-950 text-xs font-black flex items-center gap-2 transition-all cursor-pointer"
              >
                <span>Final Step</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* CARD 8: Celebration Welcome */}
        {currentStep === 8 && (
          <div className="glass-terminal rounded-3xl p-8 space-y-6 w-full text-center animate-in fade-in">
            <div className="w-16 h-16 rounded-3xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center mx-auto">
              <ShieldCheck className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <h2 className="text-3xl font-black text-white">
                Your Pola Market is <span className="font-serif-accent italic text-lime-300">Ready</span>
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-md mx-auto">
                Direct farm lots in {hasLocationSection ? district : 'Sri Lanka'} and surrounding districts are now personalized to your preferences with 100% Escrow delivery protection.
              </p>
            </div>

            <div className="pt-4">
              <button
                onClick={handleComplete}
                disabled={isLoading}
                className="w-full py-4 px-6 rounded-2xl bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-black text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/25 transition-all cursor-pointer"
              >
                {isLoading ? (
                  <span className="inline-block animate-spin w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full" />
                ) : (
                  <>
                    <span>Explore My Fresh Market</span>
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
