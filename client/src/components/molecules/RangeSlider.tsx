import React from 'react';
import { cn } from '@/lib/cn';

export interface RangeSliderProps {
  label?: string;
  min: number;
  max: number;
  step?: number;
  value: [number, number] | number;
  onChange: (value: any) => void;
  unit?: string;
  className?: string;
}

export const RangeSlider: React.FC<RangeSliderProps> = ({
  label,
  min,
  max,
  step = 1,
  value,
  onChange,
  unit = '',
  className,
}) => {
  const isSingle = typeof value === 'number';
  const singleVal = isSingle ? (value as number) : 0;

  return (
    <div className={cn('w-full space-y-2', className)}>
      <div className="flex justify-between items-center text-xs">
        {label && (
          <span className="font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300">
            {label}
          </span>
        )}
        <span className="font-bold text-emerald-600 dark:text-emerald-400">
          {isSingle ? `${singleVal} ${unit}` : `${value[0]} - ${value[1]} ${unit}`}
        </span>
      </div>

      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={isSingle ? singleVal : value[1]}
        onChange={(e) => {
          const val = parseFloat(e.target.value);
          if (isSingle) {
            onChange(val);
          } else {
            onChange([value[0], val]);
          }
        }}
        className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-emerald-600"
      />

      <div className="flex justify-between text-[10px] text-slate-400 font-medium">
        <span>{min} {unit}</span>
        <span>{max} {unit}</span>
      </div>
    </div>
  );
};
