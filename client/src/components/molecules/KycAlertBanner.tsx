import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { useTranslation } from '@/lib/i18n';
import { ShieldAlert, ArrowRight } from 'lucide-react';
import { Button } from '@/components/atoms/Button';

export interface KycAlertBannerProps {
  className?: string;
}

export const KycAlertBanner: React.FC<KycAlertBannerProps> = ({ className }) => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { t } = useTranslation();

  if (!user || user.kycStatus === 'verified') return null;

  return (
    <div
      className={`p-4 sm:p-5 rounded-3xl bg-amber-500/10 dark:bg-amber-950/40 border border-amber-500/30 text-amber-900 dark:text-amber-200 flex flex-wrap items-center justify-between gap-4 ${className || ''}`}
    >
      <div className="flex items-start gap-3 max-w-2xl">
        <div className="p-2.5 rounded-2xl bg-amber-500 text-white shrink-0 mt-0.5 shadow-sm shadow-amber-500/20">
          <ShieldAlert className="w-5 h-5" />
        </div>
        <div>
          <h4 className="font-extrabold text-sm text-slate-900 dark:text-slate-100">
            {t.kycBannerTitle}
          </h4>
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed mt-0.5">
            {t.kycBannerDesc}
          </p>
        </div>
      </div>

      <Button
        variant="primary"
        size="sm"
        onClick={() => navigate('/auth/kyc')}
        className="bg-amber-600 hover:bg-amber-700 text-white shadow-amber-500/20"
        rightIcon={<ArrowRight className="w-4 h-4" />}
      >
        {t.completeKycNow}
      </Button>
    </div>
  );
};
