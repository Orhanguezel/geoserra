'use client';
import { useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Loader2, CheckCircle2, XCircle, Download, FileText } from 'lucide-react';
import Link from 'next/link';
import { getAnalysisStatus } from '@/lib/api';
import type { AnalysisStatus } from '@/lib/api';
import { t } from '@/lib/t';
import { useLocaleStore } from '@/stores/locale-store';
import { scoreColor } from '@/lib/utils';

const STATUS_LABELS: Record<string, string> = {
  pending: 'report.status_pending',
  processing: 'report.status_processing',
  completed: 'report.status_completed',
  failed: 'report.status_failed',
};

export function ReportClient({ id }: { id: string }) {
  const locale = useLocaleStore((s) => s.locale);
  const [status, setStatus] = useState<AnalysisStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    fetchStatus();
    pollRef.current = setInterval(fetchStatus, 5000);
    return () => { if (pollRef.current) clearInterval(pollRef.current); };
  }, [id]);

  async function fetchStatus() {
    try {
      const data = await getAnalysisStatus(id);
      setStatus(data);
      setLoading(false);
      if (data.status === 'completed' || data.status === 'failed' || data.status === 'free') {
        clearInterval(pollRef.current!);
      }
    } catch {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <Loader2 size={32} className="animate-spin text-primary" />
      </main>
    );
  }

  if (!status) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <p className="text-muted-foreground">{t('common.error', {}, locale)}</p>
      </main>
    );
  }

  const isComplete = status.status === 'completed';
  const isFailed = status.status === 'failed';
  const isProcessing = status.status === 'pending' || status.status === 'processing';
  const fullData = status.full_data;
  const geoScore = fullData?.geo_score ?? 0;
  const performanceScoreRaw =
    fullData?.performance?.score ?? fullData?.lighthouse?.categories?.performance?.score ?? 0;
  const seoScoreRaw = fullData?.lighthouse?.categories?.seo?.score ?? 0;
  const performanceScore = performanceScoreRaw <= 1 ? Math.round(performanceScoreRaw * 100) : performanceScoreRaw;
  const seoScore = seoScoreRaw <= 1 ? Math.round(seoScoreRaw * 100) : seoScoreRaw;

  return (
    <main className="min-h-screen py-20 md:py-28">
      <div className="container max-w-xl">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Status card */}
          <div className="rounded-2xl border border-border bg-card p-6 text-center space-y-4">
            {isProcessing && (
              <>
                <Loader2 size={40} className="mx-auto animate-spin text-primary" />
                <p className="font-semibold">{t(STATUS_LABELS[status.status] ?? 'report.status_processing', {}, locale)}</p>
                <p className="text-sm text-muted-foreground">{t('analyze.processing_hint', {}, locale)}</p>
              </>
            )}
            {isComplete && (
              <>
                <CheckCircle2 size={40} className="mx-auto text-emerald-400" />
                <p className="font-semibold">{t('report.status_completed', {}, locale)}</p>
                <p className="text-sm text-muted-foreground">{status.domain}</p>
              </>
            )}
            {isFailed && (
              <>
                <XCircle size={40} className="mx-auto text-destructive" />
                <p className="font-semibold">{t('report.status_failed', {}, locale)}</p>
              </>
            )}
          </div>

          {/* Scores */}
          {isComplete && fullData && (
            <div className="rounded-2xl border border-border bg-card p-6">
              <h2 className="mb-4 font-bold">{t('report.scores', {}, locale)}</h2>
              <div className="grid grid-cols-3 gap-4 text-center">
                {[
                  { label: t('analyze.geo_score', {}, locale), val: geoScore },
                  { label: t('analyze.performance', {}, locale), val: performanceScore },
                  { label: t('analyze.seo', {}, locale), val: seoScore },
                ].map((s) => (
                  <div key={s.label}>
                    <div className="text-3xl font-bold" style={{ color: scoreColor(s.val) }}>{s.val}</div>
                    <div className="mt-1 text-xs text-muted-foreground">{s.label}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 6-boyutlu dağılım */}
          {isComplete && fullData && (fullData as any).scores && (
            <div className="rounded-2xl border border-border bg-card p-6">
              <h2 className="mb-4 font-bold">{locale === 'tr' ? 'Skor Dağılımı (6 Boyut)' : 'Score Breakdown (6 Dimensions)'}</h2>
              <div className="space-y-3">
                {([
                  { key: 'ai_citability',         label_tr: 'AI Alıntılanabilirlik',  label_en: 'AI Citability' },
                  { key: 'brand_authority',       label_tr: 'Marka Otoritesi',        label_en: 'Brand Authority' },
                  { key: 'content_eeat',          label_tr: 'İçerik E-E-A-T',         label_en: 'Content E-E-A-T' },
                  { key: 'technical',             label_tr: 'Teknik Altyapı',         label_en: 'Technical' },
                  { key: 'schema',                label_tr: 'Structured Data',        label_en: 'Schema Markup' },
                  { key: 'platform_optimization', label_tr: 'Platform Uyumu',         label_en: 'Platform Optimization' },
                ] as const).map((d) => {
                  const val = (fullData as any).scores?.[d.key];
                  const pct = val == null ? 0 : Math.max(0, Math.min(100, val));
                  const label = locale === 'tr' ? d.label_tr : d.label_en;
                  return (
                    <div key={d.key} className="flex items-center gap-3 text-sm">
                      <span className="w-40 shrink-0 text-foreground/90">{label}</span>
                      <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all"
                          style={{ width: `${pct}%`, backgroundColor: scoreColor(pct) }}
                        />
                      </div>
                      <span className="w-14 text-right font-mono font-bold" style={{ color: scoreColor(pct) }}>
                        {val == null ? '—' : `${pct}`}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* AI Platform Readiness */}
          {isComplete && fullData && (fullData as any).platforms && Object.keys((fullData as any).platforms).length > 0 && (
            <div className="rounded-2xl border border-border bg-card p-6">
              <h2 className="mb-4 font-bold">{locale === 'tr' ? 'AI Platform Hazırlığı' : 'AI Platform Readiness'}</h2>
              <div className="space-y-3">
                {Object.entries((fullData as any).platforms as Record<string, number>).map(([name, val]) => {
                  const pct = Math.max(0, Math.min(100, val));
                  return (
                    <div key={name} className="flex items-center gap-3 text-sm">
                      <span className="w-40 shrink-0 text-foreground/90">{name}</span>
                      <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
                        <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: scoreColor(pct) }} />
                      </div>
                      <span className="w-14 text-right font-mono font-bold" style={{ color: scoreColor(pct) }}>{pct}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* PDF Download */}
          {isComplete && status.pdf_ready && (
            <a
              href={`/api/v1/analyze/${id}/download`}
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3 font-semibold text-primary-foreground hover:opacity-90 transition-all"
            >
              <Download size={16} /> {t('report.download_pdf', {}, locale)}
            </a>
          )}

          {/* Implementation CTA */}
          {isComplete && (
            <div className="rounded-2xl border border-primary/20 bg-primary/5 p-5 text-center space-y-2">
              <FileText size={24} className="mx-auto text-primary" />
              <p className="text-sm font-semibold">{t('report.impl_cta', {}, locale)}</p>
              <Link
                href="/implementation"
                className="inline-block rounded-lg bg-muted px-4 py-2 text-sm hover:bg-muted/80 transition-colors"
              >
                {t('implementation.title', {}, locale)}
              </Link>
            </div>
          )}
        </motion.div>
      </div>
    </main>
  );
}
