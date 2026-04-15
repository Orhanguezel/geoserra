'use client';

import { motion } from 'framer-motion';
import { ArrowRight, Star } from 'lucide-react';
import { t } from '@/lib/t';
import { useLocaleStore } from '@/stores/locale-store';

const testimonials = [
  { key: 't1', before: 34, after: 81, initials: 'AK' },
  { key: 't2', before: 48, after: 76, initials: 'MD' },
  { key: 't3', before: 29, after: 88, initials: 'SÖ' },
];

export function TestimonialsSection() {
  const locale = useLocaleStore((s) => s.locale);

  return (
    <section className="py-20 md:py-28">
      <div className="container">
        <div className="mx-auto mb-10 max-w-2xl text-center">
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
              itemScope
              itemType="https://schema.org/Review"
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.45, delay: index * 0.08 }}
              className="rounded-2xl border border-border bg-card p-6 shadow-md dark:shadow-[0_24px_60px_rgba(0,0,0,0.2)]"
            >
              {/* Stars */}
              <div className="mb-4 flex gap-0.5">
                {[1,2,3,4,5].map((s) => (
                  <Star key={s} size={13} className="fill-amber-400 text-amber-400" />
                ))}
                <span className="ml-1 text-xs text-muted-foreground font-mono">5.0</span>
              </div>

              {/* Quote */}
              <p
                itemProp="reviewBody"
                className="leading-7 text-foreground/80"
              >
                &ldquo;{t(`testimonials.${item.key}.text`, {}, locale)}&rdquo;
              </p>

              {/* Author */}
              <div className="mt-5 flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-500/15 text-xs font-bold text-emerald-400">
                  {item.initials}
                </div>
                <div itemProp="author" itemScope itemType="https://schema.org/Person">
                  <div className="font-semibold text-sm text-foreground" itemProp="name">
                    {t(`testimonials.${item.key}.name`, {}, locale)}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    <span>{t(`testimonials.${item.key}.role`, {}, locale)}</span>
                    <span className="mx-1">·</span>
                    <span itemProp="worksFor">{t(`testimonials.${item.key}.company`, {}, locale)}</span>
                  </div>
                  <div className="mt-0.5 text-[10px] text-muted-foreground/60 font-mono">
                    {t(`testimonials.${item.key}.sector`, {}, locale)}
                  </div>
                </div>
                <div className="ml-auto rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 font-mono text-[10px] text-emerald-700 dark:text-emerald-300">
                  GEO Lift
                </div>
              </div>

              {/* Before / After */}
              <div className="mt-5 flex items-center justify-between rounded-xl border border-border bg-muted/50 px-4 py-3">
                <div>
                  <div className="font-mono text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
                    {t('testimonials.before', {}, locale)}
                  </div>
                  <div className="mt-1 text-2xl font-bold text-red-600 dark:text-red-400">
                    {item.before}
                  </div>
                </div>
                <ArrowRight className="text-emerald-600 dark:text-emerald-400" />
                <div className="text-right">
                  <div className="font-mono text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
                    {t('testimonials.after', {}, locale)}
                  </div>
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
