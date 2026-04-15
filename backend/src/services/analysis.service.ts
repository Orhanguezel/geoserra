import path from 'node:path';
import fs from 'node:fs';
import { env } from '@/core/env';
import { repoUpdateAnalysis, repoGetAnalysisById } from '@/modules/analyses/repository';
import { PdfService } from './pdf.service';
import { sendAnalysisCompleteEmail } from './mail.service';
import { runAiInsights } from './ai-insights.service';

interface ScriptResult {
  success: boolean;
  data?: any;
  error?: string;
}

interface FullAnalysisData {
  url: string;
  generated_at: string;
  lighthouse: any;
  page: any;
  dns: any;
  performance: any;
  citability: any;
  brand: any;
  keywords: any;
  llmstxt: any;
  geo_score?: number;
  ai_insights?: any;
}

/**
 * Python scriptlerini Bun.spawn ile çalıştırır.
 * geo-seo-claude/scripts/ → backend/python/ symlink veya kopyalanmış olmalı.
 */
async function runPythonScript(scriptName: string, args: string[]): Promise<ScriptResult> {
  const scriptsDir = path.resolve(process.cwd(), env.PYTHON_SCRIPTS_DIR);
  const scriptPath = path.join(scriptsDir, scriptName);

  if (!fs.existsSync(scriptPath)) {
    return { success: false, error: `Script bulunamadı: ${scriptPath}` };
  }

  try {
    const proc = globalThis.Bun.spawn([env.PYTHON_BIN, scriptPath, ...args], {
      stdout: 'pipe',
      stderr: 'pipe',
      env: { ...process.env, PYTHONUNBUFFERED: '1' },
    });

    const [stdout, _stderr] = await Promise.all([
      new Response(proc.stdout).text(),
      new Response(proc.stderr).text(),
    ]);

    await proc.exited;

    if (proc.exitCode !== 0) {
      return { success: false, error: `Script hata kodu: ${proc.exitCode}` };
    }

    const data = JSON.parse(stdout.trim());
    return { success: true, data };
  } catch (err: any) {
    return { success: false, error: err?.message ?? 'Script çalıştırılamadı' };
  }
}

/** Ücretsiz analiz — hızlı 3 script (lighthouse, fetch, dns) */
async function runFreeAnalysis(analysisId: string, url: string): Promise<void> {
  try {
    const [lighthouse, page, dns] = await Promise.allSettled([
      runPythonScript('lighthouse_checker.py', [url, '--strategy', 'mobile', ...(env.GOOGLE_PSI_API_KEY ? ['--api-key', env.GOOGLE_PSI_API_KEY] : [])]),
      runPythonScript('fetch_page.py', [url]),
      runPythonScript('dns_checker.py', [url]),
    ]);

    const freeData = {
      lighthouse: lighthouse.status === 'fulfilled' ? lighthouse.value.data : null,
      page: page.status === 'fulfilled' ? page.value.data : null,
      dns: dns.status === 'fulfilled' ? dns.value.data : null,
      generated_at: new Date().toISOString(),
    };

    // Kısıtlı veri — sadece özet bilgiler
    const limitedData = extractFreeData(freeData);

    await repoUpdateAnalysis(analysisId, {
      status: 'completed',
      free_data: limitedData,
      completed_at: new Date(),
    });

    // Analiz tamamlandı e-postası
    const saved = await repoGetAnalysisById(analysisId);
    if (saved?.email) {
      sendAnalysisCompleteEmail({
        to: saved.email,
        domain: saved.domain,
        geoScore: (limitedData as any)?.geo_score ?? null,
        performanceScore: (limitedData as any)?.performance_score ?? null,
        pdfUrl: null,
        analysisId,
      }).catch(() => {});
    }
  } catch (err: any) {
    await repoUpdateAnalysis(analysisId, {
      status: 'failed',
      error_message: err?.message ?? 'Analiz başarısız',
    });
  }
}

/** Tam ücretli analiz — tüm scriptler */
async function runFullAnalysis(analysisId: string, url: string, email: string): Promise<void> {
  try {
    const [lighthouse, page, dns, performance, citability, brand, keywords, llmstxt] =
      await Promise.allSettled([
        runPythonScript('lighthouse_checker.py', [url, '--strategy', 'both', ...(env.GOOGLE_PSI_API_KEY ? ['--api-key', env.GOOGLE_PSI_API_KEY] : [])]),
        runPythonScript('fetch_page.py', [url]),
        runPythonScript('dns_checker.py', [url]),
        runPythonScript('performance_analyzer.py', [url]),
        runPythonScript('citability_scorer.py', [url]),
        runPythonScript('brand_scanner.py', [url]),
        runPythonScript('keyword_analyzer.py', [url]),
        runPythonScript('llmstxt_generator.py', [url, '--check-only']),
      ]);

    const fullData: FullAnalysisData = {
      url,
      generated_at: new Date().toISOString(),
      lighthouse: extractResult(lighthouse),
      page: extractResult(page),
      dns: extractResult(dns),
      performance: extractResult(performance),
      citability: extractResult(citability),
      brand: extractResult(brand),
      keywords: extractResult(keywords),
      llmstxt: extractResult(llmstxt),
    };

    // GEO skoru hesapla
    fullData.geo_score = calculateGeoScore(fullData);

    // AI Insights — Groq LLM ile görünürlük analizi + aksiyon planı
    // Paket slug'ını analysis kaydından alıyoruz
    const analysisRecord = await repoGetAnalysisById(analysisId);
    const packageSlug = analysisRecord?.package_slug ?? 'starter';
    const aiInsights = await runAiInsights(fullData, packageSlug);
    if (aiInsights) {
      fullData.ai_insights = aiInsights;
      // AI görünürlük skorunu GEO skoruna dahil et (ağırlık: %20)
      if (typeof fullData.geo_score === 'number') {
        fullData.geo_score = Math.round(fullData.geo_score * 0.8 + aiInsights.visibility_score * 0.2);
      }
    }

    // PDF üret
    const pdfPath = await PdfService.generatePdf(analysisId, fullData);

    await repoUpdateAnalysis(analysisId, {
      status: 'completed',
      full_data: fullData,
      pdf_path: pdfPath,
      completed_at: new Date(),
    });

    await repoUpdateAnalysis(analysisId, { pdf_sent_at: new Date() });

    // Analiz tamamlandı e-postası (PDF linki ile)
    const publicPdfUrl = pdfPath ? `${env.PUBLIC_URL}/reports/${path.basename(pdfPath)}` : null;
    sendAnalysisCompleteEmail({
      to: email,
      domain: new URL(url.startsWith('http') ? url : `https://${url}`).hostname,
      geoScore: fullData.geo_score ?? null,
      performanceScore: (fullData.lighthouse as any)?.categories?.performance?.score != null
        ? Math.round((fullData.lighthouse as any).categories.performance.score * 100)
        : null,
      pdfUrl: publicPdfUrl,
      analysisId,
    }).catch(() => {});
  } catch (err: any) {
    await repoUpdateAnalysis(analysisId, {
      status: 'failed',
      error_message: err?.message ?? 'Tam analiz başarısız',
    });
  }
}

// ─── Helpers ────────────────────────────────────────────────────────────────

function extractResult(settled: PromiseSettledResult<ScriptResult>): any {
  if (settled.status === 'fulfilled' && settled.value.success) {
    return settled.value.data;
  }
  return null;
}

/** Ücretsiz versiyon için kısıtlı özet */
function extractFreeData(raw: any): any {
  const perf = raw.lighthouse?.categories?.performance?.score;
  const seo = raw.lighthouse?.categories?.seo?.score;
  const lcp = raw.lighthouse?.audits?.['largest-contentful-paint']?.displayValue;
  const title = raw.page?.title;
  const metaDesc = raw.page?.meta_description;
  const h1Count = raw.page?.h1_count;
  const httpsOk = raw.dns?.https;
  const spf = raw.dns?.spf;

  const geo_score = Math.round(
    ((perf ?? 0.5) * 25 + (seo ?? 0.5) * 25 + (httpsOk ? 1 : 0.5) * 25 + (title ? 1 : 0.5) * 25) * 100,
  ) / 100;

  return {
    geo_score,
    performance_score: perf ? Math.round(perf * 100) : null,
    seo_score: seo ? Math.round(seo * 100) : null,
    lcp,
    has_title: !!title,
    has_meta_description: !!metaDesc,
    h1_count: h1Count,
    https_ok: httpsOk,
    spf_ok: spf,
    top_issues: buildTopIssues({ perf, seo, httpsOk, title, metaDesc, lcp }),
    generated_at: new Date().toISOString(),
    is_limited: true,
  };
}

function buildTopIssues(data: any): string[] {
  const issues: string[] = [];
  if (data.perf < 0.5) issues.push('Sayfa performansı düşük (LCP sorunları)');
  if (data.seo < 0.7) issues.push('SEO skoru yetersiz');
  if (!data.httpsOk) issues.push('HTTPS yapılandırması eksik');
  if (!data.title) issues.push('Sayfa başlığı (title) eksik');
  if (!data.metaDesc) issues.push('Meta açıklama eksik');
  if (!data.spf) issues.push('SPF e-posta güvenlik kaydı eksik');
  return issues.slice(0, 5);
}

function calculateGeoScore(data: any): number {
  let total = 0;
  let count = 0;

  const perf = data.lighthouse?.categories?.performance?.score;
  const seo = data.lighthouse?.categories?.seo?.score;
  const citability = data.citability?.score;
  const dns_score = data.dns?.score;

  if (perf != null) { total += perf * 100 * 0.25; count++; }
  if (seo != null) { total += seo * 100 * 0.25; count++; }
  if (citability != null) { total += citability * 0.25; count++; }
  if (dns_score != null) { total += dns_score * 0.25; count++; }

  return count > 0 ? Math.round(total / (count * 0.25)) : 50;
}

export const AnalysisService = { runFreeAnalysis, runFullAnalysis };
