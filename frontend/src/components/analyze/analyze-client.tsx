'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Loader2, AlertCircle, Lock, Bot, Shield, BarChart3, FileSearch, Globe, Layers, CheckCheck, Search, Zap, FileCheck } from 'lucide-react';
import Link from 'next/link';
import { t } from '@/lib/t';
import { useLocaleStore } from '@/stores/locale-store';
import { startFreeAnalysis, getAnalysisStatus } from '@/lib/api';
import type { AnalysisStatus } from '@/lib/api';

type UIState = 'idle' | 'submitting' | 'polling' | 'done' | 'locked' | 'error';

export function AnalyzeClient() {
  const locale = useLocaleStore((s) => s.locale);
  const [url, setUrl] = useState('');
  const [email, setEmail] = useState('');
  const [uiState, setUiState] = useState<UIState>('idle');
  const [errorMsg, setErrorMsg] = useState('');
  const [result, setResult] = useState<AnalysisStatus | null>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const urlParam = new URLSearchParams(window.location.search).get('url');
    if (urlParam) setUrl(urlParam);
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setUiState('submitting');
    setErrorMsg('');
    try {
      const data = await startFreeAnalysis(url.trim(), email.trim());
      setUiState('polling');
      startPolling(data.analysis_id);
    } catch (err: any) {
      const msg = err?.response?.data?.message ?? '';
      if (msg.toLowerCase().includes('lock') || msg.toLowerCase().includes('used')) {
        setUiState('locked');
      } else {
        setErrorMsg(t('analyze.error_generic', {}, locale));
        setUiState('error');
      }
    }
  }

  function startPolling(id: string) {
    pollRef.current = setInterval(async () => {
      try {
        const status = await getAnalysisStatus(id);
        if (status.status === 'free' || status.status === 'completed') {
          clearInterval(pollRef.current!);
          setResult(status);
          setUiState('done');
        } else if (status.status === 'failed') {
          clearInterval(pollRef.current!);
          setErrorMsg(t('analyze.error_generic', {}, locale));
          setUiState('error');
        }
      } catch {
        // keep polling
      }
    }, 3000);
  }

  return (
    <main className="min-h-screen py-20 md:py-28">
      <div className="container max-w-2xl">
        <div className="mb-10 text-center">
          <h1 className="text-3xl font-bold md:text-4xl">{t('analyze.title', {}, locale)}</h1>
          <p className="mt-3 text-muted-foreground">{t('analyze.subtitle', {}, locale)}</p>
        </div>

        <AnimatePresence mode="wait">
          {(uiState === 'idle' || uiState === 'submitting' || uiState === 'error') && (
            <motion.form
              key="form"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              onSubmit={handleSubmit}
              className="rounded-2xl border border-border bg-card p-6 space-y-4"
            >
              <div>
                <label className="mb-1.5 block text-sm font-medium">{t('analyze.url_label', {}, locale)}</label>
                <input
                  type="url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder={t('analyze.url_placeholder', {}, locale)}
                  required
                  className="w-full rounded-lg border border-border bg-muted/50 px-4 py-2.5 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 transition-colors"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium">{t('analyze.email_label', {}, locale)}</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t('analyze.email_placeholder', {}, locale)}
                  className="w-full rounded-lg border border-border bg-muted/50 px-4 py-2.5 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 transition-colors"
                />
                <p className="mt-1.5 text-xs text-muted-foreground">{t('analyze.email_hint', {}, locale)}</p>
              </div>

              {uiState === 'error' && (
                <div className="flex items-center gap-2 rounded-lg bg-destructive/10 px-4 py-3 text-sm text-destructive">
                  <AlertCircle size={14} />
                  {errorMsg}
                </div>
              )}

              <button
                type="submit"
                disabled={uiState === 'submitting' || !url}
                className="group flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3 font-semibold text-primary-foreground transition-all hover:opacity-90 disabled:opacity-60"
              >
                {uiState === 'submitting' ? (
                  <><Loader2 size={16} className="animate-spin" /> {t('analyze.submitting', {}, locale)}</>
                ) : (
                  <>{t('analyze.submit', {}, locale)} <ArrowRight size={16} className="transition-transform group-hover:translate-x-0.5" /></>
                )}
              </button>
            </motion.form>
          )}

          {uiState === 'polling' && (
            <motion.div
              key="polling"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-2xl border border-border bg-card p-10 text-center space-y-4"
            >
              <Loader2 size={40} className="mx-auto animate-spin text-primary" />
              <p className="font-semibold">{t('analyze.processing', {}, locale)}</p>
              <p className="text-sm text-muted-foreground">{t('analyze.processing_hint', {}, locale)}</p>
            </motion.div>
          )}

          {uiState === 'locked' && (
            <motion.div
              key="locked"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-2xl border border-amber-500/30 bg-amber-500/5 p-8 text-center space-y-4"
            >
              <Lock size={36} className="mx-auto text-amber-400" />
              <p className="font-semibold">{t('analyze.domain_locked', {}, locale)}</p>
              <p className="text-sm text-muted-foreground">{t('analyze.domain_locked_hint', {}, locale)}</p>
              <Link
                href="/pricing"
                className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-90 transition-all"
              >
                {t('analyze.upgrade_cta', {}, locale)} <ArrowRight size={14} />
              </Link>
            </motion.div>
          )}

          {uiState === 'done' && result?.free_data && (
            <FreeResults data={result.free_data} locale={locale} domain={result.domain} />
          )}
        </AnimatePresence>

        {/* Ne Ölçülür */}
        <div className="mt-16 mb-10 rounded-2xl border border-border bg-card p-6">
          <h2 className="mb-2 text-base font-semibold">Analiz Ne Ölçer?</h2>
          <p className="mb-5 text-sm text-muted-foreground leading-6">
            GeoSerra, sitenizi altı bağımsız kategoride değerlendirerek tek bir GEO skoru üretir.
            Her kategori farklı bir AI veya arama sinyalini temsil eder.
          </p>
          <div className="grid gap-3 sm:grid-cols-2">
            {[
              { icon: Bot, label: 'AI Citability & Visibility', weight: '%25', desc: 'ChatGPT, Gemini, Perplexity ve Bing Copilot\'un sitenizi alıntılayıp alıntılamadığını ve llms.txt, robots.txt erişim kurallarını kontrol eder.', color: 'text-cyan-400' },
              { icon: Globe, label: 'Brand Authority Signals', weight: '%20', desc: 'sameAs bağlantıları, sosyal medya varlığı, Wikipedia referansları ve backlink profilini analiz eder. Marka güvenilirliği için temel sinyaller.', color: 'text-amber-400' },
              { icon: FileSearch, label: 'Content Quality & E-E-A-T', weight: '%20', desc: 'İçerik derinliği, yazar uzmanlığı (Experience, Expertise, Authoritativeness, Trustworthiness) ve güvenilirlik sinyallerini değerlendirir.', color: 'text-violet-400' },
              { icon: Zap, label: 'Technical Foundations', weight: '%15', desc: 'TTFB, Core Web Vitals (LCP, CLS, INP), sunucu taraflı render kalitesi ve sayfa hız metriklerini Lighthouse ile ölçer.', color: 'text-emerald-400' },
              { icon: Layers, label: 'Structured Data', weight: '%10', desc: 'JSON-LD schema doğruluğunu, FAQPage, Product, Organization, Person ve BreadcrumbList markup varlığını doğrular.', color: 'text-rose-400' },
              { icon: Shield, label: 'Platform Optimization', weight: '%10', desc: 'robots.txt, sitemap.xml, canonical URL, hreflang yapılandırması, HSTS ve güvenlik header\'larını inceler.', color: 'text-sky-400' },
            ].map(({ icon: Icon, label, weight, desc, color }) => (
              <div key={label} className="flex items-start gap-3 rounded-xl border border-border bg-muted/20 p-4">
                <div className={`mt-0.5 shrink-0 ${color}`}><Icon size={16} /></div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-foreground">{label}</p>
                    <span className="rounded-full bg-muted px-1.5 py-0.5 text-[10px] font-bold font-mono text-muted-foreground">{weight}</span>
                  </div>
                  <p className="mt-1 text-xs leading-5 text-muted-foreground">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Nasıl Çalışır */}
        <div className="mb-10 rounded-2xl border border-border bg-card p-6">
          <h2 className="mb-5 text-base font-semibold">Nasıl Çalışır?</h2>
          <div className="space-y-4">
            {[
              { icon: Search, step: '1', title: 'URL Girin', desc: 'Analiz etmek istediğiniz web sitesinin adresini girin. https:// ile başlayan tam URL gereklidir. Ücretsiz analizde her domain için bir kez kullanım hakkı tanınır.', color: 'text-emerald-400' },
              { icon: BarChart3, step: '2', title: 'Otomatik Analiz Başlar', desc: 'Sistem arka planda Lighthouse testi, schema doğrulama, DNS/SSL kontrolü, brand signal taraması ve AI crawler erişim kontrollerini paralel olarak yürütür. Ortalama süre 30-60 saniyedir.', color: 'text-cyan-400' },
              { icon: FileCheck, step: '3', title: 'GEO Skoru Hesaplanır', desc: 'Altı kategoriden elde edilen ham veriler ağırlıklı formülle birleştirilir. Her kategori kendi alt metriklerini 0-100 arasında skorlar; genel GEO skoru bu skorların ağırlıklı ortalamasıdır.', color: 'text-amber-400' },
              { icon: CheckCheck, step: '4', title: 'Sonuçlar ve Öncelikli Aksiyonlar', desc: 'Ücretsiz raporda genel GEO skoru, Lighthouse performans puanı ve en kritik 5 sorun gösterilir. Ücretli raporlarda tüm kategoriler, kategori bazlı öneri listesi ve indirilebilir PDF sunulur.', color: 'text-violet-400' },
            ].map(({ icon: Icon, step, title, desc, color }) => (
              <div key={step} className="flex gap-4">
                <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-muted ${color}`}>
                  <Icon size={15} />
                </div>
                <div>
                  <p className="text-sm font-semibold">{step}. {title}</p>
                  <p className="mt-1 text-sm text-muted-foreground leading-6">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Skor Referans Tablosu */}
        <div className="mb-10 rounded-2xl border border-border bg-card p-6">
          <h2 className="mb-2 text-base font-semibold">Skor Ne Anlama Gelir?</h2>
          <p className="mb-5 text-sm text-muted-foreground leading-6">
            GEO skoru 0-100 arasında bir sayıdır. Sektör ortalaması 45-55 bandında seyrediyor.
            Aşağıdaki tabloya göre sitenizin konumunu değerlendirin:
          </p>
          <div className="grid gap-2 sm:grid-cols-2">
            {[
              { range: '0 – 40', label: 'Kritik', desc: 'AI sistemleri bu siteyi büyük olasılıkla görmüyor. Temel teknik sorunlar mevcut.', color: 'text-red-400 bg-red-500/10 border-red-500/20' },
              { range: '41 – 60', label: 'Ortalama Altı', desc: 'Bazı kategoriler iyi, ama AI görünürlüğü yetersiz. İyileştirme fırsatı yüksek.', color: 'text-amber-400 bg-amber-500/10 border-amber-500/20' },
              { range: '61 – 75', label: 'Ortalama', desc: 'Temel GEO sinyalleri mevcut. Rakipler arasında görünürlük için daha fazlası gerekiyor.', color: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20' },
              { range: '76 – 90', label: 'İyi', desc: 'AI sistemleri bu siteyi büyük olasılıkla buluyor ve alıntılıyor. Öne çıkma fırsatları var.', color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' },
              { range: '91 – 100', label: 'Mükemmel', desc: 'Sektörde en üst segment. AI ve arama görünürlüğünde güçlü bir otorite sinyali.', color: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20' },
            ].map(({ range, label, desc, color }) => (
              <div key={range} className={`flex items-start gap-3 rounded-xl border p-4 ${color}`}>
                <span className="shrink-0 rounded-full px-2 py-0.5 text-xs font-bold font-mono">{range}</span>
                <div>
                  <p className="text-sm font-semibold">{label}</p>
                  <p className="mt-0.5 text-xs leading-5 opacity-80">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* SSS */}
        <div className="mb-10 rounded-2xl border border-border bg-card p-6">
          <h2 className="mb-5 text-base font-semibold">Sıkça Sorulan Sorular</h2>
          <div className="space-y-4">
            {[
              { q: 'Ücretsiz analiz ile ücretli analiz arasındaki fark nedir?', a: 'Ücretsiz analiz, genel GEO skoru, Lighthouse performans puanı ve en kritik 5 sorunu gösterir. Ücretli rapor; AI Citability, Schema, E-E-A-T, Brand Authority detaylarını, öncelikli aksiyon planını ve indirilebilir PDF\'i içerir.' },
              { q: 'Analiz kaç saniyede tamamlanır?', a: 'Çoğu site için 30-60 saniye yeterlidir. Yüklenmesi yavaş siteler veya karmaşık teknik yapılar 90 saniyeye kadar sürebilir.' },
              { q: 'Sonuçlar ne kadar süre geçerlidir?', a: 'GEO skoru anlık bir ölçümdür. SEO ve GEO değişkenleri hızla değiştiğinden, site önemli değişiklikler aldığında yeniden analiz önerilir.' },
              { q: 'Rakibimin sitesini analiz edebilir miyim?', a: 'Evet. Herhangi bir public URL girebilirsiniz. Rakip analizi, kendi sitenizle karşılaştırma yapmanızı sağlar.' },
            ].map(({ q, a }) => (
              <div key={q} className="rounded-xl border border-border bg-muted/20 p-4">
                <p className="text-sm font-semibold text-foreground">{q}</p>
                <p className="mt-2 text-sm text-muted-foreground leading-6">{a}</p>
              </div>
            ))}
          </div>
        </div>

      </div>
    </main>
  );
}

function FreeResults({ data, locale, domain }: { data: any; locale: 'tr' | 'en'; domain: string }) {
  const geoScore: number = data?.geo_score ?? 0;
  const perfScore: number = data?.performance_score ?? 0;
  const seoScore: number = data?.seo_score ?? 0;
  const issues: string[] = data?.top_issues ?? [];

  return (
    <motion.div
      key="results"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8"
    >
      <div className="rounded-3xl border border-white/5 bg-card p-8 md:p-10">
        <div className="mb-8 flex items-center justify-between">
          <h2 className="text-xl font-bold text-white">{t('analyze.free_result_title', {}, locale)}</h2>
          <div className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-emerald-500">
            {locale === 'tr' ? 'Ucretsiz Surum' : 'Free Tier'}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          <ScoreRing label={t('analyze.geo_score', {}, locale)} score={geoScore} big />
          <ScoreRing label={t('analyze.performance', {}, locale)} score={perfScore} />
          <ScoreRing label={t('analyze.seo', {}, locale)} score={seoScore} />
        </div>
      </div>

      <div className="rounded-3xl border border-white/5 bg-card p-8">
        <h3 className="mb-6 flex items-center gap-2 font-bold text-white">
          <AlertCircle size={18} className="text-red-400" />
          {t('analyze.issues_title', {}, locale)}
        </h3>
        <ol className="space-y-4">
          {issues.slice(0, 5).map((issue, i) => (
            <motion.li
              key={i}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
              className="flex items-start gap-3 rounded-xl border border-white/5 bg-white/5 p-4 text-sm text-white/80"
            >
              <div className="mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-red-500/10 text-[10px] font-bold text-red-400">
                {i + 1}
              </div>
              {issue}
            </motion.li>
          ))}
          {issues.length === 0 ? (
            <li className="text-sm italic text-muted-foreground">
              {locale === 'tr' ? 'Kritik sorun bulunamadi.' : 'No critical issues found.'}
            </li>
          ) : null}
        </ol>
      </div>

      <div className="relative grid grid-cols-1 gap-4 sm:grid-cols-2">
        <LockedCard label="AI Citability" />
        <LockedCard label="Schema Markup" />
        <LockedCard label="E-E-A-T Score" />
        <LockedCard label="Keywords & LLMs" />

        <div className="absolute inset-0 z-10 flex items-center justify-center bg-gradient-to-b from-transparent via-[#06090f]/80 to-[#06090f] p-6">
          <div className="max-w-sm space-y-4 rounded-3xl border border-emerald-500/30 bg-card p-8 text-center shadow-2xl shadow-emerald-500/20">
            <Lock className="mx-auto mb-2 text-emerald-500" size={32} />
            <h4 className="font-bold text-white">{t('analyze.locked_title', {}, locale)}</h4>
            <p className="text-sm leading-relaxed text-muted-foreground">{t('analyze.locked_desc', {}, locale)}</p>
            <Link
              href={`/pricing?domain=${encodeURIComponent(domain)}`}
              className="flex items-center justify-center gap-2 rounded-xl bg-emerald-500 px-6 py-3 font-bold text-white transition-all hover:bg-emerald-600"
            >
              {t('analyze.upgrade_cta', {}, locale)} <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function ScoreRing({ score, label, big }: { score: number; label: string; big?: boolean }) {
  const r = big ? 42 : 36;
  const c = 2 * Math.PI * r;
  const offset = c - (score / 100) * c;

  return (
    <div className="flex flex-col items-center gap-3">
      <div className={`relative ${big ? 'h-32 w-32' : 'h-24 w-24'}`}>
        <svg className="h-full w-full" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r={r} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="8" />
          <motion.circle
            cx="50"
            cy="50"
            r={r}
            fill="none"
            stroke="#10b981"
            strokeWidth="8"
            strokeDasharray={c}
            strokeDashoffset={c}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 1.5, ease: 'easeOut' }}
            strokeLinecap="round"
            className="score-ring"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={`${big ? 'text-3xl' : 'text-xl'} font-extrabold tracking-tighter text-white`}>{score}</span>
        </div>
      </div>
      <span className="text-[10px] font-mono font-bold uppercase tracking-[0.2em] text-muted-foreground">{label}</span>
    </div>
  );
}

function LockedCard({ label }: { label: string }) {
  return (
    <div className="pointer-events-none flex flex-col gap-3 rounded-2xl border border-white/5 bg-card/50 p-6 opacity-50 blur-[2px]">
      <div className="flex items-center justify-between">
        <div className="h-4 w-24 rounded-full bg-white/10" />
        <Lock size={14} className="text-white/20" />
      </div>
      <div className="space-y-2">
        <div className="h-2 w-full rounded-full bg-white/5" />
        <div className="h-2 w-2/3 rounded-full bg-white/5" />
      </div>
      <div className="mt-2 text-xs font-mono font-bold uppercase tracking-widest text-muted-foreground">{label}</div>
    </div>
  );
}
