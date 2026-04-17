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
    // Domain + brand name extraction (brand_scanner.py bu ikisini ayrı ayrı bekliyor)
    const parsedUrl = (() => {
      try { return new URL(url.startsWith('http') ? url : `https://${url}`); }
      catch { return null; }
    })();
    const domain = parsedUrl?.hostname?.replace(/^www\./, '') ?? url;
    const brandName = domain.split('.')[0];
    const titleCaseBrand = brandName.charAt(0).toUpperCase() + brandName.slice(1);

    const [lighthouse, page, dns, performance, citability, brand, keywords, llmstxt, robots] =
      await Promise.allSettled([
        runPythonScript('lighthouse_checker.py', [url, '--strategy', 'both', ...(env.GOOGLE_PSI_API_KEY ? ['--api-key', env.GOOGLE_PSI_API_KEY] : [])]),
        runPythonScript('fetch_page.py', [url]),
        runPythonScript('dns_checker.py', [url]),
        runPythonScript('performance_analyzer.py', [url]),
        runPythonScript('citability_scorer.py', [url]),
        runPythonScript('brand_scanner.py', [titleCaseBrand, domain]),
        runPythonScript('keyword_analyzer.py', [url]),
        runPythonScript('llmstxt_generator.py', [url, '--check-only']),
        runPythonScript('fetch_page.py', [url, 'robots']),
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
    (fullData as any).robots = extractResult(robots);

    // 6-boyutlu skor + platform readiness hesapla
    const dimensions = computeDimensions(fullData, 'full');
    fullData.geo_score = calculateGeoScore(dimensions);
    (fullData as any).scores = dimensions;
    (fullData as any).platforms = computePlatformReadiness(dimensions);
    (fullData as any).crawler_access = buildCrawlerAccess((fullData as any).robots);

    // AI Insights — Groq LLM ile görünürlük analizi + findings + aksiyon planı
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

    // PDF üret — generate_pdf_report.py schema'ya map
    const pdfData = buildPdfData(fullData, aiInsights);
    const pdfPath = await PdfService.generatePdf(analysisId, pdfData);

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
      performanceScore: (() => {
        const p = lhNorm((fullData.lighthouse as any)?.categories?.performance?.score);
        return p != null ? Math.round(p * 100) : null;
      })(),
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

/**
 * Brand Authority — marka otoritesi (full tier only).
 *
 * brand_scanner.py otomatik sorgu yapan alanlar:
 * - wikipedia.has_wikipedia_page, has_wikidata_entry, wikipedia_search_results
 *   (Wikipedia API ile gerçek sorgu)
 * - youtube/reddit/linkedin: sadece presence flag'leri (çoğu zaman false döner)
 *
 * Ağırlıklar (referans PDF): YouTube 30, Reddit 20, Wikipedia 20, LinkedIn 15, Other 15
 * Scoring: her platformda 2+ sinyal varsa tam puan, 1 sinyal = %50, yoksa 0
 */
function scoreBrandAuthority(data: any, tier: 'free' | 'full'): number | null {
  if (tier === 'free') return null;

  const brand = data.brand;
  if (!brand) return null;

  const platforms = brand.platforms ?? {};
  const yt = platforms.youtube ?? {};
  const rd = platforms.reddit ?? {};
  const wk = platforms.wikipedia ?? {};
  const li = platforms.linkedin ?? {};
  const other = platforms.other?.platforms_checked ?? {};

  // Her platform için sinyal sayısı
  const ytSignals = (yt.has_channel ? 1 : 0) + (yt.mentioned_in_videos ? 1 : 0);
  const rdSignals = (rd.has_subreddit ? 1 : 0) + (rd.mentioned_in_discussions ? 1 : 0);
  const wkSignals = (wk.has_wikipedia_page ? 1 : 0) + (wk.has_wikidata_entry ? 1 : 0)
    + (wk.cited_in_articles ? 1 : 0)
    + ((wk.wikipedia_search_results ?? 0) > 3 ? 1 : 0);
  const liSignals = (li.has_company_page ? 1 : 0) + (li.employee_thought_leadership ? 1 : 0);
  const otherPlatforms = Object.keys(other).length;
  // Other: sadece search URL'ler var — presence skor vermiyoruz, sadece mevcudiyet

  const fullScore = (signals: number, max: number, weight: number): number => {
    if (signals <= 0) return 0;
    const ratio = Math.min(1, signals / max);
    return weight * ratio;
  };

  let score = 0;
  score += fullScore(ytSignals, 2, 30);
  score += fullScore(rdSignals, 2, 20);
  score += fullScore(wkSignals, 3, 20); // Wikipedia en önemli sinyal — max 3 sinyalde doyum
  score += fullScore(liSignals, 2, 15);
  score += otherPlatforms > 0 ? 5 : 0; // 6 diğer platform search-ready = base puan

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

/**
 * Lighthouse category score'unu 0-1 aralığına normalize eder.
 * lighthouse_checker.py 0-100 aralığında döndürüyor ama bazı PSI versiyonları 0-1 döndürebilir.
 */
function lhNorm(score: number | undefined | null): number | null {
  if (score == null) return null;
  return score > 1 ? score / 100 : score;
}

/** Technical Foundations */
function scoreTechnical(data: any): number | null {
  const lighthouse = data.lighthouse;
  const page = data.page;
  const dns = data.dns;
  if (!lighthouse && !page && !dns) return null;

  let score = 0;
  let maxScore = 0;

  // Lighthouse best-practices (20) + accessibility (15) — score 0-1 aralığında
  const bp = lhNorm(lighthouse?.categories?.['best-practices']?.score ?? lighthouse?.categories?.best_practices?.score);
  if (bp != null) { score += bp * 20; maxScore += 20; }

  const a11y = lhNorm(lighthouse?.categories?.accessibility?.score);
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

  // SEO Lighthouse score (Bing, AIO, Gemini) — normalize to 0-1
  const seo = lhNorm(lh?.categories?.seo?.score);
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

  const perf = lhNorm(raw.lighthouse?.categories?.performance?.score);
  const seo = lhNorm(raw.lighthouse?.categories?.seo?.score);
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

// ─── AI Crawler Access Map ──────────────────────────────────────────────────
// AI bot → platform mapping (PDF raporunun Crawler Access tablosu için)

const AI_CRAWLER_PLATFORMS: Record<string, string> = {
  'GPTBot':            'ChatGPT (OpenAI)',
  'OAI-SearchBot':     'ChatGPT Search',
  'ChatGPT-User':      'ChatGPT User Agent',
  'ClaudeBot':         'Claude (Anthropic)',
  'anthropic-ai':      'Claude (legacy)',
  'PerplexityBot':     'Perplexity AI',
  'CCBot':             'Common Crawl (multi-AI)',
  'Bytespider':        'ByteDance/Doubao',
  'cohere-ai':         'Cohere',
  'Google-Extended':   'Google Gemini / AI Overviews',
  'GoogleOther':       'Google AI (research)',
  'Applebot-Extended': 'Apple Intelligence',
  'FacebookBot':       'Meta AI',
  'Amazonbot':         'Amazon AI',
};

function buildCrawlerAccess(robots: any): Record<string, { platform: string; status: string; recommendation: string }> {
  const result: Record<string, { platform: string; status: string; recommendation: string }> = {};
  const botStatuses: Record<string, string> = robots?.ai_crawler_status ?? {};

  for (const [bot, platform] of Object.entries(AI_CRAWLER_PLATFORMS)) {
    const raw = botStatuses[bot] ?? 'NOT_MENTIONED';
    let status: string;
    let recommendation: string;

    switch (raw) {
      case 'BLOCKED':
      case 'BLOCKED_BY_WILDCARD':
        status = 'Blocked';
        recommendation = `${bot} engelli — robots.txt'de Disallow kuralını kaldırın`;
        break;
      case 'PARTIALLY_BLOCKED':
        status = 'Restricted';
        recommendation = `${bot} kısmen engelli — kritik sayfaların erişilebilir olduğunu doğrulayın`;
        break;
      case 'ALLOWED':
      case 'ALLOWED_BY_DEFAULT':
      case 'NOT_MENTIONED':
      case 'NO_ROBOTS_TXT':
        status = 'Allowed';
        recommendation = 'Erişim açık';
        break;
      default:
        status = 'Unknown';
        recommendation = 'Durum belirlenemedi';
    }

    result[bot] = { platform, status, recommendation };
  }

  return result;
}

// ─── PDF Data Builder ───────────────────────────────────────────────────────
// generate_pdf_report.py'nin beklediği şemaya dönüştürür

function extractBrandName(url: string, page: any): string {
  if (page?.og_tags?.['og:site_name']) return page.og_tags['og:site_name'];
  if (page?.title) {
    // Title'ın ilk kısmı (|, —, - öncesi)
    const parts = page.title.split(/[\|—–\-]/);
    const cleaned = parts[0]?.trim();
    if (cleaned && cleaned.length < 60) return cleaned;
  }
  try {
    const u = new URL(url.startsWith('http') ? url : `https://${url}`);
    const host = u.hostname.replace(/^www\./, '');
    const base = host.split('.')[0];
    return base.charAt(0).toUpperCase() + base.slice(1);
  } catch {
    return url;
  }
}

function buildRuleBasedFindings(dimensions: DimensionScores, page: any, dns: any, lh: any): any[] {
  const findings: any[] = [];

  if (dimensions.schema != null && dimensions.schema < 30) {
    findings.push({
      severity: 'critical',
      title: 'Structured Data eksik — AI alıntılama sınırlı',
      description: 'Organization, Person veya Article JSON-LD markup bulunamadı. AI sistemleri yapılandırılmış veri ile entity tanıyabiliyor. Fix: Organization + Person + WebSite schemalarını ekleyin. Etki: +6 puan.',
    });
  }
  if (page?.is_https === false) {
    findings.push({
      severity: 'critical',
      title: 'HTTPS yok — Güvenlik açığı',
      description: 'Site HTTP üzerinden sunuluyor. Tarayıcılar güvensiz uyarısı veriyor, AI sistemleri güvenilir kaynak olarak görmüyor. Fix: Let\'s Encrypt ile SSL sertifikası kurun. Etki: Domain otoritesi.',
    });
  }
  const perf = lh?.categories?.performance?.score;
  const perfNum = perf != null && perf > 1 ? perf : perf != null ? perf * 100 : null;
  if (perfNum != null && perfNum < 50) {
    findings.push({
      severity: 'high',
      title: `Performans skoru düşük (${Math.round(perfNum)}/100)`,
      description: 'LCP ve TBT metrikleri zayıf. Yavaş sayfalar AI crawlerlar için timeout riski oluşturuyor. Fix: Görselleri optimize edin, JS bundle boyutunu düşürün, CDN kullanın. Etki: +5 puan.',
    });
  }
  const secHeaders = page?.security_headers ?? {};
  const headerKeys = ['Strict-Transport-Security', 'Content-Security-Policy', 'X-Frame-Options'];
  const missing = headerKeys.filter((k) => !secHeaders[k]);
  if (missing.length > 0) {
    findings.push({
      severity: 'high',
      title: `${missing.length} güvenlik header eksik`,
      description: `Eksik: ${missing.join(', ')}. Fix: Nginx/web sunucusu konfigürasyonuna ekleyin. Etki: Güvenlik sinyali +2 puan.`,
    });
  }
  if (!dns?.spf?.exists) {
    findings.push({
      severity: 'medium',
      title: 'SPF kaydı yok',
      description: 'Email spoofing mümkün. Domain otoritesi düşüyor. Fix: DNS TXT kaydına SPF ekleyin. Etki: Domain güvenilirliği.',
    });
  }
  if (page?.has_hreflang === false) {
    findings.push({
      severity: 'medium',
      title: 'hreflang tag yok',
      description: 'Çoklu dil desteği varsa SEO için kritik. Fix: Her dil sayfasına hreflang + x-default ekleyin. Etki: +3 puan (çoklu dilli siteler için).',
    });
  }
  if ((page?.word_count ?? 0) < 300) {
    findings.push({
      severity: 'high',
      title: `İçerik yetersiz (${page?.word_count ?? 0} kelime)`,
      description: 'AI sistemleri alıntılama için 300+ kelime aranıyor. Homepage 500+ kelime ideal. Fix: Tanım blokları, istatistikler ve FAQ ekleyin. Etki: +6 puan.',
    });
  }
  return findings;
}

function buildPdfData(fullData: any, aiInsights: any): any {
  const url = fullData.url;
  const page = fullData.page ?? {};
  const dimensions = fullData.scores ?? {};

  return {
    url,
    brand_name: extractBrandName(url, page),
    date: new Date().toISOString().slice(0, 10),
    geo_score: fullData.geo_score ?? 0,
    scores: {
      ai_citability:         dimensions.ai_citability ?? 0,
      brand_authority:       dimensions.brand_authority ?? 0,
      content_eeat:          dimensions.content_eeat ?? 0,
      technical:             dimensions.technical ?? 0,
      schema:                dimensions.schema ?? 0,
      platform_optimization: dimensions.platform_optimization ?? 0,
    },
    platforms: fullData.platforms ?? {},
    crawler_access: fullData.crawler_access ?? {},
    executive_summary: aiInsights?.executive_summary ?? '',
    findings: aiInsights?.findings?.length
      ? aiInsights.findings
      : buildRuleBasedFindings(dimensions, page, fullData.dns, fullData.lighthouse),
    quick_wins: aiInsights?.quick_wins ?? [],
    medium_term: aiInsights?.medium_term ?? [],
    strategic: aiInsights?.strategic ?? [],
    // Ek referanslar — PDF isterse kullanır
    ai_insights: aiInsights,
    raw: {
      lighthouse: fullData.lighthouse,
      page: fullData.page,
      dns: fullData.dns,
      citability: fullData.citability,
    },
  };
}

export const AnalysisService = { runFreeAnalysis, runFullAnalysis };
