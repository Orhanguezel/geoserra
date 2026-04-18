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
          <h2 className="mb-2 text-base font-semibold">{t('analyze_info.measures_title', {}, locale)}</h2>
          <p className="mb-5 text-sm text-muted-foreground leading-6">
            {t('analyze_info.measures_desc', {}, locale)}
          </p>
          <div className="grid gap-3 sm:grid-cols-2">
            {[
              { icon: Bot, key: 'cat1', weight: '25%', color: 'text-cyan-400' },
              { icon: Globe, key: 'cat2', weight: '20%', color: 'text-amber-400' },
              { icon: FileSearch, key: 'cat3', weight: '20%', color: 'text-violet-400' },
              { icon: Zap, key: 'cat4', weight: '15%', color: 'text-emerald-400' },
              { icon: Layers, key: 'cat5', weight: '10%', color: 'text-rose-400' },
              { icon: Shield, key: 'cat6', weight: '10%', color: 'text-sky-400' },
            ].map(({ icon: Icon, key, weight, color }) => (
              <div key={key} className="flex items-start gap-3 rounded-xl border border-border bg-muted/20 p-4">
                <div className={`mt-0.5 shrink-0 ${color}`}><Icon size={16} /></div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-foreground">{t(`analyze_info.${key}_label`, {}, locale)}</p>
                    <span className="rounded-full bg-muted px-1.5 py-0.5 text-[10px] font-bold font-mono text-muted-foreground">{weight}</span>
                  </div>
                  <p className="mt-1 text-xs leading-5 text-muted-foreground">{t(`analyze_info.${key}_desc`, {}, locale)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Nasıl Çalışır */}
        <div className="mb-10 rounded-2xl border border-border bg-card p-6">
          <h2 className="mb-5 text-base font-semibold">{t('analyze_info.how_title', {}, locale)}</h2>
          <div className="space-y-4">
            {[
              { icon: Search, step: '1', key: 'step1', color: 'text-emerald-400' },
              { icon: BarChart3, step: '2', key: 'step2', color: 'text-cyan-400' },
              { icon: FileCheck, step: '3', key: 'step3', color: 'text-amber-400' },
              { icon: CheckCheck, step: '4', key: 'step4', color: 'text-violet-400' },
            ].map(({ icon: Icon, step, key, color }) => (
              <div key={step} className="flex gap-4">
                <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-muted ${color}`}>
                  <Icon size={15} />
                </div>
                <div>
                  <p className="text-sm font-semibold">{step}. {t(`analyze_info.${key}_title`, {}, locale)}</p>
                  <p className="mt-1 text-sm text-muted-foreground leading-6">{t(`analyze_info.${key}_desc`, {}, locale)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Skor Referans Tablosu */}
        <div className="mb-10 rounded-2xl border border-border bg-card p-6">
          <h2 className="mb-2 text-base font-semibold">{t('analyze_info.score_title', {}, locale)}</h2>
          <p className="mb-5 text-sm text-muted-foreground leading-6">
            {t('analyze_info.score_desc', {}, locale)}
          </p>
          <div className="grid gap-2 sm:grid-cols-2">
            {[
              { range: '0 – 40', key: 'score_critical', color: 'text-red-400 bg-red-500/10 border-red-500/20' },
              { range: '41 – 60', key: 'score_below', color: 'text-amber-400 bg-amber-500/10 border-amber-500/20' },
              { range: '61 – 75', key: 'score_avg', color: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20' },
              { range: '76 – 90', key: 'score_good', color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' },
              { range: '91 – 100', key: 'score_excellent', color: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20' },
            ].map(({ range, key, color }) => (
              <div key={range} className={`flex items-start gap-3 rounded-xl border p-4 ${color}`}>
                <span className="shrink-0 rounded-full px-2 py-0.5 text-xs font-bold font-mono">{range}</span>
                <div>
                  <p className="text-sm font-semibold">{t(`analyze_info.${key}`, {}, locale)}</p>
                  <p className="mt-0.5 text-xs leading-5 opacity-80">{t(`analyze_info.${key}_desc`, {}, locale)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* SSS */}
        <div className="mb-10 rounded-2xl border border-border bg-card p-6">
          <h2 className="mb-5 text-base font-semibold">{t('analyze_info.faq_title', {}, locale)}</h2>
          <div className="space-y-4">
            {(['faq1', 'faq2', 'faq3', 'faq4'] as const).map((key) => (
              <div key={key} className="rounded-xl border border-border bg-muted/20 p-4">
                <p className="text-sm font-semibold text-foreground">{t(`analyze_info.${key}_q`, {}, locale)}</p>
                <p className="mt-2 text-sm text-muted-foreground leading-6">{t(`analyze_info.${key}_a`, {}, locale)}</p>
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
  const perfScore: number | null = data?.performance_score ?? null;
  const seoScore: number | null = data?.seo_score ?? null;
  const scores = data?.scores ?? {};
  const platforms: Record<string, number> = data?.platforms ?? {};
  const issues: string[] = data?.top_issues ?? [];

  const dimensions = [
    { key: 'ai_citability',         label_tr: 'AI Alıntılanabilirlik',  label_en: 'AI Citability',       locked: false },
    { key: 'content_eeat',          label_tr: 'İçerik E-E-A-T',         label_en: 'Content E-E-A-T',     locked: false },
    { key: 'technical',             label_tr: 'Teknik Altyapı',         label_en: 'Technical',           locked: false },
    { key: 'schema',                label_tr: 'Structured Data',        label_en: 'Schema Markup',       locked: false },
    { key: 'platform_optimization', label_tr: 'Platform Uyumu',         label_en: 'Platform Optimization', locked: false },
    { key: 'brand_authority',       label_tr: 'Marka Otoritesi',        label_en: 'Brand Authority',     locked: true },
  ];

  return (
    <motion.div
      key="results"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8"
    >
      {/* Ana skor + performance + SEO */}
      <div className="rounded-3xl border border-border bg-card p-8 md:p-10">
        <div className="mb-8 flex items-center justify-between">
          <h2 className="text-xl font-bold text-foreground">{t('analyze.free_result_title', {}, locale)}</h2>
          <div className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-emerald-500">
            {t('analyze_info.free_tier', {}, locale)}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          <ScoreRing label={t('analyze.geo_score', {}, locale)} score={geoScore} big />
          <ScoreRing label={t('analyze.performance', {}, locale)} score={perfScore ?? 0} />
          <ScoreRing label={t('analyze.seo', {}, locale)} score={seoScore ?? 0} />
        </div>
      </div>

      {/* 6-boyutlu skor dağılımı */}
      <div className="rounded-3xl border border-border bg-card p-8">
        <h3 className="mb-6 flex items-center gap-2 font-bold text-foreground">
          <Layers size={18} className="text-emerald-500" />
          {locale === 'tr' ? 'Skor Dağılımı (6 Boyut)' : 'Score Breakdown (6 Dimensions)'}
        </h3>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {dimensions.map((d) => {
            const val = scores[d.key];
            const pct = val == null ? 0 : Math.max(0, Math.min(100, val));
            const label = locale === 'tr' ? d.label_tr : d.label_en;
            const color = pct >= 70 ? '#10b981' : pct >= 40 ? '#f59e0b' : '#ef4444';
            return (
              <div key={d.key} className="rounded-xl border border-border bg-muted/30 p-4">
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-sm font-medium text-foreground/90">{label}</span>
                  {d.locked || val == null ? (
                    <span className="flex items-center gap-1 text-[10px] font-bold text-muted-foreground">
                      <Lock size={10} /> {locale === 'tr' ? 'Premium' : 'Premium'}
                    </span>
                  ) : (
                    <span className="font-mono text-sm font-bold" style={{ color }}>{pct}/100</span>
                  )}
                </div>
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: d.locked || val == null ? '20%' : `${pct}%` }}
                    transition={{ duration: 1, delay: 0.2 }}
                    className="h-full rounded-full"
                    style={{ backgroundColor: d.locked || val == null ? 'hsl(var(--muted-foreground))' : color, opacity: d.locked || val == null ? 0.25 : 1 }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* AI Platform Readiness */}
      {Object.keys(platforms).length > 0 && (
        <div className="rounded-3xl border border-border bg-card p-8">
          <h3 className="mb-6 flex items-center gap-2 font-bold text-foreground">
            <Bot size={18} className="text-emerald-500" />
            {locale === 'tr' ? 'AI Platform Hazırlığı' : 'AI Platform Readiness'}
          </h3>
          <div className="space-y-3">
            {Object.entries(platforms).map(([name, val]) => {
              const pct = Math.max(0, Math.min(100, val));
              const color = pct >= 70 ? '#10b981' : pct >= 40 ? '#f59e0b' : '#ef4444';
              return (
                <div key={name} className="flex items-center gap-4">
                  <span className="w-44 shrink-0 text-sm text-foreground/90">{name}</span>
                  <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }}
                      transition={{ duration: 1, delay: 0.3 }}
                      className="h-full rounded-full"
                      style={{ backgroundColor: color }}
                    />
                  </div>
                  <span className="w-14 text-right font-mono text-sm font-bold" style={{ color }}>{pct}/100</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Top Issues */}
      <div className="rounded-3xl border border-border bg-card p-8">
        <h3 className="mb-6 flex items-center gap-2 font-bold text-foreground">
          <AlertCircle size={18} className="text-red-400" />
          {t('analyze.issues_title', {}, locale)}
        </h3>
        <ol className="space-y-4">
          {issues.slice(0, 6).map((issue, i) => (
            <motion.li
              key={i}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
              className="flex items-start gap-3 rounded-xl border border-border bg-muted/40 p-4 text-sm text-foreground/80"
            >
              <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-red-500/10 text-[10px] font-bold text-red-400">
                {i + 1}
              </div>
              {issue}
            </motion.li>
          ))}
          {issues.length === 0 ? (
            <li className="text-sm italic text-muted-foreground">
              {t('analyze_info.no_issues', {}, locale)}
            </li>
          ) : null}
        </ol>
      </div>

      {/* Upgrade CTA — 3 paket preview */}
      <div className="rounded-3xl border border-emerald-500/30 bg-gradient-to-br from-emerald-500/10 to-cyan-500/10 p-8">
        <div className="text-center mb-6">
          <Lock className="mx-auto mb-3 text-emerald-500" size={32} />
          <h4 className="mb-2 text-xl font-bold text-foreground">
            {locale === 'tr' ? 'Bu analizi PDF raporla al' : 'Get this analysis as a PDF report'}
          </h4>
          <p className="mx-auto max-w-lg text-sm text-muted-foreground">
            {locale === 'tr'
              ? 'AI-nüanslı bulgular, executive summary, hazır schema kodu ve daha fazlası.'
              : 'AI-enhanced findings, executive summary, ready-to-use schema code and more.'}
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-3 mb-5">
          <div className="rounded-xl border border-border bg-card/80 p-4 text-center">
            <div className="text-xs uppercase tracking-wider text-muted-foreground mb-1">Basic</div>
            <div className="text-2xl font-bold text-foreground">$5</div>
            <div className="mt-2 text-[11px] text-muted-foreground">{locale === 'tr' ? 'PDF + AI bulgular' : 'PDF + AI findings'}</div>
          </div>
          <div className="rounded-xl border-2 border-emerald-500/50 bg-emerald-500/5 p-4 text-center shadow-lg shadow-emerald-500/10 ring-1 ring-emerald-500/30">
            <div className="text-[10px] uppercase tracking-wider text-emerald-600 dark:text-emerald-400 font-bold mb-1">
              ★ {locale === 'tr' ? 'Önerilen' : 'Recommended'}
            </div>
            <div className="text-2xl font-bold text-foreground">$15</div>
            <div className="mt-2 text-[11px] text-muted-foreground">{locale === 'tr' ? '+ Schema + Delta' : '+ Schema + Delta'}</div>
          </div>
          <div className="rounded-xl border border-border bg-card/80 p-4 text-center">
            <div className="text-xs uppercase tracking-wider text-muted-foreground mb-1">Premium</div>
            <div className="text-2xl font-bold text-foreground">$50</div>
            <div className="mt-2 text-[11px] text-muted-foreground">{locale === 'tr' ? '+ Rakip + Aylık' : '+ Competitor + Monthly'}</div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3 justify-center">
          <Link
            href={`/pricing?domain=${encodeURIComponent(domain)}`}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-6 py-3 font-bold text-white transition-all hover:bg-emerald-700"
          >
            {t('analyze.upgrade_cta', {}, locale)} <ArrowRight size={16} />
          </Link>
          <a
            href="/assets/sample-report.pdf"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-5 py-3 text-sm font-semibold text-foreground hover:bg-muted transition-colors"
          >
            📄 {locale === 'tr' ? 'Örnek PDF\'i incele' : 'View sample PDF'}
          </a>
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

