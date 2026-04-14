'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { Bot, Target, Zap, Sparkles } from 'lucide-react';
import { t } from '@/lib/t';
import { useLocaleStore } from '@/stores/locale-store';

export function AboutClient() {
  const locale = useLocaleStore((s) => s.locale);

  return (
    <main className="min-h-screen py-20 md:py-28">
      <div className="container max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-12"
        >
          <div className="text-center">
            <h1 className="text-3xl font-bold md:text-4xl">{t('about.title', {}, locale)}</h1>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">{t('about.intro', {}, locale)}</p>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {[
              { icon: Bot, key: 'ai', color: 'text-cyan-400' },
              { icon: Target, key: 'mission', color: 'text-emerald-400' },
              { icon: Zap, key: 'speed', color: 'text-amber-400' },
            ].map(({ icon: Icon, key, color }) => (
              <div key={key} className="rounded-2xl border border-border bg-card p-5 space-y-2">
                <div className={`inline-flex rounded-lg bg-muted p-2.5 ${color}`}><Icon size={20} /></div>
                <h3 className="font-semibold">{t(`about.${key}_title`, {}, locale)}</h3>
                <p className="text-sm text-muted-foreground">{t(`about.${key}_desc`, {}, locale)}</p>
              </div>
            ))}
          </div>

          <div className="grid gap-6 lg:grid-cols-[1.3fr_0.9fr]">
            <div className="rounded-2xl border border-border bg-card p-8">
              <h2 className="mb-4 text-xl font-semibold">{t('about.story_title', {}, locale)}</h2>
              <p className="text-muted-foreground leading-8">{t('about.body', {}, locale)}</p>
              <p className="mt-5 text-muted-foreground leading-8">{t('about.vision_desc', {}, locale)}</p>
              <div className="mt-6 flex flex-wrap gap-3 text-sm text-slate-300">
                {['Next.js 16', 'Fastify 5', 'Drizzle ORM', 'MySQL', 'Stripe', 'Framer Motion'].map((item) => (
                  <span key={item} className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5 font-mono">
                    {item}
                  </span>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-8">
              <div className="mb-4 inline-flex rounded-full bg-emerald-500/10 p-3">
                <Sparkles size={20} className="text-emerald-400" />
              </div>
              <h2 className="text-xl font-semibold">{t('about.founder_title', {}, locale)}</h2>
              <p className="mt-4 text-sm leading-7 text-muted-foreground">{t('about.founder_desc', {}, locale)}</p>
              <Link
                href="/iletisim"
                className="mt-6 inline-flex rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground transition hover:opacity-90"
              >
                {t('about.cta', {}, locale)}
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </main>
  );
}
