import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from '@/components/templates/DashboardLayout';
import { Button } from '@/components/atoms/Button';
import { Input } from '@/components/atoms/Input';
import { Badge } from '@/components/atoms/Badge';
import { Spinner } from '@/components/atoms/Spinner';
import { EmptyState } from '@/components/molecules/EmptyState';
import { FileDropzone } from '@/components/molecules/FileDropzone';
import { useAuthStore } from '@/store/authStore';
import { useThemeStore } from '@/store/themeStore';
import { useTranslation } from '@/lib/i18n';
import { DeliveryService } from '@/services/delivery.service';
import { ChatDrawer } from '@/components/organisms/ChatDrawer';
import {
  Compass,
  Radar,
  Calendar,
  Truck,
  DollarSign,
  MapPin,
  Phone,
  QrCode,
  ShieldCheck,
  CheckCircle2,
  Navigation,
  Sparkles,
  Package,
  MessageSquare,
} from 'lucide-react';
import toast from 'react-hot-toast';

export const ActiveTripPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const { isDark, toggleTheme, language, setLanguage } = useThemeStore();
  const { t } = useTranslation();

  const [activeTrip, setActiveTrip] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(2);
  const [handoverOtp, setHandoverOtp] = useState('');
  const [isCodCollected, setIsCodCollected] = useState(false);
  const [podPhoto, setPodPhoto] = useState<File | null>(null);
  const [isCompleting, setIsCompleting] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);

  const navItems = [
    { id: 'hud', label: 'Delivery HUD', icon: <Compass className="w-5 h-5" />, path: '/delivery/dashboard' },
    { id: 'available', label: 'Available Radar Trips', icon: <Radar className="w-5 h-5" />, path: '/delivery/available' },
    { id: 'hub', label: 'Hub Intake Sheet', icon: <Calendar className="w-5 h-5" />, path: '/delivery/hub-schedule' },
    { id: 'vehicles', label: 'My Vehicles', icon: <Truck className="w-5 h-5" />, path: '/delivery/vehicles' },
    { id: 'earnings', label: 'Trip Earnings', icon: <DollarSign className="w-5 h-5" />, path: '/delivery/earnings' },
  ];

  useEffect(() => {
    fetchActiveTrip();
  }, []);

  const fetchActiveTrip = async () => {
    try {
      setIsLoading(true);
      const res: any = await DeliveryService.getActiveTrip();
      if (res.success && res.data) {
        setActiveTrip(res.data.activeTrip);
      }
    } catch (err: any) {
      toast.error('Failed to load active trip');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCompleteTrip = async () => {
    if (!activeTrip) return;
    if (!handoverOtp && !podPhoto) {
      toast.error('Please enter the customer delivery OTP or upload a proof of delivery photo');
      return;
    }

    try {
      setIsCompleting(true);
      toast.loading('Verifying handover & releasing trip payout...', { id: 'pod' });
      await DeliveryService.confirmHandoverDelivery(activeTrip._id, handoverOtp, podPhoto || undefined);
      toast.success('Delivery completed! Payout credited to your Pola Wallet.', { id: 'pod' });
      navigate('/delivery/dashboard');
    } catch (err: any) {
      toast.error(err.response?.data?.message || err.message || 'Failed to complete delivery', { id: 'pod' });
    } finally {
      setIsCompleting(false);
    }
  };

  const customer = activeTrip?.customerId;
  const recipientName = activeTrip?.recipientName || customer?.fullName || 'Customer';
  const recipientPhone = activeTrip?.recipientPhone || customer?.phone || activeTrip?.deliveryAddress?.contactPhone;
  const deliveryAddr = activeTrip?.deliveryAddress;
  const isCod = activeTrip?.paymentMethod === 'cash_on_delivery' || activeTrip?.paymentMethod === 'cod';

  return (
    <DashboardLayout
      portalTitle={t.deliveryFleet}
      portalRole={user?.role || 'Delivery Partner'}
      navItems={navItems}
      activePath="/delivery/dashboard"
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
      <div className="space-y-6 max-w-4xl mx-auto">
        {isLoading ? (
          <div className="flex justify-center py-20">
            <Spinner size="lg" />
          </div>
        ) : !activeTrip ? (
          <EmptyState
            title="No active trip"
            description="Accept a radar trip to start delivering"
            icon={<Truck className="w-8 h-8" />}
            action={{ label: 'Browse Available Trips', onClick: () => navigate('/delivery/available') }}
          />
        ) : (
          <>
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 text-xs font-bold mb-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  Active Doorstep Run In Progress
                </div>
                <h1 className="text-2xl font-black text-slate-900 dark:text-slate-100">
                  Order #{activeTrip.orderNumber}
                </h1>
                <p className="text-xs text-slate-400">
                  {deliveryAddr?.city}, {deliveryAddr?.district} • Payout:{' '}
                  <strong>LKR {(activeTrip.leg2DeliveryFee || activeTrip.totalDeliveryFee || 0).toLocaleString()}</strong>
                </p>
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const lat = deliveryAddr?.gps?.latitude;
                  const lng = deliveryAddr?.gps?.longitude;
                  const query = lat && lng ? `${lat},${lng}` : encodeURIComponent(`${deliveryAddr?.addressLine1 || deliveryAddr?.streetAddress}, ${deliveryAddr?.city}`);
                  window.open(`https://www.google.com/maps/dir/?api=1&destination=${query}`, '_blank');
                }}
                leftIcon={<Navigation className="w-4 h-4 text-sky-500" />}
              >
                Navigate (Google Maps)
              </Button>
            </div>

            {/* Step progress */}
            <div className="grid grid-cols-3 gap-3 text-center">
              {(['Pickup at DC / Hub', 'En Route to Buyer', 'OTP Verification'] as const).map((label, i) => (
                <div
                  key={label}
                  className={`p-3.5 rounded-2xl border text-xs font-bold transition-all ${
                    currentStep === i + 1
                      ? 'border-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-200'
                      : currentStep > i + 1
                      ? 'border-emerald-200 bg-emerald-50/50 text-emerald-600'
                      : 'border-slate-200 dark:border-slate-800 text-slate-400'
                  }`}
                >
                  {i + 1}. {label}
                </div>
              ))}
            </div>

            {/* Customer details */}
            <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-6">
              <div className="flex flex-wrap items-start justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
                <div>
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                    Customer Delivery Recipient
                  </span>
                  <h3 className="text-lg font-black text-slate-900 dark:text-slate-100 mt-0.5">
                    {recipientName}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5 mt-1">
                    <MapPin className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>
                      {deliveryAddr?.addressLine1 || deliveryAddr?.streetAddress}
                      {deliveryAddr?.city ? `, ${deliveryAddr.city}` : ''}
                      {deliveryAddr?.district ? ` (${deliveryAddr.district} District)` : ''}
                    </span>
                  </p>
                  {activeTrip.deliveryInstructions && (
                    <p className="text-xs text-slate-500 italic mt-1">
                      Note: "{activeTrip.deliveryInstructions}"
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => setIsChatOpen(true)}
                    className="bg-emerald-600 hover:bg-emerald-500 font-bold"
                    leftIcon={<MessageSquare className="w-4 h-4" />}
                  >
                    Message Customer
                  </Button>

                  {recipientPhone && (
                    <a
                      href={`tel:${recipientPhone}`}
                      className="p-2.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-bold text-xs flex items-center gap-1.5 hover:bg-emerald-100 transition-colors"
                    >
                      <Phone className="w-4 h-4" />
                      <span>Call</span>
                    </a>
                  )}
                </div>
              </div>

              {/* Order items */}
              <div className="space-y-2">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Assigned Packages ({activeTrip.items?.length || 0} items):
                </span>
                {(activeTrip.items || []).map((item: any, idx: number) => (
                  <div key={idx} className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 text-xs flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <Package className="w-4 h-4 text-slate-400" />
                      {item.productName || item.title} — {item.quantityOrdered || item.quantity} {item.unit || 'kg'}
                    </span>
                    <Badge variant="emerald" size="sm">Loaded</Badge>
                  </div>
                ))}
              </div>

              {/* COD notice */}
              {isCod && (
                <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-xs">
                  <div className="flex items-center gap-2 font-extrabold text-amber-800 dark:text-amber-200 mb-1">
                    <QrCode className="w-4 h-4" />
                    Cash on Delivery — Collect from Customer
                  </div>
                  <p className="text-amber-700 dark:text-amber-300">
                    Amount to collect: <strong>LKR {(activeTrip.grandTotal || 0).toLocaleString()}.00</strong>
                  </p>
                  <div className="flex items-center gap-2 mt-3">
                    <input
                      type="checkbox"
                      id="codCheck"
                      checked={isCodCollected}
                      onChange={(e) => setIsCodCollected(e.target.checked)}
                      className="w-4 h-4 rounded text-emerald-600 cursor-pointer"
                    />
                    <label htmlFor="codCheck" className="font-bold cursor-pointer text-amber-800 dark:text-amber-200">
                      COD cash payment collected from customer
                    </label>
                  </div>
                </div>
              )}

              {/* POD section */}
              <div className="p-6 rounded-3xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 space-y-4">
                <div className="flex items-center gap-2 font-extrabold text-sm text-slate-900 dark:text-slate-100">
                  <ShieldCheck className="w-5 h-5 text-emerald-600" />
                  <span>Proof of Delivery Verification</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="Customer 6-Digit Delivery OTP"
                    placeholder="e.g. 784219"
                    maxLength={6}
                    value={handoverOtp}
                    onChange={(e) => setHandoverOtp(e.target.value.replace(/\D/g, ''))}
                  />
                </div>

                <FileDropzone
                  label="Or Upload Doorstep Delivery Photo (Optional Fallback)"
                  onFileSelect={setPodPhoto}
                  accept="image/*"
                />

                <Button
                  variant="primary"
                  size="lg"
                  isLoading={isCompleting}
                  onClick={handleCompleteTrip}
                  className="w-full bg-emerald-600 hover:bg-emerald-700"
                  rightIcon={<Sparkles className="w-5 h-5" />}
                >
                  Complete Delivery &amp; Unlock Payout
                </Button>
              </div>
            </div>
          </>
        )}

        {/* Real-time Customer Coordination Drawer */}
        <ChatDrawer
          isOpen={isChatOpen}
          onClose={() => setIsChatOpen(false)}
          orderId={activeTrip?._id}
          orderNumber={activeTrip?.orderNumber}
          counterpartName={recipientName}
          counterpartRole="customer"
          counterpartPhone={recipientPhone}
        />
      </div>
    </DashboardLayout>
  );
};
