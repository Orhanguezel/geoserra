'use client';
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Loader2, AlertCircle, Lock, CheckCircle2, XCircle, Minus } from 'lucide-react';
import Link from 'next/link';
import { t } from '@/lib/t';
import { useLocaleStore } from '@/stores/locale-store';
import { startFreeAnalysis, getAnalysisStatus } from '@/lib/api';
import type { AnalysisStatus } from '@/lib/api';
import { scoreColor } from '@/lib/utils';

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
    return () => { if (pollRef.current) clearInterval(pollRef.current); };
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
          {/* Form */}
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
                <label className="mb-1.5 block text-sm font-medium">
                  {t('analyze.url_label', {}, locale)}
                </label>
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
                <label className="mb-1.5 block text-sm font-medium">
                  {t('analyze.email_label', {}, locale)}
                </label>
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

          {/* Polling */}
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

          {/* Domain locked */}
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

          {/* Results */}
          {uiState === 'done' && result?.free_data && (
            <FreeResults data={result.free_data} locale={locale} domain={result.domain} />
          )}
        </AnimatePresence>
      </div>
    </main>
  );
}

// ─── Free Results ─────────────────────────────────────────────────────────────

function FreeResults({ data, locale, domain }: { data: any; locale: 'tr' | 'en'; domain: string }) {
  const geoScore: number = data?.geo_score ?? 0;
  const perfScore: number = data?.performance?.score ?? 0;
  const seoScore: number = data?.seo?.score ?? 0;
  const issues: string[] = data?.issues ?? [];

  return (
    <motion.div
      key="results"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Score */}
      <div className="rounded-2xl border border-border bg-card p-6">
        <h2 className="mb-6 text-lg font-bold">{t('analyze.free_result_title', {}, locale)}</h2>
        <div className="grid grid-cols-3 gap-4 text-center">
          <ScoreCard label={t('analyze.geo_score', {}, locale)} score={geoScore} big />
          <ScoreCard label={t('analyze.performance', {}, locale)} score={perfScore} />
          <ScoreCard label={t('analyze.seo', {}, locale)} score={seoScore} />
        </div>
      </div>

      {/* Issues */}
      {issues.length > 0 && (
        <div className="rounded-2xl border border-border bg-card p-6">
          <h3 className="mb-4 font-semibold">{t('analyze.issues_title', {}, locale)}</h3>
          <ul className="space-y-2">
            {issues.map((issue: string, i: number) => (
              <li key={i} className="flex items-start gap-2 text-sm">
                <XCircle size={14} className="mt-0.5 shrink-0 text-destructive" />
                {issue}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Upgrade CTA */}
      <div className="rounded-2xl border border-primary/30 bg-primary/5 p-6 text-center space-y-3">
        <h3 className="font-bold">{t('analyze.upgrade_title', {}, locale)}</h3>
        <p className="text-sm text-muted-foreground">{t('analyze.upgrade_desc', {}, locale)}</p>
        <Link
          href={`/pricing?domain=${encodeURIComponent(domain)}`}
          className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-90 transition-all"
        >
          {t('analyze.upgrade_cta', {}, locale)} <ArrowRight size={14} />
        </Link>
      </div>
    </motion.div>
  );
}

function ScoreCard({ label, score, big }: { label: string; score: number; big?: boolean }) {
  const color = scoreColor(score);
  return (
    <div>
      <div className={`${big ? 'text-4xl' : 'text-2xl'} font-bold`} style={{ color }}>
        {score}
      </div>
      <div className="mt-1 text-xs text-muted-foreground">{label}</div>
    </div>
  );
}
