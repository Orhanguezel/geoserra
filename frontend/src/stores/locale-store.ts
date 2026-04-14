'use client';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Locale } from '@/lib/t';

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
    { name: 'geoserra-locale' },
  ),
);
