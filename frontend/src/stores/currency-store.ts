'use client';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type Currency = 'USD' | 'TRY' | 'EUR';

interface CurrencyStore {
  currency: Currency;
  rates: { TRY: number; EUR: number };
  setCurrency: (c: Currency) => void;
  setRates: (r: { TRY: number; EUR: number }) => void;
}

export const useCurrencyStore = create<CurrencyStore>()(
  persist(
    (set) => ({
      currency: 'USD',
      rates: { TRY: 38.5, EUR: 0.92 },
      setCurrency: (currency) => set({ currency }),
      setRates: (rates) => set({ rates }),
    }),
    { name: 'geoserra-currency' },
  ),
);
