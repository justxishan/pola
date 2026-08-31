import { useThemeStore } from '@/store/themeStore';
import { translations, Translations, LanguageCode } from './translations';

export const useTranslation = () => {
  const language = useThemeStore((state) => state.language) || 'en';
  const setLanguage = useThemeStore((state) => state.setLanguage);

  const t: Translations = translations[language] || translations.en;

  return {
    t,
    language,
    setLanguage,
  };
};

export const useT = useTranslation;
export { translations };
export type { Translations, LanguageCode };
