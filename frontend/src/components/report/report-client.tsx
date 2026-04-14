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
          {isComplete && status.full_data && (
            <div className="rounded-2xl border border-border bg-card p-6">
              <h2 className="mb-4 font-bold">{t('report.scores', {}, locale)}</h2>
              <div className="grid grid-cols-3 gap-4 text-center">
                {[
                  { label: t('analyze.geo_score', {}, locale), val: status.full_data?.geo_score ?? 0 },
                  { label: t('analyze.performance', {}, locale), val: status.full_data?.performance?.score ?? 0 },
                  { label: t('analyze.seo', {}, locale), val: status.full_data?.seo?.score ?? 0 },
                ].map((s) => (
                  <div key={s.label}>
                    <div className="text-3xl font-bold" style={{ color: scoreColor(s.val) }}>{s.val}</div>
                    <div className="mt-1 text-xs text-muted-foreground">{s.label}</div>
                  </div>
                ))}
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
