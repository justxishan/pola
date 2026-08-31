import { create } from 'zustand';
import { LanguageCode } from '@/components/molecules/LanguageSwitcher';

interface ThemeState {
  isDark: boolean;
  language: LanguageCode;
  toggleTheme: () => void;
  setLanguage: (lang: LanguageCode) => void;
}

const savedTheme = localStorage.getItem('pola_theme');
const savedLang = localStorage.getItem('pola_lang') as LanguageCode;

// Default to Dark Mode unless explicitly saved as 'light'
const initialIsDark = savedTheme ? savedTheme === 'dark' : true;

// Ensure documentElement has initial dark class
if (initialIsDark) {
  document.documentElement.classList.add('dark');
} else {
  document.documentElement.classList.remove('dark');
}

export const useThemeStore = create<ThemeState>((set) => ({
  isDark: initialIsDark,
  language: savedLang || 'en',

  toggleTheme: () => {
    set((state) => {
      const nextDark = !state.isDark;
      if (nextDark) {
        document.documentElement.classList.add('dark');
        localStorage.setItem('pola_theme', 'dark');
      } else {
        document.documentElement.classList.remove('dark');
        localStorage.setItem('pola_theme', 'light');
      }
      return { isDark: nextDark };
    });
  },

  setLanguage: (language) => {
    localStorage.setItem('pola_lang', language);
    set({ language });
  },
}));
