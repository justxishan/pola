import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { AlertTriangle, X, MessageCircle } from 'lucide-react';
import { Button } from '@/components/atoms/Button';
import { AuthService } from '@/services/auth.service';
import { useAuthStore } from '@/store/authStore';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const REASONS = [
  {
    id: 'no_buyers',
    label: "I'm not getting enough buyers",
    retention: "Low visibility is usually fixable — verified farms and complete listings rank higher in search. Our support team can review your listings and suggest changes before you go.",
  },
  {
    id: 'fees_too_high',
    label: 'Platform fees / payout terms',
    retention: 'We may be able to help — reach out to Support about your specific rate before leaving; commission tiers vary by volume.',
  },
  {
    id: 'technical_issues',
    label: 'App bugs or technical issues',
    retention: "Sorry about that. If you tell Support what broke, we'll prioritize a fix — most issues take under 48 hours to resolve.",
  },
  {
    id: 'found_alternative',
    label: 'Found a better platform',
    retention: "We'd genuinely like to know what's working better for you — but there's no obligation to explain further if you'd rather just leave.",
  },
  {
    id: 'not_farming',
    label: "I'm no longer farming / selling produce",
    retention: 'No hard feelings — you can also just pause your listings and keep the account for when you return, instead of deleting it.',
  },
  { id: 'other', label: 'Other reason', retention: null },
];

export const DeleteAccountModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({
  isOpen,
  onClose,
}) => {
  const navigate = useNavigate();
  const { logout } = useAuthStore();
  const [step, setStep] = useState<'reason' | 'retain' | 'confirm'>('reason');
  const [selectedReason, setSelectedReason] = useState<string>('');
  const [details, setDetails] = useState('');
  const [confirmText, setConfirmText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  if (!isOpen || typeof document === 'undefined') return null;

  const reset = () => {
    setStep('reason');
    setSelectedReason('');
    setDetails('');
    setConfirmText('');
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const currentReason = REASONS.find((r) => r.id === selectedReason);

  const handleContinueFromReason = () => {
    if (!selectedReason) {
      toast.error('Please select a reason');
      return;
    }
    setStep(currentReason?.retention ? 'retain' : 'confirm');
  };

  const handleDelete = async () => {
    if (confirmText.trim().toUpperCase() !== 'DELETE') {
      toast.error('Please type DELETE to confirm');
      return;
    }
    try {
      setIsDeleting(true);
      await AuthService.deleteAccount(currentReason?.label || selectedReason, details.trim() || undefined);
      toast.success('Your account has been deactivated.');
      logout();
      navigate('/');
    } catch (err: any) {
      toast.error(err.response?.data?.message || err.message || 'Failed to delete account');
    } finally {
      setIsDeleting(false);
    }
  };

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs"
      onClick={handleClose}
    >
      <div
        className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-2xl space-y-5"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 p-1.5 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
        >
          <X className="w-4 h-4" />
        </button>

        {step === 'reason' && (
          <>
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 bg-rose-50 text-rose-600 dark:bg-rose-950/50 dark:text-rose-300">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-base font-bold text-slate-900 dark:text-slate-100">Before you go</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400">Help us understand what happened</p>
              </div>
            </div>

            <div className="space-y-2">
              {REASONS.map((r) => (
                <label
                  key={r.id}
                  className="flex items-center gap-2.5 p-3 rounded-2xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer text-sm"
                >
                  <input
                    type="radio"
                    name="delete-reason"
                    checked={selectedReason === r.id}
                    onChange={() => setSelectedReason(r.id)}
                  />
                  <span className="text-slate-700 dark:text-slate-200">{r.label}</span>
                </label>
              ))}
            </div>

            {selectedReason === 'other' && (
              <textarea
                rows={2}
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                placeholder="Tell us more (optional)"
                className="w-full px-3 py-2 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm"
              />
            )}

            <Button variant="primary" size="md" className="w-full" onClick={handleContinueFromReason}>
              Continue
            </Button>
          </>
        )}

        {step === 'retain' && currentReason?.retention && (
          <>
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-300">
                <MessageCircle className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-base font-bold text-slate-900 dark:text-slate-100">Before you delete...</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mt-1">
                  {currentReason.retention}
                </p>
              </div>
            </div>

            <Button variant="primary" size="md" className="w-full" onClick={handleClose}>
              Keep My Account
            </Button>
            <button
              onClick={() => setStep('confirm')}
              className="w-full text-center text-xs font-semibold text-slate-400 hover:text-rose-500 py-1"
            >
              Continue deleting my account
            </button>
          </>
        )}

        {step === 'confirm' && (
          <>
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 bg-rose-50 text-rose-600 dark:bg-rose-950/50 dark:text-rose-300">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-base font-bold text-slate-900 dark:text-slate-100">This can't be undone</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Your listings will be delisted and you'll be signed out immediately.
                </p>
              </div>
            </div>

            <input
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              placeholder='Type "DELETE" to confirm'
              className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm"
            />

            <Button
              variant="primary"
              size="md"
              className="w-full bg-rose-600 hover:bg-rose-500"
              isLoading={isDeleting}
              onClick={handleDelete}
            >
              Delete My Account
            </Button>
          </>
        )}
      </div>
    </div>,
    document.body
  );
};
