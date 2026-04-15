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

export interface AiInsights {
  /** AI arama motorlarındaki tahmini görünürlük skoru (0-100) */
  visibility_score: number;
  /** Marka/domain hakkında LLM'in ürettiği bağlam özeti */
  brand_context: string;
  /** Bu site için AI sonuçlarında çıkabilecek örnek sorgular */
  target_queries: string[];
  /** AI görünürlüğünün önündeki ana engeller */
  visibility_barriers: string[];
  /** Siteye özel, önceliklendirilmiş aksiyon planı (Türkçe) */
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

// ─── Adım 2: Aksiyon Planı ───────────────────────────────────────────────────

async function generateActionPlan(params: {
  domain: string;
  geo_score: number;
  performance_score: number | null;
  seo_score: number | null;
  visibility_score: number;
  visibility_barriers: string[];
  has_schema: boolean;
  https_ok: boolean;
  spf_ok: boolean | null;
  lcp: string | null;
  top_issues: string[];
}) {
  const system = 'Sen bir GEO SEO uzmanısın. Yanıtlarını daima JSON formatında ver.';
  const user = `Bu web sitesi için kişiselleştirilmiş ve önceliklendirilmiş aksiyon planı hazırla.

Domain: ${params.domain}
GEO Skor: ${params.geo_score}/100
AI Görünürlük: ${params.visibility_score}/100
Performans: ${params.performance_score ?? '?'}/100
SEO: ${params.seo_score ?? '?'}/100
LCP: ${params.lcp ?? 'ölçülemedi'}
Schema: ${params.has_schema ? 'Var' : 'Eksik'}
HTTPS: ${params.https_ok ? 'OK' : 'Eksik'}
SPF: ${params.spf_ok ? 'OK' : 'Eksik'}
AI Engelleri: ${params.visibility_barriers.join('; ') || '-'}
Sorunlar: ${params.top_issues.join('; ') || '-'}

Tam olarak 10 maddelik, somut ve uygulanabilir aksiyon planı üret.
Türkçe yaz, öncelik sırasına göre sırala (en yüksek AI etkisi → en düşük).

{"action_plan": ["1. madde", "2. madde", ..., "10. madde"]}`;

  const { content, usage } = await callGroq(user, system, { maxTokens: 1100, temperature: 0.4, jsonMode: true });
  const data = parseJson(content, { action_plan: [] as string[] });
  return {
    action_plan: Array.isArray(data.action_plan) ? data.action_plan : [],
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

  const perfScore = lh?.categories?.performance?.score != null
    ? Math.round(lh.categories.performance.score * 100) : null;
  const seoScore = lh?.categories?.seo?.score != null
    ? Math.round(lh.categories.seo.score * 100) : null;
  const lcp = lh?.audits?.['largest-contentful-paint']?.displayValue ?? null;

  let totalInput = 0;
  let totalOutput = 0;

  try {
    const v = await analyzeVisibility({
      domain,
      title: page.title ?? null,
      meta_description: page.meta_description ?? null,
      h1_count: page.h1_count ?? null,
      has_schema: !!(cit?.has_schema ?? page?.has_schema),
      https_ok: dns?.https ?? false,
      performance_score: perfScore,
      seo_score: seoScore,
    });
    totalInput += v.usage.input;
    totalOutput += v.usage.output;

    const a = await generateActionPlan({
      domain,
      geo_score: fullData.geo_score ?? 50,
      performance_score: perfScore,
      seo_score: seoScore,
      visibility_score: v.visibility_score,
      visibility_barriers: v.visibility_barriers,
      has_schema: !!(cit?.has_schema ?? page?.has_schema),
      https_ok: dns?.https ?? false,
      spf_ok: dns?.spf ?? null,
      lcp,
      top_issues: fullData.top_issues ?? [],
    });
    totalInput += a.usage.input;
    totalOutput += a.usage.output;

    let schema_suggestion: string | null = null;
    if (['pro', 'expert'].includes(packageSlug)) {
      const s = await generateSchema({
        domain,
        title: page.title ?? null,
        meta_description: page.meta_description ?? null,
      });
      schema_suggestion = s.schema_suggestion;
      totalInput += s.usage.input;
      totalOutput += s.usage.output;
    }

    console.log(`[AiInsights] ✓ ${domain} pkg:${packageSlug} tokens:${totalInput}in/${totalOutput}out`);

    return {
      visibility_score: v.visibility_score,
      brand_context: v.brand_context,
      target_queries: v.target_queries,
      visibility_barriers: v.visibility_barriers,
      action_plan: a.action_plan,
      schema_suggestion,
      model_used: sharedEnv.GROQ_MODEL,
      usage: { input: totalInput, output: totalOutput },
    };
  } catch (err: any) {
    console.error('[AiInsights] LLM analizi başarısız:', err?.message);
    return null;
  }
}
