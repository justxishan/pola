import React, { useState } from 'react';
import { useTranslation } from '@/lib/i18n';
import { Input } from '@/components/atoms/Input';
import { Select } from '@/components/atoms/Select';
import { Textarea } from '@/components/atoms/Textarea';
import { Button } from '@/components/atoms/Button';
import { FileDropzone } from '@/components/molecules/FileDropzone';
import { api } from '@/services/api';
import { AlertTriangle, X, ShieldAlert, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';

export interface DisputeModalProps {
  orderId: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const DisputeModal: React.FC<DisputeModalProps> = ({
  orderId,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState(false);

  const [reason, setReason] = useState('damaged_produce');
  const [description, setDescription] = useState('');
  const [refundPreference, setRefundPreference] = useState('wallet');
  const [evidencePhoto, setEvidencePhoto] = useState<File | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) {
      toast.error('Please describe the issue in detail');
      return;
    }

    try {
      setIsLoading(true);
      const formData = new FormData();
      formData.append('orderId', orderId);
      formData.append('reason', reason);
      formData.append('description', description);
      formData.append('refundPreference', refundPreference);
      if (evidencePhoto) formData.append('evidence', evidencePhoto);

      await api.post('/disputes', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      toast.success('Dispute submitted for admin adjudication. Funds remain held in escrow.');
      if (onSuccess) onSuccess();
      onClose();
    } catch (err: any) {
      toast.error(err.message || 'Failed to submit dispute');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
      <div
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity animate-in fade-in"
        onClick={onClose}
      />

      <div className="relative w-full max-w-lg rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl p-6 sm:p-8 space-y-6 animate-in zoom-in-95">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-red-50 dark:bg-red-950/50 text-red-600 dark:text-red-300">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 dark:text-slate-100 text-lg">
                Report Issue / File Dispute
              </h3>
              <p className="text-xs text-slate-400">Pola Escrow protection freezes funds during review</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Select
            label="Dispute Reason"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            options={[
              { value: 'damaged_produce', label: 'Damaged or Spoiled Produce' },
              { value: 'incorrect_weight', label: 'Weight Shortfall / Discrepancy' },
              { value: 'below_quality_grade', label: 'Below Declared Quality Grade' },
              { value: 'missing_items', label: 'Missing Produce Line-items' },
              { value: 'late_delivery', label: 'Severe Delivery Delay' },
            ]}
          />

          <Textarea
            label="Detailed Complaint Description"
            placeholder="Explain what was received versus expected..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            required
          />

          <Select
            label="Desired Resolution"
            value={refundPreference}
            onChange={(e) => setRefundPreference(e.target.value)}
            options={[
              { value: 'wallet', label: 'Instant Refund to Pola Wallet (1-Click Checkout)' },
              { value: 'replacement', label: 'Replacement Delivery Request' },
              { value: 'original_source', label: 'Reversal to Bank / Card' },
            ]}
          />

          <div className="pt-2">
            <FileDropzone
              label="Photo / Video Evidence (Mandatory for damage)"
              onFileSelect={setEvidencePhoto}
              accept="image/*"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
            <Button variant="outline" size="sm" type="button" onClick={onClose}>
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              type="submit"
              isLoading={isLoading}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Submit Dispute
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
