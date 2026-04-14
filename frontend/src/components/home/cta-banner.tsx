'use client';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { t } from '@/lib/t';
import { useLocaleStore } from '@/stores/locale-store';

export function CtaBanner() {
  const locale = useLocaleStore((s) => s.locale);

  return (
    <section className="py-20 md:py-28">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary/20 via-primary/10 to-secondary/10 border border-primary/20 px-8 py-16 text-center"
        >
          {/* Glow blobs */}
          <div className="pointer-events-none absolute -top-24 left-1/4 h-64 w-64 rounded-full bg-primary/20 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-24 right-1/4 h-64 w-64 rounded-full bg-secondary/20 blur-3xl" />

          <div className="relative z-10">
            <h2 className="text-3xl font-bold md:text-4xl">{t('cta.title', {}, locale)}</h2>
            <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
              {t('cta.description', {}, locale)}
            </p>
            <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
              <Link
                href="/analyze"
                className="group flex items-center gap-2 rounded-xl bg-primary px-7 py-3 font-semibold text-primary-foreground transition-all hover:opacity-90 hover:shadow-lg hover:shadow-primary/30"
              >
                {t('cta.primary', {}, locale)}
                <ArrowRight size={16} className="transition-transform group-hover:translate-x-0.5" />
              </Link>
              <Link
                href="/pricing"
                className="flex items-center gap-2 rounded-xl border border-border bg-muted/50 px-7 py-3 font-semibold text-foreground/80 transition-all hover:bg-muted hover:text-foreground"
              >
                {t('cta.secondary', {}, locale)}
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
