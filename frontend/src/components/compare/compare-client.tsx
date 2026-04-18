'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Minus, Loader2, AlertCircle, ArrowLeft } from 'lucide-react';
import { compareAnalyses, type CompareResponse } from '@/lib/api';
import { useLocaleStore } from '@/stores/locale-store';

const DIMENSION_LABELS: Record<string, { tr: string; en: string }> = {
  ai_citability:         { tr: 'AI Alıntılanabilirlik',   en: 'AI Citability' },
  brand_authority:       { tr: 'Marka Otoritesi',         en: 'Brand Authority' },
  content_eeat:          { tr: 'İçerik E-E-A-T',          en: 'Content E-E-A-T' },
  technical:             { tr: 'Teknik Altyapı',          en: 'Technical' },
  schema:                { tr: 'Structured Data',         en: 'Schema Markup' },
  platform_optimization: { tr: 'Platform Uyumu',          en: 'Platform Optimization' },
};

function DeltaBadge({ delta }: { delta: number | null }) {
  if (delta == null) return <span className="text-xs text-muted-foreground">—</span>;
  if (delta > 0) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-xs font-bold text-emerald-600 dark:text-emerald-400">
        <TrendingUp size={11} /> +{delta}
      </span>
    );
  }
  if (delta < 0) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-red-500/10 px-2 py-0.5 text-xs font-bold text-red-600 dark:text-red-400">
        <TrendingDown size={11} /> {delta}
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-xs font-bold text-muted-foreground">
      <Minus size={11} /> 0
    </span>
  );
}

function ScoreCell({ value }: { value: number | null | undefined }) {
  if (value == null) return <span className="text-muted-foreground">—</span>;
  const color = value >= 70 ? '#10b981' : value >= 40 ? '#f59e0b' : '#ef4444';
  return <span className="font-mono font-bold" style={{ color }}>{value}</span>;
}

export function CompareClient({ baseId, currentId }: { baseId: string; currentId: string }) {
  const locale = useLocaleStore((s) => s.locale);
  const [data, setData] = useState<CompareResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    compareAnalyses(baseId, currentId)
      .then((res) => { if (mounted) { setData(res); setLoading(false); } })
      .catch((err) => {
        if (!mounted) return;
        const msg = err?.response?.data?.message ?? err?.response?.data?.error ?? 'Karşılaştırma alınamadı';
        setError(msg);
        setLoading(false);
      });
    return () => { mounted = false; };
  }, [baseId, currentId]);

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <Loader2 size={40} className="animate-spin text-primary" />
      </main>
    );
  }

  if (error || !data) {
    return (
      <main className="min-h-screen flex items-center justify-center px-4">
        <div className="max-w-md rounded-2xl border border-destructive/30 bg-destructive/5 p-8 text-center">
          <AlertCircle size={40} className="mx-auto mb-4 text-destructive" />
          <p className="font-semibold mb-2">Karşılaştırma yüklenemedi</p>
          <p className="text-sm text-muted-foreground">{error ?? 'Bilinmeyen hata'}</p>
          <Link href="/hesabim" className="mt-4 inline-flex items-center gap-2 text-sm text-primary hover:underline">
            <ArrowLeft size={14} /> Hesabıma dön
          </Link>
        </div>
      </main>
    );
  }

  const fmtDate = (d: string) => new Date(d).toLocaleDateString(locale === 'tr' ? 'tr-TR' : 'en-US', {
    day: '2-digit', month: 'short', year: 'numeric',
  });

  const geoDelta = data.deltas.geo_score;

  return (
    <main className="min-h-screen py-20 md:py-28">
      <div className="container max-w-3xl">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Header */}
          <div className="flex items-center justify-between">
            <Link href="/hesabim" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
              <ArrowLeft size={14} /> {locale === 'tr' ? 'Hesabıma dön' : 'Back to account'}
            </Link>
          </div>

          <div>
            <h1 className="text-2xl font-bold">{locale === 'tr' ? 'Analiz Karşılaştırma' : 'Analysis Comparison'}</h1>
            <p className="mt-1 text-sm text-muted-foreground font-mono">{data.domain}</p>
          </div>

          {/* Genel Skor Karşılaştırma */}
          <div className="rounded-2xl border border-border bg-card p-6">
            <div className="grid grid-cols-3 items-center gap-4">
              <div className="text-center">
                <div className="text-xs uppercase tracking-wider text-muted-foreground mb-2">
                  {fmtDate(data.base.date)}
                </div>
                <div className="text-4xl font-bold" style={{ color: data.base.geo_score != null ? (data.base.geo_score >= 70 ? '#10b981' : data.base.geo_score >= 40 ? '#f59e0b' : '#ef4444') : 'currentColor' }}>
                  {data.base.geo_score ?? '—'}
                </div>
                <div className="mt-1 text-xs text-muted-foreground">{data.base.package_slug}</div>
              </div>

              <div className="text-center">
                <div className="text-xs uppercase tracking-wider text-muted-foreground mb-2">
                  {locale === 'tr' ? 'Değişim' : 'Delta'}
                </div>
                <div className="text-3xl">
                  <DeltaBadge delta={geoDelta} />
                </div>
                <div className="mt-2 text-xs text-muted-foreground">
                  {data.summary.improved > 0 && (
                    <span className="text-emerald-500">↑{data.summary.improved} </span>
                  )}
                  {data.summary.regressed > 0 && (
                    <span className="text-red-500">↓{data.summary.regressed} </span>
                  )}
                  {data.summary.unchanged > 0 && (
                    <span>={data.summary.unchanged}</span>
                  )}
                </div>
              </div>

              <div className="text-center">
                <div className="text-xs uppercase tracking-wider text-emerald-500 mb-2">
                  {fmtDate(data.current.date)}
                </div>
                <div className="text-4xl font-bold" style={{ color: data.current.geo_score != null ? (data.current.geo_score >= 70 ? '#10b981' : data.current.geo_score >= 40 ? '#f59e0b' : '#ef4444') : 'currentColor' }}>
                  {data.current.geo_score ?? '—'}
                </div>
                <div className="mt-1 text-xs text-muted-foreground">{data.current.package_slug}</div>
              </div>
            </div>
          </div>

          {/* Boyut Bazlı Tablo */}
          <div className="rounded-2xl border border-border bg-card p-6">
            <h2 className="mb-4 font-bold">{locale === 'tr' ? 'Boyut Bazlı Değişim' : 'Score Breakdown'}</h2>
            <div className="overflow-hidden rounded-xl border border-border">
              <table className="w-full text-sm">
                <thead className="bg-muted/40">
                  <tr className="text-left">
                    <th className="px-4 py-2 font-medium">{locale === 'tr' ? 'Boyut' : 'Dimension'}</th>
                    <th className="px-4 py-2 text-right font-medium text-muted-foreground">{fmtDate(data.base.date)}</th>
                    <th className="px-4 py-2 text-right font-medium text-emerald-500">{fmtDate(data.current.date)}</th>
                    <th className="px-4 py-2 text-right font-medium">Δ</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(DIMENSION_LABELS).map(([key, label]) => (
                    <tr key={key} className="border-t border-border">
                      <td className="px-4 py-2.5">{locale === 'tr' ? label.tr : label.en}</td>
                      <td className="px-4 py-2.5 text-right"><ScoreCell value={data.base.scores[key]} /></td>
                      <td className="px-4 py-2.5 text-right"><ScoreCell value={data.current.scores[key]} /></td>
                      <td className="px-4 py-2.5 text-right"><DeltaBadge delta={data.deltas.scores[key]} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* AI Platform Karşılaştırma */}
          {Object.keys(data.deltas.platforms).length > 0 && (
            <div className="rounded-2xl border border-border bg-card p-6">
              <h2 className="mb-4 font-bold">{locale === 'tr' ? 'AI Platform Değişimi' : 'AI Platform Changes'}</h2>
              <div className="overflow-hidden rounded-xl border border-border">
                <table className="w-full text-sm">
                  <thead className="bg-muted/40">
                    <tr className="text-left">
                      <th className="px-4 py-2 font-medium">{locale === 'tr' ? 'Platform' : 'Platform'}</th>
                      <th className="px-4 py-2 text-right font-medium text-muted-foreground">{fmtDate(data.base.date)}</th>
                      <th className="px-4 py-2 text-right font-medium text-emerald-500">{fmtDate(data.current.date)}</th>
                      <th className="px-4 py-2 text-right font-medium">Δ</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(data.deltas.platforms).map(([name, delta]) => (
                      <tr key={name} className="border-t border-border">
                        <td className="px-4 py-2.5">{name}</td>
                        <td className="px-4 py-2.5 text-right"><ScoreCell value={data.base.platforms[name]} /></td>
                        <td className="px-4 py-2.5 text-right"><ScoreCell value={data.current.platforms[name]} /></td>
                        <td className="px-4 py-2.5 text-right"><DeltaBadge delta={delta} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Link to reports */}
          <div className="flex gap-3">
            <Link href={`/report/${data.base.id}`} className="flex-1 rounded-xl border border-border bg-card px-4 py-3 text-center text-sm hover:bg-muted transition-colors">
              {locale === 'tr' ? 'Eski raporu aç' : 'Open older report'}
            </Link>
            <Link href={`/report/${data.current.id}`} className="flex-1 rounded-xl border border-emerald-500/30 bg-emerald-500/5 px-4 py-3 text-center text-sm font-semibold text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10 transition-colors">
              {locale === 'tr' ? 'Yeni raporu aç' : 'Open newer report'}
            </Link>
          </div>
        </motion.div>
      </div>
    </main>
  );
}
