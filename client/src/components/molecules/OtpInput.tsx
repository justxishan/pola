import React, { useRef, useEffect } from 'react';
import { cn } from '@/lib/cn';

export interface OtpInputProps {
  length?: number;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  error?: boolean;
  className?: string;
}

export const OtpInput: React.FC<OtpInputProps> = ({
  length = 6,
  value,
  onChange,
  disabled = false,
  error = false,
  className,
}) => {
  const inputsRef = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    // Focus first empty input on mount
    const firstEmptyIndex = value.length < length ? value.length : 0;
    inputsRef.current[firstEmptyIndex]?.focus();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const char = e.target.value.replace(/[^0-9]/g, '').slice(-1);
    const valueArr = value.split('');
    valueArr[index] = char;
    const newValue = valueArr.join('').slice(0, length);
    onChange(newValue);

    if (char && index < length - 1) {
      inputsRef.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === 'Backspace' && !value[index] && index > 0) {
      inputsRef.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/[^0-9]/g, '').slice(0, length);
    onChange(pasted);
    const nextIndex = Math.min(pasted.length, length - 1);
    inputsRef.current[nextIndex]?.focus();
  };

  return (
    <div className={cn('flex items-center justify-center gap-2.5 sm:gap-3.5', className)}>
      {Array.from({ length }).map((_, index) => (
        <input
          key={index}
          ref={(el) => (inputsRef.current[index] = el)}
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          maxLength={1}
          disabled={disabled}
          value={value[index] || ''}
          onChange={(e) => handleChange(e, index)}
          onKeyDown={(e) => handleKeyDown(e, index)}
          onPaste={handlePaste}
          className={cn(
            'w-11 h-13 sm:w-13 sm:h-15 text-center text-xl sm:text-2xl font-bold rounded-xl border bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 transition-all duration-200 focus:outline-none focus:ring-2 disabled:opacity-50',
            error
              ? 'border-rose-500 focus:border-rose-500 focus:ring-rose-500/20 text-rose-600'
              : value[index]
              ? 'border-emerald-500 ring-2 ring-emerald-500/10'
              : 'border-slate-200 dark:border-slate-700 focus:border-emerald-500 focus:ring-emerald-500/20'
          )}
        />
      ))}
    </div>
  );
};
