import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(usd: number, currency: 'USD' | 'TRY' | 'EUR', rates: { TRY: number; EUR: number }): string {
  if (currency === 'TRY') {
    return new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY', maximumFractionDigits: 0 }).format(usd * rates.TRY);
  }
  if (currency === 'EUR') {
    return new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(usd * rates.EUR);
  }
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(usd);
}

export function extractDomain(url: string): string {
  try {
    const u = new URL(url.startsWith('http') ? url : `https://${url}`);
    return u.hostname.replace(/^www\./, '');
  } catch {
    return url.replace(/^https?:\/\/(www\.)?/, '').split('/')[0] ?? url;
  }
}

/** Returns a Tailwind class name for use in className props */
export function scoreColor(score: number): string {
  if (score >= 80) return '#4ade80'; // green-400
  if (score >= 60) return '#facc15'; // yellow-400
  if (score >= 40) return '#fb923c'; // orange-400
  return '#f87171'; // red-400
}

/** Returns a Tailwind class name for use in className props */
export function scoreColorClass(score: number): string {
  if (score >= 80) return 'text-green-400';
  if (score >= 60) return 'text-yellow-400';
  if (score >= 40) return 'text-orange-400';
  return 'text-red-400';
}

export function scoreLabel(score: number, locale: 'tr' | 'en'): string {
  const labels = {
    tr: { great: 'Mükemmel', good: 'İyi', fair: 'Orta', poor: 'Zayıf' },
    en: { great: 'Great', good: 'Good', fair: 'Fair', poor: 'Poor' },
  };
  const l = labels[locale];
  if (score >= 80) return l.great;
  if (score >= 60) return l.good;
  if (score >= 40) return l.fair;
  return l.poor;
}
