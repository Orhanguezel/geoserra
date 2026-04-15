'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Lock } from 'lucide-react';
import { t } from '@/lib/t';
import { useLocaleStore } from '@/stores/locale-store';
import { scoreColor } from '@/lib/utils';

const categories = [
  { nameKey: 'report_preview.cat_ai', score: 72 },
  { nameKey: 'report_preview.cat_schema', score: 45 },
  { nameKey: 'report_preview.cat_technical', score: 88 },
  { nameKey: 'report_preview.cat_cwv', score: 91 },
];

export function ReportPreviewSection() {
  const locale = useLocaleStore((s) => s.locale);

  return (
    <section className="relative overflow-hidden bg-background py-24 md:py-32">
      <div className="container px-4">
        <div className="grid items-center gap-16 lg:grid-cols-2">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <div className="mb-6 font-mono text-xs uppercase tracking-[0.28em] text-emerald-500">{t('report_preview.eyebrow', {}, locale)}</div>
            <h2 className="mb-6 text-3xl font-extrabold leading-tight text-foreground md:text-5xl">{t('report_preview.title', {}, locale)}</h2>
            <p className="mb-8 text-lg leading-relaxed text-muted-foreground">{t('report_preview.description', {}, locale)}</p>
            <Link href="/analyze" className="inline-flex items-center rounded-xl bg-emerald-500 px-8 py-4 font-bold text-primary-foreground transition-all hover:bg-emerald-600">
              {t('report_preview.cta', {}, locale)}
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="group relative"
          >
            <div className="absolute -inset-4 rounded-[2.5rem] bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 blur-2xl opacity-50 transition-opacity group-hover:opacity-75" />
            <div className="relative rounded-3xl border border-border bg-card p-6 shadow-xl md:p-10">
              <div className="mb-10 flex items-center justify-between border-b border-border pb-6">
                <div className="font-mono text-xs tracking-widest text-muted-foreground">
                  GEOSERRA RAPORU — <span className="text-foreground">example.com</span>
                </div>
                <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              </div>

              <div className="mb-12 grid grid-cols-3 gap-8">
                <ScoreRing score={78} label="GEO" color="#10b981" />
                <ScoreRing score={85} label="SEO" color="#0ea5e9" />
                <ScoreRing score={91} label="LH" color="#f59e0b" />
              </div>

              <div className="mb-4 space-y-4">
                {categories.map((cat) => (
                  <div key={cat.nameKey} className="flex items-center justify-between rounded-xl border border-border bg-muted/50 p-4">
                    <div className="flex items-center gap-3">
                      <div className="h-2 w-2 rounded-full" style={{ backgroundColor: scoreColor(cat.score) }} />
                      <span className="text-sm font-medium text-foreground/80">{t(cat.nameKey, {}, locale)}</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="hidden h-1.5 w-32 overflow-hidden rounded-full bg-muted sm:block">
                        <motion.div
                          initial={{ width: 0 }}
                          whileInView={{ width: `${cat.score}%` }}
                          viewport={{ once: true }}
                          transition={{ duration: 1, delay: 0.5 }}
                          className="h-full"
                          style={{ backgroundColor: scoreColor(cat.score) }}
                        />
                      </div>
                      <span className="text-sm font-mono font-bold" style={{ color: scoreColor(cat.score) }}>
                        {cat.score}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="relative mt-6 flex flex-col items-center border-t border-border pt-6">
                <div className="relative z-10 flex flex-col items-center gap-3">
                  <div className="flex items-center gap-2 font-mono text-xs text-muted-foreground">
                    <Lock size={12} /> {t('report_preview.locked', {}, locale)}
                  </div>
                  <Link href="/pricing" className="text-sm font-bold text-emerald-400 hover:underline">
                    {locale === 'tr' ? 'Rapor Satın Al' : 'Buy Report'}
                  </Link>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

function ScoreRing({ score, label, color }: { score: number; label: string; color: string }) {
  const r = 36;
  const c = 2 * Math.PI * r;
  const offset = c - (score / 100) * c;

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative h-20 w-20">
        <svg className="h-full w-full" viewBox="0 0 88 88">
          <circle cx="44" cy="44" r={r} fill="none" stroke="currentColor" strokeOpacity="0.1" strokeWidth="6" />
          <circle cx="44" cy="44" r={r} fill="none" stroke={color} strokeWidth="6" strokeDasharray={c} strokeDashoffset={offset} strokeLinecap="round" className="score-ring transition-all duration-1000 ease-out" />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-xl font-bold tracking-tighter text-foreground">{score}</span>
        </div>
      </div>
      <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-muted-foreground">{label}</span>
    </div>
  );
}
