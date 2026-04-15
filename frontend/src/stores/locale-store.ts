'use client';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Locale } from '@/lib/t';

const SUPPORTED: Locale[] = ['tr', 'en'];

function detectBrowserLocale(): Locale {
  if (typeof navigator === 'undefined') return 'tr';
  const lang = navigator.language?.toLowerCase() ?? '';
  if (lang.startsWith('tr')) return 'tr';
  if (lang.startsWith('en')) return 'en';
  return 'tr';
}

interface LocaleStore {
  locale: Locale;
  setLocale: (l: Locale) => void;
}

export const useLocaleStore = create<LocaleStore>()(
  persist(
    (set) => ({
      locale: 'tr',
      setLocale: (locale) => set({ locale }),
    }),
    {
      name: 'geoserra-locale',
      onRehydrateStorage: () => (state, error) => {
        // localStorage'da kayıtlı değer yoksa browser dilini kullan
        if (!error && state) {
          const stored = typeof window !== 'undefined'
            ? window.localStorage.getItem('geoserra-locale')
            : null;
          if (!stored) {
            const detected = detectBrowserLocale();
            state.locale = detected;
          }
        }
      },
    },
  ),
);
