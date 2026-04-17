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
  const system = 'Sen bir GEO SEO uzmanısın. Profesyonel, müşteri odaklı içerik yaz.';
  const dimSummary = Object.entries(params.scores)
    .filter(([, v]) => v != null)
    .map(([k, v]) => `${k}=${v}`)
    .join(', ');
  const user = `Bu siteye dair PDF raporun Executive Summary bölümü için 4-6 cümlelik profesyonel Türkçe özet yaz.

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
  scores: Record<string, number | null>;
  performance_score: number | null;
  seo_score: number | null;
  has_schema: boolean;
  https_ok: boolean;
  spf_ok: boolean | null;
  has_hreflang: boolean;
  security_headers_present: number;
  word_count: number;
  has_llmstxt: boolean;
}) {
  const system = 'Sen bir GEO SEO uzmanısın. Somut, uygulanabilir teknik bulgular üret. Daima JSON döndür.';
  const user = `Aşağıdaki site verileri için severity kategorili bulgular listesi üret.

Domain: ${params.domain}
Skorlar: ${JSON.stringify(params.scores)}
Performans: ${params.performance_score ?? '?'}/100
SEO: ${params.seo_score ?? '?'}/100
Schema: ${params.has_schema ? 'Var' : 'Yok'}
HTTPS: ${params.https_ok ? 'OK' : 'Eksik'}
SPF: ${params.spf_ok ? 'OK' : 'Eksik'}
hreflang: ${params.has_hreflang ? 'Var' : 'Yok'}
Security Headers: ${params.security_headers_present}/6 mevcut
Kelime sayısı: ${params.word_count}
llms.txt: ${params.has_llmstxt ? 'Var' : 'Yok'}

8-14 adet bulgu üret, her biri:
- severity: "critical" | "high" | "medium" | "low"
- title: kısa başlık (60 karakter sınırı, Türkçe)
- description: 2-3 cümle açıklama + "Fix:" ile nasıl düzeltilir + "Etki:" ile skor kazancı (Türkçe)

Severity dağılımı: 2-4 critical, 3-5 high, 2-4 medium, 1-2 low.
Somut ol — generic tavsiyeler verme.

{"findings": [{"severity":"...", "title":"...", "description":"..."}]}`;

  const { content, usage } = await callGroq(user, system, { maxTokens: 2500, temperature: 0.3, jsonMode: true });
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
  const system = 'Sen bir GEO SEO uzmanısın. Öncelik sıralı aksiyon planı üret.';
  const findingsBrief = params.findings.slice(0, 10).map((f) => `[${f.severity}] ${f.title}`).join('\n');

  const user = `Aşağıdaki bulgulara göre 3-katmanlı aksiyon planı üret (Türkçe, somut maddeler).

Domain: ${params.domain}
Bulgular:
${findingsBrief}

Kurallar:
- quick_wins: 4-6 madde — bu hafta, düşük efor, critical/high severity'den
- medium_term: 6-10 madde — bu ay, orta efor
- strategic: 5-8 madde — bu çeyrek, uzun vadeli
- Her madde tek satır, "+X puan" veya "Etki:..." eklenebilir

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
    const secPresent = securityHeaderKeys.filter((k) => !!secHeaders[k]).length;

    const f = await generateFindings({
      domain,
      scores,
      performance_score: perfScore,
      seo_score: seoScore,
      has_schema: hasSchema,
      https_ok: httpsOk,
      spf_ok: spfOk,
      has_hreflang: page?.has_hreflang === true,
      security_headers_present: secPresent,
      word_count: page?.word_count ?? 0,
      has_llmstxt: fullData.llmstxt?.exists === true,
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
