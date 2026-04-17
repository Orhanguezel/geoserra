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
      lighthouse: normalizeLighthouse(lighthouse.status === 'fulfilled' ? lighthouse.value.data : null),
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
      lighthouse: normalizeLighthouse(extractResult(lighthouse)),
      page: extractResult(page),
      dns: extractResult(dns),
      performance: extractResult(performance),
      citability: extractResult(citability),
      brand: extractResult(brand),
      keywords: extractResult(keywords),
      llmstxt: extractResult(llmstxt),
    };

    // 6-boyutlu skor + platform readiness hesapla
    const dimensions = computeDimensions(fullData, 'full');
    fullData.geo_score = calculateGeoScore(dimensions);
    (fullData as any).scores = dimensions;
    (fullData as any).platforms = computePlatformReadiness(dimensions);

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

/**
 * lighthouse_checker.py `strategies.mobile|desktop.categories` yapısında
 * output veriyor. Scoring logic doğrudan `categories` bekliyor, bu yüzden
 * mobile stratejisini root'a flatten ediyoruz (mobile yoksa desktop fallback).
 */
function normalizeLighthouse(raw: any): any {
  if (!raw) return null;
  // Zaten düz yapıdaysa (test amaçlı fallback) dokunma
  if (raw.categories) return raw;
  const strategy = raw.strategies?.mobile ?? raw.strategies?.desktop;
  if (!strategy) return raw;
  return {
    ...raw,
    categories: strategy.categories,
    audits: strategy.audits,
    core_web_vitals: strategy.core_web_vitals,
    lighthouse_score: strategy.overall_score ?? raw.overall_lighthouse_score,
  };
}

// ─── 6-Boyutlu GEO Scoring ──────────────────────────────────────────────────
// Referans: GEO-REPORT-guezelwebdesign.pdf modelı
// Weights: AI Citability 25% | Brand 20% | E-E-A-T 20% | Technical 15% | Schema 10% | Platform 10%

const WEIGHTS = {
  ai_citability: 0.25,
  brand_authority: 0.20,
  content_eeat: 0.20,
  technical: 0.15,
  schema: 0.10,
  platform_optimization: 0.10,
} as const;

interface DimensionScores {
  ai_citability: number | null;
  brand_authority: number | null;
  content_eeat: number | null;
  technical: number | null;
  schema: number | null;
  platform_optimization: number | null;
}

/** AI Citability — sayfanın AI tarafından alıntılanabilirliği */
function scoreAiCitability(data: any, tier: 'free' | 'full'): number | null {
  // Full tier: citability_scorer.py puan döndürür
  const citabilityScore = data.citability?.average_citability_score;
  if (tier === 'full' && typeof citabilityScore === 'number') {
    return Math.round(citabilityScore);
  }

  // Free tier heuristic: content & structure sinyalleri
  const page = data.page;
  if (!page) return null;

  let score = 0;
  const title = page.title;
  const desc = page.description;
  const wordCount = page.word_count ?? 0;
  const h1Count = Array.isArray(page.h1_tags) ? page.h1_tags.length : 0;
  const hasStructuredData = Array.isArray(page.structured_data) && page.structured_data.length > 0;
  const headingCount = Array.isArray(page.heading_structure) ? page.heading_structure.length : 0;

  if (title && title.length >= 30 && title.length <= 70) score += 20;
  else if (title) score += 10;

  if (desc && desc.length >= 120 && desc.length <= 160) score += 15;
  else if (desc) score += 8;

  if (h1Count === 1) score += 15;
  else if (h1Count > 1) score += 8;

  if (wordCount >= 500) score += 25;
  else if (wordCount >= 200) score += 12;
  else if (wordCount > 0) score += 5;

  if (headingCount >= 5) score += 10;
  else if (headingCount >= 2) score += 5;

  if (hasStructuredData) score += 15;

  return Math.min(100, score);
}

/** Brand Authority — marka otoritesi (full tier only) */
function scoreBrandAuthority(data: any, tier: 'free' | 'full'): number | null {
  if (tier === 'free') return null; // Free tier brand scan yapmıyor

  const brand = data.brand;
  if (!brand) return null;

  // brand_scanner.py platform presence sayar; skorlama ağırlıklı ortalamadır
  const platforms = brand.platforms ?? {};
  let score = 0;
  const weights = { youtube: 30, reddit: 20, wikipedia: 20, linkedin: 15, other: 15 };

  for (const [key, weight] of Object.entries(weights)) {
    const p = platforms[key];
    if (!p) continue;
    if (p.has_channel || p.mentioned_in_videos || p.has_profile || p.mentioned) {
      score += weight;
    } else if (p.exists) {
      score += weight * 0.3;
    }
  }

  return Math.min(100, Math.round(score));
}

/** Content E-E-A-T */
function scoreContentEEAT(data: any): number | null {
  const page = data.page;
  if (!page) return null;

  let score = 0;
  const wordCount = page.word_count ?? 0;
  const structuredData = Array.isArray(page.structured_data) ? page.structured_data : [];
  const types = structuredData.map((s: any) => (s?.['@type'] ?? '').toString().toLowerCase());
  const hasAuthor = types.some((t: string) => t.includes('person') || t.includes('author'));
  const hasOrg = types.some((t: string) => t.includes('organization'));
  const hasArticle = types.some((t: string) => t.includes('article') || t.includes('blogposting'));
  const hasContactInfo = Array.isArray(page.social_profiles) && page.social_profiles.length > 0;
  const hasHreflang = page.has_hreflang === true;
  const langOk = !!page.lang_attribute;

  // Experience: word depth
  if (wordCount >= 1000) score += 25;
  else if (wordCount >= 500) score += 15;
  else if (wordCount >= 200) score += 7;

  // Expertise: author/organization schema
  if (hasAuthor) score += 15;
  if (hasOrg) score += 10;
  if (hasArticle) score += 10;

  // Authoritativeness: social profiles, hreflang
  if (hasContactInfo) score += 15;
  if (hasHreflang) score += 10;

  // Trustworthiness: lang consistency
  if (langOk) score += 15;

  return Math.min(100, score);
}

/** Technical Foundations */
function scoreTechnical(data: any): number | null {
  const lighthouse = data.lighthouse;
  const page = data.page;
  const dns = data.dns;
  if (!lighthouse && !page && !dns) return null;

  let score = 0;
  let maxScore = 0;

  // Lighthouse best-practices + accessibility (20 each)
  const bp = lighthouse?.categories?.['best-practices']?.score ?? lighthouse?.categories?.best_practices?.score;
  if (bp != null) { score += bp * 20; maxScore += 20; }

  const a11y = lighthouse?.categories?.accessibility?.score;
  if (a11y != null) { score += a11y * 15; maxScore += 15; }

  // HTTPS (15)
  const isHttps = page?.is_https === true;
  if (page) { score += isHttps ? 15 : 0; maxScore += 15; }

  // Security headers (20)
  const secHeaders = page?.security_headers ?? {};
  if (page) {
    const headerKeys = [
      'Strict-Transport-Security',
      'Content-Security-Policy',
      'X-Frame-Options',
      'X-Content-Type-Options',
      'Referrer-Policy',
      'Permissions-Policy',
    ];
    const present = headerKeys.filter((k) => !!secHeaders[k]).length;
    score += (present / headerKeys.length) * 20;
    maxScore += 20;
  }

  // DNS email security (15)
  const dnsScore = dns?.summary?.email_security_score;
  if (typeof dnsScore === 'number') { score += (dnsScore / 100) * 15; maxScore += 15; }

  // SSR / has content (15)
  const hasSsr = page?.has_ssr_content !== false && (page?.word_count ?? 0) > 50;
  if (page) { score += hasSsr ? 15 : 0; maxScore += 15; }

  if (maxScore === 0) return null;
  return Math.round((score / maxScore) * 100);
}

/** Schema & Structured Data */
function scoreSchema(data: any): number | null {
  const page = data.page;
  if (!page) return null;

  const structured = Array.isArray(page.structured_data) ? page.structured_data : [];
  if (structured.length === 0) return 0;

  const types = new Set<string>(
    structured.map((s: any) => (s?.['@type'] ?? '').toString().toLowerCase()).filter(Boolean),
  );

  // Essential schemas (10 each)
  const essentials = ['organization', 'website'];
  const recommended = ['person', 'breadcrumblist', 'faqpage', 'article', 'blogposting'];
  const advanced = ['localbusiness', 'product', 'service', 'softwareapplication'];

  let score = 0;
  const hasAny = (typeSet: Set<string>, check: string) =>
    [...typeSet].some((t) => t.includes(check));

  for (const t of essentials) if (hasAny(types, t)) score += 20;
  for (const t of recommended) if (hasAny(types, t)) score += 10;
  for (const t of advanced) if (hasAny(types, t)) score += 5;

  // OG tags (10)
  if (page.og_tags && Object.keys(page.og_tags).length >= 4) score += 10;

  return Math.min(100, score);
}

/** Platform Optimization — 5 AI platform için birleşik hazırlık */
function scorePlatformOptimization(data: any): number | null {
  const page = data.page;
  const lh = data.lighthouse;
  if (!page && !lh) return null;

  let score = 0;
  let max = 0;

  // SSR content (AIO + ChatGPT için kritik)
  const hasSsr = page?.has_ssr_content !== false && (page?.word_count ?? 0) > 50;
  if (page) { score += hasSsr ? 25 : 0; max += 25; }

  // SEO Lighthouse score (Bing, AIO, Gemini)
  const seo = lh?.categories?.seo?.score;
  if (seo != null) { score += seo * 25; max += 25; }

  // Schema presence (tüm platformlar)
  const hasSchema = Array.isArray(page?.structured_data) && page.structured_data.length > 0;
  if (page) { score += hasSchema ? 20 : 0; max += 20; }

  // llms.txt (Perplexity, ChatGPT — early adopter advantage)
  const llmstxtExists = data.llmstxt?.exists === true;
  if (data.llmstxt != null) { score += llmstxtExists ? 15 : 0; max += 15; }

  // hreflang (multilingual AI matching)
  const hreflangOk = page?.has_hreflang === true;
  if (page) { score += hreflangOk ? 15 : 0; max += 15; }

  if (max === 0) return null;
  return Math.round((score / max) * 100);
}

/** Tüm boyutları hesapla */
function computeDimensions(data: any, tier: 'free' | 'full'): DimensionScores {
  return {
    ai_citability: scoreAiCitability(data, tier),
    brand_authority: scoreBrandAuthority(data, tier),
    content_eeat: scoreContentEEAT(data),
    technical: scoreTechnical(data),
    schema: scoreSchema(data),
    platform_optimization: scorePlatformOptimization(data),
  };
}

/** Ağırlıklı ortalama — null dimensions ağırlık dağıtılarak skip edilir */
function calculateGeoScore(dimensions: DimensionScores): number {
  let totalWeighted = 0;
  let totalWeight = 0;

  for (const [key, weight] of Object.entries(WEIGHTS)) {
    const score = dimensions[key as keyof DimensionScores];
    if (score != null) {
      totalWeighted += score * weight;
      totalWeight += weight;
    }
  }

  if (totalWeight === 0) return 0;
  return Math.round(totalWeighted / totalWeight);
}

/** 5 AI platform için okunabilirlik skorları (dimensions'tan türetilir) */
function computePlatformReadiness(dimensions: DimensionScores): Record<string, number> {
  const tech = dimensions.technical ?? 0;
  const cite = dimensions.ai_citability ?? 0;
  const schema = dimensions.schema ?? 0;
  const eeat = dimensions.content_eeat ?? 0;
  const platform = dimensions.platform_optimization ?? 0;

  return {
    'Google AI Overviews': Math.round(tech * 0.3 + schema * 0.3 + cite * 0.2 + eeat * 0.2),
    'ChatGPT Web Search': Math.round(cite * 0.4 + tech * 0.3 + eeat * 0.3),
    'Perplexity AI': Math.round(cite * 0.35 + schema * 0.25 + tech * 0.25 + platform * 0.15),
    'Google Gemini': Math.round(tech * 0.3 + schema * 0.3 + cite * 0.2 + eeat * 0.2),
    'Bing Copilot': Math.round(tech * 0.4 + schema * 0.3 + cite * 0.3),
  };
}

/** Ücretsiz versiyon için kısıtlı özet — artık gerçek veri */
function extractFreeData(raw: any): any {
  const dimensions = computeDimensions(raw, 'free');
  const geo_score = calculateGeoScore(dimensions);
  const platforms = computePlatformReadiness(dimensions);

  const perf = raw.lighthouse?.categories?.performance?.score;
  const seo = raw.lighthouse?.categories?.seo?.score;
  const lcp = raw.lighthouse?.audits?.['largest-contentful-paint']?.displayValue;
  const title = raw.page?.title;
  const metaDesc = raw.page?.description;
  const h1Count = Array.isArray(raw.page?.h1_tags) ? raw.page.h1_tags.length : 0;
  const isHttps = raw.page?.is_https === true;
  const spf = raw.dns?.spf?.exists === true;

  return {
    geo_score,
    scores: dimensions,
    platforms,
    performance_score: perf != null ? Math.round(perf * 100) : null,
    seo_score: seo != null ? Math.round(seo * 100) : null,
    lcp,
    has_title: !!title,
    has_meta_description: !!metaDesc,
    h1_count: h1Count,
    https_ok: isHttps,
    spf_ok: spf,
    top_issues: buildTopIssues({ perf, seo, isHttps, title, metaDesc, lcp, spf, dimensions }),
    generated_at: new Date().toISOString(),
    is_limited: true,
  };
}

function buildTopIssues(d: any): string[] {
  const issues: string[] = [];
  if (d.perf != null && d.perf < 0.5) issues.push('Sayfa performansı düşük (LCP sorunları)');
  if (d.seo != null && d.seo < 0.7) issues.push('SEO skoru yetersiz');
  if (!d.isHttps) issues.push('HTTPS yapılandırması eksik');
  if (!d.title) issues.push('Sayfa başlığı (title) eksik');
  if (!d.metaDesc) issues.push('Meta açıklama eksik');
  if (!d.spf) issues.push('SPF e-posta güvenlik kaydı eksik');
  const techScore = d.dimensions?.technical;
  if (techScore != null && techScore < 50) issues.push('Güvenlik header\'ları eksik');
  const schemaScore = d.dimensions?.schema;
  if (schemaScore != null && schemaScore < 30) issues.push('Structured data minimum — Organization/Person eksik');
  return issues.slice(0, 6);
}

export const AnalysisService = { runFreeAnalysis, runFullAnalysis };
