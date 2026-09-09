import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/cn';
import { Minus, Plus } from 'lucide-react';

export interface QuantityStepperProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  unit?: string;
  disabled?: boolean;
  className?: string;
}

export const QuantityStepper: React.FC<QuantityStepperProps> = ({
  value,
  onChange,
  min = 1,
  max = 99999,
  step = 1,
  unit,
  disabled = false,
  className,
}) => {
  const effectiveMin = Math.max(0, min);
  const effectiveMax = Math.max(effectiveMin, max);

  const [inputText, setInputText] = useState<string>(String(value));
  const [isFocused, setIsFocused] = useState<boolean>(false);

  useEffect(() => {
    if (!isFocused) {
      setInputText(String(value));
    }
  }, [value, isFocused]);

  const handleDecrement = () => {
    const nextVal = Math.round((value - step) * 100) / 100;
    const clamped = Math.max(effectiveMin, nextVal);
    onChange(clamped);
    setInputText(String(clamped));
  };

  const handleIncrement = () => {
    const nextVal = Math.round((value + step) * 100) / 100;
    const clamped = Math.min(effectiveMax, nextVal);
    onChange(clamped);
    setInputText(String(clamped));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    setInputText(raw);

    // If valid number entered, propagate without locking intermediate states
    const parsed = parseFloat(raw);
    if (!isNaN(parsed) && parsed >= effectiveMin && parsed <= effectiveMax) {
      onChange(parsed);
    }
  };

  const handleBlur = () => {
    setIsFocused(false);
    const parsed = parseFloat(inputText);
    if (isNaN(parsed) || parsed < effectiveMin) {
      onChange(effectiveMin);
      setInputText(String(effectiveMin));
    } else if (parsed > effectiveMax) {
      onChange(effectiveMax);
      setInputText(String(effectiveMax));
    } else {
      const rounded = Math.round(parsed * 100) / 100;
      onChange(rounded);
      setInputText(String(rounded));
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      (e.target as HTMLInputElement).blur();
    }
  };

  return (
    <div
      className={cn(
        'inline-flex items-center rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-1 shadow-2xs select-none',
        disabled && 'opacity-50 pointer-events-none',
        className
      )}
    >
      <button
        type="button"
        disabled={value <= effectiveMin || disabled}
        onClick={handleDecrement}
        className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-500 hover:text-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
        aria-label="Decrease quantity"
      >
        <Minus className="w-3.5 h-3.5" />
      </button>

      <div className="px-2 flex items-center justify-center min-w-14 text-center">
        <input
          type="text"
          inputMode="decimal"
          value={inputText}
          onChange={handleInputChange}
          onFocus={() => setIsFocused(true)}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          className="w-12 text-center text-sm font-bold text-slate-900 dark:text-slate-100 bg-transparent focus:outline-none"
        />
        {unit && <span className="text-xs text-slate-400 font-medium ml-0.5">{unit}</span>}
      </div>

      <button
        type="button"
        disabled={value >= effectiveMax || disabled}
        onClick={handleIncrement}
        className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-500 hover:text-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
        aria-label="Increase quantity"
      >
        <Plus className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};

