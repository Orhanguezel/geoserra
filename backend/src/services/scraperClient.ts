import { env } from '@/core/env';

export interface ScrapeRequest {
  url: string;
  mode?: 'fast' | 'stealthy' | 'dynamic';
  profile?: 'geo-page' | 'geo-robots';
  options?: {
    solve_cloudflare?: boolean;
    headless?: boolean;
    network_idle?: boolean;
    timeout?: number;
  };
}

export interface ScrapeResponse<T = unknown> {
  success: boolean;
  profile?: string;
  profile_version?: string;
  status_code: number | null;
  data: T | null;
  error?: string;
}

export function isScraperEnabled(): boolean {
  return Boolean(env.SCRAPER_ENABLED && env.SCRAPER_URL && env.SCRAPER_API_KEY);
}

export async function callScraper<T = unknown>(req: ScrapeRequest): Promise<ScrapeResponse<T>> {
  if (!isScraperEnabled()) {
    return { success: false, status_code: null, data: null, error: 'Scraper disabled' };
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), env.SCRAPER_TIMEOUT_MS);

  try {
    const res = await fetch(`${env.SCRAPER_URL.replace(/\/$/, '')}/api/v1/scrape`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${env.SCRAPER_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        mode: 'stealthy',
        ...req,
      }),
      signal: controller.signal,
    });

    if (!res.ok) {
      return { success: false, status_code: res.status, data: null, error: `Scraper HTTP ${res.status}` };
    }

    return (await res.json()) as ScrapeResponse<T>;
  } catch (err: any) {
    return { success: false, status_code: null, data: null, error: err?.message ?? 'Scraper unreachable' };
  } finally {
    clearTimeout(timeout);
  }
}

export const scrapeGeoPage = (url: string) =>
  callScraper<any>({
    url,
    profile: 'geo-page',
    options: { solve_cloudflare: true, headless: true, network_idle: true, timeout: 90 },
  });

export const scrapeGeoRobots = (url: string) =>
  callScraper<any>({
    url,
    profile: 'geo-robots',
    options: { headless: true, timeout: 30 },
  });
