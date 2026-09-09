import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { useTranslation } from '@/lib/i18n';
import { ShieldAlert, Clock, ArrowRight } from 'lucide-react';
import { Button } from '@/components/atoms/Button';

export interface KycAlertBannerProps {
  className?: string;
}

export const KycAlertBanner: React.FC<KycAlertBannerProps> = ({ className }) => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { t } = useTranslation();

  if (!user || user.kycStatus === 'verified') return null;

  const isPending = user.kycStatus === 'pending';
  const isRejected = user.kycStatus === 'rejected';

  return (
    <div
      className={`p-4 sm:p-5 rounded-3xl ${
        isPending
          ? 'bg-amber-500/10 dark:bg-amber-950/30 border border-amber-500/30 text-amber-900 dark:text-amber-200'
          : isRejected
          ? 'bg-rose-500/10 dark:bg-rose-950/30 border border-rose-500/30 text-rose-900 dark:text-rose-200'
          : 'bg-amber-500/10 dark:bg-amber-950/40 border border-amber-500/30 text-amber-900 dark:text-amber-200'
      } flex flex-wrap items-center justify-between gap-4 ${className || ''}`}
    >
      <div className="flex items-start gap-3 max-w-2xl">
        <div
          className={`p-2.5 rounded-2xl text-white shrink-0 mt-0.5 shadow-sm ${
            isPending
              ? 'bg-amber-500 shadow-amber-500/20'
              : isRejected
              ? 'bg-rose-500 shadow-rose-500/20'
              : 'bg-amber-500 shadow-amber-500/20'
          }`}
        >
          {isPending ? <Clock className="w-5 h-5" /> : <ShieldAlert className="w-5 h-5" />}
        </div>
        <div>
          <h4 className="font-extrabold text-sm text-slate-900 dark:text-slate-100">
            {isPending
              ? 'Docs Sent — Verification Pending'
              : isRejected
              ? 'Verification Action Required'
              : t.kycBannerTitle}
          </h4>
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed mt-0.5">
            {isPending
              ? 'Your KYC documents have been received and are currently under review by the Pola verification team. Once approved, your listings will automatically go live.'
              : isRejected
              ? 'Your documents could not be verified. Please review requirements and resubmit your identification documents.'
              : t.kycBannerDesc}
          </p>
        </div>
      </div>

      {isPending ? (
        <span className="px-4 py-2 rounded-full text-xs font-bold bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/30 flex items-center gap-2">
          <Clock className="w-4 h-4 animate-pulse" />
          <span>Under Review</span>
        </span>
      ) : (
        <Button
          variant="primary"
          size="sm"
          onClick={() => navigate('/auth/kyc')}
          className={
            isRejected
              ? 'bg-rose-600 hover:bg-rose-700 text-white shadow-rose-500/20'
              : 'bg-amber-600 hover:bg-amber-700 text-white shadow-amber-500/20'
          }
          rightIcon={<ArrowRight className="w-4 h-4" />}
        >
          {isRejected ? 'Re-upload Documents' : t.completeKycNow}
        </Button>
      )}
    </div>
  );
};

