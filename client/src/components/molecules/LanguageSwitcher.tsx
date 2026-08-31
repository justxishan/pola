import React from 'react';
import { cn } from '@/lib/cn';
import { Languages } from 'lucide-react';

export type LanguageCode = 'en' | 'si' | 'ta';

export interface LanguageSwitcherProps {
  currentLanguage: LanguageCode;
  onLanguageChange: (lang: LanguageCode) => void;
  className?: string;
}

export const LanguageSwitcher: React.FC<LanguageSwitcherProps> = ({
  currentLanguage,
  onLanguageChange,
  className,
}) => {
  const languages: { code: LanguageCode; label: string }[] = [
    { code: 'en', label: 'EN' },
    { code: 'si', label: 'සිං' },
    { code: 'ta', label: 'தம' },
  ];

  return (
    <div
      className={cn(
        'inline-flex items-center rounded-xl bg-slate-100 dark:bg-slate-800 p-1 border border-slate-200 dark:border-slate-700 text-xs font-semibold select-none',
        className
      )}
    >
      <div className="pl-1.5 pr-1 text-slate-400">
        <Languages className="w-3.5 h-3.5" />
      </div>
      {languages.map((lang) => (
        <button
          key={lang.code}
          type="button"
          onClick={() => onLanguageChange(lang.code)}
          className={cn(
            'px-2 py-1 rounded-lg transition-all duration-200 cursor-pointer',
            currentLanguage === lang.code
              ? 'bg-white dark:bg-slate-900 text-emerald-700 dark:text-emerald-300 shadow-2xs font-bold'
              : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
          )}
        >
          {lang.label}
        </button>
      ))}
    </div>
  );
};
