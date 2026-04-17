/**
 * AI Insights Service — @vps/shared-backend ortak AI altyapısını kullanır
 *
 * shared-backend/core/env.ts → GROQ_API_KEY, GROQ_MODEL, GROQ_API_BASE
 * shared-backend/modules/ai/content.ts → callAI pattern
 *
 * SADECE ücretli analizde çağrılır (runFullAnalysis).
 * Ücretsiz analizde bu servis hiç devreye girmez.
 *
 * Maliyet: rapor başına ~$0.003–0.008 (Groq paid tier, llama-3.3-70b)
 */

import { env as sharedEnv } from '@vps/shared-backend/core/env';

export interface Finding {
  severity: 'critical' | 'high' | 'medium' | 'low';
  title: string;
  description: string;
}

export interface AiInsights {
  /** AI arama motorlarındaki tahmini görünürlük skoru (0-100) */
  visibility_score: number;
  /** Marka/domain hakkında LLM'in ürettiği bağlam özeti */
  brand_context: string;
  /** Executive summary — PDF raporun ilk paragraphı (3-5 cümle) */
  executive_summary: string;
  /** Bu site için AI sonuçlarında çıkabilecek örnek sorgular */
  target_queries: string[];
  /** AI görünürlüğünün önündeki ana engeller */
  visibility_barriers: string[];
  /** Severity kategorili bulgular (PDF Key Findings bölümü) */
  findings: Finding[];
  /** Bu hafta uygulanabilir, yüksek etkili aksiyonlar */
  quick_wins: string[];
  /** Bu ay yapılacak orta vadeli iyileştirmeler */
  medium_term: string[];
  /** Bu çeyrek için stratejik inisiyatifler */
  strategic: string[];
  /** Geriye dönük uyumluluk — flat action plan (quick_wins+medium_term) */
  action_plan: string[];
  /** Schema/JSON-LD önerisi — sadece pro/expert paketlerde */
  schema_suggestion: string | null;
  /** Kullanılan model */
  model_used: string;
  /** Token kullanımı (maliyet takibi için) */
  usage: { input: number; output: number };
}

// ─── Groq çağrısı (shared-backend env üzerinden) ─────────────────────────────

async function callGroq(
  userPrompt: string,
  systemPrompt: string,
  opts: { maxTokens?: number; temperature?: number; jsonMode?: boolean } = {},
): Promise<{ content: string; usage: { input: number; output: number } }> {
  const apiKey = sharedEnv.GROQ_API_KEY;
  const model = sharedEnv.GROQ_MODEL;
  const base = sharedEnv.GROQ_API_BASE;

  if (!apiKey) throw new Error('GROQ_API_KEY tanımlı değil');

  const body: Record<string, any> = {
    model,
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ],
    max_tokens: opts.maxTokens ?? 900,
    temperature: opts.temperature ?? 0.3,
  };

  if (opts.jsonMode) {
    body.response_format = { type: 'json_object' };
  }

  const res = await fetch(`${base}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(45_000),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Groq API ${res.status}: ${err.slice(0, 200)}`);
  }

  const data = (await res.json()) as any;
  return {
    content: data?.choices?.[0]?.message?.content ?? '',
    usage: {
      input: data?.usage?.prompt_tokens ?? 0,
      output: data?.usage?.completion_tokens ?? 0,
    },
  };
}

function parseJson<T>(text: string, fallback: T): T {
  try { return JSON.parse(text) as T; } catch { /* ignore */ }
  const match = text.match(/```(?:json)?\s*([\s\S]*?)```/) ?? text.match(/(\{[\s\S]*\})/);
  if (match) { try { return JSON.parse(match[1].trim()) as T; } catch { /* ignore */ } }
  return fallback;
}

// ─── Adım 1: Görünürlük & Citability ────────────────────────────────────────

async function analyzeVisibility(params: {
  domain: string;
  title: string | null;
  meta_description: string | null;
  h1_count: number | null;
  has_schema: boolean;
  https_ok: boolean;
  performance_score: number | null;
  seo_score: number | null;
}) {
  const system = 'Sen bir GEO SEO uzmanısın. Yanıtlarını daima JSON formatında ver.';
  const user = `Web sitesi verilerine göre AI arama motorlarındaki görünürlüğü değerlendir.

Domain: ${params.domain}
Başlık: ${params.title ?? 'Belirtilmemiş'}
Meta Açıklama: ${params.meta_description ?? 'Eksik'}
H1 Sayısı: ${params.h1_count ?? 0}
Schema Markup: ${params.has_schema ? 'Mevcut' : 'Eksik'}
HTTPS: ${params.https_ok ? 'Aktif' : 'Eksik'}
Performans: ${params.performance_score ?? '?'}/100
SEO Skoru: ${params.seo_score ?? '?'}/100

Şu JSON formatında yanıt ver:
{
  "visibility_score": <0-100>,
  "brand_context": "<AI sistemlerin bu domain hakkında ne söyleyebileceğine dair 2-3 cümle>",
  "target_queries": ["<örnek sorgu 1>", "<örnek sorgu 2>", "<örnek sorgu 3>"],
  "visibility_barriers": ["<engel 1>", "<engel 2>", "<engel 3>"]
}`;

  const { content, usage } = await callGroq(user, system, { maxTokens: 700, jsonMode: true });
  const data = parseJson(content, {
    visibility_score: 50,
    brand_context: 'AI görünürlük analizi tamamlanamadı.',
    target_queries: [] as string[],
    visibility_barriers: [] as string[],
  });
  return { ...data, usage };
}

// ─── Adım 2: Executive Summary + Findings + Tiered Plan ─────────────────────

async function generateExecutiveSummary(params: {
  domain: string;
  geo_score: number;
  scores: Record<string, number | null>;
  brand_context: string;
  top_barriers: string[];
}) {
  const system = 'Sen bir GEO SEO uzmanısın. Profesyonel, müşteri odaklı içerik yaz. Yanıtlarını JSON formatında döndür.';
  const dimSummary = Object.entries(params.scores)
    .filter(([, v]) => v != null)
    .map(([k, v]) => `${k}=${v}`)
    .join(', ');
  const user = `Bu siteye dair PDF raporun Executive Summary bölümü için 4-6 cümlelik profesyonel Türkçe özet üret ve JSON olarak döndür.

Domain: ${params.domain}
Genel GEO Skor: ${params.geo_score}/100
Boyut Skorları: ${dimSummary}
Ana Engeller: ${params.top_barriers.slice(0, 3).join('; ') || 'Belirlenmedi'}

Kurallar:
- Müşteri odaklı, net, ticari dil
- İlk cümlede domain + iş tipi + genel skor
- 2 zayıf, 1 güçlü yan belirt
- Sonda quick wins ile ulaşılabilir hedef skor belirt (mevcut+15 gibi)
- Madde işareti kullanma, düzgün paragraf

{"executive_summary": "<tek paragraf>"}`;

  const { content, usage } = await callGroq(user, system, { maxTokens: 500, temperature: 0.3, jsonMode: true });
  const data = parseJson(content, { executive_summary: '' });
  return { executive_summary: data.executive_summary ?? '', usage };
}

async function generateFindings(params: {
  domain: string;
  title: string | null;
  description: string | null;
  h1_tags: string[];
  word_count: number;
  scores: Record<string, number | null>;
  performance_score: number | null;
  seo_score: number | null;
  lcp: string | null;
  schema_types: string[];
  missing_security_headers: string[];
  analytics_tools: string[];
  social_profiles_count: number;
  has_llmstxt: boolean;
  has_hreflang: boolean;
  lang_attribute: string | null;
  spf_ok: boolean | null;
  dmarc_ok: boolean | null;
  https_ok: boolean;
  sitemap_exists: boolean;
  crawler_blocks: string[];
}) {
  const system = `Sen deneyimli bir GEO SEO danışmanısın. Somut, müşteriye sunulabilir bulgular üret.

KURALLAR:
1. Her bulgu SİTEDEN GÖZLENEN GERÇEK bir veriye atıfta bulunsun (rakam, başlık metni, eksik schema tipi)
2. Generic cümleler YAZMA: "ai_citability düşük" ❌ | "Title tag 44 karakter, optimal 50-60 — SERP'te alan kaybı" ✓
3. "Fix:" somut adım (hangi dosya, hangi kod) | "Etki:" +X puan veya metrik iyileşmesi
4. Severity dağılımı: 2-4 critical, 3-5 high, 2-4 medium, 1-2 low
5. Türkçe yaz, teknik terimleri İngilizce bırak (hreflang, schema, LCP, JSON-LD)
6. Yanıtını JSON formatında döndür`;

  const scoreBrief = Object.entries(params.scores)
    .filter(([, v]) => v != null)
    .map(([k, v]) => `${k}=${v}`)
    .join(', ');

  const schemaList = params.schema_types.length > 0 ? params.schema_types.join(', ') : 'HİÇBİRİ';
  const essentialSchemas = ['Organization', 'WebSite', 'Person', 'BreadcrumbList', 'FAQPage'];
  const missingSchemas = essentialSchemas.filter(
    (s) => !params.schema_types.some((t) => t.toLowerCase().includes(s.toLowerCase())),
  );

  const user = `Aşağıdaki SİTE VERİSİNE dayalı somut bulgular üret (JSON):

== Genel ==
Domain: ${params.domain}
Title: ${params.title ? `"${params.title}" (${params.title.length} karakter)` : 'YOK'}
Meta Description: ${params.description ? `"${params.description.slice(0, 120)}${params.description.length > 120 ? '…' : ''}" (${params.description.length} karakter)` : 'YOK'}
H1 etiketleri: ${params.h1_tags.length === 0 ? 'YOK' : params.h1_tags.map((h) => `"${h}"`).join(' | ')}
Sayfa kelime sayısı: ${params.word_count}
HTML dil: ${params.lang_attribute ?? 'tanımsız'}

== Skorlar (0-100) ==
${scoreBrief}
Lighthouse Performance: ${params.performance_score ?? '?'}
Lighthouse SEO: ${params.seo_score ?? '?'}
LCP: ${params.lcp ?? 'ölçülemedi'}

== Structured Data (JSON-LD) ==
Mevcut schema tipleri: ${schemaList}
Eksik essential schemas: ${missingSchemas.length ? missingSchemas.join(', ') : 'yok (hepsi var)'}

== Teknik ==
HTTPS: ${params.https_ok ? 'OK' : 'YOK (kritik)'}
SPF: ${params.spf_ok ? 'var' : 'YOK'}
DMARC: ${params.dmarc_ok ? 'var' : 'YOK'}
hreflang: ${params.has_hreflang ? 'var' : 'YOK'}
Eksik security headers: ${params.missing_security_headers.length ? params.missing_security_headers.join(', ') : 'hepsi var'}
sitemap.xml: ${params.sitemap_exists ? 'var' : 'yok'}
llms.txt: ${params.has_llmstxt ? 'var' : 'yok'}

== AI Crawler Erişimi ==
Bloke edilen botlar: ${params.crawler_blocks.length ? params.crawler_blocks.join(', ') : 'yok'}

== Entity/Brand ==
Analytics araçları: ${params.analytics_tools.length ? params.analytics_tools.join(', ') : 'yok'}
Sosyal profil linkleri: ${params.social_profiles_count} adet

8-14 bulgu üret. Yukarıdaki RAKAMLARI ve METİNLERİ referans al.

ÖRNEK İYİ BULGU:
{"severity":"critical","title":"Homepage sadece 160 kelime — AI alıntılama imkansız","description":"AI sistemleri 134-167 kelimelik pasajları alıntılıyor. ${params.domain} homepage'de sadece ${params.word_count} kelime var. Fix: Tanım blokları, istatistikler ve FAQ ekleyin. Etki: +6 puan (AI Citability)"}

{"findings": [...]}`;

  const { content, usage } = await callGroq(user, system, { maxTokens: 3000, temperature: 0.35, jsonMode: true });
  const data = parseJson(content, { findings: [] as any[] });
  const findings: Finding[] = (Array.isArray(data.findings) ? data.findings : [])
    .filter((f: any) => f?.title && f?.description)
    .map((f: any) => ({
      severity: ['critical', 'high', 'medium', 'low'].includes(f.severity) ? f.severity : 'medium',
      title: String(f.title).slice(0, 100),
      description: String(f.description),
    }));
  return { findings, usage };
}

async function generateTieredPlan(params: {
  domain: string;
  findings: Finding[];
  scores: Record<string, number | null>;
}) {
  const system = `Sen deneyimli bir GEO SEO danışmanısın. Müşteriye sunulabilir aksiyon planı üret (JSON).

KURALLAR:
1. Her madde somut — "hangi dosya", "hangi kod", "hangi metrik" içersin
2. Findings'teki bulgulardan TÜRETİN — yeni genel tavsiye uydurma
3. Türkçe yaz; teknik terimleri (hreflang, schema, JSON-LD, Core Web Vitals, INP, LCP) orijinal bırak
4. Her maddeye "+X puan" veya etki notunu ekle (örn: "+4 puan AI Citability")
5. Yanıtını JSON formatında döndür`;

  const findingsDetail = params.findings.slice(0, 14).map((f) =>
    `[${f.severity.toUpperCase()}] ${f.title}\n  → ${f.description.slice(0, 200)}`,
  ).join('\n\n');

  const user = `Aşağıdaki BULGULARDAN yola çıkarak 3-katmanlı aksiyon planı üret (JSON).

Domain: ${params.domain}

Bulgular:
${findingsDetail}

Katmanlar:
- quick_wins: 4-6 madde — BU HAFTA yapılabilir, düşük efor, critical/high severity'den gelir
  Örnek: "robots.txt'den GPTBot Disallow kuralını kaldır — +3 puan Crawler Access"
- medium_term: 6-10 madde — BU AY, orta efor (içerik yazımı, schema markup, refactor)
  Örnek: "Person schema (JSON-LD) ekle — kurucu biyografisi + sosyal linkler — +3 puan E-E-A-T"
- strategic: 5-8 madde — BU ÇEYREK, uzun vadeli (marka otoritesi, içerik üretimi)
  Örnek: "YouTube kanalı aç — teknik tutorial serisi — +6 puan Brand Authority (AI korelasyonu 0.737)"

Her madde tek satır, somut eylem + skor etkisi.

{"quick_wins": [...], "medium_term": [...], "strategic": [...]}`;

  const { content, usage } = await callGroq(user, system, { maxTokens: 1600, temperature: 0.3, jsonMode: true });
  const data = parseJson(content, { quick_wins: [] as string[], medium_term: [] as string[], strategic: [] as string[] });
  return {
    quick_wins: Array.isArray(data.quick_wins) ? data.quick_wins : [],
    medium_term: Array.isArray(data.medium_term) ? data.medium_term : [],
    strategic: Array.isArray(data.strategic) ? data.strategic : [],
    usage,
  };
}

// ─── Adım 3: Schema Önerisi (Pro/Expert) ────────────────────────────────────

async function generateSchema(params: {
  domain: string;
  title: string | null;
  meta_description: string | null;
}) {
  const system = 'Sen bir structured data uzmanısın. Schema.org JSON-LD markup üretirsin.';
  const user = `Bu site için hazır kullanılabilir JSON-LD Schema markup üret.

Domain: ${params.domain}
Başlık: ${params.title ?? params.domain}
Açıklama: ${params.meta_description ?? 'Belirtilmemiş'}

Kurallar:
- <script type="application/ld+json"> tagı dahil yaz
- Minimum Organization + WebSite schema içermeli
- Gerçekçi veriler kullan, placeholder koyma
- Uygunsa FAQ/LocalBusiness/Service ekle

Sadece kod bloğunu döndür:`;

  const { content, usage } = await callGroq(user, system, { maxTokens: 900, temperature: 0.2 });
  return { schema_suggestion: content.trim(), usage };
}

// ─── Ana Fonksiyon ───────────────────────────────────────────────────────────

export async function runAiInsights(
  fullData: any,
  packageSlug: string,
): Promise<AiInsights | null> {
  if (!sharedEnv.GROQ_API_KEY || sharedEnv.GROQ_API_KEY === 'gsk_...') {
    console.warn('[AiInsights] GROQ_API_KEY tanımlı değil — AI analizi atlanıyor.');
    return null;
  }

  const domain = (() => {
    try {
      return new URL(fullData.url?.startsWith('http') ? fullData.url : `https://${fullData.url}`).hostname;
    } catch { return fullData.url ?? 'unknown'; }
  })();

  const page = fullData.page ?? {};
  const lh = fullData.lighthouse ?? {};
  const dns = fullData.dns ?? {};
  const cit = fullData.citability ?? {};

  // Lighthouse score 0-1 olabilir (PSI v5 bazen böyle dönüyor), bazen 0-100
  const lhScore = (raw: number | null | undefined): number | null => {
    if (raw == null) return null;
    return raw > 1 ? Math.round(raw) : Math.round(raw * 100);
  };

  const perfScore = lhScore(lh?.categories?.performance?.score);
  const seoScore = lhScore(lh?.categories?.seo?.score);
  const lcp = lh?.audits?.['largest-contentful-paint']?.displayValue ?? null;
  const scores = fullData.scores ?? {};
  const hasSchema = Array.isArray(page?.structured_data) && page.structured_data.length > 0;
  const httpsOk = page?.is_https === true;
  const spfOk = dns?.spf?.exists ?? null;

  let totalInput = 0;
  let totalOutput = 0;

  try {
    const v = await analyzeVisibility({
      domain,
      title: page.title ?? null,
      meta_description: page.description ?? null,
      h1_count: Array.isArray(page.h1_tags) ? page.h1_tags.length : null,
      has_schema: hasSchema,
      https_ok: httpsOk,
      performance_score: perfScore,
      seo_score: seoScore,
    });
    totalInput += v.usage.input;
    totalOutput += v.usage.output;

    const exec = await generateExecutiveSummary({
      domain,
      geo_score: fullData.geo_score ?? 50,
      scores,
      brand_context: v.brand_context,
      top_barriers: v.visibility_barriers,
    });
    totalInput += exec.usage.input;
    totalOutput += exec.usage.output;

    const securityHeaderKeys = [
      'Strict-Transport-Security', 'Content-Security-Policy', 'X-Frame-Options',
      'X-Content-Type-Options', 'Referrer-Policy', 'Permissions-Policy',
    ];
    const secHeaders = page?.security_headers ?? {};
    const missingSecurityHeaders = securityHeaderKeys.filter((k) => !secHeaders[k]);

    const schemaTypes: string[] = Array.isArray(page?.structured_data)
      ? page.structured_data
          .map((s: any) => s?.['@type'])
          .flat()
          .filter(Boolean)
          .map((t: any) => String(t))
      : [];

    const crawlerAccess = fullData.crawler_access ?? {};
    const crawlerBlocks: string[] = Object.entries(crawlerAccess)
      .filter(([, v]: any) => v?.status === 'Blocked' || v?.status === 'Restricted')
      .map(([k]) => k);

    const f = await generateFindings({
      domain,
      title: page?.title ?? null,
      description: page?.description ?? null,
      h1_tags: Array.isArray(page?.h1_tags) ? page.h1_tags : [],
      word_count: page?.word_count ?? 0,
      scores,
      performance_score: perfScore,
      seo_score: seoScore,
      lcp,
      schema_types: schemaTypes,
      missing_security_headers: missingSecurityHeaders,
      analytics_tools: Array.isArray(page?.analytics_tools) ? page.analytics_tools : [],
      social_profiles_count: Array.isArray(page?.social_profiles) ? page.social_profiles.length : 0,
      has_llmstxt: fullData.llmstxt?.exists === true,
      has_hreflang: page?.has_hreflang === true,
      lang_attribute: page?.lang_attribute ?? null,
      spf_ok: spfOk,
      dmarc_ok: dns?.dmarc?.exists ?? null,
      https_ok: httpsOk,
      sitemap_exists: Array.isArray(fullData.robots?.sitemaps) && fullData.robots.sitemaps.length > 0,
      crawler_blocks: crawlerBlocks,
    });
    totalInput += f.usage.input;
    totalOutput += f.usage.output;

    const plan = await generateTieredPlan({
      domain,
      findings: f.findings,
      scores,
    });
    totalInput += plan.usage.input;
    totalOutput += plan.usage.output;

    let schema_suggestion: string | null = null;
    if (['pro', 'expert'].includes(packageSlug)) {
      const s = await generateSchema({
        domain,
        title: page.title ?? null,
        meta_description: page.description ?? null,
      });
      schema_suggestion = s.schema_suggestion;
      totalInput += s.usage.input;
      totalOutput += s.usage.output;
    }

    console.log(`[AiInsights] ✓ ${domain} pkg:${packageSlug} tokens:${totalInput}in/${totalOutput}out findings:${f.findings.length}`);

    return {
      visibility_score: v.visibility_score,
      brand_context: v.brand_context,
      executive_summary: exec.executive_summary,
      target_queries: v.target_queries,
      visibility_barriers: v.visibility_barriers,
      findings: f.findings,
      quick_wins: plan.quick_wins,
      medium_term: plan.medium_term,
      strategic: plan.strategic,
      action_plan: [...plan.quick_wins, ...plan.medium_term].slice(0, 10),
      schema_suggestion,
      model_used: sharedEnv.GROQ_MODEL,
      usage: { input: totalInput, output: totalOutput },
    };
  } catch (err: any) {
    console.error('[AiInsights] LLM analizi başarısız:', err?.message);
    return null;
  }
}
