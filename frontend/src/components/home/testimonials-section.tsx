'use client';

import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { t } from '@/lib/t';
import { useLocaleStore } from '@/stores/locale-store';

const testimonials = [
  { key: 't1', before: 34, after: 81 },
  { key: 't2', before: 48, after: 76 },
  { key: 't3', before: 29, after: 88 },
];

export function TestimonialsSection() {
  const locale = useLocaleStore((s) => s.locale);

  return (
    <section className="py-20 md:py-28">
      <div className="container">
        <div className="mx-auto mb-10 max-w-2xl text-center">
          {/* eyebrow — theme-aware: cyan-600 on light, cyan-400 on dark */}
          <div className="font-mono text-xs uppercase tracking-[0.28em] text-cyan-600 dark:text-cyan-400">
            {t('testimonials.eyebrow', {}, locale)}
          </div>
          <h2 className="mt-4 text-3xl font-extrabold text-foreground md:text-4xl">
            {t('testimonials.title', {}, locale)}
          </h2>
          <p className="mt-3 text-muted-foreground">{t('testimonials.subtitle', {}, locale)}</p>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {testimonials.map((item, index) => (
            <motion.article
              key={item.key}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.45, delay: index * 0.08 }}
              className="rounded-2xl border border-border bg-card p-6 shadow-md dark:shadow-[0_24px_60px_rgba(0,0,0,0.2)]"
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-semibold text-foreground">
                    {t(`testimonials.${item.key}.name`, {}, locale)}
                  </div>
                  <div className="mt-1 text-sm text-muted-foreground">
                    {t(`testimonials.${item.key}.company`, {}, locale)}
                  </div>
                </div>
                {/* GEO Lift badge — theme-aware */}
                <div className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 font-mono text-xs text-emerald-700 dark:text-emerald-300">
                  GEO Lift
                </div>
              </div>

              {/* Testimonial body text — must be readable on both themes */}
              <p className="mt-5 leading-7 text-foreground/80">
                {t(`testimonials.${item.key}.text`, {}, locale)}
              </p>

              {/* Before / After score row */}
              <div className="mt-6 flex items-center justify-between rounded-xl border border-border bg-muted/50 px-4 py-3">
                <div>
                  <div className="font-mono text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
                    {t('testimonials.before', {}, locale)}
                  </div>
                  {/* Before score: red-600 light / red-400 dark */}
                  <div className="mt-1 text-2xl font-bold text-red-600 dark:text-red-400">
                    {item.before}
                  </div>
                </div>
                <ArrowRight className="text-emerald-600 dark:text-emerald-400" />
                <div className="text-right">
                  <div className="font-mono text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
                    {t('testimonials.after', {}, locale)}
                  </div>
                  {/* After score: emerald-700 light / emerald-400 dark */}
                  <div className="mt-1 text-2xl font-bold text-emerald-700 dark:text-emerald-400">
                    {item.after}
                  </div>
                </div>
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
