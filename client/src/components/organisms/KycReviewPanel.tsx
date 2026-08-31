import React, { useState } from 'react';
import { cn } from '@/lib/cn';
import { Button } from '@/components/atoms/Button';
import { Badge } from '@/components/atoms/Badge';
import { Textarea } from '@/components/atoms/Textarea';
import { CheckCircle2, XCircle, User, CreditCard, Shield, FileText } from 'lucide-react';

export interface KycDocumentRecord {
  userId: string;
  fullName: string;
  email: string;
  phone: string;
  role: string;
  nicNumber?: string;
  bankDetails?: {
    bankName: string;
    branchName: string;
    accountNumber: string;
    accountHolderName: string;
  };
  kycDocuments: {
    nicFrontUrl?: string;
    nicBackUrl?: string;
    selfieUrl?: string;
    businessRegUrl?: string;
  };
  submittedAt: string;
}

export interface KycReviewPanelProps {
  record: KycDocumentRecord;
  onApprove: (userId: string) => void;
  onReject: (userId: string, reason: string) => void;
  isLoading?: boolean;
  className?: string;
}

export const KycReviewPanel: React.FC<KycReviewPanelProps> = ({
  record,
  onApprove,
  onReject,
  isLoading = false,
  className,
}) => {
  const [selectedDoc, setSelectedDoc] = useState<'nicFront' | 'nicBack' | 'selfie' | 'br'>('nicFront');
  const [rejectReason, setRejectReason] = useState('');
  const [showRejectBox, setShowRejectBox] = useState(false);

  const docUrl =
    selectedDoc === 'nicFront'
      ? record.kycDocuments.nicFrontUrl
      : selectedDoc === 'nicBack'
      ? record.kycDocuments.nicBackUrl
      : selectedDoc === 'selfie'
      ? record.kycDocuments.selfieUrl
      : record.kycDocuments.businessRegUrl;

  return (
    <div
      className={cn(
        'grid grid-cols-1 lg:grid-cols-2 gap-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-sm',
        className
      )}
    >
      {/* Left: Metadata & Verification Checklist */}
      <div className="space-y-6">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
              {record.fullName}
            </h3>
            <p className="text-xs text-slate-400">{record.email} • {record.phone}</p>
          </div>
          <Badge variant="purple" size="md">
            {record.role.replace(/_/g, ' ')}
          </Badge>
        </div>

        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 space-y-3 text-xs">
          <div className="flex items-center gap-2 font-bold text-slate-800 dark:text-slate-200">
            <CreditCard className="w-4 h-4 text-emerald-600" />
            <span>National Identity & Bank Reference</span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-slate-600 dark:text-slate-300">
            <div>
              <span className="text-slate-400 block text-[11px]">NIC Number</span>
              <span className="font-mono font-bold text-slate-900 dark:text-slate-100">
                {record.nicNumber || 'Not provided'}
              </span>
            </div>
            <div>
              <span className="text-slate-400 block text-[11px]">Submitted Date</span>
              <span>{new Date(record.submittedAt).toLocaleDateString()}</span>
            </div>
          </div>

          {record.bankDetails && (
            <div className="pt-2 border-t border-slate-200 dark:border-slate-700 space-y-1">
              <span className="text-slate-400 block text-[11px]">LankaPay Settlement Account</span>
              <p className="font-semibold text-slate-800 dark:text-slate-200">
                {record.bankDetails.bankName} ({record.bankDetails.branchName})
              </p>
              <p className="font-mono text-slate-600 dark:text-slate-400">
                {record.bankDetails.accountNumber} • {record.bankDetails.accountHolderName}
              </p>
            </div>
          )}
        </div>

        {/* Action Trigger Buttons */}
        <div className="space-y-3 pt-2">
          {!showRejectBox ? (
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="md"
                onClick={() => setShowRejectBox(true)}
                className="flex-1 text-rose-600 border-rose-200 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                leftIcon={<XCircle className="w-4 h-4" />}
              >
                Reject KYC
              </Button>
              <Button
                variant="primary"
                size="md"
                onClick={() => onApprove(record.userId)}
                isLoading={isLoading}
                className="flex-1"
                leftIcon={<CheckCircle2 className="w-4 h-4" />}
              >
                Approve & Verify
              </Button>
            </div>
          ) : (
            <div className="space-y-3 p-4 rounded-2xl bg-rose-50/50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-800 animate-in fade-in">
              <Textarea
                label="Rejection Reason for User"
                placeholder="E.g., NIC image is blurry, Bank account name mismatch..."
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                rows={3}
              />
              <div className="flex items-center justify-end gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowRejectBox(false)}
                >
                  Cancel
                </Button>
                <Button
                  variant="danger"
                  size="sm"
                  disabled={!rejectReason.trim()}
                  onClick={() => onReject(record.userId, rejectReason)}
                  isLoading={isLoading}
                >
                  Confirm Rejection
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Right: Document Viewer */}
      <div className="space-y-3 flex flex-col justify-between">
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
          {record.kycDocuments.nicFrontUrl && (
            <button
              onClick={() => setSelectedDoc('nicFront')}
              className={cn(
                'px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer',
                selectedDoc === 'nicFront'
                  ? 'bg-emerald-600 text-white border-emerald-600'
                  : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
              )}
            >
              NIC Front
            </button>
          )}

          {record.kycDocuments.nicBackUrl && (
            <button
              onClick={() => setSelectedDoc('nicBack')}
              className={cn(
                'px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer',
                selectedDoc === 'nicBack'
                  ? 'bg-emerald-600 text-white border-emerald-600'
                  : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
              )}
            >
              NIC Back
            </button>
          )}

          {record.kycDocuments.selfieUrl && (
            <button
              onClick={() => setSelectedDoc('selfie')}
              className={cn(
                'px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer',
                selectedDoc === 'selfie'
                  ? 'bg-emerald-600 text-white border-emerald-600'
                  : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
              )}
            >
              Selfie Proof
            </button>
          )}

          {record.kycDocuments.businessRegUrl && (
            <button
              onClick={() => setSelectedDoc('br')}
              className={cn(
                'px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer',
                selectedDoc === 'br'
                  ? 'bg-emerald-600 text-white border-emerald-600'
                  : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
              )}
            >
              Business BR
            </button>
          )}
        </div>

        <div className="flex-1 min-h-[300px] rounded-2xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 p-2 flex items-center justify-center overflow-hidden">
          {docUrl ? (
            <img
              src={docUrl}
              alt="KYC Verification Document"
              className="max-h-[350px] w-full object-contain rounded-xl"
            />
          ) : (
            <div className="text-center text-slate-400 space-y-2">
              <FileText className="w-10 h-10 mx-auto text-slate-300" />
              <p className="text-xs">No image uploaded for this document</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
