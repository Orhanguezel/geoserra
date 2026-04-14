import { randomUUID } from 'crypto';
import { eq, and } from 'drizzle-orm';
import { db } from '@/db/client';
import { currency_rates } from './schema';
import { env } from '@/core/env';

const SUPPORTED_TARGETS = ['TRY', 'EUR'] as const;
type SupportedTarget = (typeof SUPPORTED_TARGETS)[number];

export interface RatesResponse {
  USD: 1;
  TRY: number;
  EUR: number;
  fetched_at: string;
  source: 'cache' | 'api';
}

let lastFetch = 0;

/** DB'den mevcut kuru oku */
async function getRateFromDb(target: SupportedTarget): Promise<number | null> {
  const [row] = await db
    .select()
    .from(currency_rates)
    .where(and(eq(currency_rates.base, 'USD'), eq(currency_rates.target, target)))
    .limit(1);

  if (!row) return null;

  const ageSeconds = (Date.now() - new Date(row.fetched_at).getTime()) / 1000;
  if (ageSeconds > env.EXCHANGE_RATE_CACHE_TTL_SECONDS) return null; // TTL geçmişse stale

  return parseFloat(row.rate);
}

/** open.er-api.com'dan kur çek ve DB'ye upsert et */
async function fetchAndCacheRates(): Promise<void> {
  const now = Date.now();
  if (now - lastFetch < 60_000) return; // process içi debounce: 60s

  lastFetch = now;

  try {
    const res = await fetch(env.EXCHANGE_RATE_API_URL, {
      signal: AbortSignal.timeout(8000),
    });

    if (!res.ok) throw new Error(`ExchangeRate API ${res.status}`);

    const data = (await res.json()) as { rates?: Record<string, number> };
    if (!data.rates) throw new Error('Invalid API response');

    for (const target of SUPPORTED_TARGETS) {
      const rate = data.rates[target];
      if (!rate) continue;

      await db
        .insert(currency_rates)
        .values({ id: randomUUID(), base: 'USD', target, rate: String(rate) })
        .onDuplicateKeyUpdate({ set: { rate: String(rate), fetched_at: new Date() } });
    }
  } catch (err) {
    console.error('[CurrencyService] Fetch failed:', err);
  }
}

/** Ana method: tüm kurları döndür */
export async function getRates(): Promise<RatesResponse> {
  // TTL cache kontrolü için ilk önce DB'ye bak
  const [tryRate, eurRate] = await Promise.all([
    getRateFromDb('TRY'),
    getRateFromDb('EUR'),
  ]);

  // Cache geçerliyse direkt döndür
  if (tryRate !== null && eurRate !== null) {
    return { USD: 1, TRY: tryRate, EUR: eurRate, fetched_at: new Date().toISOString(), source: 'cache' };
  }

  // Stale veya yok → API'den çek (non-blocking), stale değeri döndür
  void fetchAndCacheRates();

  // Fallback: DB'deki en son değer (TTL'den bağımsız)
  const [tryFallback, eurFallback] = await Promise.all([
    db.select().from(currency_rates).where(and(eq(currency_rates.base, 'USD'), eq(currency_rates.target, 'TRY'))).limit(1),
    db.select().from(currency_rates).where(and(eq(currency_rates.base, 'USD'), eq(currency_rates.target, 'EUR'))).limit(1),
  ]);

  return {
    USD: 1,
    TRY: tryFallback[0] ? parseFloat(tryFallback[0].rate) : 38.5,
    EUR: eurFallback[0] ? parseFloat(eurFallback[0].rate) : 0.92,
    fetched_at: new Date().toISOString(),
    source: 'cache',
  };
}
