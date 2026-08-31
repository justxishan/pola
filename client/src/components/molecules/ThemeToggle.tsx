import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { IconButton } from '@/components/atoms/IconButton';

export interface ThemeToggleProps {
  isDark: boolean;
  onToggle: () => void;
  className?: string;
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({ isDark, onToggle, className }) => {
  return (
    <IconButton
      variant="ghost"
      size="md"
      shape="circle"
      label={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
      onClick={onToggle}
      className={className}
    >
      {isDark ? (
        <Sun className="w-5 h-5 text-amber-400 hover:rotate-45 transition-transform duration-300" />
      ) : (
        <Moon className="w-5 h-5 text-slate-600 dark:text-slate-300 hover:-rotate-12 transition-transform duration-300" />
      )}
    </IconButton>
  );
};
