#!/usr/bin/env bun
import fs from 'node:fs';
import path from 'node:path';
import { scrapeGeoPage } from '../src/services/scraperClient';
import { env } from '../src/core/env';

type ScriptResult = { success: boolean; data?: unknown; error?: string };

const DEFAULT_URLS = [
  'https://example.com',
  'https://react.dev',
  'https://wordpress.org',
  'https://www.google.com',
  'https://geoserra.com',
];

function parseArgs(): { urls: string[]; output: string } {
  const args = process.argv.slice(2);
  const urlsArg = args.find((arg) => arg.startsWith('--urls='))?.split('=', 2)[1];
  const output = args.find((arg) => arg.startsWith('--output='))?.split('=', 2)[1] ?? 'diff-report.json';
  if (!urlsArg) return { urls: DEFAULT_URLS, output };

  const urlFile = path.resolve(process.cwd(), urlsArg);
  const urls = fs.readFileSync(urlFile, 'utf8')
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line && !line.startsWith('#'));
  return { urls, output };
}

function assertScraperConfigured(): void {
  if (!env.SCRAPER_ENABLED || !env.SCRAPER_URL || !env.SCRAPER_API_KEY) {
    console.error(
      [
        'Scrapling comparison requires SCRAPER_ENABLED=true, SCRAPER_URL and SCRAPER_API_KEY.',
        'Example:',
        '  SCRAPER_ENABLED=true SCRAPER_URL=http://127.0.0.1:8200 SCRAPER_API_KEY=... bun run scripts/compare-scrapers.ts',
      ].join('\n'),
    );
    process.exit(2);
  }
}

async function runLegacyFetchPage(url: string): Promise<ScriptResult> {
  const scriptPath = path.resolve(process.cwd(), env.PYTHON_SCRIPTS_DIR, 'fetch_page.py');
  const proc = Bun.spawn([env.PYTHON_BIN, scriptPath, url], {
    stdout: 'pipe',
    stderr: 'pipe',
    env: { ...process.env, PYTHONUNBUFFERED: '1' },
  });

  const [stdout, stderr] = await Promise.all([
    new Response(proc.stdout).text(),
    new Response(proc.stderr).text(),
  ]);
  await proc.exited;

  if (proc.exitCode !== 0) {
    return { success: false, error: stderr.slice(0, 500) || `exit ${proc.exitCode}` };
  }

  try {
    return { success: true, data: JSON.parse(stdout.trim()) };
  } catch (err: any) {
    return { success: false, error: err?.message ?? 'JSON parse failed' };
  }
}

function deepDiff(a: any, b: any, currentPath = '$'): string[] {
  const diffs: string[] = [];
  const keys = new Set([...Object.keys(a ?? {}), ...Object.keys(b ?? {})]);

  for (const key of keys) {
    const nextPath = `${currentPath}.${key}`;
    const left = a?.[key];
    const right = b?.[key];

    if (typeof left !== typeof right) {
      diffs.push(`${nextPath}: type ${typeof left} vs ${typeof right}`);
      continue;
    }
    if (Array.isArray(left) && Array.isArray(right)) {
      if (left.length !== right.length) diffs.push(`${nextPath}: length ${left.length} vs ${right.length}`);
      continue;
    }
    if (typeof left === 'object' && left !== null && right !== null) {
      diffs.push(...deepDiff(left, right, nextPath));
      continue;
    }
    if (left !== right) {
      diffs.push(`${nextPath}: ${JSON.stringify(left)} -> ${JSON.stringify(right)}`);
    }
  }

  return diffs;
}

function isToleratedCriticalDiff(diff: string, legacyData: any, scraperData: any): boolean {
  if (diff.startsWith('$.word_count:')) {
    const legacy = Number(legacyData?.word_count ?? 0);
    const modern = Number(scraperData?.word_count ?? 0);
    if (!Number.isFinite(legacy) || !Number.isFinite(modern)) return false;
    const base = Math.max(legacy, 1);
    return Math.abs(legacy - modern) / base <= 0.05;
  }
  return false;
}

const CRITICAL_FIELDS = [
  'is_https',
  'title',
  'description',
  'h1_tags',
  'word_count',
  'structured_data',
  'has_hreflang',
  'lang_attribute',
  'og_tags',
  'security_headers',
];

const { urls, output } = parseArgs();
const report = [];
assertScraperConfigured();

for (const url of urls) {
  console.log(`Testing ${url}...`);
  const [legacy, modern] = await Promise.all([runLegacyFetchPage(url), scrapeGeoPage(url)]);
  const modernData = modern.success ? modern.data : null;
  const diffs = legacy.success && modernData ? deepDiff(legacy.data, modernData) : [];
  const criticalDiffs = diffs.filter((diff) => (
    CRITICAL_FIELDS.some((field) => diff.startsWith(`$.${field}`))
    && !isToleratedCriticalDiff(diff, legacy.data, modernData)
  ));
  report.push({
    url,
    legacy_success: legacy.success,
    scraper_success: modern.success,
    legacy_error: legacy.error ?? null,
    scraper_error: modern.error ?? null,
    diff_count: diffs.length,
    critical_diff_count: criticalDiffs.length,
    critical_diffs: criticalDiffs.slice(0, 50),
    diffs: diffs.slice(0, 200),
  });
}

fs.writeFileSync(path.resolve(process.cwd(), output), JSON.stringify(report, null, 2));
console.log(`Report written to ${output}`);
