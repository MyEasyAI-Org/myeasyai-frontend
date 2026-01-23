import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import pt from './locales/pt.json';
import en from './locales/en.json';
import es from './locales/es.json';
import fr from './locales/fr.json';

// Language resources
const resources = {
  pt: { translation: pt },
  en: { translation: en },
  es: { translation: es },
  fr: { translation: fr },
};

// Initialize i18next
i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'pt',
    debug: false,

    interpolation: {
      escapeValue: false, // React already escapes values
    },

    detection: {
      // Order of language detection
      order: ['localStorage', 'navigator'],
      // Key used to store language preference
      lookupLocalStorage: 'preferredLanguage',
      // Cache language preference in localStorage
      caches: ['localStorage'],
    },
  });

// Helper function to change language
export const changeLanguage = (lang: string) => {
  i18n.changeLanguage(lang);
  localStorage.setItem('preferredLanguage', lang);
};

// Helper to get current language
export const getCurrentLanguage = () => i18n.language;

// Available languages
export const languages = [
  { code: 'pt', name: 'Português', countryFlag: 'BR' },
  { code: 'en', name: 'English', countryFlag: 'US' },
  { code: 'es', name: 'Español', countryFlag: 'ES' },
  { code: 'fr', name: 'Français', countryFlag: 'FR' },
];

export default i18n;
