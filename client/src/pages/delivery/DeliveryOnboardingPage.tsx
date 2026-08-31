import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { useThemeStore } from '@/store/themeStore';
import { useTranslation, LanguageCode } from '@/lib/i18n';
import { AuthService } from '@/services/auth.service';
import { PROVINCES_DISTRICTS, DISTRICTS } from '@pola/shared';
import {
  Truck,
  Sparkles,
  MapPin,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Radar,
  Navigation,
  Globe,
  ShieldCheck,
  Zap,
  DollarSign,
  CreditCard,
  FileText,
  Clock,
  Check,
  AlertCircle,
  SkipForward,
} from 'lucide-react';
import toast from 'react-hot-toast';

export const DeliveryOnboardingPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, updateUser } = useAuthStore();
  const { language, setLanguage } = useThemeStore();
  const { t } = useTranslation();

  // Cards: 0 (Lang), 1 (Earnings Info), 2 (FullName), 3 (Phone), 4 (VehicleType), 5 (ColdChain), 6 (Province), 7 (District), 8 (Shift), 9 (Radar Sim), 10 (LicenseNum), 11 (PlateNum), 12 (Celebration)
  const [currentStep, setCurrentStep] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Contact Details Section
  const [hasContactSection, setHasContactSection] = useState(true);
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');

  // Vehicle Section
  const [vehicleType, setVehicleType] = useState('mini_truck');
  const [hasColdChain, setHasColdChain] = useState(false);

  // Location & Shift
  const [province, setProvince] = useState('Western');
  const [district, setDistrict] = useState('Colombo');
  const [preferredShift, setPreferredShift] = useState('both');

  // Documents Section
  const [hasDocumentsSection, setHasDocumentsSection] = useState(true);
  const [licenseNumber, setLicenseNumber] = useState('');
  const [plateNumber, setPlateNumber] = useState('');

  const provinces = Object.keys(PROVINCES_DISTRICTS);
  const districtsInProvince = PROVINCES_DISTRICTS[province] || DISTRICTS || [];

  const handleLanguageSelect = async (lang: LanguageCode) => {
    setLanguage(lang);
    try {
      await AuthService.updateProfile({ preferredLanguage: lang } as any);
    } catch (e) {}
    setCurrentStep(1);
  };

  // Section Skip Handlers with State Discard
  const handleSkipContactSection = () => {
    setHasContactSection(false);
    setFullName('');
    setPhone('');
    setErrorMsg('');
    toast('Custom contact setup skipped. Using account credentials.');
    setCurrentStep(4); // Jump to Vehicle selection
  };

  const handleSkipDocumentsSection = () => {
    setHasDocumentsSection(false);
    setLicenseNumber('');
    setPlateNumber('');
    setErrorMsg('');
    toast('Courier documents skipped. You can upload them anytime.');
    setCurrentStep(12); // Jump to Celebration
  };

  // Validation on Next
  const handleNextStep = () => {
    setErrorMsg('');

    // Step 2: Full Name
    if (currentStep === 2) {
      if (!fullName.trim() || fullName.trim().length < 3) {
        setErrorMsg('Please enter your full legal name (minimum 3 characters).');
        return;
      }
    }

    // Step 3: Phone
    if (currentStep === 3) {
      const cleanPhone = phone.replace(/\s+/g, '');
      if (!cleanPhone || cleanPhone.length < 9) {
        setErrorMsg('Please enter a valid 9-10 digit mobile phone number.');
        return;
      }
    }

    // Step 10: License Number
    if (currentStep === 10) {
      if (!licenseNumber.trim() || licenseNumber.trim().length < 5) {
        setErrorMsg('Please enter a valid driving license number, or click "Skip this section".');
        return;
      }
    }

    // Step 11: Plate Number
    if (currentStep === 11) {
      if (!plateNumber.trim() || plateNumber.trim().length < 4) {
        setErrorMsg('Please enter a valid vehicle plate number (e.g. WP CAB-1234), or click "Skip this section".');
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

      const finalName = hasContactSection && fullName.trim() ? fullName.trim() : user?.fullName;
      const finalPhone = hasContactSection && phone.trim() ? phone.trim() : user?.phone;

      try {
        await AuthService.updateProfile({
          fullName: finalName,
          phone: finalPhone,
          role: 'delivery_individual' as any,
          onboardingCompleted: true,
        });
      } catch (e) {}

      updateUser({
        fullName: finalName,
        phone: finalPhone,
        role: 'delivery_individual' as any,
      });

      toast.success('Your courier profile is live on Pola Radar!');
      navigate('/delivery/dashboard');
    } catch (err: any) {
      toast.error('Failed to complete courier registration');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSkipAll = async () => {
    try {
      await AuthService.updateProfile({ onboardingCompleted: true });
    } catch (e) {}
    navigate('/delivery/dashboard');
  };

  return (
    <div className="min-h-screen w-full bg-slate-950 text-white flex flex-col justify-between selection:bg-yellow-400 selection:text-slate-950 relative overflow-hidden">
      {/* Background Graphic */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <img
          src="https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=2400&q=85"
          alt="Logistics Route"
          className="w-full h-full object-cover brightness-40 scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/80 to-black/70" />
      </div>

      {/* Top Bar */}
      <header className="relative z-10 max-w-4xl mx-auto w-full px-4 pt-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-yellow-400 text-slate-950 flex items-center justify-center font-black">
            <Truck className="w-4 h-4 text-slate-950" />
          </div>
          <span className="font-extrabold text-lg tracking-tight">
            Pola <span className="text-yellow-400 text-sm font-mono">Fleet</span>
          </span>
        </div>

        {currentStep > 0 && (
          <div className="flex items-center gap-3">
            <span className="text-xs text-slate-400 font-bold font-mono">
              Step {currentStep} of 12
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
            <div className="w-12 h-12 rounded-2xl bg-yellow-500/20 text-yellow-300 border border-yellow-500/30 flex items-center justify-center mx-auto">
              <Globe className="w-6 h-6" />
            </div>

            <div className="space-y-1">
              <h2 className="text-2xl sm:text-3xl font-black text-white">Choose your language</h2>
              <p className="text-xs text-slate-300">භාෂාව තෝරන්න • மொழியை தேர்ந்தெடுக்கவும்</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
              <button
                onClick={() => handleLanguageSelect('en')}
                className="p-5 rounded-2xl border border-white/20 bg-white/10 hover:bg-yellow-500/20 hover:border-yellow-400 text-left transition-all cursor-pointer group"
              >
                <span className="block font-black text-base text-white group-hover:text-yellow-300">English</span>
                <span className="text-[11px] text-slate-300">Standard</span>
              </button>

              <button
                onClick={() => handleLanguageSelect('si')}
                className="p-5 rounded-2xl border border-white/20 bg-white/10 hover:bg-yellow-500/20 hover:border-yellow-400 text-left transition-all cursor-pointer group"
              >
                <span className="block font-black text-base text-white group-hover:text-yellow-300">සිංහල</span>
                <span className="text-[11px] text-slate-300">ස්වාභාවික</span>
              </button>

              <button
                onClick={() => handleLanguageSelect('ta')}
                className="p-5 rounded-2xl border border-white/20 bg-white/10 hover:bg-yellow-500/20 hover:border-yellow-400 text-left transition-all cursor-pointer group"
              >
                <span className="block font-black text-base text-white group-hover:text-yellow-300">தமிழ்</span>
                <span className="text-[11px] text-slate-300">இயற்கையான</span>
              </button>
            </div>
          </div>
        )}

        {/* CARD 1: Earnings Overview */}
        {currentStep === 1 && (
          <div className="glass-terminal rounded-3xl p-8 space-y-6 w-full text-center animate-in fade-in">
            <div className="w-14 h-14 rounded-3xl bg-yellow-500/20 text-yellow-300 border border-yellow-500/30 flex items-center justify-center mx-auto">
              <Truck className="w-7 h-7" />
            </div>

            <div className="space-y-2 text-left">
              <h2 className="text-2xl sm:text-3xl font-black text-white text-center">
                Deliver Fresh. <span className="font-serif-accent italic text-yellow-300">Earn Daily.</span>
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 text-center max-w-md mx-auto">
                Transport agricultural crates from village hubs to homes and businesses across Sri Lanka with instant LankaPay payouts.
              </p>

              <div className="pt-3 space-y-2">
                {[
                  { type: 'Motorcycle Express', cap: 'Up to 40 kg', earn: 'LKR 3,200 – 4,800 / day' },
                  { type: 'Three-Wheeler (Tuk)', cap: 'Up to 250 kg', earn: 'LKR 3,800 – 5,500 / day' },
                  { type: 'Mini-Truck (Dimo Batta)', cap: 'Up to 1,000 kg', earn: 'LKR 6,500 – 9,500 / day' },
                  { type: 'Medium / Large Lorry', cap: 'Up to 3,500 kg', earn: 'LKR 12,000 – 18,000 / day' },
                ].map((item, idx) => (
                  <div key={idx} className="p-3 rounded-xl bg-white/5 border border-white/10 flex justify-between items-center text-xs">
                    <div>
                      <span className="font-bold text-white block">{item.type}</span>
                      <span className="text-[11px] text-slate-400">{item.cap}</span>
                    </div>
                    <span className="font-black text-yellow-300 font-mono">{item.earn}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-2">
              <button
                onClick={handleNextStep}
                className="w-full py-3.5 px-6 rounded-2xl bg-yellow-400 hover:bg-yellow-300 text-slate-950 font-extrabold text-sm flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <span>Join the Fleet</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* CARD 2: Full Name */}
        {currentStep === 2 && (
          <div className="glass-terminal rounded-3xl p-8 space-y-6 w-full text-left animate-in fade-in">
            <div className="flex justify-between items-start">
              <div className="space-y-1">
                <span className="text-[11px] font-bold text-yellow-400 uppercase tracking-wider font-mono">Contact Section • Step 2</span>
                <h2 className="text-2xl font-black text-white">What is your full legal name?</h2>
              </div>

              <button
                onClick={handleSkipContactSection}
                className="px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white text-[11px] font-bold transition-all cursor-pointer flex items-center gap-1 shrink-0"
              >
                <SkipForward className="w-3 h-3" />
                <span>Skip Contact Setup</span>
              </button>
            </div>

            <div>
              <input
                type="text"
                placeholder="e.g. Sunil Perera"
                value={fullName}
                onChange={(e) => {
                  setFullName(e.target.value);
                  setErrorMsg('');
                }}
                className="w-full px-4 py-3.5 rounded-2xl bg-white/10 border border-white/20 text-white placeholder-white/40 text-sm focus:outline-none focus:border-yellow-400"
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
                className="py-3 px-6 rounded-2xl bg-yellow-400 hover:bg-yellow-300 text-slate-950 text-xs font-black flex items-center gap-2 transition-all cursor-pointer"
              >
                <span>Continue</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* CARD 3: Phone Number */}
        {currentStep === 3 && (
          <div className="glass-terminal rounded-3xl p-8 space-y-6 w-full text-left animate-in fade-in">
            <div className="flex justify-between items-start">
              <div className="space-y-1">
                <span className="text-[11px] font-bold text-yellow-400 uppercase tracking-wider font-mono">Contact Section • Step 3</span>
                <h2 className="text-2xl font-black text-white">Your mobile phone number?</h2>
              </div>

              <button
                onClick={handleSkipContactSection}
                className="px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white text-[11px] font-bold transition-all cursor-pointer flex items-center gap-1 shrink-0"
              >
                <SkipForward className="w-3 h-3" />
                <span>Skip Contact Setup</span>
              </button>
            </div>

            <div>
              <input
                type="tel"
                placeholder="e.g. 077 123 4567"
                value={phone}
                onChange={(e) => {
                  setPhone(e.target.value);
                  setErrorMsg('');
                }}
                className="w-full px-4 py-3.5 rounded-2xl bg-white/10 border border-white/20 text-white placeholder-white/40 text-sm focus:outline-none focus:border-yellow-400 font-mono"
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
                className="py-3 px-6 rounded-2xl bg-yellow-400 hover:bg-yellow-300 text-slate-950 text-xs font-black flex items-center gap-2 transition-all cursor-pointer"
              >
                <span>Continue</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* CARD 4: Vehicle Type Selection */}
        {currentStep === 4 && (
          <div className="glass-terminal rounded-3xl p-8 space-y-6 w-full text-left animate-in fade-in">
            <div className="space-y-1">
              <span className="text-[11px] font-bold text-yellow-400 uppercase tracking-wider font-mono">Step 4 • Vehicle</span>
              <h2 className="text-2xl font-black text-white">Select your primary delivery vehicle</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                { id: 'motorcycle', title: 'Motorcycle Express', desc: 'Up to 40 kg • Fast urban delivery' },
                { id: 'tuk_tuk', title: 'Three-Wheeler (Tuk)', desc: 'Up to 250 kg • Town & local routes' },
                { id: 'mini_truck', title: 'Mini-Truck (Dimo Batta)', desc: 'Up to 1,000 kg • Inter-district' },
                { id: 'lorry', title: 'Medium / Large Lorry', desc: 'Up to 3,500 kg • Bulk wholesale' },
              ].map((v) => (
                <div
                  key={v.id}
                  onClick={() => {
                    setVehicleType(v.id);
                    setErrorMsg('');
                  }}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                    vehicleType === v.id
                      ? 'border-yellow-400 bg-yellow-500/20 text-white shadow-md'
                      : 'border-white/15 bg-white/5 text-slate-300 hover:bg-white/10'
                  }`}
                >
                  <span className="font-extrabold text-sm text-white block">{v.title}</span>
                  <span className="text-[11px] text-slate-300 block mt-0.5">{v.desc}</span>
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
                className="py-3 px-6 rounded-2xl bg-yellow-400 hover:bg-yellow-300 text-slate-950 text-xs font-black flex items-center gap-2 transition-all cursor-pointer"
              >
                <span>Continue</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* CARD 5: Cold Chain */}
        {currentStep === 5 && (
          <div className="glass-terminal rounded-3xl p-8 space-y-6 w-full text-left animate-in fade-in">
            <div className="space-y-1">
              <span className="text-[11px] font-bold text-yellow-400 uppercase tracking-wider font-mono">Step 5 • Cold Chain</span>
              <h2 className="text-2xl font-black text-white">Does your vehicle have cold storage?</h2>
            </div>

            <div className="space-y-3">
              <div
                onClick={() => setHasColdChain(true)}
                className={`p-4 rounded-2xl border transition-all flex items-center justify-between cursor-pointer ${
                  hasColdChain
                    ? 'border-yellow-400 bg-yellow-500/20 text-white shadow-md'
                    : 'border-white/15 bg-white/5 text-slate-300 hover:bg-white/10'
                }`}
              >
                <div>
                  <span className="font-extrabold text-sm block">Yes, temperature-controlled / insulated</span>
                  <span className="text-[11px] text-slate-300">Access to cold chain loads (+20% rate)</span>
                </div>
                {hasColdChain && <CheckCircle2 className="w-5 h-5 text-yellow-400" />}
              </div>

              <div
                onClick={() => setHasColdChain(false)}
                className={`p-4 rounded-2xl border transition-all flex items-center justify-between cursor-pointer ${
                  !hasColdChain
                    ? 'border-yellow-400 bg-yellow-500/20 text-white shadow-md'
                    : 'border-white/15 bg-white/5 text-slate-300 hover:bg-white/10'
                }`}
              >
                <div>
                  <span className="font-extrabold text-sm block">No, standard open/canopy transport</span>
                  <span className="text-[11px] text-slate-300">Standard fresh harvest trips</span>
                </div>
                {!hasColdChain && <CheckCircle2 className="w-5 h-5 text-yellow-400" />}
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
                className="py-3 px-6 rounded-2xl bg-yellow-400 hover:bg-yellow-300 text-slate-950 text-xs font-black flex items-center gap-2 transition-all cursor-pointer"
              >
                <span>Continue</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* CARD 6: Home Province */}
        {currentStep === 6 && (
          <div className="glass-terminal rounded-3xl p-8 space-y-6 w-full text-left animate-in fade-in">
            <div className="space-y-1">
              <span className="text-[11px] font-bold text-yellow-400 uppercase tracking-wider font-mono">Step 6 • Base Province</span>
              <h2 className="text-2xl font-black text-white">Which province are you based in?</h2>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 max-h-60 overflow-y-auto pr-1">
              {provinces.map((prov) => (
                <button
                  key={prov}
                  onClick={() => {
                    setProvince(prov);
                    const firstD = PROVINCES_DISTRICTS[prov]?.[0] || 'Colombo';
                    setDistrict(firstD);
                  }}
                  className={`p-3 rounded-2xl border text-xs font-bold text-left transition-all cursor-pointer ${
                    province === prov
                      ? 'border-yellow-400 bg-yellow-500/20 text-yellow-300 shadow-md'
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
                className="py-3 px-6 rounded-2xl bg-yellow-400 hover:bg-yellow-300 text-slate-950 text-xs font-black flex items-center gap-2 transition-all cursor-pointer"
              >
                <span>Continue</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* CARD 7: Home District */}
        {currentStep === 7 && (
          <div className="glass-terminal rounded-3xl p-8 space-y-6 w-full text-left animate-in fade-in">
            <div className="space-y-1">
              <span className="text-[11px] font-bold text-yellow-400 uppercase tracking-wider font-mono">Step 7 • Base District</span>
              <h2 className="text-2xl font-black text-white">Which district in {province}?</h2>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 max-h-60 overflow-y-auto pr-1">
              {districtsInProvince.map((d) => (
                <button
                  key={d}
                  onClick={() => setDistrict(d)}
                  className={`p-3 rounded-2xl border text-xs font-bold text-left transition-all cursor-pointer ${
                    district === d
                      ? 'border-yellow-400 bg-yellow-500/20 text-yellow-300 shadow-md'
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
                className="py-3 px-6 rounded-2xl bg-yellow-400 hover:bg-yellow-300 text-slate-950 text-xs font-black flex items-center gap-2 transition-all cursor-pointer"
              >
                <span>Continue</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* CARD 8: Shift */}
        {currentStep === 8 && (
          <div className="glass-terminal rounded-3xl p-8 space-y-6 w-full text-left animate-in fade-in">
            <div className="space-y-1">
              <span className="text-[11px] font-bold text-yellow-400 uppercase tracking-wider font-mono">Step 8 • Preferred Hours</span>
              <h2 className="text-2xl font-black text-white">When are you available for trips?</h2>
            </div>

            <div className="space-y-3">
              {[
                { id: 'morning', label: 'Morning Dispatch (6:00 AM – 1:00 PM)' },
                { id: 'afternoon', label: 'Afternoon & Evening (1:00 PM – 8:00 PM)' },
                { id: 'both', label: 'Full Day Flexible Availability' },
              ].map((s) => (
                <div
                  key={s.id}
                  onClick={() => setPreferredShift(s.id)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                    preferredShift === s.id
                      ? 'border-yellow-400 bg-yellow-500/20 text-white shadow-md'
                      : 'border-white/15 bg-white/5 text-slate-300 hover:bg-white/10'
                  }`}
                >
                  <span className="font-extrabold text-xs">{s.label}</span>
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
                className="py-3 px-6 rounded-2xl bg-yellow-400 hover:bg-yellow-300 text-slate-950 text-xs font-black flex items-center gap-2 transition-all cursor-pointer"
              >
                <span>Preview Radar</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* CARD 9: Radar Simulation */}
        {currentStep === 9 && (
          <div className="glass-terminal rounded-3xl p-8 space-y-6 w-full text-left animate-in fade-in">
            <div className="space-y-1">
              <span className="text-[11px] font-bold text-yellow-400 uppercase tracking-wider font-mono">Step 9 • Radar Simulation</span>
              <h2 className="text-2xl font-black text-white">How Trips Appear on Pola Radar</h2>
              <p className="text-xs text-slate-300">Live requests within your radius will ping your device.</p>
            </div>

            <div className="space-y-3">
              <div className="p-4 rounded-2xl bg-black/40 border border-yellow-400/30 space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="inline-flex items-center gap-1.5 font-bold text-yellow-300">
                    <Radar className="w-3.5 h-3.5 animate-spin" /> Trip Request • 2.4 km away
                  </span>
                  <span className="font-black text-sm text-yellow-400 font-mono">LKR 1,850</span>
                </div>
                <p className="text-xs text-slate-200">
                  Pickup: Nuwara Eliya Agrarian Hub → Drop: Kandy Central Cold Depot
                </p>
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
                className="py-3 px-6 rounded-2xl bg-yellow-400 hover:bg-yellow-300 text-slate-950 text-xs font-black flex items-center gap-2 transition-all cursor-pointer"
              >
                <span>Continue to Verification</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* CARD 10: Driving License Number */}
        {currentStep === 10 && (
          <div className="glass-terminal rounded-3xl p-8 space-y-6 w-full text-left animate-in fade-in">
            <div className="flex justify-between items-start">
              <div className="space-y-1">
                <span className="text-[11px] font-bold text-yellow-400 uppercase tracking-wider font-mono">Documents Section • Step 10</span>
                <h2 className="text-2xl font-black text-white">Driving License Number</h2>
              </div>

              <button
                onClick={handleSkipDocumentsSection}
                className="px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white text-[11px] font-bold transition-all cursor-pointer flex items-center gap-1 shrink-0"
              >
                <SkipForward className="w-3 h-3" />
                <span>Skip Documents</span>
              </button>
            </div>

            <div>
              <input
                type="text"
                placeholder="e.g. B8749210"
                value={licenseNumber}
                onChange={(e) => {
                  setLicenseNumber(e.target.value);
                  setErrorMsg('');
                }}
                className="w-full px-4 py-3.5 rounded-2xl bg-white/10 border border-white/20 text-white placeholder-white/40 text-sm focus:outline-none focus:border-yellow-400 font-mono"
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
                className="py-3 px-6 rounded-2xl bg-yellow-400 hover:bg-yellow-300 text-slate-950 text-xs font-black flex items-center gap-2 transition-all cursor-pointer"
              >
                <span>Continue</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* CARD 11: Vehicle Plate Number */}
        {currentStep === 11 && (
          <div className="glass-terminal rounded-3xl p-8 space-y-6 w-full text-left animate-in fade-in">
            <div className="flex justify-between items-start">
              <div className="space-y-1">
                <span className="text-[11px] font-bold text-yellow-400 uppercase tracking-wider font-mono">Documents Section • Step 11</span>
                <h2 className="text-2xl font-black text-white">Vehicle Registration Plate</h2>
              </div>

              <button
                onClick={handleSkipDocumentsSection}
                className="px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white text-[11px] font-bold transition-all cursor-pointer flex items-center gap-1 shrink-0"
              >
                <SkipForward className="w-3 h-3" />
                <span>Skip Documents</span>
              </button>
            </div>

            <div>
              <input
                type="text"
                placeholder="e.g. WP CAB-4521"
                value={plateNumber}
                onChange={(e) => {
                  setPlateNumber(e.target.value);
                  setErrorMsg('');
                }}
                className="w-full px-4 py-3.5 rounded-2xl bg-white/10 border border-white/20 text-white placeholder-white/40 text-sm focus:outline-none focus:border-yellow-400 font-mono uppercase"
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
                className="py-3 px-6 rounded-2xl bg-yellow-400 hover:bg-yellow-300 text-slate-950 text-xs font-black flex items-center gap-2 transition-all cursor-pointer"
              >
                <span>Finish Setup</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* CARD 12: Celebration & Go Live */}
        {currentStep === 12 && (
          <div className="glass-terminal rounded-3xl p-8 space-y-6 w-full text-center animate-in fade-in">
            <div className="w-16 h-16 rounded-3xl bg-yellow-500/20 text-yellow-300 border border-yellow-500/30 flex items-center justify-center mx-auto">
              <Radar className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <h2 className="text-3xl font-black text-white">
                You are Live on <span className="font-serif-accent italic text-yellow-300">Pola Radar</span>
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-md mx-auto">
                Trip requests in {district} and adjacent corridors will alert your device. Deliveries release instant payments into your LankaPay wallet.
              </p>
            </div>

            <div className="pt-4">
              <button
                onClick={handleComplete}
                disabled={isLoading}
                className="w-full py-4 px-6 rounded-2xl bg-yellow-400 hover:bg-yellow-300 text-slate-950 font-black text-sm flex items-center justify-center gap-2 shadow-lg shadow-yellow-500/25 transition-all cursor-pointer"
              >
                {isLoading ? (
                  <span className="inline-block animate-spin w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full" />
                ) : (
                  <>
                    <span>Enter Courier Dispatch Desk</span>
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
