import React from 'react';
import { cn } from '@/lib/cn';
import { Button } from '@/components/atoms/Button';
import { Printer, Download, QrCode } from 'lucide-react';

export interface QrCodeCardProps {
  title: string;
  code: string;
  subtitle?: string;
  qrDataUrl?: string;
  onPrint?: () => void;
  onDownload?: () => void;
  className?: string;
}

export const QrCodeCard: React.FC<QrCodeCardProps> = ({
  title,
  code,
  subtitle,
  qrDataUrl,
  onPrint,
  onDownload,
  className,
}) => {
  return (
    <div
      className={cn(
        'p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col items-center text-center space-y-4 max-w-xs mx-auto',
        className
      )}
    >
      <div className="space-y-1">
        <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100">{title}</h4>
        {subtitle && <p className="text-xs text-slate-400">{subtitle}</p>}
      </div>

      <div className="p-4 bg-white rounded-2xl border-2 border-dashed border-slate-200 shadow-inner flex items-center justify-center">
        {qrDataUrl ? (
          <img src={qrDataUrl} alt={code} className="w-40 h-40 object-contain" />
        ) : (
          <div className="w-40 h-40 bg-slate-50 flex flex-col items-center justify-center text-slate-400 gap-2">
            <QrCode className="w-16 h-16 text-slate-300" />
            <span className="text-[10px] font-mono">{code}</span>
          </div>
        )}
      </div>

      <div className="font-mono text-xs font-bold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-lg w-full">
        {code}
      </div>

      {(onPrint || onDownload) && (
        <div className="flex gap-2 w-full pt-1">
          {onPrint && (
            <Button
              variant="outline"
              size="sm"
              onClick={onPrint}
              leftIcon={<Printer className="w-3.5 h-3.5" />}
              className="flex-1"
            >
              Print
            </Button>
          )}
          {onDownload && (
            <Button
              variant="secondary"
              size="sm"
              onClick={onDownload}
              leftIcon={<Download className="w-3.5 h-3.5" />}
              className="flex-1"
            >
              Download
            </Button>
          )}
        </div>
      )}
    </div>
  );
};
