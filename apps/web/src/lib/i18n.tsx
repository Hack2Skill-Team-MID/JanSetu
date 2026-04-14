'use client';

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';

// Import locale files
import en from '../locales/en.json';
import hi from '../locales/hi.json';
import ta from '../locales/ta.json';

type LocaleKey = 'en' | 'hi' | 'ta';

const locales: Record<LocaleKey, Record<string, any>> = { en, hi, ta };

export const LANGUAGES = [
  { code: 'en' as LocaleKey, label: 'EN', name: 'English' },
  { code: 'hi' as LocaleKey, label: 'हि', name: 'हिन्दी' },
  { code: 'ta' as LocaleKey, label: 'த', name: 'தமிழ்' },
];

interface I18nContextType {
  locale: LocaleKey;
  setLocale: (locale: LocaleKey) => void;
  t: (key: string, fallback?: string) => string;
}

const I18nContext = createContext<I18nContextType>({
  locale: 'en',
  setLocale: () => {},
  t: (key: string) => key,
});

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<LocaleKey>('en');

  // Load saved locale on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('jansetu-locale') as LocaleKey;
      if (saved && locales[saved]) {
        setLocaleState(saved);
      }
    }
  }, []);

  const setLocale = useCallback((newLocale: LocaleKey) => {
    setLocaleState(newLocale);
    if (typeof window !== 'undefined') {
      localStorage.setItem('jansetu-locale', newLocale);
    }
  }, []);

  // Nested key resolver: t('nav.dashboard') → locales.en.nav.dashboard
  const t = useCallback(
    (key: string, fallback?: string): string => {
      const keys = key.split('.');
      let value: any = locales[locale];

      for (const k of keys) {
        if (value && typeof value === 'object' && k in value) {
          value = value[k];
        } else {
          // Fallback to English
          let enValue: any = locales.en;
          for (const ek of keys) {
            if (enValue && typeof enValue === 'object' && ek in enValue) {
              enValue = enValue[ek];
            } else {
              return fallback || key;
            }
          }
          return typeof enValue === 'string' ? enValue : (fallback || key);
        }
      }

      return typeof value === 'string' ? value : (fallback || key);
    },
    [locale]
  );

  return (
    <I18nContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useTranslation() {
  return useContext(I18nContext);
}

export default I18nProvider;
