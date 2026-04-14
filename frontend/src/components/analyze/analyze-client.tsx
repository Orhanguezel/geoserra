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
      {/* Score Grid */}
      <div className="rounded-3xl border border-white/5 bg-[#0f1420] p-8 md:p-10">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-xl font-bold text-white">{t('analyze.free_result_title', { defaultValue: 'Analiz Sonucu' }, locale)}</h2>
          <div className="text-[10px] font-mono font-bold text-emerald-500 uppercase tracking-widest px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20">
            Ücretsiz Sürüm
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <ScoreRing label="GEO SKORU" score={geoScore} big color="#10b981" />
          <ScoreRing label="PERFORMANS" score={perfScore} color="#0ea5e9" />
          <ScoreRing label="TEKNİK SEO" score={seoScore} color="#f59e0b" />
        </div>
      </div>

      {/* Top Issues */}
      <div className="rounded-3xl border border-white/5 bg-[#0f1420] p-8">
        <h3 className="mb-6 flex items-center gap-2 font-bold text-white">
          <AlertCircle size={18} className="text-red-400" />
          {t('analyze.issues_title', { defaultValue: 'Kritik Sorunlar' }, locale)}
        </h3>
        <ul className="space-y-4">
          {issues.slice(0, 5).map((issue, i) => (
            <motion.li 
              key={i}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
              className="flex items-start gap-3 text-sm text-white/80 p-4 rounded-xl bg-white/5 border border-white/5"
            >
              <div className="mt-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500/10 text-[10px] font-bold text-red-400 shrink-0">
                {i + 1}
              </div>
              {issue}
            </motion.li>
          ))}
          {issues.length === 0 && (
            <li className="text-sm text-muted-foreground italic">Hiç kritik sorun bulunamadı.</li>
          )}
        </ul>
      </div>

      {/* Locked Categories */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 relative">
        <LockedCard label="AI Citability" />
        <LockedCard label="Schema Markup" />
        <LockedCard label="E-E-A-T Score" />
        <LockedCard label="Keywords & LLMs" />
        
        {/* Overlay CTA */}
        <div className="absolute inset-0 z-10 flex items-center justify-center p-6 bg-gradient-to-b from-transparent via-[#06090f]/80 to-[#06090f]">
          <div className="text-center space-y-4 max-w-sm bg-[#0f1420] border border-emerald-500/30 p-8 rounded-3xl shadow-2xl shadow-emerald-500/20">
            <Lock className="mx-auto text-emerald-500 mb-2" size={32} />
            <h4 className="font-bold text-white">Kategorileri Kilidini Aç</h4>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Tüm detayları, SVG raporunu ve profesyonel çözüm önerilerini görmek için paketini yükselt.
            </p>
            <Link
              href={`/pricing?domain=${encodeURIComponent(domain)}`}
              className="flex items-center justify-center gap-2 rounded-xl bg-emerald-500 px-6 py-3 font-bold text-white hover:bg-emerald-600 transition-all"
            >
              Tam Raporu Al $29'dan <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function ScoreRing({ score, label, color, big }: { score: number; label: string; color: string; big?: boolean }) {
  const r = big ? 42 : 36;
  const c = 2 * Math.PI * r;
  const offset = c - (score / 100) * c;
  
  return (
    <div className="flex flex-col items-center gap-3">
      <div className={`relative ${big ? 'h-32 w-32' : 'h-24 w-24'}`}>
        <svg className="h-full w-full" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r={r} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="8" />
          <motion.circle 
            cx="50" cy="50" r={r} fill="none" stroke={color} strokeWidth="8" 
            strokeDasharray={c} strokeDashoffset={c}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            strokeLinecap="round"
            className="score-ring"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={`${big ? 'text-3xl' : 'text-xl'} font-extrabold text-white tracking-tighter`}>{score}</span>
          {big && <span className="text-[8px] font-bold text-muted-foreground uppercase -mt-1">GENEL</span>}
        </div>
      </div>
      <span className="text-[10px] font-mono font-bold text-muted-foreground uppercase tracking-[0.2em]">{label}</span>
    </div>
  );
}

function LockedCard({ label }: { label: string }) {
  return (
    <div className="rounded-2xl border border-white/5 bg-[#0f1420]/50 p-6 flex flex-col gap-3 blur-[2px] pointer-events-none opacity-50">
      <div className="flex items-center justify-between">
        <div className="h-4 w-24 bg-white/10 rounded-full" />
        <Lock size={14} className="text-white/20" />
      </div>
      <div className="space-y-2">
        <div className="h-2 w-full bg-white/5 rounded-full" />
        <div className="h-2 w-2/3 bg-white/5 rounded-full" />
      </div>
      <div className="mt-2 text-xs font-mono font-bold text-muted-foreground uppercase tracking-widest">{label}</div>
    </div>
  );
}
