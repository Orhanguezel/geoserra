import { env } from '@/core/env';

export function parseCorsOrigins(v?: string | string[]): boolean | string[] {
  if (!v) {
    if (env.NODE_ENV === 'production') {
      console.warn('[CORS] CORS_ORIGIN bos — production icin tanimlanmali!');
      return false;
    }
    return true;
  }
  if (Array.isArray(v)) return v;
  const arr = String(v).trim().split(',').map((x) => x.trim()).filter(Boolean);
  return arr.length ? arr : (env.NODE_ENV === 'production' ? false : true);
}
