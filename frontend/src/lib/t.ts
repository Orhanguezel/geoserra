import tr from '@/locales/tr.json';
import en from '@/locales/en.json';

export type Locale = 'tr' | 'en';

const locales: Record<Locale, any> = { tr, en };

/**
 * Çeviri fonksiyonu — sunucu ve istemci tarafında çalışır.
 * Nested key desteği: t("nav.home"), t("pricing.starter.title")
 */
export function t(key: string, params?: Record<string, string | number>, locale: Locale = 'tr'): string {
  const dict = locales[locale] ?? locales.tr;
  const parts = key.split('.');
  let value: any = dict;

  for (const part of parts) {
    if (value == null || typeof value !== 'object') return key;
    value = value[part];
  }

  if (value == null) return key;
  let result = String(value);

  if (params) {
    for (const [k, v] of Object.entries(params)) {
      result = result.replaceAll(`{{${k}}}`, String(v));
    }
  }

  return result;
}

/** Sayfa locale'ini belirle (server component için) */
export function getLocaleFromParams(params?: { lang?: string }): Locale {
  const lang = params?.lang;
  if (lang === 'en') return 'en';
  return 'tr';
}
