'use client';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, Sparkles, Zap, Shield } from 'lucide-react';
import { t } from '@/lib/t';
import { useLocaleStore } from '@/stores/locale-store';

const STATS = [
  { value: '2.400+', key: 'hero.stat_analyses' },
  { value: '48K+', key: 'hero.stat_issues' },
  { value: '+32%', key: 'hero.stat_score' },
];

export function HeroSection() {
  const locale = useLocaleStore((s) => s.locale);

  return (
    <section className="hero-mesh relative overflow-hidden py-20 md:py-32">
      <div className="container relative z-10">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-6 flex justify-center"
        >
          <span className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-xs font-medium text-primary">
            <Sparkles size={12} />
            {t('hero.badge', {}, locale)}
          </span>
        </motion.div>

        {/* Heading */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mx-auto max-w-3xl text-center"
        >
          <h1 className="text-4xl font-bold leading-tight tracking-tight md:text-6xl">
            {t('hero.title', {}, locale)}{' '}
            <span className="text-gradient">{t('hero.title_highlight', {}, locale)}</span>
          </h1>
          <p className="mt-6 text-lg text-muted-foreground md:text-xl">
            {t('hero.description', {}, locale)}
          </p>
        </motion.div>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center"
        >
          <Link
            href="/analyze"
            className="group flex items-center gap-2 rounded-xl bg-primary px-6 py-3 font-semibold text-primary-foreground transition-all hover:opacity-90 hover:shadow-lg hover:shadow-primary/25"
          >
            {t('hero.cta_primary', {}, locale)}
            <ArrowRight size={16} className="transition-transform group-hover:translate-x-0.5" />
          </Link>
          <Link
            href="/pricing"
            className="flex items-center gap-2 rounded-xl border border-border bg-muted/50 px-6 py-3 font-semibold text-foreground/80 transition-all hover:bg-muted hover:text-foreground"
          >
            {t('hero.cta_secondary', {}, locale)}
          </Link>
        </motion.div>

        {/* Trust indicators */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.35 }}
          className="mt-6 flex flex-wrap items-center justify-center gap-4 text-xs text-muted-foreground"
        >
          <span className="flex items-center gap-1.5"><Zap size={12} className="text-yellow-400" /> 2 dakikada sonuç</span>
          <span className="flex items-center gap-1.5"><Shield size={12} className="text-green-400" /> Kredi kartı gereksiz</span>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="mt-16 grid grid-cols-3 gap-4 rounded-2xl border border-border bg-card/50 p-6 md:gap-8"
        >
          {STATS.map((stat) => (
            <div key={stat.key} className="text-center">
              <div className="text-2xl font-bold text-gradient md:text-3xl">{stat.value}</div>
              <div className="mt-1 text-xs text-muted-foreground md:text-sm">{t(stat.key, {}, locale)}</div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
