'use client';
import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getCurrencyRates } from '@/lib/api';
import { useCurrencyStore } from '@/stores/currency-store';

/** Uygulama açılışında kur verilerini çekip store'a yazar */
export function CurrencyInitializer() {
  const setRates = useCurrencyStore((s) => s.setRates);

  const { data } = useQuery({
    queryKey: ['currency-rates'],
    queryFn: getCurrencyRates,
    staleTime: 1000 * 60 * 30, // 30 dk
    retry: 1,
  });

  useEffect(() => {
    if (data) setRates({ TRY: data.TRY, EUR: data.EUR });
  }, [data, setRates]);

  return null;
}
