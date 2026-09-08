import React, { useState, useEffect, useRef } from 'react';
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
import { getDeliveryNavItems } from '@/lib/navItems';
import { DeliveryService } from '@/services/delivery.service';
import { RatingService } from '@/services/rating.service';
import { ChatDrawer } from '@/components/organisms/ChatDrawer';
import {
  Truck,
  MapPin,
  Phone,
  QrCode,
  ShieldCheck,
  CheckCircle2,
  Navigation,
  Sparkles,
  Package,
  MessageSquare,
  AlertTriangle,
} from 'lucide-react';
import toast from 'react-hot-toast';

export const ActiveTripPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const { isDark, toggleTheme, language, setLanguage } = useThemeStore();
  const { t } = useTranslation();

  const [activeTrip, setActiveTrip] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [packageCount, setPackageCount] = useState<number | ''>('');
  const [isStartingRun, setIsStartingRun] = useState(false);
  const [handoverOtp, setHandoverOtp] = useState('');
  const [isCodCollected, setIsCodCollected] = useState(false);
  const [podPhoto, setPodPhoto] = useState<File | null>(null);
  const [isCompleting, setIsCompleting] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);

  // Exception reporting
  const [isExceptionOpen, setIsExceptionOpen] = useState(false);
  const [exceptionReason, setExceptionReason] = useState('customer_absent');
  const [exceptionNote, setExceptionNote] = useState('');
  const [isReportingException, setIsReportingException] = useState(false);

  // Customer rating after completion
  const [showRateCustomerModal, setShowRateCustomerModal] = useState(false);
  const [customerRatingScore, setCustomerRatingScore] = useState(5);
  const [customerReviewText, setCustomerReviewText] = useState('');
  const [isSubmittingRating, setIsSubmittingRating] = useState(false);

  // 30s GPS ping interval ref
  const gpsIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const navItems = getDeliveryNavItems(t as any);

  useEffect(() => {
    fetchActiveTrip();
    return () => {
      if (gpsIntervalRef.current) clearInterval(gpsIntervalRef.current);
    };
  }, []);

  // Start GPS pings when we have an active OFD trip
  useEffect(() => {
    if (activeTrip?.status === 'out_for_delivery') {
      startGpsPings();
    } else {
      if (gpsIntervalRef.current) {
        clearInterval(gpsIntervalRef.current);
        gpsIntervalRef.current = null;
      }
    }
  }, [activeTrip?.status]);

  const startGpsPings = () => {
    if (gpsIntervalRef.current) return; // already running
    gpsIntervalRef.current = setInterval(() => {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          DeliveryService.updateLiveLocation(pos.coords.latitude, pos.coords.longitude).catch(
            () => {}
          );
        },
        () => {},
        { timeout: 5000, enableHighAccuracy: true }
      );
    }, 30000);
  };

  const fetchActiveTrip = async () => {
    try {
      setIsLoading(true);
      const res: any = await DeliveryService.getActiveTrip();
      if (res.success && res.data) {
        setActiveTrip(res.data.activeTrip);
        if (res.data.activeTrip?.items?.length) {
          setPackageCount(res.data.activeTrip.items.length);
        }
      }
    } catch (err: any) {
      toast.error('Failed to load active trip');
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartDeliveryRun = async () => {
    if (!activeTrip) return;
    if (!packageCount) {
      toast.error('Please confirm package count before starting delivery run');
      return;
    }
    try {
      setIsStartingRun(true);
      await DeliveryService.updateTransitStatus(
        activeTrip._id,
        'out_for_delivery',
        'Driver started doorstep delivery run',
        Number(packageCount)
      );
      toast.success('Status updated: Order is now Out for Delivery!');
      await fetchActiveTrip();
    } catch (err: any) {
      toast.error(err.response?.data?.message || err.message || 'Failed to update status');
    } finally {
      setIsStartingRun(false);
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

      await DeliveryService.confirmHandoverDelivery(
        activeTrip._id,
        handoverOtp,
        podPhoto || undefined,
        isCod ? isCodCollected : undefined
      );
      toast.success('Delivery completed! Payout credited to your Pola Wallet.', { id: 'pod' });
      setShowRateCustomerModal(true);
    } catch (err: any) {
      toast.error(err.response?.data?.message || err.message || 'Failed to complete delivery', { id: 'pod' });
    } finally {
      setIsCompleting(false);
    }
  };

  const handleSubmitCustomerRating = async () => {
    if (!activeTrip?._id) {
      navigate('/delivery/dashboard');
      return;
    }
    try {
      setIsSubmittingRating(true);
      await RatingService.submitRating({
        orderId: activeTrip._id,
        targetType: 'customer',
        ratingScore: customerRatingScore,
        reviewText: customerReviewText,
      });
      toast.success('Customer rating submitted!');
    } catch (err: any) {
      console.warn('Rating submission error:', err);
    } finally {
      setIsSubmittingRating(false);
      setShowRateCustomerModal(false);
      navigate('/delivery/dashboard');
    }
  };

  const handleReportException = async () => {
    if (!activeTrip) return;
    try {
      setIsReportingException(true);
      await DeliveryService.reportDeliveryException(activeTrip._id, exceptionReason, exceptionNote);
      toast.success('Delivery exception reported. Order marked as returned.');
      setIsExceptionOpen(false);
      navigate('/delivery/dashboard');
    } catch (err: any) {
      toast.error(err.response?.data?.message || err.message || 'Failed to report exception');
    } finally {
      setIsReportingException(false);
    }
  };

  const customer = activeTrip?.customerId;
  const recipientName = activeTrip?.recipientName || customer?.fullName || 'Customer';
  const recipientPhone = activeTrip?.recipientPhone || customer?.phone || activeTrip?.deliveryAddress?.contactPhone;
  const deliveryAddr = activeTrip?.deliveryAddress;
  const isCod = activeTrip?.paymentMethod === 'cash_on_delivery' || activeTrip?.paymentMethod === 'cod';

  // Derive real current step from activeTrip.status
  const currentStep: 1 | 2 | 3 =
    activeTrip?.status === 'assigned_for_delivery'
      ? 1
      : activeTrip?.status === 'out_for_delivery'
      ? 2
      : 3;

  return (
    <DashboardLayout
      portalTitle={t.deliveryFleet}
      portalRole={user?.role || 'Delivery Partner'}
      navItems={navItems}
      activePath="/delivery/active-trip"
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
                  {currentStep === 1 ? 'Trip Assigned — Pick up at Hub' : currentStep === 2 ? 'En Route to Customer' : 'Delivered'}
                </div>
                <h1 className="text-2xl font-black text-slate-900 dark:text-slate-100">
                  Order #{activeTrip.orderNumber}
                </h1>
                <p className="text-xs text-slate-400">
                  {deliveryAddr?.city}, {deliveryAddr?.district} • Payout:{' '}
                  <strong>LKR {(activeTrip.leg2DeliveryFee || activeTrip.totalDeliveryFee || 0).toLocaleString()}</strong>
                </p>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                {currentStep === 1 && (
                  <Button
                    variant="primary"
                    size="sm"
                    isLoading={isStartingRun}
                    onClick={handleStartDeliveryRun}
                    className="bg-emerald-600 hover:bg-emerald-500 font-bold"
                    leftIcon={<Truck className="w-4 h-4" />}
                  >
                    Start Doorstep Run
                  </Button>
                )}
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
                {currentStep === 2 && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsExceptionOpen(true)}
                    className="text-red-600 border-red-300 hover:bg-red-50"
                    leftIcon={<AlertTriangle className="w-4 h-4" />}
                  >
                    Report Issue
                  </Button>
                )}
              </div>
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

            {/* Step 1: DC Pickup Confirmation Card */}
            {currentStep === 1 && (
              <div className="p-6 rounded-3xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 font-extrabold text-sm text-amber-900 dark:text-amber-100">
                    <Package className="w-5 h-5 text-amber-600" />
                    <span>DC Package Pickup Confirmation</span>
                  </div>
                  <Badge variant="amber" size="sm">Action Required</Badge>
                </div>
                <p className="text-xs text-amber-800 dark:text-amber-200">
                  Count and verify the cargo packages at the Distribution Center before loading into your vehicle and initiating the doorstep run.
                </p>
                <div className="flex flex-wrap items-end gap-3 pt-1">
                  <div className="w-48">
                    <Input
                      label="Verified Package Count"
                      type="number"
                      min={1}
                      value={packageCount}
                      onChange={(e) => setPackageCount(e.target.value ? Number(e.target.value) : '')}
                      placeholder="e.g. 2"
                    />
                  </div>
                  <Button
                    variant="primary"
                    size="md"
                    isLoading={isStartingRun}
                    onClick={handleStartDeliveryRun}
                    className="bg-emerald-600 hover:bg-emerald-500 font-bold"
                    leftIcon={<Truck className="w-4 h-4" />}
                  >
                    Confirm Pickup &amp; Start Run
                  </Button>
                </div>
              </div>
            )}

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

        {/* Exception Report Modal */}
        {isExceptionOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs" onClick={() => setIsExceptionOpen(false)} />
            <div className="relative w-full max-w-md rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl p-6 sm:p-8 space-y-6 animate-in zoom-in-95">
              <div>
                <h3 className="font-extrabold text-slate-900 dark:text-slate-100 text-lg flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-red-500" />
                  Report Delivery Exception
                </h3>
                <p className="text-xs text-slate-400 mt-1">Order will be marked as RETURNED for admin review</p>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">Reason</label>
                  <select
                    value={exceptionReason}
                    onChange={(e) => setExceptionReason(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm px-3 py-2"
                  >
                    <option value="customer_absent">Customer not present / unreachable</option>
                    <option value="refused_delivery">Customer refused delivery</option>
                    <option value="wrong_address">Wrong / incomplete address</option>
                    <option value="damaged_goods">Goods damaged in transit</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <Input
                  label="Additional Notes (optional)"
                  value={exceptionNote}
                  onChange={(e) => setExceptionNote(e.target.value)}
                  placeholder="e.g. Called 3 times, no answer"
                />
              </div>
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                <Button variant="outline" size="sm" onClick={() => setIsExceptionOpen(false)}>
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  isLoading={isReportingException}
                  onClick={handleReportException}
                  className="bg-red-600 hover:bg-red-700"
                >
                  Report Exception
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Rate Customer Modal */}
        {showRateCustomerModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
            <div className="relative w-full max-w-md rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl p-6 sm:p-8 space-y-6 animate-in zoom-in-95">
              <div>
                <h3 className="font-extrabold text-slate-900 dark:text-slate-100 text-lg flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-amber-500" />
                  Rate Customer Handover
                </h3>
                <p className="text-xs text-slate-400 mt-1">Share feedback about {recipientName}</p>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-center gap-2 py-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setCustomerRatingScore(star)}
                      className="p-1 cursor-pointer transition-transform hover:scale-110"
                    >
                      <CheckCircle2
                        className={`w-8 h-8 ${
                          star <= customerRatingScore ? 'text-amber-400 fill-amber-400' : 'text-slate-300 dark:text-slate-700'
                        }`}
                      />
                    </button>
                  ))}
                </div>

                <Input
                  label="Review / Feedback (optional)"
                  value={customerReviewText}
                  onChange={(e) => setCustomerReviewText(e.target.value)}
                  placeholder="e.g. Prompt handover, friendly customer..."
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setShowRateCustomerModal(false);
                    navigate('/delivery/dashboard');
                  }}
                >
                  Skip
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  isLoading={isSubmittingRating}
                  onClick={handleSubmitCustomerRating}
                  className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-black"
                >
                  Submit Rating
                </Button>
              </div>
            </div>
          </div>
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
